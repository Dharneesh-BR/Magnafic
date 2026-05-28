import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  Award,
  BookOpen,
  Briefcase,
  CheckCircle2,
  GraduationCap,
  Languages,
  MapPin,
  Sparkles,
  Star,
  Tags,
  UserRound,
  Users
} from 'lucide-react'
import { mentorClient } from '../lib/sanityClient'
import SEO from '../components/SEO'
import { absoluteUrl } from '../lib/seo'
import { getExpertImage } from '../lib/expertImages'

function initials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .map(part => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

function renderSpan(child, markDefs = []) {
  const marks = child.marks || []

  return marks.reduce((content, mark) => {
    const markDef = markDefs.find(def => def._key === mark)

    if (mark === 'strong') {
      return <strong key={mark} className="font-semibold text-gray-950">{content}</strong>
    }

    if (mark === 'em') {
      return <em key={mark}>{content}</em>
    }

    if (markDef?._type === 'link' && markDef.href) {
      return (
        <a key={mark} href={markDef.href} target="_blank" rel="noreferrer" className="font-semibold text-primary-600 underline decoration-primary-200 underline-offset-4 hover:text-primary-700">
          {content}
        </a>
      )
    }

    return content
  }, child.text)
}

function renderBlockText(block) {
  return block.children?.map(child => (
    <span key={child._key}>{renderSpan(child, block.markDefs)}</span>
  ))
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

function toText(value) {
  if (value === undefined || value === null) return ''
  if (typeof value === 'string' || typeof value === 'number') return String(value)
  if (typeof value === 'object') {
    return value.title || value.name || value.label || value.value || value.text || ''
  }

  return ''
}

function toTextList(items) {
  if (!Array.isArray(items)) return []

  return items
    .map(toText)
    .map(item => item.trim())
    .filter(Boolean)
}

function Stat({ icon: Icon, label, value }) {
  if (value === undefined || value === null || value === '') return null

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-full bg-primary-50 text-primary-600">
        <Icon className="h-4 w-4" />
      </div>
      <p className="text-2xl font-semibold text-gray-950">{value}</p>
      <p className="mt-1 text-sm text-gray-500">{label}</p>
    </div>
  )
}

function ProfileSection({ title, children }) {
  return (
    <section className="rounded-lg border border-gray-200 bg-white p-5">
      <h2 className="mb-4 text-xl font-semibold text-gray-950">{title}</h2>
      {children}
    </section>
  )
}

function PillList({ title, items = [] }) {
  const normalizedItems = toTextList(items)

  if (!normalizedItems.length) return null

  return (
    <section className="rounded-lg border border-gray-200 bg-white p-5">
      <h2 className="mb-4 text-lg font-semibold text-gray-950">{title}</h2>
      <div className="flex flex-wrap gap-2">
        {normalizedItems.map(item => (
          <span key={item} className="rounded-full bg-primary-50 px-3 py-1.5 text-sm font-medium text-primary-700">
            {item}
          </span>
        ))}
      </div>
    </section>
  )
}

function TextList({ title, items = [], icon: Icon }) {
  const normalizedItems = toTextList(items)

  if (!normalizedItems.length) return null

  return (
    <section className="rounded-lg border border-gray-200 bg-white p-5">
      <h2 className="mb-5 flex items-center text-lg font-semibold text-gray-950">
        {Icon && (
          <span className="mr-3 flex h-9 w-9 items-center justify-center rounded-full bg-primary-50 text-primary-600">
            <Icon className="h-4 w-4" />
          </span>
        )}
        {title}
      </h2>
      <ul className="space-y-3 text-gray-700">
        {normalizedItems.map(item => (
          <li key={item} className="flex gap-3 border-b border-gray-100 pb-3 last:border-0 last:pb-0">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary-600" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}

export default function ExpertDetail() {
  const { slug } = useParams()
  const [expert, setExpert] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchExpert = async () => {
      setLoading(true)
      setError('')

      try {
        const query = `*[_type == "mentor" && (slug.current == $slug || _id == $slug)][0] {
          _id,
          fullName,
          "slug": slug.current,
          "imageUrl": profileImage.asset->url,
          designation,
          company,
          shortBio,
          detailedBio,
          expertiseAreas,
          yearsOfExperience,
          industry,
          skills,
          certifications,
          languages,
          featured,
          rating,
          totalSessions,
          workshopCount,
          courseCount,
          achievements,
          tags,
          city,
          capability->{
            _id,
            title,
            "slug": slug.current
          },
          capabilities[]->{
            _id,
            title,
            "slug": slug.current
          }
        }`

        const data = await mentorClient.fetch(query, { slug })
        setExpert(data)
      } catch (fetchError) {
        console.error('Error fetching expert:', fetchError)
        setError('We could not load this expert profile right now.')
      } finally {
        setLoading(false)
      }
    }

    fetchExpert()
  }, [slug])

  const bio = useMemo(() => renderBio(expert?.detailedBio), [expert?.detailedBio])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f9ff] px-4 pt-32 pb-20">
        <div className="mx-auto max-w-4xl rounded-[2rem] bg-white p-12 text-center shadow-xl shadow-primary-900/5">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-b-2 border-primary-600"></div>
          <p className="mt-4 text-gray-600">Loading expert profile...</p>
        </div>
      </div>
    )
  }

  if (error || !expert) {
    return (
      <div className="min-h-screen bg-white px-4 pt-32 pb-20">
        <div className="mx-auto max-w-3xl text-center">
          <UserRound className="mx-auto mb-6 h-14 w-14 text-primary-500" />
          <h1 className="mb-4 text-3xl font-bold text-gray-950">Expert not found</h1>
          <p className="mb-8 text-gray-600">{error || 'The expert profile you are looking for is not available.'}</p>
          <Link to="/capabilities" className="inline-flex items-center rounded-full bg-primary-600 px-6 py-3 font-semibold text-white hover:bg-primary-700">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Capabilities
          </Link>
        </div>
      </div>
    )
  }

  const expertImage = getExpertImage(expert)
  const assignedCapabilities = [
    ...(expert.capabilities || []),
    ...(expert.capability ? [expert.capability] : []),
  ].filter((capability, index, capabilities) => (
    capability?._id && capabilities.findIndex(item => item?._id === capability._id) === index
  ))
  const primaryCapability = assignedCapabilities[0]
  const capabilityPath = primaryCapability ? `/capabilities/${primaryCapability.slug || primaryCapability._id}` : '/capabilities'
  const backLabel = primaryCapability?.title ? `Back to ${primaryCapability.title}` : 'Back to Capabilities'

  return (
    <div className="min-h-screen bg-[#f3f2ef] px-4 pt-24 pb-12 sm:px-6 lg:px-8">
      <SEO
        title={`${expert.fullName} - ${expert.designation || 'Expert Consultant'}`}
        description={expert.shortBio}
        path={`/experts/${expert.slug || expert._id}`}
        image={expertImage || undefined}
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'Person',
          name: expert.fullName,
          description: expert.shortBio,
          image: expert.imageUrl,
          jobTitle: expert.designation,
          worksFor: expert.company
            ? {
                '@type': 'Organization',
                name: expert.company,
              }
            : undefined,
          url: absoluteUrl(`/experts/${expert.slug || expert._id}`),
          knowsAbout: [...toTextList(expert.expertiseAreas), ...toTextList(expert.skills)],
        }}
      />
      <div className="mx-auto max-w-6xl">
        <Link to={capabilityPath} className="mb-4 inline-flex items-center text-sm font-semibold text-primary-700 transition hover:text-primary-900">
          <ArrowLeft className="mr-2 h-4 w-4" />
          {backLabel}
        </Link>

        <section className="overflow-hidden rounded-lg border border-gray-200 bg-white">
          <div className="relative h-32 bg-gradient-to-r from-[#000047] via-primary-700 to-cyan-500 sm:h-44">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_22%,rgba(255,255,255,0.18),transparent_26%),radial-gradient(circle_at_82%_10%,rgba(255,255,255,0.16),transparent_28%)]"></div>
            <div className="absolute -bottom-20 right-8 h-44 w-44 rounded-full border border-white/20 sm:right-24 sm:h-56 sm:w-56"></div>
            <div className="absolute -bottom-28 right-20 h-56 w-56 rounded-full border border-cyan-100/20 sm:right-44 sm:h-72 sm:w-72"></div>
          </div>

          <div className="px-4 pb-6 sm:px-6">
            <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="-mt-14 h-32 w-32 shrink-0 overflow-hidden rounded-full border-4 border-white bg-primary-700 text-4xl font-bold shadow-lg sm:-mt-16 sm:h-40 sm:w-40 sm:text-5xl">
                <div className="flex h-full w-full items-center justify-center">
                  {expertImage ? (
                    <img src={expertImage} alt={expert.fullName} className="h-full w-full object-cover object-top" />
                  ) : (
                    <span className="text-white">{initials(expert.fullName)}</span>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap gap-2 sm:pt-5">
                <span className="inline-flex items-center rounded-full border border-primary-600 px-4 py-2 text-sm font-semibold text-primary-700">
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Available
                </span>
                {expert.featured && (
                  <span className="inline-flex items-center rounded-full bg-primary-600 px-4 py-2 text-sm font-semibold text-white">
                    <Award className="mr-2 h-4 w-4" />
                    Featured Expert
                  </span>
                )}
              </div>
            </div>

            <div className="mt-4 max-w-4xl">
              <h1 className="text-3xl font-semibold leading-tight text-gray-950 sm:text-4xl">{expert.fullName}</h1>
              <p className="mt-2 text-lg leading-7 text-gray-800">{expert.designation || 'Expert Mentor'}</p>
              {expert.company && <p className="mt-1 text-base font-medium text-gray-700">{expert.company}</p>}

              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-600">
                {expert.city && (
                  <span className="inline-flex items-center">
                    <MapPin className="mr-1.5 h-4 w-4 text-gray-500" />
                    {expert.city}
                  </span>
                )}
                {expert.yearsOfExperience && (
                  <span className="inline-flex items-center">
                    <Briefcase className="mr-1.5 h-4 w-4 text-gray-500" />
                    {expert.yearsOfExperience}+ years experience
                  </span>
                )}
                {expert.rating && (
                  <span className="inline-flex items-center">
                    <Star className="mr-1.5 h-4 w-4 fill-yellow-400 text-yellow-400" />
                    {expert.rating} rating
                  </span>
                )}
              </div>

              {expert.shortBio && (
                <p className="mt-4 max-w-3xl text-base leading-7 text-gray-700">{expert.shortBio}</p>
              )}

              <div className="mt-5 flex flex-wrap gap-2">
                {expert.industry && (
                  <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-700">
                    <Tags className="mr-1.5 h-4 w-4" />
                    {expert.industry}
                  </span>
                )}
                {assignedCapabilities.map((capability) => (
                  <Link
                    key={capability._id}
                    to={`/capabilities/${capability.slug || capability._id}`}
                    className="inline-flex items-center rounded-full bg-primary-50 px-3 py-1.5 text-sm font-semibold text-primary-700 hover:bg-primary-100"
                  >
                    <Sparkles className="mr-1.5 h-4 w-4" />
                    {capability.title}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>

        <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
          <main className="space-y-4">
            <ProfileSection title="About">
              {bio.length > 0 ? (
                <div className="[&_p]:mb-4 [&_p]:text-base [&_p]:leading-7 [&_p]:text-gray-700 [&_h2]:text-2xl [&_h2]:font-semibold [&_h3]:text-xl [&_h3]:font-semibold [&_ul]:text-base [&_ol]:text-base">
                  {bio}
                </div>
              ) : (
                <p className="text-base leading-7 text-gray-700">{expert.shortBio}</p>
              )}
            </ProfileSection>

            <ProfileSection title="Activity and impact">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <Stat icon={Star} label="Rating" value={expert.rating} />
                <Stat icon={Users} label="Sessions" value={expert.totalSessions} />
                <Stat icon={BookOpen} label="Workshops" value={expert.workshopCount} />
                <Stat icon={GraduationCap} label="Courses" value={expert.courseCount} />
              </div>
            </ProfileSection>

            <TextList title="Achievements" items={expert.achievements} icon={Award} />
            <TextList title="Certifications" items={expert.certifications} icon={GraduationCap} />
          </main>

          <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
            <section className="rounded-lg border border-gray-200 bg-white p-5">
              <h2 className="text-lg font-semibold text-gray-950">Profile details</h2>
              <div className="mt-4 space-y-4 text-sm">
                <div className="flex justify-between gap-4 border-b border-gray-100 pb-3">
                  <span className="text-gray-500">Focus</span>
                  <span className="text-right font-semibold text-gray-900">{toTextList(expert.expertiseAreas)[0] || expert.industry || 'Expertise'}</span>
                </div>
                {expert.company && (
                  <div className="flex justify-between gap-4 border-b border-gray-100 pb-3">
                    <span className="text-gray-500">Company</span>
                    <span className="text-right font-semibold text-gray-900">{expert.company}</span>
                  </div>
                )}
                <div className="flex justify-between gap-4">
                  <span className="text-gray-500">Status</span>
                  <span className="text-right font-semibold text-primary-700">Available</span>
                </div>
              </div>
            </section>

            <PillList title="Expertise Areas" items={expert.expertiseAreas} />
            <PillList title="Skills" items={expert.skills} />
            <PillList title="Tags" items={expert.tags} />
            <TextList title="Languages" items={expert.languages} icon={Languages} />
            <Link to={capabilityPath} className="inline-flex w-full items-center justify-center rounded-full bg-primary-600 px-6 py-3 font-semibold text-white transition hover:bg-primary-700">
              <ArrowLeft className="mr-2 h-4 w-4" />
              {backLabel}
            </Link>
          </aside>
        </div>
      </div>
    </div>
  )
}
