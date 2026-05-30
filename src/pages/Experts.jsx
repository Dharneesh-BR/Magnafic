import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, Filter, MapPin, ArrowRight, Briefcase } from 'lucide-react'
import { mentorClient } from '../lib/sanityClient'
import { getExpertImage } from '../lib/expertImages'
import MagnaLoader from '../components/MagnaLoader'

export default function Experts() {
  const [experts, setExperts] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    const fetchExperts = async () => {
      try {
        const query = `*[_type == "mentor"] | order(fullName asc) {
          _id,
          fullName,
          "slug": slug.current,
          "imageUrl": profileImage.asset->url,
          headline,
          currentDesignation,
          location,
          designation,
          city
        }`

        const data = await mentorClient.fetch(query)
        setExperts(data || [])
      } catch (error) {
        console.error('Error fetching experts:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchExperts()
  }, [])

  const filteredExperts = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()

    if (!term) return experts

    return experts.filter(expert => {
      const searchable = [
        expert.fullName,
        expert.headline,
        expert.currentDesignation,
        expert.designation,
        expert.location,
        expert.city,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()

      return searchable.includes(term)
    })
  }, [experts, searchTerm])

  return (
    <div className="min-h-screen bg-[#f7f9ff]">
      <section className="relative overflow-hidden bg-primary-900 px-4 pt-24 pb-20 text-white sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(0,255,255,0.18),transparent_30%),radial-gradient(circle_at_82%_12%,rgba(255,255,255,0.12),transparent_26%)]"></div>
        <div className="relative mx-auto max-w-7xl">
          <div className="grid gap-10 lg:grid-cols-[1fr_380px] lg:items-end">
            <div>
              <h1 className="max-w-4xl text-3xl font-bold leading-tight sm:text-4xl md:text-6xl">
                Find Expert Consultants
              </h1>
              <p className="mt-5 max-w-3xl text-base leading-7 text-gray-200 md:text-xl md:leading-8">
                Connect with verified experts across strategy, growth, technology, operations, and consumer brand transformation.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 pb-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="relative z-10 -mt-10 mb-10 rounded-3xl bg-white p-4 shadow-2xl shadow-primary-900/10 ring-1 ring-gray-100 sm:p-6">
            <div className="flex flex-col gap-4 md:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-primary-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search by name, expertise, company, city, or skills..."
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50 py-4 pl-12 pr-4 text-sm text-gray-900 outline-none transition focus:border-primary-300 focus:bg-white focus:ring-4 focus:ring-primary-100 sm:text-base"
                />
              </div>
              <button className="flex items-center justify-center gap-2 rounded-2xl bg-primary-600 px-6 py-4 font-semibold text-white shadow-lg shadow-primary-600/20 transition hover:bg-primary-700">
                <Filter className="h-5 w-5" />
                Filters
              </button>
            </div>
          </div>

          {loading ? (
            <MagnaLoader message="Loading experts..." />
          ) : filteredExperts.length === 0 ? (
            <div className="rounded-3xl bg-white p-8 text-center shadow-xl shadow-primary-900/5 sm:p-12">
              <Briefcase className="mx-auto mb-4 h-12 w-12 text-primary-500" />
              <h2 className="mb-2 text-2xl font-semibold text-gray-900">No experts found</h2>
              <p className="text-gray-600">Try searching for a different name, skill, or industry.</p>
            </div>
          ) : (
            <div className="grid gap-7 md:grid-cols-2 lg:grid-cols-3">
              {filteredExperts.map((expert) => (
                <article key={expert._id} className="group flex h-full flex-col overflow-hidden rounded-[1.5rem] bg-white shadow-xl shadow-primary-900/5 ring-1 ring-gray-100 transition hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary-900/10">
                  <div className="relative flex h-52 items-center justify-center overflow-hidden bg-gradient-to-br from-primary-900 via-primary-700 to-cyan-500">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_20%,rgba(255,255,255,0.22),transparent_30%)]"></div>
                    <div className="relative h-36 w-36 overflow-hidden rounded-full border-4 border-white bg-white shadow-2xl shadow-primary-950/25">
                      {getExpertImage(expert) ? (
                        <img
                          src={getExpertImage(expert)}
                          alt={expert.fullName}
                          className="h-full w-full object-cover object-center transition duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary-600 to-cyan-500 text-4xl font-bold text-white">
                          {expert.fullName?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-1 flex-col p-5 sm:p-6">
                    <h3 className="text-xl font-bold text-gray-950 sm:text-2xl">{expert.fullName}</h3>
                    <p className="mt-1 line-clamp-2 font-semibold text-primary-600">{expert.headline || expert.currentDesignation || expert.designation || 'Expert Mentor'}</p>

                    <div className="mt-5 space-y-2 text-sm text-gray-600">
                      {(expert.location || expert.city) && (
                        <div className="flex items-center">
                          <MapPin className="mr-2 h-4 w-4 text-primary-500" />
                          {expert.location || expert.city}
                        </div>
                      )}
                    </div>

                    <Link
                      to={`/experts/${expert.slug || expert._id}`}
                      className="mt-auto inline-flex w-full items-center justify-center rounded-xl bg-primary-600 px-5 py-3 font-semibold text-white shadow-lg shadow-primary-600/20 transition hover:bg-primary-700"
                    >
                      View Profile
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
