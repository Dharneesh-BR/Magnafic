import { useEffect, useMemo, useState } from 'react'
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth'
import { collection, deleteDoc, doc, getDoc, onSnapshot } from 'firebase/firestore'
import { AlertCircle, BriefcaseBusiness, LayoutDashboard, Eye, EyeOff, Loader2, Lock, LogOut, Mail, ShieldCheck, Trash2, Users } from 'lucide-react'
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
  const [sanityExpertsById, setSanityExpertsById] = useState({})
  const [dataLoading, setDataLoading] = useState(false)
  const [dataError, setDataError] = useState('')
  const [activeView, setActiveView] = useState('dashboard')
  const [removingClientId, setRemovingClientId] = useState('')
  const [questionnaireDetails, setQuestionnaireDetails] = useState(null)

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
        const nextSanityExpertsById = {}
        ;(capabilities || []).forEach((capability) => {
          ;(capability.orderedExperts || []).forEach((expert) => {
            if (!expert?._id) return

            nextSanityExpertsById[expert._id] = expert.fullName

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
        setSanityExpertsById(nextSanityExpertsById)
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
        sanityName: consultant.sanityExpertId ? sanityExpertsById[consultant.sanityExpertId] || '' : '',
        capabilities: consultant.sanityExpertId ? capabilitiesByExpertId[consultant.sanityExpertId] || [] : [],
        attachedBriefs,
      }
    }), [briefs, capabilitiesByExpertId, sanityExpertsById, usersData])

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

  const openQuestionnaireDetails = (title, attachedBriefs) => {
    setQuestionnaireDetails({
      title,
      briefs: attachedBriefs || [],
    })
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
                  <div className="overflow-hidden rounded-2xl border border-gray-100">
                    <table className="w-full table-fixed divide-y divide-gray-100 text-left text-sm lg:text-base">
                      <thead className="bg-gradient-to-r from-[#000047] via-primary-700 to-cyan-600">
                        <tr className="text-xs font-extrabold uppercase tracking-wide text-white lg:text-sm">
                          <th className="break-words px-2 py-4 lg:px-3">Client Name</th>
                          <th className="break-words px-2 py-4 lg:px-3">Email</th>
                          <th className="break-words px-2 py-4 lg:px-3">Company</th>
                          <th className="break-words px-2 py-4 lg:px-3">City</th>
                          <th className="break-words px-2 py-4 lg:px-3">Phone</th>
                          <th className="break-words px-2 py-4 lg:px-3">Briefs</th>
                          <th className="break-words px-2 py-4 text-right lg:px-3">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 bg-white">
                        {clients.map((client) => (
                          <tr key={client.id} className="transition hover:bg-primary-50/50">
                            <td className="break-words bg-blue-50/80 px-2 py-4 font-bold leading-6 text-gray-950 lg:px-3">{client.name || 'Unnamed client'}</td>
                            <td className="break-words bg-cyan-50/80 px-2 py-4 font-semibold leading-6 text-gray-800 lg:px-3">{client.email || 'No email'}</td>
                            <td className="break-words bg-blue-50/80 px-2 py-4 font-semibold leading-6 text-gray-800 lg:px-3">{client.company || 'Not provided'}</td>
                            <td className="break-words bg-cyan-50/80 px-2 py-4 font-semibold leading-6 text-gray-800 lg:px-3">{client.city || 'Not provided'}</td>
                            <td className="break-words bg-blue-50/80 px-2 py-4 font-medium leading-6 text-gray-700 lg:px-3">{client.phone || 'Not provided'}</td>
                            <td className="break-words bg-cyan-50/80 px-2 py-4 font-bold leading-6 text-primary-700 lg:px-3">{client.attachedBriefs.length}</td>
                            <td className="bg-blue-50/80 px-2 py-4 text-right lg:px-3">
                              <div className="flex flex-wrap justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => openQuestionnaireDetails(client.name || client.email || 'Client', client.attachedBriefs)}
                                className="inline-flex max-w-full flex-wrap items-center justify-center rounded-xl bg-primary-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-primary-700"
                              >
                                <Eye className="mr-2 h-4 w-4" />
                                View
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRemoveClient(client)}
                                disabled={removingClientId === client.id}
                                className="inline-flex max-w-full flex-wrap items-center justify-center rounded-xl bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                {removingClientId === client.id ? (
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                  <Trash2 className="mr-2 h-4 w-4" />
                                )}
                                Remove
                              </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
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
              <div className="overflow-hidden rounded-2xl border border-gray-100">
                <table className="w-full table-fixed divide-y divide-gray-100 text-left text-sm lg:text-base">
                  <thead className="bg-gradient-to-r from-[#000047] via-primary-700 to-cyan-600">
                    <tr className="text-xs font-extrabold uppercase tracking-wide text-white lg:text-sm">
                      <th className="break-words px-2 py-4 lg:px-3">Consultant Name</th>
                      <th className="break-words px-2 py-4 lg:px-3">Email</th>
                      <th className="break-words px-2 py-4 lg:px-3">Capabilities</th>
                      <th className="break-words px-2 py-4 lg:px-3">Attached Clients</th>
                      <th className="break-words px-2 py-4 text-right lg:px-3">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white">
                    {consultants.map((consultant) => (
                      <tr key={consultant.id} className="transition hover:bg-primary-50/50">
                        <td className="break-words bg-blue-50/80 px-2 py-4 font-bold leading-6 text-gray-950 lg:px-3">{consultant.sanityName || consultant.name || 'Unnamed consultant'}</td>
                        <td className="break-words bg-cyan-50/80 px-2 py-4 font-semibold leading-6 text-gray-800 lg:px-3">{consultant.email || 'No email'}</td>
                        <td className="break-words bg-blue-50/80 px-2 py-4 font-semibold leading-6 text-gray-800 lg:px-3">
                          {consultant.capabilities.length > 0
                            ? consultant.capabilities.map((capability) => capability.title).join(', ')
                            : 'No connected capabilities'}
                        </td>
                        <td className="break-words bg-cyan-50/80 px-2 py-4 font-bold leading-6 text-primary-700 lg:px-3">{consultant.attachedBriefs.length}</td>
                        <td className="bg-blue-50/80 px-2 py-4 text-right lg:px-3">
                          <button
                            type="button"
                            onClick={() => openQuestionnaireDetails(consultant.sanityName || consultant.name || consultant.email || 'Consultant', consultant.attachedBriefs)}
                            className="inline-flex max-w-full flex-wrap items-center justify-center rounded-xl bg-primary-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-primary-700"
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
            )}
          </div>
        </div>
      </div>
      {questionnaireDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/60 px-4 py-6">
          <section className="max-h-[88vh] w-full max-w-4xl overflow-y-auto rounded-3xl bg-white p-5 shadow-2xl shadow-primary-950/30 sm:p-7">
            <div className="mb-6 flex flex-col gap-4 border-b border-gray-100 pb-5 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary-600">Questionnaire Details</p>
                <h2 className="mt-2 break-words text-2xl font-bold text-gray-950">{questionnaireDetails.title}</h2>
                <p className="mt-1 text-sm font-medium text-gray-500">{questionnaireDetails.briefs.length} attached questionnaire{questionnaireDetails.briefs.length === 1 ? '' : 's'}</p>
              </div>
              <button
                type="button"
                onClick={() => setQuestionnaireDetails(null)}
                className="inline-flex items-center justify-center rounded-xl bg-gray-100 px-4 py-2 text-sm font-bold text-gray-700 transition hover:bg-gray-200"
              >
                Close
              </button>
            </div>

            {questionnaireDetails.briefs.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-gray-200 p-8 text-center">
                <h3 className="font-bold text-gray-950">No questionnaire available</h3>
                <p className="mt-2 text-sm text-gray-600">There are no attached questionnaire responses for this record yet.</p>
              </div>
            ) : (
              <div className="space-y-5">
                {questionnaireDetails.briefs.map((brief) => (
                  <article key={brief.id} className="overflow-hidden rounded-2xl border border-gray-100">
                    <div className="bg-gradient-to-r from-[#000047] via-primary-700 to-cyan-600 px-5 py-4 text-white">
                      <h3 className="break-words text-xl font-bold">{brief.clientName || brief.title || 'Client questionnaire'}</h3>
                      <p className="mt-1 break-words text-sm font-semibold text-white/85">{brief.company || 'Company not provided'} - {brief.city || brief.clientCity || brief.location || 'City not provided'}</p>
                    </div>

                    <div className="grid gap-3 p-5 text-sm font-medium text-gray-700 sm:grid-cols-2 lg:grid-cols-4">
                      <p className="rounded-2xl bg-blue-50 p-4 ring-1 ring-blue-100"><span className="block font-bold text-blue-950">Expertise</span>{brief.capability || 'Not provided'}</p>
                      <p className="rounded-2xl bg-cyan-50 p-4 ring-1 ring-cyan-100"><span className="block font-bold text-cyan-950">Created</span>{formatDateTime(brief.createdAt)}</p>
                      <p className="rounded-2xl bg-emerald-50 p-4 ring-1 ring-emerald-100"><span className="block font-bold text-emerald-950">Accepted</span>{formatDateTime(brief.acceptedAt)}</p>
                      <p className="rounded-2xl bg-indigo-50 p-4 ring-1 ring-indigo-100"><span className="block font-bold text-indigo-950">Status</span>{brief.status || 'new'}</p>
                    </div>

                    {brief.description && (
                      <div className="px-5 pb-4">
                        <p className="rounded-2xl bg-gray-50 p-4 text-sm font-medium leading-6 text-gray-700 ring-1 ring-gray-100">{brief.description}</p>
                      </div>
                    )}

                    {brief.problemAnswers?.length > 0 ? (
                      <div className="space-y-3 px-5 pb-5">
                        {brief.problemAnswers.map((answer, index) => (
                          <div
                            key={answer.questionId || `${brief.id}-${answer.question}-${index}`}
                            className={`rounded-2xl px-5 py-4 ring-1 ${
                              index % 2 === 0
                                ? 'bg-blue-50/80 ring-blue-100'
                                : 'bg-cyan-50/80 ring-cyan-100'
                            }`}
                          >
                            <p className="text-base font-bold leading-7 text-gray-950">{answer.question}</p>
                            <p className="mt-2 text-base font-medium leading-7 text-gray-700">{answer.label || answer.value || 'Not answered'}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="px-5 pb-5">
                        <p className="rounded-2xl border border-dashed border-gray-200 p-5 text-center text-sm font-medium text-gray-600">No questionnaire answers available.</p>
                      </div>
                    )}
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  )
}
