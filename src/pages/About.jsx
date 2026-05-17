import { Target, Users, Award, Globe, Heart, Zap } from 'lucide-react'

export default function About() {
  const values = [
    {
      icon: Target,
      title: 'Mission',
      description: 'To empower businesses and individuals with expert knowledge and innovative solutions for digital transformation.'
    },
    {
      icon: Zap,
      title: 'Vision',
      description: 'To be the leading global platform connecting businesses with world-class consultants and experts.'
    },
    {
      icon: Heart,
      title: 'Values',
      description: 'Excellence, integrity, innovation, and collaboration are at the heart of everything we do.'
    }
  ]

  const stats = [
    { number: '10,000+', label: 'Experts Worldwide' },
    { number: '50,000+', label: 'Projects Completed' },
    { number: '150+', label: 'Countries Served' },
    { number: '98%', label: 'Client Satisfaction' }
  ]

  const team = [
    { name: 'John Smith', role: 'CEO & Founder' },
    { name: 'Sarah Johnson', role: 'CTO' },
    { name: 'Michael Chen', role: 'Head of Operations' },
    { name: 'Emily Davis', role: 'VP of Sales' }
  ]

  return (
    <div className="pt-24 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">About Mind Magna</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We are on a mission to democratize access to world-class expertise and drive digital transformation across industries.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {values.map((value, index) => (
            <div key={index} className="bg-white rounded-2xl shadow-lg p-8 text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <value.icon className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">{value.title}</h3>
              <p className="text-gray-600">{value.description}</p>
            </div>
          ))}
        </div>

        <div className="bg-gradient-to-r from-primary-600 to-purple-600 rounded-3xl p-12 mb-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-white text-center">
            {stats.map((stat, index) => (
              <div key={index}>
                <div className="text-4xl font-bold mb-2">{stat.number}</div>
                <div className="text-white/80">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-12 mb-16">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Story</h2>
            <p className="text-gray-600 mb-4">
              Founded in 2024, Mind Magna was born from a simple observation: businesses of all sizes struggle to find 
              the right expertise at the right time. Traditional consulting firms are expensive and inaccessible to many, 
              while freelance platforms lack quality control and verification.
            </p>
            <p className="text-gray-600 mb-4">
              We set out to create a platform that bridges this gap - a place where verified experts can connect with 
              businesses seeking specialized knowledge, with transparency, quality, and trust at its core.
            </p>
            <p className="text-gray-600">
              Today, we're proud to serve thousands of businesses and experts worldwide, facilitating meaningful 
              collaborations that drive real results.
            </p>
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Leadership Team</h2>
            <div className="space-y-4">
              {team.map((member, index) => (
                <div key={index} className="flex items-center space-x-4 bg-gray-50 rounded-xl p-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{member.name}</div>
                    <div className="text-gray-600 text-sm">{member.role}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Why Choose Us?</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              'Verified Experts',
              'Transparent Pricing',
              'Secure Platform',
              '24/7 Support',
              'Global Network',
              'Quality Guarantee',
              'Flexible Engagement',
              'Fast Matching'
            ].map((feature, index) => (
              <div key={index} className="flex items-center space-x-3">
                <Award className="h-5 w-5 text-primary-600 flex-shrink-0" />
                <span className="text-gray-700">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
