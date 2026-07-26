import { lmsAuth } from './lmsFirebase'

const configuredApiUrl = import.meta.env.VITE_LMS_API_URL
const LMS_API_URL = (configuredApiUrl || (import.meta.env.PROD ? '/.netlify/functions/lms-proxy' : 'http://localhost:4000')).replace(/\/$/, '')

async function request(path, options, forceRefreshToken) {
  const headers = new Headers(options.headers)
  const token = lmsAuth?.currentUser
    ? await lmsAuth.currentUser.getIdToken(forceRefreshToken)
    : null

  headers.set('Content-Type', 'application/json')
  if (token) headers.set('Authorization', `Bearer ${token}`)

  const requestUrl = LMS_API_URL.startsWith('/.netlify/functions/')
    ? `${LMS_API_URL}?path=${encodeURIComponent(path)}`
    : `${LMS_API_URL}${path}`
  return fetch(requestUrl, {
    ...options,
    headers,
  })
}

export async function lmsApi(path, options = {}) {
  let response = await request(path, options, false)
  if (response.status === 401 && lmsAuth?.currentUser) {
    response = await request(path, options, true)
  }

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}))
    const error = new Error(payload.error || 'The learning service is unavailable.')
    error.status = response.status
    throw error
  }

  return response.json()
}

export async function lmsDownload(path, fileName) {
  let response = await request(path, { method: 'GET' }, false)
  if (response.status === 401 && lmsAuth?.currentUser) {
    response = await request(path, { method: 'GET' }, true)
  }
  if (!response.ok) {
    const payload = await response.json().catch(() => ({}))
    throw new Error(payload.error || 'Unable to download the certificate.')
  }

  const blobUrl = URL.createObjectURL(await response.blob())
  const anchor = document.createElement('a')
  anchor.href = blobUrl
  anchor.download = fileName
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  URL.revokeObjectURL(blobUrl)
}

export async function shareCertificateOnLinkedIn(certificate) {
  const shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(certificate.shareUrl)}`
  const shareWindow = window.open(
    shareUrl,
    'magnafic-linkedin-certificate-share',
    'width=720,height=720,resizable=yes,scrollbars=yes',
  )
  if (!shareWindow) {
    throw new Error('Allow pop-ups for Magnafic to share your certificate on LinkedIn.')
  }
  shareWindow.opener = null

  const result = await lmsApi(
    `/api/certificates/${certificate.certificateNumber}/linkedin-share`,
    { method: 'POST' },
  )
  return result.certificate
}
