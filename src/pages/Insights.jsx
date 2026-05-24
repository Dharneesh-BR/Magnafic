import { FileText, Lightbulb, Briefcase, Calendar, Clock, Share2, Facebook, Linkedin, Twitter, Youtube, Eye } from 'lucide-react'
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { blogClient } from '../lib/sanityClient'
import YoutubeVideos from '../components/YoutubeVideos'

export default function Insights() {
  const [activeTab, setActiveTab] = useState('all')
  const [blogs, setBlogs] = useState([])
  const [youtubeVideos, setYoutubeVideos] = useState([])
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
        const blogData = await blogClient.fetch(query)
        
        // Fetch YouTube videos
        const apiKey = import.meta.env.VITE_YOUTUBE_API_KEY
        const channelId = import.meta.env.VITE_YOUTUBE_CHANNEL_ID
        let videoData = []

        if (apiKey && channelId) {
          try {
            // Get channel's uploads playlist ID
            const channelResponse = await fetch(
              `https://www.googleapis.com/youtube/v3/channels?part=contentDetails&id=${channelId}&key=${apiKey}`
            )
            
            if (channelResponse.ok) {
              const channelData = await channelResponse.json()
              if (channelData.items && channelData.items.length > 0) {
                const uploadsPlaylistId = channelData.items[0].contentDetails.relatedPlaylists.uploads

                // Fetch videos from uploads playlist
                const videosResponse = await fetch(
                  `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&playlistId=${uploadsPlaylistId}&maxResults=6&key=${apiKey}`
                )

                if (videosResponse.ok) {
                  const videosData = await videosResponse.json()
                  
                  if (videosData.items) {
                    // Get video IDs for additional details
                    const videoIds = videosData.items.map(item => item.contentDetails.videoId).join(',')
                    
                    const videoDetailsResponse = await fetch(
                      `https://www.googleapis.com/youtube/v3/videos?part=contentDetails,statistics&id=${videoIds}&key=${apiKey}`
                    )

                    const videoDetailsData = await videoDetailsResponse.json()

                    // Create video details map
                    const videoDetailsMap = {}
                    if (videoDetailsData.items) {
                      videoDetailsData.items.forEach(video => {
                        videoDetailsMap[video.id] = {
                          duration: formatDuration(video.contentDetails.duration),
                          viewCount: formatViewCount(video.statistics.viewCount)
                        }
                      })
                    }

                    // Format video data
                    videoData = videosData.items.map(item => ({
                      id: item.contentDetails.videoId,
                      title: item.snippet.title,
                      excerpt: item.snippet.description?.substring(0, 150) + '...',
                      type: 'video',
                      category: 'YouTube',
                      publishedAt: item.snippet.publishedAt,
                      readTime: videoDetailsMap[item.contentDetails.videoId]?.duration || '--:--',
                      thumbnail: item.snippet.thumbnails.maxres?.url || 
                                 item.snippet.thumbnails.high?.url || 
                                 item.snippet.thumbnails.medium?.url || 
                                 item.snippet.thumbnails.default?.url,
                      viewCount: videoDetailsMap[item.contentDetails.videoId]?.viewCount || '0',
                      isYoutube: true
                    }))
                  }
                }
              }
            }
          } catch (error) {
            console.error('Error fetching YouTube videos:', error)
          }
        }

        setBlogs(blogData)
        setYoutubeVideos(videoData)
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Format YouTube duration
  const formatDuration = (duration) => {
    const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/)
    const hours = match[1] ? parseInt(match[1]) : 0
    const minutes = match[2] ? parseInt(match[2]) : 0
    const seconds = match[3] ? parseInt(match[3]) : 0
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  // Format view count
  const formatViewCount = (count) => {
    if (!count) return '0'
    const num = parseInt(count)
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M'
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K'
    }
    return num.toString()
  }

  const filteredContent = activeTab === 'all'
    ? blogs
    : blogs.filter(item => item.type === activeTab)

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
      case 'video':
        return 'bg-gradient-to-br from-red-600 to-red-800'
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

          {activeTab === 'videos' ? (
            <YoutubeVideos channelId={import.meta.env.VITE_YOUTUBE_CHANNEL_ID} maxResults={6} />
          ) : loading ? (
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

              {/* YouTube Videos Section */}
              {activeTab === 'all' && youtubeVideos.length > 0 && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Latest Videos</h2>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {youtubeVideos.map((video) => (
                      <a
                        key={video.id}
                        href={`https://www.youtube.com/watch?v=${video.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group"
                      >
                        <div className="relative aspect-video overflow-hidden">
                          <img
                            src={video.thumbnail}
                            alt={video.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                          <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {video.readTime}
                          </div>
                          <div className="absolute top-2 left-2 bg-red-600 text-white px-2 py-1 rounded text-xs font-bold flex items-center gap-1">
                            <Youtube className="h-3 w-3" />
                            YouTube
                          </div>
                        </div>
                        <div className="p-4">
                          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
                            {video.title}
                          </h3>
                          <div className="flex items-center gap-3 text-sm text-gray-500">
                            {video.viewCount && (
                              <span className="flex items-center gap-1">
                                <Eye className="h-3 w-3" />
                                {video.viewCount} views
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {formatDate(video.publishedAt)}
                            </span>
                          </div>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {activeTab !== 'videos' && (
            <div className="text-center mt-12">
              <button className="bg-primary-600 text-white px-8 py-4 rounded-full font-semibold hover:bg-primary-700 transition-colors">
                Load More Insights
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
