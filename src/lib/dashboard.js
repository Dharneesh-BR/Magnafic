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
import { mentorClient } from './sanityClient'

export const PROBLEM_ANSWERS_KEY = 'magnafic-problem-answers'

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

export function subscribeConsultantOpportunities(onData, onError, options = {}) {
  const user = requireCurrentUser()
  const opportunitiesQueries = [
    query(collection(db, 'clientBriefs'), where('assignedConsultantId', '==', user.uid)),
  ]

  const sanityExpertId = (options.sanityExpertId || getAuthUser()?.sanityExpertId || '').trim()
  if (sanityExpertId) {
    opportunitiesQueries.push(
      query(collection(db, 'clientBriefs'), where('matchedExpertIds', 'array-contains', sanityExpertId))
    )
  }

  const documentsById = new Map()
  const queryDocuments = opportunitiesQueries.map(() => new Set())
  const loadedQueries = opportunitiesQueries.map(() => false)

  const emitData = () => {
    if (!loadedQueries.every(Boolean)) return
    onData(sortByCreatedAtDesc([...documentsById.values()]))
  }

  const unsubscribes = opportunitiesQueries.map((opportunitiesQuery, queryIndex) => onSnapshot(
    opportunitiesQuery,
    (snapshot) => {
      queryDocuments[queryIndex].forEach((documentId) => {
        const isStillInAnotherQuery = queryDocuments.some((documentIds, index) => (
          index !== queryIndex && documentIds.has(documentId)
        ))

        if (!isStillInAnotherQuery) documentsById.delete(documentId)
      })

      queryDocuments[queryIndex] = new Set(snapshot.docs.map((documentSnapshot) => documentSnapshot.id))
      snapshot.docs.forEach((documentSnapshot) => {
        documentsById.set(documentSnapshot.id, normalizeBrief(documentSnapshot))
      })

      loadedQueries[queryIndex] = true
      emitData()
    },
    (error) => {
      onError?.(error)
    }
  ))

  return () => unsubscribes.forEach((unsubscribe) => unsubscribe())
}

export async function createClientBrief({
  title,
  capability,
  urgency,
  description,
  capabilityId = '',
  capabilitySlug = '',
  matchedExpertIds = [],
  problemAnswers = [],
  routeTags = [],
  source = 'manual',
  status = 'new',
}) {
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
    status,
    clientId: user.uid,
    clientName: user.name,
    clientEmail: user.email,
    company: user.company,
    assignedConsultantId: null,
    capabilityId,
    capabilitySlug,
    matchedExpertIds: [...new Set((matchedExpertIds || []).filter(Boolean))],
    problemAnswers,
    routeTags: [...new Set((routeTags || []).filter(Boolean))],
    source,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })

  return documentRef.id
}

function normalizeMatchText(value = '') {
  return String(value)
    .trim()
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function getAnswerTokens(answers = []) {
  return [...new Set(
    answers
      .flatMap((answer) => [answer.routeTag, answer.value, answer.label])
      .map(normalizeMatchText)
      .filter(Boolean)
  )]
}

function scoreCapability(capability, tokens) {
  const searchableValues = [
    capability._id,
    capability.slug,
    capability.title,
    capability.subtitle,
  ].map(normalizeMatchText).filter(Boolean)

  return tokens.reduce((score, token) => {
    if (searchableValues.includes(token)) return score + 4
    if (searchableValues.some((value) => value.includes(token) || token.includes(value))) return score + 2
    return score
  }, 0)
}

async function findCapabilityForAnswers(answers = []) {
  const selectedCapability = answers.find((answer) => answer.capability?._id)?.capability

  if (selectedCapability?._id) {
    const capability = await mentorClient.fetch(`*[_type == "capabilities" && _id == $capabilityId][0] {
      _id,
      "slug": slug.current,
      title,
      subtitle,
      orderedExperts[]->{
        _id
      }
    }`, { capabilityId: selectedCapability._id })

    if (capability) return capability
  }

  const tokens = getAnswerTokens(answers)
  if (tokens.length === 0) return null

  const capabilities = await mentorClient.fetch(`*[_type == "capabilities"] | order(coalesce(displayOrder, 9999) asc, title asc) {
    _id,
    "slug": slug.current,
    title,
    subtitle,
    orderedExperts[]->{
      _id
    }
  }`)

  return (capabilities || [])
    .map((capability) => ({
      ...capability,
      matchScore: scoreCapability(capability, tokens),
    }))
    .filter((capability) => capability.matchScore > 0)
    .sort((a, b) => b.matchScore - a.matchScore)[0] || null
}

function buildProblemDescription(answers = []) {
  return answers
    .map((answer) => `${answer.question}: ${answer.label || answer.value}`)
    .join('\n')
}

export async function createProblemBriefFromStoredAnswers() {
  const rawAnswers = localStorage.getItem(PROBLEM_ANSWERS_KEY)
  if (!rawAnswers) return null

  const answers = JSON.parse(rawAnswers)
  if (!Array.isArray(answers) || answers.length === 0) return null

  const user = requireCurrentUser()
  const capability = await findCapabilityForAnswers(answers)
  const matchedExpertIds = (capability?.orderedExperts || []).map((expert) => expert?._id).filter(Boolean)
  const routeTags = answers.map((answer) => answer.routeTag).filter(Boolean)
  const capabilityLabel = capability?.title || routeTags[0] || answers[0]?.label || 'General consulting'

  const briefId = await createClientBrief({
    title: `${capabilityLabel} request`,
    capability: capabilityLabel,
    urgency: 'medium',
    description: buildProblemDescription(answers),
    capabilityId: capability?._id || '',
    capabilitySlug: capability?.slug || '',
    matchedExpertIds,
    problemAnswers: answers,
    routeTags,
    source: 'describe-your-problem',
    status: matchedExpertIds.length > 0 ? 'matching' : 'new',
  })

  localStorage.removeItem(PROBLEM_ANSWERS_KEY)

  return {
    briefId,
    capability,
    matchedExpertIds,
    client: user,
  }
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
