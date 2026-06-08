import { useEffect, useMemo, useState } from 'react'
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth'
import { arrayUnion, collection, deleteDoc, doc, getDoc, onSnapshot, serverTimestamp, updateDoc } from 'firebase/firestore'
import { AlertCircle, BriefcaseBusiness, CalendarPlus, CircleDollarSign, HandCoins, LayoutDashboard, Eye, EyeOff, Loader2, Lock, LogOut, Mail, ShieldCheck, Trash2, UserPlus, Users } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
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

function toDate(value) {
  return value?.toDate?.() || value || null
}

function formatDateTimeInput(value) {
  const date = toDate(value)
  if (!date) return ''

  const offsetDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
  return offsetDate.toISOString().slice(0, 16)
}

function formatCurrency(value) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Number(value) || 0)
}

function getPaymentTotal(payments) {
  if (!Array.isArray(payments)) return 0

  return payments.reduce((total, payment) => total + (Number(payment?.amount) || 0), 0)
}

function formatGoogleCalendarDate(date) {
  return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z')
}

function getScheduledCallCalendarUrl(brief, scheduledDate) {
  const start = new Date(scheduledDate)
  const end = new Date(start)
  end.setMinutes(end.getMinutes() + 30)

  const answerLines = (brief.problemAnswers || [])
    .map((answer) => `${answer.question}: ${answer.label || answer.value}`)
    .filter(Boolean)

  const details = [
    `Client: ${brief.clientName || 'Client'}`,
    `Company: ${brief.company || 'Not provided'}`,
    `Capability: ${brief.capability || 'Not provided'}`,
    brief.description ? `Context: ${brief.description}` : '',
    answerLines.length ? `Answers:\n${answerLines.join('\n')}` : '',
  ].filter(Boolean).join('\n\n')

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: `Magnafic client call - ${brief.clientName || 'Client'}`,
    dates: `${formatGoogleCalendarDate(start)}/${formatGoogleCalendarDate(end)}`,
    details,
  })

  return `https://calendar.google.com/calendar/render?${params.toString()}`
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
  const location = useLocation()
  const navigate = useNavigate()
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
  const [detachingBriefId, setDetachingBriefId] = useState('')
  const [schedulingBriefId, setSchedulingBriefId] = useState('')
  const [allocatingReferralId, setAllocatingReferralId] = useState('')
  const [scheduleDrafts, setScheduleDrafts] = useState({})
  const [allocationDrafts, setAllocationDrafts] = useState({})
  const [questionnaireDetails, setQuestionnaireDetails] = useState(null)
  const [paymentDraft, setPaymentDraft] = useState(null)
  const [savingPayment, setSavingPayment] = useState(false)
  const adminPath = location.pathname.replace(/\/+$/, '') || '/admin'
  const clientDetailsMatch = adminPath.match(/^\/admin\/clients\/([^/]+)$/)
  const clientBriefMatch = adminPath.match(/^\/admin\/clients\/([^/]+)\/briefs\/([^/]+)$/)
  const genericBriefMatch = adminPath.match(/^\/admin\/briefs\/([^/]+)$/)
  const consultantClientsMatch = adminPath.match(/^\/admin\/consultants\/([^/]+)\/clients$/)
  const consultantBriefMatch = adminPath.match(/^\/admin\/consultants\/([^/]+)\/clients\/([^/]+)$/)
  const routeClientId = decodeURIComponent(clientBriefMatch?.[1] || clientDetailsMatch?.[1] || '')
  const routeConsultantId = decodeURIComponent(consultantBriefMatch?.[1] || consultantClientsMatch?.[1] || '')
  const routeBriefId = decodeURIComponent(consultantBriefMatch?.[2] || clientBriefMatch?.[2] || genericBriefMatch?.[1] || '')
  const isClientDetailsPage = Boolean(clientDetailsMatch)
  const isClientBriefPage = Boolean(clientBriefMatch)
  const isGenericBriefPage = Boolean(genericBriefMatch)
  const isConsultantClientsPage = Boolean(consultantClientsMatch)
  const isConsultantBriefPage = Boolean(consultantBriefMatch)
  const isAdminDetailPage = isClientDetailsPage || isClientBriefPage || isGenericBriefPage || isConsultantClientsPage || isConsultantBriefPage

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

  useEffect(() => {
    if (isConsultantClientsPage || isConsultantBriefPage) {
      setActiveView('consultants')
    }
    if (isClientDetailsPage || isClientBriefPage) {
      setActiveView('clients')
    }
    if (isGenericBriefPage) {
      setActiveView('referralRequests')
    }
  }, [isClientBriefPage, isClientDetailsPage, isConsultantBriefPage, isConsultantClientsPage, isGenericBriefPage])

  const stats = useMemo(() => ({
    users: usersData.length,
    clients: usersData.filter((item) => item.role === 'client').length,
    consultants: usersData.filter((item) => item.role === 'consultant').length,
    briefs: briefs.length,
    projectPayments: usersData
      .filter((item) => item.role === 'consultant')
      .reduce((total, consultant) => total + getPaymentTotal(consultant.projectPayments), 0),
    referralPayments: usersData
      .filter((item) => item.role === 'consultant')
      .reduce((total, consultant) => total + getPaymentTotal(consultant.referralPayments), 0),
  }), [briefs.length, usersData])

  const scheduleRequests = useMemo(() => briefs
    .filter((brief) => ['requested', 'scheduled'].includes(brief.scheduleRequestStatus))
    .sort((a, b) => {
      const aTime = toDate(a.scheduleRequestedAt)?.getTime?.() || 0
      const bTime = toDate(b.scheduleRequestedAt)?.getTime?.() || 0
      return bTime - aTime
    }), [briefs])

  const referralRequests = useMemo(() => briefs
    .filter((brief) => brief.source === 'consultant-referral')
    .sort((a, b) => {
      const aTime = toDate(a.createdAt)?.getTime?.() || 0
      const bTime = toDate(b.createdAt)?.getTime?.() || 0
      return bTime - aTime
    }), [briefs])

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

  const selectedRouteConsultant = useMemo(
    () => consultants.find((consultant) => consultant.id === routeConsultantId),
    [consultants, routeConsultantId]
  )

  const selectedRouteClient = useMemo(
    () => clients.find((client) => client.id === routeClientId),
    [clients, routeClientId]
  )

  const selectedRouteBrief = useMemo(
    () => (
      selectedRouteConsultant?.attachedBriefs.find((brief) => brief.id === routeBriefId) ||
      selectedRouteClient?.attachedBriefs.find((brief) => brief.id === routeBriefId) ||
      briefs.find((brief) => brief.id === routeBriefId)
    ),
    [briefs, routeBriefId, selectedRouteClient, selectedRouteConsultant]
  )

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

  const openQuestionnaireDetails = (title, attachedBriefs, options = {}) => {
    setQuestionnaireDetails({
      title,
      briefs: attachedBriefs || [],
      ownerType: options.ownerType || '',
      consultant: options.consultant || null,
    })
  }

  const handleDetachClientFromConsultant = async (brief, consultantOverride) => {
    const consultant = consultantOverride || questionnaireDetails?.consultant
    if (!consultant || !brief?.id) return

    const clientLabel = brief.clientName || brief.company || 'this client'
    const consultantLabel = consultant.sanityName || consultant.name || consultant.email || 'this consultant'
    const confirmed = window.confirm(`Remove ${clientLabel} from ${consultantLabel}? The client and questionnaire will remain in the admin dashboard.`)
    if (!confirmed) return

    setDetachingBriefId(brief.id)
    setDataError('')

    try {
      const isAssignedToConsultant = brief.assignedConsultantId === consultant.id
      const isMatchedToConsultant = Boolean(
        consultant.sanityExpertId &&
        Array.isArray(brief.matchedExpertIds) &&
        brief.matchedExpertIds.includes(consultant.sanityExpertId)
      )
      const remainingMatchedExpertIds = Array.isArray(brief.matchedExpertIds)
        ? brief.matchedExpertIds.filter((expertId) => expertId !== consultant.sanityExpertId)
        : []

      const updatePayload = {
        matchedExpertIds: remainingMatchedExpertIds,
        updatedAt: serverTimestamp(),
      }

      if (isAssignedToConsultant) {
        updatePayload.assignedConsultantId = null
      }

      if (brief.status === 'accepted' && (isAssignedToConsultant || isMatchedToConsultant)) {
        updatePayload.status = remainingMatchedExpertIds.length > 0 ? 'matching' : 'new'
        updatePayload.acceptedAt = null
      }

      await updateDoc(doc(db, 'clientBriefs', brief.id), updatePayload)

      setQuestionnaireDetails((current) => {
        if (!current) return current

        return {
          ...current,
          briefs: current.briefs.filter((item) => item.id !== brief.id),
        }
      })
    } catch (detachError) {
      console.error('Admin consultant client detach failed:', detachError)
      setDataError(getAdminError(detachError))
    } finally {
      setDetachingBriefId('')
    }
  }

  const updateScheduleDraft = (briefId, value) => {
    setScheduleDrafts((current) => ({
      ...current,
      [briefId]: value,
    }))
  }

  const updateAllocationDraft = (briefId, value) => {
    setAllocationDrafts((current) => ({
      ...current,
      [briefId]: value,
    }))
  }

  const getDefaultAllocationConsultantId = (brief) => {
    if (brief.assignedConsultantId) return brief.assignedConsultantId

    const preferredConsultant = consultants.find((consultant) => (
      consultant.sanityExpertId && consultant.sanityExpertId === brief.preferredConsultantId
    ))

    return preferredConsultant?.id || ''
  }

  const handleAllocateReferral = async (brief) => {
    const selectedConsultantId = allocationDrafts[brief.id] || getDefaultAllocationConsultantId(brief)
    const consultant = consultants.find((item) => item.id === selectedConsultantId)

    if (!consultant) {
      setDataError('Please select a consultant before allocating this referral.')
      return
    }

    setAllocatingReferralId(brief.id)
    setDataError('')

    try {
      await updateDoc(doc(db, 'clientBriefs', brief.id), {
        assignedConsultantId: consultant.id,
        matchedExpertIds: consultant.sanityExpertId ? [consultant.sanityExpertId] : [],
        allocatedConsultantName: consultant.sanityName || consultant.name || consultant.email || '',
        allocatedConsultantEmail: consultant.email || '',
        allocatedConsultantSanityId: consultant.sanityExpertId || '',
        referralStatus: 'allocated',
        status: 'matching',
        allocatedAt: serverTimestamp(),
        allocatedByAdminId: adminProfile?.id || adminProfile?.uid || '',
        allocatedByAdminEmail: adminProfile?.email || '',
        updatedAt: serverTimestamp(),
      })
    } catch (allocationError) {
      console.error('Admin referral allocation failed:', allocationError)
      setDataError(getAdminError(allocationError))
    } finally {
      setAllocatingReferralId('')
    }
  }

  const handleAdminScheduleCall = async (brief) => {
    const draftValue = scheduleDrafts[brief.id] || formatDateTimeInput(brief.scheduledCallAt)
    if (!draftValue) {
      setDataError('Please select a call date and time before scheduling.')
      return
    }

    const scheduledDate = new Date(draftValue)
    if (Number.isNaN(scheduledDate.getTime())) {
      setDataError('Please select a valid call date and time.')
      return
    }

    setSchedulingBriefId(brief.id)
    setDataError('')

    try {
      await updateDoc(doc(db, 'clientBriefs', brief.id), {
        scheduleRequestStatus: 'scheduled',
        scheduledCallAt: scheduledDate,
        scheduledByAdminId: adminProfile?.id || adminProfile?.uid || '',
        scheduledByAdminEmail: adminProfile?.email || '',
        status: 'scheduled',
        updatedAt: serverTimestamp(),
      })

      window.open(getScheduledCallCalendarUrl(brief, scheduledDate), '_blank', 'width=720,height=640')
    } catch (scheduleError) {
      console.error('Admin schedule call failed:', scheduleError)
      setDataError(getAdminError(scheduleError))
    } finally {
      setSchedulingBriefId('')
    }
  }

  const openPaymentDraft = (consultant, paymentType) => {
    setDataError('')
    setPaymentDraft({
      consultant,
      paymentType,
      amount: '',
      paidAt: new Date().toISOString().slice(0, 10),
      note: '',
    })
  }

  const updatePaymentDraft = (field, value) => {
    setPaymentDraft((current) => current ? { ...current, [field]: value } : current)
  }

  const handleSavePayment = async (event) => {
    event.preventDefault()
    if (!paymentDraft?.consultant?.id) return

    const amount = Number(paymentDraft.amount)
    if (!Number.isFinite(amount) || amount <= 0) {
      setDataError('Please enter a valid payment amount.')
      return
    }

    setSavingPayment(true)
    setDataError('')

    const paymentField = paymentDraft.paymentType === 'referral' ? 'referralPayments' : 'projectPayments'
    const paymentEntry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      amount,
      paidAt: paymentDraft.paidAt || new Date().toISOString().slice(0, 10),
      note: paymentDraft.note.trim(),
      createdAt: new Date().toISOString(),
      createdByAdminId: adminProfile?.id || adminProfile?.uid || '',
      createdByAdminEmail: adminProfile?.email || '',
    }

    try {
      await updateDoc(doc(db, 'users', paymentDraft.consultant.id), {
        [paymentField]: arrayUnion(paymentEntry),
        updatedAt: serverTimestamp(),
      })
      setPaymentDraft(null)
    } catch (paymentError) {
      console.error('Admin consultant payment update failed:', paymentError)
      setDataError(getAdminError(paymentError))
    } finally {
      setSavingPayment(false)
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
                { id: 'referralRequests', label: 'Referrals', icon: UserPlus },
                { id: 'scheduleCalls', label: 'Schedule Calls', icon: CalendarPlus },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setActiveView(item.id)
                    navigate('/admin')
                  }}
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
            {isClientDetailsPage && (
              <section className="rounded-3xl bg-white p-5 shadow-xl shadow-primary-900/5 ring-1 ring-gray-100 sm:p-6">
                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <Link to="/admin" className="mb-3 inline-flex text-sm font-bold text-primary-700 transition hover:text-primary-900">
                      Back to clients
                    </Link>
                    <h2 className="text-2xl font-bold text-gray-950">
                      {selectedRouteClient?.name || selectedRouteClient?.email || 'Client'}
                    </h2>
                    <p className="mt-1 text-sm text-gray-500">
                      {selectedRouteClient ? `${selectedRouteClient.attachedBriefs.length} attached briefs` : 'Client not found'}
                    </p>
                  </div>
                  {dataLoading && <Loader2 className="h-5 w-5 animate-spin text-primary-600" />}
                </div>

                {!selectedRouteClient ? (
                  <div className="rounded-2xl border border-dashed border-gray-200 p-8 text-center text-sm text-gray-600">
                    This client could not be found.
                  </div>
                ) : selectedRouteClient.attachedBriefs.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-gray-200 p-8 text-center text-sm text-gray-600">
                    No briefs are attached to this client.
                  </div>
                ) : (
                  <div className="overflow-hidden rounded-2xl border border-gray-100">
                    <table className="w-full table-fixed divide-y divide-gray-100 text-left text-sm lg:text-base">
                      <thead className="bg-gradient-to-r from-[#000047] via-primary-700 to-cyan-600">
                        <tr className="text-xs font-extrabold uppercase tracking-wide text-white lg:text-sm">
                          <th className="break-words px-2 py-4 lg:px-3">Brief</th>
                          <th className="break-words px-2 py-4 lg:px-3">Company</th>
                          <th className="break-words px-2 py-4 lg:px-3">City</th>
                          <th className="break-words px-2 py-4 lg:px-3">Expertise</th>
                          <th className="break-words px-2 py-4 lg:px-3">Status</th>
                          <th className="break-words px-2 py-4 lg:px-3">Created</th>
                          <th className="break-words px-2 py-4 text-right lg:px-3">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 bg-white">
                        {selectedRouteClient.attachedBriefs.map((brief) => (
                          <tr key={brief.id} className="transition hover:bg-primary-50/50">
                            <td className="break-words bg-blue-50/80 px-2 py-4 font-bold leading-6 text-gray-950 lg:px-3">{brief.title || brief.clientName || 'Client questionnaire'}</td>
                            <td className="break-words bg-cyan-50/80 px-2 py-4 font-semibold leading-6 text-gray-800 lg:px-3">{brief.company || 'Not provided'}</td>
                            <td className="break-words bg-blue-50/80 px-2 py-4 font-semibold leading-6 text-gray-800 lg:px-3">{brief.city || brief.clientCity || brief.location || selectedRouteClient.city || 'Not provided'}</td>
                            <td className="break-words bg-cyan-50/80 px-2 py-4 font-semibold leading-6 text-gray-800 lg:px-3">{brief.capability || 'Not provided'}</td>
                            <td className="break-words bg-blue-50/80 px-2 py-4 font-bold leading-6 text-primary-700 lg:px-3">{brief.status || 'new'}</td>
                            <td className="break-words bg-cyan-50/80 px-2 py-4 font-medium leading-6 text-gray-700 lg:px-3">{formatDateTime(brief.createdAt)}</td>
                            <td className="bg-blue-50/80 px-2 py-4 text-right lg:px-3">
                              <Link
                                to={`/admin/clients/${encodeURIComponent(selectedRouteClient.id)}/briefs/${encodeURIComponent(brief.id)}`}
                                className="inline-flex max-w-full flex-wrap items-center justify-center rounded-xl bg-primary-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-primary-700"
                              >
                                <Eye className="mr-2 h-4 w-4" />
                                View brief
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            )}

            {isClientBriefPage && (
              <section className="rounded-3xl bg-white p-5 shadow-xl shadow-primary-900/5 ring-1 ring-gray-100 sm:p-8">
                <Link
                  to={`/admin/clients/${encodeURIComponent(routeClientId)}`}
                  className="mb-6 inline-flex text-sm font-bold text-primary-700 transition hover:text-primary-900"
                >
                  Back to client briefs
                </Link>

                {!selectedRouteClient || !selectedRouteBrief ? (
                  <div className="rounded-2xl border border-dashed border-gray-200 p-8 text-center text-sm text-gray-600">
                    This brief could not be found for the selected client.
                  </div>
                ) : (
                  <>
                    <div className="mb-6 border-b border-gray-100 pb-6">
                      <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary-600">Brief Detail</p>
                      <h2 className="mt-2 break-words text-2xl font-bold text-gray-950">{selectedRouteBrief.clientName || selectedRouteBrief.title || selectedRouteClient.name || 'Client questionnaire'}</h2>
                      <p className="mt-2 break-words text-sm text-gray-600">{selectedRouteBrief.company || selectedRouteClient.company || 'Company not provided'} - {selectedRouteBrief.city || selectedRouteBrief.clientCity || selectedRouteBrief.location || selectedRouteClient.city || 'City not provided'}</p>
                    </div>

                    <div className="mb-6 grid gap-3 text-sm font-medium text-gray-700 sm:grid-cols-2 lg:grid-cols-4">
                      <p className="rounded-2xl bg-blue-50 p-4 ring-1 ring-blue-100"><span className="block font-bold text-blue-950">Expertise</span>{selectedRouteBrief.capability || 'Not provided'}</p>
                      <p className="rounded-2xl bg-cyan-50 p-4 ring-1 ring-cyan-100"><span className="block font-bold text-cyan-950">Created</span>{formatDateTime(selectedRouteBrief.createdAt)}</p>
                      <p className="rounded-2xl bg-emerald-50 p-4 ring-1 ring-emerald-100"><span className="block font-bold text-emerald-950">Accepted</span>{formatDateTime(selectedRouteBrief.acceptedAt)}</p>
                      <p className="rounded-2xl bg-indigo-50 p-4 ring-1 ring-indigo-100"><span className="block font-bold text-indigo-950">Status</span>{selectedRouteBrief.status || 'new'}</p>
                    </div>

                    {selectedRouteBrief.description && (
                      <p className="mb-6 rounded-2xl bg-gray-50 p-5 text-sm font-medium leading-6 text-gray-700 ring-1 ring-gray-100">{selectedRouteBrief.description}</p>
                    )}

                    {selectedRouteBrief.problemAnswers?.length > 0 ? (
                      <div className="space-y-3">
                        {selectedRouteBrief.problemAnswers.map((answer, index) => (
                          <div
                            key={answer.questionId || `${selectedRouteBrief.id}-${answer.question}-${index}`}
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
                      <p className="rounded-2xl border border-dashed border-gray-200 p-8 text-center text-sm font-medium text-gray-600">No questionnaire answers available.</p>
                    )}
                  </>
                )}
              </section>
            )}

            {isGenericBriefPage && (
              <section className="rounded-3xl bg-white p-5 shadow-xl shadow-primary-900/5 ring-1 ring-gray-100 sm:p-8">
                <Link to="/admin" className="mb-6 inline-flex text-sm font-bold text-primary-700 transition hover:text-primary-900">
                  Back to admin
                </Link>

                {!selectedRouteBrief ? (
                  <div className="rounded-2xl border border-dashed border-gray-200 p-8 text-center text-sm text-gray-600">
                    This brief could not be found.
                  </div>
                ) : (
                  <>
                    <div className="mb-6 border-b border-gray-100 pb-6">
                      <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary-600">Brief Detail</p>
                      <h2 className="mt-2 break-words text-2xl font-bold text-gray-950">{selectedRouteBrief.clientName || selectedRouteBrief.title || 'Client questionnaire'}</h2>
                      <p className="mt-2 break-words text-sm text-gray-600">{selectedRouteBrief.company || 'Company not provided'} - {selectedRouteBrief.businessEmail || selectedRouteBrief.clientEmail || 'Email not provided'}</p>
                    </div>

                    <div className="mb-6 grid gap-3 text-sm font-medium text-gray-700 sm:grid-cols-2 lg:grid-cols-4">
                      <p className="rounded-2xl bg-blue-50 p-4 ring-1 ring-blue-100"><span className="block font-bold text-blue-950">Expertise</span>{selectedRouteBrief.capability || 'Not provided'}</p>
                      <p className="rounded-2xl bg-cyan-50 p-4 ring-1 ring-cyan-100"><span className="block font-bold text-cyan-950">Created</span>{formatDateTime(selectedRouteBrief.createdAt)}</p>
                      <p className="rounded-2xl bg-emerald-50 p-4 ring-1 ring-emerald-100"><span className="block font-bold text-emerald-950">Preferred</span>{selectedRouteBrief.preferredConsultantName || 'Auto match'}</p>
                      <p className="rounded-2xl bg-indigo-50 p-4 ring-1 ring-indigo-100"><span className="block font-bold text-indigo-950">Status</span>{selectedRouteBrief.referralStatus || selectedRouteBrief.status || 'new'}</p>
                    </div>

                    {selectedRouteBrief.description && (
                      <p className="mb-6 rounded-2xl bg-gray-50 p-5 text-sm font-medium leading-6 text-gray-700 ring-1 ring-gray-100">{selectedRouteBrief.description}</p>
                    )}

                    {selectedRouteBrief.problemAnswers?.length > 0 ? (
                      <div className="space-y-3">
                        {selectedRouteBrief.problemAnswers.map((answer, index) => (
                          <div
                            key={answer.questionId || `${selectedRouteBrief.id}-${answer.question}-${index}`}
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
                      <p className="rounded-2xl border border-dashed border-gray-200 p-8 text-center text-sm font-medium text-gray-600">No questionnaire answers available.</p>
                    )}
                  </>
                )}
              </section>
            )}

            {isConsultantClientsPage && (
              <section className="rounded-3xl bg-white p-5 shadow-xl shadow-primary-900/5 ring-1 ring-gray-100 sm:p-6">
                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <Link to="/admin" className="mb-3 inline-flex text-sm font-bold text-primary-700 transition hover:text-primary-900">
                      Back to consultants
                    </Link>
                    <h2 className="text-2xl font-bold text-gray-950">
                      {selectedRouteConsultant?.sanityName || selectedRouteConsultant?.name || selectedRouteConsultant?.email || 'Consultant'}
                    </h2>
                    <p className="mt-1 text-sm text-gray-500">
                      {selectedRouteConsultant ? `${selectedRouteConsultant.attachedBriefs.length} attached clients` : 'Consultant not found'}
                    </p>
                  </div>
                  {dataLoading && <Loader2 className="h-5 w-5 animate-spin text-primary-600" />}
                </div>

                {!selectedRouteConsultant ? (
                  <div className="rounded-2xl border border-dashed border-gray-200 p-8 text-center text-sm text-gray-600">
                    This consultant could not be found.
                  </div>
                ) : selectedRouteConsultant.attachedBriefs.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-gray-200 p-8 text-center text-sm text-gray-600">
                    No clients are attached to this consultant.
                  </div>
                ) : (
                  <div className="overflow-hidden rounded-2xl border border-gray-100">
                    <table className="w-full table-fixed divide-y divide-gray-100 text-left text-sm lg:text-base">
                      <thead className="bg-gradient-to-r from-[#000047] via-primary-700 to-cyan-600">
                        <tr className="text-xs font-extrabold uppercase tracking-wide text-white lg:text-sm">
                          <th className="break-words px-2 py-4 lg:px-3">Client Name</th>
                          <th className="break-words px-2 py-4 lg:px-3">Company</th>
                          <th className="break-words px-2 py-4 lg:px-3">City</th>
                          <th className="break-words px-2 py-4 lg:px-3">Expertise</th>
                          <th className="break-words px-2 py-4 lg:px-3">Status</th>
                          <th className="break-words px-2 py-4 lg:px-3">Created</th>
                          <th className="break-words px-2 py-4 text-right lg:px-3">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 bg-white">
                        {selectedRouteConsultant.attachedBriefs.map((brief) => (
                          <tr key={brief.id} className="transition hover:bg-primary-50/50">
                            <td className="break-words bg-blue-50/80 px-2 py-4 font-bold leading-6 text-gray-950 lg:px-3">{brief.clientName || 'Client'}</td>
                            <td className="break-words bg-cyan-50/80 px-2 py-4 font-semibold leading-6 text-gray-800 lg:px-3">{brief.company || 'Not provided'}</td>
                            <td className="break-words bg-blue-50/80 px-2 py-4 font-semibold leading-6 text-gray-800 lg:px-3">{brief.city || brief.clientCity || brief.location || 'Not provided'}</td>
                            <td className="break-words bg-cyan-50/80 px-2 py-4 font-semibold leading-6 text-gray-800 lg:px-3">{brief.capability || 'Not provided'}</td>
                            <td className="break-words bg-blue-50/80 px-2 py-4 font-bold leading-6 text-primary-700 lg:px-3">{brief.status || 'new'}</td>
                            <td className="break-words bg-cyan-50/80 px-2 py-4 font-medium leading-6 text-gray-700 lg:px-3">{formatDateTime(brief.createdAt)}</td>
                            <td className="bg-blue-50/80 px-2 py-4 text-right lg:px-3">
                              <div className="flex flex-wrap justify-end gap-2">
                                <Link
                                  to={`/admin/consultants/${encodeURIComponent(selectedRouteConsultant.id)}/clients/${encodeURIComponent(brief.id)}`}
                                  className="inline-flex max-w-full flex-wrap items-center justify-center rounded-xl bg-primary-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-primary-700"
                                >
                                  <Eye className="mr-2 h-4 w-4" />
                                  View brief
                                </Link>
                                <button
                                  type="button"
                                  onClick={() => handleDetachClientFromConsultant(brief, selectedRouteConsultant)}
                                  disabled={detachingBriefId === brief.id}
                                  className="inline-flex max-w-full flex-wrap items-center justify-center rounded-xl bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                  {detachingBriefId === brief.id ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  ) : (
                                    <Trash2 className="mr-2 h-4 w-4" />
                                  )}
                                  Remove client
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

            {isConsultantBriefPage && (
              <section className="rounded-3xl bg-white p-5 shadow-xl shadow-primary-900/5 ring-1 ring-gray-100 sm:p-8">
                <Link
                  to={`/admin/consultants/${encodeURIComponent(routeConsultantId)}/clients`}
                  className="mb-6 inline-flex text-sm font-bold text-primary-700 transition hover:text-primary-900"
                >
                  Back to client list
                </Link>

                {!selectedRouteConsultant || !selectedRouteBrief ? (
                  <div className="rounded-2xl border border-dashed border-gray-200 p-8 text-center text-sm text-gray-600">
                    This brief could not be found for the selected consultant.
                  </div>
                ) : (
                  <>
                    <div className="mb-6 flex flex-col gap-4 border-b border-gray-100 pb-6 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary-600">Brief Detail</p>
                        <h2 className="mt-2 break-words text-2xl font-bold text-gray-950">{selectedRouteBrief.clientName || selectedRouteBrief.title || 'Client questionnaire'}</h2>
                        <p className="mt-2 break-words text-sm text-gray-600">{selectedRouteBrief.company || 'Company not provided'} - {selectedRouteBrief.city || selectedRouteBrief.clientCity || selectedRouteBrief.location || 'City not provided'}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDetachClientFromConsultant(selectedRouteBrief, selectedRouteConsultant)}
                        disabled={detachingBriefId === selectedRouteBrief.id}
                        className="inline-flex items-center justify-center rounded-xl bg-red-50 px-4 py-3 text-sm font-bold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-70"
                      >
                        {detachingBriefId === selectedRouteBrief.id ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="mr-2 h-4 w-4" />
                        )}
                        Remove client
                      </button>
                    </div>

                    <div className="mb-6 grid gap-3 text-sm font-medium text-gray-700 sm:grid-cols-2 lg:grid-cols-4">
                      <p className="rounded-2xl bg-blue-50 p-4 ring-1 ring-blue-100"><span className="block font-bold text-blue-950">Expertise</span>{selectedRouteBrief.capability || 'Not provided'}</p>
                      <p className="rounded-2xl bg-cyan-50 p-4 ring-1 ring-cyan-100"><span className="block font-bold text-cyan-950">Created</span>{formatDateTime(selectedRouteBrief.createdAt)}</p>
                      <p className="rounded-2xl bg-emerald-50 p-4 ring-1 ring-emerald-100"><span className="block font-bold text-emerald-950">Accepted</span>{formatDateTime(selectedRouteBrief.acceptedAt)}</p>
                      <p className="rounded-2xl bg-indigo-50 p-4 ring-1 ring-indigo-100"><span className="block font-bold text-indigo-950">Status</span>{selectedRouteBrief.status || 'new'}</p>
                    </div>

                    {selectedRouteBrief.description && (
                      <p className="mb-6 rounded-2xl bg-gray-50 p-5 text-sm font-medium leading-6 text-gray-700 ring-1 ring-gray-100">{selectedRouteBrief.description}</p>
                    )}

                    {selectedRouteBrief.problemAnswers?.length > 0 ? (
                      <div className="space-y-3">
                        {selectedRouteBrief.problemAnswers.map((answer, index) => (
                          <div
                            key={answer.questionId || `${selectedRouteBrief.id}-${answer.question}-${index}`}
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
                      <p className="rounded-2xl border border-dashed border-gray-200 p-8 text-center text-sm font-medium text-gray-600">No questionnaire answers available.</p>
                    )}
                  </>
                )}
              </section>
            )}

            {!isAdminDetailPage && activeView === 'dashboard' && (
              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {[
                  { icon: Users, label: 'Total users', value: stats.users, tone: 'from-[#000047] via-primary-700 to-cyan-500' },
                  { icon: Users, label: 'Clients', value: stats.clients, tone: 'from-blue-900 via-blue-600 to-cyan-400' },
                  { icon: ShieldCheck, label: 'Consultants', value: stats.consultants, tone: 'from-indigo-900 via-primary-700 to-sky-500' },
                  { icon: BriefcaseBusiness, label: 'Client briefs', value: stats.briefs, tone: 'from-slate-900 via-slate-600 to-cyan-400' },
                  { icon: CircleDollarSign, label: 'Total project payment', value: formatCurrency(stats.projectPayments), tone: 'from-emerald-800 via-teal-600 to-cyan-400' },
                  { icon: HandCoins, label: 'Total referral payment', value: formatCurrency(stats.referralPayments), tone: 'from-cyan-950 via-sky-700 to-cyan-400' },
                ].map((item) => (
                  <section key={item.label} className={`group relative min-h-[9rem] overflow-hidden rounded-2xl bg-gradient-to-br ${item.tone} p-6 text-white shadow-xl shadow-primary-900/15 ring-1 ring-white/25 transition hover:-translate-y-1 hover:shadow-2xl hover:shadow-cyan-500/25`}>
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(255,255,255,0.22),transparent_30%),linear-gradient(135deg,rgba(255,255,255,0.14),transparent_42%)] opacity-90"></div>
                    <item.icon className="absolute bottom-5 right-5 h-8 w-8 text-white/90 drop-shadow-[0_6px_16px_rgba(0,0,71,0.28)] transition group-hover:scale-110" />
                    <div className="relative pr-12">
                      <p className="text-3xl font-black leading-tight text-white drop-shadow-[0_6px_18px_rgba(0,0,71,0.26)]">{dataLoading ? '-' : item.value}</p>
                      <p className="mt-2 text-sm font-extrabold leading-5 text-white/90">{item.label}</p>
                    </div>
                  </section>
                ))}
              </div>
            )}

            {!isAdminDetailPage && activeView === 'clients' && (
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
                              <Link
                                to={`/admin/clients/${encodeURIComponent(client.id)}`}
                                className="inline-flex max-w-full flex-wrap items-center justify-center rounded-xl bg-primary-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-primary-700"
                              >
                                <Eye className="mr-2 h-4 w-4" />
                                View
                              </Link>
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

            {!isAdminDetailPage && activeView === 'referralRequests' && (
              <section className="rounded-3xl bg-white p-5 shadow-xl shadow-primary-900/5 ring-1 ring-gray-100 sm:p-6">
                <div className="mb-6 flex items-center justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-950">Referral Requests</h2>
                    <p className="mt-1 text-sm text-gray-500">{referralRequests.length} consultant submitted referrals.</p>
                  </div>
                  {dataLoading && <Loader2 className="h-5 w-5 animate-spin text-primary-600" />}
                </div>

                {referralRequests.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-gray-200 p-8 text-center text-sm text-gray-600">
                    No referral requests found.
                  </div>
                ) : (
                  <div className="overflow-hidden rounded-2xl border border-gray-100">
                    <table className="w-full table-fixed divide-y divide-gray-100 text-left text-sm lg:text-base">
                      <thead className="bg-gradient-to-r from-[#000047] via-primary-700 to-cyan-600">
                        <tr className="text-xs font-extrabold uppercase tracking-wide text-white lg:text-sm">
                          <th className="break-words px-2 py-4 lg:px-3">Client</th>
                          <th className="break-words px-2 py-4 lg:px-3">Company</th>
                          <th className="break-words px-2 py-4 lg:px-3">Email</th>
                          <th className="break-words px-2 py-4 lg:px-3">Expertise</th>
                          <th className="break-words px-2 py-4 lg:px-3">Referred By</th>
                          <th className="break-words px-2 py-4 lg:px-3">Preferred</th>
                          <th className="break-words px-2 py-4 lg:px-3">Allocate To</th>
                          <th className="break-words px-2 py-4 text-right lg:px-3">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 bg-white">
                        {referralRequests.map((brief) => {
                          const allocationValue = allocationDrafts[brief.id] ?? getDefaultAllocationConsultantId(brief)

                          return (
                            <tr key={brief.id} className="transition hover:bg-primary-50/50">
                              <td className="break-words bg-blue-50/80 px-2 py-4 font-bold leading-6 text-gray-950 lg:px-3">{brief.clientName || 'Client'}</td>
                              <td className="break-words bg-cyan-50/80 px-2 py-4 font-semibold leading-6 text-gray-800 lg:px-3">{brief.company || 'Not provided'}</td>
                              <td className="break-words bg-blue-50/80 px-2 py-4 font-medium leading-6 text-gray-700 lg:px-3">{brief.businessEmail || brief.clientEmail || 'Not provided'}</td>
                              <td className="break-words bg-cyan-50/80 px-2 py-4 font-semibold leading-6 text-gray-800 lg:px-3">{brief.capability || 'Not provided'}</td>
                              <td className="break-words bg-blue-50/80 px-2 py-4 font-medium leading-6 text-gray-700 lg:px-3">{brief.referredBy?.name || brief.referredExpertName || 'Consultant'}</td>
                              <td className="break-words bg-cyan-50/80 px-2 py-4 font-medium leading-6 text-gray-700 lg:px-3">{brief.preferredConsultantName || 'Auto match'}</td>
                              <td className="bg-blue-50/80 px-2 py-4 lg:px-3">
                                <select
                                  value={allocationValue}
                                  onChange={(event) => updateAllocationDraft(brief.id, event.target.value)}
                                  disabled={brief.referralStatus === 'allocated'}
                                  className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-900 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100 disabled:cursor-not-allowed disabled:bg-gray-100"
                                >
                                  <option value="">Select consultant</option>
                                  {consultants.map((consultant) => (
                                    <option key={consultant.id} value={consultant.id}>
                                      {consultant.sanityName || consultant.name || consultant.email}
                                    </option>
                                  ))}
                                </select>
                                {brief.allocatedConsultantName && (
                                  <p className="mt-2 break-words text-xs font-semibold text-emerald-700">Allocated: {brief.allocatedConsultantName}</p>
                                )}
                              </td>
                              <td className="bg-cyan-50/80 px-2 py-4 text-right lg:px-3">
                                <div className="flex flex-wrap justify-end gap-2">
                                  <button
                                    type="button"
                                    onClick={() => handleAllocateReferral(brief)}
                                    disabled={allocatingReferralId === brief.id || brief.referralStatus === 'allocated'}
                                    className="inline-flex max-w-full flex-wrap items-center justify-center rounded-xl bg-primary-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60"
                                  >
                                    {allocatingReferralId === brief.id ? (
                                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    ) : (
                                      <UserPlus className="mr-2 h-4 w-4" />
                                    )}
                                    {brief.referralStatus === 'allocated' ? 'Allocated' : 'Allocate'}
                                  </button>
                                  <Link
                                    to={`/admin/briefs/${encodeURIComponent(brief.id)}`}
                                    className="inline-flex max-w-full flex-wrap items-center justify-center rounded-xl bg-white px-3 py-2 text-sm font-semibold text-primary-700 ring-1 ring-primary-100 transition hover:bg-primary-50"
                                  >
                                    <Eye className="mr-2 h-4 w-4" />
                                    Brief
                                  </Link>
                                </div>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            )}

            {!isAdminDetailPage && activeView === 'scheduleCalls' && (
              <section className="rounded-3xl bg-white p-5 shadow-xl shadow-primary-900/5 ring-1 ring-gray-100 sm:p-6">
                <div className="mb-6 flex items-center justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-950">Schedule Calls</h2>
                    <p className="mt-1 text-sm text-gray-500">{scheduleRequests.length} consultant scheduling requests.</p>
                  </div>
                  {dataLoading && <Loader2 className="h-5 w-5 animate-spin text-primary-600" />}
                </div>

                {scheduleRequests.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-gray-200 p-8 text-center text-sm text-gray-600">
                    No schedule requests found.
                  </div>
                ) : (
                  <div className="overflow-hidden rounded-2xl border border-gray-100">
                    <table className="w-full table-fixed divide-y divide-gray-100 text-left text-sm lg:text-base">
                      <thead className="bg-gradient-to-r from-[#000047] via-primary-700 to-cyan-600">
                        <tr className="text-xs font-extrabold uppercase tracking-wide text-white lg:text-sm">
                          <th className="break-words px-2 py-4 lg:px-3">Client</th>
                          <th className="break-words px-2 py-4 lg:px-3">Company</th>
                          <th className="break-words px-2 py-4 lg:px-3">Expertise</th>
                          <th className="break-words px-2 py-4 lg:px-3">Consultant</th>
                          <th className="break-words px-2 py-4 lg:px-3">Requested</th>
                          <th className="break-words px-2 py-4 lg:px-3">Call Time</th>
                          <th className="break-words px-2 py-4 text-right lg:px-3">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 bg-white">
                        {scheduleRequests.map((brief) => {
                          const scheduledInputValue = scheduleDrafts[brief.id] ?? formatDateTimeInput(brief.scheduledCallAt)
                          return (
                            <tr key={brief.id} className="transition hover:bg-primary-50/50">
                              <td className="break-words bg-blue-50/80 px-2 py-4 font-bold leading-6 text-gray-950 lg:px-3">{brief.clientName || 'Client'}</td>
                              <td className="break-words bg-cyan-50/80 px-2 py-4 font-semibold leading-6 text-gray-800 lg:px-3">{brief.company || 'Not provided'}</td>
                              <td className="break-words bg-blue-50/80 px-2 py-4 font-semibold leading-6 text-gray-800 lg:px-3">{brief.capability || 'Not provided'}</td>
                              <td className="break-words bg-cyan-50/80 px-2 py-4 font-semibold leading-6 text-gray-800 lg:px-3">{brief.scheduleRequestedBy?.name || 'Consultant'}</td>
                              <td className="break-words bg-blue-50/80 px-2 py-4 font-medium leading-6 text-gray-700 lg:px-3">{formatDateTime(brief.scheduleRequestedAt)}</td>
                              <td className="bg-cyan-50/80 px-2 py-4 lg:px-3">
                                <input
                                  type="datetime-local"
                                  value={scheduledInputValue}
                                  onChange={(event) => updateScheduleDraft(brief.id, event.target.value)}
                                  className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-900 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                                />
                                {brief.scheduledCallAt && (
                                  <p className="mt-2 break-words text-xs font-semibold text-emerald-700">Scheduled: {formatDateTime(brief.scheduledCallAt)}</p>
                                )}
                              </td>
                              <td className="bg-blue-50/80 px-2 py-4 text-right lg:px-3">
                                <div className="flex flex-wrap justify-end gap-2">
                                  <Link
                                    to={`/admin/briefs/${encodeURIComponent(brief.id)}`}
                                    className="inline-flex max-w-full flex-wrap items-center justify-center rounded-xl bg-white px-3 py-2 text-sm font-semibold text-primary-700 ring-1 ring-primary-100 transition hover:bg-primary-50"
                                  >
                                    <Eye className="mr-2 h-4 w-4" />
                                    Brief
                                  </Link>
                                  <button
                                    type="button"
                                    onClick={() => handleAdminScheduleCall(brief)}
                                    disabled={schedulingBriefId === brief.id}
                                    className="inline-flex max-w-full flex-wrap items-center justify-center rounded-xl bg-primary-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60"
                                  >
                                    {schedulingBriefId === brief.id ? (
                                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    ) : (
                                      <CalendarPlus className="mr-2 h-4 w-4" />
                                    )}
                                    Schedule
                                  </button>
                                </div>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            )}

            {!isAdminDetailPage && activeView === 'consultants' && (
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
              <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white">
                <table className="w-full table-fixed divide-y divide-gray-100 text-left text-sm">
                  <colgroup>
                    <col className="w-[20%]" />
                    <col className="w-[22%]" />
                    <col className="w-[10%]" />
                    <col className="w-[14%]" />
                    <col className="w-[14%]" />
                    <col className="w-[20%]" />
                  </colgroup>
                  <thead className="bg-gradient-to-r from-[#000047] via-primary-700 to-cyan-600">
                    <tr className="text-xs font-extrabold uppercase tracking-wide text-white">
                      <th className="px-4 py-4">Consultant Name</th>
                      <th className="px-4 py-4">Capabilities</th>
                      <th className="px-4 py-4">Clients</th>
                      <th className="px-4 py-4">Project Paid</th>
                      <th className="px-4 py-4">Referral Paid</th>
                      <th className="px-4 py-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white">
                    {consultants.map((consultant) => (
                      <tr key={consultant.id} className="align-middle transition hover:bg-primary-50/40">
                        <td className="break-words bg-slate-50 px-4 py-5 font-black leading-6 text-gray-950">{consultant.sanityName || consultant.name || 'Unnamed consultant'}</td>
                        <td className="break-words bg-cyan-50/70 px-4 py-5 font-semibold leading-6 text-gray-800">
                          {consultant.capabilities.length > 0
                            ? consultant.capabilities.map((capability) => capability.title).join(', ')
                            : 'No connected capabilities'}
                        </td>
                        <td className="bg-slate-50 px-4 py-5">
                          <span className="inline-flex h-9 min-w-9 items-center justify-center rounded-full bg-white px-3 text-sm font-black text-primary-700 ring-1 ring-primary-100">
                            {consultant.attachedBriefs.length}
                          </span>
                        </td>
                        <td className="bg-cyan-50/70 px-4 py-5 font-black leading-6 text-emerald-700">{formatCurrency(getPaymentTotal(consultant.projectPayments))}</td>
                        <td className="bg-cyan-50/70 px-4 py-5 font-black leading-6 text-emerald-700">{formatCurrency(getPaymentTotal(consultant.referralPayments))}</td>
                        <td className="bg-slate-50 px-4 py-5 text-right">
                          <div className="flex flex-wrap items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => navigate(`/admin/consultants/${encodeURIComponent(consultant.id)}/clients`)}
                              className="inline-flex items-center justify-center rounded-xl bg-primary-700 px-3 py-2 text-xs font-black text-white shadow-sm transition hover:bg-primary-800"
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              View clients
                            </button>
                            <button
                              type="button"
                              onClick={() => openPaymentDraft(consultant, 'project')}
                              className="inline-flex items-center justify-center rounded-xl bg-emerald-600 px-3 py-2 text-xs font-black text-white shadow-sm transition hover:bg-emerald-700"
                            >
                              <CircleDollarSign className="mr-2 h-4 w-4" />
                              Project
                            </button>
                            <button
                              type="button"
                              onClick={() => openPaymentDraft(consultant, 'referral')}
                              className="inline-flex items-center justify-center rounded-xl bg-cyan-600 px-3 py-2 text-xs font-black text-white shadow-sm transition hover:bg-cyan-700"
                            >
                              <HandCoins className="mr-2 h-4 w-4" />
                              Referral
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
          </div>
        </div>
      </div>
      {paymentDraft && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/60 px-4 py-6">
          <section className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl shadow-primary-950/30 ring-1 ring-white/60">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-primary-600">
                  {paymentDraft.paymentType === 'referral' ? 'Referral payment' : 'Project payment'}
                </p>
                <h2 className="mt-2 text-2xl font-black text-gray-950">
                  Add payment made
                </h2>
                <p className="mt-1 text-sm font-semibold text-gray-500">
                  {paymentDraft.consultant.sanityName || paymentDraft.consultant.name || paymentDraft.consultant.email}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPaymentDraft(null)}
                className="rounded-xl bg-gray-100 px-4 py-2 text-sm font-bold text-gray-700 transition hover:bg-gray-200"
              >
                Close
              </button>
            </div>

            <form className="space-y-4" onSubmit={handleSavePayment}>
              <label className="block">
                <span className="mb-2 block text-sm font-bold text-gray-700">Amount paid</span>
                <input
                  required
                  type="number"
                  min="1"
                  step="1"
                  value={paymentDraft.amount}
                  onChange={(event) => updatePaymentDraft('amount', event.target.value)}
                  className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-base font-bold text-gray-950 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                  placeholder="Enter amount"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-bold text-gray-700">Payment date</span>
                <input
                  required
                  type="date"
                  value={paymentDraft.paidAt}
                  onChange={(event) => updatePaymentDraft('paidAt', event.target.value)}
                  className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-base font-bold text-gray-950 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-bold text-gray-700">Reference or note</span>
                <textarea
                  value={paymentDraft.note}
                  onChange={(event) => updatePaymentDraft('note', event.target.value)}
                  rows={3}
                  className="w-full resize-none rounded-2xl border border-gray-200 bg-white px-4 py-3 text-base font-semibold text-gray-900 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                  placeholder="Optional note"
                />
              </label>

              <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setPaymentDraft(null)}
                  className="inline-flex items-center justify-center rounded-xl bg-gray-100 px-5 py-3 text-sm font-bold text-gray-700 transition hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingPayment}
                  className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-[#000047] via-primary-700 to-cyan-500 px-5 py-3 text-sm font-black text-white shadow-xl shadow-primary-900/20 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {savingPayment ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CircleDollarSign className="mr-2 h-4 w-4" />}
                  Save payment
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
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
                    <div className="flex flex-col gap-4 bg-gradient-to-r from-[#000047] via-primary-700 to-cyan-600 px-5 py-4 text-white sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <h3 className="break-words text-xl font-bold">{brief.clientName || brief.title || 'Client questionnaire'}</h3>
                        <p className="mt-1 break-words text-sm font-semibold text-white/85">{brief.company || 'Company not provided'} - {brief.city || brief.clientCity || brief.location || 'City not provided'}</p>
                      </div>
                      {questionnaireDetails.ownerType === 'consultant' && (
                        <button
                          type="button"
                          onClick={() => handleDetachClientFromConsultant(brief)}
                          disabled={detachingBriefId === brief.id}
                          className="inline-flex shrink-0 items-center justify-center rounded-xl bg-white px-4 py-2 text-sm font-bold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-70"
                        >
                          {detachingBriefId === brief.id ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="mr-2 h-4 w-4" />
                          )}
                          Remove client
                        </button>
                      )}
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
