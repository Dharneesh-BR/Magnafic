import {doc, serverTimestamp, setDoc} from 'firebase/firestore'
import {db} from './firebase'

function normalizeEmail(email = '') {
  return email.trim().toLowerCase()
}

export async function subscribeToInsights(email) {
  const normalizedEmail = normalizeEmail(email)

  if (!normalizedEmail) {
    throw new Error('Please enter an email address.')
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
