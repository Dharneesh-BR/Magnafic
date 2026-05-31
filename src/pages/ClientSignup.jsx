import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, Building2, CheckCircle2, Lock, Mail, User, Eye, EyeOff, X } from 'lucide-react'
import SEO from '../components/SEO'
import { isProfessionalEmail, signupClient } from '../lib/auth'

function getSignupErrorMessage(error) {
  switch (error?.code) {
    case 'auth/email-already-in-use':
      return 'An account already exists with this email. Please log in or use a different professional email.'
    case 'auth/invalid-email':
      return 'Please enter a valid professional email address.'
    case 'auth/weak-password':
      return 'Please use a stronger password with at least 8 characters.'
    case 'auth/operation-not-allowed':
      return 'Email signup is not enabled in Firebase Authentication. Please enable Email/Password sign-in in Firebase.'
    case 'permission-denied':
      return 'Your account was created, but the profile could not be saved. Please check Firestore permissions.'
    default:
      return 'Unable to create your account right now. Please check the details and try again.'
  }
}

export default function ClientSignup() {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [form, setForm] = useState({
    name: '',
    company: '',
    email: '',
    password: '',
  })
  const [error, setError] = useState('')
  const [signupComplete, setSignupComplete] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const updateField = (field, value) => {
    setForm(current => ({ ...current, [field]: value }))
    setError('')
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSubmitting(true)
    setError('')

    if (!isProfessionalEmail(form.email)) {
      setError('Please use your professional company email. Personal email IDs are not allowed for client signup.')
      setSubmitting(false)
      return
    }

    try {
      await signupClient(form)
      setSignupComplete(true)
    } catch (signupError) {
      console.error('Firebase signup failed:', signupError)
      setError(getSignupErrorMessage(signupError))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f7f9ff] px-4 pt-28 pb-16 sm:px-6 lg:px-8">
      <SEO title="Client Signup" description="Create a Magnafic client account with a professional company email." path="/signup" noIndex />
      {signupComplete ? (
        <div className="relative mx-auto max-w-xl rounded-3xl bg-white p-8 text-center shadow-2xl shadow-primary-900/10 ring-1 ring-gray-100">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="absolute right-4 top-4 rounded-full p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
            aria-label="Close message and go to dashboard"
          >
            <X className="h-5 w-5" />
          </button>
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-green-50">
            <CheckCircle2 className="h-9 w-9 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-950">Thank you</h1>
          <p className="mt-3 text-gray-600">
            Your account has been created successfully. Our team will contact you shortly.
          </p>
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="mt-8 inline-flex items-center justify-center rounded-full bg-primary-600 px-6 py-3 font-semibold text-white transition hover:bg-primary-700"
          >
            Go to dashboard
            <ArrowRight className="ml-2 h-5 w-5" />
          </button>
        </div>
      ) : (
      <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1fr_440px] lg:items-center">
        <section>
          <span className="mb-5 inline-flex rounded-full bg-primary-50 px-4 py-2 text-sm font-semibold text-primary-700">
            Client access
          </span>
          <h1 className="max-w-3xl text-3xl font-bold leading-tight text-gray-950 sm:text-4xl md:text-6xl">
            Create your client account with a verified Business email ID
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-gray-600">
            Client signup is limited to business email addresses so project briefs, expert matching, and workspace access stay tied to verified organizations.
          </p>
        </section>

        <section className="rounded-3xl bg-white p-5 shadow-2xl shadow-primary-900/10 ring-1 ring-gray-100 sm:p-8">
          <h2 className="mb-2 text-2xl font-bold text-gray-950">Client signup</h2>
          <p className="mb-8 text-sm text-gray-500">Consultant access is managed by the Magnafic backend team.</p>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Full name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  required
                  value={form.name}
                  onChange={event => updateField('name', event.target.value)}
                  className="w-full rounded-xl border border-gray-300 py-3 pl-12 pr-4 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                  placeholder="Your name"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Company</label>
              <div className="relative">
                <Building2 className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  required
                  value={form.company}
                  onChange={event => updateField('company', event.target.value)}
                  className="w-full rounded-xl border border-gray-300 py-3 pl-12 pr-4 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                  placeholder="Company name"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Business email Id</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  required
                  type="email"
                  value={form.email}
                  onChange={event => updateField('email', event.target.value)}
                  className="w-full rounded-xl border border-gray-300 py-3 pl-12 pr-4 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                  placeholder="name@company.com"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  required
                  minLength={8}
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={event => updateField('password', event.target.value)}
                  className="w-full rounded-xl border border-gray-300 py-3 pl-12 pr-12 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                  placeholder="Minimum 8 characters"
                />
                <button type="button" onClick={() => setShowPassword(value => !value)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</p>}

            <button type="submit" disabled={submitting} className="flex w-full items-center justify-center rounded-xl bg-primary-600 py-3 font-semibold text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-70">
              {submitting ? 'Creating account...' : 'Create client account'}
              <ArrowRight className="ml-2 h-5 w-5" />
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-primary-600 hover:text-primary-700">
              Login
            </Link>
          </p>
        </section>
      </div>
      )}
    </div>
  )
}
