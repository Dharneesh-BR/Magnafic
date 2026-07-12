import { cert, getApps, initializeApp } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { createClient } from '@sanity/client'

const SANITY_PROJECT_ID = '8pf5fxwy'
const SANITY_DATASET = 'production'

function getServiceAccount() {
  const rawKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY

  if (!rawKey) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY is not configured.')
  }

  const serviceAccount = rawKey.trim().startsWith('{')
    ? JSON.parse(rawKey)
    : JSON.parse(Buffer.from(rawKey, 'base64').toString('utf8'))

  if (serviceAccount.private_key) {
    serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n')
  }

  return serviceAccount
}

function getDb() {
  if (!getApps().length) {
    const serviceAccount = getServiceAccount()

    initializeApp({
      credential: cert(serviceAccount),
      projectId: serviceAccount.project_id || process.env.FIREBASE_PROJECT_ID,
    })
  }

  return getFirestore()
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

function normalizeEmail(value = '') {
  return String(value).trim().toLowerCase()
}

function isEmail(value = '') {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

function getDocumentId(email) {
  return `insightSubscriber.${Buffer.from(email).toString('base64url')}`
}

function toIsoDate(value, fallback) {
  const date = value?.toDate?.() || value
  const parsed = date instanceof Date ? date : new Date(date)
  return Number.isNaN(parsed.getTime()) ? fallback : parsed.toISOString()
}

async function main() {
  const db = getDb()
  const sanity = getSanityClient()
  const snapshot = await db.collection('insightSubscribers').get()
  const now = new Date().toISOString()
  let migrated = 0
  let skipped = 0

  for (const documentSnapshot of snapshot.docs) {
    const data = documentSnapshot.data()
    const email = normalizeEmail(data.email)

    if (!isEmail(email)) {
      skipped += 1
      continue
    }

    await sanity.createOrReplace({
      _id: getDocumentId(email),
      _type: 'insightSubscriber',
      email,
      status: data.status || 'active',
      source: data.source || 'firebase-migration',
      subscribedAt: toIsoDate(data.subscribedAt, now),
      updatedAt: now,
    })

    migrated += 1
  }

  console.log(`Migrated ${migrated} insight subscribers to Sanity. Skipped ${skipped}.`)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
