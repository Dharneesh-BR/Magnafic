const allowedMethods = new Set(['GET', 'POST', 'PUT', 'PATCH', 'DELETE'])

export async function handler(event) {
  const origin = String(process.env.LMS_API_ORIGIN || '').replace(/\/$/, '')
  const path = event.queryStringParameters?.path || ''

  if (!origin) {
    return { statusCode: 503, body: JSON.stringify({ error: 'LMS_API_ORIGIN is not configured.' }) }
  }

  if (!path.startsWith('/api/') || path.includes('://')) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid LMS API path.' }) }
  }

  if (!allowedMethods.has(event.httpMethod)) {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed.' }) }
  }

  try {
    const response = await fetch(`${origin}${path}`, {
      method: event.httpMethod,
      headers: {
        Accept: 'application/json',
        'Content-Type': event.headers['content-type'] || 'application/json',
        ...(event.headers.authorization ? { Authorization: event.headers.authorization } : {}),
      },
      body: ['GET', 'HEAD'].includes(event.httpMethod) ? undefined : event.body,
    })
    const body = await response.text()

    return {
      statusCode: response.status,
      headers: { 'Content-Type': response.headers.get('content-type') || 'application/json' },
      body,
    }
  } catch (error) {
    console.error('LMS proxy request failed:', error)
    return { statusCode: 502, body: JSON.stringify({ error: 'The learning service is unavailable.' }) }
  }
}
