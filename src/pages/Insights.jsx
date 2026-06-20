import { FileText, Lightbulb, Briefcase, Calendar, Clock, Share2, Facebook, Linkedin, Twitter, PlayCircle, Mail, ChevronLeft, ChevronRight } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { mentorClient } from '../lib/sanityClient'
import MagnaLoader from '../components/MagnaLoader'
import { absoluteUrl } from '../lib/seo'
import { subscribeToInsights } from '../lib/insightSubscriptions'

export default function Insights() {
  const [activeTab, setActiveTab] = useState('all')
  const [blogs, setBlogs] = useState([])
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)
  const [shareMenuOpen, setShareMenuOpen] = useState(null)
  const [subscriberEmail, setSubscriberEmail] = useState('')
  const [subscribing, setSubscribing] = useState(false)
  const [subscriptionStatus, setSubscriptionStatus] = useState({ type: '', message: '' })
  const insightScrollerRef = useRef(null)
  const [isInsightScrollerPaused, setIsInsightScrollerPaused] = useState(false)

  const tabs = [
    { id: 'all', label: 'All' },
    { id: 'research', label: 'Research & Insights' },
    { id: 'article', label: 'Articles' },
    { id: 'case-study', label: 'Case Studies' },
    { id: 'videos', label: 'Videos' }
  ]

  useEffect(() => {
    const fetchData = async () => {
      try {
        const query = `*[_type == "blog" && status != "archived"] | order(publishedAt desc, _updatedAt desc) {
          _id,
          title,
          "slug": slug.current,
          excerpt,
          type,
          category,
          publishedAt,
          _updatedAt,
          readTime,
          "imageUrl": mainImage.asset->url,
          capability->{
            title,
            "slug": slug.current
          },
          experts[]->{
            _id,
            fullName,
            "imageUrl": profileImage.asset->url,
            headline,
            currentDesignation,
            designation
          }
        }`
        const videosQuery = `*[_type == "youtubeVideos"] | order(publishedAt desc, _updatedAt desc, title asc) {
          _id,
          title,
          "slug": slug.current,
          youtubeUrl,
          description,
          duration,
          publishedAt,
          featured,
          "thumbnailUrl": thumbnail.asset->url,
          capability->{
            title,
            "slug": slug.current
          }
        }`

        const [blogData, videoData] = await Promise.all([
          mentorClient.fetch(query),
          mentorClient.fetch(videosQuery),
        ])

        setBlogs(blogData)
        setVideos(videoData || [])
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const filteredContent = activeTab === 'all'
    ? blogs
    : activeTab === 'videos'
      ? []
      : blogs.filter(item => item.type === activeTab)

  const visibleVideos = activeTab === 'all' || activeTab === 'videos' ? videos : []
  const latestInsights = filteredContent.slice(0, 3)
  const remainingInsights = filteredContent.slice(3)

  const scrollInsights = (direction) => {
    insightScrollerRef.current?.scrollBy({
      left: direction * Math.min(insightScrollerRef.current.clientWidth * 0.85, 960),
      behavior: 'smooth',
    })
  }

  useEffect(() => {
    if (remainingInsights.length < 2 || isInsightScrollerPaused) return undefined
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined

    let animationFrameId
    let previousTimestamp

    const moveInsights = (timestamp) => {
      const scroller = insightScrollerRef.current
      if (!scroller) return

      if (previousTimestamp === undefined) previousTimestamp = timestamp
      const elapsedSeconds = Math.min((timestamp - previousTimestamp) / 1000, 0.1)
      previousTimestamp = timestamp

      const loopWidth = scroller.scrollWidth / 2
      scroller.scrollLeft += elapsedSeconds * 32

      if (loopWidth > 0 && scroller.scrollLeft >= loopWidth) {
        scroller.scrollLeft -= loopWidth
      }

      animationFrameId = window.requestAnimationFrame(moveInsights)
    }

    animationFrameId = window.requestAnimationFrame(moveInsights)
    return () => window.cancelAnimationFrame(animationFrameId)
  }, [isInsightScrollerPaused, remainingInsights.length])

  const formatDate = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const getGradientByType = (type) => {
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

  const getImageUrl = (imageUrl) => {
    return imageUrl || null
  }

  const formatCategory = (category) => {
    if (!category) return 'Insight'
    return category
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  const getTypeLabel = (type) => {
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

  const handleShare = (platform, item) => {
    const url = absoluteUrl(`/insights/${item.slug || item._id}`)
    const linkedinUrl = `${url}?share=${encodeURIComponent((item._updatedAt || item.publishedAt || '').slice(0, 10) || 'latest')}`
    const title = item.title
    const text = item.excerpt

    let shareUrl = ''

    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`
        break
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`
        break
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(linkedinUrl)}`
        break
      case 'copy':
        navigator.clipboard.writeText(url)
        alert('Link copied to clipboard!')
        setShareMenuOpen(null)
        return
      default:
        return
    }

    window.open(shareUrl, '_blank', 'width=600,height=400')
    setShareMenuOpen(null)
  }

  const handleSubscribe = async (event) => {
    event.preventDefault()
    setSubscribing(true)
    setSubscriptionStatus({ type: '', message: '' })

    try {
      const email = await subscribeToInsights(subscriberEmail)
      setSubscriberEmail('')
      setSubscriptionStatus({
        type: 'success',
        message: `You're subscribed. We'll notify ${email} when new insights are published.`,
      })
    } catch (subscribeError) {
      console.error('Insight subscription failed:', subscribeError)
      setSubscriptionStatus({
        type: 'error',
        message: subscribeError.message || 'We could not subscribe you right now. Please try again.',
      })
    } finally {
      setSubscribing(false)
    }
  }

  const InsightCard = ({ item, className = '', isDuplicate = false }) => (
    <article aria-hidden={isDuplicate} className={`group relative overflow-hidden rounded-[1.5rem] bg-white pb-1.5 shadow-lg shadow-primary-900/5 transition hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary-900/12 ${className}`}>
      <Link tabIndex={isDuplicate ? -1 : undefined} to={`/insights/${item.slug || item._id}`} className={`relative block min-h-[28rem] overflow-hidden ${getGradientByType(item.type)}`}>
        {getImageUrl(item.imageUrl) ? (
          <img
            src={getImageUrl(item.imageUrl)}
            alt={item.title}
            className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            {item.type === 'research' && <Lightbulb className="h-16 w-16 text-white/80" />}
            {item.type === 'article' && <FileText className="h-16 w-16 text-white/80" />}
            {item.type === 'case-study' && <Briefcase className="h-16 w-16 text-white/80" />}
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
          <h3 className="text-xl font-semibold leading-snug text-gray-950">{item.title}</h3>
        </div>
      </Link>
      {item.experts?.length > 0 && (
        <div className="border-x border-b border-gray-100 bg-gray-50 px-5 py-4">
          {item.experts.map((expert) => (
            <div key={expert._id} className="min-w-0">
              <div className="mb-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-extrabold uppercase tracking-[0.14em]">
                <span className="text-gray-900">Author</span>
                <span className="text-gray-300">|</span>
                <span className="text-gray-700">{getTypeLabel(item.type)}</span>
                {item.publishedAt && <span className="text-gray-700">{formatDate(item.publishedAt)}</span>}
                {item.readTime && <span className="text-gray-700">{item.readTime}</span>}
              </div>
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
      <div className="absolute inset-x-0 bottom-0 h-1.5 bg-gradient-to-r from-primary-600 to-cyan-400" aria-hidden="true"></div>
    </article>
  )

  return (
    <div className="min-h-screen bg-white">
      <div className="relative h-[320px] w-full overflow-hidden md:h-[500px]">
        <img
          src="/Magna-globe.jpg"
          alt=""
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/60"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center px-4">
            <h1 className="mb-4 text-4xl font-bold text-white md:text-6xl">Insights</h1>
            <p className="text-lg md:text-xl text-gray-200 max-w-2xl mx-auto">
              Clarity Drives Growth
            </p>
          </div>
        </div>
      </div>

      <div className="pt-12 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <section className="mb-10 overflow-hidden rounded-3xl bg-primary-900 shadow-2xl shadow-primary-900/10">
            <div className="grid gap-6 p-6 text-white sm:p-8 lg:grid-cols-[minmax(0,1fr)_minmax(22rem,0.75fr)] lg:items-center">
              <div>
                <div className="mx-auto mb-4 h-14 w-14 overflow-hidden rounded-xl shadow-md ring-1 ring-white/20 sm:mx-0">
                  <img src="/favicon.png" alt="Magnafic" className="h-full w-full object-cover" />
                </div>
                <h2 className="text-2xl font-bold sm:text-3xl">Get new insights in your inbox</h2>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-cyan-50/80 sm:text-base">
                  Subscribe to receive a notification whenever Magnafic publishes a new insight.
                </p>
              </div>

              <form onSubmit={handleSubscribe} className="rounded-2xl bg-white p-3 shadow-xl shadow-primary-950/20">
                <div className="flex flex-col gap-3 sm:flex-row">
                  <label htmlFor="insight-subscription-email" className="sr-only">Email address</label>
                  <div className="relative flex-1">
                    <Mail className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-primary-500" />
                    <input
                      id="insight-subscription-email"
                      type="text"
                      value={subscriberEmail}
                      onChange={(event) => setSubscriberEmail(event.target.value)}
                      placeholder="Enter your email"
                      required
                      className="h-12 w-full rounded-xl border border-gray-200 pl-11 pr-4 text-gray-900 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={subscribing}
                    className="h-12 rounded-xl bg-primary-600 px-6 font-bold text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {subscribing ? 'Subscribing...' : 'Subscribe'}
                  </button>
                </div>
                {subscriptionStatus.message && (
                  <p className={`mt-3 px-1 text-sm font-semibold ${subscriptionStatus.type === 'success' ? 'text-green-700' : 'text-red-600'}`}>
                    {subscriptionStatus.message}
                  </p>
                )}
              </form>
            </div>
          </section>

          <div className="flex justify-center mb-12">
            <div className="inline-flex max-w-full overflow-x-auto rounded-full bg-gray-100 p-1">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors sm:px-6 sm:text-base ${
                    activeTab === tab.id
                      ? 'bg-white text-primary-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <MagnaLoader message="Loading insights..." className="mx-auto max-w-3xl" />
          ) : (
            <>
              {/* Blog Posts Section */}
              {filteredContent.length > 0 && (
                <div className="mb-16">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Articles & Insights</h2>
                  <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                    {latestInsights.map((item) => (
                      <InsightCard key={item._id} item={item} />
                    ))}
                  </div>

                  {remainingInsights.length > 0 && (
                    <div className="mt-12">
                      <div className="mb-5 flex items-center justify-between gap-4">
                        <h3 className="text-xl font-bold text-gray-900">More Insights</h3>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => scrollInsights(-1)}
                            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-primary-100 bg-white text-primary-700 shadow-sm transition hover:bg-primary-50"
                            aria-label="Previous insights"
                          >
                            <ChevronLeft className="h-5 w-5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => scrollInsights(1)}
                            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-primary-100 bg-white text-primary-700 shadow-sm transition hover:bg-primary-50"
                            aria-label="Next insights"
                          >
                            <ChevronRight className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                      <div
                        ref={insightScrollerRef}
                        onMouseEnter={() => setIsInsightScrollerPaused(true)}
                        onMouseLeave={() => setIsInsightScrollerPaused(false)}
                        onFocus={() => setIsInsightScrollerPaused(true)}
                        onBlur={() => setIsInsightScrollerPaused(false)}
                        className="flex overflow-x-auto pb-5 [scrollbar-width:thin] [scrollbar-color:#3533cd_#e8e7fc]"
                      >
                        <div className="flex shrink-0 gap-6 pr-6">
                          {remainingInsights.map((item) => (
                            <InsightCard key={item._id} item={item} className="w-[86vw] max-w-[23rem] shrink-0 sm:w-[22rem]" />
                          ))}
                        </div>
                        <div className="flex shrink-0 gap-6 pr-6" aria-hidden="true">
                          {remainingInsights.map((item) => (
                            <InsightCard key={`${item._id}-duplicate`} item={item} isDuplicate className="w-[86vw] max-w-[23rem] shrink-0 sm:w-[22rem]" />
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {visibleVideos.length > 0 && (
                <div className="mb-16">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Videos</h2>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {visibleVideos.map((video) => (
                      <a
                        key={video._id}
                        href={video.youtubeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group overflow-hidden rounded-2xl bg-white shadow-lg transition hover:-translate-y-1 hover:shadow-xl"
                      >
                        <div className="relative aspect-video overflow-hidden bg-gray-900">
                          {video.thumbnailUrl ? (
                            <img
                              src={video.thumbnailUrl}
                              alt={video.title}
                              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary-900 to-cyan-600">
                              <PlayCircle className="h-16 w-16 text-white/80" />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-black/15 transition group-hover:bg-black/25"></div>
                          <span className="absolute left-1/2 top-1/2 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-primary-700 shadow-lg transition group-hover:scale-110">
                            <PlayCircle className="h-8 w-8" />
                          </span>
                          {video.duration && (
                            <span className="absolute bottom-3 right-3 rounded bg-black/80 px-2 py-1 text-xs font-semibold text-white">
                              {video.duration}
                            </span>
                          )}
                          {video.featured && (
                            <span className="absolute left-3 top-3 rounded-full bg-white px-3 py-1 text-xs font-bold text-primary-700 shadow">
                              Featured
                            </span>
                          )}
                        </div>

                        <div className="p-6">
                          <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-500">
                            {video.publishedAt && (
                              <span className="flex items-center">
                                <Calendar className="h-4 w-4 mr-1" />
                                {formatDate(video.publishedAt)}
                              </span>
                            )}
                            {video.capability?.title && (
                              <span className="rounded-full bg-primary-100 px-3 py-1 text-xs font-semibold text-primary-700">
                                {video.capability.title}
                              </span>
                            )}
                          </div>
                          <h3 className="text-xl font-semibold text-gray-900 transition group-hover:text-primary-600">
                            {video.title}
                          </h3>
                          {video.description && (
                            <p className="mt-3 line-clamp-3 text-sm leading-6 text-gray-600">{video.description}</p>
                          )}
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'videos' && visibleVideos.length === 0 && (
                <div className="rounded-2xl bg-gray-50 p-10 text-center">
                  <PlayCircle className="mx-auto mb-4 h-12 w-12 text-primary-500" />
                  <h2 className="mb-2 text-2xl font-semibold text-gray-900">No videos found</h2>
                  <p className="text-gray-600">Add YouTube videos in Sanity Studio to show them here.</p>
                </div>
              )}

            </>
          )}

        </div>
      </div>
    </div>
  )
}
