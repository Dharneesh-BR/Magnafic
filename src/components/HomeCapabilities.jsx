import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { mentorClient } from '../lib/sanityClient'
import MagnaLoader from './MagnaLoader'

export default function HomeCapabilities() {
  const [capabilities, setCapabilities] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCapabilities = async () => {
      try {
        const query = `*[_type == "capabilities"] | order(title asc) {
          _id,
          "slug": slug.current,
          title,
          subtitle
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
          {capabilities.map((capability) => (
            <Link
              key={capability._id}
              to={`/capabilities/${capability.slug || capability._id}`}
              className="group relative flex min-h-[9rem] flex-col overflow-hidden rounded-2xl bg-gradient-to-br from-magna-m via-blue-500 to-cyan-500 p-4 text-white shadow-xl shadow-primary-900/15 transition hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary-900/20 sm:min-h-[14rem] sm:p-6"
            >
              <div>
                <h3 className="text-lg font-extrabold leading-tight sm:text-2xl">{capability.title}</h3>
                {capability.subtitle && (
                  <p className="mt-2 line-clamp-2 text-sm font-medium leading-5 text-white sm:mt-3 sm:text-base sm:leading-6">{capability.subtitle}</p>
                )}
              </div>

              <span className="mt-auto inline-flex w-fit max-w-full items-center text-sm font-extrabold leading-tight text-white underline decoration-white decoration-2 underline-offset-4 transition group-hover:translate-x-1 sm:text-base">
                Explore 
                <ArrowRight className="ml-2 h-4 w-4 transition group-hover:translate-x-1" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
