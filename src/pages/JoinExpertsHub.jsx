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
  Handshake,
  Lightbulb,
  Megaphone,
  Network,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  UsersRound
} from 'lucide-react'

const expertiseDomains = [
  {
    icon: TrendingUp,
    title: 'Strategy & Business Growth',
    items: ['Business Strategy', 'Growth Planning', 'Market Expansion', 'Go-to-Market Strategy', 'Category Management', 'Pricing & Revenue Growth']
  },
  {
    icon: Network,
    title: 'Sales & Distribution',
    items: ['General Trade', 'Modern Trade', 'E-Commerce', 'Quick Commerce', 'International Markets', 'Distributor Network Development']
  },
  {
    icon: Megaphone,
    title: 'Marketing & Brand Building',
    items: ['Brand Strategy', 'Digital Marketing', 'Consumer Insights', 'Performance Marketing', 'Product Positioning', 'Customer Acquisition']
  },
  {
    icon: Lightbulb,
    title: 'Product & Innovation',
    items: ['Product Development', 'R&D', 'Packaging Innovation', 'New Product Launches', 'Portfolio Management']
  },
  {
    icon: Factory,
    title: 'Operations & Supply Chain',
    items: ['Manufacturing', 'Procurement', 'Supply Chain Optimization', 'Inventory Management', 'Quality Systems']
  },
  {
    icon: CircleDollarSign,
    title: 'Finance & Commercial Excellence',
    items: ['Financial Planning', 'Fundraising Readiness', 'Profitability Improvement', 'Commercial Strategy', 'Business Analytics']
  },
  {
    icon: UsersRound,
    title: 'People & Leadership',
    items: ['Organizational Design', 'Leadership Development', 'Talent Acquisition', 'Performance Management']
  },
  {
    icon: Bot,
    title: 'Technology & AI',
    items: ['AI Transformation', 'Digital Commerce', 'Data Analytics', 'Automation', 'Technology Strategy']
  }
]

const idealExperts = [
  'Former CXOs and Business Heads',
  'Functional Leaders with 15+ Years Experience',
  'Industry Consultants and Advisors',
  'Entrepreneurs with Successful Scale-Up Experience',
  'Domain Specialists with Proven Track Records',
  'Experts Passionate About Mentoring and Building Emerging Brands'
]

const benefits = [
  {
    icon: BriefcaseBusiness,
    title: 'Work With High-Growth Brands',
    description: 'Collaborate with ambitious founders and emerging consumer brands looking to scale faster and smarter.'
  },
  {
    icon: Handshake,
    title: 'Flexible Consulting Opportunities',
    description: 'Choose projects aligned with your expertise, availability, and interests.'
  },
  {
    icon: Sparkles,
    title: 'Build Your Thought Leadership',
    description: 'Create content, conduct masterclasses, join industry discussions, and strengthen your personal brand.'
  },
  {
    icon: CircleDollarSign,
    title: 'Monetize Your Expertise',
    description: 'Earn through strategic consulting engagements, advisory roles, workshops, and executive mentoring.'
  },
  {
    icon: Globe2,
    title: 'Collaborate With Top Experts',
    description: 'Become part of an elite network of accomplished leaders across multiple CPG functions.'
  },
  {
    icon: ShieldCheck,
    title: 'Create Lasting Impact',
    description: 'Help shape the next generation of successful consumer brands.'
  }
]

const magnaficDifference = [
  {
    title: 'Conscious Strategy',
    description: 'Deep business wisdom from experienced leaders.'
  },
  {
    title: 'AI-Powered Execution',
    description: 'Modern technology and intelligence tools that help brands move faster.'
  },
  {
    title: 'On-Demand Fractional Expertise',
    description: 'Access to the right CXOs and specialists at the right stage of growth.'
  }
]

export default function JoinExpertsHub() {
  const [isApplicationOpen, setIsApplicationOpen] = useState(false)

  return (
    <div className="bg-white pt-16">
      <section className="relative isolate min-h-[calc(100vh-4rem)] overflow-hidden bg-[#000047]">
        <img
          src="/Magna-globe.jpg"
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-45"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,71,0.96)_0%,rgba(0,0,71,0.82)_46%,rgba(0,0,71,0.54)_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.045)_1px,transparent_1px)] bg-[size:64px_64px]" />

        <div className="relative mx-auto flex min-h-[calc(100vh-4rem)] max-w-7xl flex-col justify-center px-4 py-16 sm:px-6 lg:px-8">
          <div className="max-w-4xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-cyan/40 bg-white/10 px-4 py-2 text-sm font-bold uppercase tracking-wide text-cyan-100 backdrop-blur">
              <Sparkles className="h-4 w-4" />
              Magnafic Expert Community
            </div>
            <h1 className="text-4xl font-extrabold leading-tight text-white sm:text-5xl lg:text-6xl">
              Join the Top 1% Expert Club
            </h1>
            <p className="mt-5 max-w-3xl text-2xl font-semibold text-cyan-100 sm:text-3xl">
              Shape the Future of Consumer Brands with Magnafic
            </p>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-white/80 sm:text-xl">
              At Magnafic, we believe the most valuable expertise is built through years of real business execution. The Top 1% Club brings accomplished CPG leaders together to help emerging and growth-stage brands accelerate their journey.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => setIsApplicationOpen(true)}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-7 py-4 text-base font-extrabold text-primary-700 shadow-glow-cyan transition hover:-translate-y-0.5 hover:bg-cyan-50"
              >
                Apply
                <ArrowRight className="h-5 w-5" />
              </button>
              <a
                href="#who-can-join"
                className="inline-flex items-center justify-center rounded-lg border border-white/30 bg-white/10 px-7 py-4 text-base font-extrabold text-white backdrop-blur transition hover:bg-white/20"
              >
                Explore Criteria
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
              Exceptional CPG wisdom should keep building the industry.
            </h2>
          </div>
          <div className="space-y-5 text-lg leading-8 text-gray-600">
            <p>
              The consumer products industry is filled with leaders who have scaled brands, built distribution networks, driven innovation, transformed operations, created winning marketing strategies, and delivered profitable growth.
            </p>
            <p>
              Yet much of this knowledge remains underutilized after a certain stage in their careers. Magnafic converts that hard-earned expertise into real momentum for ambitious brands.
            </p>
          </div>
        </div>
      </section>

      <section id="who-can-join" className="bg-gray-50 px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 max-w-3xl">
            <div className="mb-3 text-sm font-extrabold uppercase tracking-wide text-primary-600">Who Can Join?</div>
            <h2 className="text-3xl font-extrabold text-[#000047] sm:text-4xl">
              Experienced professionals with deep consumer-products expertise.
            </h2>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {expertiseDomains.map((domain) => (
              <article key={domain.title} className="rounded-lg border border-gray-200 bg-white p-5 shadow-lg shadow-primary-900/5">
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-lg bg-primary-50">
                  <domain.icon className="h-6 w-6 text-primary-600" />
                </div>
                <h3 className="mb-4 text-lg font-extrabold text-gray-950">{domain.title}</h3>
                <ul className="space-y-2">
                  {domain.items.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm font-semibold leading-6 text-gray-600">
                      <CheckCircle2 className="mt-1 h-4 w-4 flex-shrink-0 text-primary-500" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
          <div>
            <div className="mb-3 text-sm font-extrabold uppercase tracking-wide text-primary-600">Who We Are Looking For</div>
            <h2 className="text-3xl font-extrabold text-[#000047] sm:text-4xl">
              A selective club for operators, advisors, builders, and mentors.
            </h2>
            <p className="mt-5 text-lg leading-8 text-gray-600">
              The Magnafic Top 1% CXO Club is designed for leaders who have achieved meaningful business success and want to help founders build with sharper judgment.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {idealExperts.map((expert) => (
              <div key={expert} className="flex items-start gap-3 rounded-lg border border-primary-100 bg-primary-50/70 p-4">
                <CheckCircle2 className="mt-1 h-5 w-5 flex-shrink-0 text-primary-600" />
                <span className="font-bold leading-6 text-gray-800">{expert}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#000047] px-4 py-16 text-white sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 max-w-3xl">
            <div className="mb-3 text-sm font-extrabold uppercase tracking-wide text-cyan-100">Why Join Magnafic?</div>
            <h2 className="text-3xl font-extrabold sm:text-4xl">
              Turn your expertise into flexible, high-impact work.
            </h2>
          </div>

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {benefits.map((benefit) => (
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
            <div className="mb-3 text-sm font-extrabold uppercase tracking-wide text-primary-600">What Makes Magnafic Different?</div>
            <h2 className="text-3xl font-extrabold text-[#000047] sm:text-4xl">
              Expertise meets execution.
            </h2>
          </div>

          <div className="grid gap-5 lg:grid-cols-3">
            {magnaficDifference.map((item, index) => (
              <article key={item.title} className="rounded-lg border border-gray-200 bg-white p-6 shadow-lg shadow-primary-900/5">
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-primary text-xl font-extrabold text-white">
                  {String(index + 1).padStart(2, '0')}
                </div>
                <h3 className="mb-3 text-xl font-extrabold text-gray-950">{item.title}</h3>
                <p className="text-lg leading-8 text-gray-600">{item.description}</p>
              </article>
            ))}
          </div>

          <p className="mt-8 max-w-4xl text-xl font-semibold leading-9 text-gray-800">
            Together, this creates a powerful ecosystem where conscious strategy, AI-powered execution, and fractional expertise help brands move with greater speed and confidence.
          </p>
        </div>
      </section>

      <section className="bg-gray-50 px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <div className="mb-3 text-sm font-extrabold uppercase tracking-wide text-primary-600">The Top 1% Promise</div>
            <h2 className="text-3xl font-extrabold text-[#000047] sm:text-4xl">
              Membership is highly selective.
            </h2>
          </div>
          <div className="space-y-5 text-lg leading-8 text-gray-600">
            <p>
              We seek leaders who have not only achieved business success but are willing to share their knowledge, mentor founders, and contribute to building the future of consumer products.
            </p>
            <div className="grid gap-3 sm:grid-cols-3">
              {['This is not a directory.', 'This is not a networking group.', 'This is a curated community.'].map((line) => (
                <div key={line} className="rounded-lg border border-gray-200 bg-white p-4 text-center font-extrabold text-[#000047] shadow-sm">
                  {line}
                </div>
              ))}
            </div>
            <p>
              It is a curated community of elite operators, consultants, advisors, and industry leaders committed to creating meaningful business impact.
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
              Join the Magnafic Top 1% Club
            </h2>
            <p className="mx-auto mt-5 max-w-3xl text-lg leading-8 text-white/80">
              If you have spent years building brands, scaling businesses, driving growth, or transforming organizations within the CPG ecosystem, your experience can help shape the next generation of industry success stories.
            </p>
            <button
              type="button"
              onClick={() => setIsApplicationOpen(true)}
              className="mt-8 inline-flex items-center justify-center gap-2 rounded-lg bg-white px-8 py-4 text-base font-extrabold uppercase tracking-wide text-primary-700 transition hover:-translate-y-0.5 hover:bg-cyan-50"
            >
              Apply
              <ArrowRight className="h-5 w-5" />
            </button>
            <div className="mt-8 flex items-center justify-center gap-3 text-sm font-bold uppercase tracking-wide text-cyan-100">
              <Boxes className="h-5 w-5" />
              Magnafic - Where Top 1% Expertise Meets Growth.
            </div>
          </div>
        </div>
      </section>

      <CommunityApplicationModal
        open={isApplicationOpen}
        onClose={() => setIsApplicationOpen(false)}
        clubName="Magnafic Top 1% Expert Club"
        reasonLabel="Why do you want to join the Expert Club?"
      />
    </div>
  )
}
