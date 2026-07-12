import { createClient } from '@sanity/client'

const DEFAULT_SENDER_EMAIL = 'dharneesh@magnafic.com'
const AUTHENTICATED_DOMAIN = 'magnafic.com'
const MAX_SEND_ATTEMPTS = 3
const SENDING_LOCK_MINUTES = 15
const SANITY_PROJECT_ID = '8pf5fxwy'
const SANITY_DATASET = 'production'
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, X-Sanity-Webhook-Secret',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json',
}

function getSanityToken() {
  return process.env.SANITY_WRITE_TOKEN ||
    process.env.SANITY_API_WRITE_TOKEN ||
    process.env.SANITY_API_TOKEN ||
    ''
}

function jsonResponse(statusCode, body) {
  return {
    statusCode,
    headers: corsHeaders,
    body: JSON.stringify(body),
  }
}

function getSanityClient() {
  return createClient({
    projectId: process.env.SANITY_PROJECT_ID || SANITY_PROJECT_ID,
    dataset: process.env.SANITY_DATASET || SANITY_DATASET,
    apiVersion: '2024-01-01',
    useCdn: false,
    token: getSanityToken(),
  })
}

function getInsightPayload(body = {}) {
  const payload = body.result || body.document || body.after || body
  const slug = payload.slug?.current || payload.slug || ''

  return {
    id: String(payload._id || '').replace(/^drafts\./, ''),
    isDraft: String(payload._id || '').startsWith('drafts.'),
    documentType: payload._type || '',
    title: payload.title,
    excerpt: payload.excerpt || payload.description || '',
    status: payload.status,
    slug,
    youtubeUrl: payload.youtubeUrl || '',
    publishedAt: payload.publishedAt || payload._updatedAt || new Date().toISOString(),
    updatedAt: payload._updatedAt || payload.updatedAt || payload.publishedAt || '',
  }
}

function normalizeSanityId(value = '') {
  return String(value || '').trim().replace(/^drafts\./, '')
}

function addDocumentId(ids, value) {
  const normalizedId = normalizeSanityId(value)
  if (/^[A-Za-z0-9._-]+$/.test(normalizedId)) ids.add(normalizedId)
}

function collectRawCandidateDocumentIds(body = {}) {
  const ids = []
  const payload = body.result || body.document || body.after || body

  ids.push(payload?._id, body.documentId)

  if (body.ids && typeof body.ids === 'object') {
    Object.values(body.ids).flat().forEach((id) => ids.push(id))
  }

  if (Array.isArray(body.mutations)) {
    for (const mutation of body.mutations) {
      ids.push(mutation?.create?._id)
      ids.push(mutation?.createOrReplace?._id)
      ids.push(mutation?.patch?.id)
      ids.push(mutation?.delete?.id)
    }
  }

  return ids.map((id) => String(id || '').trim()).filter(Boolean)
}

function collectCandidateDocumentIds(body = {}) {
  const ids = new Set()
  collectRawCandidateDocumentIds(body).forEach((id) => addDocumentId(ids, id))

  return [...ids]
}

function isArchivedInsight(insight = {}) {
  return String(insight.status || '').toLowerCase() === 'archived'
}

function canNotifyForInsight(insight = {}) {
  const documentType = String(insight.documentType || '').trim()
  const isSupportedType = !documentType || documentType === 'blog' || documentType === 'youtubeVideos'

  return Boolean(insight.id && insight.title && isSupportedType && !insight.isDraft && !isArchivedInsight(insight))
}

async function resolveInsightPayload(body = {}) {
  const payloadInsight = getInsightPayload(body)

  if (payloadInsight.id && payloadInsight.title && payloadInsight.status) {
    return payloadInsight
  }

  const ids = collectCandidateDocumentIds(body)
  if (!ids.length) return payloadInsight

  const rawIds = collectRawCandidateDocumentIds(body)
  const hasOnlyDraftIds = rawIds.length > 0 && rawIds.every((id) => id.startsWith('drafts.'))
  if (hasOnlyDraftIds) {
    return {
      ...payloadInsight,
      isDraft: true,
    }
  }

  const [sanityInsight] = await getSanityClient().fetch(
    `*[_type in ["blog", "youtubeVideos"] && _id in $ids] {
      _id,
      _type,
      title,
      "excerpt": coalesce(excerpt, description, ""),
      status,
      "slug": slug.current,
      youtubeUrl,
      publishedAt,
      _updatedAt
    }[0...1]`,
    { ids },
  )

  if (!sanityInsight) return payloadInsight

  return {
    id: normalizeSanityId(sanityInsight._id),
    isDraft: false,
    documentType: sanityInsight._type || payloadInsight.documentType || '',
    title: sanityInsight.title || payloadInsight.title,
    excerpt: sanityInsight.excerpt || payloadInsight.excerpt || '',
    status: sanityInsight.status || payloadInsight.status,
    slug: sanityInsight.slug || payloadInsight.slug || '',
    youtubeUrl: sanityInsight.youtubeUrl || payloadInsight.youtubeUrl || '',
    publishedAt: sanityInsight.publishedAt || sanityInsight._updatedAt || payloadInsight.publishedAt,
    updatedAt: sanityInsight._updatedAt || sanityInsight.publishedAt || payloadInsight.updatedAt || '',
  }
}

function getNotificationId(insight = {}) {
  const version = insight.updatedAt || insight.publishedAt || ''
  const key = version ? `${insight.id}-${version}` : insight.id
  return `insightNotification.${key.replace(/[^A-Za-z0-9._-]/g, '-').slice(0, 120)}`
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
  return DEFAULT_SENDER_EMAIL
}

function buildSendgridPayload({ insight, subscriber }) {
  const insightUrl = insight.youtubeUrl || `${getSiteUrl()}/insights/${insight.slug || insight.id}`
  const safeTitle = escapeHtml(insight.title)
  const safeExcerpt = escapeHtml(insight.excerpt)
  const ctaLabel = insight.youtubeUrl ? 'Watch video' : 'Read insight'

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
            <a href="${insightUrl}" style="display:inline-block;background:#2563eb;color:#ffffff;text-decoration:none;padding:12px 18px;border-radius:10px;font-weight:700">${ctaLabel}</a>
          </div>
        `,
      },
    ],
  }
}

async function getActiveInsightSubscribers() {
  return getSanityClient().fetch(
    `*[_type == "insightSubscriber" && status == "active" && defined(email)] {
      email
    }`,
  )
}

function toDate(value) {
  if (!value) return null
  const date = value instanceof Date ? value : new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

function getNowIso() {
  return new Date().toISOString()
}

async function claimNotification({ sanity, notificationId, insight }) {
  const existing = await sanity.getDocument(notificationId)
  const attempts = Number(existing?.attempts || 0)
  const updatedAt = toDate(existing?.updatedAt)
  const lockExpired = !updatedAt ||
    Date.now() - updatedAt.getTime() > SENDING_LOCK_MINUTES * 60 * 1000

  if (existing?.status === 'sent') return { shouldSend: false, reason: 'Already notified' }
  if (existing?.status === 'sending' && !lockExpired) {
    return { shouldSend: false, reason: 'Notification already in progress' }
  }
  if (attempts >= MAX_SEND_ATTEMPTS) {
    return { shouldSend: false, reason: 'Maximum delivery attempts reached' }
  }

  const now = getNowIso()
  await sanity.createOrReplace({
    _id: notificationId,
    _type: 'insightNotification',
    notificationId,
    insightId: insight.id,
    documentType: insight.documentType || '',
    title: insight.title,
    slug: insight.slug,
    youtubeUrl: insight.youtubeUrl || '',
    publishedAt: insight.publishedAt || '',
    status: 'sending',
    attempts: attempts + 1,
    lastError: '',
    createdAt: existing?.createdAt || now,
    updatedAt: now,
  })

  return { shouldSend: true, attempts: attempts + 1 }
}

async function updateNotificationResult({ sanity, notificationId, patch }) {
  await sanity
    .patch(notificationId)
    .set({
      ...patch,
      updatedAt: getNowIso(),
    })
    .commit()
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
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: corsHeaders, body: '' }
  }

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
    !getSanityToken() && 'SANITY_WRITE_TOKEN',
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

  const insight = await resolveInsightPayload(body)

  if (!canNotifyForInsight(insight)) {
    return jsonResponse(200, {
      skipped: true,
      reason: 'Not a notifiable insight payload',
      insightId: insight.id || '',
      status: insight.status || '',
      hasTitle: Boolean(insight.title),
    })
  }

  const sanity = getSanityClient()
  const notificationId = getNotificationId(insight)

  try {
    const claim = await claimNotification({ sanity, notificationId, insight })

    if (!claim.shouldSend) {
      return jsonResponse(200, { skipped: true, reason: claim.reason })
    }

    const subscribers = (await getActiveInsightSubscribers())
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

    await updateNotificationResult({
      sanity,
      notificationId,
      patch: {
        status: failedCount > 0 ? 'sent_with_errors' : 'sent',
        subscriberCount: subscribers.length,
        sentCount,
        failedCount,
        failures: failures.slice(0, 25),
        sentAt: getNowIso(),
      },
    })

    return jsonResponse(200, {
      insightId: insight.id,
      subscriberCount: subscribers.length,
      sentCount,
      failedCount,
      attempt: claim.attempts,
    })
  } catch (error) {
    console.error('Insight subscriber notification failed:', error)

    if (notificationId) {
      await updateNotificationResult({
        sanity,
        notificationId,
        patch: {
          status: 'failed',
          lastError: error?.message || String(error),
        },
      }).catch(() => {})
    }

    return jsonResponse(500, {
      error: 'Unable to notify insight subscribers.',
      detail: error?.message || String(error),
    })
  }
}
