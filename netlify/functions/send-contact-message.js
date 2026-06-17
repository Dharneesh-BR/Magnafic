const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json',
}

const DEFAULT_CONTACT_EMAIL = 'dharneeshbr@magnafic.com'
const AUTHENTICATED_DOMAIN = 'magnafic.com'

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

function normalizePayload(body = {}) {
  return {
    name: String(body.name || '').trim(),
    email: String(body.email || '').trim(),
    contactNo: String(body.contactNo || '').trim(),
    message: String(body.message || '').trim(),
    sourcePath: String(body.sourcePath || '/contact').trim(),
  }
}

function validatePayload(payload) {
  if (!payload.name || !payload.email || !payload.contactNo || !payload.message) {
    return 'Please complete all required fields.'
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) {
    return 'Please enter a valid email address.'
  }

  if (payload.message.length > 5000) {
    return 'Message is too long.'
  }

  return ''
}

function normalizeEmail(value = '') {
  return String(value).trim().toLowerCase()
}

function isEmail(value = '') {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

function isAuthenticatedDomainEmail(value = '') {
  return normalizeEmail(value).endsWith(`@${AUTHENTICATED_DOMAIN}`)
}

function getFromEmail() {
  const configuredFromEmail = process.env.SENDGRID_FROM_EMAIL ||
    process.env.SENDGRID_VERIFIED_SENDER ||
    process.env.FROM_EMAIL ||
    process.env.CONTACT_TO_EMAIL ||
    DEFAULT_CONTACT_EMAIL

  const fromEmail = normalizeEmail(configuredFromEmail)

  if (!isEmail(fromEmail) || !isAuthenticatedDomainEmail(fromEmail)) {
    console.warn('Invalid or unauthenticated sender email configured. Falling back to default sender.', {
      configuredFromDomain: fromEmail.split('@')[1] || '',
      authenticatedDomain: AUTHENTICATED_DOMAIN,
      fallbackFromEmail: DEFAULT_CONTACT_EMAIL,
    })
    return DEFAULT_CONTACT_EMAIL
  }

  return fromEmail
}

function getToEmail() {
  const toEmail = normalizeEmail(process.env.CONTACT_TO_EMAIL || DEFAULT_CONTACT_EMAIL)
  return isEmail(toEmail) ? toEmail : DEFAULT_CONTACT_EMAIL
}

function getSendgridApiKey() {
  return process.env.SENDGRID_API_KEY || ''
}

function getSendgridSuppressionsApiKey() {
  return process.env.SENDGRID_SUPPRESSIONS_API_KEY || getSendgridApiKey()
}

function buildSendgridPayload(payload) {
  const safeName = escapeHtml(payload.name)
  const safeEmail = escapeHtml(payload.email)
  const safeContactNo = escapeHtml(payload.contactNo)
  const safeMessage = escapeHtml(payload.message).replace(/\n/g, '<br>')
  const safeSourcePath = escapeHtml(payload.sourcePath)
  const toEmail = getToEmail()
  const fromEmail = getFromEmail()

  return {
    personalizations: [
      {
        to: [{ email: toEmail }],
        subject: 'New Contact Form Submission from Website',
      },
    ],
    from: { email: fromEmail },
    reply_to: { email: payload.email, name: payload.name },
    content: [
      {
        type: 'text/plain',
        value: [
          'New Contact Form Submission from Website',
          '',
          `Name: ${payload.name}`,
          `Email: ${payload.email}`,
          `Phone: ${payload.contactNo}`,
          `Source: ${payload.sourcePath}`,
          '',
          'Message:',
          payload.message,
        ].join('\n'),
      },
      {
        type: 'text/html',
        value: `
          <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111827">
            <h1 style="font-size:22px;margin:0 0 18px">New Contact Form Submission</h1>
            <table style="border-collapse:collapse;width:100%;max-width:640px">
              <tr><td style="padding:8px 0;font-weight:700">Name</td><td style="padding:8px 0">${safeName}</td></tr>
              <tr><td style="padding:8px 0;font-weight:700">Email</td><td style="padding:8px 0">${safeEmail}</td></tr>
              <tr><td style="padding:8px 0;font-weight:700">Phone</td><td style="padding:8px 0">${safeContactNo}</td></tr>
              <tr><td style="padding:8px 0;font-weight:700">Source</td><td style="padding:8px 0">${safeSourcePath}</td></tr>
            </table>
            <div style="margin-top:18px;padding:16px;border-radius:12px;background:#f3f4f6">
              ${safeMessage}
            </div>
          </div>
        `,
      },
    ],
  }
}

function getSendgridHeaders(response) {
  return {
    messageId: response.headers.get('x-message-id') || '',
    requestId: response.headers.get('x-request-id') || '',
    rateLimitRemaining: response.headers.get('x-ratelimit-remaining') || '',
  }
}

async function getSendgridBounceDetails(email) {
  const response = await fetch(`https://api.sendgrid.com/v3/suppression/bounces/${encodeURIComponent(email)}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${getSendgridSuppressionsApiKey()}`,
      'Content-Type': 'application/json',
    },
  })

  const bodyText = await response.text()
  let parsedBody = null

  try {
    parsedBody = bodyText ? JSON.parse(bodyText) : null
  } catch {
    parsedBody = null
  }

  if (response.status === 404) {
    return { found: false, status: response.status, body: bodyText, records: [] }
  }

  if (!response.ok) {
    return { found: false, status: response.status, error: bodyText, records: [] }
  }

  const records = Array.isArray(parsedBody)
    ? parsedBody
    : parsedBody && typeof parsedBody === 'object'
      ? [parsedBody]
      : []

  return {
    found: records.length > 0,
    status: response.status,
    body: bodyText,
    records,
  }
}

function shouldClearBounceSuppression(email) {
  if (process.env.SENDGRID_AUTO_CLEAR_CONTACT_BOUNCE === 'false') return false
  return normalizeEmail(email) === DEFAULT_CONTACT_EMAIL || isAuthenticatedDomainEmail(email)
}

async function clearSendgridBounceSuppression(email) {
  const response = await fetch(`https://api.sendgrid.com/v3/suppression/bounces/${encodeURIComponent(email)}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${getSendgridSuppressionsApiKey()}`,
      'Content-Type': 'application/json',
    },
  })

  const bodyText = await response.text()

  return {
    cleared: response.ok,
    status: response.status,
    statusText: response.statusText,
    body: bodyText,
  }
}

export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: corsHeaders,
      body: '',
    }
  }

  if (event.httpMethod !== 'POST') {
    return jsonResponse(405, { error: 'Method not allowed' })
  }

  const fromEmail = getFromEmail()
  const toEmail = getToEmail()

  if (!getSendgridApiKey() || !fromEmail) {
    console.error('Missing contact email environment:', {
      hasSendgridApiKey: Boolean(getSendgridApiKey()),
      hasFromEmail: Boolean(fromEmail),
      fromEmail,
      toEmail,
    })
    return jsonResponse(500, { error: 'Email sender is not configured.' })
  }

  let body = {}

  try {
    body = JSON.parse(event.body || '{}')
  } catch {
    return jsonResponse(400, { error: 'Invalid request body.' })
  }

  const payload = normalizePayload(body)
  const validationError = validatePayload(payload)

  if (validationError) {
    return jsonResponse(400, { error: validationError })
  }

  console.info('Sending contact form email with SendGrid:', {
    fromEmail,
    toEmail,
    replyToEmail: payload.email,
    authenticatedDomain: AUTHENTICATED_DOMAIN,
    sourcePath: payload.sourcePath,
  })

  let preflightBounceDetails = null
  let bounceClearResult = null
  let postClearBounceDetails = null

  try {
    preflightBounceDetails = await getSendgridBounceDetails(toEmail)

    if (preflightBounceDetails?.found) {
      console.error('SendGrid recipient is on the bounce suppression list before send:', {
        toEmail,
        preflightBounceDetails,
      })

      if (shouldClearBounceSuppression(toEmail)) {
        bounceClearResult = await clearSendgridBounceSuppression(toEmail)
        console.info('Attempted to clear SendGrid bounce suppression before send:', {
          toEmail,
          bounceClearResult,
        })

        postClearBounceDetails = await getSendgridBounceDetails(toEmail)
        if (postClearBounceDetails?.found) {
          console.error('SendGrid recipient remains suppressed after clear attempt. Email will not be sent.', {
            toEmail,
            preflightBounceDetails,
            bounceClearResult,
            postClearBounceDetails,
          })

          return jsonResponse(409, {
            error: 'Recipient email is suppressed in SendGrid. Remove the bounced address from SendGrid suppressions and try again.',
            reason: 'Bounced Address',
            toEmail,
          })
        }
      } else {
        return jsonResponse(409, {
          error: 'Recipient email is suppressed in SendGrid.',
          reason: 'Bounced Address',
          toEmail,
        })
      }
    }
  } catch (bounceError) {
    console.warn('Unable to check or clear SendGrid bounce suppression before send:', {
      toEmail,
      error: bounceError?.message || String(bounceError),
    })
  }

  const sendgridPayload = buildSendgridPayload(payload)
  const sendgridResponse = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${getSendgridApiKey()}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(sendgridPayload),
  })

  const responseHeaders = getSendgridHeaders(sendgridResponse)

  if (!sendgridResponse.ok) {
    const errorText = await sendgridResponse.text()
    console.error('SendGrid contact email failed:', {
      status: sendgridResponse.status,
      statusText: sendgridResponse.statusText,
      headers: responseHeaders,
      body: errorText,
      fromEmail,
      toEmail,
      replyToEmail: payload.email,
    })
    return jsonResponse(500, { error: 'Unable to send your message right now.' })
  }

  let bounceDetails = null

  try {
    bounceDetails = await getSendgridBounceDetails(toEmail)
    if (bounceDetails?.found) {
      console.error('SendGrid recipient is currently on the bounce suppression list:', {
        toEmail,
        bounceDetails,
      })
    }
  } catch (bounceError) {
    console.warn('Unable to retrieve SendGrid bounce details:', {
      toEmail,
      error: bounceError?.message || String(bounceError),
    })
  }

  console.info('SendGrid contact email accepted:', {
    status: sendgridResponse.status,
    statusText: sendgridResponse.statusText,
    headers: responseHeaders,
    messageId: responseHeaders.messageId,
    fromEmail,
    toEmail,
    replyToEmail: payload.email,
    preflightBounceCheck: preflightBounceDetails,
    bounceClearResult,
    postClearBounceCheck: postClearBounceDetails,
    postSendBounceCheck: bounceDetails,
  })

  return jsonResponse(200, {
    success: true,
    messageId: responseHeaders.messageId,
    bounceSuppressionCleared: Boolean(bounceClearResult?.cleared),
    bounceSuppressionFound: Boolean(bounceDetails?.found),
  })
}
