import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, Briefcase, ChevronDown, Eye, EyeOff, Lock, Mail, User } from 'lucide-react'
import SEO from '../components/SEO'
import { isProfessionalEmail, setAuthUser } from '../lib/auth'

export default function Login() {
  const navigate = useNavigate()
  const [role, setRole] = useState('client')
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (event) => {
    event.preventDefault()

    if (!isProfessionalEmail(email)) {
      setError('Please login with your professional email ID. Personal email IDs are not allowed.')
      return
    }

    setAuthUser({ role, email })
    navigate('/')
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f7f9ff] px-4 pt-24 pb-16 sm:px-6 lg:px-8">
      <SEO title="Login" description="Log in to Magnafic." path="/login" noIndex />
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-3xl font-bold text-gray-900">Welcome Back</h1>
          <p className="text-gray-600">Login with your professional ID</p>
        </div>

        <div className="rounded-[2rem] bg-white p-8 shadow-2xl shadow-primary-900/10 ring-1 ring-gray-100">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Login as</label>
              <div className="relative">
                <select
                  value={role}
                  onChange={event => {
                    setRole(event.target.value)
                    setError('')
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
              <label className="mb-2 block text-sm font-medium text-gray-700">Professional email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  required
                  type="email"
                  value={email}
                  onChange={event => {
                    setEmail(event.target.value)
                    setError('')
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
                  onChange={event => setPassword(event.target.value)}
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
                Consultant accounts are created and managed through the Magnafic backend team.
              </p>
            )}

            {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</p>}

            <button type="submit" className="flex w-full items-center justify-center rounded-xl bg-primary-600 py-3 font-semibold text-white transition hover:bg-primary-700">
              Login as {role === 'client' ? 'Client' : 'Consultant'}
              <ArrowRight className="ml-2 h-5 w-5" />
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
