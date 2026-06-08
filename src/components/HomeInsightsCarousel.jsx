import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Briefcase, FileText, Lightbulb } from 'lucide-react'
import { mentorClient } from '../lib/sanityClient'
import MagnaLoader from './MagnaLoader'

function formatDate(dateString) {
  if (!dateString) return ''

  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function formatCategory(category) {
  if (!category) return 'Insight'

  return category
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

function getTypeLabel(type) {
  switch (type) {
    case 'research':
      return 'Research'
    case 'case-study':
      return 'Case Study'
    case 'article':
      return 'Article'
    default:
      return 'Insight'
  }
}

function getGradientByType(type) {
  switch (type) {
    case 'research':
      return 'bg-gradient-to-br from-blue-500 to-purple-500'
    case 'article':
      return 'bg-gradient-to-br from-green-500 to-teal-500'
    case 'case-study':
      return 'bg-gradient-to-br from-orange-500 to-red-500'
    default:
      return 'bg-gradient-to-br from-indigo-500 to-blue-500'
  }
}

function FallbackIcon({ type }) {
  if (type === 'research') return <Lightbulb className="h-14 w-14 text-white/80" />
  if (type === 'case-study') return <Briefcase className="h-14 w-14 text-white/80" />
  return <FileText className="h-14 w-14 text-white/80" />
}

export default function HomeInsightsCarousel() {
  const [insights, setInsights] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const scrollerRef = useRef(null)

  useEffect(() => {
    const fetchInsights = async () => {
      setLoading(true)
      setError('')

      try {
        const data = await mentorClient.fetch(`*[_type == "blog" && status == "published"] | order(featured desc, publishedAt desc)[0...8] {
          _id,
          title,
          "slug": slug.current,
          type,
          category,
          publishedAt,
          readTime,
          "imageUrl": mainImage.asset->url,
          capability->{
            title
          },
          experts[]->{
            _id,
            fullName,
            "imageUrl": profileImage.asset->url,
            headline,
            currentDesignation,
            designation
          }
        }`)

        setInsights(data || [])
      } catch (fetchError) {
        console.error('Home insights fetch failed:', fetchError)
        setError('Unable to load insights right now.')
      } finally {
        setLoading(false)
      }
    }

    fetchInsights()
  }, [])

  const scrollCarousel = (direction) => {
    const scroller = scrollerRef.current
    if (!scroller) return

    scroller.scrollBy({
      left: direction * Math.min(scroller.clientWidth, 420),
      behavior: 'smooth',
    })
  }

  if (loading) {
    return (
      <section className="bg-white px-4 py-16 sm:px-6 lg:px-8">
        <MagnaLoader message="Loading insights..." className="mx-auto max-w-3xl" />
      </section>
    )
  }

  if (error || insights.length === 0) return null

  return (
    <section className="bg-white px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-primary-600">Insights</p>
            <h2 className="mt-3 text-3xl font-bold text-gray-950 sm:text-4xl">Latest thinking for consumer growth</h2>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => scrollCarousel(-1)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-gray-200 text-gray-700 transition hover:border-primary-200 hover:bg-primary-50 hover:text-primary-700"
              aria-label="Previous insight"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => scrollCarousel(1)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-gray-200 text-gray-700 transition hover:border-primary-200 hover:bg-primary-50 hover:text-primary-700"
              aria-label="Next insight"
            >
              <ArrowRight className="h-5 w-5" />
            </button>
            <Link to="/insights" className="hidden rounded-full bg-primary-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-primary-700 sm:inline-flex">
              View all
            </Link>
          </div>
        </div>

        <div
          ref={scrollerRef}
          className="flex snap-x gap-6 overflow-x-auto pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {insights.map((item) => (
            <article key={item._id} className="group w-[82vw] shrink-0 snap-start overflow-hidden rounded-[1.5rem] bg-white shadow-lg shadow-primary-900/5 transition hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary-900/12 sm:w-[22rem]">
              <Link to={`/insights/${item.slug || item._id}`} className={`relative block min-h-[26rem] overflow-hidden ${getGradientByType(item.type)}`}>
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <FallbackIcon type={item.type} />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-black/5 to-black/35"></div>
                <div className="absolute left-5 right-5 top-5">
                  <span className="inline-flex max-w-full items-center rounded-2xl border border-white bg-black/35 px-4 py-2.5 text-xs font-extrabold uppercase tracking-wide text-white shadow-lg backdrop-blur-sm">
                    <span className="truncate">{item.capability?.title || formatCategory(item.category)}</span>
                  </span>
                </div>
                <div className="absolute bottom-6 left-5 right-5 rounded-[1.5rem] bg-white/90 p-5 text-gray-950 shadow-2xl shadow-primary-950/15 backdrop-blur-md">
                  <div className="mb-4 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs font-extrabold uppercase tracking-wide text-gray-800">
                    <span>{getTypeLabel(item.type)}</span>
                    {item.publishedAt && <span>{formatDate(item.publishedAt)}</span>}
                    {item.readTime && <span className="font-bold text-gray-600">{item.readTime}</span>}
                  </div>
                  <h3 className="line-clamp-3 text-2xl font-semibold leading-tight text-gray-950">
                    {item.title}
                  </h3>
                </div>
              </Link>

              {item.experts?.length > 0 && (
                <div className="border-x border-b border-gray-100 px-5 py-4">
                  {item.experts.slice(0, 1).map((expert) => (
                    <div key={expert._id} className="min-w-0">
                      <span className="mb-2 block text-[11px] font-extrabold uppercase tracking-[0.16em] text-gray-900">Author</span>
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary-50 text-sm font-bold text-primary-700 ring-1 ring-primary-100">
                          {expert.imageUrl ? (
                            <img src={expert.imageUrl} alt={expert.fullName} className="h-full w-full object-cover object-center" />
                          ) : (
                            <span>{expert.fullName?.split(' ').map((name) => name[0]).join('').slice(0, 2).toUpperCase()}</span>
                          )}
                        </div>
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-bold text-gray-950">{expert.fullName}</span>
                          {(expert.headline || expert.currentDesignation || expert.designation) && (
                            <span className="mt-1 block line-clamp-2 text-xs font-medium leading-5 text-gray-600">
                              {expert.headline || expert.currentDesignation || expert.designation}
                            </span>
                          )}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </article>
          ))}
        </div>

        <Link to="/insights" className="mt-6 inline-flex rounded-full bg-primary-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-primary-700 sm:hidden">
          View all insights
        </Link>
      </div>
    </section>
  )
}
