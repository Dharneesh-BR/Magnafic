import { useEffect, useState, useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowRight, ChevronDown, Lightbulb, Sparkles, User } from 'lucide-react'
import { mentorClient } from '../lib/sanityClient'
import SEO from '../components/SEO'
import { absoluteUrl } from '../lib/seo'
import MagnaLoader from '../components/MagnaLoader'

function renderBlockText(block) {
  return block.children?.map(child => {
    if (!child.marks || child.marks.length === 0) {
      return <span key={child._key}>{child.text}</span>
    }

    let content = child.text
    // Apply marks in reverse order to handle nesting correctly
    for (let i = child.marks.length - 1; i >= 0; i--) {
      const mark = child.marks[i]
      if (mark === 'strong') {
        content = <strong key={`${child._key}-strong`}>{content}</strong>
      } else if (mark === 'em') {
        content = <em key={`${child._key}-em`}>{content}</em>
      } else if (mark === 'underline') {
        content = <u key={`${child._key}-underline`}>{content}</u>
      }
    }
    return <span key={child._key}>{content}</span>
  })
}

function renderBio(blocks = []) {
  if (!Array.isArray(blocks)) return []

  const rendered = []

  for (let index = 0; index < blocks.length; index += 1) {
    const block = blocks[index]

    if (block._type !== 'block') continue

    if (block.listItem) {
      const listType = block.listItem === 'number' ? 'ol' : 'ul'
      const items = []

      while (
        index < blocks.length &&
        blocks[index]._type === 'block' &&
        blocks[index].listItem === block.listItem
      ) {
        items.push(blocks[index])
        index += 1
      }

      index -= 1
      const ListTag = listType

      rendered.push(
        <ListTag key={block._key} className={`mb-8 ml-6 space-y-3 text-lg leading-8 text-white marker:font-bold marker:text-cyan-200 ${listType === 'ol' ? 'list-decimal' : 'list-disc'}`}>
          {items.map(item => <li key={item._key}>{renderBlockText(item)}</li>)}
        </ListTag>
      )
      continue
    }

    switch (block.style) {
      case 'h2':
        rendered.push(<h2 key={block._key} className="mt-10 mb-4 text-3xl font-bold leading-tight text-white">{renderBlockText(block)}</h2>)
        break
      case 'h3':
        rendered.push(<h3 key={block._key} className="mt-8 mb-3 text-2xl font-semibold leading-tight text-white">{renderBlockText(block)}</h3>)
        break
      case 'blockquote':
        rendered.push(
          <blockquote key={block._key} className="my-8 rounded-r-[2rem] border-l-4 border-cyan-400 bg-white/20 px-7 py-6 text-xl font-semibold italic leading-9 text-white">
            {renderBlockText(block)}
          </blockquote>
        )
        break
      default:
        rendered.push(<p key={block._key} className="mb-6 text-lg leading-9 text-white">{renderBlockText(block)}</p>)
    }
  }

  return rendered
}

export default function CapabilityDetail() {
  const { id } = useParams()
  const [capability, setCapability] = useState(null)
  const [mentors, setMentors] = useState([])
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [openUseCase, setOpenUseCase] = useState(null)

  useEffect(() => {
    const fetchCapability = async () => {
      setLoading(true)
      setError('')

      try {
        const query = `*[_type == "capabilities" && (slug.current == $id || _id == $id)][0] {
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

        const data = await mentorClient.fetch(query, { id })
        setCapability(data)

        // Fetch mentors tagged to this capability
        if (data?._id) {
          const servicesQuery = `*[_type == "services" && capability._ref == $capabilityId] | order(title asc) {
            _id,
            "slug": slug.current,
            title,
            description,
            capability->{
              title,
              "slug": slug.current
            }
          }`
          const servicesData = await mentorClient.fetch(servicesQuery, { capabilityId: data._id })
          setServices(servicesData || [])

          const mentorsQuery = `*[_type == "mentor" && (capability._ref == $capabilityId || $capabilityId in capabilities[]._ref)] {
            _id,
            "slug": slug.current,
            fullName,
            "imageUrl": profileImage.asset->url,
            designation,
            shortBio,
            rating,
            yearsOfExperience,
            city
          }`
          const mentorsData = await mentorClient.fetch(mentorsQuery, { capabilityId: data._id })
          setMentors(mentorsData || [])
        }
      } catch (fetchError) {
        console.error('Error fetching capability:', fetchError)
        setError('We could not load this capability right now.')
      } finally {
        setLoading(false)
      }
    }

    fetchCapability()
  }, [id])

  const aboutContent = useMemo(() => renderBio(capability?.aboutCapabilities), [capability?.aboutCapabilities])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f9ff] px-4 pt-32 pb-20">
        <MagnaLoader message="Loading capability..." className="mx-auto max-w-4xl" />
      </div>
    )
  }

  if (error || !capability) {
    return (
      <div className="min-h-screen bg-white px-4 pt-32 pb-20">
        <div className="mx-auto max-w-3xl text-center">
          <Lightbulb className="mx-auto mb-6 h-14 w-14 text-primary-500" />
          <h1 className="mb-4 text-3xl font-bold text-gray-950">Capability not found</h1>
          <p className="mb-8 text-gray-600">{error || 'The capability you are looking for is not available.'}</p>
          <Link to="/" className="inline-flex items-center rounded-full bg-primary-600 px-6 py-3 font-semibold text-white hover:bg-primary-700">
            Back to Home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f7f9ff]">
      <SEO
        title={`${capability.title} - Capability`}
        description={capability.subtitle || capability.useCases || ''}
        path={`/capabilities/${capability.slug || capability._id}`}
      />

      {/* Hero Section with Banner Background */}
      <section className="relative mx-auto mb-8 max-w-7xl px-4 pt-24 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-cover bg-center shadow-2xl" style={{ backgroundImage: 'url(/Magna-globe.jpg)' }}>
          <div className="absolute inset-0 bg-primary-900/70"></div>

          <div className="relative px-8 py-32 sm:px-12 sm:py-40 md:px-16 md:py-48">
            <div className="mx-auto max-w-4xl text-center">
              <h1 className="text-4xl font-bold leading-tight text-white sm:text-4xl md:text-6xl">{capability.title}</h1>
              {capability.subtitle && (
                <p className="mt-4 text-xl text-cyan-100 sm:text-xl">{capability.subtitle}</p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* About Capability Section */}
      {capability.aboutCapabilities && capability.aboutCapabilities.length > 0 ? (
        <section className="px-4 py-12 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="rounded-3xl bg-gradient-to-r from-primary-600 to-cyan-500 p-5 text-center shadow-xl sm:p-8">
              <div className="text-white text-3xl font-bold">{aboutContent}</div>
            </div>
          </div>
        </section>
      ) : null}

      {/* Services Section */}
      {services.length > 0 ? (
        <section className="px-4 py-12 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="mb-8 text-center">
              <h2 className="text-2xl font-bold text-gray-950 sm:text-3xl">Services</h2>
            </div>

            <div className="flex flex-wrap justify-center gap-5">
              {services.map((service) => (
                <Link
                  key={service._id}
                  to={`/services/${service.slug || service._id}`}
                  className="group relative flex min-h-36 w-full overflow-hidden rounded-3xl bg-white p-6 shadow-xl shadow-primary-900/5 ring-1 ring-gray-100 transition duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary-900/10 sm:w-[calc(50%_-_0.625rem)] lg:w-[calc(33.333333%_-_0.875rem)]"
                >
                  <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-primary-600 to-cyan-400"></div>
                  <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-cyan-100 opacity-60 transition group-hover:scale-110 group-hover:opacity-80"></div>

                  <div className="relative flex w-full items-start justify-between gap-4">
                    <div>
                      <h3 className="flex items-center gap-3 text-xl font-bold leading-tight text-gray-950 transition group-hover:text-primary-600">
                        <span className="h-3 w-3 shrink-0 rounded-full bg-primary-600 transition group-hover:bg-cyan-500"></span>
                        <span>{service.title}</span>
                      </h3>
                    </div>

                    <span className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-50 text-primary-600 transition group-hover:bg-primary-600 group-hover:text-white">
                      <ArrowRight className="h-5 w-5 transition group-hover:translate-x-0.5" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* Mentors Section */}
      {mentors.length > 0 && (
        <section className="px-4 py-12 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="mb-8 flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-50 text-primary-600">
                <User className="h-6 w-6" />
              </span>
              <h2 className="text-2xl font-bold text-center text-gray-950 sm:text-3xl">Explore Experts</h2>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {mentors.map((mentor) => (
                <Link
                  key={mentor._id}
                  to={`/experts/${mentor.slug || mentor._id}`}
                  className="group relative flex h-full flex-col overflow-hidden rounded-3xl bg-white shadow-xl shadow-primary-900/5 ring-1 ring-gray-100 transition hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary-900/10"
                >
                  <div className="relative h-36 overflow-visible bg-gradient-to-br from-primary-900 via-primary-700 to-cyan-500 sm:h-40">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_20%,rgba(255,255,255,0.22),transparent_30%)]"></div>
                    <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(0,255,255,0.18),transparent_45%,rgba(255,255,255,0.16))]"></div>
                    <img
                      src="/favicon.png"
                      alt=""
                      aria-hidden="true"
                      className="absolute right-4 top-4 h-14 w-14 p-1.5"
                    />
                    {mentor.imageUrl ? (
                      <img
                        src={mentor.imageUrl}
                        alt={mentor.fullName}
                        className="absolute left-1/2 bottom-6 h-36 w-36 -translate-x-1/2 translate-y-1/2 rounded-full border-4 border-white bg-white object-cover shadow-xl shadow-primary-900/20 transition duration-300 group-hover:scale-105 sm:h-40 sm:w-40"
                      />
                    ) : (
                      <div className="absolute left-1/2 bottom-6 flex h-36 w-36 -translate-x-1/2 translate-y-1/2 items-center justify-center rounded-full border-4 border-white bg-primary-100 shadow-xl shadow-primary-900/20 sm:h-40 sm:w-40">
                        <User className="h-16 w-16 text-primary-600" />
                      </div>
                    )}
                  </div>

                  <div className="flex flex-1 flex-col p-5 pt-16 pb-7 text-center sm:p-6 sm:pt-20 sm:pb-8">
                    <h3 className="text-xl font-bold text-gray-950 sm:text-2xl">{mentor.fullName}</h3>
                    {mentor.designation && (
                      <p className="mt-1 font-semibold text-primary-600">{mentor.designation}</p>
                    )}
                    {mentor.shortBio && (
                      <p className="mt-4 line-clamp-3 text-sm leading-6 text-gray-600">{mentor.shortBio}</p>
                    )}

                    <div className="mt-auto flex items-center justify-center gap-4 pt-4 text-sm text-gray-600">
                      {mentor.rating && (
                        <div className="flex items-center gap-1">
                          <span className="font-semibold text-primary-600">{mentor.rating}</span>
                          <span className="text-gray-500">★</span>
                        </div>
                      )}
                      {mentor.yearsOfExperience && (
                        <span>{mentor.yearsOfExperience} years exp.</span>
                      )}
                      {mentor.city && (
                        <span>{mentor.city}</span>
                      )}
                    </div>
                    <span className="mx-auto mt-5 inline-flex items-center justify-center rounded-full bg-[#000047] px-5 py-3 text-sm font-bold text-white shadow-lg shadow-primary-900/20 transition group-hover:bg-primary-600 group-hover:shadow-primary-600/30">
                      View Profile
                      <ArrowRight className="ml-2 h-4 w-4 transition group-hover:translate-x-0.5" />
                    </span>
                  </div>
                  <div className="absolute inset-x-0 bottom-0 h-1.5 bg-gradient-to-r from-primary-600 to-cyan-400"></div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Use Cases Section */}
      {capability.useCases || (capability.useCasesList && capability.useCasesList.length > 0) ? (
        <section className="bg-[#000047] px-4 py-12 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            {/* Section Heading */}
            <div className="mb-8 flex items-center justify-center gap-3">
              
              <h2 className="text-2xl font-bold text-center text-white sm:text-3xl">Use Cases</h2>
            </div>

            {/* Use Cases Description */}
            {capability.useCases && (
              <div className="mb-8 rounded-3xl bg-white/10 p-6 shadow-xl backdrop-blur-sm">
                <p className="text-lg leading-8 text-white">{capability.useCases}</p>
              </div>
            )}

            {/* Use Cases Cards Grid */}
            {capability.useCasesList && capability.useCasesList.length > 0 && (
              <div className="flex flex-wrap justify-center gap-6">
                {capability.useCasesList.map((useCase, index) => (
                  <div key={index} className="group relative w-full overflow-hidden rounded-3xl bg-white shadow-xl shadow-primary-950/10 ring-1 ring-white/20 transition duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-cyan-500/10 sm:w-[calc(50%_-_0.75rem)] lg:w-[calc(33.333333%_-_1rem)]">
                    <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-cyan-300 via-white to-primary-400"></div>
                    <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-cyan-100/80 transition duration-300 group-hover:scale-110"></div>
                    <div className="absolute bottom-0 left-0 h-20 w-20 rounded-tr-full bg-primary-50"></div>

                    <button
                      onClick={() => setOpenUseCase(openUseCase === index ? null : index)}
                      className="relative flex min-h-32 w-full items-start justify-between gap-4 p-6 text-left"
                    >
                      <div>
                        <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#000047] text-white shadow-lg shadow-primary-900/20 transition group-hover:bg-primary-600">
                          <Sparkles className="h-5 w-5" />
                        </span>
                        <h3 className="text-xl font-bold leading-tight text-gray-950 transition group-hover:text-primary-600">{useCase.title}</h3>
                      </div>
                      <span className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-50 text-primary-600 transition group-hover:bg-primary-600 group-hover:text-white">
                        <ChevronDown className={`h-5 w-5 transition-transform duration-300 ${openUseCase === index ? 'rotate-180' : ''}`} />
                      </span>
                    </button>
                    {openUseCase === index && useCase.description && (
                      <div className="relative px-6 pb-6">
                        <div className="border-t border-gray-100 pt-5">
                          <p className="text-base leading-7 text-gray-700">{useCase.description}</p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      ) : null}
    </div>
  )
}
