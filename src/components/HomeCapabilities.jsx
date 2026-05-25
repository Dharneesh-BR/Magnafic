import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { mentorClient } from '../lib/sanityClient'

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
        <div className="mx-auto max-w-7xl rounded-3xl bg-white p-8 text-center shadow-xl shadow-primary-900/5">
          <div className="inline-block h-10 w-10 animate-spin rounded-full border-b-2 border-primary-600"></div>
          <p className="mt-4 text-gray-600">Loading capabilities...</p>
        </div>
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

        <div className="grid gap-7 md:grid-cols-2 lg:grid-cols-3">
          {capabilities.map((capability) => (
            <article key={capability._id} className="group relative flex min-h-[11rem] flex-col overflow-hidden rounded-3xl bg-gradient-to-br from-magna-m via-blue-500 to-cyan-500 p-4 pb-6 text-white shadow-2xl shadow-primary-900/20 transition hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary-900/25 sm:min-h-[22rem] sm:p-8 sm:pb-10">
              <div>
                <h3 className="text-xl font-extrabold leading-tight sm:text-4xl">{capability.title}</h3>
                {capability.subtitle && (
                  <p className="mt-3 line-clamp-2 text-sm font-medium leading-5 text-white sm:mt-5 sm:line-clamp-none sm:text-xl sm:leading-8">{capability.subtitle}</p>
                )}
              </div>

              <Link
                to={`/capabilities/${capability.slug || capability._id}`}
                className="mt-auto inline-flex w-fit max-w-full items-center text-sm font-extrabold leading-tight text-white underline decoration-white decoration-2 underline-offset-4 transition group-hover:translate-x-1 sm:text-xl"
              >
                Explore {capability.title}
                <ArrowRight className="ml-2 h-4 w-4 transition group-hover:translate-x-1 sm:h-5 sm:w-5" />
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
