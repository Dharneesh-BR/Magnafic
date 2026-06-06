import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Brain, Check, ClipboardCheck, Clock, Crown, Factory, GraduationCap, Lightbulb, RefreshCw, TrendingUp, Users, X, Zap } from 'lucide-react';

function ProgramsImage() {
  return (
    <>
      <div className="lg:hidden">
        <div className="relative overflow-hidden rounded-2xl">
          <img src="/Program.png" alt="Business Magna Program" className="h-60 w-full object-contain" />
        </div>
      </div>

      <div className="hidden lg:block">
        <div className="relative overflow-hidden rounded-3xl">
          <img src="/Programs.png" alt="Business Magna Program" className="h-auto w-full object-contain" />
        </div>
      </div>
    </>
  );
}

const MAGNA_COLORS = {
  M: '#2A1AD8',
  A: '#4E26E2',
  G: '#7231EC',
  N: '#953DF5',
  A2: '#B948FF'
};

const Programs = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Scroll to top when page loads
    window.scrollTo(0, 0);
  }, []);
  
  const [ref] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });


  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 },
  };

  const magnaFramework = [
    {
      number: "M",
      letter: "M",
      title: "Mindset Alignment",
      subtitle: "Before strategy, fix the lens of thinking.",
      description: "Shift from operator to builder to leader. Remove scarcity-based decision making. Align founder identity with long-term vision. Build belief systems for scale, not survival.",
      items: [
        "Shift from operator to builder to leader",
        "Remove scarcity-based decision making",
        "Align founder identity with long-term vision",
        "Build belief systems for scale, not survival"
      ],
      keyQuestion: " Am I building from pressure or from purpose?",
      bgGradient: "from-blue-900/80 to-purple-900/80"
    },
    {
      number: "A",
      letter: "A",
      title: "Architecture of Systems",
      subtitle: "Business stops depending on you when systems start thinking.",
      description: "Create SOPs for every repeatable process. Map sales, marketing, and delivery clearly. Build hiring systems over hero employees. Create dashboards for visibility where numbers trump assumptions.",
      items: [
        "SOPs for every repeatable process",
        "Sales, marketing, delivery mapped clearly",
        "Hiring system > hero employees",
        "Dashboards for visibility (numbers > assumptions)"
      ],
      keyQuestion: " If I disappear for 30 days, what breaks first?",
      bgGradient: "from-blue-900/80 to-purple-900/80"
    },
    {
      number: "G",
      letter: "G",
      title: "Growth Engine Design",
      subtitle: "Growth is engineered, not hoped for.",
      description: "Build predictable lead generation systems. Optimize conversion funnels. Expand customer lifetime value. Create referral and retention loops.",
      items: [
        "Predictable lead generation system",
        "Conversion optimization funnels",
        "Customer lifetime value expansion",
        "Referral + retention loops"
      ],
      keyQuestion: " Where exactly is my growth leaking?",
      bgGradient: "from-blue-900/80 to-purple-900/80"
    },
    {
      number: "N",
      letter: "N",
      title: "Numbers & Navigation",
      subtitle: "What gets measured gets multiplied.",
      description: "Track daily/weekly KPIs. Maintain cashflow visibility beyond just revenue. Gain unit economics clarity. Create founder dashboard for informed decisions.",
      items: [
        "Daily/weekly KPI tracking",
        "Cashflow visibility (not just revenue)",
        "Unit economics clarity",
        "Founder dashboard for decisions"
      ],
      keyQuestion: " Am I running my business or guessing it?",
      bgGradient: "from-blue-900/80 to-purple-900/80"
    },
    {
      number: "A",
      letter: "A2",
      title: "Alignment of Team & Execution",
      subtitle: "Sustainable growth needs team alignment and peak performance.",
      description: "Focus on energy management over time management. Align health, clarity, and decision quality. Create team alignment with vision and values. Reduce chaos-driven execution.",
      items: [
        "Energy management > time management",
        "Health, clarity, decision quality alignment",
        "Team alignment with vision & values",
        "Reduce chaos-driven execution"
      ],
      keyQuestion: " Is my business growing faster than my capacity to sustain it?",
      bgGradient: "from-blue-900/80 to-purple-900/80"
    }
  ];

  return (
    <div className="min-h-screen bg-[#fbfaf9]">
<section className="pt-24 pb-12 px-6" ref={ref}>
        <div className="container mx-auto max-w-6xl">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Header */}
            <motion.div 
              className="mb-6"
              variants={itemVariants}
            >
              <div className="text-center mb-4 pt-8">
                <div className="relative inline-block align-baseline">
                  <div className="absolute -inset-x-6 -inset-y-3 bg-gradient-to-r from-[#3533cd]/10 to-[#00ffff]/10 blur-2xl" />
                  <h1 className="relative text-3xl md:text-4xl lg:text-5xl font-extrabold mb-4 tracking-normal bg-gradient-to-r from-[#000080] via-[#1e3a8a] to-[#1e40af] bg-clip-text text-transparent leading-normal pb-2">
                    MAGNA BUSINESS  <br/><span className='text-xl md:text-2xl lg:text-3xl'>Masterclass</span>
                  </h1>
                  <div className="relative mx-auto h-1.5 w-32 md:w-40 lg:w-48 rounded-full bg-gradient-to-r from-[#3533cd] to-[#00ffff]" />
                  <p className="text-gray-600 text-xl md:text-2xl mt-6 mb-6 font-medium">
                    2 Day Live Intensive Workshop for MSME Consumer Brands
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Content Section with 2 Grids */}
            <div className="grid grid-cols-1 lg:grid-cols-[70%_30%] gap-6 lg:gap-8 items-start">
              {/* Left Grid - Content */}
              <div className="self-start rounded-lg shadow-md pt-4 px-4 pb-4 lg:-ml-3" style={{ background: 'linear-gradient(135deg, #3533cd 0%, #00ffff 100%)',}}>
                <h2 className="text-lg md:text-xl font-bold text-white mb-2">
                  Build a Business that scales without burning you out
                </h2>
                
                <div className="space-y-1 mb-2">
                  <div className="bg-red-50 rounded-lg p-3 mb-2">
                    <p className="text-base text-gray-700 font-bold text-left pb-1">Are you still:</p>
                    <ul className="space-y-2 text-base text-gray-700">
                      <li className="flex items-start gap-3">
                        <span className="mt-1 inline-flex rounded-full bg-red-600/10 px-1.5 py-1.5 items-center justify-center text-red-600 flex-shrink-0">
                          <X className="h-3 w-3" />
                        </span>
                        <span>Handling sales, operations, and decisions yourself?</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="mt-1 inline-flex rounded-full bg-red-600/10 px-1.5 py-1.5 items-center justify-center text-red-600 flex-shrink-0">
                          <X className="h-3 w-3" />
                        </span>
                        <span>Growing-but feeling stuck, stressed, or unclear?</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="mt-1 inline-flex rounded-full bg-red-600/10 px-1.5 py-1.5 items-center justify-center text-red-600 flex-shrink-0">
                          <X className="h-3 w-3" />
                        </span>
                        <span>Working harder every year but not building real freedom?</span>
                      </li>
                    </ul>
                  </div>
                </div>
                
                                
                <div className="space-y-1">
                  <h3 className="text-lg md:text-xl font-bold text-white mb-2">
                    A high impact business transformation program designed for MSME founders to:
                  </h3>
                  <div className="bg-green-50 rounded-md p-3">
                    <ul className="space-y-2 text-base text-gray-700">
                      <li className="flex items-start gap-3">
                        <span className="mt-1 inline-flex rounded-full bg-emerald-500/10 px-1.5 py-1.5 items-center justify-center text-emerald-600 flex-shrink-0">
                          <Check className="h-3 w-3" />
                        </span>
                        <span>Build system-driven businesses</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="mt-1 inline-flex rounded-full bg-emerald-500/10 px-1.5 py-1.5 items-center justify-center text-emerald-600 flex-shrink-0">
                          <Check className="h-3 w-3" />
                        </span>
                        <span>Create predictable growth engines</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="mt-1 inline-flex rounded-full bg-emerald-500/10 px-1.5 py-1.5 items-center justify-center text-emerald-600 flex-shrink-0">
                          <Check className="h-3 w-3" />
                        </span>
                        <span>Gain clarity, control, and sustainability</span>
                      </li>
                    </ul>
                  </div>
                </div>
                
                <div className="mt-2">
                  <p className="text-lg font-semibold text-white">
                    Unlike traditional programs, this is not about motivation or theory.
                  </p>
                  <p className="text-lg font-semibold text-white">
                    This is about restructuring how your business actually runs.
                  </p>
                </div>
              </div>
              
              {/* Right Grid - Image */}
              <div className="lg:ml-3 mt-2 lg:mt-0">
                <ProgramsImage />
              </div>
            </div>

            <section
              className="relative overflow-hidden py-20 md:py-24 mb-20"
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
                      const letter = framework.letter;
                      const textColor = MAGNA_COLORS[letter];
                      return (
                        <motion.div
                          key={`${framework.number}-${index}-row`}
                          className={`group grid grid-cols-[76px_1fr] md:grid-cols-[128px_1fr] ${index === magnaFramework.length - 1 ? 'xl:grid-cols-[128px_1fr_280px]' : ''} gap-4 md:gap-8 items-center rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm px-3 py-4 md:px-5 md:py-5 shadow-[0_10px_30px_rgba(0,0,0,0.18)]`}
                          variants={itemVariants}
                          initial={{ opacity: 0, y: 24 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: false, amount: 0.35 }}
                          transition={{ duration: 0.55, delay: index * 0.08, ease: "easeOut" }}
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

            {/* WHAT YOU WILL ACHIEVE Section */}
            <motion.div 
              className="mb-20 py-2 md:py-4 relative overflow-hidden"
              variants={itemVariants}
              style={{
                width: '100vw',
                marginLeft: 'calc(50% - 50vw)',
                marginRight: 'calc(50% - 50vw)'
              }}
            >
              
              <div className="relative z-10 max-w-6xl mx-auto px-6">
                <motion.div 
                  className="text-center mb-8"
                  initial={{ opacity: 0, y: -20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: false, amount: 0.3 }}
                  transition={{ duration: 0.6 }}
                >
                  <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">WHAT YOU WILL ACHIEVE</h2>
                  <div className="w-24 h-1 bg-white mx-auto rounded-full"></div>
                </motion.div>

                {/* Achievement List */}
                <div className="max-w-4xl mx-auto mb-6 space-y-6">
                  {[
                    {
                      title: "Move From Chaos to Clarity",
                      description: "Stop reacting daily. Start operating with structure.",
                      color: MAGNA_COLORS.M
                    },
                    {
                      title: "Build Systems That Replace You",
                      description: "Create SOPs, workflows, and AI-powered systems that reduce dependency.",
                      color: MAGNA_COLORS.A
                    },
                    {
                      title: "Design Predictable Growth Engines", 
                      description: "No more guesswork-build repeatable marketing and sales systems.",
                      color: MAGNA_COLORS.G
                    },
                    {
                      title: "Gain Complete Financial Visibility",
                      description: "Understand your numbers, cash flow, and profitability clearly.",
                      color: MAGNA_COLORS.N
                    },
                    {
                      title: "Scale Without Burnout",
                      description: "Align your energy, team, and execution for long-term sustainability.",
                      color: MAGNA_COLORS.A2
                    }
                  ].map((achievement, index) => (
                    <motion.div
                      key={index}
                      className="relative"
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: false, amount: 0.3 }}
                      transition={{ duration: 0.6, delay: index * 0.15 }}
                    >
                      <div 
                        className="rounded-2xl p-6 shadow-[0_20px_40px_rgba(0,0,0,0.15)] border border-white/20"
                        style={{
                          background: `linear-gradient(135deg, ${achievement.color}20 0%, ${achievement.color}40 100%)`
                        }}
                      >
                        <div className="flex items-start gap-4">
                          {/* Numbered Circle */}
                          <div 
                            className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg"
                            style={{ backgroundColor: achievement.color }}
                          >
                            <span className="text-white text-lg font-bold">{index + 1}</span>
                          </div>
                          
                          {/* Content */}
                          <div className="flex-1">
                            <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2 leading-tight">
                              {achievement.title}
                            </h3>
                            
                            <p className="text-gray-700 leading-relaxed">
                              {achievement.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                
              </div>
            </motion.div>

            {/* WHAT MAKES MAGNA DIFFERENT Section */}
            <section
              className="py-16 md:py-20 mb-20"
              style={{
                backgroundColor: '#000047',
                width: '100vw',
                marginLeft: 'calc(50% - 50vw)',
                marginRight: 'calc(50% - 50vw)'
              }}
            >
              <div className="px-6">
                <motion.div 
                  variants={itemVariants}
                  className="max-w-6xl mx-auto"
                >
                  <div className="text-center mb-12">
                    <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-4">WHAT MAKES MAGNA DIFFERENT</h2>
                  </div>

                  <div className="max-w-6xl mx-auto">
                    <div className="grid md:grid-cols-4 gap-6">
                      {/* Point 1 */}
                      <motion.div 
                        className="p-6 shadow-lg border border-white/20 relative overflow-hidden rounded-2xl"
                        style={{
                          background: 'linear-gradient(135deg, #3533cd 0%, #00ffff 100%)',
                          boxShadow: '0 0 20px rgba(0, 255, 255, 0.15), 0 10px 30px rgba(53, 51, 205, 0.1)'
                        }}
                        whileHover={{ 
                          scale: 1.05,
                          boxShadow: '0 0 30px rgba(0, 255, 255, 0.25), 0 20px 40px rgba(53, 51, 205, 0.15), 0 0 0 1px rgba(0, 255, 255, 0.3)',
                          y: -8
                        }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="flex flex-col items-center text-center">
                          <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0 mb-4 border border-white/30">
                            <RefreshCw className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-white mb-2">Not Just Training - Transformation</h3>
                            <p className="text-sm text-white/90">We don't just teach. We redesign how your business operates.</p>
                          </div>
                        </div>
                      </motion.div>

                      {/* Point 2 */}
                      <motion.div 
                        className="p-6 shadow-lg border border-white/20 relative overflow-hidden rounded-2xl"
                        style={{
                          background: 'linear-gradient(135deg, #3533cd 0%, #00ffff 100%)',
                          boxShadow: '0 0 20px rgba(0, 255, 255, 0.15), 0 10px 30px rgba(53, 51, 205, 0.1)'
                        }}
                        whileHover={{ 
                          scale: 1.05,
                          boxShadow: '0 0 30px rgba(0, 255, 255, 0.25), 0 20px 40px rgba(53, 51, 205, 0.15), 0 0 0 1px rgba(0, 255, 255, 0.3)',
                          y: -8
                        }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="flex flex-col items-center text-center">
                          <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0 mb-4 border border-white/30">
                            <Factory className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-white mb-2">Built for MSME Reality</h3>
                            <p className="text-sm text-white/90">No startup theory. Everything is designed for real Indian businesses.</p>
                          </div>
                        </div>
                      </motion.div>

                      {/* Point 3 */}
                      <motion.div 
                        className="p-6 shadow-lg border border-white/20 relative overflow-hidden rounded-2xl"
                        style={{
                          background: 'linear-gradient(135deg, #3533cd 0%, #00ffff 100%)',
                          boxShadow: '0 0 20px rgba(0, 255, 255, 0.15), 0 10px 30px rgba(53, 51, 205, 0.1)'
                        }}
                        whileHover={{ 
                          scale: 1.05,
                          boxShadow: '0 0 30px rgba(0, 255, 255, 0.25), 0 20px 40px rgba(53, 51, 205, 0.15), 0 0 0 1px rgba(0, 255, 255, 0.3)',
                          y: -8
                        }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="flex flex-col items-center text-center">
                          <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0 mb-4 border border-white/30">
                            <Zap className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-white mb-2">AI + Business Systems Integration</h3>
                            <p className="text-sm text-white/90">We combine:<br/>- AI tools<br/>- Business frameworks<br/>- Execution systems</p>
                          </div>
                        </div>
                      </motion.div>

                      {/* Point 4 */}
                      <motion.div 
                        className="p-6 shadow-lg border border-white/20 relative overflow-hidden rounded-2xl"
                        style={{
                          background: 'linear-gradient(135deg, #3533cd 0%, #00ffff 100%)',
                          boxShadow: '0 0 20px rgba(0, 255, 255, 0.15), 0 10px 30px rgba(53, 51, 205, 0.1)'
                        }}
                        whileHover={{ 
                          scale: 1.05,
                          boxShadow: '0 0 30px rgba(0, 255, 255, 0.25), 0 20px 40px rgba(53, 51, 205, 0.15), 0 0 0 1px rgba(0, 255, 255, 0.3)',
                          y: -8
                        }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="flex flex-col items-center text-center">
                          <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0 mb-4 border border-white/30">
                            <Users className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-white mb-2">Founder + Business Growth Together</h3>
                            <p className="text-sm text-white/90">Because scaling a business without evolving the founder leads to burnout.</p>
                          </div>
                        </div>
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </section>

            {/* WHO IS THIS FOR / NOT FOR Section */}
            <section
              
              
            >
              <div className="px-6">
                <motion.div variants={itemVariants} className="max-w-6xl mx-auto">
                  <div className="text-center mb-12">
                    <h2 className="text-4xl md:text-5xl font-extrabold mb-4 text-gray-900 tracking-tight">
                      Who is this for?
                    </h2>
                    <p className="text-2xl font-semibold mb-8 text-gray-700 max-w-3xl mx-auto">
                      Use this quick check to see if you're a fit for the Business MAGNA Program.
                    </p>
                  </div>

                  <div className="grid lg:grid-cols-2 gap-8">
                  {/* FOR */}
                  <motion.div
                    className="bg-gradient-to-br from-white to-[#f0f9ff] rounded-2xl shadow-xl border border-cyan-200/50 overflow-hidden"
                    style={{
                      boxShadow: '0 0 25px rgba(0, 255, 255, 0.2), 0 15px 35px rgba(53, 51, 205, 0.15)'
                    }}
                    variants={itemVariants}
                    whileHover={{ 
                      y: -4,
                      boxShadow: '0 0 35px rgba(0, 255, 255, 0.3), 0 25px 45px rgba(53, 51, 205, 0.2), 0 0 0 1px rgba(0, 255, 255, 0.4)'
                    }}
                  >
                    <div className="p-6 md:p-8 border-b border-gray-200">
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
                        <div>
                          <p className="text-base sm:text-sm font-semibold text-[#3533cd]">WHO THIS IS FOR</p>
                          <h3 className="text-2xl font-extrabold text-[#000047] mt-1">This program is designed for:</h3>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-[#3533cd] to-[#00ffff] flex items-center justify-center text-white shadow-sm flex-shrink-0">
                          <Check className="h-5 w-5" />
                        </div>
                      </div>
                    </div>

                    <div className="p-6 md:p-8">
                      <ul className="space-y-4 text-lg text-gray-800">
                        <li className="flex items-start gap-4">
                          <span className="mt-1 w-8 h-8 rounded-xl bg-[#3533cd]/10 flex items-center justify-center text-[#3533cd] flex-shrink-0">
                            <Check className="h-4 w-4" />
                          </span>
                          <span>MSME founders stuck in daily operations</span>
                        </li>
                        <li className="flex items-start gap-4">
                          <span className="mt-1 w-8 h-8 rounded-xl bg-[#3533cd]/10 flex items-center justify-center text-[#3533cd] flex-shrink-0">
                            <Check className="h-4 w-4" />
                          </span>
                          <span>Business owners with Rs.20L-Rs.5Cr+ revenue looking to scale</span>
                        </li>
                        <li className="flex items-start gap-4">
                          <span className="mt-1 w-8 h-8 rounded-xl bg-[#3533cd]/10 flex items-center justify-center text-[#3533cd] flex-shrink-0">
                            <Check className="h-4 w-4" />
                          </span>
                          <span>Entrepreneurs who want systems, not just ideas</span>
                        </li>
                        <li className="flex items-start gap-4">
                          <span className="mt-1 w-8 h-8 rounded-xl bg-[#3533cd]/10 flex items-center justify-center text-[#3533cd] flex-shrink-0">
                            <Check className="h-4 w-4" />
                          </span>
                          <span>Founders ready to move from operator to architect to leader</span>
                        </li>
                      </ul>
                    </div>
                  </motion.div>

                  {/* NOT FOR */}
                  <motion.div
                    className="bg-gradient-to-br from-white to-[#f0f9ff] rounded-2xl shadow-xl border border-cyan-200/50 overflow-hidden"
                    style={{
                      boxShadow: '0 0 25px rgba(0, 255, 255, 0.2), 0 15px 35px rgba(53, 51, 205, 0.15)'
                    }}
                    variants={itemVariants}
                    whileHover={{ 
                      y: -4,
                      boxShadow: '0 0 35px rgba(0, 255, 255, 0.3), 0 25px 45px rgba(53, 51, 205, 0.2), 0 0 0 1px rgba(0, 255, 255, 0.4)'
                    }}
                  >
                    <div className="p-6 md:p-8 border-b border-red-200">
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
                        <div>
                          <p className="text-base sm:text-sm font-semibold text-red-600">WHO THIS IS NOT FOR</p>
                          <h3 className="text-2xl font-extrabold text-[#000047] mt-1">This will not be a fit if:</h3>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-red-600 flex items-center justify-center text-white shadow-sm flex-shrink-0">
                          <X className="h-5 w-5" />
                        </div>
                      </div>
                    </div>

                    <div className="p-6 md:p-8">
                      <ul className="space-y-4 text-lg text-gray-800 mb-8">
                        <li className="flex items-start gap-4">
                          <span className="mt-1 w-8 h-8 rounded-xl bg-red-600/10 flex items-center justify-center text-red-600 flex-shrink-0">
                            <X className="h-4 w-4" />
                          </span>
                          <span>People looking for quick hacks or shortcuts</span>
                        </li>
                        <li className="flex items-start gap-4">
                          <span className="mt-1 w-8 h-8 rounded-xl bg-red-600/10 flex items-center justify-center text-red-600 flex-shrink-0">
                            <X className="h-4 w-4" />
                          </span>
                          <span>Founders unwilling to implement</span>
                        </li>
                        <li className="flex items-start gap-4">
                          <span className="mt-1 w-8 h-8 rounded-xl bg-red-600/10 flex items-center justify-center text-red-600 flex-shrink-0">
                            <X className="h-4 w-4" />
                          </span>
                          <span>Those expecting "motivation-only" programs</span>
                        </li>
                      </ul>

                      
                    </div>
                  </motion.div>
                  </div>
                </motion.div>
                <p className="text-2xl font-semibold mb-8 text-gray-700 max-w-3xl mx-auto text-center pt-8 ">
                          This is for builders who want real transformation.
                        </p>
              </div>
            </section>

            

            {/* 2-DAY MAGNA BUSINESS PROGRAM Section */}
            <motion.div 
              className="relative mb-20 overflow-hidden py-24 md:py-32"
              variants={itemVariants}
              style={{
                backgroundColor: '#000047',
                width: '100vw',
                marginLeft: 'calc(50% - 50vw)',
                marginRight: 'calc(50% - 50vw)'
              }}
            >
              <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(135deg,rgba(0,255,255,0.12)_0%,rgba(255,255,255,0)_36%,rgba(185,72,255,0.14)_100%)]" />

              <div className="relative z-10 mx-auto mb-12 max-w-4xl px-6 text-center">
                
                <h2 className="text-4xl md:text-5xl font-extrabold leading-tight text-white">Join the MAGNA Business Program</h2>
                <p className="mx-auto mt-5 max-w-3xl text-lg md:text-xl leading-relaxed text-white/75">
                  Two focused days to move from founder-led chaos to a system-driven business with clearer growth, control, and execution.
                </p>
              </div>

              <div className="relative z-10 max-w-6xl mx-auto px-6">
                <div className="grid gap-8 lg:grid-cols-2">
                  {/* DAY 1 */}
                  <motion.div 
                    className="group relative overflow-hidden rounded-3xl border border-white/30 shadow-[0_24px_70px_rgba(0,0,0,0.28)]"
                    style={{
                      background: 'linear-gradient(135deg, #3533cd 0%, #00ffff 100%)',
                      boxShadow: '0 0 25px rgba(0, 255, 255, 0.2), 0 15px 35px rgba(53, 51, 205, 0.15)'
                    }}
                    variants={itemVariants}
                    whileHover={{ 
                      y: -5,
                      boxShadow: '0 0 35px rgba(0, 255, 255, 0.3), 0 25px 45px rgba(53, 51, 205, 0.2), 0 0 0 1px rgba(0, 255, 255, 0.4)'
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="h-1.5 w-full bg-gradient-to-r from-[#3533cd] via-[#7231EC] to-[#00ffff]" />
                    <div 
                      className="p-6 md:p-8"
                    >
                      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between items-center sm:items-start">
                        
                        <div className="flex h-16 w-20 shrink-0 items-center justify-center rounded-2xl bg-white text-lg font-extrabold text-[#3533cd] shadow-[0_0_24px_rgba(0,255,255,0.35)]">
                          Day 1
                        </div>
                        <div className="text-center sm:text-left">
                          <h3 className="text-2xl md:text-3xl font-extrabold leading-tight text-white">FOUNDATION & SYSTEMS</h3>
                          
                        </div>
                      </div>
                    </div>
                    
                    <div className="px-6 pb-6 md:px-8 md:pb-8 space-y-5">
                      {/* Session 1 */}
                      <div className="rounded-2xl border border-white/10 bg-white p-5 shadow-lg">
                        <h5 className="mb-3 text-left text-lg font-extrabold text-gray-950">Session 1: M - Mindset </h5>
                                           
                      <div className="mb-3">
                            <ul className="space-y-3 text-sm leading-relaxed text-gray-700">
                            <li className="flex items-start gap-2">
                              <span className="mt-1 font-bold text-[#3533cd]">-</span>
                              <span>The 3 identity shifts required to scale beyond Rs.1Cr to Rs.100 Cr+</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="mt-1 font-bold text-[#3533cd]">-</span>
                              <span>Why "hard work" is killing growth (and what replaces it)</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="mt-1 font-bold text-[#3533cd]">-</span>
                              <span>Breaking "founder dependency loop"</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="mt-1 font-bold text-[#3533cd]">-</span>
                              <span>Moving from firefighting to foresight-driven leadership</span>
                            </li>
                          </ul>
                        </div>
                        
                                              </div>
                      
                      
                      
                      {/* Session 2 */}
                      <div className="rounded-2xl border border-white/10 bg-white p-5 shadow-lg">
                        <h5 className="mb-3 text-left text-lg font-extrabold text-gray-950">Session 2: A - Architecture </h5>
                                              
                      <div className="mb-3">
                            <ul className="space-y-3 text-sm leading-relaxed text-gray-700">
                            <li className="flex items-start gap-2">
                              <span className="mt-1 font-bold text-[#4E26E2]">-</span>
                              <span>How to remove "people dependency"</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="mt-1 font-bold text-[#4E26E2]">-</span>
                              <span>Designing SOPs that actually get followed</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="mt-1 font-bold text-[#4E26E2]">-</span>
                              <span>Tools & workflows to reduce manual effort by 30-50%</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="mt-1 font-bold text-[#4E26E2]">-</span>
                              <span>Automating marketing, sales follow-ups, and operation</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="mt-1 font-bold text-[#4E26E2]">-</span>
                              <span>Where AI actually fits in MSME businesses </span>
                            </li>
                          </ul>
                        </div>
                        
                                                
                                              </div>
                      
                      
                      {/* Session 3 */}
                      <div className="rounded-2xl border border-white/10 bg-white p-5 shadow-lg">
                        <h5 className="mb-3 text-left text-lg font-extrabold text-gray-950">Session 3: G - Growth </h5>
                        
                        
                        <div className="mb-3">
                        
                          <ul className="space-y-3 text-sm leading-relaxed text-gray-700">
                            <li className="flex items-start gap-2">
                              <span className="mt-1 font-bold text-[#7231EC]">-</span>
                              <span>How to create predictable monthly revenue</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="mt-1 font-bold text-[#7231EC]">-</span>
                              <span>Fixing inconsistent sales pipelines</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="mt-1 font-bold text-[#7231EC]">-</span>
                              <span>Positioning & messaging for premium growth</span>
                            </li>
                            
                          </ul>
                        </div>
                        
                                              </div>
                      
                                          </div>
                  </motion.div>

                  {/* DAY 2 */}
                  <motion.div 
                    className="group relative overflow-hidden rounded-3xl border border-white/30 shadow-[0_24px_70px_rgba(0,0,0,0.28)]"
                    style={{
                      background: 'linear-gradient(135deg, #3533cd 0%, #00ffff 100%)',
                      boxShadow: '0 0 25px rgba(0, 255, 255, 0.2), 0 15px 35px rgba(53, 51, 205, 0.15)'
                    }}
                    variants={itemVariants}
                    whileHover={{ 
                      y: -5,
                      boxShadow: '0 0 35px rgba(0, 255, 255, 0.3), 0 25px 45px rgba(53, 51, 205, 0.2), 0 0 0 1px rgba(0, 255, 255, 0.4)'
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="h-1.5 w-full bg-gradient-to-r from-[#953DF5] via-[#B948FF] to-[#00ffff]" />
                    <div 
                      className="p-6 md:p-8"
                    >
                      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between items-center sm:items-start">
                        
                        <div className="flex h-16 w-20 shrink-0 items-center justify-center rounded-2xl bg-white text-lg font-extrabold text-[#953DF5] shadow-[0_0_24px_rgba(185,72,255,0.35)]">
                          Day 2
                        </div>
                        <div className="text-center sm:text-left">
                          <h3 className="text-2xl md:text-3xl font-extrabold leading-tight text-white">SCALE & SUSTAINABILITY</h3>
                          
                        </div>
                      </div>
                    </div>
                    
                    <div className="px-6 pb-6 md:px-8 md:pb-8 space-y-5">
                      {/* Session 4 */}
                      <div className="rounded-2xl border border-white/10 bg-white p-5 shadow-lg">
                        <h5 className="mb-3 text-left text-lg font-extrabold text-gray-950">Session 4: N - Numbers </h5>
                        
                        
                        
                        <div className="mb-3">
                          
                          <ul className="space-y-3 text-sm leading-relaxed text-gray-700">
                            <li className="flex items-start gap-2">
                              <span className="mt-1 font-bold text-[#953DF5]">-</span>
                              <span>The only KPIs that actually matter for founders</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="mt-1 font-bold text-[#953DF5]">-</span>
                              <span>Understanding CAC, LTV, conversion ratios, and margins</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="mt-1 font-bold text-[#953DF5]">-</span>
                              <span>How to stop "profit leaks" in your business</span>
                            </li>
                            
                          </ul>
                        </div>
                        
                                                
                                              </div>
                      
                      
                      {/* Session 5 */}
                      <div className="rounded-2xl border border-white/10 bg-white p-5 shadow-lg">
                        <h5 className="mb-3 text-left text-lg font-extrabold text-gray-950">Session 5:A - Alignment  </h5>
                        
                        
                        
                        <div className="mb-3">
                          
                          <ul className="space-y-3 text-sm leading-relaxed text-gray-700">
                            <li className="flex items-start gap-2">
                              <span className="mt-1 font-bold text-[#B948FF]">-</span>
                              <span>Aligning team, systems, and founder energy</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="mt-1 font-bold text-[#B948FF]">-</span>
                              <span>Hiring for scale vs hiring for survival</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="mt-1 font-bold text-[#B948FF]">-</span>
                              <span>Time, energy & focus management for founders</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="mt-1 font-bold text-[#B948FF]">-</span>
                              <span>Creating a culture of ownership, not dependency</span>
                            </li>
                          </ul>
                        </div>
                        
                                              </div>
                      
                      
                      {/* Session 6 */}
                      <div className="rounded-2xl border border-cyan-200/70 bg-gradient-to-br from-white to-cyan-50 p-5 shadow-lg">
                        <h5 className="mb-3 text-left text-lg font-extrabold text-gray-950">Session 6: Q & A Session </h5>
                        
                        
                        
                        <div className="mb-3">
                          
                          <ul className="space-y-3 text-sm leading-relaxed text-gray-700">
                            <li className="flex items-start gap-2">
                              <span className="mt-1 font-bold text-cyan-600">-</span>
                              <span>Addressing specific challenges and questions from participants</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="mt-1 font-bold text-cyan-600">-</span>
                              <span>Final insights and next steps for implementation</span>
                            </li>
                          </ul>
                        </div>
                        
                                              </div>
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>

            {/* BEFORE vs AFTER MAGNA Section */}
            <motion.div 
              className="mb-20"
              variants={itemVariants}
            >
              <div className="text-center mb-12">
                
                <h2 className="text-4xl md:text-5xl font-extrabold text-heading tracking-tight">
                  BEFORE vs AFTER MAGNA
                </h2>
              </div>

              <div className="max-w-5xl mx-auto">
                <div className="grid md:grid-cols-2 gap-8">
                  {/* Before Column */}
                  <motion.div 
                    className="relative bg-gradient-to-br from-white to-[#fff1f2] rounded-2xl shadow-xl border border-red-200 overflow-hidden"
                    variants={itemVariants}
                    whileHover={{ y: -4 }}
                  >
                    <div className="h-1.5 w-full bg-gradient-to-r from-red-500 to-rose-400" />
                    <div className="p-6 md:p-8 border-b border-red-200">
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
                        <div>
                          <p className="text-lg sm:text-base font-semibold text-red-600">Before</p>
                          <h3 className="text-xl sm:text-2xl font-extrabold text-[#000047] mt-1">Where most founders start</h3>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-red-600 flex items-center justify-center text-white shadow-sm flex-shrink-0">
                          <AlertTriangle className="h-5 w-5" />
                        </div>
                      </div>
                    </div>
                    <div className="p-6 md:p-8">
                      <ul className="space-y-4 text-lg text-gray-800">
                        <li className="flex items-start gap-4">
                          <span className="mt-1 w-8 h-8 rounded-xl bg-red-600/10 flex items-center justify-center text-red-600 flex-shrink-0">
                            <X className="h-4 w-4" />
                          </span>
                          <span>Constant firefighting</span>
                        </li>
                        <li className="flex items-start gap-4">
                          <span className="mt-1 w-8 h-8 rounded-xl bg-red-600/10 flex items-center justify-center text-red-600 flex-shrink-0">
                            <X className="h-4 w-4" />
                          </span>
                          <span>No time to think</span>
                        </li>
                        <li className="flex items-start gap-4">
                          <span className="mt-1 w-8 h-8 rounded-xl bg-red-600/10 flex items-center justify-center text-red-600 flex-shrink-0">
                            <X className="h-4 w-4" />
                          </span>
                          <span>Revenue is inconsistent</span>
                        </li>
                        <li className="flex items-start gap-4">
                          <span className="mt-1 w-8 h-8 rounded-xl bg-red-600/10 flex items-center justify-center text-red-600 flex-shrink-0">
                            <X className="h-4 w-4" />
                          </span>
                          <span>Business depends on you</span>
                        </li>
                      </ul>
                    </div>
                  </motion.div>

                  {/* After Column */}
                  <motion.div 
                    className="relative bg-gradient-to-br from-white to-[#ecfeff] rounded-2xl shadow-xl border border-emerald-200 overflow-hidden"
                    variants={itemVariants}
                    whileHover={{ y: -4 }}
                  >
                    <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 to-cyan-400" />
                    <div className="p-6 md:p-8 border-b border-emerald-200">
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
                        <div>
                          <p className="text-lg sm:text-base font-semibold text-emerald-600">After</p>
                          <h3 className="text-xl sm:text-2xl font-extrabold text-[#000047] mt-1">What MAGNA unlocks</h3>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-400 flex items-center justify-center text-white shadow-sm flex-shrink-0">
                          <Check className="h-5 w-5" />
                        </div>
                      </div>
                    </div>
                    <div className="p-6 md:p-8">
                      <ul className="space-y-4 text-lg text-gray-800">
                        <li className="flex items-start gap-4">
                          <span className="mt-1 w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 flex-shrink-0">
                            <Check className="h-4 w-4" />
                          </span>
                          <span>Structured systems in place</span>
                        </li>
                        <li className="flex items-start gap-4">
                          <span className="mt-1 w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 flex-shrink-0">
                            <Check className="h-4 w-4" />
                          </span>
                          <span>Team operates independently</span>
                        </li>
                        <li className="flex items-start gap-4">
                          <span className="mt-1 w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 flex-shrink-0">
                            <Check className="h-4 w-4" />
                          </span>
                          <span>Growth becomes predictable</span>
                        </li>
                        <li className="flex items-start gap-4">
                          <span className="mt-1 w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 flex-shrink-0">
                            <Check className="h-4 w-4" />
                          </span>
                          <span>You lead instead of execute</span>
                        </li>
                      </ul>
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>

            {/* WHAT MAKES THIS PROGRAM A MUST-ATTEND Section */}
            <section
              className="py-16 md:py-20 mb-0"
              style={{
                backgroundColor: '#000047',
                width: '100vw',
                marginLeft: 'calc(50% - 50vw)',
                marginRight: 'calc(50% - 50vw)'
              }}
            >
              <div className="px-6">
                <motion.div 
                  variants={itemVariants}
                  className="max-w-6xl mx-auto"
                >
                  <div className="text-center mb-12">
                    <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-4">What Makes This Program a Must-Attend for Entrepreneurs</h2>
                  </div>

                  <div className="max-w-4xl mx-auto space-y-8">
                    {/* Point 1 */}
                    <div className="bg-gradient-to-br from-white to-[#f0f9ff] rounded-2xl p-6 shadow-lg border border-cyan-200/50" 
                         style={{
                           boxShadow: '0 0 20px rgba(0, 255, 255, 0.15), 0 10px 30px rgba(53, 51, 205, 0.1)'
                         }}>
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0">
                          <GraduationCap className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-gray-900 mb-2">Learn from a Proven Business Builder</h3>
                          <p className="text-gray-700">Gain real-world insights from a coach who has successfully built and scaled multiple businesses. No theory-only practical strategies tailored for MSMEs like yours.</p>
                        </div>
                      </div>
                    </div>
                    
                    
                    {/* Point 2 */}
                    <div className="bg-gradient-to-br from-white to-[#f0f9ff] rounded-2xl p-6 shadow-lg border border-cyan-200/50" 
                         style={{
                           boxShadow: '0 0 20px rgba(0, 255, 255, 0.15), 0 10px 30px rgba(53, 51, 205, 0.1)'
                         }}>
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0">
                          <Zap className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-gray-900 mb-2">Follow a System That Drives Sustainable Growth</h3>
                          <p className="text-gray-700">Understand a proven framework used by 25,000+ business owners to scale efficiently-without being stuck in day-to-day operations.</p>
                        </div>
                      </div>
                    </div>
                    
                    
                    {/* Point 3 */}
                    <div className="bg-gradient-to-br from-white to-[#f0f9ff] rounded-2xl p-6 shadow-lg border border-cyan-200/50" 
                         style={{
                           boxShadow: '0 0 20px rgba(0, 255, 255, 0.15), 0 10px 30px rgba(53, 51, 205, 0.1)'
                         }}>
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0">
                          <Crown className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-gray-900 mb-2">Step into True Leadership</h3>
                          <p className="text-gray-700">Move beyond managing tasks. Learn how to build, train, and empower a team that runs independently while you focus on growth.</p>
                        </div>
                      </div>
                    </div>
                    
                    
                    {/* Point 4 */}
                    <div className="bg-gradient-to-br from-white to-[#f0f9ff] rounded-2xl p-6 shadow-lg border border-cyan-200/50" 
                         style={{
                           boxShadow: '0 0 20px rgba(0, 255, 255, 0.15), 0 10px 30px rgba(53, 51, 205, 0.1)'
                         }}>
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0">
                          <Lightbulb className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-gray-900 mb-2">Solve Your Most Critical Business Challenges</h3>
                          <p className="text-gray-700">Whether it's low margins, delayed payments, or stagnant sales-discover actionable solutions you can implement immediately.</p>
                        </div>
                      </div>
                    </div>
                    
                    
                    {/* Point 5 */}
                    <div className="bg-gradient-to-br from-white to-[#f0f9ff] rounded-2xl p-6 shadow-lg border border-cyan-200/50" 
                         style={{
                           boxShadow: '0 0 20px rgba(0, 255, 255, 0.15), 0 10px 30px rgba(53, 51, 205, 0.1)'
                         }}>
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0">
                          <Clock className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-gray-900 mb-2">Take Back Control of Your Time and Business</h3>
                          <p className="text-gray-700">Break free from daily chaos by building strong systems and teams that allow your business to run smoothly without constant supervision.</p>
                        </div>
                      </div>
                    </div>
                    
                    
                    {/* Point 6 */}
                    <div className="bg-gradient-to-br from-white to-[#f0f9ff] rounded-2xl p-6 shadow-lg border border-cyan-200/50" 
                         style={{
                           boxShadow: '0 0 20px rgba(0, 255, 255, 0.15), 0 10px 30px rgba(53, 51, 205, 0.1)'
                         }}>
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0">
                          <ClipboardCheck className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-gray-900 mb-2">Leave with a Clear, Actionable Growth Plan</h3>
                          <p className="text-gray-700">Walk away with a personalized action plan tailored to your business-ready to implement from day one.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </section>

            {/* LIMITED SEATS ONLY Section */}
            <section
              className="py-16 md:py-20 mb-20"
              style={{
                backgroundColor: '#000047',
                width: '100vw',
                marginLeft: 'calc(50% - 50vw)',
                marginRight: 'calc(50% - 50vw)'
              }}
            >
              <div className="px-6">
                <motion.div 
                  variants={itemVariants}
                  className="max-w-6xl mx-auto"
                >
                  

                  <div className="max-w-5xl mx-auto">
                    <div className="relative">
                      {/* Background decoration */}
                      <div className="absolute -inset-4 bg-gradient-to-r from-white/5 to-white/10 rounded-3xl opacity-60" />
                      
                      {/* Main content */}
                      <div className="relative bg-white/10 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
                        {/* Top gradient bar */}
                        <div className="h-2 w-full bg-gradient-to-r from-[#3533cd] to-[#00ffff]" />
                        
                        <div className="p-8 md:p-12">
                          {/* Alert badge */}
                          

                      {/* Main message */}
                      <div className="text-center mb-10">
                        <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
                          We work closely with founders to ensure
                        </h3>
                        <p className="text-lg text-white/80">
                          Real transformation requires deep focus and personalized attention
                        </p>
                      </div>

                      {/* Feature grid */}
                      <div className="grid md:grid-cols-3 gap-6 mb-10">
                        <motion.div 
                          className="text-center group"
                          whileHover={{ y: -4 }}
                        >
                          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-[#3533cd] to-[#3533cd] flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                            <Brain className="h-7 w-7 text-white" />
                          </div>
                          <h4 className="text-lg font-bold text-white mb-2">Personal Clarity</h4>
                          <p className="text-white/80 text-sm leading-relaxed">
                            Deep dive into your unique business challenges and breakthrough opportunities
                          </p>
                        </motion.div>

                        <motion.div 
                          className="text-center group"
                          whileHover={{ y: -4 }}
                        >
                          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-[#00ffff] to-[#3533cd] flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                            <Zap className="h-7 w-7 text-white" />
                          </div>
                          <h4 className="text-lg font-bold text-white mb-2">Real Implementation</h4>
                          <p className="text-white/80 text-sm leading-relaxed">
                            Build actual systems during the program, not just theoretical frameworks
                          </p>
                        </motion.div>

                        <motion.div 
                          className="text-center group"
                          whileHover={{ y: -4 }}
                        >
                          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-[#3533cd] to-[#00ffff] flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                            <TrendingUp className="h-7 w-7 text-white" />
                          </div>
                          <h4 className="text-lg font-bold text-white mb-2">Measurable Outcomes</h4>
                          <p className="text-white/80 text-sm leading-relaxed">
                            Track concrete improvements in revenue, systems, and personal freedom
                          </p>
                        </motion.div>
                      </div>

                      
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </section>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.3 }}
              transition={{ duration: 0.6 }}
              className="text-center mt-12"
            >
              <motion.button
                className="group relative inline-flex items-center justify-center px-12 py-6 text-xl font-bold text-white rounded-2xl overflow-hidden transition-all duration-300 hover:scale-105"
                style={{
                  background: 'linear-gradient(135deg, #3533cd 0%, #00ffff 100%)',
                  boxShadow: '0 0 30px rgba(0, 255, 255, 0.3), 0 15px 35px rgba(53, 51, 205, 0.2)'
                }}
                whileHover={{ 
                  boxShadow: '0 0 40px rgba(0, 255, 255, 0.4), 0 20px 45px rgba(53, 51, 205, 0.25), 0 0 0 2px rgba(0, 255, 255, 0.5)',
                  scale: 1.05
                }}
                transition={{ duration: 0.3 }}
                onClick={() => {
  window.scrollTo(0, 0);
  navigate('/contact');
}}
              >
                <span className="relative z-10">APPLY NOW</span>
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              </motion.button>
              
              <motion.p 
                className="mt-6 mb-12 text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, amount: 0.3 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                Build a business that doesn't just grow<br/>
                but evolves intelligently.
              </motion.p>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Programs;
