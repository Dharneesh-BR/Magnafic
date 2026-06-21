import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, CheckCircle2, Eye, EyeOff, Lock, Mail } from 'lucide-react'
import SEO from '../components/SEO'
import { loginUser, loginWithGoogle, sendAccountPasswordReset } from '../lib/auth'

export default function Login() {
  const navigate = useNavigate()
  const redirectTimerRef = useRef(null)
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [loginComplete, setLoginComplete] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [googleSubmitting, setGoogleSubmitting] = useState(false)
  const [resettingPassword, setResettingPassword] = useState(false)

  useEffect(() => () => {
    if (redirectTimerRef.current) window.clearTimeout(redirectTimerRef.current)
  }, [])

  const completeLogin = () => {
    setLoginComplete(true)
    setMessage('Thank you. You have logged in successfully.')
    redirectTimerRef.current = window.setTimeout(() => {
      navigate('/dashboard')
    }, 1400)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSubmitting(true)
    setError('')
    setMessage('')

    try {
      await loginUser({ email, password, fallbackRole: 'client' })
      completeLogin()
    } catch (loginError) {
      console.error('Firebase login failed:', loginError)
      setError('Unable to login. Please check your email and password.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleGoogleLogin = async () => {
    setGoogleSubmitting(true)
    setError('')
    setMessage('')

    try {
      await loginWithGoogle()
      completeLogin()
    } catch (loginError) {
      console.error('Google login failed:', loginError)

      if (loginError?.code === 'auth/popup-closed-by-user' || loginError?.code === 'auth/cancelled-popup-request') {
        setError('Google login was cancelled. Please try again.')
      } else if (loginError?.code === 'auth/popup-blocked') {
        setError('The Google login popup was blocked. Please allow popups and try again.')
      } else if (loginError?.code === 'auth/account-exists-with-different-credential') {
        setError('This email already uses password login. Log in with your password first.')
      } else {
        setError('Unable to log in with Google right now. Please try again.')
      }
    } finally {
      setGoogleSubmitting(false)
    }
  }

  const handlePasswordReset = async () => {
    setError('')
    setMessage('')

    if (!email.trim()) {
      setError('Enter your email ID first, then request a password reset.')
      return
    }

    setResettingPassword(true)

    try {
      await sendAccountPasswordReset(email)
      setMessage('Password reset link sent. Please check your email inbox.')
    } catch (resetError) {
      console.error('Firebase password reset failed:', resetError)
      setError('Unable to send a password reset link. Please confirm the account email with Magnafic.')
    } finally {
      setResettingPassword(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f7f9ff] px-4 pt-24 pb-16 sm:px-6 lg:px-8">
      <SEO title="Login" description="Log in to Magnafic." path="/login" noIndex />
      <div className="w-full max-w-md">
        {loginComplete ? (
          <div className="rounded-3xl bg-white p-8 text-center shadow-2xl shadow-primary-900/10 ring-1 ring-gray-100">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-green-50">
              <CheckCircle2 className="h-9 w-9 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-950">Thank you</h1>
            <p className="mt-3 text-gray-600">Your login is complete. Redirecting you to your dashboard...</p>
          </div>
        ) : (
        <>
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-3xl font-bold text-gray-900">Login</h1>
          <p className="text-gray-600">Login with your email ID</p>
        </div>

        <div className="rounded-3xl bg-white p-5 shadow-2xl shadow-primary-900/10 ring-1 ring-gray-100 sm:p-8">
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={googleSubmitting || submitting}
            className="flex w-full items-center justify-center gap-3 rounded-xl border border-gray-300 bg-white py-3 font-semibold text-gray-800 transition hover:border-primary-300 hover:bg-primary-50 disabled:cursor-not-allowed disabled:opacity-70"
          >
            <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5">
              <path fill="#4285F4" d="M21.6 12.23c0-.71-.06-1.4-.18-2.07H12v3.92h5.38a4.6 4.6 0 0 1-2 3.02v2.54h3.24c1.9-1.75 2.98-4.33 2.98-7.41Z" />
              <path fill="#34A853" d="M12 22c2.7 0 4.97-.9 6.62-2.36l-3.24-2.54c-.9.6-2.05.96-3.38.96-2.61 0-4.82-1.76-5.61-4.13H3.04v2.62A10 10 0 0 0 12 22Z" />
              <path fill="#FBBC05" d="M6.39 13.93A6.02 6.02 0 0 1 6.07 12c0-.67.12-1.32.32-1.93V7.45H3.04A10 10 0 0 0 2 12c0 1.61.39 3.14 1.04 4.55l3.35-2.62Z" />
              <path fill="#EA4335" d="M12 5.94c1.47 0 2.79.51 3.83 1.5l2.87-2.88A9.64 9.64 0 0 0 12 2a10 10 0 0 0-8.96 5.45l3.35 2.62C7.18 7.7 9.39 5.94 12 5.94Z" />
            </svg>
            {googleSubmitting ? 'Connecting to Google...' : 'Continue with Google'}
          </button>

          <div className="my-6 flex items-center gap-3">
            <span className="h-px flex-1 bg-gray-200" />
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">or</span>
            <span className="h-px flex-1 bg-gray-200" />
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Email ID</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  required
                  type="text"
                  value={email}
                  onChange={event => {
                    setEmail(event.target.value)
                    setError('')
                    setMessage('')
                  }}
                  placeholder="name@company.com"
                  className="w-full rounded-xl border border-gray-300 py-3 pl-12 pr-4 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  required
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={event => {
                    setPassword(event.target.value)
                    setError('')
                    setMessage('')
                  }}
                  placeholder="Password"
                  className="w-full rounded-xl border border-gray-300 py-3 pl-12 pr-12 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                />
                <button type="button" onClick={() => setShowPassword(value => !value)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {message && <p className="rounded-xl bg-green-50 px-4 py-3 text-sm font-medium text-green-700">{message}</p>}

            {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</p>}

            <button type="submit" disabled={submitting} className="flex w-full items-center justify-center rounded-xl bg-primary-600 py-3 font-semibold text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-70">
              {submitting ? 'Logging in...' : 'Login'}
              <ArrowRight className="ml-2 h-5 w-5" />
            </button>

            <button type="button" onClick={handlePasswordReset} disabled={resettingPassword} className="w-full rounded-xl border border-primary-200 py-3 font-semibold text-primary-700 transition hover:bg-primary-50 disabled:cursor-not-allowed disabled:opacity-70">
              {resettingPassword ? 'Sending reset link...' : 'Reset password'}
            </button>
          </form>

          <p className="mt-8 text-center text-gray-600">
            New client?{' '}
            <Link to="/client-signup" className="font-semibold text-primary-600 hover:text-primary-700">
              Create an account
            </Link>
          </p>
        </div>
        </>
        )}
      </div>
    </div>
  )
}
