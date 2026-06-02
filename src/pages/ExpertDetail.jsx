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
  Share2,
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
    <section className={`rounded-lg border p-4 transition sm:p-5 ${isGradient ? 'border-white/20 bg-[linear-gradient(135deg,#000047,#2563eb_52%,#00ffff)] text-white shadow-[0_0_26px_rgba(0,255,255,0.24)] hover:shadow-[0_0_34px_rgba(0,255,255,0.32)]' : 'border-cyan-100 bg-white shadow-[0_0_22px_rgba(0,255,255,0.18)] hover:border-cyan-200 hover:shadow-[0_0_30px_rgba(0,255,255,0.26)]'}`}>
      <h2 className={`mb-4 text-lg font-semibold sm:text-xl ${isGradient ? 'text-white' : 'text-gray-950'}`}>{title}</h2>
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
    <Section title={title}>
      <div className="flex flex-wrap gap-2.5">
        {normalized.map(item => (
          <span key={item} className="rounded-full bg-primary-50 px-3.5 py-2 text-sm font-bold text-primary-700 transition hover:-translate-y-0.5 hover:bg-primary-100">
            {item}
          </span>
        ))}
      </div>
    </Section>
  )
}

function RoadmapSection({ experienceItems = [] }) {
  if (!experienceItems.length) return null

  return (
    <Section title="My Growth Story">
      <p className="mb-4 text-sm font-semibold leading-6 text-gray-600">
        Journey of Building and Scaling Businesses
      </p>
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
                  <p className="text-base font-extrabold leading-none text-primary-600">{yearLabel}</p>
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
  )
}

function FeaturedIcon(type) {
  if (type === 'video') return PlayCircle
  if (type === 'document') return FileText
  return ExternalLink
}

function loadShareImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.crossOrigin = 'anonymous'
    image.onload = () => resolve(image)
    image.onerror = reject
    image.src = src
  })
}

function wrapCanvasText(context, text, x, y, maxWidth, lineHeight, maxLines = 3) {
  const words = text.split(/\s+/).filter(Boolean)
  const lines = []
  let line = ''

  words.forEach(word => {
    const testLine = line ? `${line} ${word}` : word

    if (context.measureText(testLine).width > maxWidth && line) {
      lines.push(line)
      line = word
    } else {
      line = testLine
    }
  })

  if (line) lines.push(line)

  lines.slice(0, maxLines).forEach((lineText, index) => {
    const isLastVisibleLine = index === maxLines - 1 && lines.length > maxLines
    context.fillText(isLastVisibleLine ? `${lineText.replace(/\s+\S+$/, '')}...` : lineText, x, y + (index * lineHeight))
  })
}

async function createExpertShareCard({ expert, expertImage, headline, description }) {
  const canvas = document.createElement('canvas')
  canvas.width = 1200
  canvas.height = 630
  const context = canvas.getContext('2d')

  const gradient = context.createLinearGradient(0, 0, 1200, 630)
  gradient.addColorStop(0, '#000047')
  gradient.addColorStop(0.56, '#3534cd')
  gradient.addColorStop(1, '#00b7d8')
  context.fillStyle = gradient
  context.fillRect(0, 0, 1200, 630)

  context.fillStyle = 'rgba(0, 255, 255, 0.14)'
  context.beginPath()
  context.arc(1030, 90, 255, 0, Math.PI * 2)
  context.fill()
  context.beginPath()
  context.arc(80, 570, 230, 0, Math.PI * 2)
  context.fill()

  context.strokeStyle = 'rgba(0, 255, 255, 0.78)'
  context.lineWidth = 3
  context.strokeRect(28, 28, 1144, 574)

  try {
    const logo = await loadShareImage('/Magnafic final.png')
    context.drawImage(logo, 430, 74, 360, 101)
  } catch {
    context.font = '700 54px Arial'
    context.fillStyle = '#ffffff'
    context.fillText('Magnafic', 475, 140)
  }

  context.save()
  context.beginPath()
  context.arc(248, 332, 138, 0, Math.PI * 2)
  context.closePath()
  context.fillStyle = '#ffffff'
  context.fill()
  context.clip()

  let profileDrawn = false

  if (expertImage) {
    try {
      const profile = await loadShareImage(expertImage)
      context.drawImage(profile, 110, 194, 276, 276)
      profileDrawn = true
    } catch {
      context.fillStyle = '#000047'
      context.fillRect(110, 194, 276, 276)
    }
  } else {
    context.fillStyle = '#000047'
    context.fillRect(110, 194, 276, 276)
  }

  context.restore()

  if (!profileDrawn) {
    context.font = '700 84px Arial'
    context.fillStyle = '#ffffff'
    context.textAlign = 'center'
    context.fillText(initials(expert.fullName), 248, 360)
    context.textAlign = 'left'
  }

  context.strokeStyle = '#ffffff'
  context.lineWidth = 8
  context.beginPath()
  context.arc(248, 332, 140, 0, Math.PI * 2)
  context.stroke()

  context.fillStyle = '#ffffff'
  context.font = '700 58px Arial'
  wrapCanvasText(context, expert.fullName, 450, 285, 620, 64, 2)

  context.fillStyle = '#dffcff'
  context.font = '700 30px Arial'
  wrapCanvasText(context, headline, 450, 404, 620, 38, 2)

  context.fillStyle = 'rgba(255, 255, 255, 0.88)'
  context.font = '400 25px Arial'
  wrapCanvasText(context, description, 450, 500, 620, 34, 2)

  return new Promise((resolve, reject) => {
    canvas.toBlob(blob => {
      if (blob) {
        resolve(blob)
      } else {
        reject(new Error('Unable to create share image'))
      }
    }, 'image/png')
  })
}

export default function ExpertDetail() {
  const { slug } = useParams()
  const [expert, setExpert] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isSharing, setIsSharing] = useState(false)
  const [shareStatus, setShareStatus] = useState('')

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
          keySkills,
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
  const shareDescription = expert.shortBio || intro || `Meet ${expert.fullName}, an expert consultant on Magnafic.`
  const shareTitle = `${expert.fullName} - ${headline} | Magnafic`
  const shareUrl = absoluteUrl(`/experts/${expert.slug || expert._id}`)
  const keySkills = toTextList(expert.keySkills)
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

  const handleShareExpert = async () => {
    setIsSharing(true)
    setShareStatus('')

    try {
      const shareData = {
        title: shareTitle,
        text: shareDescription,
        url: shareUrl,
      }

      if (navigator.share) {
        try {
          const shareCard = await createExpertShareCard({
            expert,
            expertImage,
            headline,
            description: shareDescription,
          })
          const shareFile = new File([shareCard], `${expert.slug || expert._id || 'magnafic-expert'}-share.png`, { type: 'image/png' })
          const fileShareData = { ...shareData, files: [shareFile] }

          if (!navigator.canShare || navigator.canShare(fileShareData)) {
            await navigator.share(fileShareData)
            setShareStatus('Shared')
            return
          }
        } catch (shareImageError) {
          console.warn('Expert share image could not be attached:', shareImageError)
        }

        await navigator.share(shareData)
        setShareStatus('Shared')
        return
      }

      await navigator.clipboard.writeText(shareUrl)
      setShareStatus('Link copied')
    } catch (shareError) {
      if (shareError?.name !== 'AbortError') {
        console.error('Expert share failed:', shareError)
        setShareStatus('Could not share')
      }
    } finally {
      setIsSharing(false)
      window.setTimeout(() => setShareStatus(''), 2400)
    }
  }

  return (
    <div className="min-h-screen bg-[#f3f2ef] px-3 pt-20 pb-10 sm:px-6 sm:pt-24 sm:pb-12 lg:px-8">
      <SEO
        title={shareTitle}
        description={shareDescription}
        path={`/experts/${expert.slug || expert._id}`}
        image={expertImage || expert.bannerImageUrl || undefined}
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'Person',
          name: expert.fullName,
          description: shareDescription,
          image: expertImage,
          jobTitle: headline,
          worksFor: company
            ? {
                '@type': 'Organization',
                name: company,
              }
            : undefined,
          url: shareUrl,
          knowsAbout: [...keySkills, ...toTextList(expert.expertiseAreas)],
        }}
      />
      <div className="mx-auto max-w-6xl">
        <Link to={capabilityPath} className="mb-4 inline-flex max-w-full items-center text-sm font-semibold text-primary-700 transition hover:text-primary-900">
          <ArrowLeft className="mr-2 h-4 w-4" />
          <span className="truncate">{backLabel}</span>
        </Link>

        <section className="rounded-lg border border-cyan-100 bg-white shadow-[0_0_24px_rgba(0,255,255,0.18)]">
          <div className="relative h-36 overflow-hidden rounded-t-lg bg-[#000047] sm:h-40 lg:h-44">
            {expert.bannerImageUrl ? (
              <img src={expert.bannerImageUrl} alt="" className="h-full w-full object-cover object-center sm:object-center" />
            ) : (
              <div className="h-full w-full bg-gradient-to-r from-[#000047] via-primary-700 to-cyan-500" />
            )}
            <div className="absolute inset-0 bg-gradient-to-r from-[#000047]/45 via-[#000047]/20 to-cyan-400/20" />
            <div className="absolute inset-y-0 right-4 flex max-w-[58%] items-center justify-end text-right text-white sm:right-24 sm:max-w-[62%] lg:right-40">
              <div>
                <h2 className="line-clamp-2 text-xl font-extrabold leading-tight tracking-normal drop-shadow-[0_4px_16px_rgba(0,0,0,0.55)] sm:text-4xl lg:text-6xl">
                  {expert.fullName}
                </h2>
                <div className="mt-2 flex flex-wrap justify-end gap-x-3 gap-y-1 text-xs font-bold text-cyan-50 drop-shadow-[0_2px_10px_rgba(0,0,0,0.45)] sm:mt-4 sm:gap-x-5 sm:gap-y-2 sm:text-base lg:text-xl">
                  {location && (
                    <span className="inline-flex items-center">
                      <MapPin className="mr-1.5 h-3.5 w-3.5 sm:mr-2 sm:h-4 sm:w-4 lg:h-5 lg:w-5" />
                      {location}
                    </span>
                  )}
                  {expert.totalYearsOfExperience ? (
                    <span className="inline-flex items-center">
                      <Timer className="mr-1.5 h-3.5 w-3.5 sm:mr-2 sm:h-4 sm:w-4 lg:h-5 lg:w-5" />
                      {expert.totalYearsOfExperience}+ years experience
                    </span>
                  ) : null}
                </div>
              </div>
            </div>
          </div>

          <div className="relative px-4 pb-5 sm:px-6 sm:pb-6">
            <div className="flex items-start justify-between gap-3 sm:gap-4">
              <div className="relative z-20 -mt-16 h-32 w-32 shrink-0 overflow-hidden rounded-full border-4 border-white bg-primary-700 text-3xl font-bold shadow-md sm:ml-5 sm:-mt-20 sm:h-44 sm:w-44 sm:text-5xl">
                <div className="flex h-full w-full items-center justify-center">
                  {expertImage ? (
                    <img src={expertImage} alt={expert.fullName} className="h-full w-full object-cover object-center" />
                  ) : (
                    <span className="text-white">{initials(expert.fullName)}</span>
                  )}
                </div>
              </div>

              <div className="mt-3 flex flex-col items-end gap-2 sm:mt-8 sm:flex-row sm:items-center">
                <span className="inline-flex w-fit items-center rounded-full bg-green-200 px-3 py-1.5 text-xs font-semibold text-green-800 sm:px-4 sm:py-2 sm:text-sm">
                  <CheckCircle2 className="mr-1.5 h-4 w-4 sm:mr-2 sm:h-5 sm:w-5" />
                  {availabilityLabel(expert.availabilityStatus)}
                </span>
                <button
                  type="button"
                  onClick={handleShareExpert}
                  disabled={isSharing}
                  className="inline-flex w-fit items-center rounded-full bg-primary-600 px-3 py-1.5 text-xs font-semibold text-white shadow-lg shadow-primary-600/20 transition hover:bg-primary-700 disabled:cursor-wait disabled:opacity-70 sm:px-4 sm:py-2 sm:text-sm"
                >
                  <Share2 className="mr-1.5 h-4 w-4 sm:mr-2 sm:h-5 sm:w-5" />
                  {isSharing ? 'Sharing...' : shareStatus || 'Share'}
                </button>
              </div>
            </div>

            <div className="mt-4 grid gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
              <div className="text-left">
                <h1 className="break-words text-2xl font-semibold leading-tight text-[#000047] sm:text-3xl">{expert.fullName}</h1>
                <p className="mt-2 break-words text-base font-medium leading-6 text-[#000047] sm:text-lg sm:leading-7">{headline}</p>
                {company && <p className="mt-1 break-words text-sm font-medium text-gray-700 sm:text-base">{company}</p>}

                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm font-medium text-gray-600 sm:text-base">
                  {location && (
                    <span className="inline-flex items-center">
                      <MapPin className="mr-1.5 h-4 w-4 text-gray-500" />
                      {location}
                    </span>
                  )}
                </div>

                {intro && (
                  <p className="mt-4 max-w-3xl text-left text-sm font-medium leading-6 text-gray-700 sm:text-base sm:leading-7">{intro}</p>
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

            <div className="lg:hidden">
              <RoadmapSection experienceItems={experienceItems} />
            </div>

            <div className="lg:hidden">
              <SkillPills title="Key skills" items={keySkills} />
            </div>

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
                    <article key={`${item.roleTitle}-${index}`} className="grid grid-cols-[3rem_minmax(0,1fr)] gap-x-4 border-b border-gray-100 pb-6 last:border-0 last:pb-0">
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
                      </div>
                      {item.description?.length > 0 && (
                        <div className="col-span-2 mt-3 space-y-3 pl-0 [&_ol]:ml-0 [&_ul]:ml-0">
                          {renderPortableText(item.description, true)}
                        </div>
                      )}
                      {toTextList(item.skillsUsed).length > 0 && (
                        <div className="col-span-2 mt-3 flex flex-wrap gap-2">
                          {toTextList(item.skillsUsed).map(skill => (
                            <span key={skill} className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-700">{skill}</span>
                          ))}
                        </div>
                      )}
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
                      {item.projectImageUrl && (
                        <div className="flex aspect-[16/9] items-center justify-center bg-gray-100 text-gray-400">
                          <img src={item.projectImageUrl} alt={item.projectTitle} className="h-full w-full object-cover" />
                        </div>
                      )}
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
            <div className="hidden lg:block">
              <SkillPills title="Key skills" items={keySkills} />
            </div>
            <div className="hidden lg:block">
              <RoadmapSection experienceItems={experienceItems} />
            </div>
          </aside>
        </div>

        <div className="mt-8 flex justify-center">
          <Link to={capabilityPath} className="inline-flex max-w-full items-center justify-center rounded-full bg-primary-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-primary-600/20 transition hover:bg-primary-700 sm:px-7 sm:text-base">
            <ArrowLeft className="mr-2 h-4 w-4" />
            <span className="truncate">{backLabel}</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
