import { FileText, Lightbulb, Briefcase, Calendar, Clock, Share2, Facebook, Linkedin, Twitter, PlayCircle } from 'lucide-react'
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { blogClient, mentorClient } from '../lib/sanityClient'

export default function Insights() {
  const [activeTab, setActiveTab] = useState('all')
  const [blogs, setBlogs] = useState([])
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)
  const [shareMenuOpen, setShareMenuOpen] = useState(null)

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
        // Fetch blogs from Sanity
        const query = `*[_type == "blog"] | order(publishedAt desc) {
          _id,
          title,
          "slug": slug.current,
          excerpt,
          type,
          category,
          publishedAt,
          readTime,
          "imageUrl": mainImage.asset->url
        }`
        const videosQuery = `*[_type == "youtubeVideos"] | order(featured desc, publishedAt desc, title asc) {
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
          blogClient.fetch(query),
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

  const handleShare = (platform, item) => {
    const url = `${window.location.origin}/insights/${item.slug || item._id}`
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
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`
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

  return (
    <div className="min-h-screen bg-white">
      <div className="relative h-[320px] w-full overflow-hidden md:h-[500px]">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover"
        >
          <source src="/Insights Banner.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
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
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
              <p className="mt-4 text-gray-600">Loading insights...</p>
            </div>
          ) : (
            <>
              {/* Blog Posts Section */}
              {filteredContent.length > 0 && (
                <div className="mb-16">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Articles & Insights</h2>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredContent.map((item) => (
                      <article key={item._id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow group">
                        <div className={`h-48 ${getGradientByType(item.type)} flex items-center justify-center`}>
                          {getImageUrl(item.imageUrl) ? (
                            <img
                              src={getImageUrl(item.imageUrl)}
                              alt={item.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <>
                              {item.type === 'research' && <Lightbulb className="h-16 w-16 text-white/80" />}
                              {item.type === 'article' && <FileText className="h-16 w-16 text-white/80" />}
                              {item.type === 'case-study' && <Briefcase className="h-16 w-16 text-white/80" />}
                            </>
                          )}
                        </div>
                        <div className="p-6">
                          <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-500">
                            <span className="flex items-center">
                              <Calendar className="h-4 w-4 mr-1" />
                              {formatDate(item.publishedAt)}
                            </span>
                            <span className="flex items-center">
                              <Clock className="h-4 w-4 mr-1" />
                              {item.readTime}
                            </span>
                          </div>
                          <span className="inline-block px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium mb-3">
                            {item.category}
                          </span>
                          <div className="flex justify-end mb-2">
                            <div className="relative">
                              <button
                                onClick={() => setShareMenuOpen(shareMenuOpen === item._id ? null : item._id)}
                                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                              >
                                <Share2 className="h-5 w-5 text-gray-600" />
                              </button>
                              {shareMenuOpen === item._id && (
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-10">
                                  <button
                                    onClick={() => handleShare('facebook', item)}
                                    className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-3"
                                  >
                                    <Facebook className="h-4 w-4 text-blue-600" />
                                    <span className="text-sm text-gray-700">Share on Facebook</span>
                                  </button>
                                  <button
                                    onClick={() => handleShare('twitter', item)}
                                    className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-3"
                                  >
                                    <Twitter className="h-4 w-4 text-blue-400" />
                                    <span className="text-sm text-gray-700">Share on Twitter</span>
                                  </button>
                                  <button
                                    onClick={() => handleShare('linkedin', item)}
                                    className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-3"
                                  >
                                    <Linkedin className="h-4 w-4 text-blue-700" />
                                    <span className="text-sm text-gray-700">Share on LinkedIn</span>
                                  </button>
                                  <button
                                    onClick={() => handleShare('copy', item)}
                                    className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-3"
                                  >
                                    <Share2 className="h-4 w-4 text-gray-600" />
                                    <span className="text-sm text-gray-700">Copy Link</span>
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                          <h3 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-primary-600 transition-colors">
                            {item.title}
                          </h3>
                          <p className="text-gray-600 mb-4">{item.excerpt}</p>
                          <Link
                            to={`/insights/${item.slug || item._id}`}
                            className="inline-flex items-center text-primary-600 font-semibold group-hover:text-primary-700"
                          >
                            Read More →
                          </Link>
                        </div>
                      </article>
                    ))}
                  </div>
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

          <div className="text-center mt-12">
            <button className="bg-primary-600 text-white px-8 py-4 rounded-full font-semibold hover:bg-primary-700 transition-colors">
              Load More Insights
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
