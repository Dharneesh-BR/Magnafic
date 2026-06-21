import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  Building2,
  Eye,
  EyeOff,
  Lock,
  Mail,
  MapPin,
  Phone,
  User,
} from 'lucide-react'
import SEO from '../components/SEO'
import { signupClient } from '../lib/auth'

function getSignupErrorMessage(error) {
  switch (error?.code) {
    case 'auth/email-already-in-use':
      return 'This email is already registered. Please log in instead.'
    case 'auth/invalid-email':
      return 'Please enter a valid email address.'
    case 'auth/weak-password':
      return 'Use a stronger password with at least 6 characters.'
    case 'auth/operation-not-allowed':
      return 'Client account registration is not enabled right now.'
    case 'permission-denied':
      return 'Your account was created, but the profile could not be saved. Please contact Magnafic.'
    default:
      return 'Unable to create your account right now. Please check the details and try again.'
  }
}

export default function ClientAccountSignup() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: '',
    company: '',
    city: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }))
    setError('')
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')

    if (form.password.length < 6) {
      setError('Use a password with at least 6 characters.')
      return
    }

    if (form.password !== form.confirmPassword) {
      setError('Password and confirm password do not match.')
      return
    }

    setSubmitting(true)

    try {
      await signupClient({
        name: form.name.trim(),
        company: form.company.trim(),
        city: form.city.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        password: form.password,
      })
      navigate('/dashboard')
    } catch (signupError) {
      console.error('Client account signup failed:', signupError)
      setError(getSignupErrorMessage(signupError))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f7f9ff] px-4 pb-16 pt-28 sm:px-6 lg:px-8">
      <SEO title="Client Signup" description="Create your Magnafic client account." path="/client-signup" noIndex />

      <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1fr_460px] lg:items-center">
        <section className="text-center lg:text-left">
          <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-primary-600">Client Access</p>
          <h1 className="mt-3 text-3xl font-extrabold leading-tight text-[#000047] sm:text-4xl md:text-5xl">
            Create your Magnafic client account
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base font-medium leading-7 text-gray-600 lg:mx-0 sm:text-lg">
            Register once to access Magnafic client experiences and the upcoming client Copilot workspace.
          </p>
        </section>

        <section className="rounded-lg bg-gradient-to-br from-[#000047] via-primary-700 to-cyan-400 p-[2px] shadow-2xl shadow-primary-900/10">
          <div className="rounded-[6px] bg-white p-5 sm:p-8">
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">Full name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <input
                    required
                    value={form.name}
                    onChange={(event) => updateField('name', event.target.value)}
                    className="w-full rounded-lg border border-gray-300 py-3 pl-12 pr-4 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                    placeholder="Your name"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">Company</label>
                <div className="relative">
                  <Building2 className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <input
                    required
                    value={form.company}
                    onChange={(event) => updateField('company', event.target.value)}
                    className="w-full rounded-lg border border-gray-300 py-3 pl-12 pr-4 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                    placeholder="Company name"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">City</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                    <input
                      required
                      value={form.city}
                      onChange={(event) => updateField('city', event.target.value)}
                      className="w-full rounded-lg border border-gray-300 py-3 pl-12 pr-4 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                      placeholder="City"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">Contact number</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                    <input
                      required
                      type="tel"
                      value={form.phone}
                      onChange={(event) => updateField('phone', event.target.value)}
                      className="w-full rounded-lg border border-gray-300 py-3 pl-12 pr-4 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                      placeholder="Contact number"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">Email ID</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <input
                    required
                    type="text"
                    value={form.email}
                    onChange={(event) => updateField('email', event.target.value)}
                    className="w-full rounded-lg border border-gray-300 py-3 pl-12 pr-4 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                    placeholder="name@company.com"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <input
                    required
                    type={showPassword ? 'text' : 'password'}
                    value={form.password}
                    onChange={(event) => updateField('password', event.target.value)}
                    className="w-full rounded-lg border border-gray-300 py-3 pl-12 pr-12 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                    placeholder="Create password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 transition hover:text-gray-600"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">Confirm password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <input
                    required
                    type={showPassword ? 'text' : 'password'}
                    value={form.confirmPassword}
                    onChange={(event) => updateField('confirmPassword', event.target.value)}
                    className="w-full rounded-lg border border-gray-300 py-3 pl-12 pr-4 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                    placeholder="Confirm password"
                  />
                </div>
              </div>

              {error && <p className="rounded-lg bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</p>}

              <button
                type="submit"
                disabled={submitting}
                className="flex w-full items-center justify-center rounded-lg bg-[#000047] py-3 font-bold text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {submitting ? 'Creating account...' : 'Create client account'}
                <ArrowRight className="ml-2 h-5 w-5" />
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="font-bold text-primary-600 hover:text-primary-700">
                Login
              </Link>
            </p>
          </div>
        </section>
      </div>
    </div>
  )
}
