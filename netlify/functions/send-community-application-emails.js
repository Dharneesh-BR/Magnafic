const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json',
}

const DEFAULT_ADMIN_EMAIL = 'dharneesh@magnafic.com'
const DEFAULT_SENDER_EMAIL = 'no-reply@magnafic.com'
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

function normalizeEmail(value = '') {
  return String(value).trim().toLowerCase()
}

function isEmail(value = '') {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

function getFromEmail() {
  const configuredEmail = normalizeEmail(
    process.env.SENDGRID_FROM_EMAIL ||
    process.env.SENDGRID_VERIFIED_SENDER ||
    process.env.FROM_EMAIL ||
    DEFAULT_SENDER_EMAIL
  )

  if (!isEmail(configuredEmail) || !configuredEmail.endsWith(`@${AUTHENTICATED_DOMAIN}`)) {
    console.warn('Invalid community email sender configured. Using default sender.', {
      configuredDomain: configuredEmail.split('@')[1] || '',
      fallbackFromEmail: DEFAULT_SENDER_EMAIL,
    })
    return DEFAULT_SENDER_EMAIL
  }

  return configuredEmail
}

function getAdminEmail() {
  const configuredEmail = normalizeEmail(
    process.env.COMMUNITY_APPLICATION_TO_EMAIL ||
    process.env.CONTACT_TO_EMAIL ||
    DEFAULT_ADMIN_EMAIL
  )

  return isEmail(configuredEmail) ? configuredEmail : DEFAULT_ADMIN_EMAIL
}

function getSuppressionsApiKey() {
  return process.env.SENDGRID_SUPPRESSIONS_API_KEY || process.env.SENDGRID_API_KEY || ''
}

function normalizePayload(body = {}) {
  return {
    clubName: String(body.clubName || 'Magnafic Community').trim().slice(0, 150),
    name: String(body.name || '').trim().slice(0, 200),
    contactNo: String(body.contactNo || '').trim().slice(0, 50),
    email: normalizeEmail(body.email),
    linkedin: String(body.linkedin || '').trim().slice(0, 500),
    reason: String(body.reason || '').trim().slice(0, 5000),
    sourcePath: String(body.sourcePath || '').trim().slice(0, 500),
  }
}

function validatePayload(payload) {
  if (!payload.clubName || !payload.name || !payload.contactNo || !payload.email || !payload.reason) {
    return 'Please complete all required fields.'
  }

  if (!isEmail(payload.email)) {
    return 'Please enter a valid email address.'
  }

  return ''
}

function buildAdminEmail(payload, fromEmail, adminEmail) {
  const safeReason = escapeHtml(payload.reason).replace(/\n/g, '<br>')
  const safeLinkedin = escapeHtml(payload.linkedin)

  return {
    personalizations: [{
      to: [{ email: adminEmail }],
      subject: `New ${payload.clubName} application - ${payload.name}`,
    }],
    from: { email: fromEmail, name: 'Magnafic Website' },
    reply_to: { email: payload.email, name: payload.name },
    content: [
      {
        type: 'text/plain',
        value: [
          `New ${payload.clubName} application`,
          '',
          `Name: ${payload.name}`,
          `Email: ${payload.email}`,
          `Contact: ${payload.contactNo}`,
          `LinkedIn: ${payload.linkedin || 'Not provided'}`,
          `Source: ${payload.sourcePath || 'Not provided'}`,
          '',
          'Reason for joining:',
          payload.reason,
        ].join('\n'),
      },
      {
        type: 'text/html',
        value: `
          <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111827;max-width:680px">
            <h1 style="font-size:24px;margin:0 0 18px;color:#000047">New ${escapeHtml(payload.clubName)} application</h1>
            <table style="border-collapse:collapse;width:100%">
              <tr><td style="padding:8px 0;font-weight:700">Name</td><td style="padding:8px 0">${escapeHtml(payload.name)}</td></tr>
              <tr><td style="padding:8px 0;font-weight:700">Email</td><td style="padding:8px 0">${escapeHtml(payload.email)}</td></tr>
              <tr><td style="padding:8px 0;font-weight:700">Contact</td><td style="padding:8px 0">${escapeHtml(payload.contactNo)}</td></tr>
              <tr><td style="padding:8px 0;font-weight:700">LinkedIn</td><td style="padding:8px 0">${safeLinkedin || 'Not provided'}</td></tr>
              <tr><td style="padding:8px 0;font-weight:700">Source</td><td style="padding:8px 0">${escapeHtml(payload.sourcePath || 'Not provided')}</td></tr>
            </table>
            <div style="margin-top:18px;padding:16px;border-radius:8px;background:#f3f4f6">
              <strong>Reason for joining</strong>
              <div style="margin-top:8px">${safeReason}</div>
            </div>
          </div>
        `,
      },
    ],
  }
}

function buildAcknowledgementEmail(payload, fromEmail) {
  return {
    personalizations: [{
      to: [{ email: payload.email, name: payload.name }],
      subject: `We received your ${payload.clubName} application`,
    }],
    from: { email: fromEmail, name: 'Magnafic' },
    content: [
      {
        type: 'text/plain',
        value: [
          `Dear ${payload.name},`,
          '',
          `Thank you for applying to the ${payload.clubName}.`,
          'We have received your application successfully. Our team will review your details and contact you shortly.',
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
              <h1 style="font-size:24px;margin:0">Application received</h1>
            </div>
            <div style="padding:24px;border:1px solid #e5e7eb;border-top:0;border-radius:0 0 8px 8px">
              <p>Dear ${escapeHtml(payload.name)},</p>
              <p>Thank you for applying to the <strong>${escapeHtml(payload.clubName)}</strong>.</p>
              <p>We have received your application successfully. Our team will review your details and contact you shortly.</p>
              <p style="margin-top:24px">Regards,<br><strong>Team Magnafic</strong></p>
            </div>
          </div>
        `,
      },
    ],
  }
}

async function sendEmail(label, payload, apiKey) {
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
    console.error(`SendGrid ${label} email failed:`, {
      status: response.status,
      statusText: response.statusText,
      messageId,
      response: responseText,
    })
    throw new Error(`Unable to send ${label} email.`)
  }

  console.info(`SendGrid ${label} email accepted:`, {
    status: response.status,
    messageId,
  })

  return messageId
}

async function getBounceSuppression(email) {
  const response = await fetch(
    `https://api.sendgrid.com/v3/suppression/bounces/${encodeURIComponent(email)}`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${getSuppressionsApiKey()}`,
        'Content-Type': 'application/json',
      },
    }
  )

  if (response.status === 404) {
    return { suppressed: false, status: response.status, records: [] }
  }

  const responseText = await response.text()
  let records = []

  try {
    const parsedBody = responseText ? JSON.parse(responseText) : []
    records = Array.isArray(parsedBody) ? parsedBody : parsedBody ? [parsedBody] : []
  } catch {
    records = []
  }

  if (!response.ok) {
    console.warn('Unable to read SendGrid bounce suppression:', {
      email,
      status: response.status,
      response: responseText,
    })
    return { suppressed: false, status: response.status, records: [], checkFailed: true }
  }

  return {
    suppressed: records.length > 0,
    status: response.status,
    records,
  }
}

async function clearBounceSuppression(email) {
  const response = await fetch(
    `https://api.sendgrid.com/v3/suppression/bounces/${encodeURIComponent(email)}`,
    {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${getSuppressionsApiKey()}`,
        'Content-Type': 'application/json',
      },
    }
  )

  const responseText = await response.text()
  console.info('SendGrid bounce suppression clear result:', {
    email,
    status: response.status,
    cleared: response.ok,
    response: responseText,
  })

  return response.ok
}

async function prepareRecipient(email, { allowClear = false } = {}) {
  const bounce = await getBounceSuppression(email)

  if (!bounce.suppressed) {
    return { ready: true, bounce }
  }

  console.error('SendGrid recipient is bounce-suppressed:', {
    email,
    bounce,
  })

  if (!allowClear) {
    return { ready: false, bounce }
  }

  const cleared = await clearBounceSuppression(email)
  const afterClear = await getBounceSuppression(email)

  return {
    ready: cleared && !afterClear.suppressed,
    bounce,
    cleared,
    afterClear,
  }
}

export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: corsHeaders, body: '' }
  }

  if (event.httpMethod !== 'POST') {
    return jsonResponse(405, { error: 'Method not allowed' })
  }

  const apiKey = process.env.SENDGRID_API_KEY || ''
  if (!apiKey) {
    console.error('Community application email failed: SENDGRID_API_KEY is not configured.')
    return jsonResponse(500, { error: 'Email notifications are not configured.' })
  }

  try {
    const payload = normalizePayload(JSON.parse(event.body || '{}'))
    const validationError = validatePayload(payload)

    if (validationError) {
      return jsonResponse(400, { error: validationError })
    }

    const fromEmail = getFromEmail()
    const adminEmail = getAdminEmail()

    console.info('Sending community application emails:', {
      clubName: payload.clubName,
      fromEmail,
      adminEmail,
      applicantEmail: payload.email,
      sourcePath: payload.sourcePath,
    })

    const [adminRecipient, applicantRecipient] = await Promise.all([
      prepareRecipient(adminEmail, { allowClear: true }),
      prepareRecipient(payload.email),
    ])

    if (!adminRecipient.ready) {
      return jsonResponse(409, {
        error: 'The Magnafic notification email is suppressed in SendGrid. Remove it from SendGrid Bounces and try again.',
        recipient: adminEmail,
        reason: adminRecipient.bounce?.records?.[0]?.reason || 'Bounced Address',
      })
    }

    const emailJobs = [
      sendEmail(
        'admin notification',
        buildAdminEmail(payload, fromEmail, adminEmail),
        apiKey
      ),
    ]

    if (applicantRecipient.ready) {
      emailJobs.push(
        sendEmail(
          'applicant acknowledgement',
          buildAcknowledgementEmail(payload, fromEmail),
          apiKey
        )
      )
    } else {
      emailJobs.push(Promise.reject(new Error(
        'The applicant email is suppressed in SendGrid due to an earlier bounce.'
      )))
    }

    const [adminResult, acknowledgementResult] = await Promise.allSettled(emailJobs)

    const adminMessageId = adminResult.status === 'fulfilled' ? adminResult.value : ''
    const acknowledgementMessageId = acknowledgementResult.status === 'fulfilled'
      ? acknowledgementResult.value
      : ''

    console.info('Community application email results:', {
      admin: adminResult.status === 'fulfilled'
        ? { sent: true, messageId: adminMessageId }
        : { sent: false, error: adminResult.reason?.message || String(adminResult.reason) },
      acknowledgement: acknowledgementResult.status === 'fulfilled'
        ? { sent: true, messageId: acknowledgementMessageId }
        : { sent: false, error: acknowledgementResult.reason?.message || String(acknowledgementResult.reason) },
      adminRecipient,
      applicantRecipient,
    })

    if (adminResult.status === 'rejected' || acknowledgementResult.status === 'rejected') {
      return jsonResponse(502, {
        error: 'One or more application emails could not be delivered by SendGrid.',
        adminNotificationSent: adminResult.status === 'fulfilled',
        acknowledgementSent: acknowledgementResult.status === 'fulfilled',
        adminMessageId,
        acknowledgementMessageId,
        adminError: adminResult.status === 'rejected'
          ? adminResult.reason?.message || String(adminResult.reason)
          : '',
        acknowledgementError: acknowledgementResult.status === 'rejected'
          ? acknowledgementResult.reason?.message || String(acknowledgementResult.reason)
          : '',
      })
    }

    return jsonResponse(200, {
      success: true,
      adminNotificationSent: true,
      acknowledgementSent: true,
      adminMessageId,
      acknowledgementMessageId,
    })
  } catch (error) {
    console.error('Community application email processing failed:', error)
    return jsonResponse(500, {
      error: error?.message || 'Unable to send application emails.',
    })
  }
}
