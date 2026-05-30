import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  Award,
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  ExternalLink,
  FileText,
  GraduationCap,
  ImageIcon,
  MapPin,
  PlayCircle,
  Timer,
  UserRound
} from 'lucide-react'
import { mentorClient } from '../lib/sanityClient'
import SEO from '../components/SEO'
import { absoluteUrl } from '../lib/seo'
import { getExpertImage } from '../lib/expertImages'
import MagnaLoader from '../components/MagnaLoader'

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

function renderPortableText(blocks = [], compact = false) {
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
        <ListTag key={block._key} className={`ml-5 space-y-2 text-gray-700 marker:font-semibold marker:text-gray-500 ${listType === 'ol' ? 'list-decimal' : 'list-disc'}`}>
          {items.map(item => <li key={item._key}>{renderBlockText(item)}</li>)}
        </ListTag>
      )
      continue
    }

    switch (block.style) {
      case 'h2':
        rendered.push(<h3 key={block._key} className="mt-6 text-xl font-semibold text-gray-950">{renderBlockText(block)}</h3>)
        break
      case 'h3':
        rendered.push(<h4 key={block._key} className="mt-5 text-lg font-semibold text-gray-950">{renderBlockText(block)}</h4>)
        break
      case 'blockquote':
        rendered.push(
          <blockquote key={block._key} className="border-l-4 border-primary-500 pl-4 font-medium italic text-gray-700">
            {renderBlockText(block)}
          </blockquote>
        )
        break
      default:
        rendered.push(<p key={block._key} className={`${compact ? 'text-sm leading-6' : 'text-base leading-7'} text-gray-700`}>{renderBlockText(block)}</p>)
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

function formatDate(value) {
  if (!value) return ''

  return new Intl.DateTimeFormat('en', {
    month: 'short',
    year: 'numeric',
  }).format(new Date(value))
}

function formatRange(startDate, endDate, current = false) {
  const start = formatDate(startDate)
  const end = current ? 'Present' : formatDate(endDate)

  if (start && end) return `${start} - ${end}`
  return start || end
}

function formatYearRange(startDate, endDate, current = false) {
  const start = startDate ? new Date(startDate).getFullYear() : ''
  const end = current ? 'Present' : endDate ? new Date(endDate).getFullYear() : ''

  if (start && end) return `${start} - ${end}`
  return start || end
}

function availabilityLabel(status) {
  if (status === 'limited') return 'Limited availability'
  if (status === 'unavailable') return 'Unavailable'
  return 'Available'
}

function Section({ title, children, variant = 'default' }) {
  if (!children) return null
  const isGradient = variant === 'gradient'

  return (
    <section className={`rounded-lg border p-5 transition ${isGradient ? 'border-white/20 bg-[linear-gradient(135deg,#000047,#2563eb_52%,#00ffff)] text-white shadow-[0_0_26px_rgba(0,255,255,0.24)] hover:shadow-[0_0_34px_rgba(0,255,255,0.32)]' : 'border-cyan-100 bg-white shadow-[0_0_22px_rgba(0,255,255,0.18)] hover:border-cyan-200 hover:shadow-[0_0_30px_rgba(0,255,255,0.26)]'}`}>
      <h2 className={`mb-4 text-xl font-semibold ${isGradient ? 'text-white' : 'text-gray-950'}`}>{title}</h2>
      {children}
    </section>
  )
}

function LogoFrame({ src, alt, fallback: Fallback = BriefcaseBusiness }) {
  return (
    <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded bg-gray-100 text-gray-500">
      {src ? (
        <img src={src} alt={alt} className="h-full w-full object-cover" />
      ) : (
        <Fallback className="h-6 w-6" />
      )}
    </div>
  )
}

function SkillPills({ title, items = [] }) {
  const normalized = toTextList(items)
  if (!normalized.length) return null

  return (
    <Section title={title} variant="gradient">
      <div className="flex flex-wrap gap-2.5">
        {normalized.map(item => (
          <span key={item} className="rounded-full border border-white/25 bg-white/14 px-3.5 py-2 text-sm font-bold text-white shadow-sm shadow-primary-950/10 backdrop-blur-sm transition hover:-translate-y-0.5 hover:bg-white/22">
            {item}
          </span>
        ))}
      </div>
    </Section>
  )
}

function FeaturedIcon(type) {
  if (type === 'video') return PlayCircle
  if (type === 'document') return FileText
  return ExternalLink
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
          headline,
          "imageUrl": profileImage.asset->url,
          "bannerImageUrl": bannerImage.asset->url,
          currentDesignation,
          currentCompany,
          location,
          totalYearsOfExperience,
          availabilityStatus,
          shortBio,
          profileIntro,
          about,
          experience[]{
            roleTitle,
            companyName,
            "companyLogoUrl": companyLogo.asset->url,
            employmentType,
            location,
            startDate,
            endDate,
            currentlyWorkingHere,
            description,
            skillsUsed
          },
          education[]{
            schoolName,
            "schoolLogoUrl": schoolLogo.asset->url,
            degree,
            fieldOfStudy,
            startDate,
            endDate,
            description
          },
          certifications[]{
            certificationName,
            issuingOrganization,
            "organizationLogoUrl": organizationLogo.asset->url,
            issueDate,
            expirationDate,
            credentialId,
            credentialUrl
          },
          skills,
          topSkills,
          featuredItems[]{
            title,
            description,
            "thumbnailImageUrl": thumbnailImage.asset->url,
            link,
            type
          },
          projects[]{
            projectTitle,
            "projectImageUrl": projectImage.asset->url,
            clientOrCompany,
            startDate,
            endDate,
            description,
            projectUrl,
            associatedCapabilities[]->{
              _id,
              title,
              "slug": slug.current
            }
          },
          recommendations[]{
            name,
            designation,
            company,
            "profileImageUrl": profileImage.asset->url,
            testimonial,
            relationship
          },
          designation,
          company,
          detailedBio,
          expertiseAreas,
          industry,
          city,
          "capabilities": *[_type == "capabilities" && ^._id in orderedExperts[]._ref] | order(coalesce(displayOrder, 9999) asc, title asc) {
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

  const aboutBlocks = useMemo(
    () => renderPortableText(expert?.about?.length ? expert.about : expert?.detailedBio),
    [expert?.about, expert?.detailedBio]
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f3f2ef] px-4 pt-32 pb-20">
        <MagnaLoader message="Loading expert profile..." className="mx-auto max-w-4xl" />
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
  const assignedCapabilities = (expert.capabilities || []).filter((capability, index, capabilities) => (
    capability?._id && capabilities.findIndex(item => item?._id === capability._id) === index
  ))
  const primaryCapability = assignedCapabilities[0]
  const capabilityPath = primaryCapability ? `/capabilities/${primaryCapability.slug || primaryCapability._id}` : '/capabilities'
  const backLabel = primaryCapability?.title ? `Back to ${primaryCapability.title}` : 'Back to Capabilities'
  const headline = expert.headline || expert.currentDesignation || expert.designation || 'Expert Mentor'
  const company = expert.currentCompany || expert.company
  const location = expert.location || expert.city
  const intro = expert.profileIntro || expert.shortBio
  const topSkills = toTextList(expert.topSkills)
  const skillSet = new Set(topSkills.map(skill => skill.toLowerCase()))
  const remainingSkills = toTextList(expert.skills).filter(skill => !skillSet.has(skill.toLowerCase()))
  const aboutContent = aboutBlocks.length ? aboutBlocks : <p className="text-base leading-7 text-gray-700">{expert.shortBio}</p>
  const featuredItems = (expert.featuredItems || []).filter(Boolean)
  const experienceItems = (expert.experience || []).filter(Boolean)
  const experienceLogoItems = experienceItems
    .filter(item => item.companyLogoUrl)
    .filter((item, index, items) => items.findIndex(entry => entry.companyLogoUrl === item.companyLogoUrl) === index)
  const educationItems = (expert.education || []).filter(Boolean)
  const certificationItems = (expert.certifications || []).filter(Boolean)
  const projectItems = (expert.projects || []).filter(Boolean)
  const recommendationItems = (expert.recommendations || []).filter(Boolean)

  return (
    <div className="min-h-screen bg-[#f3f2ef] px-4 pt-24 pb-12 sm:px-6 lg:px-8">
      <SEO
        title={`${expert.fullName} - ${headline}`}
        description={expert.shortBio || intro}
        path={`/experts/${expert.slug || expert._id}`}
        image={expertImage || expert.bannerImageUrl || undefined}
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'Person',
          name: expert.fullName,
          description: expert.shortBio || intro,
          image: expertImage,
          jobTitle: headline,
          worksFor: company
            ? {
                '@type': 'Organization',
                name: company,
              }
            : undefined,
          url: absoluteUrl(`/experts/${expert.slug || expert._id}`),
          knowsAbout: [...toTextList(expert.skills), ...toTextList(expert.expertiseAreas)],
        }}
      />
      <div className="mx-auto max-w-6xl">
        <Link to={capabilityPath} className="mb-4 inline-flex items-center text-sm font-semibold text-primary-700 transition hover:text-primary-900">
          <ArrowLeft className="mr-2 h-4 w-4" />
          {backLabel}
        </Link>

        <section className="rounded-lg border border-cyan-100 bg-white shadow-[0_0_24px_rgba(0,255,255,0.18)]">
          <div className="relative h-28 overflow-hidden rounded-t-lg bg-[#000047] sm:h-40 lg:h-44">
            {expert.bannerImageUrl ? (
              <img src={expert.bannerImageUrl} alt="" className="h-full w-full object-cover object-center" />
            ) : (
              <div className="h-full w-full bg-gradient-to-r from-[#000047] via-primary-700 to-cyan-500" />
            )}
            <div className="absolute inset-0 bg-gradient-to-r from-[#000047]/45 via-[#000047]/20 to-cyan-400/20" />
            <div className="absolute inset-y-0 right-24 hidden max-w-[62%] items-center justify-end text-right text-white sm:flex lg:right-40">
              <div>
                <h2 className="text-4xl font-extrabold leading-tight tracking-normal drop-shadow-[0_4px_16px_rgba(0,0,0,0.55)] lg:text-6xl">
                  {expert.fullName}
                </h2>
                <div className="mt-4 flex flex-wrap justify-end gap-x-5 gap-y-2 text-base font-bold text-cyan-50 drop-shadow-[0_2px_10px_rgba(0,0,0,0.45)] lg:text-xl">
                  {location && (
                    <span className="inline-flex items-center">
                      <MapPin className="mr-2 h-4 w-4 lg:h-5 lg:w-5" />
                      {location}
                    </span>
                  )}
                  {expert.totalYearsOfExperience ? (
                    <span className="inline-flex items-center">
                      <Timer className="mr-2 h-4 w-4 lg:h-5 lg:w-5" />
                      {expert.totalYearsOfExperience}+ years experience
                    </span>
                  ) : null}
                </div>
              </div>
            </div>
          </div>

          <div className="relative px-4 pb-6 sm:px-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="relative z-20 ml-3 -mt-16 h-32 w-32 shrink-0 overflow-hidden rounded-full border-4 border-white bg-primary-700 text-3xl font-bold shadow-md sm:ml-5 sm:-mt-20 sm:h-44 sm:w-44 sm:text-5xl">
                <div className="flex h-full w-full items-center justify-center">
                  {expertImage ? (
                    <img src={expertImage} alt={expert.fullName} className="h-full w-full object-cover object-center" />
                  ) : (
                    <span className="text-white">{initials(expert.fullName)}</span>
                  )}
                </div>
              </div>

              <span className="mt-4 inline-flex w-fit items-center bg-green-200 rounded-full px-4 py-2 text-sm font-semibold text-green-800 sm:mt-8">
                <CheckCircle2 className="mr-2 h-10 w-10" />
                {availabilityLabel(expert.availabilityStatus)}
              </span>
            </div>

            <div className="mt-3 grid gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
              <div>
                <h1 className="text-2xl font-semibold leading-tight text-[#000047] sm:text-3xl">{expert.fullName}</h1>
                <p className="mt-2 text-lg leading-7 font-medium text-[#000047]">{headline}</p>
                {company && <p className="mt-1 text-base font-medium text-gray-700">{company}</p>}

                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-base font-medium text-gray-600">
                  {location && (
                    <span className="inline-flex items-center">
                      <MapPin className="mr-1.5 h-4 w-4 text-gray-500" />
                      {location}
                    </span>
                  )}
                </div>

                {intro && (
                  <p className="mt-4 max-w-3xl text-base font-medium leading-7 text-gray-700">{intro}</p>
                )}
              </div>

              {experienceLogoItems.length > 0 && (
                <div className="hidden lg:flex lg:justify-end">
                  <div className="grid w-full max-w-[300px] grid-cols-3 gap-3">
                    {experienceLogoItems.slice(0, 6).map((item, index) => (
                      <div
                        key={`${item.companyName || 'company'}-${index}`}
                        className="flex aspect-square items-center justify-center p-2"
                        title={item.companyName || item.roleTitle}
                      >
                        <img src={item.companyLogoUrl} alt={item.companyName || item.roleTitle || 'Company logo'} className="max-h-full max-w-full object-contain" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
          <main className="space-y-4">
            <Section title="About">
              <div className="space-y-4">{aboutContent}</div>
            </Section>

            {featuredItems.length > 0 && (
              <Section title="Featured">
                <div className="grid gap-3 sm:grid-cols-2">
                  {featuredItems.map((item, index) => {
                    const Icon = FeaturedIcon(item.type)
                    const CardTag = item.link ? 'a' : 'div'

                    return (
                      <CardTag
                        key={`${item.title}-${index}`}
                        href={item.link || undefined}
                        target={item.link ? '_blank' : undefined}
                        rel={item.link ? 'noreferrer' : undefined}
                        className="overflow-hidden rounded-lg border border-gray-200 bg-white transition hover:border-primary-200 hover:shadow-sm"
                      >
                        <div className="flex aspect-[16/9] items-center justify-center bg-gray-100 text-gray-400">
                          {item.thumbnailImageUrl ? (
                            <img src={item.thumbnailImageUrl} alt={item.title} className="h-full w-full object-cover" />
                          ) : (
                            <ImageIcon className="h-8 w-8" />
                          )}
                        </div>
                        <div className="p-4">
                          <p className="flex items-center text-xs font-semibold uppercase tracking-wide text-gray-500">
                            <Icon className="mr-1.5 h-4 w-4" />
                            {item.type || 'Featured'}
                          </p>
                          <h3 className="mt-2 line-clamp-2 font-semibold text-gray-950">{item.title}</h3>
                          {item.description && <p className="mt-2 line-clamp-3 text-sm leading-6 text-gray-600">{item.description}</p>}
                        </div>
                      </CardTag>
                    )
                  })}
                </div>
              </Section>
            )}

            {experienceItems.length > 0 && (
              <Section title="Experience">
                <div className="space-y-6">
                  {experienceItems.map((item, index) => (
                    <article key={`${item.roleTitle}-${index}`} className="flex gap-4 border-b border-gray-100 pb-6 last:border-0 last:pb-0">
                      <LogoFrame src={item.companyLogoUrl} alt={item.companyName || item.roleTitle} />
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-gray-950">{item.roleTitle}</h3>
                        <p className="mt-1 text-sm text-gray-700">
                          {[item.companyName, item.employmentType].filter(Boolean).join(' · ')}
                        </p>
                        <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-500">
                          {formatRange(item.startDate, item.endDate, item.currentlyWorkingHere) && (
                            <span className="inline-flex items-center">
                              <CalendarDays className="mr-1.5 h-4 w-4" />
                              {formatRange(item.startDate, item.endDate, item.currentlyWorkingHere)}
                            </span>
                          )}
                          {item.location && <span>{item.location}</span>}
                        </p>
                        {item.description?.length > 0 && (
                          <div className="mt-3 space-y-3">{renderPortableText(item.description, true)}</div>
                        )}
                        {toTextList(item.skillsUsed).length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {toTextList(item.skillsUsed).map(skill => (
                              <span key={skill} className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-700">{skill}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    </article>
                  ))}
                </div>
              </Section>
            )}

            {educationItems.length > 0 && (
              <Section title="Education">
                <div className="space-y-6">
                  {educationItems.map((item, index) => (
                    <article key={`${item.schoolName}-${index}`} className="flex gap-4 border-b border-gray-100 pb-6 last:border-0 last:pb-0">
                      <LogoFrame src={item.schoolLogoUrl} alt={item.schoolName} fallback={GraduationCap} />
                      <div>
                        <h3 className="font-semibold text-gray-950">{item.schoolName}</h3>
                        <p className="mt-1 text-sm text-gray-700">{[item.degree, item.fieldOfStudy].filter(Boolean).join(', ')}</p>
                        {formatRange(item.startDate, item.endDate) && <p className="mt-1 text-sm text-gray-500">{formatRange(item.startDate, item.endDate)}</p>}
                        {item.description && <p className="mt-3 text-sm leading-6 text-gray-600">{item.description}</p>}
                      </div>
                    </article>
                  ))}
                </div>
              </Section>
            )}

            {certificationItems.length > 0 && (
              <Section title="Licenses & Certifications">
                <div className="space-y-6">
                  {certificationItems.map((item, index) => (
                    <article key={`${item.certificationName}-${index}`} className="flex gap-4 border-b border-gray-100 pb-6 last:border-0 last:pb-0">
                      <LogoFrame src={item.organizationLogoUrl} alt={item.issuingOrganization} fallback={Award} />
                      <div>
                        <h3 className="font-semibold text-gray-950">{item.certificationName}</h3>
                        {item.issuingOrganization && <p className="mt-1 text-sm text-gray-700">{item.issuingOrganization}</p>}
                        <p className="mt-1 text-sm text-gray-500">
                          {[item.issueDate && `Issued ${formatDate(item.issueDate)}`, item.expirationDate && `Expires ${formatDate(item.expirationDate)}`].filter(Boolean).join(' · ')}
                        </p>
                        {item.credentialId && <p className="mt-1 text-sm text-gray-500">Credential ID {item.credentialId}</p>}
                        {item.credentialUrl && (
                          <a href={item.credentialUrl} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center text-sm font-semibold text-primary-700 hover:text-primary-900">
                            Show credential
                            <ExternalLink className="ml-1.5 h-4 w-4" />
                          </a>
                        )}
                      </div>
                    </article>
                  ))}
                </div>
              </Section>
            )}

            {projectItems.length > 0 && (
              <Section title="Projects / Case Studies">
                <div className="grid gap-4 sm:grid-cols-2">
                  {projectItems.map((item, index) => (
                    <article key={`${item.projectTitle}-${index}`} className="overflow-hidden rounded-lg border border-gray-200">
                      <div className="flex aspect-[16/9] items-center justify-center bg-gray-100 text-gray-400">
                        {item.projectImageUrl ? (
                          <img src={item.projectImageUrl} alt={item.projectTitle} className="h-full w-full object-cover" />
                        ) : (
                          <ImageIcon className="h-8 w-8" />
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-gray-950">{item.projectTitle}</h3>
                        {item.clientOrCompany && <p className="mt-1 text-sm text-gray-600">{item.clientOrCompany}</p>}
                        {formatRange(item.startDate, item.endDate) && <p className="mt-1 text-sm text-gray-500">{formatRange(item.startDate, item.endDate)}</p>}
                        {item.description?.length > 0 && <div className="mt-3 space-y-3">{renderPortableText(item.description, true)}</div>}
                        {item.projectUrl && (
                          <a href={item.projectUrl} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center text-sm font-semibold text-primary-700 hover:text-primary-900">
                            View project
                            <ExternalLink className="ml-1.5 h-4 w-4" />
                          </a>
                        )}
                      </div>
                    </article>
                  ))}
                </div>
              </Section>
            )}

            {recommendationItems.length > 0 && (
              <Section title="Recommendations">
                <div className="space-y-5">
                  {recommendationItems.map((item, index) => (
                    <article key={`${item.name}-${index}`} className="border-b border-gray-100 pb-5 last:border-0 last:pb-0">
                      <div className="flex gap-3">
                        <LogoFrame src={item.profileImageUrl} alt={item.name} fallback={UserRound} />
                        <div>
                          <h3 className="font-semibold text-gray-950">{item.name}</h3>
                          <p className="text-sm text-gray-600">{[item.designation, item.company].filter(Boolean).join(' · ')}</p>
                          {item.relationship && <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-gray-500">{item.relationship}</p>}
                        </div>
                      </div>
                      {item.testimonial && <p className="mt-3 text-sm leading-6 text-gray-700">{item.testimonial}</p>}
                    </article>
                  ))}
                </div>
              </Section>
            )}
          </main>

          <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
            <SkillPills title="Top skills" items={topSkills.slice(0, 8)} />
            <SkillPills title="Skills" items={remainingSkills.length ? remainingSkills : expert.skills} />
            <Section title="Capabilities" variant="gradient">
              <div className="space-y-2">
                {assignedCapabilities.length > 0 ? assignedCapabilities.map(capability => (
                  <Link
                    key={capability._id}
                    to={`/capabilities/${capability.slug || capability._id}`}
                    className="group flex items-center justify-between rounded-xl border border-white/25 bg-white/14 px-4 py-3 text-sm font-bold text-white shadow-sm shadow-primary-950/10 backdrop-blur-sm transition hover:-translate-y-0.5 hover:bg-white/22"
                  >
                    {capability.title}
                    <span className="ml-3 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/18 text-white ring-1 ring-white/25 transition group-hover:bg-white/25">
                      <ArrowLeft className="h-4 w-4 rotate-180" />
                    </span>
                  </Link>
                )) : (
                  <p className="text-sm text-white/80">No capabilities assigned yet.</p>
                )}
              </div>
            </Section>

            {experienceItems.length > 0 && (
              <Section title="Roadmap">
                <div className="relative space-y-4 overflow-hidden py-1">
                  <svg className="absolute left-6 top-6 h-[calc(100%-3rem)] w-12 overflow-visible" viewBox="0 0 48 420" preserveAspectRatio="none" aria-hidden="true">
                    <path d="M20 0 C 2 58, 44 96, 22 154 S 5 260, 27 322 S 20 390, 28 420" fill="none" stroke="#1f2937" strokeWidth="12" strokeLinecap="round" />
                    <path d="M20 0 C 2 58, 44 96, 22 154 S 5 260, 27 322 S 20 390, 28 420" fill="none" stroke="#000047" strokeWidth="6" strokeLinecap="round" />
                    <path d="M23 8 C 8 62, 41 101, 24 156 S 10 260, 30 320 S 22 385, 30 412" fill="none" stroke="#a78bfa" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                  {experienceItems.map((item, index) => {
                    const yearLabel = item.startDate ? new Date(item.startDate).getFullYear() : formatYearRange(item.startDate, item.endDate, item.currentlyWorkingHere)

                    return (
                      <div key={`${item.companyName || item.roleTitle}-${index}`} className="relative grid grid-cols-[4.75rem_minmax(0,1fr)] items-center gap-3">
                        <div className="relative z-10 ml-1 flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-primary-500 bg-white shadow-lg shadow-primary-900/20">
                          {item.companyLogoUrl ? (
                            <img src={item.companyLogoUrl} alt={item.companyName || 'Company logo'} className="h-full w-full object-contain p-2" />
                          ) : (
                            <BriefcaseBusiness className="h-6 w-6 text-primary-600" />
                          )}
                        </div>
                        <div className="min-w-0 rounded-xl border border-gray-100 bg-white px-4 py-3 shadow-lg shadow-gray-200/80">
                          {yearLabel && (
                            <p className="text-base font-extrabold leading-none text-primary-600">
                              {yearLabel}
                            </p>
                          )}
                          <p className="mt-1 line-clamp-1 text-sm font-extrabold text-[#000047]">{item.companyName || item.roleTitle}</p>
                          {item.roleTitle && item.companyName && (
                            <p className="mt-1 line-clamp-2 text-sm font-medium leading-5 text-gray-700">{item.roleTitle}</p>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </Section>
            )}
          </aside>
        </div>

        <div className="mt-8 flex justify-center">
          <Link to={capabilityPath} className="inline-flex items-center justify-center rounded-full bg-primary-600 px-7 py-3 font-semibold text-white shadow-lg shadow-primary-600/20 transition hover:bg-primary-700">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {backLabel}
          </Link>
        </div>
      </div>
    </div>
  )
}
