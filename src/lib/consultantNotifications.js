export async function notifyConsultants({eventType, consultantIds = [], context = {}}) {
  const response = await fetch('/.netlify/functions/notify-consultants', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
      eventType,
      consultantIds,
      context,
    }),
  })

  if (!response.ok) {
    const result = await response.json().catch(() => ({}))
    throw new Error(result.error || 'Unable to send consultant notification.')
  }

  return response.json()
}
