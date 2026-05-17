import { Target, Zap, Rocket } from 'lucide-react'
import { useState } from 'react'

const features = [
  {
    icon: Target,
    number: '01',
    title: 'Solve growth challenges with the right expertise',
    description: 'Access seasoned CPG professionals, operators, strategists, and growth specialists who understand the realities of scaling brands across sales, distribution, GTM, retail, operations, and transformation.',
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
    description: "Today's businesses need adaptable systems, measurable execution, and real-world implementation — not generic frameworks and endless presentations. Mind Magna works closely with leadership teams to design and execute scalable growth solutions aligned to business realities.",
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
    title: 'Move faster with flexible, high-impact capabilities',
    description: 'Business transformation cannot wait for long consulting cycles. Mind Magna provides agile access to specialized expertise, AI-powered solutions, and execution frameworks that accelerate decision-making and business outcomes.',
    details: [
      'Agile Expertise Access',
      'AI-powered Solutions',
      'Execution Frameworks',
      'Accelerated Outcomes'
    ]
  }
]

export default function AboutMagna() {
  const [hoveredIndex, setHoveredIndex] = useState(null)

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-start">
          <div className="md:sticky md:top-8">
            <h2 className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-6">
              A modern consulting ecosystem for scaling consumer brands
            </h2>
            <p className="text-xl text-gray-700 leading-relaxed">
              Mind Magna helps consumer brands solve complex business challenges through a conscious growth framework powered by experienced industry leaders, AI-enabled systems, and execution-focused expertise.
            </p>
          </div>

          <div className="space-y-6">
            {features.map((feature, index) => {
              const Icon = feature.icon
              const isHovered = hoveredIndex === index
              return (
                <div
                  key={index}
                  className="bg-white rounded-3xl p-6 border-2 border-gray-200 hover:border-primary hover:shadow-glow-combined transition-all duration-300 cursor-pointer"
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 bg-gradient-primary rounded-2xl flex items-center justify-center shadow-glow-cyan flex-shrink-0">
                      <Icon className="h-7 w-7 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-bold text-primary uppercase tracking-wider mb-2">
                        {feature.number}
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 mb-2">
                        {feature.title}
                      </h3>
                    </div>
                  </div>

                  <div
                    className={`mt-4 overflow-hidden transition-all duration-300 ${
                      isHovered ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                    }`}
                  >
                    <p className="text-gray-600 leading-relaxed text-sm mb-4">
                      {feature.description}
                    </p>
                    <div className="pt-4 border-t border-gray-100">
                      <ul className="space-y-2">
                        {feature.details.map((detail, idx) => (
                          <li key={idx} className="flex items-center gap-2 text-sm text-gray-700">
                            <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                            {detail}
                          </li>
                        ))}
                      </ul>
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
