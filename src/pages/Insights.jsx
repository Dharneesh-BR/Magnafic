import { FileText, Lightbulb, Briefcase, Calendar, Clock, Tag } from 'lucide-react'
import { useState, useEffect } from 'react'
import { client } from '../lib/sanityClient'

export default function Insights() {
  const [activeTab, setActiveTab] = useState('all')
  const [blogs, setBlogs] = useState([])
  const [loading, setLoading] = useState(true)

  const tabs = [
    { id: 'all', label: 'All' },
    { id: 'research', label: 'Research & Insights' },
    { id: 'article', label: 'Articles' },
    { id: 'case-study', label: 'Case Studies' }
  ]

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const query = `*[_type == "blog"] | order(publishedAt desc) {
          _id,
          title,
          excerpt,
          type,
          category,
          publishedAt,
          readTime,
          "imageUrl": "main Image".asset->url
        }`
        const data = await client.fetch(query)
        setBlogs(data)
      } catch (error) {
        console.error('Error fetching blogs:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchBlogs()
  }, [])

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
      default:
        return 'bg-gradient-to-br from-indigo-500 to-blue-500'
    }
  }

  const getImageUrl = (imageUrl) => {
    return imageUrl || null
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Video Banner */}
      <div className="relative w-full h-[400px] md:h-[500px] overflow-hidden">
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
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">Insights</h1>
            <p className="text-lg md:text-xl text-gray-200 max-w-2xl mx-auto">
              Clarity Drives Growth
           </p>
          </div>
        </div>
      </div>

      <div className="pt-12 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">

        <div className="flex justify-center mb-12">
          <div className="inline-flex bg-gray-100 rounded-full p-1">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-2 rounded-full font-medium transition-colors ${
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
                  <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
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
                  <h3 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-primary-600 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 mb-4">{item.excerpt}</p>
                  <button className="text-primary-600 font-semibold group-hover:text-primary-700">
                    Read More →
                  </button>
                </div>
              </article>
            ))}
          </div>
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
