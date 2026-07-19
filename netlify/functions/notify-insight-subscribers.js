import { createClient } from '@sanity/client'

const DEFAULT_SENDER_EMAIL = 'dharneesh@magnafic.com'
const AUTHENTICATED_DOMAIN = 'magnafic.com'
const SITE_NAME = 'Magnafic'
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
    insightType: payload.type || (payload._type === 'youtubeVideos' ? 'video' : ''),
    readTime: payload.readTime || payload.duration || '',
    imageUrl: payload.imageUrl || payload.mainImage?.asset?.url || payload.thumbnail?.asset?.url || '',
    imageAlt: payload.imageAlt || payload.mainImage?.alt || payload.thumbnail?.alt || payload.title || '',
    emailBody: payload.emailBody || payload.emailContent?.body || '',
    emailImageUrl: payload.emailImageUrl || payload.emailContent?.image?.asset?.url || '',
    emailImageAlt: payload.emailImageAlt || payload.emailContent?.image?.alt || payload.emailContent?.image?.caption || payload.title || '',
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
      _updatedAt,
      "insightType": coalesce(type, select(_type == "youtubeVideos" => "video", "")),
      "readTime": coalesce(readTime, duration, ""),
      "imageUrl": coalesce(mainImage.asset->url, thumbnail.asset->url, ""),
      "imageAlt": coalesce(mainImage.alt, thumbnail.alt, title),
      "emailBody": coalesce(emailContent.body, ""),
      "emailImageUrl": coalesce(emailContent.image.asset->url, ""),
      "emailImageAlt": coalesce(emailContent.image.alt, emailContent.image.caption, title)
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
    insightType: sanityInsight.insightType || payloadInsight.insightType || '',
    readTime: sanityInsight.readTime || payloadInsight.readTime || '',
    imageUrl: sanityInsight.imageUrl || payloadInsight.imageUrl || '',
    imageAlt: sanityInsight.imageAlt || payloadInsight.imageAlt || sanityInsight.title || payloadInsight.title || '',
    emailBody: sanityInsight.emailBody || payloadInsight.emailBody || '',
    emailImageUrl: sanityInsight.emailImageUrl || payloadInsight.emailImageUrl || '',
    emailImageAlt: sanityInsight.emailImageAlt || payloadInsight.emailImageAlt || sanityInsight.title || payloadInsight.title || '',
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

function escapeHtmlAttribute(value = '') {
  return escapeHtml(value).replace(/`/g, '&#096;')
}

function getSiteUrl() {
  return (process.env.SITE_URL || 'https://magnafic.com').replace(/\/$/, '')
}

function getFromEmail() {
  return DEFAULT_SENDER_EMAIL
}

function titleCase(value = '') {
  return String(value || '')
    .replace(/[-_]+/g, ' ')
    .trim()
    .replace(/\w\S*/g, (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
}

function formatPublishedDate(value = '') {
  const date = value ? new Date(value) : null
  if (!date || Number.isNaN(date.getTime())) return ''

  return new Intl.DateTimeFormat('en', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

function getInsightMetaItems(insight = {}) {
  return [
    titleCase(insight.insightType || (insight.documentType === 'youtubeVideos' ? 'video' : 'insight')),
    formatPublishedDate(insight.publishedAt),
    insight.readTime,
  ].filter(Boolean)
}

function splitTextParagraphs(value = '') {
  return String(value || '')
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
}

function buildPlainTextEmail({ insight, insightUrl, ctaLabel }) {
  const meta = getInsightMetaItems(insight).join(' - ')
  const siteUrl = getSiteUrl()

  return [
    `${SITE_NAME} Insights`,
    '',
    meta,
    insight.title,
    '',
    insight.excerpt,
    '',
    insight.emailBody,
    '',
    insight.emailImageUrl ? `Email image: ${insight.emailImageUrl}` : '',
    '',
    `${ctaLabel}: ${insightUrl}`,
    '',
    SITE_NAME,
    'Top 1% Business Consulting',
    siteUrl,
  ].filter(Boolean).join('\n')
}

function buildHtmlEmail({ insight, insightUrl, ctaLabel }) {
  const safeTitle = escapeHtml(insight.title)
  const safeExcerpt = escapeHtml(insight.excerpt)
  const safeUrl = escapeHtmlAttribute(insightUrl)
  const safeImageUrl = escapeHtmlAttribute(insight.imageUrl)
  const safeImageAlt = escapeHtmlAttribute(insight.imageAlt || insight.title)
  const safeEmailImageUrl = escapeHtmlAttribute(insight.emailImageUrl)
  const safeEmailImageAlt = escapeHtmlAttribute(insight.emailImageAlt || insight.title)
  const siteUrl = getSiteUrl()
  const websiteDisplay = 'www.magnafic.com'
  const websiteUrl = 'https://www.magnafic.com'
  const safeWebsiteUrl = escapeHtmlAttribute(websiteUrl)
  const safeLogoUrl = escapeHtmlAttribute(`${siteUrl}/M_logo.png`)
  const metaItems = getInsightMetaItems(insight)
  const emailBodyParagraphs = splitTextParagraphs(insight.emailBody)

  return `
    <style>
      @media only screen and (max-width: 480px) {
        .insight-email-shell {
          padding: 18px 10px !important;
        }

        .insight-email-container {
          width: 100% !important;
          max-width: 100% !important;
          margin: 0 auto !important;
        }

        .insight-email-header,
        .insight-email-body,
        .insight-email-footer {
          text-align: center !important;
        }

        .insight-email-header {
          padding-bottom: 12px !important;
        }

        .insight-email-eyebrow {
          font-size: 13px !important;
        }

        .insight-email-subtitle {
          font-size: 12px !important;
          line-height: 1.45 !important;
        }

        .insight-email-card {
          border-radius: 14px !important;
        }

        .insight-email-body {
          padding: 20px 16px 22px !important;
        }

        .insight-email-meta {
          margin-bottom: 12px !important;
          font-size: 10px !important;
          line-height: 1.5 !important;
          letter-spacing: 0.06em !important;
        }

        .insight-email-title {
          margin-bottom: 12px !important;
          font-size: 21px !important;
          line-height: 1.25 !important;
        }

        .insight-email-excerpt {
          margin-bottom: 20px !important;
          font-size: 14px !important;
          line-height: 1.55 !important;
        }

        .insight-email-custom-body {
          margin-bottom: 20px !important;
          font-size: 14px !important;
          line-height: 1.55 !important;
        }

        .insight-email-custom-image {
          margin: 0 auto 20px !important;
          border-radius: 12px !important;
        }

        .insight-email-button {
          display: block !important;
          width: auto !important;
          max-width: 220px !important;
          margin: 0 auto !important;
          padding: 13px 18px !important;
          font-size: 14px !important;
          text-align: center !important;
        }

        .insight-email-footer {
          margin-top: 22px !important;
          padding-top: 18px !important;
          font-size: 11px !important;
        }

        .insight-email-footer-logo {
          margin: 0 auto 8px !important;
        }
      }
    </style>
    <div class="insight-email-shell" style="margin:0;background:#f3f7fb;padding:28px 12px;font-family:Arial,Helvetica,sans-serif;color:#102033">
      <div class="insight-email-container" style="max-width:640px;margin:0 auto">
        <div class="insight-email-header" style="padding:0 0 16px;text-align:center">
          <img src="${safeLogoUrl}" alt="${SITE_NAME}" width="34" height="34" draggable="false" style="display:block;width:34px;height:34px;margin:0 auto 10px;border:0;pointer-events:none;user-select:none;-webkit-user-drag:none" />
          <div class="insight-email-eyebrow" style="font-size:14px;font-weight:800;letter-spacing:0.04em;text-transform:uppercase;color:#007f9f">${SITE_NAME} Insights</div>
          <div class="insight-email-subtitle" style="margin-top:4px;font-size:14px;line-height:1.5;color:#5d6b7a">Fresh thinking for consumer brands, growth, AI, and execution.</div>
        </div>

        <div class="insight-email-card" style="overflow:hidden;border:1px solid #dbe7ef;border-radius:18px;background:#ffffff;box-shadow:0 14px 32px rgba(16,32,51,0.08)">
          ${safeImageUrl ? `
            <img src="${safeImageUrl}" alt="${safeImageAlt}" draggable="false" style="display:block;width:100%;max-width:640px;height:auto;border:0;pointer-events:none;user-select:none;-webkit-user-drag:none" />
          ` : ''}

          <div class="insight-email-body" style="padding:28px">
            ${metaItems.length ? `
              <div class="insight-email-meta" style="margin:0 0 14px;font-size:12px;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;color:#007f9f">
                ${metaItems.map(escapeHtml).join(' &bull; ')}
              </div>
            ` : ''}

            <h1 class="insight-email-title" style="margin:0 0 14px;font-size:28px;line-height:1.18;color:#102033">${safeTitle}</h1>
            ${safeExcerpt ? `<p class="insight-email-excerpt" style="margin:0 0 24px;font-size:16px;line-height:1.65;color:#516070">${safeExcerpt}</p>` : ''}
            ${safeEmailImageUrl ? `
              <img class="insight-email-custom-image" src="${safeEmailImageUrl}" alt="${safeEmailImageAlt}" draggable="false" style="display:block;width:100%;max-width:560px;height:auto;margin:0 0 24px;border:0;border-radius:14px;pointer-events:none;user-select:none;-webkit-user-drag:none" />
            ` : ''}
            ${emailBodyParagraphs.length ? `
              <div class="insight-email-custom-body" style="margin:0 0 24px;font-size:15px;line-height:1.7;color:#334155">
                ${emailBodyParagraphs.map((paragraph) => `<p style="margin:0 0 12px">${escapeHtml(paragraph).replace(/\n/g, '<br />')}</p>`).join('')}
              </div>
            ` : ''}

            <a class="insight-email-button" href="${safeUrl}" style="display:inline-block;border-radius:999px;background:#000047;color:#ffffff;font-size:15px;font-weight:800;line-height:1;text-decoration:none;padding:15px 22px">${escapeHtml(ctaLabel)}</a>

            <div class="insight-email-footer" style="margin-top:26px;padding-top:20px;border-top:1px solid #e6eef4;font-size:12px;line-height:1.6;color:#6b7785;text-align:center">
              <img class="insight-email-footer-logo" src="${safeLogoUrl}" alt="${SITE_NAME}" width="34" height="34" draggable="false" style="display:block;width:34px;height:34px;margin:0 auto 10px;border:0;pointer-events:none;user-select:none;-webkit-user-drag:none" />
              <div style="font-size:15px;font-weight:800;line-height:1.3;color:#102033">${SITE_NAME}</div>
              <div style="margin-top:2px;font-size:12px;line-height:1.5;color:#516070">Top 1% Business Consulting</div>
              <a href="${safeWebsiteUrl}" style="display:inline-block;margin-top:6px;color:#007f9f;font-size:12px;font-weight:700;text-decoration:none">${escapeHtml(websiteDisplay)}</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
}

function buildSendgridPayload({ insight, subscriber }) {
  const insightUrl = insight.youtubeUrl || `${getSiteUrl()}/insights/${insight.slug || insight.id}`
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
        value: buildPlainTextEmail({ insight, insightUrl, ctaLabel }),
      },
      {
        type: 'text/html',
        value: buildHtmlEmail({ insight, insightUrl, ctaLabel }),
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
    insightType: insight.insightType || '',
    readTime: insight.readTime || '',
    imageUrl: insight.imageUrl || '',
    emailBody: insight.emailBody || '',
    emailImageUrl: insight.emailImageUrl || '',
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
