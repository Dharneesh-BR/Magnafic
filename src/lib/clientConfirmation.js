const confirmationEndpoint = '/.netlify/functions/send-client-submission-confirmation'

export async function sendClientConfirmation({name, email, submissionType = 'client'}) {
  const response = await fetch(confirmationEndpoint, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
      name: String(name || '').trim(),
      email: String(email || '').trim(),
      submissionType,
    }),
  })

  if (!response.ok) {
    const result = await response.json().catch(() => ({}))
    throw new Error(result.error || 'Unable to send confirmation email.')
  }

  return response.json()
}
