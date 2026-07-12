import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight, CheckCircle2, FileText, Layers, Lightbulb, Sparkles, Target } from 'lucide-react'
import { mentorClient } from '../lib/sanityClient'
import SEO from '../components/SEO'
import MagnaLoader from '../components/MagnaLoader'
import DescribeProblemCTA from '../components/DescribeProblemCTA'
import InsightMeta from '../components/InsightMeta'

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
  const [insights, setInsights] = useState([])
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

        if (data?.capability?._id) {
          const insightsQuery = `*[_type == "blog" && status != "archived" && capability._ref == $capabilityId] | order(featured desc, publishedAt desc) {
            _id,
            title,
            "slug": slug.current,
            type,
            category,
            publishedAt,
            readTime,
            "imageUrl": mainImage.asset->url
          }`
          const insightsData = await mentorClient.fetch(insightsQuery, { capabilityId: data.capability._id })
          setInsights(insightsData || [])
        } else {
          setInsights([])
        }
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
  const insightItems = Array.isArray(service.keyInsights) ? service.keyInsights.filter(Boolean) : []
  const relatedInsightsSection = insights.length > 0 ? (
    <section className="px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-3 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-primary-600">Related Insights</p>
            <h2 className="mt-2 text-2xl font-bold text-gray-950 sm:text-3xl">
              Insights for {service.capability?.title || service.title}
            </h2>
          </div>
          <Link
            to="/insights"
            className="inline-flex items-center justify-center rounded-full bg-primary-50 px-5 py-2.5 text-sm font-bold text-primary-700 transition hover:bg-primary-100"
          >
            View all insights
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {insights.map((insight) => (
            <Link
              key={insight._id}
              to={`/insights/${insight.slug || insight._id}`}
              className="group overflow-hidden rounded-2xl bg-white shadow-lg transition hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="flex h-48 items-center justify-center bg-gradient-to-br from-primary-700 to-cyan-500">
                {insight.imageUrl ? (
                  <img
                    src={insight.imageUrl}
                    alt={insight.title}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                ) : (
                  <FileText className="h-16 w-16 text-white/80" />
                )}
              </div>
              <div className="p-6">
                <InsightMeta item={insight} className="mb-3" />
                <h3 className="text-xl font-semibold text-gray-900 transition group-hover:text-primary-600">
                  {insight.title}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  ) : null

  return (
    <div className="min-h-screen bg-[#f7f9ff]">
      <SEO
        title={`${service.title} - Service`}
        description={service.description || toPlainText(service.approach)}
        path={`/services/${service.slug || service._id}`}
      />

      <section className="relative mx-auto mb-8 max-w-7xl px-4 pt-24 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-900 via-primary-700 to-cyan-500 shadow-2xl shadow-primary-900/15">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_18%,rgba(255,255,255,0.18),transparent_30%),linear-gradient(135deg,rgba(0,255,255,0.12),transparent_45%,rgba(255,255,255,0.12))]"></div>

          <div className="relative grid gap-10 px-6 py-20 text-white sm:px-10 sm:py-24 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-end lg:px-14 lg:py-28">
            <div>
            {capabilityPath && (
              <Link to={capabilityPath} className="mb-8 inline-flex items-center rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-cyan-100 ring-1 ring-white/15 transition hover:bg-white/15 hover:text-white">
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
              <Link
                to="/describe-your-problem"
                className="mt-8 inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full bg-white px-6 py-3 font-bold text-primary-700 shadow-xl shadow-primary-950/20 transition hover:-translate-y-0.5 hover:bg-cyan-50"
              >
                Describe your problem
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </div>

          <aside className="rounded-3xl border border-white/15 bg-white/10 p-5 shadow-2xl shadow-primary-950/20 backdrop-blur">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-300/20 text-cyan-100 ring-1 ring-cyan-200/30">
                <Sparkles className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.16em] text-cyan-100">Service Focus</p>
                <p className="mt-1 text-sm text-white/75">Structured advisory built for focused outcomes.</p>
              </div>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/10">
                <p className="text-2xl font-black text-white">{insightItems.length || '-'}</p>
                <p className="mt-1 font-semibold text-cyan-100">Insights</p>
              </div>
              <div className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/10">
                <p className="text-2xl font-black text-white">{approachPoints.length || '-'}</p>
                <p className="mt-1 font-semibold text-cyan-100">Steps</p>
              </div>
            </div>
          </aside>
          </div>
        </div>
      </section>

      <section className="px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl space-y-10">
          {insightItems.length ? (
            <article className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-xl shadow-primary-900/5">
              <div className="grid gap-0 lg:grid-cols-[20rem_minmax(0,1fr)]">
                <div className="bg-gradient-to-br from-primary-700 via-primary-600 to-cyan-500 p-6 text-white sm:p-8">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 text-cyan-50 ring-1 ring-white/20">
                    <Lightbulb className="h-6 w-6" />
                  </span>
                  <h2 className="mt-5 text-2xl font-bold sm:text-3xl">Key Insights Delivered</h2>
                  <p className="mt-3 text-sm font-medium leading-6 text-cyan-50/80">
                    Clear signals, decision points, and strategic context from this service.
                  </p>
                </div>
                <div className="grid gap-4 p-5 sm:p-6 lg:grid-cols-2">
                  {insightItems.map((insight, index) => (
                    <div key={insight} className="rounded-2xl border border-gray-100 bg-[#f8fbff] p-5 transition hover:-translate-y-0.5 hover:border-cyan-200 hover:bg-white hover:shadow-lg hover:shadow-primary-900/5">
                      <p className="text-xs font-black uppercase tracking-[0.18em] text-primary-500">Insight {String(index + 1).padStart(2, '0')}</p>
                      <p className="mt-3 text-base font-semibold leading-7 text-gray-800">{insight}</p>
                    </div>
                  ))}
                </div>
              </div>
            </article>
          ) : null}

          {approachPoints.length > 0 && (
            <article className="rounded-3xl border border-gray-100 bg-white p-5 shadow-xl shadow-primary-900/5 sm:p-8">
              <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <span className="inline-flex items-center rounded-full bg-primary-50 px-3 py-1 text-xs font-black uppercase tracking-[0.16em] text-primary-700">
                    <Target className="mr-1.5 h-3.5 w-3.5" />
                    Execution Path
                  </span>
                  <h2 className="mt-4 text-2xl font-bold text-gray-950 sm:text-3xl">Approach</h2>
                </div>
                <p className="max-w-xl text-sm font-medium leading-6 text-gray-600">
                  A practical sequence for moving from diagnosis to direction, with each step designed to reduce ambiguity.
                </p>
              </div>

              <ol className="relative space-y-5 before:absolute before:left-5 before:top-5 before:h-[calc(100%-2.5rem)] before:w-px before:bg-cyan-100">
                {approachPoints.map((point, index) => (
                  <li key={point} className="relative grid grid-cols-[2.75rem_minmax(0,1fr)] gap-4">
                    <span className="relative z-10 flex h-10 w-10 items-center justify-center rounded-full bg-primary-600 text-sm font-black text-white shadow-lg shadow-primary-900/20">
                      {index + 1}
                    </span>
                    <div className="rounded-2xl border border-gray-100 bg-[#f8fbff] p-4 transition hover:border-primary-100 hover:bg-white hover:shadow-lg hover:shadow-primary-900/5 sm:p-5">
                      <div className="flex gap-3">
                        <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-primary-500" />
                        <p className="text-base font-semibold leading-7 text-gray-800">{point}</p>
                      </div>
                    </div>
                  </li>
                ))}
              </ol>
            </article>
          )}
        </div>
      </section>

      {relatedInsightsSection}

      <DescribeProblemCTA />
    </div>
  )
}
