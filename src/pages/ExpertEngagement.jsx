import { useEffect, useRef, useState } from 'react'
import { collection, doc, getDocs, query, serverTimestamp, where, writeBatch } from 'firebase/firestore'
import { Link, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
  Award,
  CalendarDays,
  CheckCircle2,
  FileText,
  GraduationCap,
  Loader2,
  Mail,
  MessageSquareQuote,
  Phone,
  PlayCircle,
  UserRound,
} from 'lucide-react'
import MagnaLoader from '../components/MagnaLoader'
import SEO from '../components/SEO'
import { db } from '../lib/firebase'
import { mentorClient } from '../lib/sanityClient'
import { notifyConsultants } from '../lib/consultantNotifications'

const tabs = [
  { id: 'call', label: '1:1 Call', icon: CalendarDays },
  { id: 'insights', label: 'Insights', icon: FileText },
  { id: 'programs', label: 'Session', icon: GraduationCap },
]

function formatDate(value) {
  if (!value) return ''
  return new Date(value).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function formatTime(value) {
  if (!value) return ''
  return new Date(value).toLocaleTimeString('en-IN', {
    hour: 'numeric',
    minute: '2-digit',
  })
}

function formatProgramType(value = '') {
  return value.split('-').map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
}

const CALL_START_HOUR = 10
const CALL_END_HOUR = 18
const CALL_NOTICE_HOURS = 24

function toLocalDateInputValue(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function buildLocalCallDate(dateValue, hour) {
  if (!dateValue || !Number.isInteger(hour)) return null
  const [year, month, day] = dateValue.split('-').map(Number)
  const date = new Date(year, month - 1, day, hour, 0, 0, 0)
  return Number.isNaN(date.getTime()) ? null : date
}

function isCallDay(date) {
  const day = date?.getDay()
  return day >= 1 && day <= 6
}

function getCallTimeLabel(hour) {
  return new Date(2000, 0, 1, hour).toLocaleTimeString('en-IN', {
    hour: 'numeric',
    minute: '2-digit',
  })
}

function getCallSlotId(expertId, dateValue, hour) {
  const safeExpertId = String(expertId || 'expert').replace(/[^a-zA-Z0-9_-]/g, '_')
  return `${safeExpertId}_${dateValue}_${hour}`
}

function validateCallDateTime(date) {
  if (!date || Number.isNaN(date.getTime())) return 'Please select a valid date and time.'
  if (!isCallDay(date)) return 'Calls are available only from Monday to Saturday.'
  if (date.getHours() < CALL_START_HOUR || date.getHours() > CALL_END_HOUR || date.getMinutes() !== 0) {
    return 'Please select a call time between 10:00 AM and 6:00 PM.'
  }

  const minimumCallTime = Date.now() + (CALL_NOTICE_HOURS * 60 * 60 * 1000)
  if (date.getTime() < minimumCallTime) {
    return 'Please select a call time at least 24 hours from now.'
  }

  return ''
}

export default function ExpertEngagement() {
  const { slug, section = 'call' } = useParams()
  const activeSection = tabs.some((tab) => tab.id === section) ? section : 'call'
  const [expert, setExpert] = useState(null)
  const [programs, setPrograms] = useState([])
  const [insights, setInsights] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let mounted = true

    const loadExpertContent = async () => {
      setLoading(true)
      setError('')

      try {
        const expertData = await mentorClient.fetch(
          `*[_type == "mentor" && (slug.current == $slug || _id == $slug)][0] {
            _id,
            fullName,
            "slug": slug.current,
            headline,
            currentDesignation,
            designation,
            "imageUrl": profileImage.asset->url,
            "capabilities": *[_type == "capabilities" && ^._id in orderedExperts[]._ref] | order(coalesce(displayOrder, 9999) asc, title asc) {
              _id,
              title,
              "slug": slug.current
            },
            recommendations[]{
              name,
              designation,
              company,
              relationship,
              testimonial,
              "profileImageUrl": profileImage.asset->url
            }
          }`,
          { slug }
        )

        if (!expertData) throw new Error('Expert not found.')

        const capabilityIds = (expertData.capabilities || []).map((capability) => capability?._id).filter(Boolean)
        const [programData, insightData, videoData] = await Promise.all([
          mentorClient.fetch(
            `*[_type == "programs" && status == "published" && $expertId in mentors[]._ref] | order(featured desc, startDate desc) {
              _id,
              title,
              "slug": slug.current,
              programType,
              startDate,
              duration,
              deliveryMode,
              "heroImageUrl": heroImage.asset->url,
              "heroImageAlt": heroImage.alt
            }`,
            { expertId: expertData._id }
          ),
          mentorClient.fetch(
            `*[_type == "blog" && status != "archived" && ($expertId in experts[]._ref || capability._ref in $capabilityIds)] | order(publishedAt desc, _updatedAt desc) {
              _id,
              title,
              "slug": slug.current,
              excerpt,
              type,
              publishedAt,
              _updatedAt,
              readTime,
              "contentKind": "written",
              "imageUrl": mainImage.asset->url,
              capability->{
                _id,
                title,
                "slug": slug.current
              }
            }`,
            { expertId: expertData._id, capabilityIds }
          ),
          mentorClient.fetch(
            `*[_type == "youtubeVideos" && ($expertId in experts[]._ref || capability._ref in $capabilityIds)] | order(publishedAt desc, _updatedAt desc) {
              _id,
              title,
              youtubeUrl,
              "excerpt": description,
              "type": "video",
              publishedAt,
              _updatedAt,
              "readTime": duration,
              "contentKind": "video",
              "imageUrl": thumbnail.asset->url,
              capability->{
                _id,
                title,
                "slug": slug.current
              }
            }`,
            { expertId: expertData._id, capabilityIds }
          ),
        ])

        if (!mounted) return
        setExpert(expertData)
        setPrograms(programData || [])
        setInsights([...(insightData || []), ...(videoData || [])]
          .filter((insight, index, insights) => insight?._id && insights.findIndex((item) => item?._id === insight._id) === index)
          .sort((a, b) => new Date(b.publishedAt || b._updatedAt || 0) - new Date(a.publishedAt || a._updatedAt || 0)))
      } catch (loadError) {
        console.error('Expert engagement page failed:', loadError)
        if (mounted) setError(loadError.message || 'Unable to load this expert page.')
      } finally {
        if (mounted) setLoading(false)
      }
    }

    loadExpertContent()
    return () => {
      mounted = false
    }
  }, [slug])

  if (loading) {
    return <div className="min-h-screen bg-gray-50 px-4 pb-20 pt-28"><MagnaLoader message="Loading expert..." /></div>
  }

  if (error || !expert) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 pb-20 pt-28 text-center">
        <h1 className="text-3xl font-black text-[#000047]">Expert page unavailable</h1>
        <p className="mt-3 text-gray-600">{error}</p>
        <Link to="/experts" className="mt-6 inline-flex items-center rounded-lg bg-primary-600 px-5 py-3 font-bold text-white">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to experts
        </Link>
      </div>
    )
  }

  const expertPath = expert.slug || expert._id

  return (
    <div className="min-h-screen bg-[#f7f9ff] pb-20 pt-24">
      <SEO
        title={`${tabs.find((tab) => tab.id === activeSection)?.label} with ${expert.fullName} | Magnafic`}
        description={`Connect with ${expert.fullName} and explore their sessions and insights.`}
        path={`/experts/${expertPath}/${activeSection}`}
      />

      <section className="bg-[#000047] px-4 py-10 text-white sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 sm:flex-row sm:items-center">
          <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white/10 ring-4 ring-white/20">
            {expert.imageUrl ? (
              <img src={expert.imageUrl} alt={expert.fullName} className="h-full w-full object-cover" />
            ) : (
              <UserRound className="h-10 w-10 text-white/70" />
            )}
          </div>
          <div className="min-w-0">
            <h1 className="text-3xl font-black sm:text-4xl">{expert.fullName}</h1>
            <p className="mt-2 text-lg text-cyan-50">{expert.headline || expert.currentDesignation || expert.designation}</p>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <nav className="-mt-4 grid grid-cols-3 gap-1.5 sm:-mt-5 sm:gap-2">
          {tabs.map((tab) => (
            <Link
              key={tab.id}
              to={`/experts/${expertPath}/${tab.id}`}
              className={`inline-flex h-10 min-w-0 items-center justify-center gap-1.5 rounded-md px-1.5 text-[11px] font-extrabold leading-tight shadow-md transition sm:h-12 sm:gap-2 sm:px-5 sm:text-sm ${
                activeSection === tab.id
                  ? 'bg-gradient-to-r from-[#000047] via-[#3534cd] to-[#00bfcf] text-white shadow-primary-900/20'
                  : 'border border-primary-100 bg-white text-gray-700 hover:border-primary-300 hover:text-primary-700'
              }`}
            >
              <tab.icon className="h-4 w-4 shrink-0 sm:h-5 sm:w-5" />
              <span className="truncate">{tab.label}</span>
            </Link>
          ))}
        </nav>

        <div className="py-10">
          {activeSection === 'call' && <ExpertCallRequest expert={expert} />}
          {activeSection === 'programs' && <ExpertPrograms expert={expert} programs={programs} testimonials={expert.recommendations || []} />}
          {activeSection === 'insights' && <ExpertInsights insights={insights} />}

          <div className="mt-10 flex justify-center">
            <Link
              to={`/experts/${expertPath}`}
              className="inline-flex items-center justify-center rounded-full bg-[#000047] px-6 py-3 font-bold text-white shadow-lg shadow-primary-900/15 transition hover:bg-primary-700"
            >
              <ArrowLeft className="mr-2 h-5 w-5" />
              Back to {expert.fullName}
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

function ExpertCallRequest({ expert }) {
  const [preferredDate, setPreferredDate] = useState('')
  const [preferredTime, setPreferredTime] = useState('')
  const [showDetails, setShowDetails] = useState(false)
  const [formData, setFormData] = useState({ name: '', email: '', contactNo: '' })
  const [submitting, setSubmitting] = useState(false)
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [bookedSlotHours, setBookedSlotHours] = useState([])
  const [status, setStatus] = useState({ type: '', message: '' })

  const minimumDate = toLocalDateInputValue(new Date(Date.now() + (CALL_NOTICE_HOURS * 60 * 60 * 1000)))
  const selectedDate = preferredDate ? buildLocalCallDate(preferredDate, CALL_START_HOUR) : null
  const selectedDateIsAvailable = selectedDate ? isCallDay(selectedDate) : true
  const bookedSlotHourSet = new Set(bookedSlotHours)
  const availableTimeSlots = Array.from(
    { length: CALL_END_HOUR - CALL_START_HOUR + 1 },
    (_, index) => CALL_START_HOUR + index,
  ).filter((hour) => {
    const callDate = buildLocalCallDate(preferredDate, hour)
    return callDate
      && isCallDay(callDate)
      && callDate.getTime() >= Date.now() + (CALL_NOTICE_HOURS * 60 * 60 * 1000)
      && !bookedSlotHourSet.has(hour)
  })

  const getSelectedCallDate = () => buildLocalCallDate(preferredDate, Number(preferredTime))

  useEffect(() => {
    let mounted = true

    const loadBookedSlots = async () => {
      setBookedSlotHours([])

      if (!preferredDate || !expert?._id || !selectedDateIsAvailable) {
        setLoadingSlots(false)
        return
      }

      setLoadingSlots(true)

      try {
        const slotSnapshot = await getDocs(query(
          collection(db, 'expertCallSlots'),
          where('dateKey', '==', preferredDate),
        ))

        if (!mounted) return

        const hours = slotSnapshot.docs
          .map((slotDoc) => slotDoc.data())
          .filter((slot) => slot.expertId === expert._id && slot.active !== false)
          .map((slot) => Number(slot.hour))
          .filter((hour) => Number.isInteger(hour))

        setBookedSlotHours(hours)

        if (preferredTime && hours.includes(Number(preferredTime))) {
          setPreferredTime('')
          setShowDetails(false)
          setStatus({ type: 'error', message: 'That time slot was just booked. Please choose another available time.' })
        }
      } catch (slotError) {
        console.warn('Unable to load booked call slots:', slotError)
        if (mounted) setBookedSlotHours([])
      } finally {
        if (mounted) setLoadingSlots(false)
      }
    }

    loadBookedSlots()

    return () => {
      mounted = false
    }
  }, [expert?._id, preferredDate, preferredTime, selectedDateIsAvailable])

  const handleConnect = () => {
    if (!preferredDate || !preferredTime) {
      setStatus({ type: 'error', message: 'Please select your preferred date and time.' })
      return
    }

    const validationError = validateCallDateTime(getSelectedCallDate())
    if (validationError) {
      setStatus({ type: 'error', message: validationError })
      return
    }

    setStatus({ type: '', message: '' })
    setShowDetails(true)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSubmitting(true)
    setStatus({ type: '', message: '' })

    try {
      const preferredCallDate = getSelectedCallDate()
      const validationError = validateCallDateTime(preferredCallDate)
      if (validationError) throw new Error(validationError)

      const selectedHour = Number(preferredTime)
      if (bookedSlotHourSet.has(selectedHour)) {
        throw new Error('That time slot is no longer available. Please choose another time.')
      }

      const batch = writeBatch(db)
      const requestRef = doc(collection(db, 'expertCallRequests'))
      const slotRef = doc(db, 'expertCallSlots', getCallSlotId(expert._id, preferredDate, selectedHour))
      const timestamp = serverTimestamp()

      batch.set(slotRef, {
        expertId: expert._id,
        expertSlug: expert.slug || '',
        expertName: expert.fullName,
        dateKey: preferredDate,
        hour: selectedHour,
        slotStartAt: preferredCallDate,
        requestId: requestRef.id,
        status: 'requested',
        active: true,
        createdAt: timestamp,
        updatedAt: timestamp,
      })

      batch.set(requestRef, {
        expertId: expert._id,
        expertSlug: expert.slug || '',
        expertName: expert.fullName,
        expertHeadline: expert.headline || expert.currentDesignation || expert.designation || '',
        preferredCallAt: preferredCallDate,
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        contactNo: formData.contactNo.trim(),
        status: 'requested',
        sourcePath: window.location.pathname,
        slotId: slotRef.id,
        createdAt: timestamp,
        updatedAt: timestamp,
      })

      await batch.commit()

      try {
        await notifyConsultants({
          eventType: 'expert-call-request',
          consultantIds: [expert._id],
          context: {
            clientName: formData.name.trim(),
            clientEmail: formData.email.trim().toLowerCase(),
            contactNo: formData.contactNo.trim(),
            preferredCallAt: preferredCallDate.toLocaleString(),
            sourcePath: window.location.pathname,
          },
        })
      } catch (notificationError) {
        console.warn('Consultant 1:1 call notification failed:', notificationError)
      }

      setStatus({
        type: 'success',
        message: 'Thank you. Your 1:1 call request has been submitted. Our team will contact you shortly.',
      })
      setFormData({ name: '', email: '', contactNo: '' })
      setPreferredDate('')
      setPreferredTime('')
      setBookedSlotHours([])
      setShowDetails(false)
    } catch (submitError) {
      console.error('Expert call request failed:', submitError)
      setStatus({ type: 'error', message: submitError.message || 'Unable to submit your request right now.' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-10">
      <section className="mx-auto max-w-3xl">
        <div className="rounded-lg bg-white p-6 shadow-xl shadow-primary-900/5 ring-1 ring-gray-100 sm:p-8">
        <p className="text-sm font-black uppercase tracking-[0.16em] text-primary-600">Private consultation</p>
        <h2 className="mt-2 text-3xl font-black text-[#000047]">Request a 1:1 call with {expert.fullName}</h2>
        <p className="mt-3 leading-7 text-gray-600">Choose from the available time slots below at least 24 hours in advance. Calls are available Monday to Saturday, from 10:00 AM to 6:00 PM. Your request will be sent to Magnafic for confirmation.</p>

        <div className="mt-7 grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="preferred-call-date" className="mb-2 block text-sm font-bold text-gray-800">Preferred date *</label>
            <input
              id="preferred-call-date"
              type="date"
              value={preferredDate}
              min={minimumDate}
              onChange={(event) => {
                const value = event.target.value
                const date = buildLocalCallDate(value, CALL_START_HOUR)
                setPreferredDate(value)
                setPreferredTime('')
                setShowDetails(false)
                setStatus(
                  date && !isCallDay(date)
                    ? { type: 'error', message: 'Calls are available only from Monday to Saturday. Please select another date.' }
                    : { type: '', message: '' },
                )
              }}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 font-semibold outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
            />
          </div>
          <div>
            <label htmlFor="preferred-call-time" className="mb-2 block text-sm font-bold text-gray-800">Preferred time *</label>
            <select
              id="preferred-call-time"
              value={preferredTime}
              disabled={!preferredDate || !selectedDateIsAvailable || loadingSlots || availableTimeSlots.length === 0}
              onChange={(event) => {
                setPreferredTime(event.target.value)
                setShowDetails(false)
                setStatus({ type: '', message: '' })
              }}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 font-semibold outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400"
            >
              <option value="">{loadingSlots ? 'Checking availability...' : 'Select a time'}</option>
              {availableTimeSlots.map((hour) => (
                <option key={hour} value={hour}>{getCallTimeLabel(hour)}</option>
              ))}
            </select>
          </div>
        </div>
        {preferredDate && selectedDateIsAvailable && !loadingSlots && availableTimeSlots.length === 0 && (
          <p className="mt-3 rounded-lg bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800 ring-1 ring-amber-100">
            No slots are available on this date. Please choose another date.
          </p>
        )}

        {!showDetails && (
          <button type="button" onClick={handleConnect} className="mt-5 inline-flex w-full items-center justify-center rounded-lg bg-gradient-primary px-6 py-4 font-extrabold text-white">
            Connect <ArrowRight className="ml-2 h-5 w-5" />
          </button>
        )}

        {showDetails && (
          <form onSubmit={handleSubmit} className="mt-7 space-y-5 border-t border-gray-100 pt-7">
            <div>
              <label htmlFor="call-request-name" className="mb-2 block text-sm font-bold text-gray-800">Name *</label>
              <div className="relative">
                <UserRound className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input id="call-request-name" required value={formData.name} onChange={(event) => setFormData((current) => ({ ...current, name: event.target.value }))} className="w-full rounded-lg border border-gray-300 py-3 pl-12 pr-4 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100" placeholder="Your full name" />
              </div>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="call-request-email" className="mb-2 block text-sm font-bold text-gray-800">Email ID *</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <input id="call-request-email" type="text" required value={formData.email} onChange={(event) => setFormData((current) => ({ ...current, email: event.target.value }))} className="w-full rounded-lg border border-gray-300 py-3 pl-12 pr-4 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100" placeholder="you@example.com" />
                </div>
              </div>
              <div>
                <label htmlFor="call-request-phone" className="mb-2 block text-sm font-bold text-gray-800">Contact No *</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <input id="call-request-phone" type="tel" required value={formData.contactNo} onChange={(event) => setFormData((current) => ({ ...current, contactNo: event.target.value }))} className="w-full rounded-lg border border-gray-300 py-3 pl-12 pr-4 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100" placeholder="+91 98765 43210" />
                </div>
              </div>
            </div>
            <button type="submit" disabled={submitting} className="inline-flex w-full items-center justify-center rounded-lg bg-gradient-primary px-6 py-4 font-extrabold text-white disabled:opacity-60">
              {submitting && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
              {submitting ? 'Submitting...' : 'Submit Call Request'}
            </button>
          </form>
        )}

        {status.message && (
          <div className={`mt-5 rounded-lg p-4 text-sm font-bold ${status.type === 'success' ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100' : 'bg-red-50 text-red-700 ring-1 ring-red-100'}`}>
            {status.type === 'success' && <CheckCircle2 className="mr-2 inline h-5 w-5" />}
            {status.message}
          </div>
        )}
        </div>
      </section>
      <ExpertTestimonials testimonials={expert.recommendations || []} />
    </div>
  )
}

function ExpertPrograms({ expert, programs, testimonials }) {
  const expertPath = expert.slug || expert._id

  return (
    <div className="space-y-10">
      {programs.length ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {programs.map((program) => (
            <article key={program._id} className="group relative h-[34rem] overflow-hidden rounded-[1.5rem] bg-white shadow-lg shadow-primary-900/5 transition hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary-900/12">
              <Link
                to={`/programs/${program.slug || program._id}`}
                state={{
                  backTo: `/experts/${expertPath}/programs`,
                  backLabel: `Back to ${expert.fullName}'s Sessions`,
                }}
                className="absolute inset-0 z-10"
                aria-label={`View ${program.title}`}
              />
              <div className="relative h-full overflow-hidden bg-gradient-to-br from-[#000047] via-primary-700 to-cyan-500">
                {program.heroImageUrl ? (
                  <img
                    src={program.heroImageUrl}
                    alt={program.heroImageAlt || program.title}
                    className="absolute inset-0 h-full w-full object-contain transition duration-500 group-hover:scale-[1.02]"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Award className="h-16 w-16 text-white/80" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-b from-black/15 via-black/0 to-black/35" />
                <div className="absolute right-5 top-5 h-12 w-12">
                  <img src="/favicon.png" alt="" className="h-full w-full object-contain" />
                </div>
                <div className="absolute left-5 right-20 top-5">
                  <span className="inline-flex max-w-full items-center justify-center rounded-[1.35rem] border border-white bg-gray-950/65 px-6 py-3 text-center text-sm font-black uppercase tracking-wide text-white shadow-lg shadow-black/20 backdrop-blur-sm">
                    <span className="truncate">{formatProgramType(program.programType)}</span>
                  </span>
                </div>
                <div className="absolute bottom-6 left-5 right-5 rounded-[1.5rem] bg-gray-100/70 p-5 text-gray-950 shadow-2xl shadow-primary-950/15 backdrop-blur-sm">
                  <h2 className="text-xl font-semibold leading-snug text-gray-950">
                    {program.title}
                  </h2>
                  {(program.duration || program.startDate) && (
                    <p className="mt-4 truncate text-xs font-bold uppercase tracking-[0.12em] text-gray-700">
                      {[program.duration, program.startDate && formatDate(program.startDate), program.startDate && formatTime(program.startDate)].filter(Boolean).join(' | ')}
                    </p>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <EmptyState title="No sessions published yet" copy="Sessions led by this expert will appear here." />
      )}
      <ExpertTestimonials testimonials={testimonials} />
    </div>
  )
}

function ExpertTestimonials({ testimonials = [] }) {
  const items = testimonials.filter((item) => item?.testimonial)
  if (!items.length) return null

  return (
    <section className="min-w-0 overflow-hidden">
      <div className="mb-5 px-2 text-center sm:mb-6">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-primary-600">Testimonials</p>
        <h2 className="mt-2 break-words text-xl font-black leading-tight text-[#000047] sm:text-3xl">What people say about this expert</h2>
      </div>
      <div className="grid min-w-0 gap-4 md:grid-cols-2 md:gap-5">
        {items.map((item, index) => (
          <article key={`${item.name || 'testimonial'}-${index}`} className="min-w-0 overflow-hidden rounded-lg bg-white p-4 shadow-xl shadow-primary-900/5 ring-1 ring-gray-100 sm:p-6">
            <MessageSquareQuote className="h-6 w-6 text-primary-500 sm:h-7 sm:w-7" />
            <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-6 text-gray-700 sm:mt-4 sm:text-base sm:leading-7">{item.testimonial}</p>
            <div className="mt-4 flex min-w-0 items-start gap-3 border-t border-gray-100 pt-4 sm:mt-5 sm:items-center">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary-50 text-primary-700 sm:h-11 sm:w-11">
                {item.profileImageUrl ? (
                  <img src={item.profileImageUrl} alt={item.name || 'Testimonial author'} className="h-full w-full object-cover" />
                ) : (
                  <UserRound className="h-5 w-5" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="break-words font-extrabold leading-5 text-gray-950">{item.name || 'Client'}</h3>
                <p className="mt-0.5 break-words text-sm leading-5 text-gray-600">{[item.designation, item.company].filter(Boolean).join(' | ')}</p>
                {item.relationship && <p className="mt-1 break-words text-[11px] font-bold uppercase leading-4 tracking-wide text-primary-600 sm:text-xs">{item.relationship}</p>}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

function ExpertInsights({ insights }) {
  const scrollerRef = useRef(null)
  const [isPaused, setIsPaused] = useState(false)
  const shouldAutoScroll = insights.length > 1

  useEffect(() => {
    if (!shouldAutoScroll || isPaused) return undefined
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined

    let animationFrameId
    let previousTimestamp

    const moveCarousel = (timestamp) => {
      const scroller = scrollerRef.current
      if (!scroller) return

      if (previousTimestamp === undefined) previousTimestamp = timestamp
      const elapsedSeconds = Math.min((timestamp - previousTimestamp) / 1000, 0.1)
      previousTimestamp = timestamp

      const loopWidth = scroller.scrollWidth / 2
      scroller.scrollLeft += elapsedSeconds * 32

      if (loopWidth > 0 && scroller.scrollLeft >= loopWidth) {
        scroller.scrollLeft -= loopWidth
      }

      animationFrameId = window.requestAnimationFrame(moveCarousel)
    }

    animationFrameId = window.requestAnimationFrame(moveCarousel)
    return () => window.cancelAnimationFrame(animationFrameId)
  }, [isPaused, shouldAutoScroll])

  if (!insights.length) return <EmptyState title="No insights published yet" copy="Insights connected to this expert's capabilities will appear here." />

  const renderInsightCard = (insight, isDuplicate = false) => {
    const cardClassName = 'group relative block w-[86vw] max-w-[23rem] shrink-0 overflow-hidden rounded-[1.5rem] bg-white pb-1.5 shadow-lg shadow-primary-900/5 transition hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary-900/12 sm:w-[22rem]'
    const cardContent = (
      <>
      <div className="relative aspect-[4/5] overflow-hidden bg-gradient-to-br from-indigo-500 to-blue-500">
        {insight.imageUrl ? (
          <img src={insight.imageUrl} alt={insight.title} className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105" />
        ) : insight.contentKind === 'video' ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <PlayCircle className="h-16 w-16 text-white/80" />
          </div>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <FileText className="h-16 w-16 text-white/80" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-black/5 to-black/35"></div>
        <div className="absolute right-5 top-5 h-12 w-12">
          <img src="/favicon.png" alt="" className="h-full w-full object-contain" />
        </div>
        <div className="absolute left-5 right-20 top-5">
          <span className="inline-flex max-w-full items-center justify-center rounded-[1.35rem] border border-white bg-gray-950/65 px-6 py-3 text-center text-sm font-black uppercase tracking-wide text-white shadow-lg shadow-black/20 backdrop-blur-sm">
            <span className="truncate">{insight.capability?.title || formatProgramType(insight.type || 'insight')}</span>
          </span>
        </div>
        <div className="absolute bottom-6 left-5 right-5 rounded-[1.5rem] bg-gray-100/80 p-5 text-gray-950 shadow-2xl shadow-primary-950/15 backdrop-blur-sm">
          <h2 className="text-xl font-semibold leading-snug text-gray-950">{insight.title}</h2>
        </div>
      </div>
      <div className="absolute inset-x-0 bottom-0 h-1.5 bg-gradient-to-r from-primary-600 to-cyan-400" aria-hidden="true"></div>
      </>
    )

    return insight.contentKind === 'video' ? (
      <a
        key={isDuplicate ? `${insight._id}-duplicate` : insight._id}
        aria-hidden={isDuplicate}
        tabIndex={isDuplicate ? -1 : undefined}
        href={insight.youtubeUrl}
        target="_blank"
        rel="noreferrer"
        className={cardClassName}
      >
        {cardContent}
      </a>
    ) : (
      <Link
        key={isDuplicate ? `${insight._id}-duplicate` : insight._id}
        aria-hidden={isDuplicate}
        tabIndex={isDuplicate ? -1 : undefined}
        to={`/insights/${insight.slug || insight._id}`}
        className={cardClassName}
      >
        {cardContent}
      </Link>
    )
  }

  return (
    <section>
      <h2 className="mb-6 text-2xl font-bold text-gray-900">Articles & Insights</h2>
      <div
        ref={scrollerRef}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onFocus={() => setIsPaused(true)}
        onBlur={() => setIsPaused(false)}
        className="flex overflow-x-auto pb-5 [scrollbar-width:thin] [scrollbar-color:#3533cd_#e8e7fc]"
      >
        <div className="flex shrink-0 gap-6 pr-6">
          {insights.map((insight) => renderInsightCard(insight))}
        </div>
        {shouldAutoScroll && (
          <div className="flex shrink-0 gap-6 pr-6" aria-hidden="true">
            {insights.map((insight) => renderInsightCard(insight, true))}
          </div>
        )}
      </div>
    </section>
  )
}

function EmptyState({ title, copy }) {
  return (
    <div className="rounded-lg border border-dashed border-gray-300 bg-white p-10 text-center">
      <h2 className="text-2xl font-black text-[#000047]">{title}</h2>
      <p className="mt-2 text-gray-600">{copy}</p>
    </div>
  )
}
