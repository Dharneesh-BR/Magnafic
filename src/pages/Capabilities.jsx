import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react'
import { mentorClient } from '../lib/sanityClient'
import MagnaLoader from '../components/MagnaLoader'

export default function Capabilities() {
  const [capabilities, setCapabilities] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCapabilities = async () => {
      try {
        const query = `*[_type == "capabilities"] | order(title asc) {
          _id,
          "slug": slug.current,
          title,
          subtitle,
          aboutCapabilities,
          useCases,
          useCasesList[]{
            title,
            description
          }
        }`

        const data = await mentorClient.fetch(query)
        setCapabilities(data || [])
      } catch (error) {
        console.error('Error fetching capabilities:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCapabilities()
  }, [])

  return (
    <div className="min-h-screen bg-[#f7f9ff]">
      <section className="relative overflow-hidden bg-primary-900 px-4 pt-24 pb-20 text-white sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(0,255,255,0.18),transparent_30%),radial-gradient(circle_at_82%_12%,rgba(255,255,255,0.12),transparent_26%)]"></div>
        <div className="relative mx-auto max-w-7xl">
          <div className="grid gap-10 lg:grid-cols-[1fr_380px] lg:items-end">
            <div>
              <span className="mb-5 inline-flex items-center rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-cyan-100 ring-1 ring-white/15">
                <Sparkles className="mr-2 h-4 w-4" />
                Our Capabilities
              </span>
              <h1 className="max-w-4xl text-3xl font-bold leading-tight sm:text-4xl md:text-6xl">
                Expert Capabilities
              </h1>
              <p className="mt-5 max-w-3xl text-base leading-7 text-gray-200 md:text-xl md:leading-8">
                Discover our comprehensive range of capabilities designed to help your business transform and grow.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 pb-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          {loading ? (
            <MagnaLoader message="Loading capabilities..." />
          ) : capabilities.length === 0 ? (
            <div className="rounded-3xl bg-white p-8 text-center shadow-xl shadow-primary-900/5 sm:p-12">
              <Sparkles className="mx-auto mb-4 h-12 w-12 text-primary-500" />
              <h2 className="mb-2 text-2xl font-semibold text-gray-900">No capabilities found</h2>
              <p className="text-gray-600">Check back later for new capabilities.</p>
            </div>
          ) : (
            <div className="grid gap-7 md:grid-cols-2 lg:grid-cols-3">
              {capabilities.map((capability) => (
                <article key={capability._id} className="group flex h-full flex-col overflow-hidden rounded-[1.5rem] bg-white shadow-xl shadow-primary-900/5 ring-1 ring-gray-100 transition hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary-900/10">
                  <div className="relative flex h-32 items-center justify-center overflow-hidden bg-gradient-to-br from-primary-900 via-primary-700 to-cyan-500">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_20%,rgba(255,255,255,0.22),transparent_30%)]"></div>
                    <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-white/20 backdrop-blur">
                      <Sparkles className="h-8 w-8 text-white" />
                    </div>
                  </div>

                  <div className="flex flex-1 flex-col p-5 sm:p-6">
                    <h3 className="text-xl font-bold text-gray-950 sm:text-2xl">{capability.title}</h3>
                    {capability.subtitle && (
                      <p className="mt-1 font-semibold text-primary-600">{capability.subtitle}</p>
                    )}

                    {capability.useCases && (
                      <p className="mt-5 line-clamp-3 min-h-[4.5rem] text-sm leading-6 text-gray-600">
                        {capability.useCases}
                      </p>
                    )}

                    {capability.useCasesList?.length ? (
                      <div className="mt-5 space-y-2">
                        {capability.useCasesList.slice(0, 3).map((useCase, index) => (
                          <div key={index} className="flex items-start gap-2 text-sm text-gray-600">
                            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary-500" />
                            <span className="line-clamp-1">{useCase.title}</span>
                          </div>
                        ))}
                      </div>
                    ) : null}

                    <Link
                      to={`/capabilities/${capability.slug || capability._id}`}
                      className="mt-auto inline-flex w-full items-center justify-center rounded-xl bg-primary-600 px-5 py-3 font-semibold text-white shadow-lg shadow-primary-600/20 transition hover:bg-primary-700"
                    >
                      View Details
                      <ArrowRight className="ml-2 h-4 w-4 transition group-hover:translate-x-1" />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
