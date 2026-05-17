import { Target, Zap, Rocket } from 'lucide-react'

export default function AboutMagna() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primary/5 to-cyan/5">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-6">
            A modern consulting ecosystem for scaling consumer brands
          </h2>
          <p className="text-xl text-gray-700 max-w-4xl mx-auto leading-relaxed">
            Mind Magna helps consumer brands solve complex business challenges through a conscious growth framework powered by experienced industry leaders, AI-enabled systems, and execution-focused expertise.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="bg-white rounded-3xl p-8 border-2 border-gray-200 hover:border-primary hover:shadow-glow-combined transition-all hover:scale-105">
            <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mb-6 shadow-glow-cyan">
              <Target className="h-8 w-8 text-white" />
            </div>
            <div className="text-sm font-bold text-primary uppercase tracking-wider mb-3">
              01
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Solve growth challenges with the right expertise
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Access seasoned CPG professionals, operators, strategists, and growth specialists who understand the realities of scaling brands across sales, distribution, GTM, retail, operations, and transformation.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-8 border-2 border-gray-200 hover:border-primary hover:shadow-glow-combined transition-all hover:scale-105">
            <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mb-6 shadow-glow-cyan">
              <Zap className="h-8 w-8 text-white" />
            </div>
            <div className="text-sm font-bold text-primary uppercase tracking-wider mb-3">
              02
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Built for modern business, not outdated consulting models
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Today's businesses need adaptable systems, measurable execution, and real-world implementation — not generic frameworks and endless presentations. Mind Magna works closely with leadership teams to design and execute scalable growth solutions aligned to business realities.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-8 border-2 border-gray-200 hover:border-primary hover:shadow-glow-combined transition-all hover:scale-105">
            <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mb-6 shadow-glow-cyan">
              <Rocket className="h-8 w-8 text-white" />
            </div>
            <div className="text-sm font-bold text-primary uppercase tracking-wider mb-3">
              03
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Move faster with flexible, high-impact capabilities
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Business transformation cannot wait for long consulting cycles. Mind Magna provides agile access to specialized expertise, AI-powered solutions, and execution frameworks that accelerate decision-making and business outcomes.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
