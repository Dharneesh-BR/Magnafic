const admin = require('firebase-admin')
const functions = require('firebase-functions')
const sendgrid = require('@sendgrid/mail')

admin.initializeApp()

const db = admin.firestore()

function getConfigValue(path, fallback = '') {
  return path.split('.').reduce((current, key) => current?.[key], functions.config()) || fallback
}

function getWebhookSecret() {
  return process.env.SANITY_WEBHOOK_SECRET || getConfigValue('sanity.webhook_secret')
}

function getSendgridApiKey() {
  return process.env.SENDGRID_API_KEY || getConfigValue('sendgrid.key')
}

function getFromEmail() {
  return process.env.INSIGHTS_FROM_EMAIL || getConfigValue('insights.from_email')
}

function getSiteUrl() {
  return (process.env.SITE_URL || getConfigValue('site.url', 'https://magnafic.com')).replace(/\/$/, '')
}

function getHeaderValue(req, headerName) {
  const value = req.get(headerName)
  return Array.isArray(value) ? value[0] : value
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

function buildEmailMessage({ insight, subscriber }) {
  const siteUrl = getSiteUrl()
  const insightUrl = `${siteUrl}/insights/${insight.slug || insight.id}`

  return {
    to: subscriber.email,
    from: getFromEmail(),
    subject: `New Magnafic insight: ${insight.title}`,
    text: [
      insight.title,
      '',
      insight.excerpt,
      '',
      `Read it here: ${insightUrl}`,
    ].filter(Boolean).join('\n'),
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111827">
        <h1 style="font-size:24px;margin:0 0 12px">${insight.title}</h1>
        ${insight.excerpt ? `<p style="margin:0 0 20px;color:#4b5563">${insight.excerpt}</p>` : ''}
        <a href="${insightUrl}" style="display:inline-block;background:#2563eb;color:#ffffff;text-decoration:none;padding:12px 18px;border-radius:10px;font-weight:700">Read insight</a>
      </div>
    `,
  }
}

exports.notifyInsightSubscribers = functions.https.onRequest(async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).send('Method not allowed')
    return
  }

  const configuredSecret = getWebhookSecret()
  const incomingSecret = getHeaderValue(req, 'x-sanity-webhook-secret') || req.query.secret

  if (configuredSecret && incomingSecret !== configuredSecret) {
    res.status(401).send('Unauthorized')
    return
  }

  const sendgridApiKey = getSendgridApiKey()
  const fromEmail = getFromEmail()

  if (!sendgridApiKey || !fromEmail) {
    res.status(500).send('Email sender is not configured')
    return
  }

  const insight = getInsightPayload(req.body)

  if (!insight.id || !insight.title || insight.status !== 'published') {
    res.status(200).json({ skipped: true, reason: 'Not a published insight payload' })
    return
  }

  const notificationRef = db.collection('insightNotifications').doc(insight.id)
  const shouldSend = await db.runTransaction(async (transaction) => {
    const notificationSnapshot = await transaction.get(notificationRef)

    if (notificationSnapshot.exists) return false

    transaction.set(notificationRef, {
      insightId: insight.id,
      title: insight.title,
      slug: insight.slug,
      status: 'sending',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    })

    return true
  })

  if (!shouldSend) {
    res.status(200).json({ skipped: true, reason: 'Already notified' })
    return
  }

  sendgrid.setApiKey(sendgridApiKey)

  const subscribersSnapshot = await db
    .collection('insightSubscribers')
    .where('status', '==', 'active')
    .get()

  const subscribers = subscribersSnapshot.docs
    .map((documentSnapshot) => documentSnapshot.data())
    .filter((subscriber) => subscriber.email)

  const results = await Promise.allSettled(
    subscribers.map((subscriber) => sendgrid.send(buildEmailMessage({ insight, subscriber })))
  )

  const sentCount = results.filter((result) => result.status === 'fulfilled').length
  const failedCount = results.length - sentCount

  await notificationRef.set({
    status: failedCount > 0 ? 'sent_with_errors' : 'sent',
    subscriberCount: subscribers.length,
    sentCount,
    failedCount,
    sentAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  }, { merge: true })

  res.status(200).json({
    insightId: insight.id,
    sentCount,
    failedCount,
  })
})
