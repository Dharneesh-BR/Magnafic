import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth'
import { collection, doc, getDoc, getDocs, limit, query, serverTimestamp, setDoc, where } from 'firebase/firestore'
import { auth, db } from './firebase'

const AUTH_KEY = 'magnafic-auth-user'

const personalEmailDomains = new Set([
  'gmail.com',
  'googlemail.com',
  'yahoo.com',
  'ymail.com',
  'outlook.com',
  'hotmail.com',
  'live.com',
  'msn.com',
  'icloud.com',
  'me.com',
  'mac.com',
  'aol.com',
  'proton.me',
  'protonmail.com',
  'zoho.com',
  'mail.com',
  'gmx.com',
  'rediffmail.com',
])

function nameFromEmail(email = '') {
  const localPart = email.split('@')[0] || ''

  return localPart
    .split(/[._-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

export function isProfessionalEmail(email = '') {
  const domain = email.trim().toLowerCase().split('@')[1]

  return Boolean(domain) && !personalEmailDomains.has(domain)
}

export function getAuthUser() {
  try {
    return JSON.parse(localStorage.getItem(AUTH_KEY))
  } catch {
    return null
  }
}

export function setAuthUser(user) {
  localStorage.setItem(AUTH_KEY, JSON.stringify(user))
  window.dispatchEvent(new Event('magnafic-auth-change'))
}

function mapFirebaseUser(firebaseUser, profile = {}) {
  if (!firebaseUser) return null
  const profileEmail = profile.email || firebaseUser.email || ''

  return {
    uid: firebaseUser.uid,
    email: profileEmail,
    name: profile.name || nameFromEmail(profileEmail) || firebaseUser.displayName || '',
    company: profile.company || '',
    role: profile.role || 'client',
    status: profile.status || '',
    sanityExpertId: profile.sanityExpertId || '',
  }
}

async function getUserProfile(uid, email = '') {
  const snapshot = await getDoc(doc(db, 'users', uid))
  if (snapshot.exists()) return snapshot.data()

  if (!email) return null

  const profileQuery = query(collection(db, 'users'), where('email', '==', email), limit(1))
  const profileSnapshot = await getDocs(profileQuery)
  const profileDoc = profileSnapshot.docs[0]

  return profileDoc ? profileDoc.data() : null
}

export async function signupClient({ name, company, phone, email, password }) {
  const credentials = await createUserWithEmailAndPassword(auth, email, password)

  await updateProfile(credentials.user, { displayName: name })

  const profile = {
    name,
    company,
    phone,
    email,
    role: 'client',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }

  await setDoc(doc(db, 'users', credentials.user.uid), profile)

  const appUser = mapFirebaseUser(credentials.user, profile)
  setAuthUser(appUser)
  return appUser
}

export async function loginUser({ email, password, fallbackRole = 'client' }) {
  const credentials = await signInWithEmailAndPassword(auth, email, password)
  let profile = null

  try {
    profile = await getUserProfile(credentials.user.uid, credentials.user.email)
  } catch (profileError) {
    console.warn('Firebase profile read failed:', profileError)
  }

  const appUser = mapFirebaseUser(credentials.user, {
    role: fallbackRole,
    ...(profile || {}),
  })

  setAuthUser(appUser)
  return appUser
}

export async function sendAccountPasswordReset(email) {
  await sendPasswordResetEmail(auth, email)
}

export async function hydrateAuthUser() {
  if (!auth.currentUser) return null

  let profile = null

  try {
    profile = await getUserProfile(auth.currentUser.uid, auth.currentUser.email)
  } catch (profileError) {
    console.warn('Firebase profile hydration failed:', profileError)
  }

  const appUser = mapFirebaseUser(auth.currentUser, profile || {})
  setAuthUser(appUser)
  return appUser
}

export function subscribeAuthUser() {
  return onAuthStateChanged(auth, async (firebaseUser) => {
    if (!firebaseUser) {
      localStorage.removeItem(AUTH_KEY)
      window.dispatchEvent(new Event('magnafic-auth-change'))
      return
    }

    try {
      const profile = await getUserProfile(firebaseUser.uid, firebaseUser.email)
      setAuthUser(mapFirebaseUser(firebaseUser, profile || {}))
    } catch {
      setAuthUser(mapFirebaseUser(firebaseUser))
    }
  })
}

export async function clearAuthUser() {
  await signOut(auth)
  localStorage.removeItem(AUTH_KEY)
  window.dispatchEvent(new Event('magnafic-auth-change'))
}
