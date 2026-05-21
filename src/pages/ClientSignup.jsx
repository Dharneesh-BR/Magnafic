import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, Building2, Lock, Mail, User, Eye, EyeOff } from 'lucide-react'
import SEO from '../components/SEO'
import { isProfessionalEmail, setAuthUser } from '../lib/auth'

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

  const updateField = (field, value) => {
    setForm(current => ({ ...current, [field]: value }))
    setError('')
  }

  const handleSubmit = (event) => {
    event.preventDefault()

    if (!isProfessionalEmail(form.email)) {
      setError('Please use your professional company email. Personal email IDs are not allowed for client signup.')
      return
    }

    setAuthUser({
      role: 'client',
      name: form.name,
      company: form.company,
      email: form.email,
    })
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-[#f7f9ff] px-4 pt-28 pb-16 sm:px-6 lg:px-8">
      <SEO title="Client Signup" description="Create a Magnafic client account with a professional company email." path="/signup" noIndex />
      <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1fr_440px] lg:items-center">
        <section>
          <span className="mb-5 inline-flex rounded-full bg-primary-50 px-4 py-2 text-sm font-semibold text-primary-700">
            Client access
          </span>
          <h1 className="max-w-3xl text-4xl font-bold leading-tight text-gray-950 md:text-6xl">
            Create your client account with a verified professional ID
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-gray-600">
            Client signup is limited to business email addresses so project briefs, expert matching, and workspace access stay tied to verified organizations.
          </p>
        </section>

        <section className="rounded-[2rem] bg-white p-8 shadow-2xl shadow-primary-900/10 ring-1 ring-gray-100">
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
              <label className="mb-2 block text-sm font-medium text-gray-700">Professional email</label>
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

            <button type="submit" className="flex w-full items-center justify-center rounded-xl bg-primary-600 py-3 font-semibold text-white transition hover:bg-primary-700">
              Create client account
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
    </div>
  )
}
