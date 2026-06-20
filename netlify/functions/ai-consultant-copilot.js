import { randomUUID } from 'node:crypto'
import { createClient } from '@sanity/client'
import { cert, getApps, initializeApp } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore } from 'firebase-admin/firestore'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json',
}

const TIER_LIMITS = {
  standard: 500,
  senior: 2000,
  'magna-master': 5000,
}

const ACTION_COSTS = {
  chat: 1,
  report: 25,
  ppt: 50,
  image: 10,
}

function jsonResponse(statusCode, body) {
  return {
    statusCode,
    headers: corsHeaders,
    body: JSON.stringify(body),
  }
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

function getFirebaseServices() {
  const serviceAccount = getServiceAccount()
  if (!serviceAccount) return null

  const app = getApps()[0] || initializeApp({
    credential: cert(serviceAccount),
    projectId: serviceAccount.project_id || process.env.FIREBASE_PROJECT_ID,
  })

  return {
    auth: getAuth(app),
    db: getFirestore(app),
  }
}

function getSanityClient() {
  const localToken = process.env.NODE_ENV !== 'production'
    ? process.env.VITE_SANITY_WRITE_TOKEN
    : ''
  const token = process.env.SANITY_API_TOKEN || process.env.SANITY_WRITE_TOKEN || localToken
  if (!token) throw new Error('SANITY_API_TOKEN is not configured.')

  return createClient({
    projectId: process.env.SANITY_PROJECT_ID || '8pf5fxwy',
    dataset: process.env.SANITY_DATASET || 'production',
    apiVersion: '2024-01-01',
    useCdn: false,
    token,
  })
}

function getBearerToken(event) {
  const header = event.headers?.authorization || event.headers?.Authorization || ''
  return header.startsWith('Bearer ') ? header.slice(7).trim() : ''
}

function decodeFirestoreValue(value = {}) {
  if ('stringValue' in value) return value.stringValue
  if ('booleanValue' in value) return value.booleanValue
  if ('integerValue' in value) return Number(value.integerValue)
  if ('doubleValue' in value) return Number(value.doubleValue)
  if ('timestampValue' in value) return value.timestampValue
  if ('nullValue' in value) return null
  if ('mapValue' in value) return decodeFirestoreFields(value.mapValue.fields || {})
  if ('arrayValue' in value) {
    return (value.arrayValue.values || []).map(decodeFirestoreValue)
  }
  return undefined
}

function decodeFirestoreFields(fields = {}) {
  return Object.fromEntries(
    Object.entries(fields).map(([key, value]) => [key, decodeFirestoreValue(value)])
  )
}

async function authenticateConsultantWithFirebaseRest(token) {
  const apiKey = process.env.VITE_FIREBASE_API_KEY
  const projectId = process.env.VITE_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID

  if (!apiKey || !projectId) {
    throw new Error('Local Firebase authentication is not configured.')
  }

  const authResponse = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${encodeURIComponent(apiKey)}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken: token }),
    }
  )
  const authPayload = await authResponse.json().catch(() => ({}))
  const firebaseUser = authPayload.users?.[0]

  if (!authResponse.ok || !firebaseUser?.localId) {
    const error = new Error('Please log in again to use the AI Copilot.')
    error.statusCode = 401
    throw error
  }

  const profileResponse = await fetch(
    `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(projectId)}/databases/(default)/documents/users/${encodeURIComponent(firebaseUser.localId)}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  )
  const profilePayload = await profileResponse.json().catch(() => ({}))

  if (!profileResponse.ok) {
    const error = new Error(
      profileResponse.status === 404
        ? 'This account does not have a Magnafic user profile.'
        : 'Unable to load the consultant account.'
    )
    error.statusCode = profileResponse.status === 404 ? 403 : profileResponse.status
    throw error
  }

  return {
    decodedToken: {
      uid: firebaseUser.localId,
      email: firebaseUser.email || '',
    },
    profile: decodeFirestoreFields(profilePayload.fields || {}),
  }
}

async function authenticateConsultant(event) {
  const token = getBearerToken(event)
  if (!token) {
    const error = new Error('Please log in again to use the AI Copilot.')
    error.statusCode = 401
    throw error
  }

  const firebaseServices = getFirebaseServices()
  let decodedToken
  let profile

  if (firebaseServices) {
    decodedToken = await firebaseServices.auth.verifyIdToken(token)
    const profileSnapshot = await firebaseServices.db.collection('users').doc(decodedToken.uid).get()
    profile = profileSnapshot.exists ? profileSnapshot.data() : null

    if (!profile && decodedToken.email) {
      const matchingProfiles = await firebaseServices.db.collection('users')
        .where('email', '==', decodedToken.email)
        .limit(1)
        .get()
      profile = matchingProfiles.docs[0]?.data() || null
    }
  } else if (process.env.NODE_ENV !== 'production') {
    const localAuth = await authenticateConsultantWithFirebaseRest(token)
    decodedToken = localAuth.decodedToken
    profile = localAuth.profile
  } else {
    throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY is not configured.')
  }

  if (profile?.role !== 'consultant' || !profile?.sanityExpertId) {
    const error = new Error('This account is not linked to a Magnafic consultant profile.')
    error.statusCode = 403
    throw error
  }

  return {
    uid: decodedToken.uid,
    email: profile.email || decodedToken.email || '',
    sanityExpertId: String(profile.sanityExpertId).trim(),
  }
}

function monthWindow() {
  const now = new Date()
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1))
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1))
  return {
    start: start.toISOString(),
    end: end.toISOString(),
  }
}

async function getCopilotContext(client, sanityExpertId) {
  const consultant = await client.fetch(
    `*[_type == "mentor" && _id == $consultantId][0] {
      _id,
      fullName,
      aiEnabled,
      consultantTier,
      assignedAgent->{
        _id,
        name,
        "slug": slug.current,
        serviceLine,
        description,
        systemPrompt,
        enabledTools,
        active
      }
    }`,
    { consultantId: sanityExpertId }
  )

  if (!consultant) {
    const error = new Error('The linked consultant profile could not be found in Sanity.')
    error.statusCode = 404
    throw error
  }

  if (!consultant.aiEnabled) {
    const error = new Error('AI Copilot access is not enabled for this consultant.')
    error.statusCode = 403
    throw error
  }

  if (!consultant.assignedAgent?._id || !consultant.assignedAgent.active) {
    const error = new Error('An active AI agent has not been assigned to this consultant.')
    error.statusCode = 403
    throw error
  }

  const tier = consultant.consultantTier || 'standard'
  const monthlyLimit = TIER_LIMITS[tier] || TIER_LIMITS.standard
  const { start, end } = monthWindow()
  const usage = await client.fetch(
    `*[
      _type == "aiUsage" &&
      consultant._ref == $consultantId &&
      createdAt >= $start &&
      createdAt < $end
    ].creditsConsumed`,
    { consultantId: consultant._id, start, end }
  )
  const creditsUsed = (usage || []).reduce((total, value) => total + (Number(value) || 0), 0)

  return {
    consultant,
    agent: consultant.assignedAgent,
    credits: {
      tier,
      monthlyLimit,
      used: creditsUsed,
      remaining: Math.max(monthlyLimit - creditsUsed, 0),
    },
  }
}

async function getBootstrapData(client, context) {
  const [sessions, templates] = await Promise.all([
    client.fetch(
      `*[
        _type == "chatSession" &&
        consultant._ref == $consultantId &&
        agent._ref == $agentId
      ] | order(updatedAt desc)[0...30] {
        _id,
        sessionTitle,
        createdAt,
        updatedAt,
        "messageCount": count(messages)
      }`,
      {
        consultantId: context.consultant._id,
        agentId: context.agent._id,
      }
    ),
    client.fetch(
      `*[
        _type == "promptTemplate" &&
        status == "published" &&
        (!defined(recommendedAgent) || recommendedAgent._ref == $agentId)
      ] | order(category asc, title asc) {
        _id,
        title,
        category,
        promptText
      }`,
      { agentId: context.agent._id }
    ),
  ])

  return {
    consultant: {
      id: context.consultant._id,
      name: context.consultant.fullName,
      tier: context.credits.tier,
    },
    agent: {
      id: context.agent._id,
      name: context.agent.name,
      slug: context.agent.slug,
      serviceLine: context.agent.serviceLine,
      description: context.agent.description,
      enabledTools: context.agent.enabledTools || ['chat'],
    },
    credits: context.credits,
    actionCosts: ACTION_COSTS,
    sessions: sessions || [],
    templates: templates || [],
  }
}

async function getSession(client, context, sessionId) {
  if (!sessionId) return null

  return client.fetch(
    `*[
      _type == "chatSession" &&
      _id == $sessionId &&
      consultant._ref == $consultantId &&
      agent._ref == $agentId
    ][0] {
      _id,
      sessionTitle,
      createdAt,
      updatedAt,
      messages[]{
        _key,
        role,
        content,
        timestamp
      }
    }`,
    {
      sessionId,
      consultantId: context.consultant._id,
      agentId: context.agent._id,
    }
  )
}

function toGeminiContents(messages) {
  return (messages || [])
    .filter((message) => ['user', 'assistant'].includes(message.role) && message.content)
    .slice(-20)
    .map((message) => ({
      role: message.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: String(message.content).slice(0, 20000) }],
    }))
}

async function generateGeminiResponse(context, messages, prompt) {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) throw new Error('GEMINI_API_KEY is not configured.')

  const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash'
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`
  const systemPrompt = [
    context.agent.systemPrompt,
    '',
    'Operating context:',
    `- You are assisting ${context.consultant.fullName}, a Magnafic consultant.`,
    `- Consultant tier: ${context.credits.tier}.`,
    `- Assigned service line: ${context.agent.serviceLine}.`,
    '- Produce practical, structured consulting work. State assumptions and distinguish facts from recommendations.',
    '- Do not claim to have conducted live research or accessed private company information unless it appears in the conversation.',
  ].join('\n')

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': apiKey,
    },
    body: JSON.stringify({
      systemInstruction: {
        parts: [{ text: systemPrompt }],
      },
      contents: [
        ...toGeminiContents(messages),
        { role: 'user', parts: [{ text: prompt }] },
      ],
      generationConfig: {
        temperature: 0.35,
        topP: 0.9,
        maxOutputTokens: 4096,
      },
    }),
  })

  const responseText = await response.text()
  let payload = null

  try {
    payload = responseText ? JSON.parse(responseText) : null
  } catch {
    payload = null
  }

  if (!response.ok) {
    console.error('Gemini request failed.', {
      status: response.status,
      model,
      error: payload?.error || responseText.slice(0, 1000),
    })
    const error = new Error(payload?.error?.message || 'Gemini could not complete this request.')
    error.statusCode = response.status === 429 ? 429 : 502
    throw error
  }

  const content = payload?.candidates?.[0]?.content?.parts
    ?.map((part) => part.text || '')
    .join('')
    .trim()

  if (!content) {
    console.error('Gemini returned no text.', {
      finishReason: payload?.candidates?.[0]?.finishReason,
      promptFeedback: payload?.promptFeedback,
    })
    const error = new Error('Gemini returned an empty response. Please rephrase the request.')
    error.statusCode = 502
    throw error
  }

  return content
}

function createMessage(role, content, timestamp) {
  return {
    _key: randomUUID(),
    _type: 'object',
    role,
    content,
    timestamp,
  }
}

function createSessionTitle(prompt) {
  const normalized = prompt.replace(/\s+/g, ' ').trim()
  return normalized.length > 64 ? `${normalized.slice(0, 61)}...` : normalized
}

async function handleChat(client, context, body) {
  const prompt = String(body.prompt || '').trim()
  const sessionId = String(body.sessionId || '').trim()
  const cost = ACTION_COSTS.chat

  if (!prompt) {
    const error = new Error('Enter a consulting question or instruction.')
    error.statusCode = 400
    throw error
  }

  if (prompt.length > 12000) {
    const error = new Error('The prompt is too long. Keep it under 12,000 characters.')
    error.statusCode = 400
    throw error
  }

  if (!(context.agent.enabledTools || ['chat']).includes('chat')) {
    const error = new Error('Chat is not enabled for the assigned AI agent.')
    error.statusCode = 403
    throw error
  }

  if (context.credits.remaining < cost) {
    const error = new Error('Monthly AI limit reached.')
    error.statusCode = 402
    throw error
  }

  const existingSession = sessionId ? await getSession(client, context, sessionId) : null
  if (sessionId && !existingSession) {
    const error = new Error('This chat session was not found.')
    error.statusCode = 404
    throw error
  }

  const assistantContent = await generateGeminiResponse(
    context,
    existingSession?.messages || [],
    prompt
  )
  const now = new Date().toISOString()
  const userMessage = createMessage('user', prompt, now)
  const assistantMessage = createMessage('assistant', assistantContent, now)
  let savedSessionId = existingSession?._id

  if (savedSessionId) {
    await client.transaction()
      .patch(savedSessionId, (patch) => patch
        .setIfMissing({ messages: [] })
        .append('messages', [userMessage, assistantMessage])
        .set({ updatedAt: now }))
      .create({
        _id: `aiUsage.${randomUUID()}`,
        _type: 'aiUsage',
        consultant: { _type: 'reference', _ref: context.consultant._id },
        agent: { _type: 'reference', _ref: context.agent._id },
        session: { _type: 'reference', _ref: savedSessionId },
        actionType: 'chat',
        creditsConsumed: cost,
        prompt,
        createdAt: now,
      })
      .commit()
  } else {
    savedSessionId = `chatSession.${randomUUID()}`
    await client.transaction()
      .create({
        _id: savedSessionId,
        _type: 'chatSession',
        consultant: { _type: 'reference', _ref: context.consultant._id },
        agent: { _type: 'reference', _ref: context.agent._id },
        sessionTitle: createSessionTitle(prompt),
        messages: [userMessage, assistantMessage],
        createdAt: now,
        updatedAt: now,
      })
      .create({
        _id: `aiUsage.${randomUUID()}`,
        _type: 'aiUsage',
        consultant: { _type: 'reference', _ref: context.consultant._id },
        agent: { _type: 'reference', _ref: context.agent._id },
        session: { _type: 'reference', _ref: savedSessionId },
        actionType: 'chat',
        creditsConsumed: cost,
        prompt,
        createdAt: now,
      })
      .commit()
  }

  return {
    sessionId: savedSessionId,
    userMessage,
    assistantMessage,
    credits: {
      ...context.credits,
      used: context.credits.used + cost,
      remaining: Math.max(context.credits.remaining - cost, 0),
    },
  }
}

export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') return jsonResponse(204, {})
  if (event.httpMethod !== 'POST') return jsonResponse(405, { error: 'Method not allowed.' })

  try {
    const body = JSON.parse(event.body || '{}')
    const action = String(body.action || 'bootstrap')
    const authUser = await authenticateConsultant(event)
    const client = getSanityClient()
    const context = await getCopilotContext(client, authUser.sanityExpertId)

    if (action === 'bootstrap') {
      return jsonResponse(200, await getBootstrapData(client, context))
    }

    if (action === 'session') {
      const session = await getSession(client, context, String(body.sessionId || '').trim())
      return session
        ? jsonResponse(200, { session })
        : jsonResponse(404, { error: 'This chat session was not found.' })
    }

    if (action === 'chat') {
      return jsonResponse(200, await handleChat(client, context, body))
    }

    return jsonResponse(400, { error: 'Unsupported Copilot action.' })
  } catch (error) {
    const statusCode = error.statusCode || (error.code?.startsWith?.('auth/') ? 401 : 500)
    console.error('AI Consultant Copilot request failed.', {
      statusCode,
      message: error.message,
      code: error.code || '',
    })
    return jsonResponse(statusCode, {
      error: statusCode >= 500
        ? 'The AI Copilot is temporarily unavailable. Please try again.'
        : error.message,
    })
  }
}
