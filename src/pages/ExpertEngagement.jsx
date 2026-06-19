import { useEffect, useState } from 'react'
import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { Link, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock,
  FileText,
  GraduationCap,
  Loader2,
  Mail,
  MessageSquareQuote,
  Phone,
  UserRound,
} from 'lucide-react'
import MagnaLoader from '../components/MagnaLoader'
import SEO from '../components/SEO'
import { db } from '../lib/firebase'
import { mentorClient } from '../lib/sanityClient'

const tabs = [
  { id: 'call', label: '1:1 Call', icon: CalendarDays },
  { id: 'programs', label: 'Sessions', icon: GraduationCap },
  { id: 'insights', label: 'Insights', icon: FileText },
]

function formatDate(value) {
  if (!value) return ''
  return new Date(value).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function formatProgramType(value = '') {
  return value.split('-').map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
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

        const [programData, insightData] = await Promise.all([
          mentorClient.fetch(
            `*[_type == "programs" && status == "published" && $expertId in mentors[]._ref] | order(featured desc, startDate desc) {
              _id,
              title,
              "slug": slug.current,
              programType,
              shortDescription,
              startDate,
              duration,
              deliveryMode,
              "heroImageUrl": heroImage.asset->url
            }`,
            { expertId: expertData._id }
          ),
          mentorClient.fetch(
            `*[_type == "blog" && status == "published" && $expertId in experts[]._ref] | order(publishedAt desc, _updatedAt desc) {
              _id,
              title,
              "slug": slug.current,
              excerpt,
              type,
              publishedAt,
              readTime,
              "imageUrl": mainImage.asset->url
            }`,
            { expertId: expertData._id }
          ),
        ])

        if (!mounted) return
        setExpert(expertData)
        setPrograms(programData || [])
        setInsights(insightData || [])
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
          {activeSection === 'programs' && <ExpertPrograms programs={programs} testimonials={expert.recommendations || []} />}
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
  const [preferredDateTime, setPreferredDateTime] = useState('')
  const [showDetails, setShowDetails] = useState(false)
  const [formData, setFormData] = useState({ name: '', email: '', contactNo: '' })
  const [submitting, setSubmitting] = useState(false)
  const [status, setStatus] = useState({ type: '', message: '' })

  const handleConnect = () => {
    if (!preferredDateTime) {
      setStatus({ type: 'error', message: 'Please select your preferred date and time.' })
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
      const preferredDate = new Date(preferredDateTime)
      if (Number.isNaN(preferredDate.getTime())) throw new Error('Please select a valid date and time.')

      await addDoc(collection(db, 'expertCallRequests'), {
        expertId: expert._id,
        expertSlug: expert.slug || '',
        expertName: expert.fullName,
        expertHeadline: expert.headline || expert.currentDesignation || expert.designation || '',
        preferredCallAt: preferredDate,
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        contactNo: formData.contactNo.trim(),
        status: 'requested',
        sourcePath: window.location.pathname,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })

      setStatus({
        type: 'success',
        message: 'Thank you. Your 1:1 call request has been submitted. Our team will contact you shortly.',
      })
      setFormData({ name: '', email: '', contactNo: '' })
      setPreferredDateTime('')
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
        <p className="mt-3 leading-7 text-gray-600">Choose your preferred date and time. The Magnafic team will review the request and confirm the final call schedule.</p>

        <div className="mt-7">
          <label htmlFor="preferred-call-time" className="mb-2 block text-sm font-bold text-gray-800">Preferred date and time *</label>
          <input
            id="preferred-call-time"
            type="datetime-local"
            value={preferredDateTime}
            min={new Date().toISOString().slice(0, 16)}
            onChange={(event) => setPreferredDateTime(event.target.value)}
            className="w-full rounded-lg border border-gray-300 px-4 py-3 font-semibold outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
          />
        </div>

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

function ExpertPrograms({ programs, testimonials }) {
  return (
    <div className="space-y-10">
      {programs.length ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {programs.map((program) => (
            <Link key={program._id} to={`/programs/${program.slug || program._id}`} className="group overflow-hidden rounded-lg bg-white shadow-xl shadow-primary-900/5 ring-1 ring-gray-100 transition hover:-translate-y-1">
              <div className="aspect-[16/10] bg-[#000047]">
                {program.heroImageUrl ? <img src={program.heroImageUrl} alt={program.title} className="h-full w-full object-cover" /> : <GraduationCap className="mx-auto h-full w-14 text-white/70" />}
              </div>
              <div className="p-5">
                <p className="text-xs font-black uppercase tracking-[0.14em] text-primary-600">{formatProgramType(program.programType)}</p>
                <h2 className="mt-2 text-xl font-black text-gray-950">{program.title}</h2>
                <p className="mt-3 line-clamp-3 leading-7 text-gray-600">{program.shortDescription}</p>
                <div className="mt-4 flex flex-wrap gap-3 text-sm font-bold text-gray-500">
                  {program.startDate && <span className="inline-flex items-center"><CalendarDays className="mr-1.5 h-4 w-4" />{formatDate(program.startDate)}</span>}
                  {program.duration && <span className="inline-flex items-center"><Clock className="mr-1.5 h-4 w-4" />{program.duration}</span>}
                </div>
              </div>
            </Link>
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
    <section>
      <div className="mb-6 text-center">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-primary-600">Testimonials</p>
        <h2 className="mt-2 text-2xl font-black text-[#000047] sm:text-3xl">What people say about this expert</h2>
      </div>
      <div className="grid gap-5 md:grid-cols-2">
        {items.map((item, index) => (
          <article key={`${item.name || 'testimonial'}-${index}`} className="rounded-lg bg-white p-5 shadow-xl shadow-primary-900/5 ring-1 ring-gray-100 sm:p-6">
            <MessageSquareQuote className="h-7 w-7 text-primary-500" />
            <p className="mt-4 text-sm leading-7 text-gray-700 sm:text-base">{item.testimonial}</p>
            <div className="mt-5 flex items-center gap-3 border-t border-gray-100 pt-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary-50 text-primary-700">
                {item.profileImageUrl ? (
                  <img src={item.profileImageUrl} alt={item.name || 'Testimonial author'} className="h-full w-full object-cover" />
                ) : (
                  <UserRound className="h-5 w-5" />
                )}
              </div>
              <div className="min-w-0">
                <h3 className="truncate font-extrabold text-gray-950">{item.name || 'Client'}</h3>
                <p className="truncate text-sm text-gray-600">{[item.designation, item.company].filter(Boolean).join(' | ')}</p>
                {item.relationship && <p className="mt-1 text-xs font-bold uppercase tracking-wide text-primary-600">{item.relationship}</p>}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

function ExpertInsights({ insights }) {
  if (!insights.length) return <EmptyState title="No insights published yet" copy="Insights authored by this expert will appear here." />

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {insights.map((insight) => (
        <Link key={insight._id} to={`/insights/${insight.slug || insight._id}`} className="group overflow-hidden rounded-lg bg-white shadow-xl shadow-primary-900/5 ring-1 ring-gray-100 transition hover:-translate-y-1">
          <div className="aspect-[16/10] bg-gradient-to-br from-primary-700 to-cyan-500">
            {insight.imageUrl ? <img src={insight.imageUrl} alt={insight.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" /> : <FileText className="mx-auto h-full w-14 text-white/70" />}
          </div>
          <div className="p-5">
            <p className="text-xs font-black uppercase tracking-[0.14em] text-primary-600">{formatProgramType(insight.type || 'insight')}</p>
            <h2 className="mt-2 text-xl font-black text-gray-950">{insight.title}</h2>
            <p className="mt-3 line-clamp-3 leading-7 text-gray-600">{insight.excerpt}</p>
            <p className="mt-4 text-sm font-bold text-gray-500">{[formatDate(insight.publishedAt), insight.readTime].filter(Boolean).join(' | ')}</p>
          </div>
        </Link>
      ))}
    </div>
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
