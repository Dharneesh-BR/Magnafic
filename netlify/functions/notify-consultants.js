import {createClient} from '@sanity/client'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json',
}

const DEFAULT_SENDER_EMAIL = 'consulting@magnafic.com'
const ADMIN_NOTIFICATION_EMAIL = 'dharneesh@magnafic.com'
const AUTHENTICATED_DOMAIN = 'magnafic.com'
const ALLOWED_EVENT_TYPES = new Set([
  'expert-club-login-created',
  'expert-call-request',
  'client-referral',
  'client-assigned',
  'client-assigned-reminder-6h',
  'client-assigned-reminder-12h',
  'client-assigned-reminder-20h',
  'client-assigned-expired-48h',
])

function jsonResponse(statusCode, body) {
  return {
    statusCode,
    headers: corsHeaders,
    body: JSON.stringify(body),
  }
}

function escapeHtml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

function normalizeEmail(value = '') {
  return String(value).trim().toLowerCase()
}

function isEmail(value = '') {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

export function getFromEmail() {
  return DEFAULT_SENDER_EMAIL
}

function getSanityClient() {
  return createClient({
    projectId: process.env.SANITY_MENTOR_PROJECT_ID || '8pf5fxwy',
    dataset: process.env.SANITY_MENTOR_DATASET || 'production',
    apiVersion: '2024-01-01',
    useCdn: false,
    token: process.env.SANITY_READ_TOKEN || process.env.SANITY_API_READ_TOKEN,
  })
}

function normalizePayload(body = {}) {
  return {
    eventType: String(body.eventType || '').trim(),
    consultantIds: [...new Set((Array.isArray(body.consultantIds) ? body.consultantIds : [])
      .map((value) => String(value || '').trim())
      .filter(Boolean))],
    context: body.context && typeof body.context === 'object' ? body.context : {},
  }
}

function shouldRouteToAdminEmail(context = {}) {
  return context.routeToAdminEmail === true || context.notificationSource === 'admin-dashboard'
}

function getAdminRecipient() {
  return {
    id: 'admin-dashboard-notifications',
    name: 'Dharneesh',
    email: ADMIN_NOTIFICATION_EMAIL,
  }
}

export async function getSanityRecipients(consultantIds = []) {
  if (!consultantIds.length) return []

  const client = getSanityClient()
  return client.fetch(
    `*[_type == "mentor" && _id in $ids && coalesce(receiveNotifications, true) == true] {
      _id,
      fullName,
      email,
      contactNo
    }`,
    {ids: consultantIds},
  )
}

export function dedupeRecipients(recipients = []) {
  const seen = new Set()
  return recipients
    .map((recipient) => ({
      id: String(recipient.id || recipient._id || '').trim(),
      name: String(recipient.name || recipient.fullName || recipient.email || '').trim(),
      email: normalizeEmail(recipient.email),
    }))
    .filter((recipient) => {
      if (!isEmail(recipient.email) || seen.has(recipient.email)) return false
      seen.add(recipient.email)
      return true
    })
}

function getFirstName(value = '') {
  return String(value || '').trim().split(/\s+/)[0] || 'Consultant'
}

function formatDateTime(value) {
  if (!value) return ''
  const rawDate = typeof value?.toDate === 'function' ? value.toDate() : new Date(value)
  if (Number.isNaN(rawDate.getTime())) return String(value)

  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Asia/Kolkata',
  }).format(rawDate)
}

function getReferralReminderLabel(eventType) {
  switch (eventType) {
    case 'client-assigned-reminder-6h':
      return 'Reminder 1'
    case 'client-assigned-reminder-12h':
      return 'Reminder 2'
    case 'client-assigned-reminder-20h':
      return 'Last Reminder'
    case 'client-assigned-expired-48h':
      return 'Final Expiry Notification'
    default:
      return ''
  }
}

function getReferralEmailContent(eventType, context = {}) {
  const clientName = context.clientName || context.name || 'Not provided'
  const company = context.company || 'Not provided'
  const clientEmail = context.clientEmail || context.email || 'Not provided'
  const referralDateTime = formatDateTime(
    context.referralDateTime || context.allocatedAt || context.createdAt || context.submittedAt,
  ) || 'Not provided'
  const additionalNotes = context.additionalNotes || context.notes || context.description || context.capability || 'Not provided'
  const reminderLabel = getReferralReminderLabel(eventType)
  const subjectPrefix = reminderLabel ? `${reminderLabel}: ` : ''

  return {
    type: 'client-referral-assignment',
    subject: `${subjectPrefix}New client referral submitted through Magnafic`,
    heading: reminderLabel || 'New client referral submitted',
    clientName,
    company,
    clientEmail,
    referralDateTime,
    additionalNotes,
  }
}

function getEventContent(eventType, context = {}) {
  const clientName = context.clientName || context.name || 'A client'
  const company = context.company ? ` from ${context.company}` : ''
  const preferredAt = context.preferredCallAt ? `\nPreferred time: ${context.preferredCallAt}` : ''

  if (eventType === 'expert-club-login-created') {
    return {
      subject: 'Your Magnafic consultant access is ready',
      heading: 'Welcome to the Magnafic Expert Club',
      message:
        'Your consultant login has been created. You can now access your Magnafic consultant dashboard and review assigned opportunities.',
    }
  }

  if (eventType === 'expert-call-request') {
    return {
      subject: `New 1:1 call request from ${clientName}`,
      heading: 'New 1:1 call request',
      message:
        `${clientName}${company} requested a 1:1 call with you.${preferredAt}\nEmail: ${context.clientEmail || 'Not provided'}\nContact: ${context.contactNo || 'Not provided'}`,
    }
  }

  if (
    eventType === 'client-referral'
    || eventType === 'client-assigned'
    || eventType.startsWith('client-assigned-reminder-')
    || eventType === 'client-assigned-expired-48h'
  ) {
    return getReferralEmailContent(eventType, context)
  }

  throw new Error('Unsupported consultant notification event type.')
}

function buildReferralEmail({recipient, content, fromEmail, fromName = 'Magnafic'}) {
  const firstName = getFirstName(recipient.name)
  const userName = recipient.email || 'Not provided'
  const plainText = [
    `Dear ${firstName},`,
    '',
    'A new client referral has been successfully submitted through the Magnafic platform.',
    '',
    'Client Details',
    '',
    `Client Name: ${content.clientName}`,
    `Company: ${content.company}`,
    `Email: ${content.clientEmail}`,
    '',
    `Referral Date & Time : ${content.referralDateTime}`,
    '',
    `Additional Notes: ${content.additionalNotes}`,
    '',
    'Please review the referral at your earliest convenience and confirm your acceptance within one business day so we can proceed with the engagement.',
    '',
    'Magnafic Login Link - https://magnafic.com/login',
    '',
    `User Name - ${userName}`,
    '',
    'Regards,',
    '',
    'Team Magnafic',
    '',
    'Welcome to New Era of Consulting 6.0',
    '',
    'Where Conscious Strategy meets AI Powered Business Excellence',
    '',
    'www.Magnafic.com',
  ].join('\n')

  const detailRows = [
    ['Client Name', content.clientName],
    ['Company', content.company],
    ['Email', content.clientEmail],
    ['Referral Date & Time', content.referralDateTime],
    ['Additional Notes', content.additionalNotes],
  ]

  return {
    personalizations: [{
      to: [{email: recipient.email, name: recipient.name}],
      subject: content.subject,
    }],
    from: {email: fromEmail, name: fromName},
    content: [
      {
        type: 'text/plain',
        value: plainText,
      },
      {
        type: 'text/html',
        value: `
          <div style="font-family:Arial,sans-serif;line-height:1.7;color:#111827;max-width:680px;margin:auto">
            <h1 style="font-size:22px;margin:0 0 20px;color:#000047">${escapeHtml(content.heading)}</h1>
            <p>Dear ${escapeHtml(firstName)},</p>
            <p>A new client referral has been successfully submitted through the Magnafic platform.</p>
            <p><strong>Client Details</strong></p>
            <table style="border-collapse:collapse;width:100%;margin:12px 0 20px">
              <tbody>
                ${detailRows.map(([label, value]) => `
                  <tr>
                    <td style="border:1px solid #e5e7eb;padding:10px;font-weight:700;width:34%">${escapeHtml(label)}</td>
                    <td style="border:1px solid #e5e7eb;padding:10px">${escapeHtml(value)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            <p>Please review the referral at your earliest convenience and confirm your acceptance within one business day so we can proceed with the engagement.</p>
            <p>Magnafic Login Link - <a href="https://magnafic.com/login">https://magnafic.com/login</a></p>
            <p>User Name - ${escapeHtml(userName)}</p>
            <p style="margin-top:24px">Regards,</p>
            <p><strong>Team Magnafic</strong></p>
            <p>Welcome to New Era of Consulting 6.0</p>
            <p>Where Conscious Strategy meets AI Powered Business Excellence</p>
            <p><a href="https://www.magnafic.com/">www.Magnafic.com</a></p>
          </div>
        `,
      },
    ],
  }
}

export function buildEmail({recipient, eventType, context, fromEmail}) {
  const content = getEventContent(eventType, context)
  if (content.type === 'client-referral-assignment') {
    return buildReferralEmail({recipient, content, fromEmail})
  }

  const safeMessage = escapeHtml(content.message).replace(/\n/g, '<br>')

  return {
    personalizations: [{
      to: [{email: recipient.email, name: recipient.name}],
      subject: content.subject,
    }],
    from: {email: fromEmail, name: 'Magnafic'},
    content: [
      {
        type: 'text/plain',
        value: [
          `Dear ${recipient.name || 'Consultant'},`,
          '',
          content.message,
          '',
          'Regards,',
          'Team Magnafic',
        ].join('\n'),
      },
      {
        type: 'text/html',
        value: `
          <div style="font-family:Arial,sans-serif;line-height:1.7;color:#111827;max-width:640px;margin:auto">
            <div style="background:#000047;color:#ffffff;padding:24px;border-radius:8px 8px 0 0">
              <h1 style="font-size:24px;margin:0">${escapeHtml(content.heading)}</h1>
            </div>
            <div style="padding:24px;border:1px solid #e5e7eb;border-top:0;border-radius:0 0 8px 8px">
              <p>Dear ${escapeHtml(recipient.name || 'Consultant')},</p>
              <p>${safeMessage}</p>
              <p style="margin-top:24px">Regards,<br><strong>Team Magnafic</strong></p>
            </div>
          </div>
        `,
      },
    ],
  }
}

export async function sendEmail(payload, apiKey) {
  const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  const responseText = await response.text()
  const messageId = response.headers.get('x-message-id') || ''

  if (!response.ok) {
    throw new Error(`SendGrid ${response.status}: ${responseText || response.statusText}`)
  }

  return messageId
}

export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') {
    return {statusCode: 204, headers: corsHeaders, body: ''}
  }

  if (event.httpMethod !== 'POST') {
    return jsonResponse(405, {error: 'Method not allowed'})
  }

  const apiKey = process.env.SENDGRID_API_KEY || ''
  if (!apiKey) {
    return jsonResponse(500, {error: 'Consultant notifications are not configured.'})
  }

  let body = {}
  try {
    body = JSON.parse(event.body || '{}')
  } catch {
    return jsonResponse(400, {error: 'Invalid request body.'})
  }

  const payload = normalizePayload(body)
  if (!payload.eventType || !ALLOWED_EVENT_TYPES.has(payload.eventType)) {
    return jsonResponse(400, {error: 'Notification event type is required.'})
  }

  const routeToAdminEmail = shouldRouteToAdminEmail(payload.context)

  if (!routeToAdminEmail && !payload.consultantIds.length) {
    return jsonResponse(400, {error: 'At least one consultant id is required.'})
  }

  try {
    const sanityRecipients = routeToAdminEmail ? [] : await getSanityRecipients(payload.consultantIds)
    const recipients = routeToAdminEmail ? [getAdminRecipient()] : dedupeRecipients(sanityRecipients)

    if (!recipients.length) {
      return jsonResponse(200, {success: true, sentCount: 0, skipped: true, reason: 'No consultant email recipients found.'})
    }

    const fromEmail = getFromEmail()
    const results = []

    for (const recipient of recipients) {
      try {
        const messageId = await sendEmail(
          buildEmail({
            recipient,
            eventType: payload.eventType,
            context: payload.context,
            fromEmail,
          }),
          apiKey,
        )
        results.push({status: 'fulfilled', email: recipient.email, messageId})
      } catch (error) {
        results.push({status: 'rejected', email: recipient.email, error: error?.message || String(error)})
      }
    }

    return jsonResponse(200, {
      success: true,
      recipientCount: recipients.length,
      sentCount: results.filter((result) => result.status === 'fulfilled').length,
      failedCount: results.filter((result) => result.status === 'rejected').length,
      results,
    })
  } catch (error) {
    console.error('Consultant notification failed:', error)
    return jsonResponse(500, {error: error?.message || 'Unable to notify consultants.'})
  }
}
