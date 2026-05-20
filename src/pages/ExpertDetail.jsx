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

function Stat({ icon: Icon, label, value }) {
  if (value === undefined || value === null || value === '') return null

  return (
    <div className="rounded-[1.5rem] bg-white p-5 shadow-xl shadow-primary-900/5 ring-1 ring-gray-100">
      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-50 text-primary-600">
        <Icon className="h-5 w-5" />
      </div>
      <p className="text-3xl font-bold text-gray-950">{value}</p>
      <p className="mt-1 text-sm font-medium text-gray-500">{label}</p>
    </div>
  )
}

function PillList({ title, items = [] }) {
  if (!items.length) return null

  return (
    <section className="rounded-[1.5rem] bg-white p-6 shadow-xl shadow-primary-900/5 ring-1 ring-gray-100">
      <h2 className="mb-4 text-xl font-bold text-gray-950">{title}</h2>
      <div className="flex flex-wrap gap-2">
        {items.map(item => (
          <span key={item} className="rounded-full bg-primary-50 px-3 py-1.5 text-sm font-semibold text-primary-700">
            {item}
          </span>
        ))}
      </div>
    </section>
  )
}

function TextList({ title, items = [], icon: Icon }) {
  if (!items.length) return null

  return (
    <section className="rounded-[1.5rem] bg-white p-6 shadow-xl shadow-primary-900/5 ring-1 ring-gray-100">
      <h2 className="mb-5 flex items-center text-xl font-bold text-gray-950">
        {Icon && (
          <span className="mr-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-primary-50 text-primary-600">
            <Icon className="h-5 w-5" />
          </span>
        )}
        {title}
      </h2>
      <ul className="space-y-3 text-gray-700">
        {items.map(item => (
          <li key={item} className="flex gap-3 border-b border-gray-100 pb-3 last:border-0 last:pb-0">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary-500" />
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
          city
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
          <Link to="/experts" className="inline-flex items-center rounded-full bg-primary-600 px-6 py-3 font-semibold text-white hover:bg-primary-700">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Experts
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f7f9ff]">
      <section className="relative overflow-hidden bg-primary-900 px-4 pt-28 pb-24 text-white sm:px-6 lg:px-8">
        {expert.imageUrl && (
          <>
            <img src={expert.imageUrl} alt="" aria-hidden="true" className="absolute inset-0 h-full w-full object-cover opacity-15" />
            <div className="absolute inset-0 bg-gradient-to-br from-primary-900 via-primary-900/95 to-cyan-900/80"></div>
          </>
        )}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_16%_22%,rgba(0,255,255,0.18),transparent_30%),radial-gradient(circle_at_82%_14%,rgba(255,255,255,0.12),transparent_26%)]"></div>

        <div className="relative mx-auto max-w-7xl">
          <Link to="/experts" className="mb-10 inline-flex items-center rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-cyan-100 ring-1 ring-white/15 transition hover:bg-white/15 hover:text-white">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Experts
          </Link>

          <div className="grid gap-10 lg:grid-cols-[260px_1fr_340px] lg:items-end">
            <div className="h-56 w-56 overflow-hidden rounded-[2rem] bg-gradient-to-br from-primary-400 to-cyan-400 p-1 shadow-2xl shadow-primary-950/30">
              <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-[1.75rem] bg-primary-700 text-6xl font-bold">
                {expert.imageUrl ? (
                  <img src={expert.imageUrl} alt={expert.fullName} className="h-full w-full object-cover" />
                ) : (
                  initials(expert.fullName)
                )}
              </div>
            </div>

            <div>
              <div className="mb-5 flex flex-wrap gap-3">
                {expert.featured && (
                  <span className="inline-flex items-center rounded-full bg-white px-4 py-2 text-sm font-bold text-primary-700 shadow-lg shadow-primary-950/10">
                    <Award className="mr-2 h-4 w-4" />
                    Featured Expert
                  </span>
                )}
                {expert.industry && (
                  <span className="inline-flex items-center rounded-full bg-cyan-400/15 px-4 py-2 text-sm font-semibold text-cyan-100 ring-1 ring-cyan-200/20">
                    <Tags className="mr-2 h-4 w-4" />
                    {expert.industry}
                  </span>
                )}
              </div>

              <h1 className="text-4xl font-bold leading-tight md:text-6xl">{expert.fullName}</h1>
              <p className="mt-4 text-xl text-cyan-100">{expert.designation || 'Expert Mentor'}</p>
              {expert.company && <p className="mt-2 text-lg text-gray-200">{expert.company}</p>}

              <div className="mt-6 flex flex-wrap gap-5 text-sm text-gray-200">
                {expert.city && (
                  <span className="inline-flex items-center">
                    <MapPin className="mr-2 h-4 w-4 text-cyan-200" />
                    {expert.city}
                  </span>
                )}
                {expert.rating && (
                  <span className="inline-flex items-center">
                    <Star className="mr-2 h-4 w-4 fill-yellow-400 text-yellow-400" />
                    {expert.rating} rating
                  </span>
                )}
                {expert.yearsOfExperience && (
                  <span className="inline-flex items-center">
                    <Briefcase className="mr-2 h-4 w-4 text-cyan-200" />
                    {expert.yearsOfExperience}+ years experience
                  </span>
                )}
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/15 bg-white/10 p-5 shadow-2xl shadow-primary-950/20 backdrop-blur">
              <p className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-cyan-100">Profile Brief</p>
              <div className="space-y-4 text-sm text-gray-100">
                <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-4">
                  <span className="inline-flex items-center text-gray-300">
                    <Sparkles className="mr-2 h-4 w-4 text-cyan-200" />
                    Focus
                  </span>
                  <span className="text-right font-semibold">{expert.expertiseAreas?.[0] || expert.industry || 'Expertise'}</span>
                </div>
                {expert.totalSessions && (
                  <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-4">
                    <span className="inline-flex items-center text-gray-300">
                      <Users className="mr-2 h-4 w-4 text-cyan-200" />
                      Sessions
                    </span>
                    <span className="text-right font-semibold">{expert.totalSessions}</span>
                  </div>
                )}
                <div className="flex items-center justify-between gap-4">
                  <span className="inline-flex items-center text-gray-300">
                    <CheckCircle2 className="mr-2 h-4 w-4 text-cyan-200" />
                    Status
                  </span>
                  <span className="text-right font-semibold">Available</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Stat icon={Star} label="Rating" value={expert.rating} />
            <Stat icon={Users} label="Total Sessions" value={expert.totalSessions} />
            <Stat icon={BookOpen} label="Workshops" value={expert.workshopCount} />
            <Stat icon={GraduationCap} label="Courses" value={expert.courseCount} />
          </div>

          <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
            <div className="space-y-8">
              <section className="rounded-[2rem] bg-white p-8 shadow-xl shadow-primary-900/5 ring-1 ring-gray-100">
                <div className="mb-6 flex items-center gap-3">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-50 text-primary-600">
                    <UserRound className="h-6 w-6" />
                  </span>
                  <h2 className="text-3xl font-bold text-gray-950">About</h2>
                </div>
                {bio.length > 0 ? (
                  <div>{bio}</div>
                ) : (
                  <p className="text-lg leading-9 text-gray-700">{expert.shortBio}</p>
                )}
              </section>

              <TextList title="Achievements" items={expert.achievements} icon={Award} />
              <TextList title="Certifications" items={expert.certifications} icon={GraduationCap} />
            </div>

            <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
              <PillList title="Expertise Areas" items={expert.expertiseAreas} />
              <PillList title="Skills" items={expert.skills} />
              <PillList title="Tags" items={expert.tags} />
              <TextList title="Languages" items={expert.languages} icon={Languages} />
              <Link to="/experts" className="inline-flex w-full items-center justify-center rounded-2xl bg-primary-600 px-6 py-4 font-semibold text-white shadow-lg shadow-primary-600/20 transition hover:bg-primary-700">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Experts
              </Link>
            </aside>
          </div>
        </div>
      </section>
    </div>
  )
}
