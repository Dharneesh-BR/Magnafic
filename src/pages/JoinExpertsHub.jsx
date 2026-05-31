import { Link } from 'react-router-dom'
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
    <div className="px-4 pt-24 pb-16 sm:px-6 sm:pb-20 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="mb-4 text-3xl font-bold text-gray-900 sm:text-4xl">Join Our Experts Hub</h1>
          <p className="mx-auto max-w-3xl text-lg text-gray-600 sm:text-xl">
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

        <div className="mb-16 rounded-3xl bg-gradient-to-br from-gray-50 to-primary-50 p-6 sm:p-12">
          <h2 className="mb-10 text-center text-2xl font-bold text-gray-900 sm:mb-12 sm:text-3xl">How It Works</h2>
          <div className="grid gap-8 md:grid-cols-4">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                <div className="mb-4 text-4xl font-bold text-primary-200 sm:text-5xl">{step.number}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
                {index < steps.length - 1 && (
                  <ArrowRight className="hidden md:block absolute top-4 right-0 transform translate-x-4 h-6 w-6 text-primary-300" />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          <div className="rounded-2xl bg-white p-5 shadow-lg sm:p-8">
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

          <div className="rounded-2xl bg-primary-600 p-5 text-white shadow-lg sm:p-8">
            <h3 className="text-2xl font-bold mb-6">Consultant Access</h3>
            <p className="text-white/90 mb-6">
              Consultant accounts are created by the Magnafic backend team after verification. Once your Firebase account is ready, you will receive login credentials and can reset your password from the login page.
            </p>
            <div className="space-y-4">
              <Link to="/login" className="block w-full rounded-lg bg-white py-3 text-center font-semibold text-primary-600 transition-colors hover:bg-gray-100">
                Consultant Login
              </Link>
              <Link to="/contact" className="block w-full rounded-lg border border-white/30 py-3 text-center font-semibold text-white transition-colors hover:bg-white/10">
                Contact Magnafic
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
