import { CheckCircle2, Rocket, Target, Zap } from 'lucide-react'
import { useState } from 'react'

const features = [
  {
    icon: Target,
    number: '01',
    title: 'Solve growth challenges with the right expertise',
    description: 'Access seasoned CPG professionals, operators, strategists, and growth specialists who understand the realities of scaling brands across sales, distribution, GTM, D2C, E-commerce, retail, operations, and transformation.',
    details: [
      'CPG Industry Experts',
      'Growth Operators',
      'Strategic Thinkers',
      'Transformation Specialists'
    ]
  },
  {
    icon: Zap,
    number: '02',
    title: 'Built for modern business, not outdated consulting models',
    description: "Today's businesses need adaptable systems, measurable execution, and real-world implementation, not generic frameworks and endless presentations. We work closely with leadership teams to design and execute scalable growth solutions aligned to business realities.",
    details: [
      'Adaptive Systems',
      'Measurable Execution',
      'Real-world Implementation',
      'Scalable Solutions'
    ]
  },
  {
    icon: Rocket,
    number: '03',
    title: 'Move faster with AI-powered, flexible, high-impact capabilities',
    description: 'Business transformation cannot wait for long consulting cycles. We provide AI-powered solutions and execution frameworks that accelerate decision-making and business outcomes.',
    details: [
      'AI-powered Solutions',
      'Execution Frameworks',
      'Accelerated Outcomes'
    ]
  }
]

export default function AboutMagna() {
  const [hoveredIndex, setHoveredIndex] = useState(null)

  return (
    <section className="relative overflow-hidden bg-[#000047] px-4 pb-16 pt-10 sm:px-6 sm:pb-20 lg:px-8">
      <div className="pointer-events-none absolute inset-x-0 top-4 mx-auto h-36 w-36 rounded-full bg-cyan/15 blur-3xl sm:h-56 sm:w-56" />
      <div className="relative mx-auto max-w-7xl">
        <div className="rounded-lg border-0 p-5 shadow-lg shadow-primary-900/5 sm:p-7 md:border-0 md:bg-transparent md:p-0 md:grid md:gap-6 md:grid-cols-2 md:gap-12 md:items-start">
          <div className="text-center md:sticky md:top-8 md:text-left">
            
            <h2 className="mb-4 pt-4 pb-4 text-3xl font-extrabold leading-tight text-white sm:text-3xl md:mb-6 md:pt-0 md:pb-0">
              Fractional consulting ecosystem for scaling consumer brands
            </h2>
            <p className="hidden mx-auto max-w-xl text-base font-semibold leading-7 text-white/90 sm:block sm:text-lg md:mx-0">
              Magnafic helps consumer brands solve complex business challenges through a conscious growth framework powered by experienced industry leaders, AI-enabled systems, and execution-focused expertise.
            </p>
          </div>

          <div className="space-y-3 sm:space-y-4">
            {features.map((feature, index) => {
              const Icon = feature.icon
              const isHovered = hoveredIndex === index
              return (
                <div
                  key={index}
                  className="group rounded-lg border border-white/50 bg-gradient-primary p-[1px] shadow-lg shadow-primary-900/10 shadow-[0_0_30px_rgba(0,255,255,0.6)] transition-all duration-300 hover:shadow-glow-combined hover:shadow-[0_0_40px_rgba(0,255,255,0.8)] sm:rounded-2xl"
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  onClick={() => setHoveredIndex(hoveredIndex === index ? null : index)}
                >
                  <div className="rounded-[15px] bg-white/12 p-5 backdrop-blur-sm">
                    <div className="flex flex-col items-center">
                      <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg bg-white shadow-glow-cyan mb-4">
                        <Icon className="h-5 w-5 text-[#000047]" />
                      </div>
                      <div className="text-center">
                        <h3 className="mb-2 text-xl font-extrabold leading-snug text-white">
                          {feature.title}
                        </h3>
                      </div>
                    </div>

                    <div
                      className={`mt-4 overflow-hidden transition-all duration-300 ${
                        isHovered ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                      }`}
                    >
                      <p className="mb-4 text-center text-base font-medium leading-6 text-white/90 sm:text-base sm:text-left">
                        {feature.description}
                      </p>
                      <div className="border-t border-white/20 pt-4">
                        <ul className="flex flex-wrap justify-left gap-2 sm:justify-start">
                          {feature.details.map((detail, idx) => (
                            <li key={idx} className="inline-flex items-start gap-1.5 rounded-full border border-white/20 bg-white/12 px-3 py-1.5 text-sm font-bold text-white sm:text-sm">
                              <CheckCircle2 className="h-3.5 w-3.5 flex-shrink-0 text-cyan" />
                              {detail}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
