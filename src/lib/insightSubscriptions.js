import {doc, serverTimestamp, setDoc} from 'firebase/firestore'
import {db} from './firebase'

function normalizeEmail(email = '') {
  return email.trim().toLowerCase()
}

function isValidEmail(email = '') {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export async function subscribeToInsights(email) {
  const normalizedEmail = normalizeEmail(email)

  if (!isValidEmail(normalizedEmail)) {
    throw new Error('Please enter a valid email address.')
  }

  const subscriberId = encodeURIComponent(normalizedEmail)

  await setDoc(
    doc(db, 'insightSubscribers', subscriberId),
    {
      email: normalizedEmail,
      status: 'active',
      source: 'insights-page',
      subscribedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
    {merge: true},
  )

  return normalizedEmail
}
