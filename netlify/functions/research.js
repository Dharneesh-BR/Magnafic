import { randomUUID } from 'node:crypto'
import { createClient } from '@sanity/client'
import { cert, getApps, initializeApp } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore } from 'firebase-admin/firestore'

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json',
}

const RESEARCH_COST = 25

const reply = (statusCode, body) => ({ statusCode, headers, body: JSON.stringify(body) })
const asJson = (value) => JSON.stringify(value)
const safeParse = (value, fallback = null) => {
  if (typeof value !== 'string') return value || fallback
  const cleaned = value.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '')
  try {
    return JSON.parse(cleaned)
  } catch {
    const start = cleaned.indexOf('{')
    const end = cleaned.lastIndexOf('}')
    if (start >= 0 && end > start) {
      try { return JSON.parse(cleaned.slice(start, end + 1)) } catch { /* use fallback */ }
    }
    return fallback
  }
}

function serviceAccount() {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
  if (!raw) return null
  const account = raw.trim().startsWith('{')
    ? JSON.parse(raw)
    : JSON.parse(Buffer.from(raw, 'base64').toString('utf8'))
  if (account.private_key) account.private_key = account.private_key.replace(/\\n/g, '\n')
  return account
}

function firebaseServices() {
  const account = serviceAccount()
  if (!account) return null
  const app = getApps()[0] || initializeApp({
    credential: cert(account),
    projectId: account.project_id || process.env.FIREBASE_PROJECT_ID,
  })
  return { auth: getAuth(app), db: getFirestore(app) }
}

function sanityClient() {
  const localToken = process.env.NODE_ENV !== 'production' ? process.env.VITE_SANITY_WRITE_TOKEN : ''
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

function bearer(event) {
  const value = event.headers?.authorization || event.headers?.Authorization || ''
  return value.startsWith('Bearer ') ? value.slice(7).trim() : ''
}

function decodeValue(value = {}) {
  if ('stringValue' in value) return value.stringValue
  if ('booleanValue' in value) return value.booleanValue
  if ('integerValue' in value) return Number(value.integerValue)
  if ('doubleValue' in value) return Number(value.doubleValue)
  if ('nullValue' in value) return null
  if ('mapValue' in value) return decodeFields(value.mapValue.fields || {})
  if ('arrayValue' in value) return (value.arrayValue.values || []).map(decodeValue)
  return undefined
}

function decodeFields(fields = {}) {
  return Object.fromEntries(Object.entries(fields).map(([key, value]) => [key, decodeValue(value)]))
}

async function authenticateWithRest(token) {
  const apiKey = process.env.VITE_FIREBASE_API_KEY
  const projectId = process.env.VITE_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID
  if (!apiKey || !projectId) throw new Error('Firebase authentication is not configured.')

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
    const error = new Error('Please log in again to use Magnafic Copilot.')
    error.statusCode = 401
    throw error
  }

  const profileResponse = await fetch(
    `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(projectId)}/databases/(default)/documents/users/${encodeURIComponent(firebaseUser.localId)}`,
    { headers: { Authorization: `Bearer ${token}` } }
  )
  const profilePayload = await profileResponse.json().catch(() => ({}))
  return {
    uid: firebaseUser.localId,
    email: firebaseUser.email || '',
    profile: profileResponse.ok ? decodeFields(profilePayload.fields || {}) : {},
  }
}

async function authenticate(event) {
  const token = bearer(event)
  if (!token) {
    const error = new Error('Please log in again to use Magnafic Copilot.')
    error.statusCode = 401
    throw error
  }

  const services = firebaseServices()
  let uid
  let email
  let profile = {}

  if (services) {
    const decoded = await services.auth.verifyIdToken(token)
    uid = decoded.uid
    email = decoded.email || ''
    const snapshot = await services.db.collection('users').doc(uid).get()
    profile = snapshot.exists ? snapshot.data() : {}
  } else if (process.env.NODE_ENV !== 'production') {
    const local = await authenticateWithRest(token)
    uid = local.uid
    email = local.email
    profile = local.profile
  } else {
    throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY is not configured.')
  }

  if (profile.role === 'admin' || profile.isAdmin === true) {
    const error = new Error('Use a client or consultant account for research sessions.')
    error.statusCode = 403
    throw error
  }

  return {
    uid,
    email: profile.email || email,
    name: profile.name || profile.fullName || '',
    role: profile.role || 'client',
  }
}

async function gemini(systemInstruction, prompt, {
  json = true,
  maxOutputTokens = 4096,
  responseSchema,
  thinkingBudget = 512,
} = {}) {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) throw new Error('GEMINI_API_KEY is not configured.')
  const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash'
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: systemInstruction }] },
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.25,
        topP: 0.9,
        maxOutputTokens,
        ...(json ? {
          responseMimeType: 'application/json',
          ...(responseSchema ? { responseSchema } : {}),
        } : {}),
        thinkingConfig: { thinkingBudget },
      },
    }),
  })
  const payload = await response.json().catch(() => ({}))
  if (!response.ok) {
    const providerMessage = payload?.error?.message || 'Gemini could not complete the research workflow.'
    const retryDetail = payload?.error?.details?.find?.((detail) => (
      detail?.['@type'] === 'type.googleapis.com/google.rpc.RetryInfo'
    ))
    const retryText = retryDetail?.retryDelay || providerMessage.match(/retry in ([\d.]+)s/i)?.[1]
    const retryAfter = Math.max(1, Math.ceil(Number.parseFloat(retryText) || 0))
    const error = new Error(
      response.status === 429
        ? 'Gemini is temporarily at its request limit. Please wait and try again.'
        : providerMessage
    )
    error.statusCode = response.status === 429 ? 429 : 502
    error.code = payload?.error?.status || `GEMINI_${response.status}`
    error.retryAfter = retryAfter || 30
    throw error
  }
  const text = payload?.candidates?.[0]?.content?.parts?.map((part) => part.text || '').join('').trim()
  if (!text) {
    const error = new Error('Gemini returned an empty workflow result.')
    error.statusCode = 502
    throw error
  }
  if (!json) return text

  console.info('Gemini token usage.', {
    model,
    promptTokens: payload?.usageMetadata?.promptTokenCount || 0,
    outputTokens: payload?.usageMetadata?.candidatesTokenCount || 0,
    thinkingTokens: payload?.usageMetadata?.thoughtsTokenCount || 0,
    totalTokens: payload?.usageMetadata?.totalTokenCount || 0,
  })

  const parsed = safeParse(text)
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    const error = new Error('Gemini returned an invalid structured response.')
    error.statusCode = 502
    error.code = `GEMINI_INVALID_JSON_${payload?.candidates?.[0]?.finishReason || 'UNKNOWN'}`
    throw error
  }
  return parsed
}

const workflowRules = `
You are Magnafic Copilot, a market-intelligence and business research assistant.
Be concise, commercially sharp, and executive-ready. Never claim live web research, source verification,
private knowledge, or precise current market data. Phase 1 has no web search. Treat uncited market
statements and numeric estimates as hypotheses, clearly label assumptions, and avoid fabricated citations.
Return only the requested output format.
`.trim()

const stringArraySchema = {
  type: 'ARRAY',
  items: { type: 'STRING' },
}

const finalReportSchema = {
  type: 'OBJECT',
  required: [
    'executiveSummary',
    'businessAnalysis',
    'keyFindings',
    'marketInsights',
    'opportunities',
    'risks',
    'recommendations',
    'nextSteps',
    'assumptions',
    'lowConfidenceStatements',
  ],
  properties: {
    executiveSummary: { type: 'STRING' },
    businessAnalysis: { type: 'STRING' },
    keyFindings: stringArraySchema,
    marketInsights: stringArraySchema,
    opportunities: stringArraySchema,
    risks: stringArraySchema,
    recommendations: stringArraySchema,
    nextSteps: stringArraySchema,
    assumptions: stringArraySchema,
    lowConfidenceStatements: stringArraySchema,
    visualSuggestions: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        required: ['kind', 'title', 'description'],
        properties: {
          kind: { type: 'STRING', enum: ['chart', 'table', 'infographic'] },
          title: { type: 'STRING' },
          description: { type: 'STRING' },
        },
      },
    },
  },
}

function hasUsableReport(report) {
  return Boolean(
    report?.executiveSummary?.trim() &&
    report?.businessAnalysis?.trim() &&
    Array.isArray(report?.keyFindings) &&
    report.keyFindings.length
  )
}

async function runWorkflow({ question, businessContext, files, history }) {
  const workflowStartedAt = Date.now()
  const fileBudget = 12000
  let remainingFileBudget = fileBudget
  const context = {
    question,
    businessContext: String(businessContext || '').slice(0, 4000),
    uploadedFiles: (files || []).map((file) => ({
      name: file.name || 'Attachment',
      type: file.type || '',
      text: (() => {
        const text = String(file.text || file.content || '')
        const excerpt = text.slice(0, Math.max(0, remainingFileBudget))
        remainingFileBudget -= excerpt.length
        return excerpt
      })(),
    })).filter((file) => file.text),
    previousChatHistory: (history || []).slice(-4).map((item) => ({
      role: item.role,
      content: String(item.content || '').slice(0, 2000),
    })),
  }

  const report = await gemini(
    `${workflowRules}
You are Magnafic Copilot. Produce one practical executive research report.
Directly analyze the business question using the supplied context.

Use 3-5 items per core array and no more than 25 words per item.
Keep executiveSummary under 140 words and businessAnalysis under 220 words.
Clearly separate assumptions from findings. Do not invent precise market figures,
sources, surveys, or competitor facts. Recommend at most 2 useful visuals.`,
    `Create the executive report for:
${asJson(context)}

Follow the response schema. Do not add citations or imply live research.`,
    {
      maxOutputTokens: 2800,
      responseSchema: finalReportSchema,
      thinkingBudget: 128,
    }
  )
  console.info('Research workflow stage completed.', {
    stage: 'executive-report',
    elapsedMs: Date.now() - workflowStartedAt,
  })

  if (!hasUsableReport(report)) {
    const error = new Error('Gemini did not produce a complete research report.')
    error.statusCode = 502
    error.code = 'GEMINI_INCOMPLETE_REPORT'
    throw error
  }

  return {
    scout: {
      businessProblem: question,
      industry: '',
      researchAreas: [],
      keyQuestions: [],
      successCriteria: [],
    },
    research: {
      marketInsights: report.marketInsights || [],
      opportunities: report.opportunities || [],
      risks: report.risks || [],
      assumptions: report.assumptions || [],
    },
    synthesis: {
      keyFindings: report.keyFindings || [],
      opportunities: report.opportunities || [],
      risks: report.risks || [],
      recommendations: report.recommendations || [],
    },
    final: {
      ...report,
      visualSuggestions: report.visualSuggestions || [],
    },
  }
}

function userValue(user) {
  return { _type: 'object', uid: user.uid, name: user.name, email: user.email, role: user.role }
}

function message(role, content, timestamp, report) {
  return {
    _key: randomUUID(),
    _type: 'object',
    role,
    content,
    ...(report ? { report: asJson(report) } : {}),
    timestamp,
  }
}

async function bootstrap(client, user) {
  const sessions = await client.fetch(
    `*[_type == "chatSession" && user.uid == $uid] | order(updatedAt desc)[0...30] {
      _id, sessionTitle, createdAt, updatedAt, "messageCount": count(messages)
    }`,
    { uid: user.uid }
  )
  return {
    user,
    product: { name: 'Magnafic Copilot', description: 'Your AI Business Research Partner' },
    credits: { remaining: null },
    actionCosts: { research: RESEARCH_COST },
    sessions: sessions || [],
  }
}

async function getSession(client, user, sessionId) {
  const session = await client.fetch(
    `*[_type == "chatSession" && _id == $sessionId && user.uid == $uid][0] {
      _id, sessionTitle, createdAt, updatedAt,
      "projectQuestion": project->question,
      messages[]{_key, role, content, report, timestamp}
    }`,
    { sessionId, uid: user.uid }
  )
  if (session?.messages) {
    session.messages = session.messages.map((item) => ({
      ...item,
      ...(item.report ? { report: safeParse(item.report, null) } : {}),
    }))
  }
  return session
}

async function research(client, user, body) {
  const question = String(body.question || body.prompt || '').trim()
  const sessionId = String(body.sessionId || '').trim()
  if (!question) {
    const error = new Error('Enter a business question to begin research.')
    error.statusCode = 400
    throw error
  }
  if (question.length > 12000) {
    const error = new Error('Keep the question under 12,000 characters.')
    error.statusCode = 400
    throw error
  }

  const existing = sessionId ? await getSession(client, user, sessionId) : null
  if (sessionId && !existing) {
    const error = new Error('This research session was not found.')
    error.statusCode = 404
    throw error
  }

  const now = new Date().toISOString()
  const projectId = `researchProject.${randomUUID()}`
  const savedSessionId = existing?._id || `chatSession.${randomUUID()}`
  const title = question.replace(/\s+/g, ' ').slice(0, 80)
  const project = {
    _id: projectId,
    _type: 'researchProject',
    title,
    user: userValue(user),
    industry: String(body.industry || ''),
    question,
    status: 'processing',
    createdAt: now,
  }
  await client.create(project)

  try {
    const history = (existing?.messages || []).map(({ role, content }) => ({ role, content }))
    const result = await runWorkflow({
      question,
      businessContext: body.businessContext,
      files: body.files,
      history,
    })
    const completedAt = new Date().toISOString()
    const userMessage = message('user', question, now)
    const assistantMessage = message('assistant', result.final.executiveSummary, completedAt, result.final)
    const transaction = client.transaction()
      .patch(projectId, (patch) => patch.set({ status: 'completed', industry: result.scout.industry || project.industry }))
      .create({
        _id: `researchSession.${randomUUID()}`,
        _type: 'researchSession',
        project: { _type: 'reference', _ref: projectId },
        scoutOutput: asJson(result.scout),
        researchOutput: asJson(result.research),
        synthesizedOutput: asJson(result.synthesis),
        finalOutput: asJson(result.final),
        createdAt: completedAt,
      })
      .create({
        _id: `usageTracking.${randomUUID()}`,
        _type: 'usageTracking',
        user: userValue(user),
        action: 'research-report',
        creditsConsumed: RESEARCH_COST,
        createdAt: completedAt,
      })

    if (existing) {
      transaction.patch(savedSessionId, (patch) => patch
        .set({
          project: { _type: 'reference', _ref: projectId },
          sessionTitle: title,
          updatedAt: completedAt,
        })
        .append('messages', [userMessage, assistantMessage]))
    } else {
      transaction.create({
        _id: savedSessionId,
        _type: 'chatSession',
        user: userValue(user),
        project: { _type: 'reference', _ref: projectId },
        sessionTitle: title,
        messages: [userMessage, assistantMessage],
        createdAt: now,
        updatedAt: completedAt,
      })
    }
    await transaction.commit()
    return {
      sessionId: savedSessionId,
      projectId,
      userMessage,
      assistantMessage: {
        ...assistantMessage,
        report: result.final,
      },
      report: result.final,
    }
  } catch (error) {
    await client.patch(projectId).set({ status: 'failed' }).commit().catch(() => {})
    throw error
  }
}

export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') return reply(204, {})
  if (event.httpMethod !== 'POST') return reply(405, { error: 'Method not allowed.' })
  try {
    const body = JSON.parse(event.body || '{}')
    const action = String(body.action || 'research')
    const user = await authenticate(event)
    const client = sanityClient()

    if (action === 'bootstrap') return reply(200, await bootstrap(client, user))
    if (action === 'session') {
      const session = await getSession(client, user, String(body.sessionId || '').trim())
      return session ? reply(200, { session }) : reply(404, { error: 'This research session was not found.' })
    }
    if (action === 'research' || action === 'chat') return reply(200, await research(client, user, body))
    return reply(400, { error: 'Unsupported Magnafic Copilot action.' })
  } catch (error) {
    const statusCode = error.statusCode || (error.code?.startsWith?.('auth/') ? 401 : 500)
    console.error('Research workflow failed.', { statusCode, message: error.message, code: error.code || '' })
    const safeServerMessages = [
      'GEMINI_API_KEY is not configured.',
      'SANITY_API_TOKEN is not configured.',
      'FIREBASE_SERVICE_ACCOUNT_KEY is not configured.',
    ]
    const publicMessage = safeServerMessages.includes(error.message) || String(error.code || '').startsWith('GEMINI_')
      ? error.message
      : 'The research workflow is temporarily unavailable. Please try again.'
    return reply(statusCode, {
      error: statusCode >= 500 ? publicMessage : error.message,
      code: error.code || 'RESEARCH_WORKFLOW_FAILED',
      ...(error.retryAfter ? { retryAfter: error.retryAfter } : {}),
    })
  }
}
