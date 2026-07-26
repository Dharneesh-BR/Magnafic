import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { isLmsFirebaseConfigured, lmsAuth } from './lmsFirebase'
import { lmsApi } from './lmsApi'

const LmsAuthContext = createContext({
  user: null,
  loading: true,
  configured: isLmsFirebaseConfigured,
})

export function LmsAuthProvider({ children }) {
  const [user, setUser] = useState(lmsAuth?.currentUser || null)
  const [loading, setLoading] = useState(Boolean(lmsAuth))

  useEffect(() => {
    if (!lmsAuth) {
      setLoading(false)
      return undefined
    }

    return onAuthStateChanged(lmsAuth, async (firebaseUser) => {
      setUser(firebaseUser)
      if (firebaseUser) {
        await lmsApi('/api/auth/verify', { method: 'POST' }).catch(() => null)
      }
      setLoading(false)
    })
  }, [])

  const value = useMemo(() => ({
    user,
    loading,
    configured: isLmsFirebaseConfigured,
  }), [loading, user])

  return <LmsAuthContext.Provider value={value}>{children}</LmsAuthContext.Provider>
}

export function useLmsAuth() {
  return useContext(LmsAuthContext)
}
