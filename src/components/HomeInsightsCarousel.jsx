import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Briefcase, FileText, Lightbulb } from 'lucide-react'
import { mentorClient } from '../lib/sanityClient'
import MagnaLoader from './MagnaLoader'
import InsightMeta from './InsightMeta'

function formatCategory(category) {
  if (!category) return 'Insight'

  return category
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
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
        const data = await mentorClient.fetch(`*[_type == "blog" && status != "archived"] | order(publishedAt desc, _updatedAt desc)[0...8] {
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

  useEffect(() => {
    if (insights.length <= 1) return undefined

    const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches
    if (prefersReducedMotion) return undefined

    const intervalId = window.setInterval(() => {
      const scroller = scrollerRef.current
      if (!scroller) return

      const scrollAmount = Math.min(scroller.clientWidth, 420)
      const isAtEnd = scroller.scrollLeft + scroller.clientWidth >= scroller.scrollWidth - 8

      if (isAtEnd) {
        scroller.scrollTo({ left: 0, behavior: 'smooth' })
        return
      }

      scroller.scrollBy({ left: scrollAmount, behavior: 'smooth' })
    }, 3500)

    return () => window.clearInterval(intervalId)
  }, [insights.length])

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
            <h2 className="text-3xl font-bold text-blue-900 sm:text-4xl">Insights that Drive growth</h2>
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
            <article key={item._id} className="group relative w-[80vw] shrink-0 snap-start overflow-hidden rounded-[1.5rem] bg-white pb-1.5 shadow-lg shadow-primary-900/5 transition hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary-900/12 sm:w-[22rem]">
              <Link to={`/insights/${item.slug || item._id}`} className={`relative block aspect-[4/5] overflow-hidden ${getGradientByType(item.type)}`}>
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
                <div className="absolute right-5 top-5 h-12 w-12">
                  <img src="/favicon.png" alt="" className="h-full w-full object-contain" />
                </div>
                <div className="absolute left-5 right-20 top-5">
                  <span className="inline-flex max-w-full items-center justify-center rounded-[1.35rem] border border-white bg-gray-950/65 px-6 py-3 text-center text-sm font-black uppercase tracking-wide text-white shadow-lg shadow-black/20 backdrop-blur-sm">
                    <span className="truncate">{item.capability?.title || formatCategory(item.category)}</span>
                  </span>
                </div>
                <div className="absolute bottom-6 left-5 right-5 rounded-[1.5rem] bg-gray-100/70 p-5 text-gray-950 shadow-2xl shadow-primary-950/15 backdrop-blur-sm">
                  <h3 className="line-clamp-3 text-xl font-semibold leading-snug text-gray-950">
                    {item.title}
                  </h3>
                  <InsightMeta item={item} className="mt-3" />
                </div>
              </Link>
              <div className="absolute inset-x-0 bottom-0 h-1.5 bg-gradient-to-r from-primary-600 to-cyan-400" aria-hidden="true"></div>
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
