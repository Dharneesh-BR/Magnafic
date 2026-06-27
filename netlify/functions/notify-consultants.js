import {createClient} from '@sanity/client'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json',
}

const DEFAULT_SENDER_EMAIL = 'no-reply@magnafic.com'
const AUTHENTICATED_DOMAIN = 'magnafic.com'
const ALLOWED_EVENT_TYPES = new Set([
  'expert-club-login-created',
  'expert-call-request',
  'client-referral',
  'client-assigned',
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

function getFromEmail() {
  const configuredEmail = normalizeEmail(
    process.env.CONSULTANT_NOTIFICATIONS_FROM_EMAIL ||
      process.env.SENDGRID_FROM_EMAIL ||
      process.env.SENDGRID_VERIFIED_SENDER ||
      process.env.FROM_EMAIL ||
      DEFAULT_SENDER_EMAIL,
  )

  return isEmail(configuredEmail) && configuredEmail.endsWith(`@${AUTHENTICATED_DOMAIN}`)
    ? configuredEmail
    : DEFAULT_SENDER_EMAIL
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

async function getSanityRecipients(consultantIds = []) {
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

function dedupeRecipients(recipients = []) {
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

function getEventContent(eventType, context = {}) {
  const clientName = context.clientName || context.name || 'A client'
  const company = context.company ? ` from ${context.company}` : ''
  const capability = context.capability ? ` for ${context.capability}` : ''
  const scheduledAt = context.scheduledAt ? `\nScheduled time: ${context.scheduledAt}` : ''
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

  if (eventType === 'client-referral') {
    return {
      subject: `Referral submitted: ${clientName}`,
      heading: 'Client referral submitted',
      message:
        `A client referral has been submitted${capability}.\nClient: ${clientName}${company}\nEmail: ${context.clientEmail || 'Not provided'}\n\n${context.description || ''}`,
    }
  }

  if (eventType === 'client-assigned') {
    return {
      subject: `New client assigned: ${clientName}`,
      heading: 'New client assigned',
      message:
        `${clientName}${company} has been assigned to you${capability}.${scheduledAt}\n\nPlease check your consultant dashboard for details.`,
    }
  }

  throw new Error('Unsupported consultant notification event type.')
}

function buildEmail({recipient, eventType, context, fromEmail}) {
  const content = getEventContent(eventType, context)
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

async function sendEmail(payload, apiKey) {
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

  if (!payload.consultantIds.length) {
    return jsonResponse(400, {error: 'At least one consultant id is required.'})
  }

  try {
    const sanityRecipients = await getSanityRecipients(payload.consultantIds)
    const recipients = dedupeRecipients(sanityRecipients)

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
