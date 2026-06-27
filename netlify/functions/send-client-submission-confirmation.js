const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json',
}

const DEFAULT_SENDER_EMAIL = 'dharneesh@magnafic.com'
const AUTHENTICATED_DOMAIN = 'magnafic.com'

const confirmationContent = {
  contact: {
    subject: 'We received your message',
    heading: 'Message received',
    message:
      'Thank you for contacting Magnafic. We have received your message successfully, and our team will get back to you shortly.',
  },
  problem: {
    subject: 'We received your business challenge',
    heading: 'Your business challenge has been submitted',
    message:
      'Thank you for sharing your business challenge with Magnafic. Your responses and details have been received successfully. Our team will review them and connect you with the right expertise.',
  },
  client: {
    subject: 'Thank you for creating your Magnafic client account',
    heading: 'Welcome to Magnafic',
    message:
      'Thank you for creating your Magnafic client account. Your account has been created successfully, and you can now access your client dashboard.',
  },
}

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
  return DEFAULT_SENDER_EMAIL
}

function buildEmail({name, email, submissionType}) {
  const content = confirmationContent[submissionType]
  const safeName = escapeHtml(name)

  return {
    personalizations: [
      {
        to: [{email, name}],
        subject: content.subject,
      },
    ],
    from: {email: getFromEmail(), name: 'Magnafic'},
    content: [
      {
        type: 'text/plain',
        value: [
          `Dear ${name},`,
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
              <p>Dear ${safeName},</p>
              <p>${escapeHtml(content.message)}</p>
              <p style="margin-top:24px">Regards,<br><strong>Team Magnafic</strong></p>
            </div>
          </div>
        `,
      },
    ],
  }
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
    name: String(body.name || '').trim().slice(0, 200),
    email: normalizeEmail(body.email),
    submissionType: String(body.submissionType || '').trim(),
  }

  if (!payload.name || !isEmail(payload.email) || !confirmationContent[payload.submissionType]) {
    return jsonResponse(400, {error: 'A valid name, email, and submission type are required.'})
  }

  try {
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(buildEmail(payload)),
    })

    const responseText = await response.text()
    const messageId = response.headers.get('x-message-id') || ''

    if (!response.ok) {
      console.error('Client submission confirmation failed:', {
        status: response.status,
        submissionType: payload.submissionType,
        response: responseText,
      })
      return jsonResponse(502, {error: 'Unable to send the confirmation email.'})
    }

    return jsonResponse(200, {
      success: true,
      confirmationSent: true,
      messageId,
    })
  } catch (error) {
    console.error('Client submission confirmation processing failed:', error)
    return jsonResponse(500, {error: 'Unable to send the confirmation email.'})
  }
}
