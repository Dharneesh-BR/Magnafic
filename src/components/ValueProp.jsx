import { Zap, Shield, Target } from 'lucide-react'

export default function ValueProp() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

      <div className="max-w-7xl mx-auto relative">
        <div className="relative bg-white rounded-3xl p-8 shadow-xl border border-gray-200">
          <h2 className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-6 leading-tight">
            Big consulting is too big to evolve. Consumer brands can't afford to wait.
          </h2>
          <div className="space-y-6 mb-8">
            <p className="text-xl text-gray-700 leading-relaxed">
              In today's dynamic marketplace, growth requires agility, intelligence, and execution — not endless presentations and oversized consulting structures.
            </p>
            <div className="h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
            <p className="text-lg text-gray-700 leading-relaxed">
              Magnafic empowers brands with direct access to experienced CPG professionals, growth operators, and AI-enabled business ecosystems that solve complex business challenges faster and more efficiently.
            </p>
          </div>

          <h3 className="text-3xl font-extrabold text-gray-900 mb-8 leading-tight">
            Modern expertise for modern growth.
          </h3>
          <div className="space-y-5">
            <div className="group flex items-start gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-200 hover:border-primary hover:shadow-lg transition-all duration-300 cursor-default">
              <div className="w-14 h-14 bg-gradient-primary rounded-2xl flex items-center justify-center shadow-glow-cyan flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                <Zap className="h-7 w-7 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="text-xl font-bold text-gray-900 group-hover:text-primary transition-colors duration-300">No bloated teams.</h4>
              </div>
            </div>
            <div className="group flex items-start gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-200 hover:border-primary hover:shadow-lg transition-all duration-300 cursor-default">
              <div className="w-14 h-14 bg-gradient-primary rounded-2xl flex items-center justify-center shadow-glow-cyan flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                <Shield className="h-7 w-7 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="text-xl font-bold text-gray-900 group-hover:text-primary transition-colors duration-300">No generic playbooks.</h4>
              </div>
            </div>
            <div className="group flex items-start gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-200 hover:border-primary hover:shadow-lg transition-all duration-300 cursor-default">
              <div className="w-14 h-14 bg-gradient-primary rounded-2xl flex items-center justify-center shadow-glow-cyan flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                <Target className="h-7 w-7 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="text-xl font-bold text-gray-900 group-hover:text-primary transition-colors duration-300">Just outcome-driven expertise.</h4>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
