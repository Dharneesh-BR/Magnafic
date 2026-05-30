import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, BarChart3, BrainCircuit, BriefcaseBusiness, Network, ShoppingBag, Sparkles, Target, TrendingUp } from 'lucide-react'
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
    <section className="bg-[#f7f9ff] px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-extrabold leading-tight text-blue-900 sm:text-4xl">
            Explore our expert capabilities
          </h2>
        </div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {capabilities.map((capability, index) => {
            const Icon = capabilityIcons[capability.icon] || capabilityIcons.sparkles

            return (
              <Link
                key={capability._id}
                to={`/capabilities/${capability.slug || capability._id}`}
                className="group relative flex min-h-[9.75rem] flex-col overflow-hidden rounded-2xl bg-gradient-to-br from-magna-m via-blue-500 to-cyan-500 p-4 text-white shadow-xl shadow-primary-900/15 ring-1 ring-white/20 transition hover:-translate-y-1 hover:shadow-2xl hover:shadow-cyan-500/25 sm:min-h-[14rem] sm:p-6"
              >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(255,255,255,0.22),transparent_28%),linear-gradient(135deg,rgba(255,255,255,0.18),transparent_42%)] opacity-80"></div>
                <div className="absolute -right-9 -bottom-9 h-28 w-28 rounded-full border-2 border-white/35 transition duration-300 group-hover:scale-110 group-hover:border-white/60 sm:h-36 sm:w-36"></div>
                <div className="absolute -right-2 bottom-4 h-14 w-14 rounded-full border-2 border-cyan-100/70 transition duration-300 group-hover:translate-x-1 sm:h-20 sm:w-20"></div>

                <div className="relative flex items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/18 shadow-lg shadow-primary-950/15 ring-1 ring-white/30 backdrop-blur-sm sm:h-12 sm:w-12">
                    <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
                  </span>
                  <div>
                    <h3 className="text-base font-extrabold leading-tight sm:text-2xl">
                      <span className="mr-1">{index + 1}.</span>
                      {capability.title}
                    </h3>
                    {capability.subtitle && (
                      <p className="mt-2 line-clamp-2 text-xs font-medium leading-5 text-white/90 sm:mt-3 sm:text-base sm:leading-6">{capability.subtitle}</p>
                    )}
                  </div>
                </div>

                <span className="relative mt-auto inline-flex w-fit max-w-full items-center text-sm font-extrabold leading-tight text-white underline decoration-white decoration-2 underline-offset-4 transition group-hover:translate-x-1 sm:text-base">
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
