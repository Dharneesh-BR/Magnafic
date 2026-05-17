import { UserPlus, CheckCircle, Star, TrendingUp, Users, Award, ArrowRight } from 'lucide-react'

export default function JoinExpertsHub() {
  const benefits = [
    {
      icon: Users,
      title: 'Global Network',
      description: 'Connect with businesses and professionals worldwide'
    },
    {
      icon: TrendingUp,
      title: 'Growth Opportunities',
      description: 'Access to high-value projects and clients'
    },
    {
      icon: Star,
      title: 'Profile Visibility',
      description: 'Showcase your expertise to a targeted audience'
    },
    {
      icon: Award,
      title: 'Certification',
      description: 'Get verified and build trust with clients'
    },
    {
      icon: CheckCircle,
      title: 'Flexible Work',
      description: 'Work on your terms, choose your projects'
    },
    {
      icon: UserPlus,
      title: 'Community Support',
      description: 'Join a community of like-minded experts'
    }
  ]

  const steps = [
    {
      number: '01',
      title: 'Create Your Profile',
      description: 'Build a comprehensive profile showcasing your expertise, experience, and portfolio'
    },
    {
      number: '02',
      title: 'Get Verified',
      description: 'Complete our verification process to build trust with potential clients'
    },
    {
      number: '03',
      title: 'Set Your Rates',
      description: 'Define your hourly rates and project pricing based on your expertise'
    },
    {
      number: '04',
      title: 'Start Consulting',
      description: 'Begin receiving project requests and start consulting with clients'
    }
  ]

  return (
    <div className="pt-24 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Join Our Experts Hub</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Become part of our elite network of consultants and experts. Connect with businesses, 
            work on exciting projects, and grow your professional career.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {benefits.map((benefit, index) => (
            <div key={index} className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-all">
              <div className="w-14 h-14 bg-primary-100 rounded-xl flex items-center justify-center mb-6">
                <benefit.icon className="h-7 w-7 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">{benefit.title}</h3>
              <p className="text-gray-600">{benefit.description}</p>
            </div>
          ))}
        </div>

        <div className="bg-gradient-to-br from-gray-50 to-primary-50 rounded-3xl p-12 mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">How It Works</h2>
          <div className="grid md:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                <div className="text-5xl font-bold text-primary-200 mb-4">{step.number}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
                {index < steps.length - 1 && (
                  <ArrowRight className="hidden md:block absolute top-4 right-0 transform translate-x-4 h-6 w-6 text-primary-300" />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Expert Requirements</h3>
            <ul className="space-y-4">
              {[
                'Minimum 5 years of professional experience',
                'Proven track record in your field',
                'Strong communication skills',
                'Ability to work independently',
                'Professional certifications (preferred)',
                'Portfolio of past projects'
              ].map((req, index) => (
                <li key={index} className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">{req}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-primary-600 rounded-2xl shadow-lg p-8 text-white">
            <h3 className="text-2xl font-bold mb-6">Ready to Join?</h3>
            <p className="text-white/90 mb-6">
              Start your application today and become part of our growing network of expert consultants.
            </p>
            <form className="space-y-4">
              <input
                type="text"
                placeholder="Full Name"
                className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50"
              />
              <input
                type="email"
                placeholder="Email Address"
                className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50"
              />
              <select className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-white/50">
                <option value="" className="text-gray-900">Area of Expertise</option>
                <option value="digital" className="text-gray-900">Digital Transformation</option>
                <option value="strategy" className="text-gray-900">Business Strategy</option>
                <option value="technology" className="text-gray-900">Technology</option>
                <option value="marketing" className="text-gray-900">Marketing</option>
                <option value="finance" className="text-gray-900">Finance</option>
              </select>
              <button className="w-full bg-white text-primary-600 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                Submit Application
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
