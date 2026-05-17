import { Zap, Shield, Target } from 'lucide-react'

export default function ValueProp() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-7xl mx-auto">
        <div className="max-w-4xl mx-auto text-center mb-4">
          <h2 className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-6 leading-tight">
            Big consulting is too big to evolve. Consumer brands can't afford to wait.
          </h2>
          <p className="text-xl text-gray-700 leading-relaxed">
            In today's dynamic marketplace, growth requires agility, intelligence, and execution — not endless presentations and oversized consulting structures.
          </p>
        </div>

        <div className="max-w-4xl mx-auto mb-16">
          <p className="text-lg text-gray-700 leading-relaxed text-center">
            Mind Magna empowers brands with direct access to experienced CPG professionals, growth operators, and AI-enabled business ecosystems that solve complex business challenges faster and more efficiently.
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <h3 className="text-3xl font-extrabold text-primary mb-12 text-center">
            Modern expertise for modern growth.
          </h3>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-8 border-2 border-gray-200 hover:border-primary hover:shadow-glow-blue transition-all hover:scale-105">
              <div className="w-14 h-14 bg-gradient-primary rounded-xl flex items-center justify-center mb-6 shadow-glow-cyan">
                <Zap className="h-7 w-7 text-white" />
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-3">No bloated teams</h4>
              <p className="text-gray-600">
                Direct access to senior experts without the overhead of pyramid staffing models
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 border-2 border-gray-200 hover:border-primary hover:shadow-glow-blue transition-all hover:scale-105">
              <div className="w-14 h-14 bg-gradient-primary rounded-xl flex items-center justify-center mb-6 shadow-glow-cyan">
                <Shield className="h-7 w-7 text-white" />
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-3">No generic playbooks</h4>
              <p className="text-gray-600">
                Tailored strategies designed specifically for your brand's unique challenges
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 border-2 border-gray-200 hover:border-primary hover:shadow-glow-blue transition-all hover:scale-105">
              <div className="w-14 h-14 bg-gradient-primary rounded-xl flex items-center justify-center mb-6 shadow-glow-cyan">
                <Target className="h-7 w-7 text-white" />
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-3">Outcome-driven expertise</h4>
              <p className="text-gray-600">
                Focus on measurable results and tangible business impact
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
