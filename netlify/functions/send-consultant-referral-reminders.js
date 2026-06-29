import { cert, getApps, initializeApp } from 'firebase-admin/app'
import { FieldValue, getFirestore } from 'firebase-admin/firestore'
import {
  buildEmail,
  dedupeRecipients,
  getFromEmail,
  getSanityRecipients,
  sendEmail,
} from './notify-consultants.js'

export const config = {
  schedule: '0 * * * *',
}

const REMINDERS = [
  {eventType: 'client-assigned-reminder-6h', hours: 6},
  {eventType: 'client-assigned-reminder-12h', hours: 12},
  {eventType: 'client-assigned-reminder-20h', hours: 20},
  {eventType: 'client-assigned-expired-48h', hours: 48},
]

function jsonResponse(statusCode, body) {
  return {
    statusCode,
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(body),
  }
}

function getServiceAccount() {
  const rawKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
  if (!rawKey) return null

  const serviceAccount = rawKey.trim().startsWith('{')
    ? JSON.parse(rawKey)
    : JSON.parse(Buffer.from(rawKey, 'base64').toString('utf8'))

  if (serviceAccount.private_key) {
    serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n')
  }

  return serviceAccount
}

function getDb() {
  const serviceAccount = getServiceAccount()
  if (!serviceAccount) return null

  if (!getApps().length) {
    initializeApp({
      credential: cert(serviceAccount),
      projectId: serviceAccount.project_id || process.env.FIREBASE_PROJECT_ID,
    })
  }

  return getFirestore()
}

function toDate(value) {
  if (!value) return null
  if (typeof value.toDate === 'function') return value.toDate()

  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

function isAcceptedOrClosed(brief = {}) {
  if (brief.acceptedAt || brief.acceptedAtDate) return true

  return ['accepted', 'scheduled', 'active', 'closed', 'completed'].includes(String(brief.status || '').toLowerCase())
}

function getConsultantKey(consultant = {}) {
  return String(consultant.sanityExpertId || consultant.id || consultant.email || '').trim()
}

function hasReminderBeenSent(events = [], consultantKey, consultantEmail, eventType) {
  return events.some((event) => (
    event?.eventType === eventType
    && (
      event?.consultantId === consultantKey
      || (consultantEmail && event?.consultantEmail === consultantEmail)
    )
  ))
}

function getNextDueReminder({allocatedAt, sentEvents, consultantKey, consultantEmail, now}) {
  if (!allocatedAt) return null

  const elapsedHours = (now.getTime() - allocatedAt.getTime()) / (1000 * 60 * 60)
  return REMINDERS.find((reminder) => (
    elapsedHours >= reminder.hours
    && !hasReminderBeenSent(sentEvents, consultantKey, consultantEmail, reminder.eventType)
  )) || null
}

function buildContext(brief = {}, consultant = {}) {
  return {
    clientName: brief.clientName || brief.name || brief.company || 'Not provided',
    company: brief.company || 'Not provided',
    clientEmail: brief.clientEmail || brief.businessEmail || brief.email || 'Not provided',
    additionalNotes: brief.additionalNotes || brief.notes || brief.description || brief.problem || brief.capability || 'Not provided',
    referralDateTime: consultant.allocatedAt || brief.allocatedAt || brief.createdAt || brief.submittedAt || '',
  }
}

function getDirectRecipient(consultant = {}) {
  const email = String(consultant.email || '').trim().toLowerCase()
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return null

  return {
    id: getConsultantKey(consultant),
    name: consultant.name || consultant.fullName || email,
    email,
  }
}

async function getRecipientMap(dueItems = []) {
  const sanityIds = [...new Set(dueItems.map((item) => item.consultant.sanityExpertId).filter(Boolean))]
  const sanityRecipients = dedupeRecipients(await getSanityRecipients(sanityIds))
  const directRecipients = dedupeRecipients(dueItems.map((item) => getDirectRecipient(item.consultant)).filter(Boolean))
  const recipients = new Map()

  for (const recipient of [...directRecipients, ...sanityRecipients]) {
    if (recipient.id) recipients.set(recipient.id, recipient)
    recipients.set(recipient.email, recipient)
  }

  return recipients
}

function getRecipientForConsultant(recipientMap, consultant = {}) {
  return (
    recipientMap.get(consultant.sanityExpertId)
    || recipientMap.get(consultant.id)
    || recipientMap.get(String(consultant.email || '').trim().toLowerCase())
    || null
  )
}

export async function handler() {
  const apiKey = process.env.SENDGRID_API_KEY || ''
  if (!apiKey) {
    return jsonResponse(500, {error: 'SENDGRID_API_KEY is not configured.'})
  }

  const db = getDb()
  if (!db) {
    return jsonResponse(500, {error: 'FIREBASE_SERVICE_ACCOUNT_KEY is not configured.'})
  }

  try {
    const snapshot = await db.collection('clientBriefs')
      .where('referralStatus', '==', 'allocated')
      .limit(100)
      .get()
    const now = new Date()
    const dueItems = []

    for (const briefDoc of snapshot.docs) {
      const brief = briefDoc.data()
      if (isAcceptedOrClosed(brief)) continue

      const consultants = Array.isArray(brief.allocatedConsultants) ? brief.allocatedConsultants.filter(Boolean) : []
      const sentEvents = Array.isArray(brief.consultantReminderEvents) ? brief.consultantReminderEvents : []

      for (const consultant of consultants) {
        const consultantKey = getConsultantKey(consultant)
        const consultantEmail = String(consultant.email || '').trim().toLowerCase()
        const allocatedAt = toDate(consultant.allocatedAt || brief.allocatedAt)
        const reminder = getNextDueReminder({allocatedAt, sentEvents, consultantKey, consultantEmail, now})

        if (!consultantKey || !reminder) continue

        dueItems.push({briefDoc, brief, consultant, consultantKey, consultantEmail, reminder})
      }
    }

    if (!dueItems.length) {
      return jsonResponse(200, {success: true, sentCount: 0, skipped: true})
    }

    const recipientMap = await getRecipientMap(dueItems)
    const fromEmail = getFromEmail()
    const sent = []
    const failed = []

    for (const item of dueItems) {
      const recipient = getRecipientForConsultant(recipientMap, item.consultant)
      if (!recipient) {
        failed.push({briefId: item.briefDoc.id, consultantId: item.consultantKey, error: 'No consultant email found.'})
        continue
      }

      try {
        const messageId = await sendEmail(
          buildEmail({
            recipient,
            eventType: item.reminder.eventType,
            context: buildContext(item.brief, item.consultant),
            fromEmail,
          }),
          apiKey,
        )

        await item.briefDoc.ref.update({
          consultantReminderEvents: FieldValue.arrayUnion({
            eventType: item.reminder.eventType,
            consultantId: item.consultantKey,
            consultantEmail: recipient.email,
            sentAt: now.toISOString(),
            messageId,
          }),
          updatedAt: FieldValue.serverTimestamp(),
        })

        sent.push({briefId: item.briefDoc.id, consultantEmail: recipient.email, eventType: item.reminder.eventType, messageId})
      } catch (error) {
        failed.push({
          briefId: item.briefDoc.id,
          consultantEmail: recipient.email,
          eventType: item.reminder.eventType,
          error: error?.message || String(error),
        })
      }
    }

    return jsonResponse(200, {
      success: true,
      sentCount: sent.length,
      failedCount: failed.length,
      sent,
      failed,
    })
  } catch (error) {
    console.error('Consultant referral reminders failed:', error)
    return jsonResponse(500, {error: error?.message || 'Unable to send consultant referral reminders.'})
  }
}
