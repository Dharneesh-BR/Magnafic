const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json',
}

const DEFAULT_ADMIN_EMAIL = 'dharneesh@magnafic.com'
const DEFAULT_SENDER_EMAIL = 'consulting@magnafic.com'
const DHARNEESH_SENDER_EMAIL = 'dharneesh@magnafic.com'
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
  return DEFAULT_SENDER_EMAIL
}

function getAdminEmail() {
  const configuredEmail = normalizeEmail(
    process.env.COMMUNITY_APPLICATION_TO_EMAIL ||
    process.env.CONTACT_TO_EMAIL ||
    DEFAULT_ADMIN_EMAIL
  )

  return isEmail(configuredEmail) ? configuredEmail : DEFAULT_ADMIN_EMAIL
}

function isExpertClubApplication(payload) {
  return String(payload.clubName || '').toLowerCase().includes('expert club')
}

function isFounderCommunityApplication(payload) {
  return String(payload.clubName || '').toLowerCase().includes('founder community')
}

function getFirstName(name = '') {
  return String(name).trim().split(/\s+/)[0] || 'there'
}

function getAcknowledgementFromEmail(payload, fromEmail) {
  return isExpertClubApplication(payload) || isFounderCommunityApplication(payload)
    ? DHARNEESH_SENDER_EMAIL
    : fromEmail
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

  return ''
}

function buildAdminEmail(payload, fromEmail, adminEmail) {
  const safeReason = escapeHtml(payload.reason).replace(/\n/g, '<br>')
  const safeLinkedin = escapeHtml(payload.linkedin)

  const emailPayload = {
    personalizations: [{
      to: [{ email: adminEmail }],
      subject: `New ${payload.clubName} application - ${payload.name}`,
    }],
    from: { email: fromEmail, name: 'Magnafic Website' },
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

  if (isEmail(payload.email)) {
    emailPayload.reply_to = { email: payload.email, name: payload.name }
  }

  return emailPayload
}

function buildAcknowledgementEmail(payload, fromEmail) {
  if (isFounderCommunityApplication(payload)) {
    const firstName = getFirstName(payload.name)

    return {
      personalizations: [{
        to: [{ email: payload.email, name: payload.name }],
        subject: 'Thank you for applying to join the Magnafic Founders Community',
      }],
      from: { email: fromEmail, name: 'Dharneesh BR' },
      content: [
        {
          type: 'text/plain',
          value: [
            `Dear ${firstName},`,
            '',
            'Thank you for applying to join the Magnafic Founders Community.',
            '',
            "I'm excited that you've taken this step.",
            '',
            'Building a Consumer brand business is one of the most rewarding journeys, but it can also be one of the loneliest. Every founder faces moments where the right advice, the right connection, or the right technology can make all the difference.',
            '',
            "That's exactly why we created Magnafic.",
            '',
            "Our vision is simple: to build a community where ambitious founders of CPG industry don't have to figure everything out alone. A place where they can learn directly from world-class experts, collaborate with experienced entrepreneurs, leverage cutting-edge AI technologies, and gain practical insights that help them build stronger, faster-growing businesses.",
            '',
            'Your application has been successfully received and is now under review.',
            '',
            'Every application is carefully evaluated to ensure we bring together founders who are committed to learning, sharing, and creating meaningful impact. We believe the strength of any community lies in the quality of its members.',
            '',
            "If your application is approved, you'll gain access to exclusive masterclasses, expert-led sessions, AI-powered business resources, strategic networking opportunities, and a trusted ecosystem designed to help founders scale with confidence.",
            '',
            'Thank you once again for your interest in becoming part of Magnafic. I look forward to welcoming you into our growing community of visionary founders.',
            '',
            "Here's to building something extraordinary together.",
            '',
            'Warm regards,',
            '',
            'Dharneesh BR',
            'Founder, Magnafic',
            '',
            'Welcome to New Era of Consulting 6.0',
            '',
            'Where Conscious Strategy meets AI Powered Business Excellence',
            '',
            'www.Magnafic.com',
          ].join('\n'),
        },
        {
          type: 'text/html',
          value: `
            <div style="font-family:Arial,sans-serif;line-height:1.7;color:#111827;max-width:640px;margin:auto">
              <p>Dear ${escapeHtml(firstName)},</p>
              <p>Thank you for applying to join the Magnafic Founders Community.</p>
              <p>I'm excited that you've taken this step.</p>
              <p>Building a Consumer brand business is one of the most rewarding journeys, but it can also be one of the loneliest. Every founder faces moments where the right advice, the right connection, or the right technology can make all the difference.</p>
              <p>That's exactly why we created Magnafic.</p>
              <p>Our vision is simple: to build a community where ambitious founders of CPG industry don't have to figure everything out alone. A place where they can learn directly from world-class experts, collaborate with experienced entrepreneurs, leverage cutting-edge AI technologies, and gain practical insights that help them build stronger, faster-growing businesses.</p>
              <p>Your application has been successfully received and is now under review.</p>
              <p>Every application is carefully evaluated to ensure we bring together founders who are committed to learning, sharing, and creating meaningful impact. We believe the strength of any community lies in the quality of its members.</p>
              <p>If your application is approved, you'll gain access to exclusive masterclasses, expert-led sessions, AI-powered business resources, strategic networking opportunities, and a trusted ecosystem designed to help founders scale with confidence.</p>
              <p>Thank you once again for your interest in becoming part of Magnafic. I look forward to welcoming you into our growing community of visionary founders.</p>
              <p>Here's to building something extraordinary together.</p>
              <p style="margin-top:24px">Warm regards,</p>
              <p><strong>Dharneesh BR</strong><br>Founder, Magnafic</p>
              <p>Welcome to New Era of Consulting 6.0</p>
              <p>Where Conscious Strategy meets AI Powered Business Excellence</p>
              <p><a href="http://www.magnafic.com/" style="color:#000047;font-weight:700">www.Magnafic.com</a></p>
            </div>
          `,
        },
      ],
    }
  }

  if (isExpertClubApplication(payload)) {
    const firstName = getFirstName(payload.name)

    return {
      personalizations: [{
        to: [{ email: payload.email, name: payload.name }],
        subject: 'Thank you for applying to join Magnafic',
      }],
      from: { email: fromEmail, name: 'Dharneesh B R' },
      content: [
        {
          type: 'text/plain',
          value: [
            `Dear ${firstName},`,
            '',
            'Thank you for applying to join Magnafic.',
            '',
            'I truly appreciate your interest in becoming part of a community built for the Top 1% of consulting professionals & industry experts',
            '',
            'At Magnafic, we believe that exceptional expertise deserves exceptional opportunities. Every application is carefully reviewed to ensure we maintain the highest standards of quality, credibility, and impact for both our experts and the organizations they serve.',
            '',
            'Our team has successfully received your application, and the review process is now underway. We evaluate every profile based on professional experience, domain expertise, leadership impact, and the value you can create for businesses seeking world-class guidance.',
            '',
            'If your profile aligns with our Top 1% selection criteria, a member of our team will reach out to discuss the next steps and onboarding process.',
            '',
            'Thank you once again for considering Magnafic. We look forward to learning more about your journey and the expertise you bring.',
            '',
            'Warm regards,',
            '',
            'Dharneesh B R',
            '',
            'Founder, Magnafic',
            '',
            'Welcome to New Era of Consulting 6.0',
            '',
            'Where Conscious Strategy meets AI Powered Business Excellence',
            '',
            'www.Magnafic.com',
          ].join('\n'),
        },
        {
          type: 'text/html',
          value: `
            <div style="font-family:Arial,sans-serif;line-height:1.7;color:#111827;max-width:640px;margin:auto">
              <p>Dear ${escapeHtml(firstName)},</p>
              <p>Thank you for applying to join Magnafic.</p>
              <p>I truly appreciate your interest in becoming part of a community built for the Top 1% of consulting professionals &amp; industry experts</p>
              <p>At Magnafic, we believe that exceptional expertise deserves exceptional opportunities. Every application is carefully reviewed to ensure we maintain the highest standards of quality, credibility, and impact for both our experts and the organizations they serve.</p>
              <p>Our team has successfully received your application, and the review process is now underway. We evaluate every profile based on professional experience, domain expertise, leadership impact, and the value you can create for businesses seeking world-class guidance.</p>
              <p>If your profile aligns with our Top 1% selection criteria, a member of our team will reach out to discuss the next steps and onboarding process.</p>
              <p>Thank you once again for considering Magnafic. We look forward to learning more about your journey and the expertise you bring.</p>
              <p style="margin-top:24px">Warm regards,</p>
              <p><strong>Dharneesh B R</strong></p>
              <p>Founder, Magnafic</p>
              <p>Welcome to New Era of Consulting 6.0</p>
              <p>Where Conscious Strategy meets AI Powered Business Excellence</p>
              <p><a href="http://www.magnafic.com/" style="color:#000047;font-weight:700">www.Magnafic.com</a></p>
            </div>
          `,
        },
      ],
    }
  }

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

    const applicantEmailIsDeliverable = isEmail(payload.email)
    const [adminRecipient, applicantRecipient] = await Promise.all([
      prepareRecipient(adminEmail, { allowClear: true }),
      applicantEmailIsDeliverable
        ? prepareRecipient(payload.email)
        : Promise.resolve({ ready: false, skipped: true, reason: 'Unrestricted email value is not deliverable by SendGrid.' }),
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
          buildAcknowledgementEmail(payload, getAcknowledgementFromEmail(payload, fromEmail)),
          apiKey
        )
      )
    } else if (applicantRecipient.skipped) {
      emailJobs.push(Promise.resolve(''))
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
      acknowledgementSent: applicantRecipient.ready && acknowledgementResult.status === 'fulfilled',
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
