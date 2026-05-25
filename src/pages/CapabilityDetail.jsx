import { useEffect, useState, useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Sparkles, CheckCircle2, Lightbulb, User } from 'lucide-react'
import { mentorClient } from '../lib/sanityClient'
import SEO from '../components/SEO'
import { absoluteUrl } from '../lib/seo'

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
        <ListTag key={block._key} className={`mb-8 ml-6 space-y-3 text-lg leading-8 text-gray-700 marker:font-bold marker:text-primary-600 ${listType === 'ol' ? 'list-decimal' : 'list-disc'}`}>
          {items.map(item => <li key={item._key}>{renderBlockText(item)}</li>)}
        </ListTag>
      )
      continue
    }

    switch (block.style) {
      case 'h2':
        rendered.push(<h2 key={block._key} className="mt-10 mb-4 text-3xl font-bold leading-tight text-gray-950">{renderBlockText(block)}</h2>)
        break
      case 'h3':
        rendered.push(<h3 key={block._key} className="mt-8 mb-3 text-2xl font-semibold leading-tight text-gray-950">{renderBlockText(block)}</h3>)
        break
      case 'blockquote':
        rendered.push(
          <blockquote key={block._key} className="my-8 rounded-r-[2rem] border-l-4 border-cyan-400 bg-primary-50/80 px-7 py-6 text-xl font-semibold italic leading-9 text-primary-900">
            {renderBlockText(block)}
          </blockquote>
        )
        break
      default:
        rendered.push(<p key={block._key} className="mb-6 text-lg leading-9 text-gray-700">{renderBlockText(block)}</p>)
    }
  }

  return rendered
}

export default function CapabilityDetail() {
  const { id } = useParams()
  const [capability, setCapability] = useState(null)
  const [mentors, setMentors] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

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
          useCasesList
        }`

        const data = await mentorClient.fetch(query, { id })
        setCapability(data)

        // Fetch mentors tagged to this capability
        if (data?._id) {
          const mentorsQuery = `*[_type == "mentor" && capability._ref == $capabilityId] {
            _id,
            "slug": slug.current,
            fullName,
            profileImage,
            designation,
            company,
            shortBio,
            rating,
            yearsOfExperience
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
        <div className="mx-auto max-w-4xl rounded-[2rem] bg-white p-12 text-center shadow-xl shadow-primary-900/5">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-b-2 border-primary-600"></div>
          <p className="mt-4 text-gray-600">Loading capability...</p>
        </div>
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
      <section className="relative overflow-hidden px-4 pt-24 pb-20 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: 'url(/Banner.png)' }}>
          <div className="absolute inset-0 bg-primary-900/70"></div>
        </div>

        <div className="relative mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <h1 className="text-3xl font-bold leading-tight text-white sm:text-4xl md:text-6xl">{capability.title}</h1>
            {capability.subtitle && (
              <p className="mt-4 text-lg text-cyan-100 sm:text-xl">{capability.subtitle}</p>
            )}
          </div>
        </div>
      </section>

      {/* About Capability Section */}
      {capability.aboutCapabilities && capability.aboutCapabilities.length > 0 ? (
        <section className="px-4 py-12 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="rounded-3xl bg-white p-5 text-center shadow-xl shadow-primary-900/5 ring-1 ring-gray-100 sm:p-8">
              <div>{aboutContent}</div>
            </div>
          </div>
        </section>
      ) : null}

      {/* Use Cases Section with 3 Grids */}
      {capability.useCases || (capability.useCasesList && capability.useCasesList.length > 0) ? (
        <section className="sticky top-0 z-10 px-4 py-12 sm:px-6 lg:px-8 bg-[#f7f9ff]">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-[40%_30%_30%]">
              {/* First Grid: Use Cases Content */}
              {capability.useCases && (
                <div className="rounded-3xl bg-white p-6 shadow-xl shadow-primary-900/5 ring-1 ring-gray-100">
                  <div className="mb-4 flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
                      <Sparkles className="h-5 w-5" />
                    </span>
                    <h3 className="text-xl font-bold text-gray-950">Use Cases</h3>
                  </div>
                  <p className="text-lg leading-8 text-gray-700">{capability.useCases}</p>
                </div>
              )}

              {/* Second Grid: Use Cases List (Part 1) */}
              {capability.useCasesList && capability.useCasesList.length > 0 && (
                <div className="flex max-h-[500px] flex-col gap-4 overflow-y-auto pr-2 scrollbar-hide">
                  {capability.useCasesList.slice(0, Math.ceil(capability.useCasesList.length / 2)).map((useCase, index) => (
                    <div key={index} className="rounded-3xl bg-white p-5 shadow-xl shadow-primary-900/5 ring-1 ring-gray-100">
                      <span className="text-gray-700">{useCase}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Third Grid: Use Cases List (Part 2) */}
              {capability.useCasesList && capability.useCasesList.length > 0 && (
                <div className="flex max-h-[500px] flex-col gap-4 overflow-y-auto pr-2 scrollbar-hide">
                  {capability.useCasesList.slice(Math.ceil(capability.useCasesList.length / 2)).map((useCase, index) => (
                    <div key={index} className="rounded-3xl bg-white p-5 shadow-xl shadow-primary-900/5 ring-1 ring-gray-100">
                      <span className="text-gray-700">{useCase}</span>
                    </div>
                  ))}
                </div>
              )}
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
              <h2 className="text-2xl font-bold text-gray-950 sm:text-3xl">Connect with Mentors</h2>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {mentors.map((mentor) => (
                <Link
                  key={mentor._id}
                  to={`/experts/${mentor.slug || mentor._id}`}
                  className="group flex h-full flex-col overflow-hidden rounded-3xl bg-white shadow-xl shadow-primary-900/5 ring-1 ring-gray-100 transition hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary-900/10"
                >
                  <div className="relative flex h-32 items-center justify-center overflow-hidden bg-gradient-to-br from-primary-900 via-primary-700 to-cyan-500">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_20%,rgba(255,255,255,0.22),transparent_30%)]"></div>
                    {mentor.profileImage ? (
                      <img
                        src={mentor.profileImage}
                        alt={mentor.fullName}
                        className="relative h-24 w-24 rounded-full border-4 border-white object-cover"
                      />
                    ) : (
                      <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-white/20 backdrop-blur">
                        <User className="h-12 w-12 text-white" />
                      </div>
                    )}
                  </div>

                  <div className="flex flex-1 flex-col p-5 sm:p-6">
                    <h3 className="text-xl font-bold text-gray-950 sm:text-2xl">{mentor.fullName}</h3>
                    {mentor.designation && (
                      <p className="mt-1 font-semibold text-primary-600">{mentor.designation}</p>
                    )}
                    {mentor.company && (
                      <p className="mt-1 text-sm text-gray-600">{mentor.company}</p>
                    )}

                    {mentor.shortBio && (
                      <p className="mt-4 line-clamp-3 text-sm leading-6 text-gray-600">
                        {mentor.shortBio}
                      </p>
                    )}

                    <div className="mt-auto flex items-center gap-4 pt-4 text-sm text-gray-600">
                      {mentor.rating && (
                        <div className="flex items-center gap-1">
                          <span className="font-semibold text-primary-600">{mentor.rating}</span>
                          <span className="text-gray-500">★</span>
                        </div>
                      )}
                      {mentor.yearsOfExperience && (
                        <span>{mentor.yearsOfExperience} years exp.</span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
