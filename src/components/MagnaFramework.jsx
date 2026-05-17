import { motion } from 'framer-motion'
import { useState } from 'react'

const MAGNA_COLORS = {
  M: '#2A1AD8',
  A: '#4E26E2',
  G: '#7231EC',
  N: '#953DF5',
  A2: '#B948FF'
}

const magnaFramework = [
  {
    number: 'M',
    title: 'Mindset Alignment',
    subtitle: 'Transformation, Leadership & Strategic Clarity',
    description: 'Build future-ready organizations by aligning leadership thinking, growth vision, and transformation priorities.',
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
    number: 'A',
    title: 'Architecture of Systems',
    subtitle: 'Digital, AI & Operational Infrastructure',
    description: 'Design intelligent business systems that reduce dependency, improve visibility, and create scalable operational foundations.',
    coreAreas: [
      'Digital & AI Transformation',
      'Advanced Analytics',
      'ERP, SFA, DMS and CRM',
      'Customer Loyalty Management Solutions'
    ],
    enable: 'Embed AI, analytics, and operational intelligence into the organization to create resilient, adaptable, and high-efficiency ecosystems.'
  },
  {
    number: 'G',
    title: 'Growth Engine Design',
    subtitle: 'Commercial Growth & Market Expansion',
    description: 'Engineer scalable growth engines through customer-centric strategies, GTM optimization, and commercial acceleration.',
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
    number: 'N',
    title: 'Numbers & Navigation',
    subtitle: 'Performance Intelligence & Value Optimization',
    description: 'Create financial visibility and performance measurement systems that guide strategic decisions and maximize enterprise value.',
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
    number: 'A',
    title: 'Alignment of Team & Execution',
    subtitle: 'People, Performance & Enterprise Integration',
    description: 'Align teams, structures, and execution systems to ensure sustainable organizational performance.',
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

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
}

export default function MagnaFramework() {
  const [expandedIndex, setExpandedIndex] = useState(null)

  const handleMouseEnter = (index) => {
    setExpandedIndex(index)
  }

  const handleMouseLeave = () => {
    setExpandedIndex(null)
  }

  return (
    <section
      className="relative overflow-hidden overflow-x-hidden py-20 md:py-24 mb-20"
      style={{
        backgroundColor: '#000047',
        width: '100vw',
        marginLeft: 'calc(50% - 50vw)',
        marginRight: 'calc(50% - 50vw)'
      }}
    >
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-20 -left-16 h-64 w-64 rounded-full bg-cyan-400/20 blur-3xl" />
        <div className="absolute top-1/3 -right-16 h-72 w-72 rounded-full bg-indigo-400/20 blur-3xl" />
        <div className="absolute -bottom-20 left-1/3 h-64 w-64 rounded-full bg-fuchsia-400/20 blur-3xl" />
      </div>
      <motion.div
        variants={itemVariants}
      >
      <div className="relative z-10 px-6 max-w-6xl mx-auto">
        <div className="text-center mb-14 md:mb-16">
          <h2 className="text-4xl md:text-5xl font-extrabold mb-4 text-white tracking-tight">MAGNA Framework</h2>
          <p className="text-2xl font-semibold mb-8 text-white/90 max-w-3xl mx-auto">
            A Conscious Growth System for Scaling Consumer Brands
          </p>

        </div>

        <div className="max-w-5xl mx-auto">
          <div className="relative flex flex-col gap-6 md:gap-7">
            <div className="hidden md:block absolute left-[64px] top-10 bottom-10 w-px bg-gradient-to-b from-cyan-300/0 via-cyan-300/60 to-cyan-300/0" />
            {magnaFramework.map((framework, index) => {
              const letter = framework.number;
              const textColor = MAGNA_COLORS[letter];
              const isExpanded = expandedIndex === index;
              return (
                <motion.div
                  key={`${framework.number}-${index}-row`}
                  className="group"
                  variants={itemVariants}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: false, amount: 0.35 }}
                  transition={{ duration: 0.55, delay: index * 0.08, ease: "easeOut" }}
                  onMouseEnter={() => handleMouseEnter(index)}
                  onMouseLeave={handleMouseLeave}
                >
                  <motion.div
                    className={`grid grid-cols-[76px_1fr] md:grid-cols-[128px_1fr] gap-4 md:gap-8 items-center rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm px-3 py-4 md:px-5 md:py-5 shadow-[0_10px_30px_rgba(0,0,0,0.18)]`}
                    whileHover={{ x: 6 }}
                  >
                    <div className="flex justify-center md:justify-center shrink-0">
                      <motion.div
                        className="w-[76px] h-[76px] md:w-[128px] md:h-[128px] rounded-full flex items-center justify-center shadow-lg"
                        style={{
                          backgroundColor: '#FFFFFF',
                          boxShadow: '0 0 0 2px rgba(0, 255, 255, 0.35), 0 0 20px rgba(0, 255, 255, 0.55), 0 10px 24px rgba(0, 0, 0, 0.25)'
                        }}
                        initial={{ scale: 0.9, opacity: 0 }}
                        whileInView={{ scale: 1, opacity: 1 }}
                        viewport={{ once: false, amount: 0.5 }}
                        transition={{ duration: 0.45, delay: index * 0.1 + 0.05, ease: "easeOut" }}
                        whileHover={{ scale: 1.05, rotate: -2 }}
                      >
                        <span
                          className="text-5xl md:text-7xl font-extrabold leading-none tracking-tight"
                          style={{ color: textColor }}
                        >
                          {framework.number}
                        </span>
                      </motion.div>
                    </div>

                    <div className="min-w-0 md:pl-0">
                      <motion.h3
                        className="text-xl lg:text-2xl font-extrabold tracking-tight uppercase mb-2 text-[#E6E9FF] transition-all duration-300 group-hover:text-[#F2F4FF] drop-shadow-[0_0_10px_rgba(0,255,255,0.25)] group-hover:drop-shadow-[0_0_16px_rgba(0,255,255,0.45)]"
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: false, amount: 0.5 }}
                        transition={{ duration: 0.4, delay: index * 0.08 + 0.12, ease: "easeOut" }}
                      >
                        {framework.title}
                      </motion.h3>
                      <motion.p
                        className="text-base md:text-lg lg:text-xl font-semibold text-white/85 mb-1 leading-snug transition-all duration-300 group-hover:text-[#D7FBFF] group-hover:drop-shadow-[0_0_10px_rgba(0,255,255,0.35)]"
                        initial={{ opacity: 0, y: 8 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: false, amount: 0.5 }}
                        transition={{ duration: 0.4, delay: index * 0.08 + 0.18, ease: "easeOut" }}
                      >
                        {framework.subtitle}
                      </motion.p>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={false}
                    animate={{
                      height: isExpanded ? 'auto' : 0,
                      opacity: isExpanded ? 1 : 0
                    }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div className="mt-4 ml-[76px] md:ml-[128px] p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
                      <p className="text-white/90 mb-4 leading-relaxed">{framework.description}</p>

                      <div className="mb-4">
                        <h4 className="text-sm font-bold text-cyan uppercase tracking-wider mb-3">Core Areas</h4>
                        <ul className="space-y-2">
                          {framework.coreAreas.map((area) => (
                            <li key={area} className="flex items-start gap-2 text-white/80">
                              <div className="w-1.5 h-1.5 bg-cyan rounded-full mt-2 flex-shrink-0" />
                              <span>{area}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="bg-white/5 rounded-lg p-3 border border-cyan/20">
                        <h4 className="text-sm font-bold text-cyan uppercase tracking-wider mb-2">What We Enable</h4>
                        <p className="text-white/80 text-sm leading-relaxed">{framework.enable}</p>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Chart Section below A2 */}
        <motion.div
          className="flex justify-center mt-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.6 }}
          transition={{ duration: 0.5, delay: 0.35, ease: "easeOut" }}
        >
          <div className="rounded-2xl border border-cyan-300/30 bg-white/5 backdrop-blur-sm p-6 shadow-[0_12px_34px_rgba(0,0,0,0.25)]">
            <svg viewBox="0 0 320 260" className="w-full h-auto max-w-md" role="img" aria-label="Growth chart animation">
              <line x1="24" y1="22" x2="24" y2="232" stroke="#2A1AD8" strokeWidth="5" strokeLinecap="round" />
              <line x1="24" y1="232" x2="300" y2="232" stroke="#2A1AD8" strokeWidth="5" strokeLinecap="round" />

              {[52, 88, 126, 165, 206].map((x, idx) => (
                <motion.rect
                  key={`a2-bar-${x}`}
                  x={x}
                  y={216 - (idx + 1) * 30}
                  width="34"
                  height={(idx + 1) * 30}
                  rx="3"
                  fill="#B948FF"
                  initial={{ scaleY: 0 }}
                  whileInView={{ scaleY: 1 }}
                  viewport={{ once: false, amount: 0.7 }}
                  style={{ originY: 1 }}
                  transition={{ duration: 0.35, delay: 0.15 + idx * 0.1, ease: "easeOut" }}
                />
              ))}

              <motion.line
                x1="46"
                y1="198"
                x2="270"
                y2="44"
                stroke="#00ffff"
                strokeWidth="9"
                strokeLinecap="round"
                initial={{ pathLength: 0, opacity: 0 }}
                whileInView={{ pathLength: 1, opacity: 1 }}
                viewport={{ once: false, amount: 0.7 }}
                transition={{ duration: 0.65, delay: 0.75, ease: "easeOut" }}
              />
              <motion.polygon
                points="270,44 250,44 270,26 286,44"
                fill="#00ffff"
                initial={{ opacity: 0, scale: 0.7 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: false, amount: 0.7 }}
                transition={{ duration: 0.25, delay: 1.4, ease: "easeOut" }}
              />
            </svg>
          </div>
        </motion.div>
      </div>
      </motion.div>
    </section>
  )
}
