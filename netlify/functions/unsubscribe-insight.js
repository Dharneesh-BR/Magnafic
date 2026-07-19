import { createClient } from '@sanity/client'

const SANITY_PROJECT_ID = '8pf5fxwy'
const SANITY_DATASET = 'production'
const SITE_NAME = 'Magnafic'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
}

function getSanityToken() {
  return process.env.SANITY_WRITE_TOKEN ||
    process.env.SANITY_API_WRITE_TOKEN ||
    process.env.SANITY_API_TOKEN ||
    ''
}

function getSanityClient() {
  return createClient({
    projectId: process.env.SANITY_PROJECT_ID || SANITY_PROJECT_ID,
    dataset: process.env.SANITY_DATASET || SANITY_DATASET,
    apiVersion: '2024-01-01',
    useCdn: false,
    token: getSanityToken(),
  })
}

function getSiteUrl() {
  return (process.env.SITE_URL || 'https://magnafic.com').replace(/\/$/, '')
}

function getDocumentId(email) {
  return `insightSubscriber.${Buffer.from(email).toString('base64url')}`
}

function normalizeEmail(value = '') {
  return String(value).trim().toLowerCase()
}

function isEmail(value = '') {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

function decodeToken(token = '') {
  try {
    return normalizeEmail(Buffer.from(String(token), 'base64url').toString('utf8'))
  } catch {
    return ''
  }
}

function htmlResponse(statusCode, { title, message }) {
  const siteUrl = getSiteUrl()

  return {
    statusCode,
    headers: {
      ...corsHeaders,
      'Content-Type': 'text/html; charset=utf-8',
    },
    body: `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${title}</title>
  </head>
  <body style="margin:0;background:#f3f7fb;font-family:Arial,Helvetica,sans-serif;color:#102033">
    <main style="min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px">
      <section style="max-width:520px;width:100%;border-radius:18px;background:#ffffff;padding:32px;text-align:center;box-shadow:0 14px 32px rgba(16,32,51,0.08)">
        <img src="${siteUrl}/logo%20copy.png" alt="${SITE_NAME}" width="42" height="42" style="display:block;width:42px;height:42px;margin:0 auto 14px;border:0" />
        <h1 style="margin:0 0 10px;font-size:22px;line-height:1.25;color:#000047">${title}</h1>
        <p style="margin:0 0 22px;font-size:14px;line-height:1.6;color:#516070">${message}</p>
        <a href="https://www.magnafic.com" style="display:inline-block;border-radius:999px;background:#000047;color:#ffffff;font-size:14px;font-weight:800;line-height:1;text-decoration:none;padding:14px 20px">Visit website</a>
      </section>
    </main>
  </body>
</html>`,
  }
}

export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: corsHeaders, body: '' }
  }

  if (event.httpMethod !== 'GET') {
    return htmlResponse(405, {
      title: 'Method not allowed',
      message: 'This unsubscribe link only works from the email you received.',
    })
  }

  if (!getSanityToken()) {
    console.error('Insight unsubscribe is not configured: missing SANITY_WRITE_TOKEN')
    return htmlResponse(500, {
      title: 'Unable to unsubscribe',
      message: 'We could not process this request right now. Please try again later.',
    })
  }

  const email = decodeToken(event.queryStringParameters?.token || '')

  if (!isEmail(email)) {
    return htmlResponse(400, {
      title: 'Invalid unsubscribe link',
      message: 'This unsubscribe link is invalid or incomplete.',
    })
  }

  const now = new Date().toISOString()

  try {
    await getSanityClient()
      .patch(getDocumentId(email))
      .set({
        status: 'unsubscribed',
        unsubscribedAt: now,
        updatedAt: now,
      })
      .commit()

    return htmlResponse(200, {
      title: 'You are unsubscribed',
      message: 'You will no longer receive Magnafic Insights emails.',
    })
  } catch (error) {
    if (error?.statusCode === 404) {
      return htmlResponse(200, {
        title: 'You are unsubscribed',
        message: 'This email is not active on the Magnafic Insights list.',
      })
    }

    console.error('Insight unsubscribe failed:', error)
    return htmlResponse(500, {
      title: 'Unable to unsubscribe',
      message: 'We could not process this request right now. Please try again later.',
    })
  }
}
