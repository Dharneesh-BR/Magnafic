import { createClient } from '@sanity/client'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json',
}

const SANITY_PROJECT_ID = '8pf5fxwy'
const SANITY_DATASET = 'production'

function jsonResponse(statusCode, body) {
  return {
    statusCode,
    headers: corsHeaders,
    body: JSON.stringify(body),
  }
}

function normalizeEmail(value = '') {
  return String(value).trim().toLowerCase()
}

function isEmail(value = '') {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

function getDocumentId(email) {
  return `insightSubscriber.${Buffer.from(email).toString('base64url')}`
}

function getSanityClient() {
  const token = process.env.SANITY_WRITE_TOKEN ||
    process.env.SANITY_API_WRITE_TOKEN ||
    process.env.SANITY_API_TOKEN

  if (!token) {
    throw new Error('SANITY_WRITE_TOKEN is not configured.')
  }

  return createClient({
    projectId: process.env.SANITY_PROJECT_ID || SANITY_PROJECT_ID,
    dataset: process.env.SANITY_DATASET || SANITY_DATASET,
    apiVersion: '2024-01-01',
    useCdn: false,
    token,
  })
}

export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: corsHeaders, body: '' }
  }

  if (event.httpMethod !== 'POST') {
    return jsonResponse(405, { error: 'Method not allowed.' })
  }

  let body = {}
  try {
    body = JSON.parse(event.body || '{}')
  } catch {
    return jsonResponse(400, { error: 'Invalid request body.' })
  }

  const email = normalizeEmail(body.email)
  const source = String(body.source || 'insights-page').trim().slice(0, 120) || 'insights-page'

  if (!isEmail(email)) {
    return jsonResponse(400, { error: 'Please enter a valid email address.' })
  }

  const now = new Date().toISOString()
  const documentId = getDocumentId(email)

  try {
    const client = getSanityClient()

    await client
      .patch(documentId)
      .set({
        email,
        status: 'active',
        source,
        updatedAt: now,
      })
      .setIfMissing({
        subscribedAt: now,
      })
      .commit({ autoGenerateArrayKeys: true })
      .catch(async (error) => {
        if (error?.statusCode !== 404) throw error

        await client.createOrReplace({
          _id: documentId,
          _type: 'insightSubscriber',
          email,
          status: 'active',
          source,
          subscribedAt: now,
          updatedAt: now,
        })
      })

    return jsonResponse(200, {
      success: true,
      email,
    })
  } catch (error) {
    console.error('Insight subscription failed:', error)
    return jsonResponse(500, {
      error: error?.message || 'Unable to subscribe right now.',
    })
  }
}
