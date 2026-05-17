import { FileText, Lightbulb, Briefcase, Calendar, Clock, Tag } from 'lucide-react'
import { useState } from 'react'

export default function Insights() {
  const [activeTab, setActiveTab] = useState('all')

  const tabs = [
    { id: 'all', label: 'All' },
    { id: 'research', label: 'Research & Insights' },
    { id: 'articles', label: 'Articles' },
    { id: 'case-studies', label: 'Case Studies' }
  ]

  const content = [
    {
      type: 'research',
      title: 'The Future of Digital Transformation in 2024',
      excerpt: 'Explore the key trends shaping digital transformation and how businesses can prepare for the future.',
      date: 'May 15, 2024',
      readTime: '8 min read',
      category: 'Technology',
      image: 'bg-gradient-to-br from-blue-500 to-purple-500'
    },
    {
      type: 'article',
      title: '5 Strategies for Successful Cloud Migration',
      excerpt: 'Learn the best practices for migrating your infrastructure to the cloud with minimal disruption.',
      date: 'May 12, 2024',
      readTime: '6 min read',
      category: 'Cloud',
      image: 'bg-gradient-to-br from-green-500 to-teal-500'
    },
    {
      type: 'case-study',
      title: 'How Company X Achieved 200% Growth with AI',
      excerpt: 'A deep dive into how a leading retailer leveraged AI to transform their customer experience.',
      date: 'May 10, 2024',
      readTime: '12 min read',
      category: 'Case Study',
      image: 'bg-gradient-to-br from-orange-500 to-red-500'
    },
    {
      type: 'research',
      title: 'Building Resilient Supply Chains with Data Analytics',
      excerpt: 'Discover how data analytics can help build more resilient and efficient supply chains.',
      date: 'May 8, 2024',
      readTime: '10 min read',
      category: 'Analytics',
      image: 'bg-gradient-to-br from-pink-500 to-rose-500'
    },
    {
      type: 'article',
      title: 'The Role of Cybersecurity in Digital Transformation',
      excerpt: 'Understanding the critical importance of security in your digital transformation journey.',
      date: 'May 5, 2024',
      readTime: '7 min read',
      category: 'Security',
      image: 'bg-gradient-to-br from-indigo-500 to-blue-500'
    },
    {
      type: 'case-study',
      title: 'Digital Transformation Success: Healthcare Sector',
      excerpt: 'How a healthcare provider modernized their systems to improve patient outcomes.',
      date: 'May 3, 2024',
      readTime: '15 min read',
      category: 'Healthcare',
      image: 'bg-gradient-to-br from-cyan-500 to-blue-500'
    }
  ]

  const filteredContent = activeTab === 'all' 
    ? content 
    : content.filter(item => item.type === activeTab)

  return (
    <div className="pt-24 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Insights</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Stay informed with our research, articles, and case studies on digital transformation and technology trends
          </p>
        </div>

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

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredContent.map((item, index) => (
            <article key={index} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow group">
              <div className={`h-48 ${item.image} flex items-center justify-center`}>
                {item.type === 'research' && <Lightbulb className="h-16 w-16 text-white/80" />}
                {item.type === 'article' && <FileText className="h-16 w-16 text-white/80" />}
                {item.type === 'case-study' && <Briefcase className="h-16 w-16 text-white/80" />}
              </div>
              <div className="p-6">
                <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                  <span className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    {item.date}
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

        <div className="text-center mt-12">
          <button className="bg-primary-600 text-white px-8 py-4 rounded-full font-semibold hover:bg-primary-700 transition-colors">
            Load More Insights
          </button>
        </div>
      </div>
    </div>
  )
}
