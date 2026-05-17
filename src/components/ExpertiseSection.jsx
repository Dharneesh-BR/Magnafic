import { Award, Users, Zap } from 'lucide-react'

const expertiseAreas = [
  'Consumer brands',
  'Distribution & retail',
  'Sales transformation',
  'AI & analytics',
  'Operations & supply chain',
  'Strategy & finance',
  'Organizational scaling'
]

export default function ExpertiseSection() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-6">
            Modern business challenges require modern expertise
          </h2>
          <p className="text-xl text-gray-700 max-w-4xl mx-auto leading-relaxed">
            Traditional consulting firms rely on layered teams and generalized frameworks. Mind Magna is building a flexible ecosystem of experienced operators, strategic thinkers, and AI-enabled specialists designed for modern consumer businesses.
          </p>
        </div>

        <div className="max-w-5xl mx-auto mb-16">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Our experts bring hands-on experience across:
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {expertiseAreas.map((area) => (
              <div
                key={area}
                className="bg-gray-50 rounded-2xl p-4 text-center border-2 border-gray-200 hover:border-primary hover:bg-primary/5 transition-all"
              >
                <span className="text-gray-700 font-medium">{area}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-br from-primary/10 to-cyan/10 rounded-3xl p-8 md:p-12 border-2 border-primary/20">
          <h3 className="text-3xl font-extrabold text-gray-900 mb-8 text-center">
            Expertise that works inside the business — not outside it
          </h3>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <div className="w-14 h-14 bg-gradient-primary rounded-xl flex items-center justify-center mb-4 shadow-glow-cyan">
                <Award className="h-7 w-7 text-white" />
              </div>
              <div className="text-5xl font-extrabold text-primary mb-2">20+</div>
              <p className="text-gray-700 font-medium">Average years of industry & operational experience</p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <div className="w-14 h-14 bg-gradient-primary rounded-xl flex items-center justify-center mb-4 shadow-glow-cyan">
                <Users className="h-7 w-7 text-white" />
              </div>
              <div className="text-2xl font-extrabold text-primary mb-2">Real Operators</div>
              <p className="text-gray-700 font-medium">Leaders who've scaled brands, built systems, and driven transformation</p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <div className="w-14 h-14 bg-gradient-primary rounded-xl flex items-center justify-center mb-4 shadow-glow-cyan">
                <Zap className="h-7 w-7 text-white" />
              </div>
              <div className="text-2xl font-extrabold text-primary mb-2">Agile Engagement Models</div>
              <p className="text-gray-700 font-medium">Access individual experts, focused project teams, or long-term strategic partnerships</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
