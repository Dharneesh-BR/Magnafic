import { useState } from 'react'
import CommunityApplicationModal from '../components/CommunityApplicationModal'
import {
  ArrowRight,
  Bot,
  Boxes,
  BriefcaseBusiness,
  CheckCircle2,
  CircleDollarSign,
  Factory,
  Globe2,
  Lightbulb,
  Megaphone,
  Network,
  Rocket,
  Sparkles,
  Target,
  TrendingUp,
  UsersRound
} from 'lucide-react'

const audience = [
  {
    icon: BriefcaseBusiness,
    title: 'Consumer Brand Founders',
    description: 'Building brands across FMCG, Food & Beverage, Personal Care, Beauty, Health & Wellness, Consumer Durables, Electricals, Building Materials, Home Care, Nutrition, Pet Care, and D2C categories.'
  },
  {
    icon: UsersRound,
    title: 'Co-Founders',
    description: 'Looking to accelerate growth through proven strategies, expert guidance, and peer learning.'
  },
  {
    icon: TrendingUp,
    title: 'Startup Leaders',
    description: 'Responsible for driving growth, sales, marketing, operations, or business expansion.'
  },
  {
    icon: Sparkles,
    title: 'Emerging Brands',
    description: 'Seeking access to experienced operators and industry experts who have already solved similar challenges.'
  }
]

const challengeAreas = [
  'Brand Building',
  'Product Launches',
  'Marketing Strategy',
  'Distribution Expansion',
  'E-Commerce Growth',
  'Quick Commerce',
  'Pricing & Profitability',
  'Fundraising Readiness',
  'Team Building',
  'Operations & Supply Chain'
]

const communityBenefits = [
  {
    icon: Target,
    title: 'Learn From the Top 1%',
    description: 'Gain access to experienced CXOs, consultants, and operators who have scaled leading consumer brands across multiple categories and channels.'
  },
  {
    icon: Lightbulb,
    title: 'Solve Real Business Challenges',
    description: 'Get practical guidance on brand building, launches, distribution, profitability, fundraising, teams, and operations.'
  },
  {
    icon: UsersRound,
    title: 'Connect With Like-Minded Founders',
    description: 'Build relationships with ambitious founders facing similar growth challenges and opportunities.'
  },
  {
    icon: Boxes,
    title: 'Access Growth Resources',
    description: 'Receive frameworks, playbooks, case studies, templates, and practical tools designed specifically for consumer brands.'
  },
  {
    icon: Globe2,
    title: 'Stay Ahead of Industry Trends',
    description: 'Learn about emerging consumer trends, AI adoption, digital transformation, retail evolution, and category shifts before they become mainstream.'
  }
]

const memberAccess = [
  'Founder Networking Sessions',
  'Expert-Led Masterclasses',
  'Growth Workshops',
  'Founder Roundtables',
  'Industry Insights',
  'Exclusive Community Access'
]

const expertAreas = [
  { icon: TrendingUp, title: 'Strategy & Growth' },
  { icon: Network, title: 'Sales & Distribution' },
  { icon: Megaphone, title: 'Marketing & Branding' },
  { icon: Lightbulb, title: 'Product Development' },
  { icon: Globe2, title: 'E-Commerce & Quick Commerce' },
  { icon: Factory, title: 'Operations & Supply Chain' },
  { icon: CircleDollarSign, title: 'Finance & Fundraising' },
  { icon: Bot, title: 'Technology & AI' },
  { icon: UsersRound, title: 'Leadership & Talent' }
]

const magnaficReasons = [
  {
    title: 'Top 1% Industry Expertise',
    description: 'Access experienced CXOs, consultants, and operators.'
  },
  {
    title: 'Conscious Strategy',
    description: 'Business decisions rooted in long-term sustainable growth.'
  },
  {
    title: 'AI-Powered Growth',
    description: 'Leveraging technology and intelligence to help brands move faster and make better decisions.'
  },
  {
    title: 'Consumer Industry Focus',
    description: 'Built specifically for founders and businesses operating in the consumer products ecosystem.'
  }
]

export default function FounderCommunity() {
  const [isApplicationOpen, setIsApplicationOpen] = useState(false)

  return (
    <div className="bg-white pt-16">
      <section className="relative isolate min-h-[calc(100vh-4rem)] overflow-hidden bg-[#000047]">
        <img
          src="/Banner.png"
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-35"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,71,0.97)_0%,rgba(0,0,71,0.82)_50%,rgba(0,0,71,0.58)_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.045)_1px,transparent_1px)] bg-[size:64px_64px]" />

        <div className="relative mx-auto flex min-h-[calc(100vh-4rem)] max-w-7xl flex-col justify-center px-4 py-16 sm:px-6 lg:px-8">
          <div className="max-w-4xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-cyan/40 bg-white/10 px-4 py-2 text-sm font-bold uppercase tracking-wide text-cyan-100 backdrop-blur">
              <Rocket className="h-4 w-4" />
              Magnafic Founder Community
            </div>
            <h1 className="text-4xl font-extrabold leading-tight text-white sm:text-5xl lg:text-6xl">
              Be in the Top 1% of Founders scaling Consumer Brands Business.
            </h1>
            <p className="mt-5 max-w-3xl text-2xl font-semibold text-cyan-100 sm:text-3xl">
              Scale Faster. Learn Smarter. Grow Together.
            </p>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-white/80 sm:text-xl">
              Building a consumer brand is exciting, but it can also be lonely. The Magnafic Founder Community brings ambitious founders together with the people, insights, and guidance they need at the right time.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => setIsApplicationOpen(true)}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-7 py-4 text-base font-extrabold text-primary-700 shadow-glow-cyan transition hover:-translate-y-0.5 hover:bg-cyan-50"
              >
                Join the Community
                <ArrowRight className="h-5 w-5" />
              </button>
              <a
                href="#who-is-this-for"
                className="inline-flex items-center justify-center rounded-lg border border-white/30 bg-white/10 px-7 py-4 text-base font-extrabold text-white backdrop-blur transition hover:bg-white/20"
              >
                See Who It Is For
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <div className="mb-3 text-sm font-extrabold uppercase tracking-wide text-primary-600">Why it exists</div>
            <h2 className="text-3xl font-extrabold text-[#000047] sm:text-4xl">
              The right people and guidance can change a founder's trajectory.
            </h2>
          </div>
          <div className="space-y-5 text-lg leading-8 text-gray-600">
            <p>
              Every founder faces challenges around growth, distribution, marketing, profitability, fundraising, team building, operations, and scaling.
            </p>
            <p>
              Often, the difference between success and struggle comes down to having access to the right people, insights, and guidance at the right time.
            </p>
          </div>
        </div>
      </section>

      <section id="who-is-this-for" className="bg-gray-50 px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 max-w-3xl">
            <div className="mb-3 text-sm font-extrabold uppercase tracking-wide text-primary-600">Who Is This For?</div>
            <h2 className="text-3xl font-extrabold text-[#000047] sm:text-4xl">
              Founders and growth leaders building meaningful consumer brands.
            </h2>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {audience.map((item) => (
              <article key={item.title} className="rounded-lg border border-gray-200 bg-white p-6 shadow-lg shadow-primary-900/5">
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-lg bg-primary-50">
                  <item.icon className="h-6 w-6 text-primary-600" />
                </div>
                <h3 className="mb-3 text-xl font-extrabold text-gray-950">{item.title}</h3>
                <p className="leading-7 text-gray-600">{item.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
          <div>
            <div className="mb-3 text-sm font-extrabold uppercase tracking-wide text-primary-600">Why Join?</div>
            <h2 className="text-3xl font-extrabold text-[#000047] sm:text-4xl">
              Learn from proven operators and solve real business challenges.
            </h2>
            <p className="mt-5 text-lg leading-8 text-gray-600">
              Whether you are launching your first product, scaling to the next revenue milestone, or preparing for national expansion, this community is designed to help you grow faster and avoid costly mistakes.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {challengeAreas.map((area) => (
              <div key={area} className="flex items-start gap-3 rounded-lg border border-primary-100 bg-primary-50/70 p-4">
                <CheckCircle2 className="mt-1 h-5 w-5 flex-shrink-0 text-primary-600" />
                <span className="font-bold leading-6 text-gray-800">{area}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#000047] px-4 py-16 text-white sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 max-w-3xl">
            <div className="mb-3 text-sm font-extrabold uppercase tracking-wide text-cyan-100">Community Advantage</div>
            <h2 className="text-3xl font-extrabold sm:text-4xl">
              Built for learning, connection, and practical growth.
            </h2>
          </div>

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {communityBenefits.map((benefit) => (
              <article key={benefit.title} className="rounded-lg border border-white/15 bg-white/10 p-6 backdrop-blur transition hover:-translate-y-1 hover:bg-white/15">
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-lg bg-white">
                  <benefit.icon className="h-6 w-6 text-primary-700" />
                </div>
                <h3 className="mb-3 text-xl font-extrabold">{benefit.title}</h3>
                <p className="leading-7 text-white/80">{benefit.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 max-w-3xl">
            <div className="mb-3 text-sm font-extrabold uppercase tracking-wide text-primary-600">What Members Get</div>
            <h2 className="text-3xl font-extrabold text-[#000047] sm:text-4xl">
              A trusted environment for founder learning and collaboration.
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {memberAccess.map((item) => (
              <div key={item} className="rounded-lg border border-gray-200 bg-white p-5 shadow-lg shadow-primary-900/5">
                <CheckCircle2 className="mb-4 h-6 w-6 text-primary-600" />
                <h3 className="text-lg font-extrabold text-gray-950">{item}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-gray-50 px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 max-w-3xl">
            <div className="mb-3 text-sm font-extrabold uppercase tracking-wide text-primary-600">Who You'll Learn From</div>
            <h2 className="text-3xl font-extrabold text-[#000047] sm:text-4xl">
              Leaders who have built, scaled, and transformed consumer businesses.
            </h2>
            <p className="mt-5 text-lg leading-8 text-gray-600">
              The Magnafic ecosystem includes operators across every function a consumer brand needs to scale, not just people who have studied the industry.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {expertAreas.map((area) => (
              <article key={area.title} className="flex items-center gap-4 rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
                <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg bg-primary-50">
                  <area.icon className="h-5 w-5 text-primary-600" />
                </div>
                <h3 className="font-extrabold text-gray-950">{area.title}</h3>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 max-w-3xl">
            <div className="mb-3 text-sm font-extrabold uppercase tracking-wide text-primary-600">Why Magnafic?</div>
            <h2 className="text-3xl font-extrabold text-[#000047] sm:text-4xl">
              The world's first platform combining expert wisdom, conscious strategy, and AI-powered growth.
            </h2>
          </div>

          <div className="grid gap-5 lg:grid-cols-4">
            {magnaficReasons.map((reason, index) => (
              <article key={reason.title} className="rounded-lg border border-gray-200 bg-white p-6 shadow-lg shadow-primary-900/5">
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-primary text-xl font-extrabold text-white">
                  {String(index + 1).padStart(2, '0')}
                </div>
                <h3 className="mb-3 text-xl font-extrabold text-gray-950">{reason.title}</h3>
                <p className="leading-7 text-gray-600">{reason.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-gray-50 px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
          <div>
            <div className="mb-3 text-sm font-extrabold uppercase tracking-wide text-primary-600">The Community Vision</div>
            <h2 className="text-3xl font-extrabold text-[#000047] sm:text-4xl">
              Great businesses are rarely built alone.
            </h2>
          </div>
          <div className="space-y-5 text-lg leading-8 text-gray-600">
            <p>
              We believe the next generation of iconic consumer brands will be built by founders who combine ambition with continuous learning.
            </p>
            <p>
              The Magnafic Founder Community exists to create a trusted ecosystem where founders can learn, collaborate, grow, and scale together.
            </p>
          </div>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-5xl rounded-lg bg-gradient-primary p-[1px] shadow-glow-combined">
          <div className="rounded-[7px] bg-[#000047] px-6 py-10 text-center text-white sm:px-10 sm:py-14">
            <img
              src="/favicon.png"
              alt="Magnafic icon"
              className="mx-auto mb-5 h-14 w-14 object-contain"
            />
            <h2 className="text-3xl font-extrabold sm:text-4xl">
              Join the Top 1% Founder Community
            </h2>
            <div className="mx-auto mt-6 grid max-w-3xl gap-3 text-lg font-semibold leading-8 text-white/80 sm:grid-cols-2">
              {['Connect with ambitious founders.', 'Learn from proven experts.', 'Access actionable growth insights.', 'Build a stronger consumer brand.'].map((line) => (
                <div key={line} className="rounded-lg border border-white/15 bg-white/10 px-4 py-3">
                  {line}
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setIsApplicationOpen(true)}
              className="mt-8 inline-flex items-center justify-center gap-2 rounded-lg bg-white px-8 py-4 text-base font-extrabold uppercase tracking-wide text-primary-700 transition hover:-translate-y-0.5 hover:bg-cyan-50"
            >
              Learn. Connect. Scale.
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </section>

      <CommunityApplicationModal
        open={isApplicationOpen}
        onClose={() => setIsApplicationOpen(false)}
        clubName="Magnafic Founder Community"
        reasonLabel="Why do you want to join the Founder Community?"
      />
    </div>
  )
}
