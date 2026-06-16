import { cert, getApps, initializeApp } from 'firebase-admin/app'
import { FieldValue, getFirestore } from 'firebase-admin/firestore'

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
  const payload = body.result || body.document || body
  const slug = payload.slug?.current || payload.slug || ''

  return {
    id: payload._id,
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
  return process.env.SENDGRID_FROM_EMAIL || process.env.INSIGHTS_FROM_EMAIL
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

  if (!response.ok) {
    throw new Error(await response.text())
  }
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

  if (!process.env.SENDGRID_API_KEY || !getFromEmail()) {
    return jsonResponse(500, { error: 'Email sender is not configured.' })
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

  const db = getDb()
  const notificationRef = db.collection('insightNotifications').doc(insight.id)
  const shouldSend = await db.runTransaction(async (transaction) => {
    const notificationSnapshot = await transaction.get(notificationRef)

    if (notificationSnapshot.exists) return false

    transaction.set(notificationRef, {
      insightId: insight.id,
      title: insight.title,
      slug: insight.slug,
      status: 'sending',
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    })

    return true
  })

  if (!shouldSend) {
    return jsonResponse(200, { skipped: true, reason: 'Already notified' })
  }

  const subscribersSnapshot = await db
    .collection('insightSubscribers')
    .where('status', '==', 'active')
    .get()

  const subscribers = subscribersSnapshot.docs
    .map((documentSnapshot) => documentSnapshot.data())
    .filter((subscriber) => subscriber.email)

  const results = await Promise.allSettled(
    subscribers.map((subscriber) => sendEmail(buildSendgridPayload({ insight, subscriber })))
  )

  const sentCount = results.filter((result) => result.status === 'fulfilled').length
  const failedCount = results.length - sentCount

  await notificationRef.set({
    status: failedCount > 0 ? 'sent_with_errors' : 'sent',
    subscriberCount: subscribers.length,
    sentCount,
    failedCount,
    sentAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  }, { merge: true })

  return jsonResponse(200, {
    insightId: insight.id,
    sentCount,
    failedCount,
  })
}
