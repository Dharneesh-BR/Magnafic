import { useEffect, useMemo, useState } from 'react'
import { deleteApp, getApp, getApps, initializeApp } from 'firebase/app'
import { createUserWithEmailAndPassword, getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth'
import { arrayUnion, collection, deleteDoc, doc, getDoc, onSnapshot, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore'
import { AlertCircle, Bell, BriefcaseBusiness, CalendarPlus, CircleDollarSign, HandCoins, LayoutDashboard, Eye, EyeOff, Loader2, Lock, LogOut, Mail, ShieldCheck, Trash2, UserPlus, Users } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import SEO from '../components/SEO'
import { auth, db, firebaseConfig } from '../lib/firebase'
import { mentorClient } from '../lib/sanityClient'
import { notifyConsultants } from '../lib/consultantNotifications'

const meetingPlatforms = [
  { value: 'google-meet', label: 'Google Meet' },
  { value: 'zoom', label: 'Zoom' },
  { value: 'teams', label: 'Microsoft Teams' },
]

function getMeetingPlatformLabel(value) {
  return meetingPlatforms.find((platform) => platform.value === value)?.label || 'Google Meet'
}

function getScheduledCallHistory(brief) {
  const calls = Array.isArray(brief?.scheduledCalls) ? brief.scheduledCalls : []
  const normalizedCalls = calls
    .map((call) => ({
      ...call,
      scheduledCallAt: call.scheduledCallAt || call.date || call.at,
    }))
    .filter((call) => call.scheduledCallAt)

  const latestCallTime = toComparableDate(brief?.scheduledCallAt)?.getTime?.()
  const hasLatestInHistory = normalizedCalls.some((call) => (
    toComparableDate(call.scheduledCallAt)?.getTime?.() === latestCallTime
  ))

  if (brief?.scheduledCallAt && !hasLatestInHistory) {
    normalizedCalls.push({
      scheduledCallAt: brief.scheduledCallAt,
      meetingPlatform: brief.meetingPlatform,
      meetingPlatformLabel: brief.meetingPlatformLabel,
      scheduledByAdminEmail: brief.scheduledByAdminEmail,
    })
  }

  return normalizedCalls.sort((a, b) => getActivityTime(b.scheduledCallAt) - getActivityTime(a.scheduledCallAt))
}

function formatDateTime(value) {
  const date = toComparableDate(value)
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

function toComparableDate(value) {
  const date = toDate(value)
  if (!date) return null

  const parsedDate = date instanceof Date ? date : new Date(date)
  return Number.isNaN(parsedDate.getTime()) ? null : parsedDate
}

function isWithinDateRange(value, startDate, endDate) {
  const date = toComparableDate(value)
  if (!date) return !startDate && !endDate

  if (startDate) {
    const start = new Date(`${startDate}T00:00:00`)
    if (date < start) return false
  }

  if (endDate) {
    const end = new Date(`${endDate}T23:59:59.999`)
    if (date > end) return false
  }

  return true
}

function getApplicationType(application = {}) {
  const clubName = `${application.clubName || ''}`.toLowerCase()
  const sourcePath = `${application.sourcePath || ''}`.toLowerCase()

  if (clubName.includes('founder') || sourcePath.includes('founder')) return 'founder'
  if (clubName.includes('expert') || clubName.includes('consultant') || sourcePath.includes('expert')) return 'consultant'
  return 'other'
}

function isRejectedValue(value) {
  return ['rejected', 'declined', 'junk'].includes(`${value || ''}`.toLowerCase())
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

function getScheduledCallDetails(brief, meetingPlatform) {
  const meetingPlatformLabel = getMeetingPlatformLabel(meetingPlatform)
  const answerLines = (brief.problemAnswers || [])
    .map((answer) => `${answer.question}: ${answer.label || answer.value}`)
    .filter(Boolean)

  return [
    `Client: ${brief.clientName || 'Client'}`,
    `Company: ${brief.company || 'Not provided'}`,
    `Capability: ${brief.capability || 'Not provided'}`,
    `Meeting Platform: ${meetingPlatformLabel}`,
    brief.description ? `Context: ${brief.description}` : '',
    answerLines.length ? `Answers:\n${answerLines.join('\n')}` : '',
  ].filter(Boolean).join('\n\n')
}

function getScheduledCallUrl(brief, scheduledDate, meetingPlatform) {
  const start = new Date(scheduledDate)
  const end = new Date(start)
  end.setMinutes(end.getMinutes() + 30)
  const meetingPlatformLabel = getMeetingPlatformLabel(meetingPlatform)
  const title = `Magnafic ${meetingPlatformLabel} call - ${brief.clientName || 'Client'}`
  const details = getScheduledCallDetails(brief, meetingPlatform)

  if (meetingPlatform === 'zoom') {
    return 'https://zoom.us/meeting/schedule'
  }

  if (meetingPlatform === 'teams') {
    const teamsParams = new URLSearchParams({
      subject: title,
      startTime: start.toISOString(),
      endTime: end.toISOString(),
      content: details,
    })

    return `https://teams.microsoft.com/l/meeting/new?${teamsParams.toString()}`
  }

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: title,
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

function getActivityTime(value) {
  const date = toComparableDate(value)
  return date?.getTime?.() || 0
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
    return 'Firestore permissions are blocking admin dashboard data. Allow admin users to read users, clientBriefs, communityApplications, contactMessages, and expertCallRequests.'
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
  const [communityApplications, setCommunityApplications] = useState([])
  const [contactMessages, setContactMessages] = useState([])
  const [expertCallRequests, setExpertCallRequests] = useState([])
  const [capabilitiesByExpertId, setCapabilitiesByExpertId] = useState({})
  const [sanityExpertsById, setSanityExpertsById] = useState({})
  const [sanityExpertOptions, setSanityExpertOptions] = useState([])
  const [dataLoading, setDataLoading] = useState(false)
  const [dataError, setDataError] = useState('')
  const [dataMessage, setDataMessage] = useState('')
  const [activeView, setActiveView] = useState('dashboard')
  const [applicationFilter, setApplicationFilter] = useState('all')
  const [expandedApplicationReasons, setExpandedApplicationReasons] = useState({})
  const [dashboardFilters, setDashboardFilters] = useState({
    expertId: '',
    startDate: '',
    endDate: '',
  })
  const [notificationSeenAt, setNotificationSeenAt] = useState(() => {
    const storedValue = Number(localStorage.getItem('magnafic-admin-notification-seen-at'))
    return Number.isFinite(storedValue) ? storedValue : 0
  })
  const [removingClientId, setRemovingClientId] = useState('')
  const [detachingBriefId, setDetachingBriefId] = useState('')
  const [schedulingBriefId, setSchedulingBriefId] = useState('')
  const [cancellingScheduledCallKey, setCancellingScheduledCallKey] = useState('')
  const [allocatingReferralId, setAllocatingReferralId] = useState('')
  const [deletingReferralId, setDeletingReferralId] = useState('')
  const [removingReferralAllocationKey, setRemovingReferralAllocationKey] = useState('')
  const [updatingApplicationId, setUpdatingApplicationId] = useState('')
  const [scheduleDrafts, setScheduleDrafts] = useState({})
  const [schedulePlatformDrafts, setSchedulePlatformDrafts] = useState({})
  const [allocationDrafts, setAllocationDrafts] = useState({})
  const [questionnaireDetails, setQuestionnaireDetails] = useState(null)
  const [paymentDraft, setPaymentDraft] = useState(null)
  const [savingPayment, setSavingPayment] = useState(false)
  const [credentialDraft, setCredentialDraft] = useState(null)
  const [creatingCredential, setCreatingCredential] = useState(false)
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
      onSnapshot(
        collection(db, 'communityApplications'),
        (snapshot) => {
          setCommunityApplications(snapshot.docs.map(normalizeDocument))
          setDataLoading(false)
        },
        (snapshotError) => {
          setDataError(getAdminError(snapshotError))
          setDataLoading(false)
        }
      ),
      onSnapshot(
        collection(db, 'contactMessages'),
        (snapshot) => {
          setContactMessages(snapshot.docs.map(normalizeDocument))
          setDataLoading(false)
        },
        (snapshotError) => {
          setDataError(getAdminError(snapshotError))
          setDataLoading(false)
        }
      ),
      onSnapshot(
        collection(db, 'expertCallRequests'),
        (snapshot) => {
          setExpertCallRequests(snapshot.docs.map(normalizeDocument))
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
        const nextExpertOptionsById = {}
        ;(capabilities || []).forEach((capability) => {
          ;(capability.orderedExperts || []).forEach((expert) => {
            if (!expert?._id) return

            nextSanityExpertsById[expert._id] = expert.fullName
            nextExpertOptionsById[expert._id] = {
              id: expert._id,
              name: expert.fullName,
            }

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
        setSanityExpertOptions(Object.values(nextExpertOptionsById).sort((a, b) => a.name.localeCompare(b.name)))
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

  function getAllocatedConsultants(brief) {
    const allocatedConsultants = Array.isArray(brief?.allocatedConsultants) ? brief.allocatedConsultants.filter(Boolean) : []
    if (allocatedConsultants.length > 0) return allocatedConsultants

    if (brief?.allocatedConsultantName || brief?.allocatedConsultantEmail || brief?.assignedConsultantId) {
      return [{
        id: brief.assignedConsultantId || '',
        name: brief.allocatedConsultantName || '',
        email: brief.allocatedConsultantEmail || '',
        sanityExpertId: brief.allocatedConsultantSanityId || '',
      }]
    }

    return []
  }

  function getAllocatedConsultantIds(brief) {
    const ids = new Set(getAllocatedConsultants(brief).map((consultant) => consultant.id).filter(Boolean))
    if (brief?.assignedConsultantId) ids.add(brief.assignedConsultantId)
    return ids
  }

  function isReferralAllocated(brief) {
    return (
      getAllocatedConsultantIds(brief).size > 0 ||
      (Array.isArray(brief?.matchedExpertIds) && brief.matchedExpertIds.length > 0)
    )
  }

  function isReferralRejectedOrJunk(brief) {
    return (
      isRejectedValue(brief?.status) ||
      isRejectedValue(brief?.referralStatus) ||
      isRejectedValue(brief?.adminStatus) ||
      getAllocatedConsultants(brief).some((consultant) => (
        isRejectedValue(consultant?.status) ||
        isRejectedValue(consultant?.allocationStatus) ||
        isRejectedValue(consultant?.referralStatus)
      ))
    )
  }

  const scheduleRequests = useMemo(() => briefs
    .filter((brief) => ['requested', 'scheduled'].includes(brief.scheduleRequestStatus))
    .sort((a, b) => {
      const aTime = toDate(a.scheduleRequestedAt)?.getTime?.() || 0
      const bTime = toDate(b.scheduleRequestedAt)?.getTime?.() || 0
      return bTime - aTime
    }), [briefs])

  const sortedExpertCallRequests = useMemo(() => [...expertCallRequests]
    .filter((request) => ['requested', 'scheduled'].includes(request.status || 'requested'))
    .sort((a, b) => getActivityTime(b.createdAt) - getActivityTime(a.createdAt)), [expertCallRequests])

  const referralRequests = useMemo(() => briefs
    .filter((brief) => brief.source === 'consultant-referral')
    .sort((a, b) => {
      const aTime = toDate(a.createdAt)?.getTime?.() || 0
      const bTime = toDate(b.createdAt)?.getTime?.() || 0
      return bTime - aTime
    }), [briefs])

  const referralStats = useMemo(() => ({
    submitted: referralRequests.length,
    accepted: referralRequests.filter((brief) => (
      isReferralAllocated(brief) ||
      ['accepted', 'scheduled', 'active', 'closed', 'completed', 'matching'].includes(brief.status)
    )).length,
    activeProjects: referralRequests.filter((brief) => brief.status === 'active').length,
  }), [referralRequests])

  const sortedApplications = useMemo(() => [...communityApplications].sort((a, b) => {
    const aTime = toDate(a.createdAt)?.getTime?.() || 0
    const bTime = toDate(b.createdAt)?.getTime?.() || 0
    return bTime - aTime
  }), [communityApplications])

  const filteredApplications = useMemo(() => (
    applicationFilter === 'all'
      ? sortedApplications
      : sortedApplications.filter((application) => getApplicationType(application) === applicationFilter)
  ), [applicationFilter, sortedApplications])

  const applicationStats = useMemo(() => ({
    submitted: filteredApplications.length,
    new: filteredApplications.filter((application) => (application.status || 'new') === 'new').length,
    reviewed: filteredApplications.filter((application) => application.status === 'reviewed').length,
    accepted: filteredApplications.filter((application) => application.status === 'accepted').length,
  }), [filteredApplications])

  const activityNotifications = useMemo(() => {
    const activities = []

    communityApplications.forEach((application) => {
      activities.push({
        id: `application-created-${application.id}`,
        type: 'application',
        title: 'New community application',
        description: `${application.name || 'Applicant'} applied for ${application.clubName || 'Magnafic Community'}.`,
        actor: application.email || application.contactNo || '',
        createdAt: application.createdAt,
        viewId: 'applications',
      })

      if (application.reviewedAt) {
        activities.push({
          id: `application-reviewed-${application.id}`,
          type: 'application',
          title: 'Application status updated',
          description: `${application.name || 'Applicant'} was marked ${application.status || 'reviewed'}.`,
          actor: application.reviewedByAdminEmail || 'Admin',
          createdAt: application.reviewedAt,
          viewId: 'applications',
        })
      }
    })

    contactMessages.forEach((message) => {
      activities.push({
        id: `contact-message-${message.id}`,
        type: 'contact',
        title: 'New contact form message',
        description: `${message.name || 'Website visitor'} sent a message from the contact page.`,
        actor: message.email || message.contactNo || '',
        createdAt: message.createdAt,
        viewId: 'notifications',
      })
    })

    expertCallRequests.forEach((request) => {
      activities.push({
        id: `expert-call-request-${request.id}`,
        type: 'schedule',
        title: 'New expert 1:1 call request',
        description: `${request.name || 'Website visitor'} requested a call with ${request.expertName || 'an expert'}.`,
        actor: request.email || request.contactNo || '',
        createdAt: request.createdAt,
        viewId: 'scheduleCalls',
      })
    })

    usersData.forEach((userRecord) => {
      activities.push({
        id: `user-created-${userRecord.id}`,
        type: 'user',
        title: userRecord.role === 'consultant' ? 'Consultant login created' : 'New user signup',
        description: `${userRecord.name || userRecord.email || 'User'} joined as ${userRecord.role || 'user'}.`,
        actor: userRecord.email || '',
        createdAt: userRecord.createdAt,
        viewId: userRecord.role === 'consultant' ? 'consultants' : 'clients',
      })

      const paymentKeys = ['projectPayments', 'referralPayments']
      paymentKeys.forEach((paymentKey) => {
        const payments = Array.isArray(userRecord[paymentKey]) ? userRecord[paymentKey] : []
        payments.forEach((payment, index) => {
          activities.push({
            id: `payment-${userRecord.id}-${paymentKey}-${payment.createdAt || payment.paidAt || index}`,
            type: 'payment',
            title: paymentKey === 'referralPayments' ? 'Referral payment recorded' : 'Project payment recorded',
            description: `${formatCurrency(payment.amount)} recorded for ${userRecord.name || userRecord.email || 'consultant'}.`,
            actor: payment.recordedByAdminEmail || userRecord.email || '',
            createdAt: payment.createdAt || payment.paidAt,
            viewId: 'consultants',
          })
        })
      })
    })

    briefs.forEach((brief) => {
      activities.push({
        id: `brief-created-${brief.id}`,
        type: 'brief',
        title: brief.source === 'consultant-referral' ? 'New consultant referral' : 'New client brief',
        description: `${brief.clientName || brief.company || 'Client'} submitted ${brief.capability || brief.title || 'a business request'}.`,
        actor: brief.businessEmail || brief.clientEmail || brief.referredBy?.email || '',
        createdAt: brief.createdAt,
        viewId: brief.source === 'consultant-referral' ? 'referralRequests' : 'clients',
      })

      if (brief.acceptedAt) {
        activities.push({
          id: `brief-accepted-${brief.id}`,
          type: 'brief',
          title: 'Opportunity accepted',
          description: `${brief.acceptedBy?.name || brief.assignedConsultantName || 'Consultant'} accepted ${brief.clientName || brief.company || 'a client brief'}.`,
          actor: brief.acceptedBy?.email || brief.allocatedConsultantEmail || '',
          createdAt: brief.acceptedAt,
          viewId: 'consultants',
        })
      }

      if (brief.scheduleRequestedAt) {
        activities.push({
          id: `brief-schedule-${brief.id}`,
          type: 'schedule',
          title: 'Schedule call requested',
          description: `${brief.scheduleRequestedBy?.name || 'Consultant'} requested a call for ${brief.clientName || brief.company || 'a client'}.`,
          actor: brief.scheduleRequestedBy?.email || '',
          createdAt: brief.scheduleRequestedAt,
          viewId: 'scheduleCalls',
        })
      }

      if (brief.allocatedAt) {
        activities.push({
          id: `brief-allocated-${brief.id}`,
          type: 'referral',
          title: 'Referral allocated',
          description: `${brief.allocatedConsultantName || 'Consultant'} was allocated to ${brief.clientName || brief.company || 'a referral'}.`,
          actor: brief.allocatedByAdminEmail || '',
          createdAt: brief.allocatedAt,
          viewId: 'referralRequests',
        })
      }
    })

    return activities
      .filter((activity) => getActivityTime(activity.createdAt) > 0)
      .sort((a, b) => getActivityTime(b.createdAt) - getActivityTime(a.createdAt))
  }, [briefs, communityApplications, contactMessages, expertCallRequests, usersData])

  const unreadNotificationCount = useMemo(() => (
    activityNotifications.filter((activity) => getActivityTime(activity.createdAt) > notificationSeenAt).length
  ), [activityNotifications, notificationSeenAt])

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

  const selectedDashboardConsultant = useMemo(
    () => consultants.find((consultant) => consultant.id === dashboardFilters.expertId),
    [consultants, dashboardFilters.expertId]
  )

  const dashboardBriefs = useMemo(() => briefs.filter((brief) => {
    if (!isWithinDateRange(brief.createdAt, dashboardFilters.startDate, dashboardFilters.endDate)) {
      return false
    }

    if (!selectedDashboardConsultant) return true

    return (
      brief.assignedConsultantId === selectedDashboardConsultant.id ||
      brief.allocatedConsultantSanityId === selectedDashboardConsultant.sanityExpertId ||
      brief.preferredConsultantId === selectedDashboardConsultant.sanityExpertId ||
      (
        selectedDashboardConsultant.sanityExpertId &&
        Array.isArray(brief.matchedExpertIds) &&
        brief.matchedExpertIds.includes(selectedDashboardConsultant.sanityExpertId)
      )
    )
  }), [briefs, dashboardFilters.endDate, dashboardFilters.startDate, selectedDashboardConsultant])

  const dashboardClients = useMemo(() => {
    const clientIds = new Set()
    const clientEmails = new Set()

    dashboardBriefs.forEach((brief) => {
      if (brief.clientId) clientIds.add(brief.clientId)
      if (brief.clientEmail) clientEmails.add(brief.clientEmail)
      if (brief.businessEmail) clientEmails.add(brief.businessEmail)
    })

    return clients.filter((client) => clientIds.has(client.id) || clientEmails.has(client.email))
  }, [clients, dashboardBriefs])

  const dashboardConsultants = useMemo(() => (
    selectedDashboardConsultant ? [selectedDashboardConsultant] : consultants
  ), [consultants, selectedDashboardConsultant])

  const hasDashboardFilters = Boolean(dashboardFilters.expertId || dashboardFilters.startDate || dashboardFilters.endDate)

  const getFilteredPaymentTotal = (consultant, paymentKey) => {
    const payments = Array.isArray(consultant?.[paymentKey]) ? consultant[paymentKey] : []

    return payments
      .filter((payment) => isWithinDateRange(payment?.paidAt || payment?.createdAt, dashboardFilters.startDate, dashboardFilters.endDate))
      .reduce((total, payment) => total + (Number(payment?.amount) || 0), 0)
  }

  const stats = useMemo(() => ({
    users: hasDashboardFilters ? dashboardClients.length + dashboardConsultants.length : usersData.length,
    clients: hasDashboardFilters ? dashboardClients.length : usersData.filter((item) => item.role === 'client').length,
    consultants: dashboardConsultants.length,
    briefs: dashboardBriefs.length,
    applications: sortedApplications.length,
    projectPayments: dashboardConsultants.reduce((total, consultant) => total + getFilteredPaymentTotal(consultant, 'projectPayments'), 0),
    referralPayments: dashboardConsultants.reduce((total, consultant) => total + getFilteredPaymentTotal(consultant, 'referralPayments'), 0),
  }), [dashboardBriefs.length, dashboardClients.length, dashboardConsultants, dashboardFilters.endDate, dashboardFilters.startDate, hasDashboardFilters, sortedApplications.length, usersData])

  const updateDashboardFilter = (field, value) => {
    setDashboardFilters((current) => ({
      ...current,
      [field]: value,
    }))
  }

  const resetDashboardFilters = () => {
    setDashboardFilters({
      expertId: '',
      startDate: '',
      endDate: '',
    })
  }

  const markNotificationsSeen = () => {
    const latestTime = getActivityTime(activityNotifications[0]?.createdAt) || Date.now()
    localStorage.setItem('magnafic-admin-notification-seen-at', String(latestTime))
    setNotificationSeenAt(latestTime)
  }

  const openAdminView = (viewId) => {
    setActiveView(viewId)
    if (viewId === 'notifications') markNotificationsSeen()
    navigate('/admin')
  }

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

  const updateSchedulePlatformDraft = (briefId, value) => {
    setSchedulePlatformDrafts((current) => ({
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
    const preferredConsultant = consultants.find((consultant) => (
      consultant.sanityExpertId && consultant.sanityExpertId === brief.preferredConsultantId
    ))

    if (preferredConsultant && !getAllocatedConsultantIds(brief).has(preferredConsultant.id)) return preferredConsultant.id

    return consultants.find((consultant) => !getAllocatedConsultantIds(brief).has(consultant.id))?.id || ''
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
      const allocatedConsultants = getAllocatedConsultants(brief)
      const allocatedConsultantIds = getAllocatedConsultantIds(brief)

      if (allocatedConsultantIds.has(consultant.id)) {
        setDataError('This consultant is already allocated to this referral.')
        return
      }

      const nextAllocatedConsultants = [
        ...allocatedConsultants,
        {
          id: consultant.id,
          name: consultant.sanityName || consultant.name || consultant.email || '',
          email: consultant.email || '',
          sanityExpertId: consultant.sanityExpertId || '',
          allocatedAt: new Date().toISOString(),
          allocatedByAdminId: adminProfile?.id || adminProfile?.uid || '',
          allocatedByAdminEmail: adminProfile?.email || '',
        },
      ]
      const nextMatchedExpertIds = [
        ...new Set([
          ...(Array.isArray(brief.matchedExpertIds) ? brief.matchedExpertIds : []),
          ...(consultant.sanityExpertId ? [consultant.sanityExpertId] : []),
        ]),
      ]

      await updateDoc(doc(db, 'clientBriefs', brief.id), {
        assignedConsultantId: brief.assignedConsultantId || consultant.id,
        matchedExpertIds: nextMatchedExpertIds,
        allocatedConsultants: nextAllocatedConsultants,
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

      try {
        await notifyConsultants({
          eventType: 'client-assigned',
          consultantIds: [consultant.sanityExpertId].filter(Boolean),
          context: {
            routeToAdminEmail: true,
            notificationSource: 'admin-dashboard',
            clientName: brief.clientName || brief.company || 'Client',
            company: brief.company || '',
            clientEmail: brief.clientEmail || brief.businessEmail || '',
            capability: brief.capability || '',
            additionalNotes: brief.description || brief.problem || brief.capability || '',
            referralDateTime: new Date().toISOString(),
          },
        })
      } catch (notificationError) {
        console.warn('Consultant assignment notification failed:', notificationError)
      }
    } catch (allocationError) {
      console.error('Admin referral allocation failed:', allocationError)
      setDataError(getAdminError(allocationError))
    } finally {
      setAllocatingReferralId('')
    }
  }

  const handleRemoveReferralAllocation = async (brief, consultant) => {
    if (!brief?.id || !consultant) return

    const consultantLabel = consultant.name || consultant.email || 'this consultant'
    const confirmed = window.confirm(`Remove ${consultantLabel} from this referral allocation?`)
    if (!confirmed) return

    const allocationKey = `${brief.id}-${consultant.id || consultant.sanityExpertId || consultant.email || consultant.name}`
    setRemovingReferralAllocationKey(allocationKey)
    setDataError('')
    setDataMessage('')

    try {
      const currentAllocations = getAllocatedConsultants(brief)
      const remainingAllocations = currentAllocations.filter((item) => {
        if (consultant.id && item.id === consultant.id) return false
        if (consultant.sanityExpertId && item.sanityExpertId === consultant.sanityExpertId) return false
        if (consultant.email && item.email === consultant.email) return false
        return item !== consultant
      })
      const removedSanityExpertId = consultant.sanityExpertId || ''
      const remainingMatchedExpertIds = Array.isArray(brief.matchedExpertIds)
        ? brief.matchedExpertIds.filter((expertId) => expertId !== removedSanityExpertId)
        : []
      const primaryAllocation = remainingAllocations[0] || null

      await updateDoc(doc(db, 'clientBriefs', brief.id), {
        allocatedConsultants: remainingAllocations,
        matchedExpertIds: remainingMatchedExpertIds,
        assignedConsultantId: primaryAllocation?.id || null,
        allocatedConsultantName: primaryAllocation?.name || '',
        allocatedConsultantEmail: primaryAllocation?.email || '',
        allocatedConsultantSanityId: primaryAllocation?.sanityExpertId || '',
        referralStatus: remainingAllocations.length > 0 ? 'allocated' : 'pending-admin-allocation',
        status: remainingAllocations.length > 0 ? 'matching' : 'referral-pending',
        updatedAt: serverTimestamp(),
      })
      setDataMessage('Referral allocation removed.')
    } catch (removeError) {
      console.error('Admin referral allocation removal failed:', removeError)
      setDataError(getAdminError(removeError))
    } finally {
      setRemovingReferralAllocationKey('')
    }
  }

  const handleDeleteReferral = async (brief) => {
    if (!brief?.id) return

    const referralLabel = brief.clientName || brief.company || 'this referral'
    const confirmed = window.confirm(`Delete referral for ${referralLabel}? This cannot be undone.`)
    if (!confirmed) return

    setDeletingReferralId(brief.id)
    setDataError('')
    setDataMessage('')

    try {
      await deleteDoc(doc(db, 'clientBriefs', brief.id))
      setDataMessage('Referral deleted.')
    } catch (deleteError) {
      console.error('Admin referral delete failed:', deleteError)
      setDataError(getAdminError(deleteError))
    } finally {
      setDeletingReferralId('')
    }
  }

  const handleUpdateApplicationStatus = async (application, status) => {
    if (!application?.id) return

    setUpdatingApplicationId(application.id)
    setDataError('')
    setDataMessage('')

    try {
      await updateDoc(doc(db, 'communityApplications', application.id), {
        status,
        reviewedAt: status === 'new' ? null : serverTimestamp(),
        reviewedByAdminId: status === 'new' ? '' : adminProfile?.id || adminProfile?.uid || '',
        reviewedByAdminEmail: status === 'new' ? '' : adminProfile?.email || '',
        updatedAt: serverTimestamp(),
      })
      setDataMessage('Application status updated.')
    } catch (applicationError) {
      console.error('Admin application status update failed:', applicationError)
      setDataError(getAdminError(applicationError))
    } finally {
      setUpdatingApplicationId('')
    }
  }

  const handleDeleteRejectedApplication = async (application) => {
    if (!application?.id || (application.status || 'new') !== 'rejected') return

    const applicantLabel = application.name || application.email || 'this application'
    const confirmed = window.confirm(`Delete rejected application for ${applicantLabel}? This cannot be undone.`)
    if (!confirmed) return

    setUpdatingApplicationId(application.id)
    setDataError('')
    setDataMessage('')

    try {
      await deleteDoc(doc(db, 'communityApplications', application.id))
      setDataMessage('Rejected application deleted.')
    } catch (applicationError) {
      console.error('Admin rejected application delete failed:', applicationError)
      setDataError(getAdminError(applicationError))
    } finally {
      setUpdatingApplicationId('')
    }
  }

  const handleAdminScheduleCall = async (brief) => {
    const draftValue = scheduleDrafts[brief.id] || ''
    const meetingPlatform = schedulePlatformDrafts[brief.id] || brief.meetingPlatform || 'google-meet'
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
      const scheduledCall = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
        scheduledCallAt: scheduledDate,
        meetingPlatform,
        meetingPlatformLabel: getMeetingPlatformLabel(meetingPlatform),
        scheduledByAdminId: adminProfile?.id || adminProfile?.uid || '',
        scheduledByAdminEmail: adminProfile?.email || '',
        scheduledAt: new Date().toISOString(),
      }

      await updateDoc(doc(db, 'clientBriefs', brief.id), {
        scheduleRequestStatus: 'scheduled',
        scheduledCallAt: scheduledDate,
        meetingPlatform,
        meetingPlatformLabel: getMeetingPlatformLabel(meetingPlatform),
        scheduledCalls: arrayUnion(scheduledCall),
        scheduledByAdminId: adminProfile?.id || adminProfile?.uid || '',
        scheduledByAdminEmail: adminProfile?.email || '',
        status: 'scheduled',
        updatedAt: serverTimestamp(),
      })

      setScheduleDrafts((current) => {
        const nextDrafts = { ...current }
        delete nextDrafts[brief.id]
        return nextDrafts
      })
      window.open(getScheduledCallUrl(brief, scheduledDate, meetingPlatform), '_blank', 'width=960,height=720')
    } catch (scheduleError) {
      console.error('Admin schedule call failed:', scheduleError)
      setDataError(getAdminError(scheduleError))
    } finally {
      setSchedulingBriefId('')
    }
  }

  const handleScheduleExpertCall = async (request) => {
    const draftKey = `expert-call-${request.id}`
    const draftValue = scheduleDrafts[draftKey] || formatDateTimeInput(request.preferredCallAt)
    const meetingPlatform = schedulePlatformDrafts[draftKey] || request.meetingPlatform || 'google-meet'

    if (!draftValue) {
      setDataError('Please select a call date and time before scheduling.')
      return
    }

    const scheduledDate = new Date(draftValue)
    if (Number.isNaN(scheduledDate.getTime())) {
      setDataError('Please select a valid call date and time.')
      return
    }

    setSchedulingBriefId(draftKey)
    setDataError('')
    setDataMessage('')

    try {
      await updateDoc(doc(db, 'expertCallRequests', request.id), {
        status: 'scheduled',
        scheduledCallAt: scheduledDate,
        meetingPlatform,
        meetingPlatformLabel: getMeetingPlatformLabel(meetingPlatform),
        scheduledByAdminId: adminProfile?.id || adminProfile?.uid || '',
        scheduledByAdminEmail: adminProfile?.email || '',
        scheduledAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })

      const callContext = {
        clientName: request.name,
        company: request.email,
        capability: `1:1 call with ${request.expertName || 'Magnafic expert'}`,
        description: `Contact: ${request.contactNo || 'Not provided'}\nExpert: ${request.expertName || 'Not provided'}`,
      }

      window.open(getScheduledCallUrl(callContext, scheduledDate, meetingPlatform), '_blank', 'width=960,height=720')
      setDataMessage(`Call with ${request.expertName || 'the expert'} scheduled for ${formatDateTime(scheduledDate)}.`)
    } catch (scheduleError) {
      console.error('Admin expert call scheduling failed:', scheduleError)
      setDataError(getAdminError(scheduleError))
    } finally {
      setSchedulingBriefId('')
    }
  }

  const handleCancelScheduledCall = async (brief, callIndex) => {
    const scheduledCallHistory = getScheduledCallHistory(brief)
    const callToCancel = scheduledCallHistory[callIndex]
    if (!callToCancel) return

    const confirmed = window.confirm(
      `Cancel the ${formatDateTime(callToCancel.scheduledCallAt)} ${callToCancel.meetingPlatformLabel || getMeetingPlatformLabel(callToCancel.meetingPlatform)} call?\n\nThis removes it from Magnafic. If the meeting was already saved in Zoom, Teams, or Google Calendar, cancel that external event separately.`
    )
    if (!confirmed) return

    const cancellationKey = `${brief.id}-${callToCancel.id || callIndex}`
    const cleanCall = (call) => Object.fromEntries(
      Object.entries(call).filter(([, value]) => value !== undefined)
    )
    const remainingCalls = scheduledCallHistory
      .filter((_, index) => index !== callIndex)
      .map(cleanCall)
    const latestCall = remainingCalls[0] || null

    setCancellingScheduledCallKey(cancellationKey)
    setDataError('')
    setDataMessage('')

    try {
      await updateDoc(doc(db, 'clientBriefs', brief.id), {
        scheduledCalls: remainingCalls,
        cancelledScheduledCalls: arrayUnion({
          ...cleanCall(callToCancel),
          cancelledAt: new Date(),
          cancelledByAdminId: adminProfile?.id || adminProfile?.uid || '',
          cancelledByAdminEmail: adminProfile?.email || '',
        }),
        scheduledCallAt: latestCall?.scheduledCallAt || null,
        meetingPlatform: latestCall?.meetingPlatform || '',
        meetingPlatformLabel: latestCall?.meetingPlatformLabel || (latestCall ? getMeetingPlatformLabel(latestCall.meetingPlatform) : ''),
        scheduleRequestStatus: latestCall ? 'scheduled' : 'cancelled',
        status: latestCall ? 'scheduled' : (brief.acceptedAt || brief.acceptedAtDate ? 'accepted' : 'assigned'),
        updatedAt: serverTimestamp(),
      })

      setDataMessage('Scheduled call cancelled. Cancel any saved external calendar event separately.')
    } catch (cancelError) {
      console.error('Admin cancel scheduled call failed:', cancelError)
      setDataError(getAdminError(cancelError))
    } finally {
      setCancellingScheduledCallKey('')
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

  const openCredentialDraft = () => {
    setDataError('')
    setDataMessage('')
    setCredentialDraft({
      email: '',
      password: '',
      status: 'active',
      sanityExpertId: '',
    })
  }

  const updateCredentialDraft = (field, value) => {
    setCredentialDraft((current) => current ? { ...current, [field]: value } : current)
    setDataError('')
    setDataMessage('')
  }

  const handleCreateConsultantLogin = async (event) => {
    event.preventDefault()
    if (!credentialDraft) return

    const nextEmail = credentialDraft.email.trim().toLowerCase()
    const nextPassword = credentialDraft.password
    const selectedExpert = sanityExpertOptions.find((expert) => expert.id === credentialDraft.sanityExpertId)

    if (!nextEmail || !nextPassword || !selectedExpert) {
      setDataError('Please enter email, password, and select the Sanity consultant profile.')
      return
    }

    if (nextPassword.length < 6) {
      setDataError('Password must be at least 6 characters.')
      return
    }

    const existingUser = usersData.find((item) => item.email?.toLowerCase?.() === nextEmail)
    if (existingUser) {
      setDataError('A user with this email already exists in Firestore.')
      return
    }

    setCreatingCredential(true)
    setDataError('')
    setDataMessage('')

    const secondaryAppName = 'admin-create-consultant'
    const secondaryApp = getApps().some((item) => item.name === secondaryAppName)
      ? getApp(secondaryAppName)
      : initializeApp(firebaseConfig, secondaryAppName)
    const secondaryAuth = getAuth(secondaryApp)

    try {
      const credentials = await createUserWithEmailAndPassword(secondaryAuth, nextEmail, nextPassword)

      await setDoc(doc(db, 'users', credentials.user.uid), {
        email: nextEmail,
        role: 'consultant',
        status: credentialDraft.status,
        sanityExpertId: selectedExpert.id,
        name: selectedExpert.name,
        createdAt: serverTimestamp(),
        createdByAdminId: adminProfile?.id || adminProfile?.uid || '',
        createdByAdminEmail: adminProfile?.email || '',
      })

      try {
        await notifyConsultants({
          eventType: 'expert-club-login-created',
          consultantIds: [selectedExpert.id],
          context: {
            routeToAdminEmail: true,
            notificationSource: 'admin-dashboard',
            consultantName: selectedExpert.name,
          },
        })
      } catch (notificationError) {
        console.warn('Consultant login notification failed:', notificationError)
      }

      await signOut(secondaryAuth)
      setCredentialDraft(null)
      setDataMessage(`Consultant login created for ${selectedExpert.name}.`)
    } catch (credentialError) {
      console.error('Admin consultant credential creation failed:', credentialError)
      setDataError(credentialError?.code === 'auth/email-already-in-use'
        ? 'This email already exists in Firebase Authentication.'
        : getAdminError(credentialError))
    } finally {
      setCreatingCredential(false)
      try {
        await deleteApp(secondaryApp)
      } catch {
        // The secondary app can already be disposed if Firebase cleaned it up.
      }
    }
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
                  type="text"
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
      <div className="mx-auto max-w-[1600px]">
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

        {dataMessage && (
          <div className="mb-6 rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700 ring-1 ring-emerald-100">
            {dataMessage}
          </div>
        )}

        <nav className="sticky top-3 z-40 mb-6 overflow-x-auto rounded-2xl border border-gray-100 bg-white/95 p-2 shadow-xl shadow-primary-900/5 backdrop-blur">
          <div className="flex min-w-max items-center gap-2">
              {[
                { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
                { id: 'notifications', label: 'Notifications', icon: Bell },
                { id: 'clients', label: 'Clients', icon: Users },
                { id: 'consultants', label: 'Consultants', icon: ShieldCheck },
                { id: 'applications', label: 'Applications', icon: Mail },
                { id: 'referralRequests', label: 'Referrals', icon: UserPlus },
                { id: 'scheduleCalls', label: 'Schedule Calls', icon: CalendarPlus },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => openAdminView(item.id)}
                  className={`inline-flex h-11 items-center gap-2 whitespace-nowrap rounded-xl px-4 text-sm font-semibold transition ${
                    activeView === item.id
                      ? 'bg-primary-600 text-white shadow-lg shadow-primary-900/15'
                      : 'text-gray-700 hover:bg-primary-50 hover:text-primary-700'
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="flex-1">{item.label}</span>
                  {item.id === 'notifications' && unreadNotificationCount > 0 && (
                    <span className={`rounded-full px-2 py-0.5 text-xs font-black ${
                      activeView === item.id
                        ? 'bg-white text-primary-700'
                        : 'bg-red-600 text-white'
                    }`}>
                      {unreadNotificationCount > 99 ? '99+' : unreadNotificationCount}
                    </span>
                  )}
                </button>
              ))}
          </div>
        </nav>

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
                    {selectedRouteClient && (
                      <p className="mt-2 text-sm font-semibold text-primary-700">
                        Account created: {formatDateTime(selectedRouteClient.createdAt)}
                      </p>
                    )}
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
                  <div className="overflow-x-auto rounded-2xl border border-gray-100">
                    <table className="min-w-[1200px] divide-y divide-gray-100 text-left text-sm lg:text-base">
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
                  <div className="overflow-x-auto rounded-2xl border border-gray-100">
                    <table className="min-w-[1200px] divide-y divide-gray-100 text-left text-sm lg:text-base">
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
              <div className="space-y-5">
                <section className="rounded-3xl bg-white p-5 shadow-xl shadow-primary-900/5 ring-1 ring-gray-100 sm:p-6">
                  <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <h2 className="text-xl font-bold text-gray-950">Dashboard filters</h2>
                      <p className="mt-1 text-sm text-gray-500">Filter the dashboard metrics by expert and brief/payment date range.</p>
                    </div>
                    {hasDashboardFilters && (
                      <button
                        type="button"
                        onClick={resetDashboardFilters}
                        className="inline-flex w-fit items-center justify-center rounded-xl bg-gray-100 px-4 py-2 text-sm font-bold text-gray-700 transition hover:bg-gray-200"
                      >
                        Clear filters
                      </button>
                    )}
                  </div>

                  <div className="grid gap-4 md:grid-cols-3">
                    <label className="block">
                      <span className="mb-2 block text-sm font-bold text-gray-700">Expert</span>
                      <select
                        value={dashboardFilters.expertId}
                        onChange={(event) => updateDashboardFilter('expertId', event.target.value)}
                        className="w-full rounded-xl border border-gray-200 bg-white px-3 py-3 text-sm font-semibold text-gray-900 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                      >
                        <option value="">All experts</option>
                        {consultants.map((consultant) => (
                          <option key={consultant.id} value={consultant.id}>
                            {consultant.sanityName || consultant.name || consultant.email}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="block">
                      <span className="mb-2 block text-sm font-bold text-gray-700">Start date</span>
                      <input
                        type="date"
                        value={dashboardFilters.startDate}
                        onChange={(event) => updateDashboardFilter('startDate', event.target.value)}
                        className="w-full rounded-xl border border-gray-200 bg-white px-3 py-3 text-sm font-semibold text-gray-900 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                      />
                    </label>

                    <label className="block">
                      <span className="mb-2 block text-sm font-bold text-gray-700">End date</span>
                      <input
                        type="date"
                        value={dashboardFilters.endDate}
                        onChange={(event) => updateDashboardFilter('endDate', event.target.value)}
                        min={dashboardFilters.startDate || undefined}
                        className="w-full rounded-xl border border-gray-200 bg-white px-3 py-3 text-sm font-semibold text-gray-900 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                      />
                    </label>
                  </div>
                </section>

                <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                  {[
                    { icon: Users, label: 'Total users', value: stats.users, card: 'bg-[#16324f] border-white/10', badge: 'bg-white/12 text-white' },
                    { icon: Users, label: 'Clients', value: stats.clients, card: 'bg-[#173f5f] border-white/10', badge: 'bg-white/12 text-white' },
                    { icon: ShieldCheck, label: 'Consultants', value: stats.consultants, card: 'bg-[#24285c] border-white/10', badge: 'bg-white/12 text-white' },
                    { icon: BriefcaseBusiness, label: 'Client briefs', value: stats.briefs, card: 'bg-[#303846] border-white/10', badge: 'bg-white/12 text-white' },
                    { icon: Mail, label: 'Community applications', value: stats.applications, card: 'bg-[#3a2f54] border-white/10', badge: 'bg-white/12 text-white' },
                    { icon: CircleDollarSign, label: 'Total project payment', value: formatCurrency(stats.projectPayments), card: 'bg-[#17463a] border-white/10', badge: 'bg-white/12 text-white' },
                    { icon: HandCoins, label: 'Total referral payment', value: formatCurrency(stats.referralPayments), card: 'bg-[#164e55] border-white/10', badge: 'bg-white/12 text-white' },
                  ].map((item) => (
                    <section key={item.label} className={`group relative min-h-[9rem] overflow-hidden rounded-2xl border p-6 text-white shadow-lg shadow-primary-900/10 transition hover:-translate-y-1 hover:shadow-xl hover:shadow-primary-900/20 ${item.card}`}>
                      <span className={`absolute bottom-5 right-5 flex h-11 w-11 items-center justify-center rounded-xl transition group-hover:scale-105 ${item.badge}`}>
                        <item.icon className="h-6 w-6" />
                      </span>
                      <div className="relative pr-12">
                        <p className="text-3xl font-black leading-tight text-white transition">{dataLoading ? '-' : item.value}</p>
                        <p className="mt-2 text-sm font-extrabold leading-5 text-white/80">{item.label}</p>
                      </div>
                    </section>
                  ))}
                </div>
              </div>
            )}

            {!isAdminDetailPage && activeView === 'notifications' && (
              <section className="rounded-3xl bg-white p-5 shadow-xl shadow-primary-900/5 ring-1 ring-gray-100 sm:p-6">
                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-950">Notifications</h2>
                    <p className="mt-1 text-sm text-gray-500">
                      Live website activity from clients, consultants, referrals, calls, payments, and community applications.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={markNotificationsSeen}
                    className="inline-flex w-fit items-center justify-center rounded-xl bg-primary-50 px-4 py-3 text-sm font-bold text-primary-700 transition hover:bg-primary-100"
                  >
                    <Bell className="mr-2 h-4 w-4" />
                    Mark all seen
                  </button>
                </div>

                <div className="mb-6 grid gap-4 md:grid-cols-4">
                  {[
                    { icon: Bell, label: 'Unread', value: unreadNotificationCount, card: 'bg-[#16324f] border-white/10', badge: 'bg-white/12 text-white' },
                    { icon: Mail, label: 'Forms', value: activityNotifications.filter((item) => ['application', 'contact'].includes(item.type)).length, card: 'bg-[#3a2f54] border-white/10', badge: 'bg-white/12 text-white' },
                    { icon: BriefcaseBusiness, label: 'Briefs & referrals', value: activityNotifications.filter((item) => ['brief', 'referral'].includes(item.type)).length, card: 'bg-[#303846] border-white/10', badge: 'bg-white/12 text-white' },
                    { icon: CalendarPlus, label: 'Calls & payments', value: activityNotifications.filter((item) => ['schedule', 'payment'].includes(item.type)).length, card: 'bg-[#17463a] border-white/10', badge: 'bg-white/12 text-white' },
                  ].map((item) => (
                    <section key={item.label} className={`group relative min-h-[8rem] overflow-hidden rounded-2xl border p-5 text-white shadow-lg shadow-primary-900/10 ${item.card}`}>
                      <span className={`absolute bottom-5 right-5 flex h-10 w-10 items-center justify-center rounded-xl ${item.badge}`}>
                        <item.icon className="h-5 w-5" />
                      </span>
                      <div className="relative pr-12">
                        <p className="text-3xl font-black leading-tight text-white">{dataLoading ? '-' : item.value}</p>
                        <p className="mt-2 text-sm font-extrabold leading-5 text-white/80">{item.label}</p>
                      </div>
                    </section>
                  ))}
                </div>

                {activityNotifications.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-gray-200 p-8 text-center text-sm text-gray-600">
                    No website activity found yet.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {activityNotifications.slice(0, 120).map((activity) => {
                      const isUnread = getActivityTime(activity.createdAt) > notificationSeenAt

                      return (
                        <article
                          key={activity.id}
                          className={`flex flex-col gap-4 rounded-2xl border p-4 transition sm:flex-row sm:items-start sm:justify-between ${
                            isUnread
                              ? 'border-primary-200 bg-primary-50/70'
                              : 'border-gray-100 bg-white hover:bg-gray-50'
                          }`}
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              {isUnread && <span className="h-2.5 w-2.5 rounded-full bg-red-600" />}
                              <h3 className="font-black text-gray-950">{activity.title}</h3>
                              <span className="rounded-full bg-white px-3 py-1 text-xs font-black uppercase tracking-[0.14em] text-primary-700 ring-1 ring-primary-100">
                                {activity.type}
                              </span>
                            </div>
                            <p className="mt-2 break-words text-sm font-medium leading-6 text-gray-700">{activity.description}</p>
                            <div className="mt-3 flex flex-wrap gap-3 text-xs font-bold text-gray-500">
                              <span>{formatDateTime(activity.createdAt)}</span>
                              {activity.actor && <span className="break-words">{activity.actor}</span>}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => openAdminView(activity.viewId)}
                            className="inline-flex w-fit items-center justify-center rounded-xl bg-white px-4 py-2 text-sm font-bold text-primary-700 ring-1 ring-primary-100 transition hover:bg-primary-50"
                          >
                            View
                          </button>
                        </article>
                      )
                    })}
                  </div>
                )}
              </section>
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
                  <div className="overflow-x-auto rounded-2xl border border-gray-100">
                    <table className="min-w-[1200px] divide-y divide-gray-100 text-left text-sm lg:text-base">
                      <thead className="bg-gradient-to-r from-[#000047] via-primary-700 to-cyan-600">
                        <tr className="text-xs font-extrabold uppercase tracking-wide text-white lg:text-sm">
                          <th className="break-words px-2 py-4 lg:px-3">Client Name</th>
                          <th className="break-words px-2 py-4 lg:px-3">Email</th>
                          <th className="break-words px-2 py-4 lg:px-3">Company</th>
                          <th className="break-words px-2 py-4 lg:px-3">City</th>
                          <th className="break-words px-2 py-4 lg:px-3">Phone</th>
                          <th className="break-words px-2 py-4 lg:px-3">Account Created</th>
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
                            <td className="break-words bg-cyan-50/80 px-2 py-4 font-medium leading-6 text-gray-700 lg:px-3">{formatDateTime(client.createdAt)}</td>
                            <td className="break-words bg-blue-50/80 px-2 py-4 font-bold leading-6 text-primary-700 lg:px-3">{client.attachedBriefs.length}</td>
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

            {!isAdminDetailPage && activeView === 'applications' && (
              <section className="rounded-3xl bg-white p-5 shadow-xl shadow-primary-900/5 ring-1 ring-gray-100 sm:p-6">
                <div className="mb-6 flex items-center justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-950">Community Applications</h2>
                    <p className="mt-1 text-sm text-gray-500">{filteredApplications.length} of {sortedApplications.length} founder and consultant applications.</p>
                  </div>
                  {dataLoading && <Loader2 className="h-5 w-5 animate-spin text-primary-600" />}
                </div>

                <div className="mb-6 flex flex-wrap gap-2">
                  {[
                    { value: 'all', label: 'All' },
                    { value: 'founder', label: 'Founder' },
                    { value: 'consultant', label: 'Consultant' },
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setApplicationFilter(option.value)}
                      className={`rounded-xl px-4 py-2 text-sm font-black transition ${
                        applicationFilter === option.value
                          ? 'bg-[#000047] text-white shadow-lg shadow-primary-900/15'
                          : 'bg-primary-50 text-primary-700 ring-1 ring-primary-100 hover:bg-primary-100'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>

                <div className="mb-6 grid gap-4 md:grid-cols-4">
                  {[
                    { icon: Mail, label: 'Submitted', value: applicationStats.submitted, card: 'bg-[#16324f] border-white/10', badge: 'bg-white/12 text-white' },
                    { icon: UserPlus, label: 'New', value: applicationStats.new, card: 'bg-[#303846] border-white/10', badge: 'bg-white/12 text-white' },
                    { icon: Eye, label: 'Reviewed', value: applicationStats.reviewed, card: 'bg-[#24285c] border-white/10', badge: 'bg-white/12 text-white' },
                    { icon: ShieldCheck, label: 'Accepted', value: applicationStats.accepted, card: 'bg-[#17463a] border-white/10', badge: 'bg-white/12 text-white' },
                  ].map((item) => (
                    <section key={item.label} className={`group relative min-h-[8rem] overflow-hidden rounded-2xl border p-5 text-white shadow-lg shadow-primary-900/10 ${item.card}`}>
                      <span className={`absolute bottom-5 right-5 flex h-10 w-10 items-center justify-center rounded-xl ${item.badge}`}>
                        <item.icon className="h-5 w-5" />
                      </span>
                      <div className="relative pr-12">
                        <p className="text-3xl font-black leading-tight text-white">{dataLoading ? '-' : item.value}</p>
                        <p className="mt-2 text-sm font-extrabold leading-5 text-white/80">{item.label}</p>
                      </div>
                    </section>
                  ))}
                </div>

                {filteredApplications.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-gray-200 p-8 text-center text-sm text-gray-600">
                    No community applications found.
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-2xl border border-gray-100">
                    <table className="min-w-[1100px] divide-y divide-gray-100 text-left text-sm">
                      <thead className="bg-gradient-to-r from-[#000047] via-primary-700 to-cyan-600">
                        <tr className="text-xs font-extrabold uppercase tracking-wide text-white">
                          <th className="px-3 py-4">Club</th>
                          <th className="px-3 py-4">Applicant</th>
                          <th className="px-3 py-4">Contact</th>
                          <th className="px-3 py-4">LinkedIn</th>
                          <th className="px-3 py-4">Why they want to join</th>
                          <th className="px-3 py-4">Submitted</th>
                          <th className="px-3 py-4 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 bg-white">
                        {filteredApplications.map((application) => {
                          const status = application.status || 'new'
                          const isUpdating = updatingApplicationId === application.id
                          const applicationType = getApplicationType(application)
                          const reason = application.reason || 'Not provided'
                          const isReasonExpanded = Boolean(expandedApplicationReasons[application.id])
                          const reasonLineCount = `${reason}`.split(/\r?\n/).length
                          const canExpandReason = reason !== 'Not provided' && (reasonLineCount > 5 || reason.length > 360)

                          return (
                            <tr key={application.id} className="align-top transition hover:bg-primary-50/50">
                              <td className="bg-blue-50/80 px-3 py-4 font-bold leading-6 text-gray-950">
                                <p className="max-w-[11rem] break-words">{application.clubName || 'Magnafic Community'}</p>
                                <span className="mt-2 inline-flex rounded-full bg-white px-3 py-1 text-xs font-black uppercase tracking-[0.14em] text-primary-700 ring-1 ring-primary-100">
                                  {applicationType === 'founder' ? 'Founder' : applicationType === 'consultant' ? 'Consultant' : 'Community'}
                                </span>
                                <span className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-black uppercase tracking-[0.14em] ${
                                  status === 'accepted'
                                    ? 'bg-emerald-100 text-emerald-700'
                                    : status === 'rejected'
                                      ? 'bg-red-100 text-red-700'
                                      : status === 'reviewed'
                                        ? 'bg-amber-100 text-amber-700'
                                        : 'bg-cyan-100 text-cyan-700'
                                }`}>
                                  {status}
                                </span>
                              </td>
                              <td className="bg-cyan-50/80 px-3 py-4 leading-6">
                                <p className="font-bold text-gray-950">{application.name || 'Unnamed applicant'}</p>
                                <p className="mt-1 break-words font-medium text-gray-700">{application.email || 'No email'}</p>
                              </td>
                              <td className="bg-blue-50/80 px-3 py-4 font-medium leading-6 text-gray-700">
                                {application.contactNo || 'Not provided'}
                              </td>
                              <td className="bg-cyan-50/80 px-3 py-4 font-semibold leading-6">
                                {application.linkedin ? (
                                  <a
                                    href={application.linkedin}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="break-words text-primary-700 underline decoration-primary-200 underline-offset-4 hover:text-primary-900"
                                  >
                                    View profile
                                  </a>
                                ) : (
                                  <span className="text-gray-600">Not provided</span>
                                )}
                              </td>
                              <td className="bg-blue-50/80 px-3 py-4 leading-6 text-gray-700">
                                <p className={`max-w-md whitespace-pre-wrap break-words ${!isReasonExpanded && canExpandReason ? 'line-clamp-5' : ''}`}>{reason}</p>
                                {canExpandReason && (
                                  <button
                                    type="button"
                                    onClick={() => setExpandedApplicationReasons((current) => ({
                                      ...current,
                                      [application.id]: !current[application.id],
                                    }))}
                                    className="mt-2 text-sm font-black text-primary-700 underline decoration-primary-200 underline-offset-4 transition hover:text-primary-900"
                                  >
                                    {isReasonExpanded ? 'Show less' : 'Read more'}
                                  </button>
                                )}
                              </td>
                              <td className="bg-cyan-50/80 px-3 py-4 font-medium leading-6 text-gray-700">
                                {formatDateTime(application.createdAt)}
                              </td>
                              <td className="bg-blue-50/80 px-3 py-4 text-right">
                                <div className="flex flex-wrap justify-end gap-2">
                                  {['reviewed', 'accepted', 'rejected'].map((nextStatus) => (
                                    <button
                                      key={nextStatus}
                                      type="button"
                                      onClick={() => handleUpdateApplicationStatus(application, nextStatus)}
                                      disabled={isUpdating || status === nextStatus}
                                      className={`inline-flex items-center justify-center rounded-xl px-3 py-2 text-xs font-black uppercase tracking-[0.12em] transition disabled:cursor-not-allowed disabled:opacity-60 ${
                                        nextStatus === 'accepted'
                                          ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                                          : nextStatus === 'rejected'
                                            ? 'bg-red-50 text-red-700 hover:bg-red-100'
                                            : 'bg-white text-primary-700 ring-1 ring-primary-100 hover:bg-primary-50'
                                      }`}
                                    >
                                      {isUpdating ? (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                      ) : null}
                                      {nextStatus}
                                    </button>
                                  ))}
                                  {status === 'rejected' && (
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteRejectedApplication(application)}
                                      disabled={isUpdating}
                                      className="inline-flex items-center justify-center rounded-xl bg-red-600 px-3 py-2 text-xs font-black uppercase tracking-[0.12em] text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                      {isUpdating ? (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                      ) : (
                                        <Trash2 className="mr-2 h-4 w-4" />
                                      )}
                                      Delete
                                    </button>
                                  )}
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

            {!isAdminDetailPage && activeView === 'referralRequests' && (
              <section className="rounded-3xl bg-white p-5 shadow-xl shadow-primary-900/5 ring-1 ring-gray-100 sm:p-6">
                <div className="mb-6 flex items-center justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-950">Referral Requests</h2>
                    <p className="mt-1 text-sm text-gray-500">{referralRequests.length} consultant submitted referrals.</p>
                  </div>
                  {dataLoading && <Loader2 className="h-5 w-5 animate-spin text-primary-600" />}
                </div>

                <div className="mb-6 grid gap-4 md:grid-cols-3">
                  {[
                    { icon: UserPlus, label: 'Referral Submitted', value: referralStats.submitted, card: 'bg-[#16324f] border-white/10', badge: 'bg-white/12 text-white' },
                    { icon: ShieldCheck, label: 'Referral Accepted', value: referralStats.accepted, card: 'bg-[#17463a] border-white/10', badge: 'bg-white/12 text-white' },
                    { icon: BriefcaseBusiness, label: 'Referred Active Project', value: referralStats.activeProjects, card: 'bg-[#24285c] border-white/10', badge: 'bg-white/12 text-white' },
                  ].map((item) => (
                    <section key={item.label} className={`group relative min-h-[8rem] overflow-hidden rounded-2xl border p-5 text-white shadow-lg shadow-primary-900/10 ${item.card}`}>
                      <span className={`absolute bottom-5 right-5 flex h-10 w-10 items-center justify-center rounded-xl ${item.badge}`}>
                        <item.icon className="h-5 w-5" />
                      </span>
                      <div className="relative pr-12">
                        <p className="text-3xl font-black leading-tight text-white">{dataLoading ? '-' : item.value}</p>
                        <p className="mt-2 text-sm font-extrabold leading-5 text-white/80">{item.label}</p>
                      </div>
                    </section>
                  ))}
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
                          const allocatedConsultants = getAllocatedConsultants(brief)
                          const allocatedConsultantIds = getAllocatedConsultantIds(brief)
                          const draftAllocationValue = allocationDrafts[brief.id]
                          const allocationValue = draftAllocationValue && !allocatedConsultantIds.has(draftAllocationValue)
                            ? draftAllocationValue
                            : getDefaultAllocationConsultantId(brief)

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
                                  className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-900 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                                >
                                  <option value="">Select consultant</option>
                                  {consultants.map((consultant) => (
                                    <option key={consultant.id} value={consultant.id} disabled={allocatedConsultantIds.has(consultant.id)}>
                                      {consultant.sanityName || consultant.name || consultant.email}
                                      {allocatedConsultantIds.has(consultant.id) ? ' (allocated)' : ''}
                                    </option>
                                  ))}
                                </select>
                                {allocatedConsultants.length > 0 && (
                                  <div className="mt-3 space-y-2">
                                    <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-emerald-700">Allocated</p>
                                    {allocatedConsultants.map((consultant, index) => (
                                      <div key={`${consultant.id || consultant.email || consultant.name || 'consultant'}-${index}`} className="rounded-lg bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-900 ring-1 ring-emerald-100">
                                        <div className="flex items-start justify-between gap-2">
                                          <div className="min-w-0">
                                            <p className="break-words">{consultant.name || consultant.email || 'Consultant'}</p>
                                            {consultant.email && (
                                              <p className="mt-1 break-words font-medium text-emerald-700">{consultant.email}</p>
                                            )}
                                            {(consultant.status || consultant.allocationStatus || consultant.referralStatus) && (
                                              <p className={`mt-1 text-[11px] font-black uppercase tracking-[0.14em] ${
                                                isRejectedValue(consultant.status || consultant.allocationStatus || consultant.referralStatus)
                                                  ? 'text-red-700'
                                                  : 'text-emerald-700'
                                              }`}>
                                                {consultant.status || consultant.allocationStatus || consultant.referralStatus}
                                              </p>
                                            )}
                                          </div>
                                          <button
                                            type="button"
                                            onClick={() => handleRemoveReferralAllocation(brief, consultant)}
                                            disabled={removingReferralAllocationKey === `${brief.id}-${consultant.id || consultant.sanityExpertId || consultant.email || consultant.name}`}
                                            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-red-600 ring-1 ring-red-100 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                                            title="Remove allocation"
                                            aria-label={`Remove ${consultant.name || consultant.email || 'consultant'} from allocation`}
                                          >
                                            {removingReferralAllocationKey === `${brief.id}-${consultant.id || consultant.sanityExpertId || consultant.email || consultant.name}` ? (
                                              <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                              <Trash2 className="h-4 w-4" />
                                            )}
                                          </button>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </td>
                              <td className="bg-cyan-50/80 px-2 py-4 text-right lg:px-3">
                                <div className="flex flex-wrap justify-end gap-2">
                                  <button
                                    type="button"
                                    onClick={() => handleAllocateReferral(brief)}
                                    disabled={allocatingReferralId === brief.id || !allocationValue}
                                    className="inline-flex max-w-full flex-wrap items-center justify-center rounded-xl bg-primary-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60"
                                  >
                                    {allocatingReferralId === brief.id ? (
                                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    ) : (
                                      <UserPlus className="mr-2 h-4 w-4" />
                                    )}
                                    {allocatingReferralId === brief.id ? 'Adding...' : allocatedConsultants.length > 0 ? 'Add allocation' : 'Allocate'}
                                  </button>
                                  <Link
                                    to={`/admin/briefs/${encodeURIComponent(brief.id)}`}
                                    className="inline-flex max-w-full flex-wrap items-center justify-center rounded-xl bg-white px-3 py-2 text-sm font-semibold text-primary-700 ring-1 ring-primary-100 transition hover:bg-primary-50"
                                  >
                                    <Eye className="mr-2 h-4 w-4" />
                                    Brief
                                  </Link>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteReferral(brief)}
                                    disabled={deletingReferralId === brief.id}
                                    className="inline-flex max-w-full flex-wrap items-center justify-center rounded-xl bg-red-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                                  >
                                    {deletingReferralId === brief.id ? (
                                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    ) : (
                                      <Trash2 className="mr-2 h-4 w-4" />
                                    )}
                                    Delete
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

            {!isAdminDetailPage && activeView === 'scheduleCalls' && (
              <section className="rounded-3xl bg-white p-5 shadow-xl shadow-primary-900/5 ring-1 ring-gray-100 sm:p-6">
                <div className="mb-6 flex items-center justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-950">Schedule Calls</h2>
                    <p className="mt-1 text-sm text-gray-500">
                      {scheduleRequests.length + sortedExpertCallRequests.length} active scheduling requests.
                    </p>
                  </div>
                  {dataLoading && <Loader2 className="h-5 w-5 animate-spin text-primary-600" />}
                </div>

                {sortedExpertCallRequests.length > 0 && (
                  <div className="mb-8">
                    <div className="mb-4">
                      <p className="text-xs font-black uppercase tracking-[0.18em] text-primary-600">Website requests</p>
                      <h3 className="mt-1 text-xl font-black text-gray-950">Expert 1:1 Calls</h3>
                    </div>
                    <div className="grid gap-4 xl:grid-cols-2">
                      {sortedExpertCallRequests.map((request) => {
                        const draftKey = `expert-call-${request.id}`
                        const scheduledValue = scheduleDrafts[draftKey] ?? formatDateTimeInput(request.scheduledCallAt || request.preferredCallAt)
                        const platformValue = schedulePlatformDrafts[draftKey] || request.meetingPlatform || 'google-meet'
                        const isScheduling = schedulingBriefId === draftKey

                        return (
                          <article key={request.id} className="rounded-2xl border border-primary-100 bg-primary-50/40 p-5">
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                              <div className="min-w-0">
                                <p className="text-xs font-black uppercase tracking-[0.16em] text-primary-600">{request.status || 'requested'}</p>
                                <h4 className="mt-1 break-words text-lg font-black text-gray-950">{request.name || 'Call requester'}</h4>
                                <p className="mt-1 break-words text-sm font-bold text-primary-700">With {request.expertName || 'Magnafic expert'}</p>
                                <p className="mt-3 break-words text-sm text-gray-600">{request.email || 'No email'} | {request.contactNo || 'No contact'}</p>
                                <p className="mt-2 text-sm font-semibold text-gray-700">Preferred: {formatDateTime(request.preferredCallAt)}</p>
                                {request.scheduledCallAt && (
                                  <p className="mt-1 text-sm font-bold text-emerald-700">
                                    Scheduled: {formatDateTime(request.scheduledCallAt)} | {request.meetingPlatformLabel || getMeetingPlatformLabel(request.meetingPlatform)}
                                  </p>
                                )}
                              </div>
                            </div>

                            <div className="mt-5 grid gap-3 sm:grid-cols-[minmax(0,1fr)_180px_auto]">
                              <input
                                type="datetime-local"
                                value={scheduledValue}
                                onChange={(event) => updateScheduleDraft(draftKey, event.target.value)}
                                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-900 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                              />
                              <select
                                value={platformValue}
                                onChange={(event) => updateSchedulePlatformDraft(draftKey, event.target.value)}
                                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-900 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                              >
                                {meetingPlatforms.map((platform) => (
                                  <option key={platform.value} value={platform.value}>{platform.label}</option>
                                ))}
                              </select>
                              <button
                                type="button"
                                onClick={() => handleScheduleExpertCall(request)}
                                disabled={isScheduling}
                                className="inline-flex items-center justify-center rounded-xl bg-primary-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-primary-700 disabled:opacity-60"
                              >
                                {isScheduling ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CalendarPlus className="mr-2 h-4 w-4" />}
                                {request.status === 'scheduled' ? 'Reschedule' : 'Schedule'}
                              </button>
                            </div>
                          </article>
                        )
                      })}
                    </div>
                  </div>
                )}

                {scheduleRequests.length === 0 && sortedExpertCallRequests.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-gray-200 p-8 text-center text-sm text-gray-600">
                    No schedule requests found.
                  </div>
                ) : scheduleRequests.length > 0 ? (
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
                          <th className="break-words px-2 py-4 lg:px-3">Platform</th>
                          <th className="break-words px-2 py-4 text-right lg:px-3">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 bg-white">
                        {scheduleRequests.map((brief) => {
                          const scheduledInputValue = scheduleDrafts[brief.id] ?? ''
                          const platformValue = schedulePlatformDrafts[brief.id] || brief.meetingPlatform || 'google-meet'
                          const scheduledCallHistory = getScheduledCallHistory(brief)
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
                                {scheduledCallHistory.length > 0 && (
                                  <div className="mt-3 space-y-2">
                                    <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-emerald-700">
                                      {scheduledCallHistory.length} scheduled call{scheduledCallHistory.length === 1 ? '' : 's'}
                                    </p>
                                    <div className="max-h-56 space-y-2 overflow-y-auto pr-1">
                                      {scheduledCallHistory.map((call, index) => {
                                        const cancellationKey = `${brief.id}-${call.id || index}`
                                        const isCancelling = cancellingScheduledCallKey === cancellationKey

                                        return (
                                          <div key={`${brief.id}-scheduled-call-${call.id || index}`} className="flex items-start justify-between gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-900 ring-1 ring-emerald-100">
                                            <div className="min-w-0 break-words">
                                              {formatDateTime(call.scheduledCallAt)}
                                              <span className="mt-1 block font-medium text-emerald-700">
                                                {call.meetingPlatformLabel || getMeetingPlatformLabel(call.meetingPlatform)}
                                              </span>
                                            </div>
                                            <button
                                              type="button"
                                              onClick={() => handleCancelScheduledCall(brief, index)}
                                              disabled={Boolean(cancellingScheduledCallKey)}
                                              className="inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-white text-red-600 ring-1 ring-red-100 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                                              aria-label={`Cancel call scheduled for ${formatDateTime(call.scheduledCallAt)}`}
                                              title="Cancel scheduled call"
                                            >
                                              {isCancelling ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                              ) : (
                                                <Trash2 className="h-4 w-4" />
                                              )}
                                            </button>
                                          </div>
                                        )
                                      })}
                                    </div>
                                  </div>
                                )}
                              </td>
                              <td className="bg-blue-50/80 px-2 py-4 lg:px-3">
                                <select
                                  value={platformValue}
                                  onChange={(event) => updateSchedulePlatformDraft(brief.id, event.target.value)}
                                  className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-900 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                                >
                                  {meetingPlatforms.map((platform) => (
                                    <option key={platform.value} value={platform.value}>{platform.label}</option>
                                  ))}
                                </select>
                                {brief.meetingPlatformLabel && (
                                  <p className="mt-2 break-words text-xs font-semibold text-emerald-700">
                                    Selected: {brief.meetingPlatformLabel}
                                  </p>
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
                ) : null}
              </section>
            )}

            {!isAdminDetailPage && activeView === 'consultants' && (
          <section className="rounded-3xl bg-white p-5 shadow-xl shadow-primary-900/5 ring-1 ring-gray-100 sm:p-6">
            <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-950">Consultants</h2>
                <p className="mt-1 text-sm text-gray-500">{consultants.length} consultants with connected capabilities and attached clients.</p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                {dataLoading && <Loader2 className="h-5 w-5 animate-spin text-primary-600" />}
                <button
                  type="button"
                  onClick={openCredentialDraft}
                  className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-[#000047] via-primary-700 to-cyan-500 px-4 py-3 text-sm font-black text-white shadow-lg shadow-primary-900/15 transition hover:-translate-y-0.5"
                >
                  <UserPlus className="mr-2 h-4 w-4" />
                  Create login
                </button>
              </div>
            </div>

            {consultants.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-gray-200 p-8 text-center text-sm text-gray-600">
                No consultants found.
              </div>
            ) : (
              <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white">
                <table className="w-full table-fixed divide-y divide-gray-100 text-left text-sm">
                  <colgroup>
                    <col className="w-[17%]" />
                    <col className="w-[19%]" />
                    <col className="w-[18%]" />
                    <col className="w-[8%]" />
                    <col className="w-[12%]" />
                    <col className="w-[12%]" />
                    <col className="w-[14%]" />
                  </colgroup>
                  <thead className="bg-gradient-to-r from-[#000047] via-primary-700 to-cyan-600">
                    <tr className="text-xs font-extrabold uppercase tracking-wide text-white">
                      <th className="px-4 py-4">Consultant Name</th>
                      <th className="px-4 py-4">Capabilities</th>
                      <th className="px-4 py-4">Login ID</th>
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
                        <td className="break-words bg-blue-50/80 px-4 py-5">
                          <p className="break-all font-black leading-6 text-gray-950">{consultant.email || 'No login ID'}</p>
                          {consultant.email && (
                            <button
                              type="button"
                              onClick={() => navigator.clipboard?.writeText(consultant.email)}
                              className="mt-2 inline-flex items-center rounded-lg bg-white px-2.5 py-1.5 text-xs font-black text-primary-700 ring-1 ring-primary-100 transition hover:bg-primary-50"
                            >
                              <Mail className="mr-1.5 h-3.5 w-3.5" />
                              Copy
                            </button>
                          )}
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
      {credentialDraft && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/60 px-4 py-6">
          <section className="max-h-[88vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl shadow-primary-950/30 ring-1 ring-white/60">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-primary-600">Consultant credential</p>
                <h2 className="mt-2 text-2xl font-black text-gray-950">Create consultant login</h2>
                <p className="mt-1 text-sm font-semibold text-gray-500">
                  This creates the Firebase Auth account and the matching Firestore user record.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setCredentialDraft(null)}
                className="rounded-xl bg-gray-100 px-4 py-2 text-sm font-bold text-gray-700 transition hover:bg-gray-200"
              >
                Close
              </button>
            </div>

            <form className="grid gap-4" onSubmit={handleCreateConsultantLogin}>
              <label className="block">
                <span className="mb-2 block text-sm font-bold text-gray-700">Sanity consultant profile</span>
                <select
                  required
                  value={credentialDraft.sanityExpertId}
                  onChange={(event) => updateCredentialDraft('sanityExpertId', event.target.value)}
                  className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-base font-bold text-gray-950 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                >
                  <option value="">Select consultant</option>
                  {sanityExpertOptions.map((expert) => (
                    <option key={expert.id} value={expert.id}>{expert.name}</option>
                  ))}
                </select>
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-sm font-bold text-gray-700">Email</span>
                  <input
                    required
                    type="text"
                    value={credentialDraft.email}
                    onChange={(event) => updateCredentialDraft('email', event.target.value)}
                    className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-base font-bold text-gray-950 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                    placeholder="consultant@company.com"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-bold text-gray-700">Password</span>
                  <input
                    required
                    type="text"
                    minLength={6}
                    value={credentialDraft.password}
                    onChange={(event) => updateCredentialDraft('password', event.target.value)}
                    className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-base font-bold text-gray-950 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                    placeholder="Minimum 6 characters"
                  />
                </label>
              </div>

              <label className="block">
                <span className="mb-2 block text-sm font-bold text-gray-700">Status</span>
                <select
                  value={credentialDraft.status}
                  onChange={(event) => updateCredentialDraft('status', event.target.value)}
                  className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-base font-bold text-gray-950 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                >
                  <option value="active">Active</option>
                  <option value="pending">Pending</option>
                  <option value="disabled">Disabled</option>
                </select>
              </label>

              <div className="rounded-2xl bg-blue-50 px-4 py-3 text-sm font-semibold leading-6 text-blue-900 ring-1 ring-blue-100">
                The Firestore document will be saved with role <span className="font-black">consultant</span>, selected Sanity expert id, email, status, and consultant name.
              </div>

              <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setCredentialDraft(null)}
                  className="inline-flex items-center justify-center rounded-xl bg-gray-100 px-5 py-3 text-sm font-bold text-gray-700 transition hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingCredential}
                  className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-[#000047] via-primary-700 to-cyan-500 px-5 py-3 text-sm font-black text-white shadow-xl shadow-primary-900/20 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {creatingCredential ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserPlus className="mr-2 h-4 w-4" />}
                  Create login
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
