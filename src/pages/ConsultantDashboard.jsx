import { useEffect, useMemo, useState } from 'react'
import { AlertCircle, ArrowLeft, BadgeCheck, BriefcaseBusiness, CalendarPlus, CheckCircle2, CircleDollarSign, ClipboardList, Eye, FileText, FolderCheck, Handshake, KeyRound, Loader2, LogOut, MapPin, PanelLeftClose, PanelLeftOpen, Timer, UserPlus, Users } from 'lucide-react'
import { addDoc, collection, doc, limit, onSnapshot, query, serverTimestamp, updateDoc, where } from 'firebase/firestore'
import { Link, useNavigate, useParams } from 'react-router-dom'
import SEO from '../components/SEO'
import ConsultantDocuments from '../components/ConsultantDocuments'
import { clearAuthUser, getAuthUser, setAuthUser, updateCurrentUserPassword } from '../lib/auth'
import { subscribeConsultantOpportunities } from '../lib/dashboard'
import { db } from '../lib/firebase'
import { mentorClient } from '../lib/sanityClient'
import { getExpertImage } from '../lib/expertImages'

function formatDate(date) {
  if (!date) return 'Not scheduled'

  return new Intl.DateTimeFormat('en', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

function formatDateTime(date) {
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

function getAcceptedDate(item) {
  return toDate(item.acceptedAt) || item.acceptedAtDate || (['accepted', 'scheduled', 'active', 'closed', 'completed'].includes(item.status) ? item.updatedAtDate : null)
}

const MONTH_OPTIONS = [
  { value: 0, label: 'January' },
  { value: 1, label: 'February' },
  { value: 2, label: 'March' },
  { value: 3, label: 'April' },
  { value: 4, label: 'May' },
  { value: 5, label: 'June' },
  { value: 6, label: 'July' },
  { value: 7, label: 'August' },
  { value: 8, label: 'September' },
  { value: 9, label: 'October' },
  { value: 10, label: 'November' },
  { value: 11, label: 'December' },
]

function initials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .map(part => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'M'
}

function availabilityLabel(status) {
  if (!status) return 'Available'

  return status
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, character => character.toUpperCase())
}

function getDashboardError(error) {
  if (error?.code === 'permission-denied') {
    return 'Firestore permissions are blocking consultant opportunities. Allow consultants to read briefs assigned to their uid or matched to their Sanity expert id.'
  }

  return error?.message || 'Unable to load consultant dashboard data right now.'
}

export default function ConsultantDashboard() {
  const { enquiryId } = useParams()
  const [user, setUser] = useState(() => getAuthUser())
  const [activeView, setActiveView] = useState('opportunities')
  const [expert, setExpert] = useState(null)
  const [profileLoading, setProfileLoading] = useState(true)
  const [profileError, setProfileError] = useState('')
  const [opportunities, setOpportunities] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [passwordMessage, setPasswordMessage] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [updatingPassword, setUpdatingPassword] = useState(false)
  const [isMenuExpanded, setIsMenuExpanded] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [acceptingEnquiry, setAcceptingEnquiry] = useState(false)
  const [requestingSchedule, setRequestingSchedule] = useState(false)
  const [acceptError, setAcceptError] = useState('')
  const [scheduleMessage, setScheduleMessage] = useState('')
  const [showReferralForm, setShowReferralForm] = useState(false)
  const [referralCapabilities, setReferralCapabilities] = useState([])
  const [referralForm, setReferralForm] = useState({
    clientName: '',
    company: '',
    businessEmail: '',
    capabilityId: '',
    preferredConsultantId: '',
    problem: '',
  })
  const [submittingReferral, setSubmittingReferral] = useState(false)
  const [referralMessage, setReferralMessage] = useState('')
  const [referralError, setReferralError] = useState('')
  const [selectedMonth, setSelectedMonth] = useState(() => new Date().getMonth())
  const [selectedYear, setSelectedYear] = useState(() => new Date().getFullYear())
  const navigate = useNavigate()

  const menuItems = [
    { id: 'opportunities', label: 'Dashboard', icon: BriefcaseBusiness },
    { id: 'mou', label: 'Documents', icon: FileText },
  ]

  useEffect(() => {
    const localUser = getAuthUser()

    if (!localUser?.email) {
      setUser(localUser)
      setProfileLoading(false)
      return undefined
    }

    const consultantProfileQuery = query(
      collection(db, 'users'),
      where('email', '==', localUser.email),
      limit(1)
    )

    const unsubscribe = onSnapshot(
      consultantProfileQuery,
      (snapshot) => {
        const profileDocument = snapshot.docs[0]
        const profile = profileDocument?.data() || {}
        const updatedUser = {
          ...localUser,
          ...profile,
          uid: localUser.uid,
          consultantUserId: profileDocument?.id || localUser.consultantUserId || '',
          email: profile.email || localUser.email || '',
          name: profile.name || localUser.name || '',
          role: profile.role || localUser.role || 'client',
          sanityExpertId: profile.sanityExpertId || localUser.sanityExpertId || '',
        }

        setUser(updatedUser)
        setAuthUser(updatedUser)
      },
      (profileError) => {
        console.warn('Consultant profile listener failed:', profileError)
        setUser(localUser)
      }
    )

    return unsubscribe
  }, [])

  useEffect(() => {
    const fetchExpertProfile = async () => {
      if (!user?.sanityExpertId) {
        setExpert(null)
        setProfileLoading(false)
        setProfileError('No Sanity expert profile is linked to this consultant account yet.')
        return
      }

      setProfileLoading(true)
      setProfileError('')

      try {
        const query = `*[_type == "mentor" && _id == $expertId][0] {
          _id,
          fullName,
          "slug": slug.current,
          headline,
          "imageUrl": profileImage.asset->url,
          "bannerImageUrl": bannerImage.asset->url,
          currentDesignation,
          currentCompany,
          location,
          availabilityStatus,
          totalYearsOfExperience,
          shortBio,
          profileIntro,
          keySkills,
          experience[]{
            roleTitle,
            companyName,
            employmentType,
            location,
            startDate,
            endDate,
            currentlyWorkingHere
          },
          education[]{
            schoolName,
            degree,
            fieldOfStudy,
            startDate,
            endDate
          }
        }`

        const data = await mentorClient.fetch(query, { expertId: user.sanityExpertId.trim() })
        setExpert(data)
        setProfileError(data ? '' : 'The linked Sanity expert profile was not found.')
      } catch (fetchError) {
        console.error('Error fetching consultant Sanity profile:', fetchError)
        setProfileError('Unable to load your Sanity profile right now.')
      } finally {
        setProfileLoading(false)
      }
    }

    fetchExpertProfile()
  }, [user?.sanityExpertId])

  useEffect(() => {
    let unsubscribe = null

    try {
      setLoading(true)
      unsubscribe = subscribeConsultantOpportunities(
        (items) => {
          setOpportunities(items)
          setLoading(false)
          setError('')
        },
        (dashboardError) => {
          setError(getDashboardError(dashboardError))
          setLoading(false)
        },
        { sanityExpertId: user?.sanityExpertId }
      )
    } catch (dashboardError) {
      setError(getDashboardError(dashboardError))
      setLoading(false)
    }

    return () => unsubscribe?.()
  }, [user?.sanityExpertId])

  useEffect(() => {
    const fetchReferralCapabilities = async () => {
      try {
        const data = await mentorClient.fetch(`*[_type == "capabilities"] | order(coalesce(displayOrder, 9999) asc, title asc) {
          _id,
          title,
          "slug": slug.current,
          orderedExperts[]->{
            _id,
            fullName,
            headline,
            currentDesignation,
            currentCompany
          }
        }`)
        setReferralCapabilities(data || [])
      } catch (capabilityError) {
        console.error('Referral capabilities fetch failed:', capabilityError)
      }
    }

    fetchReferralCapabilities()
  }, [])

  const yearOptions = useMemo(() => {
    const years = new Set([new Date().getFullYear()])

    opportunities.forEach((item) => {
      const year = item.createdAtDate?.getFullYear?.()
      if (year) years.add(year)
    })

    return [...years].sort((a, b) => b - a)
  }, [opportunities])

  const filteredOpportunities = useMemo(() => (
    opportunities.filter((item) => {
      const createdDate = item.createdAtDate
      if (!createdDate) return false

      return createdDate.getMonth() === Number(selectedMonth) && createdDate.getFullYear() === Number(selectedYear)
    })
  ), [opportunities, selectedMonth, selectedYear])

  const stats = useMemo(() => ({
    opportunities: filteredOpportunities.length,
    accepted: filteredOpportunities.filter((item) => ['accepted', 'scheduled'].includes(item.status)).length,
    active: filteredOpportunities.filter((item) => item.status === 'active').length,
    closed: filteredOpportunities.filter((item) => ['closed', 'completed'].includes(item.status)).length,
  }), [filteredOpportunities])

  const selectedReferralCapability = useMemo(
    () => referralCapabilities.find((capability) => capability._id === referralForm.capabilityId),
    [referralCapabilities, referralForm.capabilityId]
  )

  const updatePasswordField = (field, value) => {
    setPasswordForm(current => ({ ...current, [field]: value }))
    setPasswordMessage('')
    setPasswordError('')
  }

  const handlePasswordUpdate = async (event) => {
    event.preventDefault()
    setPasswordMessage('')
    setPasswordError('')

    if (passwordForm.newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters.')
      return
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('New password and confirm password do not match.')
      return
    }

    setUpdatingPassword(true)

    try {
      await updateCurrentUserPassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      })
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      })
      setShowPasswordForm(false)
      setPasswordMessage('Password updated successfully.')
    } catch (updateError) {
      console.error('Consultant password update failed:', updateError)
      setPasswordError(updateError?.code === 'auth/invalid-credential'
        ? 'Old password is incorrect.'
        : 'Unable to update password right now.')
    } finally {
      setUpdatingPassword(false)
    }
  }

  const handleLogout = async () => {
    await clearAuthUser()
    navigate('/')
  }

  const handleReferClient = () => {
    setShowReferralForm(true)
    setReferralMessage('')
    setReferralError('')
  }

  const updateReferralField = (field, value) => {
    setReferralForm((current) => ({
      ...current,
      [field]: value,
      ...(field === 'capabilityId' ? { preferredConsultantId: '' } : {}),
    }))
    setReferralMessage('')
    setReferralError('')
  }

  const handleReferralSubmit = async (event) => {
    event.preventDefault()
    setReferralMessage('')
    setReferralError('')

    if (!selectedReferralCapability) {
      setReferralError('Please select the expertise required.')
      return
    }

    const preferredConsultant = (selectedReferralCapability.orderedExperts || [])
      .find((mentor) => mentor._id === referralForm.preferredConsultantId)
    setSubmittingReferral(true)

    try {
      await addDoc(collection(db, 'clientBriefs'), {
        title: `${selectedReferralCapability.title} referral`,
        clientName: referralForm.clientName.trim(),
        company: referralForm.company.trim(),
        clientEmail: referralForm.businessEmail.trim(),
        businessEmail: referralForm.businessEmail.trim(),
        capability: selectedReferralCapability.title,
        capabilityId: selectedReferralCapability._id,
        capabilitySlug: selectedReferralCapability.slug || '',
        preferredConsultantId: preferredConsultant?._id || '',
        preferredConsultantName: preferredConsultant?.fullName || '',
        matchedExpertIds: [],
        description: referralForm.problem.trim(),
        problemAnswers: [
          {
            question: 'What problem are they trying to solve, and what are they looking for?',
            value: referralForm.problem.trim(),
            label: referralForm.problem.trim(),
          },
        ],
        source: 'consultant-referral',
        status: 'referral-pending',
        referralStatus: 'pending-admin-allocation',
        referredBy: {
          uid: user?.uid || '',
          name: dashboardName,
          email: user?.email || '',
          sanityExpertId: user?.sanityExpertId || '',
        },
        referredExpertName: dashboardName,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })

      setReferralForm({
        clientName: '',
        company: '',
        businessEmail: '',
        capabilityId: '',
        preferredConsultantId: '',
        problem: '',
      })
      setReferralMessage('Referral submitted successfully.')
      setShowReferralForm(false)
    } catch (submitError) {
      console.error('Referral submit failed:', submitError)
      setReferralError('Unable to submit the referral right now.')
    } finally {
      setSubmittingReferral(false)
    }
  }

  const handleAcceptEnquiry = async () => {
    if (!selectedOpportunity?.id) return

    setAcceptingEnquiry(true)
    setAcceptError('')
    setScheduleMessage('')

    try {
      await updateDoc(doc(db, 'clientBriefs', selectedOpportunity.id), {
        status: 'accepted',
        acceptedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
    } catch (acceptError) {
      console.error('Consultant enquiry accept failed:', acceptError)
      setAcceptError('Unable to accept this enquiry right now.')
    } finally {
      setAcceptingEnquiry(false)
    }
  }

  const handleRequestScheduleCall = async () => {
    if (!selectedOpportunity?.id) return

    setRequestingSchedule(true)
    setAcceptError('')
    setScheduleMessage('')

    try {
      await updateDoc(doc(db, 'clientBriefs', selectedOpportunity.id), {
        scheduleRequestStatus: 'requested',
        scheduleRequestedAt: serverTimestamp(),
        scheduleRequestedBy: {
          uid: user?.uid || '',
          name: dashboardName,
          email: user?.email || '',
          sanityExpertId: user?.sanityExpertId || '',
        },
        updatedAt: serverTimestamp(),
      })
      setScheduleMessage('Schedule request sent to admin.')
    } catch (scheduleError) {
      console.error('Consultant schedule request failed:', scheduleError)
      setAcceptError('Unable to send the schedule request right now.')
    } finally {
      setRequestingSchedule(false)
    }
  }

  const expertImage = expert ? getExpertImage(expert) : ''
  const dashboardName = expert?.fullName || user?.name || user?.email || 'Consultant'
  const dashboardHeadline = expert?.headline || expert?.currentDesignation || 'Consultant'
  const dashboardCompany = expert?.currentCompany
  const dashboardLocation = expert?.location
  const selectedOpportunity = opportunities.find((item) => item.id === enquiryId)

  return (
    <div className="min-h-screen bg-[#f7f9ff] px-4 py-10 sm:px-6 lg:px-8">
      <SEO title="Consultant Dashboard" description="Magnafic consultant dashboard." path="/dashboard/consultant" noIndex />
      <div className="mx-auto max-w-7xl">
        <section className="mb-8 rounded-lg border border-cyan-100 bg-white shadow-[0_0_24px_rgba(0,255,255,0.18)]">
          <div className="relative h-36 overflow-hidden rounded-t-lg bg-[#000047] sm:h-40 lg:h-44">
            {expert?.bannerImageUrl ? (
              <img src={expert.bannerImageUrl} alt="" className="h-full w-full object-cover object-center" />
            ) : (
              <div className="h-full w-full bg-gradient-to-r from-[#000047] via-primary-700 to-cyan-500" />
            )}
            <div className="absolute inset-0 bg-gradient-to-r from-[#000047]/45 via-[#000047]/20 to-cyan-400/20" />
            <div className="absolute inset-y-0 right-4 flex max-w-[58%] items-center justify-end text-right text-white sm:right-24 sm:max-w-[62%] lg:right-40">
              <div>
                <h1 className="line-clamp-2 text-xl font-extrabold leading-tight tracking-normal drop-shadow-[0_4px_16px_rgba(0,0,0,0.55)] sm:text-4xl lg:text-6xl">
                  {dashboardName}
                </h1>
                <div className="mt-2 flex flex-wrap justify-end gap-x-3 gap-y-1 text-xs font-bold text-cyan-50 drop-shadow-[0_2px_10px_rgba(0,0,0,0.45)] sm:mt-4 sm:gap-x-5 sm:gap-y-2 sm:text-base lg:text-xl">
                  {dashboardLocation && (
                    <span className="inline-flex items-center">
                      <MapPin className="mr-1.5 h-3.5 w-3.5 sm:mr-2 sm:h-4 sm:w-4 lg:h-5 lg:w-5" />
                      {dashboardLocation}
                    </span>
                  )}
                  {expert?.totalYearsOfExperience ? (
                    <span className="inline-flex items-center">
                      <Timer className="mr-1.5 h-3.5 w-3.5 sm:mr-2 sm:h-4 sm:w-4 lg:h-5 lg:w-5" />
                      {expert.totalYearsOfExperience}+ years experience
                    </span>
                  ) : null}
                </div>
              </div>
            </div>
          </div>

          <div className="relative px-4 pb-5 sm:px-6 sm:pb-6">
            <div className="flex items-start justify-between gap-3 sm:gap-4">
              <div className="relative z-20 -mt-16 h-32 w-32 shrink-0 overflow-hidden rounded-full border-4 border-white bg-primary-700 text-3xl font-bold shadow-md sm:ml-5 sm:-mt-20 sm:h-44 sm:w-44 sm:text-5xl">
                <div className="flex h-full w-full items-center justify-center">
                  {expertImage ? (
                    <img src={expertImage} alt={dashboardName} className="h-full w-full object-cover object-center" />
                  ) : (
                    <span className="text-white">{initials(dashboardName)}</span>
                  )}
                </div>
              </div>

              <span className="mt-3 inline-flex w-fit max-w-[10rem] items-center rounded-full bg-green-200 px-3 py-1.5 text-xs font-semibold text-green-800 sm:mt-8 sm:max-w-none sm:px-4 sm:py-2 sm:text-sm">
                <CheckCircle2 className="mr-1.5 h-4 w-4 sm:mr-2 sm:h-5 sm:w-5" />
                <span className="break-words leading-tight">{availabilityLabel(expert?.availabilityStatus)}</span>
              </span>
            </div>

            <div className="mt-4 gap-5 lg:flex lg:items-start lg:justify-between">
              <div className="text-left">
                <h2 className="break-words text-2xl font-semibold leading-tight text-[#000047] sm:text-3xl">{dashboardName}</h2>
                <p className="mt-2 break-words text-base font-medium leading-6 text-[#000047] sm:text-lg sm:leading-7">{dashboardHeadline}</p>
                {dashboardCompany && <p className="mt-1 break-words text-sm font-medium text-gray-700 sm:text-base">{dashboardCompany}</p>}
              </div>

              <div className="mt-5 flex flex-col items-stretch gap-3 sm:items-end lg:mt-0">
                <button
                  type="button"
                  onClick={handleReferClient}
                  className="inline-flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-[#000047] via-primary-600 to-cyan-400 px-5 py-4 text-base font-extrabold text-white shadow-xl shadow-primary-900/20 transition hover:-translate-y-0.5 hover:shadow-2xl hover:shadow-cyan-500/25 sm:w-fit sm:min-w-64"
                >
                  <UserPlus className="mr-2 h-5 w-5" />
                  Refer client
                </button>
                {referralMessage && (
                  <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700 ring-1 ring-emerald-100">
                    {referralMessage}
                  </p>
                )}
              </div>
            </div>

            {showPasswordForm && (
              <form className="mt-6 grid gap-3 rounded-2xl bg-gray-50 p-4 sm:grid-cols-2 lg:grid-cols-4" onSubmit={handlePasswordUpdate}>
                <input
                  required
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={event => updatePasswordField('currentPassword', event.target.value)}
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                  placeholder="Old password"
                />
                <input
                  required
                  minLength={8}
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={event => updatePasswordField('newPassword', event.target.value)}
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                  placeholder="New password"
                />
                <input
                  required
                  minLength={8}
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={event => updatePasswordField('confirmPassword', event.target.value)}
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                  placeholder="Confirm new password"
                />
                <button
                  type="submit"
                  disabled={updatingPassword}
                  className="inline-flex w-full items-center justify-center rounded-xl bg-primary-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {updatingPassword ? 'Updating...' : 'Submit'}
                </button>
                {(passwordMessage || passwordError) && (
                  <p className={`sm:col-span-2 lg:col-span-4 text-sm font-medium ${passwordMessage ? 'text-green-700' : 'text-red-700'}`}>
                    {passwordMessage || passwordError}
                  </p>
                )}
              </form>
            )}
          </div>
        </section>

        <div className={`grid gap-6 transition-[grid-template-columns] duration-300 lg:items-start ${
          isMenuExpanded ? 'lg:grid-cols-[260px_minmax(0,1fr)]' : 'lg:grid-cols-[88px_minmax(0,1fr)]'
        }`}>
          <aside
            className="rounded-2xl bg-white p-3 shadow-xl shadow-primary-900/5 ring-1 ring-gray-100 transition-all duration-300"
            onMouseEnter={() => setIsMenuExpanded(true)}
            onMouseLeave={() => setIsMenuExpanded(false)}
            onFocus={() => setIsMenuExpanded(true)}
            onBlur={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget)) {
                setIsMenuExpanded(false)
              }
            }}
          >
            <div className="mb-3 grid grid-cols-[2.5rem_minmax(0,1fr)_2.5rem] items-center lg:hidden">
              <span aria-hidden="true"></span>
              <p className="text-center text-lg font-extrabold uppercase tracking-[0.18em] text-[#000047]">Menu</p>
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(value => !value)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-[#000047] transition hover:bg-primary-100"
                aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
              >
                {isMobileMenuOpen ? <PanelLeftClose className="h-5 w-5" /> : <PanelLeftOpen className="h-5 w-5" />}
              </button>
            </div>
            <div className={`mb-3 hidden items-center lg:flex ${isMenuExpanded ? 'justify-between px-2' : 'justify-center'}`}>
              {isMenuExpanded && <p className="text-xs font-bold uppercase tracking-[0.18em] text-gray-400">Menu</p>}
              <button
                type="button"
                onClick={() => setIsMenuExpanded(value => !value)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-gray-500 transition hover:bg-primary-50 hover:text-primary-700"
                aria-label={isMenuExpanded ? 'Collapse menu' : 'Expand menu'}
              >
                {isMenuExpanded ? <PanelLeftClose className="h-5 w-5" /> : <PanelLeftOpen className="h-5 w-5" />}
              </button>
            </div>
            <div className={`${isMobileMenuOpen ? 'block' : 'hidden'} lg:block`}>
            <nav className="grid grid-cols-2 gap-2 lg:block lg:space-y-2">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setActiveView(item.id)
                    setIsMobileMenuOpen(false)
                  }}
                  title={item.label}
                  className={`flex w-full items-center rounded-xl px-4 py-3 text-left text-sm font-semibold transition ${
                    activeView === item.id
                      ? 'bg-[#000047] text-white shadow-lg shadow-primary-900/15'
                      : 'text-gray-700 hover:bg-primary-50 hover:text-primary-700'
                  } ${isMenuExpanded ? 'gap-3 lg:justify-start' : 'gap-3 lg:justify-center'}`}
                >
                  <item.icon className="h-5 w-5" />
                  <span className={`${isMenuExpanded ? 'lg:inline' : 'lg:hidden'}`}>{item.label}</span>
                </button>
              ))}
            </nav>
            <div className="mt-4 grid grid-cols-2 gap-2 border-t border-gray-100 pt-4 lg:block lg:space-y-2">
              <button
                type="button"
                onClick={() => {
                  setShowPasswordForm(value => !value)
                  setPasswordMessage('')
                  setPasswordError('')
                }}
                title="Reset password"
                className={`flex w-full items-center rounded-xl px-4 py-3 text-left text-sm font-semibold text-gray-700 transition hover:bg-primary-50 hover:text-primary-700 ${
                  isMenuExpanded ? 'gap-3 lg:justify-start' : 'gap-3 lg:justify-center'
                }`}
              >
                <KeyRound className="h-5 w-5" />
                <span className={`${isMenuExpanded ? 'lg:inline' : 'lg:hidden'}`}>
                  {showPasswordForm ? 'Close reset' : 'Reset password'}
                </span>
              </button>
              <button
                type="button"
                onClick={handleLogout}
                title="Logout"
                className={`flex w-full items-center rounded-xl px-4 py-3 text-left text-sm font-semibold text-gray-700 transition hover:bg-primary-50 hover:text-primary-700 ${
                  isMenuExpanded ? 'gap-3 lg:justify-start' : 'gap-3 lg:justify-center'
                }`}
              >
                <LogOut className="h-5 w-5" />
                <span className={`${isMenuExpanded ? 'lg:inline' : 'lg:hidden'}`}>Logout</span>
              </button>
            </div>
            </div>
          </aside>

          <div className="min-w-0">
            {activeView === 'opportunities' && (
              <>
                {error && (
                  <div className="mb-6 flex gap-3 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                    <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
                    <p>{error}</p>
                  </div>
                )}

                {enquiryId ? (
                  <section className="rounded-3xl bg-white p-5 shadow-xl shadow-primary-900/5 ring-1 ring-gray-100 sm:p-8">
                    <Link to="/dashboard/consultant" className="mb-6 inline-flex items-center text-sm font-semibold text-primary-700 transition hover:text-primary-900">
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back to enquiries
                    </Link>

                    {loading ? (
                      <div className="flex items-center justify-center rounded-2xl bg-gray-50 p-10 text-primary-600">
                        <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                        Loading enquiry...
                      </div>
                    ) : selectedOpportunity ? (
                      <>
                        <div className="mb-6 flex flex-col gap-4 border-b border-gray-100 pb-6 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary-600">Questionnaire</p>
                            <h2 className="mt-2 text-2xl font-bold text-gray-950">{selectedOpportunity.clientName || 'Client'}</h2>
                            <p className="mt-2 text-sm text-gray-600">{selectedOpportunity.company || 'Not provided'} - {selectedOpportunity.city || selectedOpportunity.clientCity || selectedOpportunity.location || 'City not provided'}</p>
                          </div>
                          <div className="flex flex-col gap-3 sm:flex-row">
                            <button
                              type="button"
                              onClick={handleAcceptEnquiry}
                              disabled={acceptingEnquiry || selectedOpportunity.status === 'accepted'}
                              className="inline-flex items-center justify-center rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
                            >
                              <CheckCircle2 className="mr-2 h-4 w-4" />
                              {selectedOpportunity.status === 'accepted' ? 'Accepted' : acceptingEnquiry ? 'Accepting...' : 'Accept'}
                            </button>
                            <button
                              type="button"
                              onClick={handleRequestScheduleCall}
                              disabled={requestingSchedule || ['requested', 'scheduled'].includes(selectedOpportunity.scheduleRequestStatus)}
                              className="inline-flex items-center justify-center rounded-xl bg-primary-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-primary-700"
                            >
                              <CalendarPlus className="mr-2 h-4 w-4" />
                              {selectedOpportunity.scheduleRequestStatus === 'scheduled'
                                ? 'Call scheduled'
                                : selectedOpportunity.scheduleRequestStatus === 'requested'
                                  ? 'Requested'
                                  : requestingSchedule
                                    ? 'Requesting...'
                                    : 'Schedule call'}
                            </button>
                          </div>
                        </div>

                        {(acceptError || scheduleMessage) && (
                          <div className={`mb-6 flex gap-3 rounded-2xl px-4 py-3 text-sm font-medium ${
                            acceptError
                              ? 'border border-red-100 bg-red-50 text-red-700'
                              : 'border border-emerald-100 bg-emerald-50 text-emerald-700'
                          }`}>
                            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
                            <p>{acceptError || scheduleMessage}</p>
                          </div>
                        )}

                        <div className="mb-6 grid gap-3 text-sm text-gray-700 sm:grid-cols-2 lg:grid-cols-4">
                          <p className="rounded-2xl bg-blue-50 p-4 ring-1 ring-blue-100"><span className="block font-semibold text-blue-950">Expertise</span>{selectedOpportunity.capability || 'Not provided'}</p>
                          <p className="rounded-2xl bg-cyan-50 p-4 ring-1 ring-cyan-100"><span className="block font-semibold text-cyan-950">Created</span>{formatDateTime(selectedOpportunity.createdAtDate)}</p>
                          <p className="rounded-2xl bg-emerald-50 p-4 ring-1 ring-emerald-100"><span className="block font-semibold text-emerald-950">Accepted</span>{formatDateTime(getAcceptedDate(selectedOpportunity))}</p>
                          <p className="rounded-2xl bg-indigo-50 p-4 ring-1 ring-indigo-100"><span className="block font-semibold text-indigo-950">Status</span>{selectedOpportunity.status || 'assigned'}</p>
                          <p className="rounded-2xl bg-amber-50 p-4 ring-1 ring-amber-100"><span className="block font-semibold text-amber-950">Call</span>{selectedOpportunity.scheduledCallAt ? formatDateTime(toDate(selectedOpportunity.scheduledCallAt)) : selectedOpportunity.scheduleRequestStatus || 'Not requested'}</p>
                        </div>

                        {selectedOpportunity.problemAnswers?.length > 0 ? (
                          <div className="space-y-3">
                            {selectedOpportunity.problemAnswers.map((answer, index) => (
                              <div
                                key={answer.questionId || `${answer.question}-${index}`}
                                className={`rounded-2xl px-5 py-4 text-base ring-1 ${
                                  index % 2 === 0
                                    ? 'bg-blue-50/80 ring-blue-100'
                                    : 'bg-cyan-50/80 ring-cyan-100'
                                }`}
                              >
                                <p className="text-lg font-bold leading-7 text-gray-950">{answer.question}</p>
                                <p className="mt-2 text-base font-medium leading-7 text-gray-700">{answer.label || answer.value || 'Not answered'}</p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="rounded-2xl border border-dashed border-gray-200 p-8 text-center">
                            <FileText className="mx-auto mb-3 h-9 w-9 text-primary-500" />
                            <h3 className="font-bold text-gray-950">No questionnaire available</h3>
                            <p className="mt-2 text-sm text-gray-600">This enquiry does not include questionnaire responses yet.</p>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="rounded-2xl border border-dashed border-gray-200 p-8 text-center">
                        <FileText className="mx-auto mb-3 h-9 w-9 text-primary-500" />
                        <h2 className="font-bold text-gray-950">Enquiry not found</h2>
                        <p className="mt-2 text-sm text-gray-600">This enquiry is unavailable or no longer assigned to this account.</p>
                      </div>
                    )}
                  </section>
                ) : (
                  <>
                <section className="mb-5 rounded-3xl bg-white p-4 shadow-xl shadow-primary-900/5 ring-1 ring-gray-100 sm:p-5">
                  <div className="relative flex flex-col gap-4 lg:min-h-20 lg:justify-center">
                    <h2 className="text-center text-2xl font-bold text-gray-950">Dashboard</h2>
                    <div className="grid grid-cols-2 gap-3 sm:mx-auto lg:absolute lg:right-0 lg:top-1/2 lg:mx-0 lg:-translate-y-1/2">
                      <label className="block">
                        <span className="mb-2 block text-sm font-semibold text-gray-600">Month</span>
                        <select
                          value={selectedMonth}
                          onChange={event => setSelectedMonth(Number(event.target.value))}
                          className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-900 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                        >
                          {MONTH_OPTIONS.map((month) => (
                            <option key={month.value} value={month.value}>{month.label}</option>
                          ))}
                        </select>
                      </label>
                      <label className="block">
                        <span className="mb-2 block text-sm font-semibold text-gray-600">Year</span>
                        <select
                          value={selectedYear}
                          onChange={event => setSelectedYear(Number(event.target.value))}
                          className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-900 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                        >
                          {yearOptions.map((year) => (
                            <option key={year} value={year}>{year}</option>
                          ))}
                        </select>
                      </label>
                    </div>
                  </div>
                </section>

                <div className="grid grid-cols-2 gap-3 md:gap-4 xl:grid-cols-4">
                  {[
                    { icon: ClipboardList, label: 'Assigned Enquiry', value: stats.opportunities, gradient: 'from-[#000047] via-primary-600 to-cyan-400' },
                    { icon: BadgeCheck, label: 'Accepted Enquiry', value: stats.accepted, gradient: 'from-emerald-700 via-teal-600 to-cyan-400' },
                    { icon: FolderCheck, label: 'Active Projects', value: stats.active, gradient: 'from-indigo-800 via-blue-600 to-cyan-400' },
                    { icon: BriefcaseBusiness, label: 'Closed Projects', value: stats.closed, gradient: 'from-slate-900 via-slate-600 to-cyan-400' },
                    { icon: CircleDollarSign, label: 'Project Payments', value: 'INR 0', gradient: 'from-cyan-950 via-sky-700 to-cyan-400', wide: true },
                    { icon: Handshake, label: 'Referral Payments', value: 'INR 0', gradient: 'from-cyan-950 via-sky-700 to-cyan-400', wide: true },
                  ].map(item => (
                    <section key={item.label} className={`group relative flex min-h-[6.5rem] flex-col overflow-hidden rounded-2xl bg-gradient-to-br ${item.gradient} p-4 text-white shadow-xl shadow-primary-900/15 ring-1 ring-white/25 transition duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-cyan-500/25 ${item.wide ? 'col-span-2 xl:col-span-2' : ''}`}>
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(255,255,255,0.22),transparent_30%),linear-gradient(135deg,rgba(255,255,255,0.16),transparent_44%)] opacity-85"></div>
                      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-white/80 via-cyan-200 to-white/20"></div>
                      <span className="absolute bottom-5 right-5 z-10 flex h-8 w-8 items-center justify-center text-white drop-shadow-[0_4px_10px_rgba(0,0,71,0.35)] transition group-hover:scale-110">
                        <item.icon className="h-6 w-6" />
                      </span>

                      <div className="relative pr-10">
                        <p className="max-w-[16rem] text-sm font-extrabold leading-tight sm:text-base">{item.label}</p>
                      </div>

                      <span className="relative mt-auto inline-flex w-fit max-w-full items-center text-2xl font-black leading-none text-white drop-shadow-[0_6px_18px_rgba(0,0,71,0.35)] transition group-hover:scale-105 sm:text-3xl">
                        {loading && typeof item.value === 'number' ? '-' : item.value}
                      </span>
                    </section>
                  ))}
                </div>

                <section className="mt-8 rounded-3xl bg-white p-5 shadow-xl shadow-primary-900/5 ring-1 ring-gray-100 sm:p-8">
                  <div className="mb-6 flex items-center justify-between gap-4">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-950">Enquiries</h2>
                    </div>
                    {loading && <Loader2 className="h-5 w-5 animate-spin text-primary-600" />}
                  </div>

                  {!loading && filteredOpportunities.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-gray-200 p-8 text-center">
                      <Users className="mx-auto mb-4 h-10 w-10 text-primary-500" />
                      <h3 className="text-lg font-bold text-gray-950">No enquiries for this period</h3>
                      <p className="mt-2 text-sm text-gray-600">Choose another month or year to view more enquiries.</p>
                    </div>
                  ) : (
                    <div className="overflow-hidden rounded-2xl border border-gray-100">
                      <div className="bg-white lg:hidden">
                        <div className="grid grid-cols-[1.2fr_1fr_0.9fr] bg-gradient-to-r from-[#000047] via-primary-700 to-cyan-600 px-3 py-3 text-xs font-extrabold uppercase tracking-wide text-white">
                          <span>Client</span>
                          <span>Expertise</span>
                          <span className="text-right">Action</span>
                        </div>
                        {filteredOpportunities.map((item) => {
                          return (
                            <div key={item.id} className="grid grid-cols-[1.2fr_1fr_0.9fr] items-center border-b border-gray-100 text-sm last:border-b-0">
                              <div className="min-w-0 bg-blue-50/80 px-3 py-3">
                                <p className="break-words font-bold leading-5 text-gray-950">{item.clientName || 'Client'}</p>
                                <p className="mt-1 break-words text-xs font-medium leading-4 text-gray-600">{item.company || 'Not provided'}</p>
                              </div>
                              <div className="min-w-0 bg-cyan-50/80 px-3 py-3">
                                <p className="break-words font-bold leading-5 text-primary-700">{item.capability || 'Not provided'}</p>
                                <p className="mt-1 break-words text-xs font-medium leading-4 text-gray-600">{item.city || item.clientCity || item.location || 'No city'}</p>
                              </div>
                              <div className="bg-blue-50/80 px-2 py-3 text-right">
                                <Link
                                  to={`/dashboard/consultant/enquiry/${item.id}`}
                                  className="inline-flex items-center justify-center rounded-lg bg-primary-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-primary-700"
                                >
                                  <Eye className="mr-1 h-3.5 w-3.5" />
                                  View
                                </Link>
                              </div>
                            </div>
                          )
                        })}
                      </div>

                        <table className="hidden w-full table-fixed divide-y divide-gray-100 text-left text-sm lg:table lg:text-base">
                          <thead className="bg-gradient-to-r from-[#000047] via-primary-700 to-cyan-600">
                            <tr className="text-xs font-extrabold uppercase tracking-wide text-white lg:text-sm">
                              <th className="break-words px-2 py-4 lg:px-3">Client Name</th>
                              <th className="break-words px-2 py-4 lg:px-3">Company</th>
                              <th className="break-words px-2 py-4 lg:px-3">City</th>
                              <th className="break-words px-2 py-4 lg:px-3">Expertise</th>
                              <th className="break-words px-2 py-4 lg:px-3">Created Date & Time</th>
                              <th className="break-words px-2 py-4 lg:px-3">Accepted Date & Time</th>
                              <th className="break-words px-2 py-4 text-right lg:px-3">Action</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100 bg-white">
                            {filteredOpportunities.map((item) => {
                              const acceptedDate = getAcceptedDate(item)
                              return (
                                <tr key={item.id} className="transition hover:bg-primary-50/50">
                                  <td className="break-words bg-blue-50/80 px-2 py-4 font-bold leading-6 text-gray-950 lg:px-3">{item.clientName || 'Client'}</td>
                                  <td className="break-words bg-cyan-50/80 px-2 py-4 font-semibold leading-6 text-gray-800 lg:px-3">{item.company || 'Not provided'}</td>
                                  <td className="break-words bg-blue-50/80 px-2 py-4 font-semibold leading-6 text-gray-800 lg:px-3">{item.city || item.clientCity || item.location || 'Not provided'}</td>
                                  <td className="break-words bg-cyan-50/80 px-2 py-4 font-bold leading-6 text-primary-700 lg:px-3">{item.capability || 'Not provided'}</td>
                                  <td className="break-words bg-blue-50/80 px-2 py-4 font-medium leading-6 text-gray-700 lg:px-3">{formatDateTime(item.createdAtDate)}</td>
                                  <td className="break-words bg-cyan-50/80 px-2 py-4 font-medium leading-6 text-gray-700 lg:px-3">{formatDateTime(acceptedDate)}</td>
                                  <td className="bg-blue-50/80 px-2 py-4 text-right lg:px-3">
                                    <Link
                                      to={`/dashboard/consultant/enquiry/${item.id}`}
                                      className="inline-flex max-w-full flex-wrap items-center justify-center rounded-xl bg-primary-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-primary-700"
                                    >
                                      <Eye className="mr-2 h-4 w-4" />
                                      View
                                    </Link>
                                  </td>
                                </tr>
                              )
                            })}
                          </tbody>
                        </table>
                    </div>
                  )}
                </section>
                  </>
                )}
              </>
            )}

            {activeView === 'mou' && (
              <ConsultantDocuments user={user} expert={expert} />
            )}
          </div>
        </div>
      </div>
      {showReferralForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/60 px-4 py-6">
          <section className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-white p-5 shadow-2xl shadow-primary-950/30 sm:p-7">
            <div className="mb-6 flex flex-col gap-4 border-b border-gray-100 pb-5 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary-600">Referral</p>
                <h2 className="mt-2 text-2xl font-bold text-gray-950">Refer client</h2>
                <p className="mt-1 text-sm text-gray-500">Share client details so Magnafic can match the right expert.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowReferralForm(false)}
                className="inline-flex items-center justify-center rounded-xl bg-gray-100 px-4 py-2 text-sm font-bold text-gray-700 transition hover:bg-gray-200"
              >
                Close
              </button>
            </div>

            {referralError && (
              <div className="mb-5 flex gap-3 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
                <p>{referralError}</p>
              </div>
            )}

            <form className="grid gap-4" onSubmit={handleReferralSubmit}>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-gray-700">Client name</span>
                  <input
                    required
                    type="text"
                    value={referralForm.clientName}
                    onChange={(event) => updateReferralField('clientName', event.target.value)}
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                    placeholder="Client name"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-gray-700">Company</span>
                  <input
                    required
                    type="text"
                    value={referralForm.company}
                    onChange={(event) => updateReferralField('company', event.target.value)}
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                    placeholder="Company"
                  />
                </label>
              </div>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-gray-700">Business email ID</span>
                <input
                  required
                  type="email"
                  value={referralForm.businessEmail}
                  onChange={(event) => updateReferralField('businessEmail', event.target.value)}
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                  placeholder="client@company.com"
                />
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-gray-700">Expertise</span>
                  <select
                    required
                    value={referralForm.capabilityId}
                    onChange={(event) => updateReferralField('capabilityId', event.target.value)}
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                  >
                    <option value="">Select expertise</option>
                    {referralCapabilities.map((capability) => (
                      <option key={capability._id} value={capability._id}>{capability.title}</option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-gray-700">Preferred consultant</span>
                  <select
                    value={referralForm.preferredConsultantId}
                    onChange={(event) => updateReferralField('preferredConsultantId', event.target.value)}
                    disabled={!selectedReferralCapability}
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 disabled:cursor-not-allowed disabled:bg-gray-100"
                  >
                    <option value="">{selectedReferralCapability ? 'Auto match' : 'Select expertise first'}</option>
                    {(selectedReferralCapability?.orderedExperts || []).map((mentor) => (
                      <option key={mentor._id} value={mentor._id}>
                        {mentor.fullName}{mentor.currentCompany ? ` - ${mentor.currentCompany}` : ''}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-gray-700">Define their problem and what they are looking for</span>
                <textarea
                  required
                  rows={5}
                  value={referralForm.problem}
                  onChange={(event) => updateReferralField('problem', event.target.value)}
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm leading-6 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                  placeholder="Describe the client problem, goals, and support needed."
                />
              </label>

              <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setShowReferralForm(false)}
                  className="inline-flex items-center justify-center rounded-xl bg-gray-100 px-5 py-3 text-sm font-bold text-gray-700 transition hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReferral}
                  className="inline-flex items-center justify-center rounded-xl bg-primary-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {submittingReferral ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    'Submit referral'
                  )}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  )
}
