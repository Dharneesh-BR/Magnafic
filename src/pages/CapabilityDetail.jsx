import { useEffect, useState, useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowRight, ChevronDown, FileText, Lightbulb, User } from 'lucide-react'
import { mentorClient } from '../lib/sanityClient'
import SEO from '../components/SEO'
import { absoluteUrl } from '../lib/seo'
import MagnaLoader from '../components/MagnaLoader'
import DescribeProblemCTA from '../components/DescribeProblemCTA'
import CopilotPromptPanel from '../components/CopilotPromptPanel'
import InsightMeta from '../components/InsightMeta'

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

function renderTextParagraphs(text = '') {
  if (typeof text !== 'string') return []

  return text
    .split(/\n{2,}/)
    .map(paragraph => paragraph.trim())
    .filter(Boolean)
}

export default function CapabilityDetail() {
  const { id } = useParams()
  const [capability, setCapability] = useState(null)
  const [mentors, setMentors] = useState([])
  const [services, setServices] = useState([])
  const [insights, setInsights] = useState([])
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
          },
          orderedExperts[]->{
            _id,
            "slug": slug.current,
            fullName,
            "imageUrl": profileImage.asset->url,
            headline,
            currentDesignation,
            location,
            designation,
            city,
            totalYearsOfExperience
          }
        }`

        const data = await mentorClient.fetch(query, { id })
        setCapability(data)

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
          const insightsQuery = `*[_type == "blog" && status != "archived" && capability._ref == $capabilityId] | order(featured desc, publishedAt desc) {
            _id,
            title,
            "slug": slug.current,
            type,
            category,
            publishedAt,
            readTime,
            "imageUrl": mainImage.asset->url
          }`
          const insightsData = await mentorClient.fetch(insightsQuery, { capabilityId: data._id })

          setServices(servicesData || [])
          setInsights(insightsData || [])
          setMentors((data.orderedExperts || []).filter(Boolean))
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
  const useCaseParagraphs = useMemo(() => renderTextParagraphs(capability?.useCases || ''), [capability?.useCases])
  const useCasesSection = capability?.useCases || (capability?.useCasesList && capability.useCasesList.length > 0) ? (
    <section className="bg-[#000047] px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-center justify-center gap-3">
          <h2 className="text-2xl font-bold text-center text-white sm:text-3xl">Use Cases</h2>
        </div>

        {capability.useCases && (
          <div className="mb-8 space-y-5 rounded-3xl bg-white/10 p-6 shadow-xl backdrop-blur-sm">
            {useCaseParagraphs.map((paragraph) => (
              <p key={paragraph} className="text-lg leading-8 text-white">{paragraph}</p>
            ))}
          </div>
        )}

        {capability.useCasesList && capability.useCasesList.length > 0 && (
          <div className="flex flex-wrap items-start justify-center gap-6">
            {capability.useCasesList.map((useCase, index) => (
              <div
                key={index}
                onMouseEnter={() => setOpenUseCase(index)}
                onMouseLeave={() => setOpenUseCase(null)}
                onFocus={() => setOpenUseCase(index)}
                onBlur={() => setOpenUseCase(null)}
                className="group relative w-full overflow-hidden rounded-3xl bg-white shadow-xl shadow-primary-950/10 ring-1 ring-white/20 transition duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-cyan-500/10 sm:w-[calc(50%_-_0.75rem)] lg:w-[calc(33.333333%_-_1rem)]"
              >
                <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-cyan-300 via-white to-primary-400"></div>
                <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-cyan-100/80 transition duration-300 group-hover:scale-110"></div>
                <div className="absolute bottom-0 left-0 h-20 w-20 rounded-tr-full bg-primary-50"></div>

                <div className="relative flex min-h-32 w-full items-start justify-between gap-4 p-6 text-left" tabIndex={0}>
                  <div>
                    <h3 className="flex items-center gap-3 text-base font-bold leading-tight text-gray-950 transition group-hover:text-primary-600 sm:text-xl">
                      <span className="h-3 w-3 shrink-0 rounded-full bg-primary-600 transition group-hover:bg-cyan-500"></span>
                      <span>{useCase.title}</span>
                    </h3>
                  </div>
                  <span className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-50 text-primary-600 transition group-hover:bg-primary-600 group-hover:text-white">
                    <ChevronDown className={`h-5 w-5 transition-transform duration-300 ${openUseCase === index ? 'rotate-180' : ''}`} />
                  </span>
                </div>
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
  ) : null

  const relatedInsightsSection = insights.length > 0 ? (
    <section className="px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-3 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-primary-600">Related Insights</p>
            <h2 className="mt-2 text-2xl font-bold text-gray-950 sm:text-3xl">
              Insights for {capability.title}
            </h2>
          </div>
          <Link
            to="/insights"
            className="inline-flex items-center justify-center rounded-full bg-primary-50 px-5 py-2.5 text-sm font-bold text-primary-700 transition hover:bg-primary-100"
          >
            View all insights
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {insights.map((insight) => (
            <Link
              key={insight._id}
              to={`/insights/${insight.slug || insight._id}`}
              className="group overflow-hidden rounded-2xl bg-white shadow-lg transition hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="flex h-48 items-center justify-center bg-gradient-to-br from-primary-700 to-cyan-500">
                {insight.imageUrl ? (
                  <img
                    src={insight.imageUrl}
                    alt={insight.title}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                ) : (
                  <FileText className="h-16 w-16 text-white/80" />
                )}
              </div>
              <div className="p-6">
                <InsightMeta item={insight} className="mb-3" />
                <h3 className="text-xl font-semibold text-gray-900 transition group-hover:text-primary-600">
                  {insight.title}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  ) : null

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
              <Link
                to="/describe-your-problem"
                className="mt-8 inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full bg-white px-6 py-3 font-bold text-primary-700 shadow-xl shadow-primary-950/20 transition hover:-translate-y-0.5 hover:bg-cyan-50"
              >
                Describe your problem
                <ArrowRight className="h-5 w-5" />
              </Link>
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

            <div className="expert-scroller overflow-x-auto pb-7">
              <div className="flex snap-x snap-mandatory gap-4">
              {mentors.map((mentor) => (
                <Link
                  key={mentor._id}
                  to={`/experts/${mentor.slug || mentor._id}`}
                  className="group relative flex h-[22rem] w-[17rem] shrink-0 snap-start flex-col overflow-hidden rounded-3xl bg-white shadow-xl shadow-primary-900/5 ring-1 ring-gray-100 transition hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary-900/10 sm:h-[23rem] sm:w-[18rem] lg:w-[calc((100%_-_4rem)/5)]"
                >
                  <div className="relative h-24 overflow-visible bg-gradient-to-br from-primary-900 via-primary-700 to-cyan-500 sm:h-28">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_20%,rgba(255,255,255,0.22),transparent_30%)]"></div>
                    <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(0,255,255,0.18),transparent_45%,rgba(255,255,255,0.16))]"></div>
                    <img
                      src="/favicon.png"
                      alt=""
                      aria-hidden="true"
                      className="absolute right-3 top-3 h-8 w-8 p-1"
                    />
                    {mentor.imageUrl ? (
                      <img
                        src={mentor.imageUrl}
                        alt={mentor.fullName}
                        className="absolute left-1/2 bottom-4 h-24 w-24 -translate-x-1/2 translate-y-1/2 rounded-full border-4 border-white bg-white object-cover shadow-xl shadow-primary-900/20 transition duration-300 group-hover:scale-105 sm:h-28 sm:w-28"
                      />
                    ) : (
                      <div className="absolute left-1/2 bottom-4 flex h-24 w-24 -translate-x-1/2 translate-y-1/2 items-center justify-center rounded-full border-4 border-white bg-primary-100 shadow-xl shadow-primary-900/20 sm:h-28 sm:w-28">
                        <User className="h-10 w-10 text-primary-600" />
                      </div>
                    )}
                  </div>

                  <div className="flex flex-1 flex-col p-4 pt-14 pb-6 text-center sm:p-4 sm:pt-16">
                    <h3 className="line-clamp-2 min-h-[2.75rem] text-lg font-bold leading-tight text-gray-950">{mentor.fullName}</h3>
                    {(mentor.headline || mentor.currentDesignation || mentor.designation) && (
                      <p className="mt-0 line-clamp-3 min-h-[3.35rem] text-[12px] font-medium leading-[18px] text-primary-600">{mentor.headline || mentor.currentDesignation || mentor.designation}</p>
                    )}
                    {!(mentor.headline || mentor.currentDesignation || mentor.designation) && (
                      <span className="mt-0.5 block min-h-[3.35rem]" aria-hidden="true"></span>
                    )}
                    {mentor.totalYearsOfExperience ? (
                      <p className="mt-2 line-clamp-1 min-h-[1rem] text-xs font-bold text-primary-700">
                        {mentor.totalYearsOfExperience}+ years experience
                      </p>
                    ) : (
                      <span className="mt-2 block min-h-[1rem]" aria-hidden="true"></span>
                    )}
                    {(mentor.location || mentor.city) && (
                      <p className="mt-2 mb-3 line-clamp-1 min-h-[1rem] text-xs font-bold text-primary-700">{mentor.location || mentor.city}</p>
                    )}
                    {!(mentor.location || mentor.city) && (
                      <span className="mt-2 mb-3 block min-h-[1rem]" aria-hidden="true"></span>
                    )}
                    <span className="mx-auto mt-auto inline-flex items-center justify-center rounded-full bg-[#000047] px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-primary-900/20 transition group-hover:bg-primary-600 group-hover:shadow-primary-600/30">
                      View Profile
                      <ArrowRight className="ml-2 h-4 w-4 transition group-hover:translate-x-0.5" />
                    </span>
                  </div>
                  <div className="absolute inset-x-0 bottom-0 h-1.5 bg-gradient-to-r from-primary-600 to-cyan-400"></div>
                </Link>
              ))}
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="relative overflow-hidden bg-[#000047] px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,255,255,0.1),transparent_42%)]" />
        <div className="relative mx-auto max-w-3xl">
          <CopilotPromptPanel />
        </div>
      </section>

      {/* Use Cases Section */}
      {useCasesSection}

      {/* Related Insights Section */}
      {relatedInsightsSection}

      <DescribeProblemCTA />
    </div>
  )
}
