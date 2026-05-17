
export default function ValueProp() {
  return (
    <section className="pt-10 pb-0 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Gradient Strip */}
      <div className="mt-8 mb-12 py-12 px-4 sm:px-6 lg:px-8 rounded-3xl" style={{ background: 'linear-gradient(135deg, #3533cd 0%, #00ffff 100%)' }}>
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-4 leading-tight">
            Leverage the Top 1% of Best-in-Class CPG Industry Experts
          </h2>
          <p className="text-lg sm:text-xl font-semibold text-white/90 leading-relaxed max-w-4xl mx-auto">
            Magnafic is India's first, distributed consulting network of CPG industry experts bringing together elite consultants, fractional executives, operators, and technology specialists to solve high-impact growth challenges for consumer brands.
          </p>
        </div>
      </div>
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

      <div className="max-w-7xl mx-auto relative">
        <div className="flex flex-col lg:flex-row items-end gap-8">
          {/* Left - Content */}
          <div className="relative flex-1">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 leading-tight">
              Big consulting is too big to evolve. <br/>Consumer brands can't afford to wait.
            </h2>
            <div className="space-y-6 mb-4">
              <p className="text-lg text-gray-700 leading-relaxed">
                In today's dynamic marketplace, growth requires agility, intelligence, and execution not endless presentations and oversized consulting structures.
              </p>
              <div className="h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
              <p className="text-base text-gray-700 leading-relaxed">
                Magnafic empowers brands with direct access to experienced CPG professionals, growth operators, and AI-enabled business ecosystems that solve complex business challenges faster and more efficiently.
              </p>
            </div>

            <h3 className="text-2xl font-extrabold text-gray-900 mb-6 leading-tight">
              Modern expertise for modern growth:
            </h3>
            <ul className="space-y-3 text-lg text-gray-700">
              <li>• No bloated teams.</li>
              <li>• No generic playbooks.</li>
              <li>• Just outcome-driven expertise.</li>
            </ul>
            <div className="pt-4"></div>
          </div>
          {/* Right - Image */}
          <img 
            src="/Image.png" 
            alt="Magnafic Banner" 
            className="w-auto h-[480px] object-contain ml-auto"
          />
          
          
        </div>
      </div>
      
      
    </section>
  )
}
