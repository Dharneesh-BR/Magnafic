import { Target, Users, Award, Globe, Heart, Zap } from 'lucide-react'
import Founder from '../components/Founder'
import CompanyLogos from '../components/CompanyLogos'
import FaqSection from '../components/FaqSection'

export default function About() {
  const values = [
    {
      icon: Target,
      title: 'Mission',
      eyebrow: 'What we do',
      description: "To empower consumer brands with access to the world's Top 1% elite experts in strategy, growth, distribution, branding, and transformation."
    },
    {
      icon: Zap,
      title: 'Vision',
      eyebrow: 'Where we are going',
      description: 'To make elite expertise radically easier to access, helping ambitious consumer brands move faster, scale smarter, and build with confidence.'
    },
    {
      icon: Heart,
      title: 'Values',
      eyebrow: 'How we work',
      description: 'Excellence, execution, innovation, integrity, and consumer-first thinking define everything we build at Magnafic.'
    }
  ]

  const differentiators = [
    {
      title: 'Fit to Purpose',
      description: "Work with consultants who've seen (and solved) your business challenge before."
    },
    {
      title: 'Flexible Approach',
      description: 'Get the consultants you need for the duration you need them.'
    },
    {
      title: 'Fast Deployment',
      description: 'Build your team and get started in a matter of days, not months.'
    },
    {
      title: 'Fair Value',
      description: 'High standards with low overhead: Catalant provides a far better value for the investment.'
    }
  ]

  return (
    <div className="px-2 pt-24 pb-16 sm:px-6 sm:pb-20 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16 pt-8">
          <h1 className="mb-4 text-4xl font-bold text-[#000047] sm:text-4xl">Redefining how <br className="sm:hidden" />CPG leaders overcome their most important challenges with smarter, modern solutions.</h1>
          
        </div>

        <div className="mb-16 grid gap-5 md:grid-cols-3 md:gap-6">
          {values.map((value, index) => (
            <div
              key={index}
              className="group relative overflow-hidden rounded-lg bg-gradient-primary p-[1px] shadow-xl shadow-primary-900/10 transition-all duration-300 hover:-translate-y-1 hover:shadow-glow-combined"
            >
              <div className="relative h-full rounded-[7px] bg-gradient-primary p-6 text-center text-white sm:p-7">
                <div className="pointer-events-none absolute inset-0 bg-primary-900/12" />
                <div className="pointer-events-none absolute inset-x-5 top-0 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent" />
                <div className="pointer-events-none absolute inset-x-8 bottom-0 h-px bg-gradient-to-r from-transparent via-cyan/70 to-transparent" />

                <div className="relative mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-lg border border-white/25 bg-white shadow-glow-cyan">
                  <value.icon className="h-7 w-7 text-primary-700" />
                </div>

                <div className="relative mb-3 text-lg font-extrabold uppercase text-cyan-100">
                  {value.eyebrow}
                </div>
                <h3 className="relative mb-3 text-2xl font-extrabold text-white">{value.title}</h3>
                <p className="relative text-xl font-semibold leading-6 text-white/86 sm:text-base">
                  {value.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mb-16 relative overflow-hidden rounded-3xl p-8 sm:p-12" style={{ backgroundColor: '#000047' }}>
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
          </div>
          <div className="relative">
            <div className="mb-4 text-2xl font-extrabold uppercase text-center text-cyan-100">
              What Makes Us Different
            </div>
            <h2 className="mb-10 text-2xl text-center font-bold text-white sm:text-3xl">
              Magnafic Delivers Better Business Outcomes With Consulting 4.0
            </h2>
            <div className="grid gap-6 md:grid-cols-2">
              {differentiators.map((item, index) => (
                <div
                  key={index}
                  className="rounded-xl border border-cyan bg-white/5 p-6 backdrop-blur-sm transition-all duration-300 hover:bg-white/10"
                >
                  <h3 className="mb-3 text-xl font-bold text-white">{item.title}</h3>
                  <p className="text-white/80 text-lg">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mb-16 relative overflow-hidden rounded-3xl p-8 sm:p-12 bg-white">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary-500/5 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
          </div>
          <div className="relative">
            <div className="mb-4 text-3xl font-extrabold text-center text-primary-600">
              What's in a Name
            </div>
            <h2 className="mb-8 text-2xl text-center font-bold text-gray-900 sm:text-3xl">
              Magna + Fication
            </h2>
            <div className="grid md:grid-cols-[35%_65%] gap-8">
              <div className="flex flex-col justify-center">
                <div className="rounded-2xl border-2 border-primary-200 bg-primary-50 p-6">
                  <div className="text-2xl sm:text-4xl font-bold text-gray-900 mb-2">Hello ! <br/>Our Name Means...</div>
                  <div className="text-2xl sm:text-4xl font-extrabold bg-gradient-primary text-white mb-4">Magna-fication</div>
                  <div className="space-y-3">
                    <div className="text-2xl sm:text-4xl font-bold text-gray-900">Magnate</div>
                    <div className="text-2xl sm:text-4xl font-bold text-gray-900">Magnification</div>
                    <div className="text-2xl sm:text-4xl font-bold text-gray-900">Magnitude</div>
                  </div>
                </div>
              </div>
              <div className="flex flex-col justify-center">
                <div className="relative rounded-lg border border-primary-100 bg-white p-5 text-left shadow-xl shadow-primary-900/5 ring-1 ring-cyan/20 sm:border-0 sm:bg-transparent sm:shadow-none sm:ring-0 sm:p-0 sm:text-left">
                  <div className="pointer-events-none absolute inset-x-5 top-0 h-px bg-gradient-to-r from-transparent via-cyan to-transparent sm:hidden" />
                  <div className="pointer-events-none absolute inset-x-5 bottom-0 h-px bg-gradient-to-r from-transparent via-primary-300 to-transparent sm:hidden" />
                <p className="text-gray-600 text-xl mb-4">
                  “Magna” comes from Magnate, Magnification, and Magnitude — representing greatness, scale, power, and transformational impact.
                  “Fication” represents the process of creating, transforming, and amplifying businesses into their highest potential.
                </p>
                <p className="text-gray-600 text-xl mb-4">
                  Mag-nah-fic is more than just a name — it’s our mission. We act as a strategic magnifier for consumer brands, helping businesses simplify complexity, unlock massive growth, and access elite independent expertise to move faster and scale smarter.
                </p>
                
              </div>
              </div>
            </div>
          </div>
        </div>

        <Founder />

        <CompanyLogos />

        <FaqSection />

        <div className="rounded-2xl bg-[#000047] p-5 shadow-lg sm:p-8">
          <h2 className="mb-6 text-center text-4xl font-bold text-white sm:text-3xl">Why Choose Us?</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              'Verified Experts',
              'Transparent Pricing',
              'Secure Platform',
              'Quality Guarantee',
              'Flexible Engagement',
              'Fast Matching'
            ].map((feature, index) => (
              <div key={index} className="flex items-center space-x-3">
                <Award className="h-5 w-5 text-white flex-shrink-0" />
                <span className="text-white text-lg">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
