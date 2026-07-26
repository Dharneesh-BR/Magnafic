import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
} from 'firebase/auth'
import { Chrome, Mail, ShieldCheck } from 'lucide-react'
import SEO from '../components/SEO'
import { isLmsFirebaseConfigured, lmsAuth } from '../lib/lmsFirebase'

function authMessage(error) {
  const code = error?.code || ''
  if (code === 'auth/invalid-credential') return 'The email or password is incorrect.'
  if (code === 'auth/email-already-in-use') return 'An account already exists for this email.'
  if (code === 'auth/popup-closed-by-user') return 'Google sign-in was cancelled.'
  if (code === 'auth/operation-not-allowed') return 'This sign-in method is not enabled yet.'
  return error?.message || 'Unable to sign in.'
}

export default function LmsLogin() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const requestedReturnTo = searchParams.get('returnTo') || '/programs/dashboard'
  const returnTo = requestedReturnTo.startsWith('/programs/') ? requestedReturnTo : '/programs/dashboard'

  const complete = async (action) => {
    if (!lmsAuth) return
    setSubmitting(true)
    setError('')
    try {
      await action()
      navigate(returnTo, { replace: true })
    } catch (signInError) {
      setError(authMessage(signInError))
    } finally {
      setSubmitting(false)
    }
  }

  const submit = (event) => {
    event.preventDefault()
    complete(() => mode === 'login'
      ? signInWithEmailAndPassword(lmsAuth, email, password)
      : createUserWithEmailAndPassword(lmsAuth, email, password))
  }

  return (
    <div className="min-h-screen bg-[#f7f9ff] px-4 pb-16 pt-28 sm:px-6 lg:px-8">
      <SEO title="Learner Login | Magnafic" description="Sign in to continue your Magnafic courses." path="/programs/login" noIndex />
      <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[minmax(0,1fr)_430px] lg:items-center">
        <section>
          <p className="text-sm font-black uppercase tracking-[0.2em] text-primary-600">Magnafic learner access</p>
          <h1 className="mt-3 text-4xl font-black leading-tight text-gray-950 sm:text-5xl">Continue learning where you stopped</h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-gray-600">Access purchased programs, private Vimeo lessons, and progress synced across devices.</p>
          <div className="mt-7 space-y-3 text-sm font-semibold text-gray-700">
            <p className="flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-primary-600" />Secure lesson access</p>
            <p className="flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-primary-600" />Automatic video resume and completion tracking</p>
          </div>
        </section>

        <form onSubmit={submit} className="rounded-3xl bg-white p-6 shadow-xl shadow-primary-900/10 ring-1 ring-primary-100 sm:p-8">
          <div className="mb-6 grid grid-cols-2 rounded-xl bg-primary-50 p-1">
            {['login', 'signup'].map((item) => (
              <button key={item} type="button" onClick={() => setMode(item)} className={`rounded-lg px-3 py-2 text-sm font-bold capitalize ${mode === item ? 'bg-white text-primary-700 shadow-sm' : 'text-gray-500'}`}>{item}</button>
            ))}
          </div>
          {!isLmsFirebaseConfigured && <p className="mb-4 rounded-xl bg-amber-50 p-3 text-sm font-semibold text-amber-800">Learner authentication environment variables are not configured.</p>}
          <label className="text-sm font-bold text-gray-800" htmlFor="learner-email">Email</label>
          <input id="learner-email" type="email" required value={email} onChange={(event) => setEmail(event.target.value)} className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100" />
          <label className="mt-5 block text-sm font-bold text-gray-800" htmlFor="learner-password">Password</label>
          <input id="learner-password" type="password" required minLength={6} value={password} onChange={(event) => setPassword(event.target.value)} className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100" />
          {error && <p className="mt-4 text-sm font-semibold text-red-600">{error}</p>}
          <button type="submit" disabled={submitting || !isLmsFirebaseConfigured} className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary-600 px-4 py-3 font-bold text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50">
            <Mail className="h-4 w-4" />{submitting ? 'Please wait...' : mode === 'login' ? 'Login' : 'Create learner account'}
          </button>
          <button type="button" disabled={submitting || !isLmsFirebaseConfigured} onClick={() => complete(() => signInWithPopup(lmsAuth, new GoogleAuthProvider()))} className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 font-bold text-gray-800 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50">
            <Chrome className="h-4 w-4" />Continue with Google
          </button>
          <Link to="/programs" className="mt-5 block text-center text-sm font-bold text-primary-600 hover:text-primary-700">Back to Programs</Link>
        </form>
      </div>
    </div>
  )
}
