import {createClient} from '@sanity/client'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json',
}

const DEFAULT_SENDER_EMAIL = 'dharneesh@magnafic.com'

const sanityClient = createClient({
  projectId: '8pf5fxwy',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
})

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

function cleanValue(value = '', maxLength = 5000) {
  return String(value || '').trim().slice(0, maxLength)
}

function isEmail(value = '') {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

function firstName(name = '') {
  return cleanValue(name).split(/\s+/)[0] || 'there'
}

function actionLabel(actionType = '') {
  if (actionType === 'payment') return 'payment'
  if (actionType === 'community') return 'community application'
  return 'form submission'
}

function fillTemplate(template = '', payload = {}) {
  const replacements = {
    'First Name': firstName(payload.name),
    Name: payload.name,
    Email: payload.email,
    'Contact No': payload.contactNo,
    Message: payload.message,
    Program: payload.program,
    Amount: payload.amount ? `Rs ${payload.amount}` : '',
    'Payment ID': payload.paymentId,
    'Page Title': payload.pageTitle,
    Action: actionLabel(payload.actionType),
  }

  return String(template).replace(/\{\{\s*([^}]+?)\s*\}\}/g, (match, token) => {
    const key = String(token).trim()
    return Object.prototype.hasOwnProperty.call(replacements, key) ? replacements[key] || '' : match
  })
}

function htmlFromPlainText(text = '') {
  return escapeHtml(text)
    .split(/\r?\n/)
    .map((line) => line ? `<p>${line}</p>` : '<br>')
    .join('\n')
}

function selectTemplate(page, ctaKey) {
  if (ctaKey === 'primary') return page.primaryConfirmationEmail

  const section = (page.sections || []).find((item) => item._key === ctaKey)
  return section?.cta?.confirmationEmail
}

async function fetchPage({pageId, pageSlug}) {
  return sanityClient.fetch(
    `*[_type == "adPages" && (_id == $pageId || slug.current == $pageSlug)][0]{
      _id,
      title,
      "slug": slug.current,
      primaryConfirmationEmail{
        enabled,
        subject,
        fromName,
        body
      },
      sections[]{
        _key,
        sectionTitle,
        cta{
          confirmationEmail{
            enabled,
            subject,
            fromName,
            body
          }
        }
      }
    }`,
    {pageId, pageSlug},
  )
}

async function sendEmail(emailPayload, apiKey) {
  const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(emailPayload),
  })

  const responseText = await response.text()
  const messageId = response.headers.get('x-message-id') || ''

  if (!response.ok) {
    console.error('SendGrid ad action email failed:', {
      status: response.status,
      statusText: response.statusText,
      response: responseText,
      messageId,
    })
    throw new Error('Unable to send the confirmation email.')
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
    return jsonResponse(500, {error: 'Email notifications are not configured.'})
  }

  let body = {}
  try {
    body = JSON.parse(event.body || '{}')
  } catch {
    return jsonResponse(400, {error: 'Invalid request body.'})
  }

  const payload = {
    pageId: cleanValue(body.pageId, 200),
    pageSlug: cleanValue(body.pageSlug, 120),
    pageTitle: cleanValue(body.pageTitle, 200),
    ctaKey: cleanValue(body.ctaKey || 'primary', 120),
    actionType: cleanValue(body.actionType, 40),
    name: cleanValue(body.name, 200),
    email: normalizeEmail(body.email),
    contactNo: cleanValue(body.contactNo, 50),
    message: cleanValue(body.message, 5000),
    program: cleanValue(body.program, 300),
    amount: cleanValue(body.amount, 30),
    paymentId: cleanValue(body.paymentId, 120),
  }

  if ((!payload.pageId && !payload.pageSlug) || !payload.name || !isEmail(payload.email)) {
    return jsonResponse(400, {error: 'A valid page, name, and email are required.'})
  }

  const page = await fetchPage(payload)
  if (!page) {
    return jsonResponse(404, {error: 'Ad page not found.'})
  }

  payload.pageTitle = payload.pageTitle || page.title || ''
  const template = selectTemplate(page, payload.ctaKey)

  if (!template?.enabled) {
    return jsonResponse(200, {success: true, confirmationSent: false, skipped: true, reason: 'Confirmation email is disabled.'})
  }

  if (!template.subject || !template.body) {
    return jsonResponse(200, {success: true, confirmationSent: false, skipped: true, reason: 'Confirmation email subject or body is empty.'})
  }

  const subject = fillTemplate(template.subject, payload)
  const textBody = fillTemplate(template.body, payload)
  const fromName = cleanValue(template.fromName || 'Magnafic', 80)

  try {
    const messageId = await sendEmail({
      personalizations: [{
        to: [{email: payload.email, name: payload.name}],
        subject,
      }],
      from: {email: DEFAULT_SENDER_EMAIL, name: fromName},
      content: [
        {type: 'text/plain', value: textBody},
        {
          type: 'text/html',
          value: `
            <div style="font-family:Arial,sans-serif;line-height:1.7;color:#111827;max-width:640px;margin:auto">
              ${htmlFromPlainText(textBody)}
            </div>
          `,
        },
      ],
    }, apiKey)

    return jsonResponse(200, {
      success: true,
      confirmationSent: true,
      messageId,
    })
  } catch (error) {
    console.error('Ad action email processing failed:', error)
    return jsonResponse(502, {error: error?.message || 'Unable to send the confirmation email.'})
  }
}
