function jsonResponse(statusCode, body) {
  return {
    statusCode,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }
}

function cleanValue(value, maxLength = 200) {
  return String(value || '').trim().slice(0, maxLength)
}

function cleanAmount(value) {
  const amount = Number(value)
  if (!Number.isFinite(amount) || amount <= 0) return 99
  return Math.round(amount)
}

export async function handler(event) {
  if (event.httpMethod !== 'POST') {
    return jsonResponse(405, { error: 'Method not allowed' })
  }

  const keyId = process.env.RAZORPAY_KEY_ID
  const keySecret = process.env.RAZORPAY_KEY_SECRET

  if (!keyId || !keySecret) {
    console.error('Razorpay order creation failed: credentials are not configured.')
    return jsonResponse(500, { error: 'Payment gateway is not configured.' })
  }

  try {
    const body = JSON.parse(event.body || '{}')
    const name = cleanValue(body.name)
    const contactNo = cleanValue(body.contactNo, 30)
    const email = cleanValue(body.email).toLowerCase()
    const program = cleanValue(body.program || 'Business Growth Masterclass')
    const sourcePath = cleanValue(body.sourcePath || '/add', 300)
    const amount = cleanAmount(body.amount)

    if (!name || !contactNo || !email) {
      return jsonResponse(400, { error: 'Name, contact number, and email are required.' })
    }

    const receipt = `magna-${Date.now()}`.slice(0, 40)
    const response = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString('base64')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: amount * 100,
        currency: 'INR',
        receipt,
        notes: {
          name,
          contactNo,
          email,
          program,
          source: sourcePath,
        },
      }),
    })

    const responseBody = await response.json().catch(() => ({}))

    if (!response.ok) {
      console.error('Razorpay order API error:', response.status, responseBody)
      return jsonResponse(502, {
        error: responseBody?.error?.description || 'Unable to start payment.',
      })
    }

    console.info('Razorpay order created:', {
      orderId: responseBody.id,
      receipt,
      amount: responseBody.amount,
    })

    return jsonResponse(200, {
      keyId,
      order: {
        id: responseBody.id,
        amount: responseBody.amount,
        currency: responseBody.currency,
      },
    })
  } catch (error) {
    console.error('Workshop order creation failed:', error)
    return jsonResponse(500, { error: 'Unable to start payment.' })
  }
}
