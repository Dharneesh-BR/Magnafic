import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, CheckCircle2, Eye, EyeOff, Lock, Mail } from 'lucide-react'
import SEO from '../components/SEO'
import { isProfessionalEmail, loginUser, sendAccountPasswordReset } from '../lib/auth'

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
  const [resettingPassword, setResettingPassword] = useState(false)

  useEffect(() => () => {
    if (redirectTimerRef.current) window.clearTimeout(redirectTimerRef.current)
  }, [])

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSubmitting(true)
    setError('')
    setMessage('')

    if (!isProfessionalEmail(email)) {
      setError('Please login with your professional email ID. Personal email IDs are not allowed.')
      setSubmitting(false)
      return
    }

    try {
      await loginUser({ email, password, fallbackRole: 'consultant' })
      setLoginComplete(true)
      setMessage('Thank you. You have logged in successfully.')
      redirectTimerRef.current = window.setTimeout(() => {
        navigate('/dashboard')
      }, 1400)
    } catch (loginError) {
      console.error('Firebase login failed:', loginError)
      setError('Unable to login. Please check your email and password.')
    } finally {
      setSubmitting(false)
    }
  }

  const handlePasswordReset = async () => {
    setError('')
    setMessage('')

    if (!isProfessionalEmail(email)) {
      setError('Enter your professional email ID first, then request a password reset.')
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
          <p className="text-gray-600">Login with your Business email ID</p>
        </div>

        <div className="rounded-3xl bg-white p-5 shadow-2xl shadow-primary-900/10 ring-1 ring-gray-100 sm:p-8">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Business email Id</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  required
                  type="email"
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
            Need to share your details?{' '}
            <Link to="/signup" className="font-semibold text-primary-600 hover:text-primary-700">
              Open the form
            </Link>
          </p>
        </div>
        </>
        )}
      </div>
    </div>
  )
}
