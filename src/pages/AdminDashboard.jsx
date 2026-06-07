import { useEffect, useMemo, useState } from 'react'
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth'
import { collection, deleteDoc, doc, getDoc, onSnapshot } from 'firebase/firestore'
import { AlertCircle, BriefcaseBusiness, ChevronDown, LayoutDashboard, Eye, EyeOff, Loader2, Lock, LogOut, Mail, ShieldCheck, Trash2, Users } from 'lucide-react'
import SEO from '../components/SEO'
import { auth, db } from '../lib/firebase'
import { mentorClient } from '../lib/sanityClient'

function formatDateTime(value) {
  const date = value?.toDate?.() || value
  if (!date) return 'Not available'

  return new Intl.DateTimeFormat('en', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

function normalizeDocument(documentSnapshot) {
  return {
    id: documentSnapshot.id,
    ...documentSnapshot.data(),
  }
}

async function getAdminProfile(firebaseUser) {
  if (!firebaseUser) return null

  const profileSnapshot = await getDoc(doc(db, 'users', firebaseUser.uid))
  if (!profileSnapshot.exists()) return null

  const profile = profileSnapshot.data()
  if (profile.role !== 'admin' && profile.isAdmin !== true) return null

  return {
    id: profileSnapshot.id,
    uid: firebaseUser.uid,
    email: firebaseUser.email,
    ...profile,
  }
}

function getAdminError(error) {
  if (error?.code === 'permission-denied') {
    return 'Firestore permissions are blocking admin dashboard data. Allow admin users to read users and clientBriefs.'
  }

  return error?.message || 'Unable to load admin dashboard right now.'
}

export default function AdminDashboard() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [adminProfile, setAdminProfile] = useState(null)
  const [checkingAuth, setCheckingAuth] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [usersData, setUsersData] = useState([])
  const [briefs, setBriefs] = useState([])
  const [capabilitiesByExpertId, setCapabilitiesByExpertId] = useState({})
  const [dataLoading, setDataLoading] = useState(false)
  const [dataError, setDataError] = useState('')
  const [activeView, setActiveView] = useState('dashboard')
  const [openClientBriefId, setOpenClientBriefId] = useState('')
  const [removingClientId, setRemovingClientId] = useState('')

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setCheckingAuth(true)
      setError('')

      try {
        const profile = await getAdminProfile(firebaseUser)
        setAdminProfile(profile)
      } catch (authError) {
        console.error('Admin validation failed:', authError)
        setAdminProfile(null)
        setError(getAdminError(authError))
      } finally {
        setCheckingAuth(false)
      }
    })

    return unsubscribe
  }, [])

  useEffect(() => {
    if (!adminProfile) return undefined

    setDataLoading(true)
    setDataError('')

    const unsubscribes = [
      onSnapshot(
        collection(db, 'users'),
        (snapshot) => {
          setUsersData(snapshot.docs.map(normalizeDocument))
          setDataLoading(false)
        },
        (snapshotError) => {
          setDataError(getAdminError(snapshotError))
          setDataLoading(false)
        }
      ),
      onSnapshot(
        collection(db, 'clientBriefs'),
        (snapshot) => {
          setBriefs(snapshot.docs.map(normalizeDocument))
          setDataLoading(false)
        },
        (snapshotError) => {
          setDataError(getAdminError(snapshotError))
          setDataLoading(false)
        }
      ),
    ]

    return () => unsubscribes.forEach((unsubscribe) => unsubscribe())
  }, [adminProfile])

  useEffect(() => {
    if (!adminProfile) return

    const fetchConsultantCapabilities = async () => {
      try {
        const capabilities = await mentorClient.fetch(`*[_type == "capabilities"] | order(coalesce(displayOrder, 9999) asc, title asc) {
          _id,
          title,
          "slug": slug.current,
          orderedExperts[]->{
            _id,
            fullName
          }
        }`)

        const nextCapabilitiesByExpertId = {}
        ;(capabilities || []).forEach((capability) => {
          ;(capability.orderedExperts || []).forEach((expert) => {
            if (!expert?._id) return

            if (!nextCapabilitiesByExpertId[expert._id]) {
              nextCapabilitiesByExpertId[expert._id] = []
            }

            nextCapabilitiesByExpertId[expert._id].push({
              id: capability._id,
              title: capability.title,
              slug: capability.slug,
            })
          })
        })

        setCapabilitiesByExpertId(nextCapabilitiesByExpertId)
      } catch (capabilityError) {
        console.error('Admin capability lookup failed:', capabilityError)
        setDataError('Admin dashboard loaded, but consultant capabilities could not be fetched from Sanity.')
      }
    }

    fetchConsultantCapabilities()
  }, [adminProfile])

  const stats = useMemo(() => ({
    users: usersData.length,
    clients: usersData.filter((item) => item.role === 'client').length,
    consultants: usersData.filter((item) => item.role === 'consultant').length,
    briefs: briefs.length,
  }), [briefs.length, usersData])

  const sortedBriefs = useMemo(() => [...briefs].sort((a, b) => {
    const aTime = a.createdAt?.toDate?.()?.getTime?.() || 0
    const bTime = b.createdAt?.toDate?.()?.getTime?.() || 0
    return bTime - aTime
  }), [briefs])

  const consultants = useMemo(() => usersData
    .filter((item) => item.role === 'consultant')
    .sort((a, b) => (a.name || a.email || '').localeCompare(b.name || b.email || ''))
    .map((consultant) => {
      const attachedBriefs = briefs.filter((brief) => (
        brief.assignedConsultantId === consultant.id ||
        (
          consultant.sanityExpertId &&
          Array.isArray(brief.matchedExpertIds) &&
          brief.matchedExpertIds.includes(consultant.sanityExpertId)
        )
      ))

      return {
        ...consultant,
        capabilities: consultant.sanityExpertId ? capabilitiesByExpertId[consultant.sanityExpertId] || [] : [],
        attachedBriefs,
      }
    }), [briefs, capabilitiesByExpertId, usersData])

  const clients = useMemo(() => usersData
    .filter((item) => item.role === 'client')
    .sort((a, b) => (a.name || a.email || '').localeCompare(b.name || b.email || ''))
    .map((client) => ({
      ...client,
      attachedBriefs: briefs.filter((brief) => brief.clientId === client.id || brief.clientEmail === client.email),
    })), [briefs, usersData])

  const handleLogin = async (event) => {
    event.preventDefault()
    setSubmitting(true)
    setError('')

    try {
      const credentials = await signInWithEmailAndPassword(auth, email, password)
      const profile = await getAdminProfile(credentials.user)

      if (!profile) {
        await signOut(auth)
        setError('This account is not authorized for admin access.')
        return
      }

      setAdminProfile(profile)
    } catch (loginError) {
      console.error('Admin login failed:', loginError)
      setError('Unable to log in as admin. Check the credentials and Firestore admin role.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleLogout = async () => {
    await signOut(auth)
    setAdminProfile(null)
    setEmail('')
    setPassword('')
  }

  const handleRemoveClient = async (client) => {
    const confirmed = window.confirm(`Remove ${client.name || client.email || 'this client'} and their attached briefs from Firestore?`)
    if (!confirmed) return

    setRemovingClientId(client.id)
    setDataError('')

    try {
      await Promise.all([
        ...client.attachedBriefs.map((brief) => deleteDoc(doc(db, 'clientBriefs', brief.id))),
        deleteDoc(doc(db, 'users', client.id)),
      ])
    } catch (removeError) {
      console.error('Admin client removal failed:', removeError)
      setDataError(getAdminError(removeError))
    } finally {
      setRemovingClientId('')
    }
  }

  if (checkingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7f9ff] px-4">
        <SEO title="Admin" description="Magnafic admin dashboard." path="/admin" noIndex />
        <div className="flex items-center gap-3 rounded-2xl bg-white px-5 py-4 font-semibold text-primary-700 shadow-xl shadow-primary-900/5">
          <Loader2 className="h-5 w-5 animate-spin" />
          Checking admin access...
        </div>
      </div>
    )
  }

  if (!adminProfile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7f9ff] px-4 py-12">
        <SEO title="Admin Login" description="Magnafic admin login." path="/admin" noIndex />
        <section className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl shadow-primary-900/10 ring-1 ring-gray-100">
          <div className="mb-6 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-50 text-primary-700">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h1 className="text-2xl font-bold text-gray-950">Admin access</h1>
            <p className="mt-2 text-sm text-gray-500">Sign in to continue to the dashboard.</p>
          </div>

          <form className="space-y-4" onSubmit={handleLogin}>
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value)
                    setError('')
                  }}
                  className="w-full rounded-xl border border-gray-300 py-3 pl-12 pr-4 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                  placeholder="admin@company.com"
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
                  value={password}
                  onChange={(event) => {
                    setPassword(event.target.value)
                    setError('')
                  }}
                  className="w-full rounded-xl border border-gray-300 py-3 pl-12 pr-12 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                  placeholder="Password"
                />
                <button type="button" onClick={() => setShowPassword(value => !value)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {error && (
              <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</p>
            )}

            <button type="submit" disabled={submitting} className="flex w-full items-center justify-center rounded-xl bg-primary-600 py-3 font-semibold text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-70">
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Validating...
                </>
              ) : (
                'Open dashboard'
              )}
            </button>
          </form>
        </section>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f7f9ff] px-4 py-8 sm:px-6 lg:px-8">
      <SEO title="Admin Dashboard" description="Magnafic admin dashboard." path="/admin" noIndex />
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary-600">Magnafic Admin</p>
            <h1 className="mt-3 text-3xl font-bold text-gray-950 sm:text-4xl">Dashboard</h1>
            <p className="mt-2 text-gray-600">Signed in as {adminProfile.email}</p>
          </div>
          <button type="button" onClick={handleLogout} className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-800 transition hover:bg-gray-50">
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </button>
        </header>

        {dataError && (
          <div className="mb-6 flex gap-3 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
            <p>{dataError}</p>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:items-start">
          <aside className="rounded-2xl bg-white p-3 shadow-xl shadow-primary-900/5 ring-1 ring-gray-100">
            <nav className="space-y-2">
              {[
                { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
                { id: 'clients', label: 'Clients', icon: Users },
                { id: 'consultants', label: 'Consultants', icon: ShieldCheck },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveView(item.id)}
                  className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold transition ${
                    activeView === item.id
                      ? 'bg-primary-600 text-white shadow-lg shadow-primary-900/15'
                      : 'text-gray-700 hover:bg-primary-50 hover:text-primary-700'
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </button>
              ))}
            </nav>
          </aside>

          <div className="min-w-0">
            {activeView === 'dashboard' && (
              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                {[
                  { icon: Users, label: 'Total users', value: stats.users },
                  { icon: Users, label: 'Clients', value: stats.clients },
                  { icon: ShieldCheck, label: 'Consultants', value: stats.consultants },
                  { icon: BriefcaseBusiness, label: 'Client briefs', value: stats.briefs },
                ].map((item) => (
                  <section key={item.label} className="rounded-[1.5rem] bg-white p-6 shadow-xl shadow-primary-900/5 ring-1 ring-gray-100">
                    <item.icon className="mb-5 h-7 w-7 text-primary-600" />
                    <p className="text-3xl font-bold text-gray-950">{dataLoading ? '-' : item.value}</p>
                    <p className="mt-1 text-sm font-medium text-gray-500">{item.label}</p>
                  </section>
                ))}
              </div>
            )}

            {activeView === 'clients' && (
              <section className="rounded-3xl bg-white p-5 shadow-xl shadow-primary-900/5 ring-1 ring-gray-100 sm:p-6">
                <div className="mb-6 flex items-center justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-950">Clients</h2>
                    <p className="mt-1 text-sm text-gray-500">{clients.length} clients with their attached briefs.</p>
                  </div>
                  {dataLoading && <Loader2 className="h-5 w-5 animate-spin text-primary-600" />}
                </div>

                {clients.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-gray-200 p-8 text-center text-sm text-gray-600">
                    No clients found.
                  </div>
                ) : (
                  <div className="grid gap-4 xl:grid-cols-2">
                    {clients.map((client) => (
                      <article key={client.id} className="rounded-2xl border border-gray-100 p-4">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div className="min-w-0">
                            <h3 className="break-words text-lg font-bold text-gray-950">{client.name || client.email || 'Unnamed client'}</h3>
                            <p className="mt-1 break-words text-sm text-gray-600">{client.email || 'No email'}</p>
                          </div>
                          <div className="flex shrink-0 flex-wrap gap-2">
                            <span className="w-fit rounded-full bg-primary-50 px-3 py-1 text-xs font-bold uppercase tracking-wide text-primary-700">
                              {client.attachedBriefs.length} briefs
                            </span>
                            <button
                              type="button"
                              onClick={() => handleRemoveClient(client)}
                              disabled={removingClientId === client.id}
                              className="inline-flex items-center rounded-full bg-red-50 px-3 py-1 text-xs font-bold uppercase tracking-wide text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              {removingClientId === client.id ? (
                                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                              )}
                              Remove
                            </button>
                          </div>
                        </div>

                        <div className="mt-4 grid gap-2 rounded-2xl bg-gray-50 p-3 text-sm text-gray-700 sm:grid-cols-2">
                          <p><span className="font-semibold text-gray-950">Company:</span> {client.company || 'Not provided'}</p>
                          <p><span className="font-semibold text-gray-950">Phone:</span> {client.phone || 'Not provided'}</p>
                        </div>

                        <div className="mt-5">
                          <p className="text-sm font-bold text-gray-950">Attached briefs</p>
                          {client.attachedBriefs.length > 0 ? (
                            <div className="mt-2 space-y-2">
                              {client.attachedBriefs.map((brief) => (
                                <div key={brief.id} className="overflow-hidden rounded-2xl bg-gray-50 text-sm">
                                  <button
                                    type="button"
                                    onClick={() => setOpenClientBriefId(current => current === brief.id ? '' : brief.id)}
                                    className="flex w-full flex-col gap-3 px-3 py-3 text-left transition hover:bg-primary-50 sm:flex-row sm:items-center sm:justify-between"
                                    aria-expanded={openClientBriefId === brief.id}
                                  >
                                    <span className="min-w-0">
                                      <span className="block break-words font-semibold text-gray-950">{brief.title || 'Untitled brief'}</span>
                                      <span className="mt-1 block font-medium text-primary-700">{brief.capability || 'General consulting'}</span>
                                    </span>
                                    <span className="flex shrink-0 items-center gap-3">
                                      <span className="w-fit rounded-full bg-white px-3 py-1 text-xs font-bold uppercase tracking-wide text-gray-600">
                                        {brief.status || 'new'}
                                      </span>
                                      <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform ${openClientBriefId === brief.id ? 'rotate-180' : ''}`} />
                                    </span>
                                  </button>

                                  {openClientBriefId === brief.id && (
                                    <div className="border-t border-gray-100 px-3 py-3">
                                      <p className="text-xs text-gray-500">Created: {formatDateTime(brief.createdAt)}</p>
                                      {brief.description && (
                                        <p className="mt-3 rounded-xl bg-white px-3 py-2 leading-6 text-gray-600">{brief.description}</p>
                                      )}
                                      {brief.problemAnswers?.length > 0 && (
                                        <div className="mt-3 space-y-2">
                                          {brief.problemAnswers.map((answer) => (
                                            <div key={answer.questionId || `${brief.id}-${answer.question}`} className="rounded-xl bg-white px-3 py-2">
                                              <p className="font-semibold text-gray-950">{answer.question}</p>
                                              <p className="mt-1 text-gray-600">{answer.label || answer.value}</p>
                                            </div>
                                          ))}
                                        </div>
                                      )}
                                      <div className="mt-3 grid gap-2 text-xs text-gray-500 sm:grid-cols-2">
                                        <p className="break-words">Brief ID: {brief.id}</p>
                                        <p className="break-words">Capability ID: {brief.capabilityId || 'Not provided'}</p>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="mt-2 text-sm text-gray-500">No briefs attached yet.</p>
                          )}
                        </div>

                        <p className="mt-4 break-words text-xs text-gray-500">Firebase UID: {client.id}</p>
                      </article>
                    ))}
                  </div>
                )}
              </section>
            )}

            {activeView === 'consultants' && (
          <section className="rounded-3xl bg-white p-5 shadow-xl shadow-primary-900/5 ring-1 ring-gray-100 sm:p-6">
            <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-950">Consultants</h2>
                <p className="mt-1 text-sm text-gray-500">{consultants.length} consultants with connected capabilities and attached clients.</p>
              </div>
              {dataLoading && <Loader2 className="h-5 w-5 animate-spin text-primary-600" />}
            </div>

            {consultants.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-gray-200 p-8 text-center text-sm text-gray-600">
                No consultants found.
              </div>
            ) : (
              <div className="grid gap-4 xl:grid-cols-2">
                {consultants.map((consultant) => (
                  <article key={consultant.id} className="rounded-2xl border border-gray-100 p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                        <h3 className="break-words text-lg font-bold text-gray-950">{consultant.name || consultant.email || 'Unnamed consultant'}</h3>
                        <p className="mt-1 break-words text-sm text-gray-600">{consultant.email || 'No email'}</p>
                    </div>
                      <span className="w-fit rounded-full bg-primary-50 px-3 py-1 text-xs font-bold uppercase tracking-wide text-primary-700">
                        {consultant.attachedBriefs.length} clients
                    </span>
                  </div>

                    <div className="mt-4">
                      <p className="text-sm font-bold text-gray-950">Connected capabilities</p>
                      {consultant.capabilities.length > 0 ? (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {consultant.capabilities.map((capability) => (
                            <span key={capability.id} className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
                              {capability.title}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="mt-2 text-sm text-gray-500">No connected capabilities found.</p>
                      )}
                    </div>

                    <div className="mt-5">
                      <p className="text-sm font-bold text-gray-950">Attached clients</p>
                      {consultant.attachedBriefs.length > 0 ? (
                        <div className="mt-2 space-y-2">
                          {consultant.attachedBriefs.map((brief) => (
                            <div key={brief.id} className="rounded-2xl bg-gray-50 px-3 py-3 text-sm">
                              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                                <div>
                                  <p className="font-semibold text-gray-950">{brief.clientName || 'Client'}</p>
                                  <p className="mt-1 text-gray-600">{brief.company || 'Company not provided'}</p>
                                </div>
                                <span className="w-fit rounded-full bg-white px-3 py-1 text-xs font-bold uppercase tracking-wide text-gray-600">
                                  {brief.status || 'new'}
                                </span>
                              </div>
                              <p className="mt-2 font-medium text-primary-700">{brief.capability || 'General consulting'}</p>
                              <p className="mt-1 text-xs text-gray-500">Created: {formatDateTime(brief.createdAt)}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="mt-2 text-sm text-gray-500">No clients attached yet.</p>
                      )}
                    </div>

                    <div className="mt-4 space-y-1 text-xs text-gray-500">
                      <p className="break-words">Firebase UID: {consultant.id}</p>
                      <p className="break-words">Sanity expert: {consultant.sanityExpertId || 'Not linked'}</p>
                    </div>
                </article>
              ))}
            </div>
            )}
          </section>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
