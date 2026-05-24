import { useState, useEffect } from 'react'
import { Youtube, Clock, Eye } from 'lucide-react'

const YoutubeVideos = ({ channelId, maxResults = 6 }) => {
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const apiKey = import.meta.env.VITE_YOUTUBE_API_KEY
        
        if (!apiKey) {
          throw new Error('YouTube API key not found. Please add VITE_YOUTUBE_API_KEY to your environment variables.')
        }

        if (!channelId) {
          throw new Error('Channel ID is required.')
        }

        // First, get the channel's uploads playlist ID
        const channelResponse = await fetch(
          `https://www.googleapis.com/youtube/v3/channels?part=contentDetails&id=${channelId}&key=${apiKey}`
        )
        
        if (!channelResponse.ok) {
          const errorData = await channelResponse.json()
          throw new Error(`Failed to fetch channel data: ${errorData.error?.message || 'Please check your API key and Channel ID.'}`)
        }

        const channelData = await channelResponse.json()
        
        if (!channelData.items || channelData.items.length === 0) {
          throw new Error('Channel not found. Please check the Channel ID.')
        }

        const uploadsPlaylistId = channelData.items[0].contentDetails.relatedPlaylists.uploads

        // Then, fetch videos from the uploads playlist
        const videosResponse = await fetch(
          `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&playlistId=${uploadsPlaylistId}&maxResults=${maxResults}&key=${apiKey}`
        )

        if (!videosResponse.ok) {
          const errorData = await videosResponse.json()
          throw new Error(`Failed to fetch videos: ${errorData.error?.message || 'Please check your API quota.'}`)
        }

        const videosData = await videosResponse.json()
        
        if (!videosData.items) {
          throw new Error('No videos found.')
        }

        // Get video IDs to fetch additional details (duration, view count)
        const videoIds = videosData.items.map(item => item.contentDetails.videoId).join(',')
        
        const videoDetailsResponse = await fetch(
          `https://www.googleapis.com/youtube/v3/videos?part=contentDetails,statistics&id=${videoIds}&key=${apiKey}`
        )

        const videoDetailsData = await videoDetailsResponse.json()

        // Create a map of video details
        const videoDetailsMap = {}
        if (videoDetailsData.items) {
          videoDetailsData.items.forEach(video => {
            videoDetailsMap[video.id] = {
              duration: formatDuration(video.contentDetails.duration),
              viewCount: formatViewCount(video.statistics.viewCount)
            }
          })
        }

        // Combine video data with details
        const videosWithDetails = videosData.items.map(item => ({
          id: item.contentDetails.videoId,
          title: item.snippet.title,
          description: item.snippet.description,
          thumbnail: item.snippet.thumbnails.maxres?.url || 
                     item.snippet.thumbnails.high?.url || 
                     item.snippet.thumbnails.medium?.url || 
                     item.snippet.thumbnails.default?.url,
          publishedAt: new Date(item.snippet.publishedAt).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          }),
          ...videoDetailsMap[item.contentDetails.videoId]
        }))

        setVideos(videosWithDetails)
      } catch (err) {
        setError(err.message)
        console.error('Error fetching YouTube videos:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchVideos()
  }, [channelId, maxResults])

  // Format YouTube duration (PT4M30S -> 4:30)
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

  // Format view count (1000 -> 1K, 1000000 -> 1M)
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

  if (loading) {
    return (
      <div className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div>
            <p className="text-gray-600">Loading videos...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <Youtube className="h-12 w-12 text-red-600 mx-auto mb-4" />
            <p className="text-red-800 font-semibold mb-2">Error Loading Videos</p>
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  if (videos.length === 0) {
    return (
      <div className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
            <Youtube className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No videos found</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map((video) => (
            <a
              key={video.id}
              href={`https://www.youtube.com/watch?v=${video.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="group bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
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
                  {video.duration || '--:--'}
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
                    <Clock className="h-3 w-3" />
                    {video.publishedAt}
                  </span>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}

export default YoutubeVideos
