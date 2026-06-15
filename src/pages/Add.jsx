import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  Gift,
  HelpCircle,
  LockKeyhole,
  Rocket,
  ShieldCheck,
  Star,
  TrendingUp,
  XCircle
} from 'lucide-react'

const joinOutcomes = [
  'You Unlock Secrets To Create Time & Wealth In Business',
  'You Learn Strong Foundational Activities To Win In Your Business',
  'Your Business Growth With Increased Revenue & Cashflow',
  'More Profit, More Freedom, More Scale Is Guaranteed If You Follow The Exact Steps Covered In The Workshop'
]

const bestFor = [
  'MSME Business Owners',
  'Entrepreneurs looking to scale',
  'Founders stuck in daily operations',
  'Business owners seeking growth'
]

const fourHourLearnings = [
  'How to build a growth business rather than a survival business',
  'Characteristics of growth and survival businesses',
  '3 Reasons why business owners get stuck in survival',
  'Focus areas to build a growth business'
]

const struggles = [
  'Handling sales, operations, team follow-ups, and decisions yourself',
  'Growing, but still feeling stuck, stressed, or unclear',
  'Working harder every year without building real freedom',
  'Facing inconsistent revenue, shrinking margins, or cashflow pressure',
  'Depending too much on people instead of repeatable systems',
  'Not having a clear roadmap to scale profitably',
  'Feeling trapped in daily firefighting instead of strategic growth'
]

const transformations = [
  'Build a system-driven business that can run without constant founder involvement',
  'Create predictable growth engines instead of relying on guesswork',
  'Gain clarity on numbers, cashflow, profitability, and key business levers',
  'Upgrade your decision-making from operator mode to leadership mode',
  'Design workflows, SOPs, and AI-enabled structures that reduce chaos'
]

const magnaSystem = [
  {
    letter: 'M',
    title: 'Mindset Alignment',
    copy: 'Shift from pressure-based execution to clear founder leadership.'
  },
  {
    letter: 'A',
    title: 'Architecture of Systems',
    copy: 'Build SOPs, workflows, dashboards, and repeatable operating systems.'
  },
  {
    letter: 'G',
    title: 'Growth Engine Design',
    copy: 'Engineer leads, conversion, retention, referrals, and revenue visibility.'
  },
  {
    letter: 'N',
    title: 'Numbers & Navigation',
    copy: 'Track the few metrics that actually reveal growth, leaks, and profit.'
  },
  {
    letter: 'A',
    title: 'Alignment of Team & Execution',
    copy: 'Create team ownership so growth does not depend only on you.'
  }
]

const workshopFlow = [
  {
    title: 'Fix What Is Stopping Your Growth',
    copy: 'Identify the patterns that keep business owners stuck in survival mode.'
  },
  {
    title: 'Build A Strong Growth Foundation',
    copy: 'Understand the difference between a survival business and a growth business.'
  },
  {
    title: 'Design Systems That Reduce Dependency',
    copy: 'Map the repeatable activities, SOPs, workflows, and tools your business needs.'
  },
  {
    title: 'Create Predictable Revenue',
    copy: 'See where growth leaks happen across leads, conversion, pricing, and follow-up.'
  },
  {
    title: 'Read Your Numbers Clearly',
    copy: 'Get sharper visibility on cashflow, margins, KPIs, and founder decisions.'
  },
  {
    title: 'Ask, Clarify, And Plan Next Steps',
    copy: 'Leave with practical direction for implementation after the workshop.'
  }
]

const greatFit = [
  'MSME founders stuck in daily operations',
  'Business owners with revenue who want to scale with clarity',
  'Entrepreneurs who want systems, not just ideas',
  'Retail, service, manufacturing, and consumer-brand owners building repeatable growth',
  'Founders ready to move from operator to architect to leader'
]

const notFit = [
  'People looking for shortcuts or overnight success',
  'Founders unwilling to implement after learning',
  'Anyone expecting motivation-only content without practical work',
  'People not serious about building long-term systems',
  'Non-business owners who are not ready to take action'
]

const mentorPoints = [
  '23+ years of building systems, scaling products, and creating measurable business impact',
  'Experience across Samsung, Philips, Unilever, GlaxoSmithKline, EAZY, Recibo.AI, and Mind Magna',
  '650+ brands served across 8 countries through venture and growth work',
  '7,88,175+ business owners trained in the last 6 years',
  'Practical frameworks at the intersection of business coaching, brand strategy, and founder transformation'
]

const stats = [
  { value: '7.8L+', label: 'Business Owners Trained' },
  { value: '2.3M+', label: 'Social Media Reach' },
  { value: '600+', label: 'Workshops Conducted' },
  { value: '4.96', label: 'Average Rating' }
]

const faqs = [
  {
    question: 'Who should attend this workshop?',
    answer: 'MSME business owners, entrepreneurs, and founders looking to scale their business and break free from daily operations.'
  },
  {
    question: 'What will I learn in 4 hours?',
    answer: 'You will learn proven strategies to build a growth business, characteristics of successful businesses, and actionable steps to increase revenue and profit.'
  },
  {
    question: 'Is the price really just Rs 99?',
    answer: 'Yes. Today\'s special price is Rs 99/- only. Register before the timer ends to secure this special offer and bonuses worth Rs 6,487/-.'
  },
  {
    question: 'What if I am not satisfied?',
    answer: 'There is a 100% satisfaction guarantee. If you do not find value in the workshop, your investment is refunded.'
  },
  {
    question: 'Is this a live workshop?',
    answer: 'Yes. The workshop is designed as a live, interactive learning experience with practical business examples and implementation clarity.'
  },
  {
    question: 'Will this help if my business is already running?',
    answer: 'Yes. This is especially useful for owners who already have a business and want to move from daily operations into structured growth, systems, and leadership.'
  },
  {
    question: 'Do I need advanced marketing or finance knowledge?',
    answer: 'No. The workshop focuses on practical frameworks that business owners can understand, apply, and refine inside their own context.'
  }
]

const magnaProgramDays = [
  {
    label: 'FOUNDATION & SYSTEMS',
    day: 'Day 1',
    sessions: [
      {
        title: 'Session 1: M - Mindset',
        points: [
          'The 3 identity shifts required to scale beyond Rs 1Cr to Rs 100 Cr+',
          'Why hard work is killing growth and what replaces it',
          'Breaking founder dependency loop',
          'Moving from firefighting to foresight-driven leadership'
        ]
      },
      {
        title: 'Session 2: A - Architecture',
        points: [
          'How to remove people dependency',
          'Designing SOPs that actually get followed',
          'Tools and workflows to reduce manual effort by 30-50%',
          'Automating marketing, sales follow-ups, and operation',
          'Where AI actually fits in MSME businesses'
        ]
      },
      {
        title: 'Session 3: G - Growth',
        points: [
          'How to create predictable monthly revenue',
          'Fixing inconsistent sales pipelines',
          'Positioning and messaging for premium growth'
        ]
      }
    ]
  },
  {
    label: 'SCALE & SUSTAINABILITY',
    day: 'Day 2',
    sessions: [
      {
        title: 'Session 4: N - Numbers',
        points: [
          'The only KPIs that actually matter for founders',
          'Understanding CAC, LTV, conversion ratios, and margins',
          'How to stop profit leaks in your business'
        ]
      },
      {
        title: 'Session 5: A - Alignment',
        points: [
          'Aligning team, systems, and founder energy',
          'Hiring for scale vs hiring for survival',
          'Time, energy and focus management for founders',
          'Creating a culture of ownership, not dependency'
        ]
      },
      {
        title: 'Session 6: Q & A Session',
        points: [
          'Addressing specific challenges and questions from participants',
          'Final insights and next steps for implementation'
        ]
      }
    ]
  }
]

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`
}

function RegisterButton({ children = 'REGISTER NOW AT Rs 99/- ONLY', className = '' }) {
  return (
    <Link
      to="/contact"
      className={`inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-primary px-6 py-4 text-center text-base font-extrabold uppercase tracking-wide text-white shadow-glow-combined transition hover:-translate-y-0.5 sm:w-auto ${className}`}
    >
      {children}
      <ArrowRight className="h-5 w-5" />
    </Link>
  )
}

export default function Add() {
  const [timeLeft, setTimeLeft] = useState(900)

  useEffect(() => {
    window.scrollTo(0, 0)
    const timer = setInterval(() => {
      setTimeLeft((current) => (current <= 1 ? 0 : current - 1))
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  return (
    <div className="bg-neutral-100 pt-16">
      <section className="px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 text-center">
            <h1 className="mb-4 bg-gradient-primary bg-clip-text text-4xl font-extrabold leading-tight text-transparent sm:text-5xl">
              Business Growth Masterclass
            </h1>
            <div className="mx-auto h-1.5 w-28 rounded-full bg-gradient-primary" />
          </div>

          <div className="mx-auto mb-6 max-w-xl rounded-lg bg-gradient-primary p-5 text-center text-white shadow-glow-combined">
            <h2 className="mb-2 text-2xl font-extrabold">4 hour Online Workshop</h2>
            <p className="mb-1 text-xl font-bold">ON 6th May 2026</p>
            <p className="text-white/90">(9:00 AM - 1:00 PM IST)</p>
          </div>

          <div className="mx-auto mb-10 max-w-3xl rounded-lg border-2 border-primary-500 bg-white p-5 text-center text-lg font-semibold leading-8 text-gray-700 shadow-lg">
            Join and Become Like The Top 1% Successful
            <br />
            Business Owners & Entrepreneurs
            <br />
            Before It's Too Late
          </div>
        </div>
      </section>

      <section className="bg-[#000047] px-4 py-12 text-white sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div className="text-center">
            <img
              src="/dharneesh-mentor.png"
              alt="Dharneesh B R"
              className="mx-auto h-72 w-auto object-contain"
            />
            <h2 className="mt-5 text-3xl font-extrabold">Dharneesh B R</h2>
            <p className="mt-2 text-lg font-semibold text-cyan-100">India's MSME Business Coach</p>
            <p className="mt-3 text-white/75">Trained over 7,88,175 Business Owners in Last 6 Years</p>
            <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 font-bold">
              <span className="flex text-yellow-300">
                {[0, 1, 2, 3, 4].map((star) => (
                  <Star key={star} className="h-4 w-4 fill-current" />
                ))}
              </span>
              4.96
            </div>
          </div>

          <div>
            <h2 className="mb-6 text-center text-3xl font-extrabold lg:text-left">What Happens When You Join?</h2>
            <div className="space-y-4">
              {joinOutcomes.map((item, index) => (
                <div key={item} className="flex gap-4 rounded-lg border border-white/15 bg-white/10 p-5">
                  <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-primary">
                    {[LockKeyhole, BadgeCheck, TrendingUp, Rocket][index] &&
                      (() => {
                        const Icon = [LockKeyhole, BadgeCheck, TrendingUp, Rocket][index]
                        return <Icon className="h-5 w-5 text-white" />
                      })()}
                  </div>
                  <p className="font-semibold leading-7 text-white/80">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-12 text-center sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <p className="mb-4 text-lg font-semibold text-gray-600">Register in next</p>
          <div className="mx-auto mb-5 rounded-2xl bg-gradient-primary p-6 text-white shadow-glow-combined">
            <div className="mb-2 text-5xl font-extrabold">{formatTime(timeLeft)}</div>
            <p className="text-lg font-semibold">Minutes Seconds</p>
          </div>
          <p className="mb-6 text-lg font-bold text-gray-700">To Unlock Bonuses Worth Rs 6,487</p>
          <RegisterButton />
        </div>
      </section>

      <section className="px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-2">
          <InfoCard title="Who This Workshop Will Help The Best?" items={bestFor} />
          <NumberedCard title="What You Will Learn In 4 Hrs?" items={fourHourLearnings} />
        </div>
        <div className="mx-auto mt-10 max-w-sm">
          <img src="/dharneesh-program.png" alt="Workshop Program" className="w-full object-contain" />
        </div>
      </section>

      <section className="bg-white px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="mb-8 text-center">
            <p className="mb-2 text-sm font-extrabold uppercase tracking-[0.16em] text-primary-600">Stop here if this feels familiar</p>
            <h2 className="text-3xl font-extrabold text-[#000047]">Are You Still Struggling To Run And Scale Your Business?</h2>
          </div>
          <div className="rounded-lg border border-red-100 bg-red-50 p-6 shadow-lg">
            <ul className="space-y-4">
              {struggles.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <XCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600" />
                  <span className="leading-7 text-gray-800">{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-6 rounded-lg bg-gradient-primary p-6 text-center text-white shadow-glow-combined">
            <h3 className="mb-2 text-2xl font-extrabold">If You Are Nodding Along, It Is Time To Make A Change.</h3>
            <p className="text-white/90">This workshop is built to help you move from daily firefighting to structured, profitable, system-led growth.</p>
          </div>
        </div>
      </section>

      <section className="px-4 py-14 sm:px-6 lg:px-8">
        <SectionHeading
          title="How Your Business Can Transform After This Workshop"
          subtitle="Get clarity, systems, and practical direction for scaling without burning yourself out."
        />
        <div className="mx-auto grid max-w-6xl gap-4 md:grid-cols-2">
          {transformations.map((item, index) => (
            <div key={item} className="rounded-lg border border-primary-100 bg-white p-5 shadow-lg">
              <div className="flex items-start gap-4">
                <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-primary text-sm font-extrabold text-white">{index + 1}</span>
                <p className="font-semibold leading-7 text-gray-800">{item}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-[#000047] px-4 py-14 text-white sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="The MAGNA Growth System"
          title="A Conscious Growth Framework For Scaling Smarter"
          dark
        />
        <div className="mx-auto grid max-w-6xl gap-4 md:grid-cols-2 lg:grid-cols-5">
          {magnaSystem.map((item) => (
            <div key={`${item.letter}-${item.title}`} className="rounded-lg border border-white/15 bg-white/10 p-5 backdrop-blur">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-white text-2xl font-extrabold text-primary-700">
                {item.letter}
              </div>
              <h3 className="mb-2 text-lg font-extrabold">{item.title}</h3>
              <p className="text-sm leading-6 text-white/80">{item.copy}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white px-4 py-14 sm:px-6 lg:px-8">
        <SectionHeading
          title="What You Will Learn Inside The Workshop"
          subtitle="A practical, no-fluff flow designed to help you identify leaks and build the next version of your business."
        />
        <div className="mx-auto grid max-w-6xl gap-4 md:grid-cols-2 lg:grid-cols-3">
          {workshopFlow.map((item, index) => (
            <div key={item.title} className="rounded-lg border border-primary-100 bg-gradient-to-br from-white to-cyan-50 p-5 shadow-lg">
              <div className="mb-3 flex items-center gap-3">
                <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-primary text-sm font-extrabold text-white">{index + 1}</span>
                <h3 className="text-lg font-extrabold leading-tight text-gray-950">{item.title}</h3>
              </div>
              <p className="leading-7 text-gray-700">{item.copy}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="px-4 py-14 sm:px-6 lg:px-8">
        <SectionHeading title="Is This Workshop Right For You?" />
        <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-2">
          <FitCard title="You Are A Great Fit If You Are:" items={greatFit} positive />
          <FitCard title="This May Not Be A Fit If You Are:" items={notFit} />
        </div>
      </section>

      <section className="bg-white px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="mb-8 text-center">
            <p className="mb-2 text-sm font-extrabold uppercase tracking-[0.16em] text-primary-600">Meet Your Mentor</p>
            <h2 className="text-3xl font-extrabold text-[#000047]">Learn From A Proven Business Builder</h2>
          </div>
          <div className="rounded-lg border border-primary-100 bg-gradient-to-br from-white to-cyan-50 p-6 shadow-xl">
            <div className="mb-6 text-center">
              <img src="/dharneesh-mentor.png" alt="Dharneesh B R" className="mx-auto h-56 w-auto object-contain" />
              <h3 className="text-3xl font-extrabold text-[#000047]">Dharneesh B R</h3>
              <p className="mt-1 font-semibold text-gray-600">Business Growth Strategist | Founder & Business Coach</p>
            </div>
            <ul className="space-y-4">
              {mentorPoints.map((point) => (
                <li key={point} className="flex items-start gap-3">
                  <CheckCircle2 className="mt-1 h-5 w-5 flex-shrink-0 text-primary-600" />
                  <span className="leading-7 text-gray-800">{point}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="bg-[#000047] px-4 py-14 text-white sm:px-6 lg:px-8">
        <SectionHeading title="What Will Change In Your Business?" dark />
        <div className="mx-auto mb-10 grid max-w-4xl gap-4 sm:grid-cols-3">
          {['Right Psychology Of Running The Business', 'Right Strategies', 'Right Systems'].map((item) => (
            <div key={item} className="rounded-lg border-2 border-dashed border-cyan bg-white/10 p-5 text-center font-bold text-white">
              {item}
            </div>
          ))}
        </div>
        <div className="text-center">
          <div className="mx-auto mb-8 flex h-32 w-32 items-center justify-center rounded-full bg-gradient-primary p-4 text-center text-lg font-extrabold text-[#000047] shadow-glow-cyan">
            Business Breakthrough
          </div>
          <RegisterButton />
        </div>
      </section>

      <section className="px-4 py-14 sm:px-6 lg:px-8">
        <SectionHeading title="Who This Workshop Will Help The Best?" />
        <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-2">
          <InfoCard title="Best For" items={bestFor} />
          <FitCard title="DON'T JOIN IF" items={['You Are Not A Business Owner', 'You Are Not An Action Taker', 'You Are Not Serious About Your Business']} />
        </div>
      </section>

      <section className="bg-[#000047] px-4 py-14 text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <Gift className="mx-auto mb-4 h-12 w-12 text-cyan" />
          <h2 className="mb-5 text-3xl font-extrabold">Bonuses If You Register Before Timer Hits 0</h2>
          <div className="mx-auto mb-5 rounded-2xl bg-gradient-primary p-6 text-white shadow-glow-combined">
            <div className="mb-2 text-5xl font-extrabold">{formatTime(timeLeft)}</div>
            <p className="text-lg font-semibold">Offer Ends In</p>
          </div>
          <p className="mb-4 text-2xl font-extrabold">Today's Price: Rs 99/-</p>
          <RegisterButton>Register Now at Rs 99/- Only</RegisterButton>
          <p className="mt-5 text-white/80">Reserve your seat before the timer ends to unlock bonuses worth Rs 6,487/-</p>
        </div>
      </section>

      <section className="bg-white px-4 py-14 sm:px-6 lg:px-8">
        <SectionHeading title="I'm On A MISSION To Help 1 Million Business Owners Achieve Profit & Growth" />
        <div className="mx-auto grid max-w-6xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-lg border border-primary-100 bg-white p-6 text-center shadow-lg">
              <div className="mb-2 bg-gradient-primary bg-clip-text text-4xl font-extrabold text-transparent">{stat.value}</div>
              <p className="font-semibold text-gray-600">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl rounded-lg bg-gradient-primary p-[1px] shadow-glow-combined">
          <div className="rounded-[7px] bg-white p-8 text-center">
            <ShieldCheck className="mx-auto mb-4 h-12 w-12 text-primary-600" />
            <p className="mb-2 text-sm font-extrabold uppercase tracking-[0.16em] text-primary-600">Our Guarantee</p>
            <h2 className="mb-4 text-3xl font-extrabold text-[#000047]">A Promise</h2>
            <p className="mx-auto max-w-3xl text-lg leading-8 text-gray-700">
              If you don't feel this workshop provides immense value and actionable insights to transform your business, we'll refund your investment. No questions asked.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-white px-4 py-14 sm:px-6 lg:px-8">
        <SectionHeading title="Frequently Asked Questions" />
        <div className="mx-auto grid max-w-6xl gap-4 md:grid-cols-2">
          {faqs.map((faq) => (
            <div key={faq.question} className="rounded-lg border border-gray-200 bg-white p-5 shadow-lg">
              <div className="mb-3 flex items-center gap-3">
                <HelpCircle className="h-5 w-5 flex-shrink-0 text-primary-600" />
                <h3 className="font-extrabold text-gray-950">{faq.question}</h3>
              </div>
              <p className="leading-7 text-gray-600">{faq.answer}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-[#000047] px-4 py-14 text-white sm:px-6 lg:px-8">
        <SectionHeading
          title="Join the MAGNA Business Program"
          subtitle="Two focused days to move from founder-led chaos to a system-driven business with clearer growth, control, and execution."
          dark
        />
        <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-2">
          {magnaProgramDays.map((day) => (
            <div key={day.day} className="rounded-lg border border-white/15 bg-white/10 p-6 backdrop-blur">
              <p className="mb-2 text-sm font-extrabold uppercase tracking-[0.16em] text-cyan-100">{day.label}</p>
              <h3 className="mb-6 text-3xl font-extrabold">{day.day}</h3>
              <div className="space-y-5">
                {day.sessions.map((session) => (
                  <div key={session.title} className="rounded-lg bg-white/10 p-5">
                    <h4 className="mb-4 text-xl font-extrabold text-white">{session.title}</h4>
                    <ul className="space-y-3">
                      {session.points.map((point) => (
                        <li key={point} className="flex gap-3 text-white/80">
                          <ArrowRight className="mt-1 h-4 w-4 flex-shrink-0 text-cyan" />
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

function SectionHeading({ eyebrow, title, subtitle, dark = false }) {
  return (
    <div className="mx-auto mb-10 max-w-4xl text-center">
      {eyebrow ? (
        <p className={`mb-2 text-sm font-extrabold uppercase tracking-[0.16em] ${dark ? 'text-cyan-100' : 'text-primary-600'}`}>
          {eyebrow}
        </p>
      ) : null}
      <h2 className={`text-3xl font-extrabold leading-tight sm:text-4xl ${dark ? 'text-white' : 'text-[#000047]'}`}>
        {title}
      </h2>
      {subtitle ? (
        <p className={`mt-4 text-lg leading-8 ${dark ? 'text-white/80' : 'text-gray-600'}`}>
          {subtitle}
        </p>
      ) : null}
    </div>
  )
}

function InfoCard({ title, items }) {
  return (
    <div className="rounded-lg border border-primary-100 bg-white p-6 shadow-lg">
      <h3 className="mb-5 text-2xl font-extrabold text-[#000047]">{title}</h3>
      <ul className="space-y-4">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-3">
            <CheckCircle2 className="mt-1 h-5 w-5 flex-shrink-0 text-emerald-500" />
            <span className="leading-7 text-gray-700">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function NumberedCard({ title, items }) {
  return (
    <div className="rounded-lg border border-primary-100 bg-white p-6 shadow-lg">
      <h3 className="mb-5 text-2xl font-extrabold text-[#000047]">{title}</h3>
      <ul className="space-y-4">
        {items.map((item, index) => (
          <li key={item} className="flex items-start gap-3">
            <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-gradient-primary text-sm font-extrabold text-white">
              {index + 1}
            </span>
            <span className="leading-7 text-gray-700">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function FitCard({ title, items, positive = false }) {
  return (
    <div className={`rounded-lg border p-6 shadow-lg ${positive ? 'border-emerald-100 bg-emerald-50' : 'border-red-100 bg-red-50'}`}>
      <h3 className={`mb-5 text-2xl font-extrabold ${positive ? 'text-emerald-700' : 'text-red-700'}`}>{title}</h3>
      <ul className="space-y-4">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-3">
            {positive ? (
              <CheckCircle2 className="mt-1 h-5 w-5 flex-shrink-0 text-emerald-600" />
            ) : (
              <XCircle className="mt-1 h-5 w-5 flex-shrink-0 text-red-600" />
            )}
            <span className="leading-7 text-gray-800">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
