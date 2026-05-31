import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, Briefcase, ChevronDown, Eye, EyeOff, Lock, Mail, User } from 'lucide-react'
import SEO from '../components/SEO'
import { isProfessionalEmail, loginUser, sendAccountPasswordReset } from '../lib/auth'

export default function Login() {
  const navigate = useNavigate()
  const [role, setRole] = useState('client')
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [resettingPassword, setResettingPassword] = useState(false)

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
      await loginUser({ email, password, fallbackRole: role })
      navigate('/dashboard')
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
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-3xl font-bold text-gray-900">Welcome Back</h1>
          <p className="text-gray-600">Login with your Business email ID</p>
        </div>

        <div className="rounded-3xl bg-white p-5 shadow-2xl shadow-primary-900/10 ring-1 ring-gray-100 sm:p-8">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Login as</label>
              <div className="relative">
                <select
                  value={role}
                  onChange={event => {
                    setRole(event.target.value)
                    setError('')
                    setMessage('')
                  }}
                  className="w-full appearance-none rounded-xl border border-gray-300 bg-white py-3 pl-12 pr-10 font-medium text-gray-900 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                >
                  <option value="client">Client</option>
                  <option value="consultant">Consultant</option>
                </select>
                {role === 'client' ? (
                  <User className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                ) : (
                  <Briefcase className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                )}
                <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              </div>
            </div>

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

            {role === 'consultant' && (
              <p className="rounded-xl bg-primary-50 px-4 py-3 text-sm font-medium text-primary-800">
                Consultant accounts are created by Magnafic. Use the email shared with the backend team and reset your password after receiving credentials.
              </p>
            )}

            {message && <p className="rounded-xl bg-green-50 px-4 py-3 text-sm font-medium text-green-700">{message}</p>}

            {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</p>}

            <button type="submit" disabled={submitting} className="flex w-full items-center justify-center rounded-xl bg-primary-600 py-3 font-semibold text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-70">
              {submitting ? 'Logging in...' : `Login as ${role === 'client' ? 'Client' : 'Consultant'}`}
              <ArrowRight className="ml-2 h-5 w-5" />
            </button>

            <button type="button" onClick={handlePasswordReset} disabled={resettingPassword} className="w-full rounded-xl border border-primary-200 py-3 font-semibold text-primary-700 transition hover:bg-primary-50 disabled:cursor-not-allowed disabled:opacity-70">
              {resettingPassword ? 'Sending reset link...' : 'Reset password'}
            </button>
          </form>

          <p className="mt-8 text-center text-gray-600">
            New client?{' '}
            <Link to="/signup" className="font-semibold text-primary-600 hover:text-primary-700">
              Create a client account
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
