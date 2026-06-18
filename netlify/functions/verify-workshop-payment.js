import { createHmac, timingSafeEqual } from 'node:crypto'
import { cert, getApps, initializeApp } from 'firebase-admin/app'
import { FieldValue, getFirestore } from 'firebase-admin/firestore'

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

function getServiceAccount() {
  const rawKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
  if (!rawKey) return null

  const serviceAccount = rawKey.trim().startsWith('{')
    ? JSON.parse(rawKey)
    : JSON.parse(Buffer.from(rawKey, 'base64').toString('utf8'))

  if (serviceAccount.private_key) {
    serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n')
  }

  return serviceAccount
}

function getDb() {
  const serviceAccount = getServiceAccount()
  if (!serviceAccount) return null

  if (!getApps().length) {
    initializeApp({
      credential: cert(serviceAccount),
      projectId: serviceAccount.project_id || process.env.FIREBASE_PROJECT_ID,
    })
  }

  return getFirestore()
}

function signaturesMatch(orderId, paymentId, signature, keySecret) {
  const expected = createHmac('sha256', keySecret)
    .update(`${orderId}|${paymentId}`)
    .digest('hex')

  const expectedBuffer = Buffer.from(expected)
  const signatureBuffer = Buffer.from(signature)

  return expectedBuffer.length === signatureBuffer.length
    && timingSafeEqual(expectedBuffer, signatureBuffer)
}

export async function handler(event) {
  if (event.httpMethod !== 'POST') {
    return jsonResponse(405, { error: 'Method not allowed' })
  }

  const keySecret = process.env.RAZORPAY_KEY_SECRET
  if (!keySecret) {
    console.error('Razorpay verification failed: RAZORPAY_KEY_SECRET is not configured.')
    return jsonResponse(500, { error: 'Payment verification is not configured.' })
  }

  try {
    const body = JSON.parse(event.body || '{}')
    const orderId = cleanValue(body.razorpayOrderId)
    const paymentId = cleanValue(body.razorpayPaymentId)
    const signature = cleanValue(body.razorpaySignature, 500)

    if (!orderId || !paymentId || !signature) {
      return jsonResponse(400, { error: 'Payment verification details are missing.' })
    }

    if (!signaturesMatch(orderId, paymentId, signature, keySecret)) {
      console.error('Razorpay payment signature mismatch:', { orderId, paymentId })
      return jsonResponse(400, { error: 'Payment verification failed.' })
    }

    const registration = {
      name: cleanValue(body.name),
      contactNo: cleanValue(body.contactNo, 30),
      email: cleanValue(body.email).toLowerCase(),
      program: 'Business Growth Masterclass',
      amount: 99,
      currency: 'INR',
      paymentStatus: 'paid',
      razorpayOrderId: orderId,
      razorpayPaymentId: paymentId,
      sourcePath: '/add',
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    }

    let registrationSaved = false
    try {
      const db = getDb()
      if (db) {
        await db.collection('workshopRegistrations').doc(paymentId).set(registration)
        registrationSaved = true
      } else {
        console.warn('Workshop payment verified but Firebase service account is not configured.')
      }
    } catch (firestoreError) {
      console.error('Workshop payment verified but registration storage failed:', firestoreError)
    }

    console.info('Razorpay payment verified:', {
      orderId,
      paymentId,
      registrationSaved,
    })

    return jsonResponse(200, {
      verified: true,
      registrationSaved,
      paymentId,
    })
  } catch (error) {
    console.error('Workshop payment verification failed:', error)
    return jsonResponse(500, { error: 'Unable to verify payment.' })
  }
}
