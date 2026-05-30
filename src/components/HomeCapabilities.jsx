import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, BarChart3, Bot, BrainCircuit, BriefcaseBusiness, Globe2, Lightbulb, Network, ShoppingBag, ShoppingCart, Sparkles, Target, TrendingUp, User } from 'lucide-react'
import { mentorClient } from '../lib/sanityClient'
import MagnaLoader from './MagnaLoader'

const capabilityIcons = {
  sparkles: Sparkles,
  'trending-up': TrendingUp,
  target: Target,
  'brain-circuit': BrainCircuit,
  'shopping-bag': ShoppingBag,
  network: Network,
  briefcase: BriefcaseBusiness,
  'bar-chart': BarChart3,
  'shopping-cart': ShoppingCart,
  lightbulb: Lightbulb,
  globe: Globe2,
  user: User,
  bot: Bot,
}

export default function HomeCapabilities() {
  const [capabilities, setCapabilities] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCapabilities = async () => {
      try {
        const query = `*[_type == "capabilities"] | order(coalesce(displayOrder, 9999) asc, title asc) {
          _id,
          "slug": slug.current,
          title,
          subtitle,
          icon
        }`

        const data = await mentorClient.fetch(query)
        setCapabilities(data || [])
      } catch (error) {
        console.error('Error fetching home capabilities:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCapabilities()
  }, [])

  if (loading) {
    return (
      <section className="bg-[#f7f9ff] px-4 py-14 sm:px-6 lg:px-8">
        <MagnaLoader message="Loading capabilities..." className="mx-auto max-w-3xl" />
      </section>
    )
  }

  if (capabilities.length === 0) return null

  return (
    <section className="relative overflow-hidden bg-[#f7f9ff] px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300 to-transparent"></div>
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-primary-200 to-transparent"></div>

      <div className="relative mx-auto max-w-7xl">
        <div className="mb-10 flex flex-col gap-5 md:mb-12 md:flex-row md:items-end md:justify-between">
          <div className="max-w-3xl">
            <h2 className="mb-2 text-center text-3xl font-extrabold leading-tight text-blue-900 sm:text-left sm:text-4xl">
              Explore Expert Capabilities
            </h2>
          </div>

          
        </div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {capabilities.map((capability) => {
            const Icon = capabilityIcons[capability.icon] || capabilityIcons.sparkles

            return (
              <Link
                key={capability._id}
                to={`/capabilities/${capability.slug || capability._id}`}
                className="group relative flex min-h-[10.5rem] flex-col overflow-hidden rounded-2xl bg-gradient-to-br from-magna-m via-blue-500 to-cyan-500 p-5 text-white shadow-xl shadow-primary-900/15 ring-1 ring-white/25 transition duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-cyan-500/25 focus:outline-none focus-visible:ring-4 focus-visible:ring-cyan-300/70 sm:min-h-[14.5rem] sm:p-6"
              >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(255,255,255,0.24),transparent_28%),linear-gradient(135deg,rgba(255,255,255,0.2),transparent_42%)] opacity-85"></div>
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-white/80 via-cyan-200 to-white/20"></div>
                <div className="absolute -right-10 -bottom-10 h-32 w-32 rounded-full border-2 border-white/35 transition duration-300 group-hover:scale-110 group-hover:border-white/60 sm:h-40 sm:w-40"></div>
                <div className="absolute right-4 bottom-4 h-16 w-16 rounded-full border-2 border-cyan-100/70 transition duration-300 group-hover:translate-x-1 group-hover:scale-105 sm:right-6 sm:bottom-6 sm:h-20 sm:w-20"></div>
                <span className="absolute bottom-7 right-7 z-10 flex h-10 w-10 items-center justify-center text-white drop-shadow-[0_4px_10px_rgba(0,0,71,0.35)] transition group-hover:scale-110 sm:bottom-10 sm:right-10 sm:h-12 sm:w-12">
                  <Icon className="h-7 w-7 sm:h-8 sm:w-8" />
                </span>

                <div className="relative pr-12 sm:pr-16">
                  <h3 className="max-w-[18rem] text-lg font-extrabold leading-tight sm:text-2xl">
                    {capability.title}
                  </h3>
                  {capability.subtitle && (
                    <p className="mt-3 line-clamp-2 max-w-[21rem] text-sm font-semibold leading-5 text-white/90 sm:text-base sm:leading-6">{capability.subtitle}</p>
                  )}
                </div>

                <span className="relative mt-auto inline-flex w-fit max-w-full items-center rounded-full bg-[#000047] px-4 py-2 text-sm font-extrabold leading-tight text-white shadow-lg shadow-primary-950/20 ring-1 ring-white/20 transition group-hover:translate-x-1 group-hover:bg-primary-700 sm:text-base">
                  Explore
                  <ArrowRight className="ml-2 h-4 w-4 transition group-hover:translate-x-1" />
                </span>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
