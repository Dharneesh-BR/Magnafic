const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json',
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

function buildSendgridPayload(payload) {
  const safeName = escapeHtml(payload.name)
  const safeEmail = escapeHtml(payload.email)
  const safeContactNo = escapeHtml(payload.contactNo)
  const safeMessage = escapeHtml(payload.message).replace(/\n/g, '<br>')
  const safeSourcePath = escapeHtml(payload.sourcePath)
  const toEmail = process.env.CONTACT_TO_EMAIL || 'dharneeshbr@magnafic.com'
  const fromEmail = process.env.SENDGRID_FROM_EMAIL

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

  if (!process.env.SENDGRID_API_KEY || !process.env.SENDGRID_FROM_EMAIL) {
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

  const sendgridResponse = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.SENDGRID_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(buildSendgridPayload(payload)),
  })

  if (!sendgridResponse.ok) {
    const errorText = await sendgridResponse.text()
    console.error('SendGrid contact email failed:', errorText)
    return jsonResponse(500, { error: 'Unable to send your message right now.' })
  }

  return jsonResponse(200, { success: true })
}
