import { Brain, Cpu, TrendingUp, BarChart3, Users } from 'lucide-react'

const frameworkItems = [
  {
    letter: 'M',
    title: 'Mindset Alignment',
    subtitle: 'Transformation, Leadership & Strategic Clarity',
    description: 'Build future-ready organizations by aligning leadership thinking, growth vision, and transformation priorities.',
    icon: Brain,
    coreAreas: [
      'Transformation & Value Creation',
      'Strategy & Finance',
      'Leadership Alignment',
      'Business Reinvention',
      'Change Management'
    ],
    enable: 'Navigate disruption, align capital with long-term strategy, and create a culture capable of sustaining transformation and growth.'
  },
  {
    letter: 'A',
    title: 'Architecture of Systems',
    subtitle: 'Digital, AI & Operational Infrastructure',
    description: 'Design intelligent business systems that reduce dependency, improve visibility, and create scalable operational foundations.',
    icon: Cpu,
    coreAreas: [
      'Digital & AI Transformation',
      'Advanced Analytics',
      'ERP, SFA, DMS and CRM',
      'Customer Loyalty Management Solutions'
    ],
    enable: 'Embed AI, analytics, and operational intelligence into the organization to create resilient, adaptable, and high-efficiency ecosystems.'
  },
  {
    letter: 'G',
    title: 'Growth Engine Design',
    subtitle: 'Commercial Growth & Market Expansion',
    description: 'Engineer scalable growth engines through customer-centric strategies, GTM optimization, and commercial acceleration.',
    icon: TrendingUp,
    coreAreas: [
      'Sales & Marketing',
      'GTM Strategy',
      'Direct 2 Customer Strategy (D2C)',
      'E Commerce Strategies',
      'Distribution & Retail Expansion',
      'Customer Insights & Analytics'
    ],
    enable: 'Accelerate top-line growth with data-driven commercial models designed for modern consumer markets.'
  },
  {
    letter: 'N',
    title: 'Numbers & Navigation',
    subtitle: 'Performance Intelligence & Value Optimization',
    description: 'Create financial visibility and performance measurement systems that guide strategic decisions and maximize enterprise value.',
    icon: BarChart3,
    coreAreas: [
      'Strategy & Finance',
      'Business Performance Dashboards',
      'KPI Architecture',
      'Value Creation Tracking',
      'M&A Analytics & Risk Assessment'
    ],
    enable: 'Measure what matters, improve decision velocity, and navigate complexity with clarity and confidence.'
  },
  {
    letter: 'A',
    title: 'Alignment of Team & Execution',
    subtitle: 'People, Performance & Enterprise Integration',
    description: 'Align teams, structures, and execution systems to ensure sustainable organizational performance.',
    icon: Users,
    coreAreas: [
      'Organization & People',
      'High-Performance Culture Design',
      'Execution Governance',
      'M&A Integration & Separation',
      'Cross-Functional Alignment'
    ],
    enable: 'Turn organizational alignment into a strategic advantage by building agile teams, accountable execution, and seamless business integration.'
  }
]

export default function MagnaFramework() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-4">
            The MAGNA Way to Build, Scale & Transform Consumer Brands
          </h2>
          <p className="text-2xl font-semibold text-primary">
            New Blueprint for Consumer Brand Growth
          </p>
        </div>

        <div className="space-y-12">
          {frameworkItems.map((item, index) => (
            <div
              key={item.letter}
              className={`grid md:grid-cols-[1fr_2fr] gap-8 items-start ${
                index % 2 === 1 ? 'md:grid-cols-[2fr_1fr] md:grid-flow-dense' : ''
              }`}
            >
              <div className={`${index % 2 === 1 ? 'md:col-start-2' : ''}`}>
                <div className="bg-gradient-primary rounded-3xl p-8 text-white shadow-glow-combined">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                      <item.icon className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <div className="text-6xl font-extrabold">{item.letter}</div>
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold mb-2">{item.title}</h3>
                  <p className="text-white/80 font-medium">{item.subtitle}</p>
                </div>
              </div>

              <div className={`${index % 2 === 1 ? 'md:col-start-1' : ''}`}>
                <div className="bg-gray-50 rounded-3xl p-8 border-2 border-gray-200 h-full">
                  <p className="text-lg text-gray-700 mb-6 leading-relaxed">
                    {item.description}
                  </p>

                  <div className="mb-6">
                    <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">
                      Core Areas
                    </h4>
                    <ul className="space-y-2">
                      {item.coreAreas.map((area) => (
                        <li key={area} className="flex items-start gap-2">
                          <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                          <span className="text-gray-700">{area}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-white rounded-2xl p-4 border border-primary/20">
                    <h4 className="text-sm font-bold text-primary uppercase tracking-wider mb-2">
                      What We Enable
                    </h4>
                    <p className="text-gray-700 text-sm leading-relaxed">
                      {item.enable}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
