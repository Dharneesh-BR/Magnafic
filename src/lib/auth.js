const AUTH_KEY = 'magnafic-auth-user'

const personalEmailDomains = new Set([
  'gmail.com',
  'googlemail.com',
  'yahoo.com',
  'ymail.com',
  'outlook.com',
  'hotmail.com',
  'live.com',
  'msn.com',
  'icloud.com',
  'me.com',
  'mac.com',
  'aol.com',
  'proton.me',
  'protonmail.com',
  'zoho.com',
  'mail.com',
  'gmx.com',
  'rediffmail.com',
])

export function isProfessionalEmail(email = '') {
  const domain = email.trim().toLowerCase().split('@')[1]

  return Boolean(domain) && !personalEmailDomains.has(domain)
}

export function getAuthUser() {
  try {
    return JSON.parse(localStorage.getItem(AUTH_KEY))
  } catch {
    return null
  }
}

export function setAuthUser(user) {
  localStorage.setItem(AUTH_KEY, JSON.stringify(user))
  window.dispatchEvent(new Event('magnafic-auth-change'))
}

export function clearAuthUser() {
  localStorage.removeItem(AUTH_KEY)
  window.dispatchEvent(new Event('magnafic-auth-change'))
}
