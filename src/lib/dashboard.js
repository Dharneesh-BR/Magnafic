import {
  addDoc,
  collection,
  onSnapshot,
  query,
  serverTimestamp,
  where,
} from 'firebase/firestore'
import { auth, db } from './firebase'
import { getAuthUser } from './auth'

function requireCurrentUser() {
  const localUser = getAuthUser()
  const firebaseUser = auth.currentUser
  const uid = firebaseUser?.uid || localUser?.uid

  if (!uid) {
    throw new Error('Please log in to continue.')
  }

  return {
    uid,
    email: firebaseUser?.email || localUser?.email || '',
    name: firebaseUser?.displayName || localUser?.name || '',
    company: localUser?.company || '',
  }
}

function normalizeBrief(documentSnapshot) {
  const data = documentSnapshot.data()

  return {
    id: documentSnapshot.id,
    ...data,
    createdAtDate: data.createdAt?.toDate?.() || null,
    updatedAtDate: data.updatedAt?.toDate?.() || null,
  }
}

function sortByCreatedAtDesc(items) {
  return [...items].sort((a, b) => {
    const aTime = a.createdAtDate?.getTime?.() || 0
    const bTime = b.createdAtDate?.getTime?.() || 0
    return bTime - aTime
  })
}

export function subscribeClientBriefs(onData, onError) {
  const user = requireCurrentUser()
  const briefsQuery = query(collection(db, 'clientBriefs'), where('clientId', '==', user.uid))

  return onSnapshot(
    briefsQuery,
    (snapshot) => {
      onData(sortByCreatedAtDesc(snapshot.docs.map(normalizeBrief)))
    },
    (error) => {
      onError?.(error)
    }
  )
}

export function subscribeConsultantOpportunities(onData, onError) {
  const user = requireCurrentUser()
  const opportunitiesQuery = query(
    collection(db, 'clientBriefs'),
    where('assignedConsultantId', '==', user.uid)
  )

  return onSnapshot(
    opportunitiesQuery,
    (snapshot) => {
      onData(sortByCreatedAtDesc(snapshot.docs.map(normalizeBrief)))
    },
    (error) => {
      onError?.(error)
    }
  )
}

export async function createClientBrief({ title, capability, urgency, description }) {
  const user = requireCurrentUser()

  if (!title?.trim()) {
    throw new Error('Please enter a brief title.')
  }

  if (!description?.trim()) {
    throw new Error('Please describe what you need help with.')
  }

  const documentRef = await addDoc(collection(db, 'clientBriefs'), {
    title: title.trim(),
    capability: capability?.trim() || 'General consulting',
    urgency: urgency || 'medium',
    description: description.trim(),
    status: 'new',
    clientId: user.uid,
    clientName: user.name,
    clientEmail: user.email,
    company: user.company,
    assignedConsultantId: null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })

  return documentRef.id
}

export function getBriefStats(briefs = []) {
  const activeStatuses = new Set(['new', 'matching', 'active'])

  return {
    total: briefs.length,
    active: briefs.filter((brief) => activeStatuses.has(brief.status)).length,
    matching: briefs.filter((brief) => brief.status === 'matching').length,
    scheduled: briefs.filter((brief) => brief.status === 'scheduled').length,
  }
}
