import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, Building2, Mail, MapPin, Phone, User } from 'lucide-react'
import SEO from '../components/SEO'
import { isProfessionalEmail, signupClient } from '../lib/auth'
import { createProblemBriefFromStoredAnswers } from '../lib/dashboard'

function getSignupErrorMessage(error) {
  switch (error?.code) {
    case 'auth/email-already-in-use':
      return 'This email is already registered. Please log in or use a different professional email.'
    case 'auth/invalid-email':
      return 'Please enter a valid professional email address.'
    case 'auth/operation-not-allowed':
      return 'Email submission is not enabled right now. Please try again later.'
    case 'permission-denied':
      return 'Your details were submitted, but the profile could not be saved. Please check Firestore permissions.'
    default:
      return 'Unable to submit your details right now. Please check the details and try again.'
  }
}

export default function ClientSignup() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: '',
    company: '',
    city: '',
    phone: '',
    email: '',
  })
  const [error, setError] = useState('')
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
      setError('Please use your Business email ID. Personal email IDs are not allowed.')
      setSubmitting(false)
      return
    }

    try {
      await signupClient(form)
      try {
        await createProblemBriefFromStoredAnswers()
      } catch (briefError) {
        console.error('Problem brief creation failed:', briefError)
      }
      navigate('/dashboard')
    } catch (signupError) {
      console.error('Firebase signup failed:', signupError)
      setError(getSignupErrorMessage(signupError))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f7f9ff] px-4 pt-28 pb-16 sm:px-6 lg:px-8">
      <SEO title="Submit Details" description="Submit your details to Magnafic with a professional company email." path="/signup" noIndex />
      <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1fr_440px] lg:items-start">
        <section>
          <h1 className="max-w-5xl text-3xl leading-tight text-gray-950 sm:text-4xl md:text-5xl">
            Tell us more about you and your organization to route your request to the right team.
          </h1>
        </section>

        <section className="rounded-3xl bg-gradient-to-br from-[#000047] via-primary-700 to-cyan-400 p-1 shadow-2xl shadow-primary-900/10">
          <div className="rounded-[1.35rem] bg-white p-5 sm:p-8">
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
              <label className="mb-2 block text-sm font-medium text-gray-700">City</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  required
                  value={form.city}
                  onChange={event => updateField('city', event.target.value)}
                  className="w-full rounded-xl border border-gray-300 py-3 pl-12 pr-4 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                  placeholder="City"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Contact number</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  required
                  type="tel"
                  value={form.phone}
                  onChange={event => updateField('phone', event.target.value)}
                  className="w-full rounded-xl border border-gray-300 py-3 pl-12 pr-4 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                  placeholder="+91 98765 43210"
                />
              </div>
            </div>

            {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</p>}

            <button type="submit" disabled={submitting} className="flex w-full items-center justify-center rounded-xl bg-primary-600 py-3 font-semibold text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-70">
              {submitting ? 'Submitting...' : 'Submit'}
              <ArrowRight className="ml-2 h-5 w-5" />
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600">
            Already have access?{' '}
            <Link to="/login" className="font-semibold text-primary-600 hover:text-primary-700">
              Login
            </Link>
          </p>
          </div>
        </section>
      </div>
    </div>
  )
}
