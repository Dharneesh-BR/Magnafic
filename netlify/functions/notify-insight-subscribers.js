import { cert, getApps, initializeApp } from 'firebase-admin/app'
import { FieldValue, getFirestore } from 'firebase-admin/firestore'

const DEFAULT_SENDER_EMAIL = 'no-reply@magnafic.com'
const AUTHENTICATED_DOMAIN = 'magnafic.com'
const MAX_SEND_ATTEMPTS = 3
const SENDING_LOCK_MINUTES = 15

function jsonResponse(statusCode, body) {
  return {
    statusCode,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }
}

function getServiceAccount() {
  const rawKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY

  if (!rawKey) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY is not configured.')
  }

  const serviceAccount = rawKey.trim().startsWith('{')
    ? JSON.parse(rawKey)
    : JSON.parse(Buffer.from(rawKey, 'base64').toString('utf8'))

  if (serviceAccount.private_key) {
    serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n')
  }

  return serviceAccount
}

function getDb() {
  if (!getApps().length) {
    const serviceAccount = getServiceAccount()

    initializeApp({
      credential: cert(serviceAccount),
      projectId: serviceAccount.project_id || process.env.FIREBASE_PROJECT_ID,
    })
  }

  return getFirestore()
}

function getInsightPayload(body = {}) {
  const payload = body.result || body.document || body.after || body
  const slug = payload.slug?.current || payload.slug || ''

  return {
    id: String(payload._id || '').replace(/^drafts\./, ''),
    title: payload.title,
    excerpt: payload.excerpt || '',
    status: payload.status,
    slug,
    publishedAt: payload.publishedAt || payload._updatedAt || new Date().toISOString(),
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

function getSiteUrl() {
  return (process.env.SITE_URL || 'https://magnafic.com').replace(/\/$/, '')
}

function getFromEmail() {
  const configuredEmail = String(
    process.env.INSIGHTS_FROM_EMAIL ||
    process.env.SENDGRID_FROM_EMAIL ||
    process.env.SENDGRID_VERIFIED_SENDER ||
    process.env.FROM_EMAIL ||
    DEFAULT_SENDER_EMAIL
  ).trim().toLowerCase()

  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(configuredEmail) &&
    configuredEmail.endsWith(`@${AUTHENTICATED_DOMAIN}`)
    ? configuredEmail
    : DEFAULT_SENDER_EMAIL
}

function buildSendgridPayload({ insight, subscriber }) {
  const insightUrl = `${getSiteUrl()}/insights/${insight.slug || insight.id}`
  const safeTitle = escapeHtml(insight.title)
  const safeExcerpt = escapeHtml(insight.excerpt)

  return {
    personalizations: [
      {
        to: [{ email: subscriber.email }],
        subject: `New Magnafic insight: ${insight.title}`,
      },
    ],
    from: { email: getFromEmail() },
    content: [
      {
        type: 'text/plain',
        value: [
          insight.title,
          '',
          insight.excerpt,
          '',
          `Read it here: ${insightUrl}`,
        ].filter(Boolean).join('\n'),
      },
      {
        type: 'text/html',
        value: `
          <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111827">
            <h1 style="font-size:24px;margin:0 0 12px">${safeTitle}</h1>
            ${safeExcerpt ? `<p style="margin:0 0 20px;color:#4b5563">${safeExcerpt}</p>` : ''}
            <a href="${insightUrl}" style="display:inline-block;background:#2563eb;color:#ffffff;text-decoration:none;padding:12px 18px;border-radius:10px;font-weight:700">Read insight</a>
          </div>
        `,
      },
    ],
  }
}

async function sendEmail(payload) {
  const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.SENDGRID_API_KEY}`,
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
  if (event.httpMethod !== 'POST') {
    return jsonResponse(405, { error: 'Method not allowed' })
  }

  const configuredSecret = process.env.SANITY_WEBHOOK_SECRET
  const incomingSecret = event.headers['x-sanity-webhook-secret'] || event.queryStringParameters?.secret

  if (configuredSecret && incomingSecret !== configuredSecret) {
    return jsonResponse(401, { error: 'Unauthorized' })
  }

  const missingConfiguration = [
    !process.env.SENDGRID_API_KEY && 'SENDGRID_API_KEY',
    !process.env.FIREBASE_SERVICE_ACCOUNT_KEY && 'FIREBASE_SERVICE_ACCOUNT_KEY',
  ].filter(Boolean)

  if (missingConfiguration.length) {
    console.error('Insight subscriber notifications are not configured:', missingConfiguration)
    return jsonResponse(500, {
      error: 'Subscriber notifications are not configured.',
      missing: missingConfiguration,
    })
  }

  let body = {}

  try {
    body = JSON.parse(event.body || '{}')
  } catch {
    return jsonResponse(400, { error: 'Invalid request body.' })
  }

  const insight = getInsightPayload(body)

  if (!insight.id || !insight.title || insight.status !== 'published') {
    return jsonResponse(200, { skipped: true, reason: 'Not a published insight payload' })
  }

  let notificationRef = null

  try {
    const db = getDb()
    notificationRef = db.collection('insightNotifications').doc(insight.id)
    const claim = await db.runTransaction(async (transaction) => {
      const notificationSnapshot = await transaction.get(notificationRef)
      const existing = notificationSnapshot.exists ? notificationSnapshot.data() : {}
      const attempts = Number(existing.attempts || 0)
      const updatedAt = existing.updatedAt?.toDate?.()
      const lockExpired = !updatedAt ||
        Date.now() - updatedAt.getTime() > SENDING_LOCK_MINUTES * 60 * 1000

      if (existing.status === 'sent') return { shouldSend: false, reason: 'Already notified' }
      if (existing.status === 'sending' && !lockExpired) {
        return { shouldSend: false, reason: 'Notification already in progress' }
      }
      if (attempts >= MAX_SEND_ATTEMPTS) {
        return { shouldSend: false, reason: 'Maximum delivery attempts reached' }
      }

      transaction.set(notificationRef, {
        insightId: insight.id,
        title: insight.title,
        slug: insight.slug,
        status: 'sending',
        attempts: attempts + 1,
        lastError: '',
        createdAt: existing.createdAt || FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      }, { merge: true })

      return { shouldSend: true, attempts: attempts + 1 }
    })

    if (!claim.shouldSend) {
      return jsonResponse(200, { skipped: true, reason: claim.reason })
    }

    const subscribersSnapshot = await db
      .collection('insightSubscribers')
      .where('status', '==', 'active')
      .get()

    const subscribers = subscribersSnapshot.docs
      .map((documentSnapshot) => documentSnapshot.data())
      .filter((subscriber) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(subscriber.email || ''))

    const results = []
    for (const subscriber of subscribers) {
      try {
        const messageId = await sendEmail(buildSendgridPayload({ insight, subscriber }))
        results.push({ status: 'fulfilled', email: subscriber.email, messageId })
      } catch (error) {
        results.push({
          status: 'rejected',
          email: subscriber.email,
          error: error?.message || String(error),
        })
      }
    }

    const sentCount = results.filter((result) => result.status === 'fulfilled').length
    const failures = results.filter((result) => result.status === 'rejected')
    const failedCount = failures.length

    await notificationRef.set({
      status: failedCount > 0 ? 'sent_with_errors' : 'sent',
      subscriberCount: subscribers.length,
      sentCount,
      failedCount,
      failures: failures.slice(0, 25),
      sentAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    }, { merge: true })

    return jsonResponse(200, {
      insightId: insight.id,
      subscriberCount: subscribers.length,
      sentCount,
      failedCount,
      attempt: claim.attempts,
    })
  } catch (error) {
    console.error('Insight subscriber notification failed:', error)

    if (notificationRef) {
      await notificationRef.set({
        status: 'failed',
        lastError: error?.message || String(error),
        updatedAt: FieldValue.serverTimestamp(),
      }, { merge: true }).catch(() => {})
    }

    return jsonResponse(500, {
      error: 'Unable to notify insight subscribers.',
      detail: error?.message || String(error),
    })
  }
}
