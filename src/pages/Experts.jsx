import { Search, Filter, Star, MapPin, Briefcase, Clock } from 'lucide-react'

export default function Experts() {
  const experts = [
    {
      name: 'Dr. Sarah Johnson',
      role: 'Digital Transformation Consultant',
      rating: 4.9,
      reviews: 127,
      location: 'New York, USA',
      expertise: ['Digital Strategy', 'Cloud Migration', 'AI Implementation'],
      hourlyRate: '$150-200',
      available: true
    },
    {
      name: 'Michael Chen',
      role: 'Business Strategy Expert',
      rating: 4.8,
      reviews: 98,
      location: 'San Francisco, USA',
      expertise: ['Growth Strategy', 'Market Analysis', 'Operations'],
      hourlyRate: '$120-180',
      available: true
    },
    {
      name: 'Emily Rodriguez',
      role: 'Technology Consultant',
      rating: 5.0,
      reviews: 156,
      location: 'London, UK',
      expertise: ['Software Architecture', 'DevOps', 'Security'],
      hourlyRate: '$180-250',
      available: false
    },
    {
      name: 'James Wilson',
      role: 'Data Analytics Specialist',
      rating: 4.7,
      reviews: 84,
      location: 'Toronto, Canada',
      expertise: ['Data Science', 'Machine Learning', 'BI Tools'],
      hourlyRate: '$140-200',
      available: true
    },
    {
      name: 'Lisa Thompson',
      role: 'Marketing Consultant',
      rating: 4.9,
      reviews: 112,
      location: 'Sydney, Australia',
      expertise: ['Digital Marketing', 'Brand Strategy', 'SEO'],
      hourlyRate: '$100-150',
      available: true
    },
    {
      name: 'David Kim',
      role: 'Financial Advisor',
      rating: 4.8,
      reviews: 73,
      location: 'Singapore',
      expertise: ['Financial Planning', 'Risk Management', 'Investment'],
      hourlyRate: '$160-220',
      available: true
    }
  ]

  return (
    <div className="pt-24 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Find Expert Consultants</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Connect with verified experts across various domains to solve your business challenges
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search experts by name, expertise, or skills..."
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <button className="flex items-center justify-center space-x-2 px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors">
              <Filter className="h-5 w-5" />
              <span>Filters</span>
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {experts.map((expert, index) => (
            <div key={index} className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xl font-bold">
                  {expert.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="flex items-center space-x-1">
                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                  <span className="font-semibold">{expert.rating}</span>
                  <span className="text-gray-500">({expert.reviews})</span>
                </div>
              </div>

              <h3 className="text-xl font-semibold text-gray-900 mb-1">{expert.name}</h3>
              <p className="text-primary-600 mb-4">{expert.role}</p>

              <div className="space-y-2 mb-4">
                <div className="flex items-center text-gray-600 text-sm">
                  <MapPin className="h-4 w-4 mr-2" />
                  {expert.location}
                </div>
                <div className="flex items-center text-gray-600 text-sm">
                  <Briefcase className="h-4 w-4 mr-2" />
                  {expert.expertise.slice(0, 2).join(', ')}
                </div>
                <div className="flex items-center text-gray-600 text-sm">
                  <Clock className="h-4 w-4 mr-2" />
                  {expert.hourlyRate}/hour
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <span className={`text-sm font-medium ${expert.available ? 'text-green-600' : 'text-red-600'}`}>
                  {expert.available ? '● Available' : '● Busy'}
                </span>
                <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium">
                  View Profile
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
