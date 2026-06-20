import { onAuthStateChanged } from 'firebase/auth'
import { auth } from './firebase'

const endpoint = '/.netlify/functions/ai-consultant-copilot'

async function getCurrentFirebaseUser() {
  if (auth.currentUser) return auth.currentUser

  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe()
      resolve(user)
    })
  })
}

export async function callAiCopilot(action, payload = {}) {
  const firebaseUser = await getCurrentFirebaseUser()
  if (!firebaseUser) throw new Error('Please log in again to use the AI Copilot.')

  const token = await firebaseUser.getIdToken()
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ action, ...payload }),
  })
  const result = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(result.error || 'The AI Copilot request could not be completed.')
  }

  return result
}
