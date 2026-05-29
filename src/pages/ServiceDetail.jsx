import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, CheckCircle2, Layers } from 'lucide-react'
import { mentorClient } from '../lib/sanityClient'
import SEO from '../components/SEO'
import MagnaLoader from '../components/MagnaLoader'

function toPlainText(value) {
  if (value === undefined || value === null) return ''
  if (typeof value === 'string' || typeof value === 'number') return String(value)

  if (Array.isArray(value)) {
    return value
      .map(item => toPlainText(item))
      .filter(Boolean)
      .join('\n')
  }

  if (typeof value === 'object') {
    if (Array.isArray(value.children)) {
      return value.children.map(child => toPlainText(child.text || child)).join('')
    }

    return toPlainText(value.text || value.title || value.description || value.value)
  }

  return ''
}

function toPointList(value = '') {
  const text = toPlainText(value)
  if (!text) return []

  const lineItems = text
    .split(/\r?\n/)
    .map(item => item.replace(/^[-*\d.)\s]+/, '').trim())
    .filter(Boolean)

  if (lineItems.length > 1) return lineItems

  return text
    .split(/(?<=[.!?])\s+/)
    .map(item => item.trim())
    .filter(Boolean)
}

export default function ServiceDetail() {
  const { id } = useParams()
  const [service, setService] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchService = async () => {
      setLoading(true)
      setError('')

      try {
        const query = `*[_type == "services" && (slug.current == $id || _id == $id)][0] {
          _id,
          "slug": slug.current,
          title,
          description,
          keyInsights,
          approach,
          capability->{
            _id,
            title,
            "slug": slug.current
          }
        }`

        const data = await mentorClient.fetch(query, { id })
        setService(data)
      } catch (fetchError) {
        console.error('Error fetching service:', fetchError)
        setError('We could not load this service right now.')
      } finally {
        setLoading(false)
      }
    }

    fetchService()
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f9ff] px-4 pt-32 pb-20">
        <MagnaLoader message="Loading service..." className="mx-auto max-w-4xl" />
      </div>
    )
  }

  if (error || !service) {
    return (
      <div className="min-h-screen bg-white px-4 pt-32 pb-20">
        <div className="mx-auto max-w-3xl text-center">
          <Layers className="mx-auto mb-6 h-14 w-14 text-primary-500" />
          <h1 className="mb-4 text-3xl font-bold text-gray-950">Service not found</h1>
          <p className="mb-8 text-gray-600">{error || 'The service you are looking for is not available.'}</p>
          <Link to="/" className="inline-flex items-center rounded-full bg-primary-600 px-6 py-3 font-semibold text-white hover:bg-primary-700">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
        </div>
      </div>
    )
  }

  const capabilityPath = service.capability ? `/capabilities/${service.capability.slug || service.capability._id}` : null
  const approachPoints = toPointList(service.approach)

  return (
    <div className="min-h-screen bg-[#f7f9ff]">
      <SEO
        title={`${service.title} - Service`}
        description={service.description || toPlainText(service.approach)}
        path={`/services/${service.slug || service._id}`}
      />

      <section className="relative overflow-hidden bg-[#000047] px-4 pt-24 pb-20 text-white sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_16%_22%,rgba(0,255,255,0.18),transparent_30%),radial-gradient(circle_at_82%_14%,rgba(255,255,255,0.12),transparent_26%)]"></div>
        <div className="relative mx-auto max-w-7xl">
          {capabilityPath && (
            <Link to={capabilityPath} className="mb-10 inline-flex items-center rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-cyan-100 ring-1 ring-white/15 transition hover:bg-white/15 hover:text-white">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to {service.capability.title}
            </Link>
          )}

          <div className="max-w-4xl">
            {service.capability?.title && (
              <p className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-cyan-100">{service.capability.title}</p>
            )}
            <h1 className="text-3xl font-bold leading-tight sm:text-4xl md:text-6xl">{service.title}</h1>
            {service.description && (
              <p className="mt-6 text-lg leading-8 text-gray-100 sm:text-xl sm:leading-9">{service.description}</p>
            )}
          </div>
        </div>
      </section>

      <section className="px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl space-y-8">
          {service.keyInsights?.length ? (
            <article className="rounded-3xl bg-white p-6 shadow-xl shadow-primary-900/5 ring-1 ring-gray-100 sm:p-8">
              <h2 className="mb-5 text-2xl font-bold text-gray-950">Key Insights</h2>
              <div className="space-y-5">
                {service.keyInsights.map((insight) => (
                  <p key={insight} className="text-lg leading-9 text-gray-700">{insight}</p>
                ))}
              </div>
            </article>
          ) : null}

          {approachPoints.length > 0 && (
            <article className="rounded-3xl bg-white p-6 shadow-xl shadow-primary-900/5 ring-1 ring-gray-100 sm:p-8">
              <h2 className="mb-5 text-2xl font-bold text-gray-950">Approach</h2>
              <ul className="space-y-4">
                {approachPoints.map((point) => (
                  <li key={point} className="flex gap-3 text-lg leading-8 text-gray-700">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary-500" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </article>
          )}
        </div>
      </section>
    </div>
  )
}
