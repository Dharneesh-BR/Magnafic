import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  Award,
  BriefcaseBusiness,
  CalendarDays,
  ChevronDown,
  CheckCircle2,
  ExternalLink,
  FileText,
  GraduationCap,
  ImageIcon,
  Lightbulb,
  MapPin,
  MessageSquareQuote,
  PlayCircle,
  Route,
  Share2,
  Timer,
  UserRound,
  Wrench
} from 'lucide-react'
import { mentorClient } from '../lib/sanityClient'
import SEO from '../components/SEO'
import { absoluteUrl } from '../lib/seo'
import { getExpertImage } from '../lib/expertImages'
import MagnaLoader from '../components/MagnaLoader'
import DescribeProblemCTA from '../components/DescribeProblemCTA'

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

const sectionIcons = {
  About: UserRound,
  Featured: Lightbulb,
  Experience: BriefcaseBusiness,
  Education: GraduationCap,
  'Licenses & Certifications': Award,
  'Projects / Case Studies': FileText,
  Recommendations: MessageSquareQuote,
  'Key skills': Wrench,
  'My Growth Story': Route,
}

function Section({ title, children, variant = 'default' }) {
  if (!children) return null
  const isGradient = variant === 'gradient'
  const Icon = sectionIcons[title] || FileText

  return (
    <section className={`rounded-lg border p-4 transition sm:p-5 ${isGradient ? 'border-white/20 bg-[linear-gradient(135deg,#000047,#2563eb_52%,#00ffff)] text-white shadow-[0_0_26px_rgba(0,255,255,0.24)] hover:shadow-[0_0_34px_rgba(0,255,255,0.32)]' : 'border-cyan-100 bg-white shadow-[0_0_22px_rgba(0,255,255,0.18)] hover:border-cyan-200 hover:shadow-[0_0_30px_rgba(0,255,255,0.26)]'}`}>
      <div className="mb-6 flex items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[linear-gradient(135deg,#000047,#3534cd_55%,#00bfcf)] shadow-md shadow-primary-900/25">
          <Icon className="h-5 w-5 text-white" aria-hidden="true" />
        </span>
        <h2 className={`text-lg font-semibold sm:text-xl ${isGradient ? 'text-white' : 'text-gray-950'}`}>{title}</h2>
      </div>
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

function roundedRect(context, x, y, width, height, radius) {
  context.beginPath()
  context.moveTo(x + radius, y)
  context.lineTo(x + width - radius, y)
  context.quadraticCurveTo(x + width, y, x + width, y + radius)
  context.lineTo(x + width, y + height - radius)
  context.quadraticCurveTo(x + width, y + height, x + width - radius, y + height)
  context.lineTo(x + radius, y + height)
  context.quadraticCurveTo(x, y + height, x, y + height - radius)
  context.lineTo(x, y + radius)
  context.quadraticCurveTo(x, y, x + radius, y)
  context.closePath()
}

function drawImageCover(context, image, x, y, width, height) {
  const sourceRatio = image.width / image.height
  const targetRatio = width / height
  let sourceWidth = image.width
  let sourceHeight = image.height
  let sourceX = 0
  let sourceY = 0

  if (sourceRatio > targetRatio) {
    sourceWidth = image.height * targetRatio
    sourceX = (image.width - sourceWidth) / 2
  } else {
    sourceHeight = image.width / targetRatio
    sourceY = (image.height - sourceHeight) / 2
  }

  context.drawImage(image, sourceX, sourceY, sourceWidth, sourceHeight, x, y, width, height)
}

async function createExpertShareCard({ expert, expertImage, headline }) {
  const canvas = document.createElement('canvas')
  canvas.width = 420
  canvas.height = 558
  const context = canvas.getContext('2d')

  const cardX = 0
  const cardY = 0
  const cardWidth = canvas.width
  const cardHeight = canvas.height
  const cardRadius = 34

  roundedRect(context, cardX, cardY, cardWidth, cardHeight, cardRadius)
  context.fillStyle = '#ffffff'
  context.fill()

  context.save()
  roundedRect(context, cardX, cardY, cardWidth, cardHeight, cardRadius)
  context.clip()

  const headerGradient = context.createLinearGradient(cardX, cardY, cardX + cardWidth, cardY + 175)
  headerGradient.addColorStop(0, '#000047')
  headerGradient.addColorStop(0.58, '#3534cd')
  headerGradient.addColorStop(1, '#00ffff')
  context.fillStyle = headerGradient
  context.fillRect(cardX, cardY, cardWidth, 180)

  try {
    const logo = await loadShareImage('/favicon.png')
    context.drawImage(logo, cardX + cardWidth - 68, cardY + 18, 46, 38)
  } catch {
    context.fillStyle = '#ffffff'
    context.font = '700 28px Arial'
    context.fillText('M', cardX + cardWidth - 56, cardY + 46)
  }

  const profileX = cardX + (cardWidth / 2)
  const profileY = cardY + 160
  const profileRadius = 78

  context.save()
  context.beginPath()
  context.arc(profileX, profileY, profileRadius, 0, Math.PI * 2)
  context.closePath()
  context.fillStyle = '#ffffff'
  context.fill()
  context.clip()

  let profileDrawn = false

  if (expertImage) {
    try {
      const profile = await loadShareImage(expertImage)
      drawImageCover(context, profile, profileX - profileRadius, profileY - profileRadius, profileRadius * 2, profileRadius * 2)
      profileDrawn = true
    } catch {
      context.fillStyle = '#e6f7ff'
      context.fillRect(profileX - profileRadius, profileY - profileRadius, profileRadius * 2, profileRadius * 2)
    }
  } else {
    context.fillStyle = '#e6f7ff'
    context.fillRect(profileX - profileRadius, profileY - profileRadius, profileRadius * 2, profileRadius * 2)
  }

  context.restore()

  if (!profileDrawn) {
    context.font = '700 54px Arial'
    context.fillStyle = '#3534cd'
    context.textAlign = 'center'
    context.fillText(initials(expert.fullName), profileX, profileY + 18)
    context.textAlign = 'left'
  }

  context.strokeStyle = '#ffffff'
  context.lineWidth = 7
  context.beginPath()
  context.arc(profileX, profileY, profileRadius + 2, 0, Math.PI * 2)
  context.stroke()

  context.textAlign = 'center'
  context.fillStyle = '#030712'
  context.font = '700 34px Arial'
  wrapCanvasText(context, expert.fullName, profileX, cardY + 280, cardWidth - 68, 38, 2)

  context.fillStyle = '#1d4ed8'
  context.font = '700 18px Arial'
  wrapCanvasText(context, headline, profileX, cardY + 338, cardWidth - 80, 24, 3)

  if (expert.totalYearsOfExperience) {
    context.fillText(`${expert.totalYearsOfExperience}+ years experience`, profileX, cardY + 472)
  }

  const expertLocation = expert.location || expert.city
  if (expertLocation) {
    context.fillText(expertLocation, profileX, cardY + 512)
  }

  const footerGradient = context.createLinearGradient(cardX, cardY + cardHeight - 10, cardX + cardWidth, cardY + cardHeight - 10)
  footerGradient.addColorStop(0, '#3534cd')
  footerGradient.addColorStop(1, '#00ffff')
  context.fillStyle = footerGradient
  context.fillRect(cardX, cardY + cardHeight - 10, cardWidth, 10)
  context.restore()

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
  const [isAboutExpanded, setIsAboutExpanded] = useState(false)
  const [shareStatus, setShareStatus] = useState('')
  const [relatedInsights, setRelatedInsights] = useState([])

  useEffect(() => {
    const fetchExpert = async () => {
      setLoading(true)
      setError('')
      setIsAboutExpanded(false)

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

        const capabilityIds = (data?.capabilities || [])
          .map(capability => capability?._id)
          .filter(Boolean)

        if (capabilityIds.length > 0) {
          const insightsQuery = `*[_type == "blog" && status != "archived" && capability._ref in $capabilityIds] | order(featured desc, publishedAt desc) {
            _id,
            title,
            "slug": slug.current,
            "imageUrl": mainImage.asset->url,
            capability->{
              title,
              "slug": slug.current
            }
          }`
          const insightsData = await mentorClient.fetch(insightsQuery, { capabilityIds })
          setRelatedInsights(insightsData || [])
        } else {
          setRelatedInsights([])
        }
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
  const shareMessage = 'Magnafic - Top-1% Expert Consulting for FMCG & Consumer Brand Growth'
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
        text: shareMessage,
        url: shareUrl,
      }

      if (navigator.share) {
        try {
          const shareCard = await createExpertShareCard({
            expert,
            expertImage,
            headline,
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
                  className="inline-flex w-fit items-center rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-600 transition hover:border-primary-200 hover:text-primary-700 disabled:cursor-wait disabled:opacity-70 sm:px-4 sm:py-2 sm:text-sm"
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
                  <div className="grid w-full max-w-[300px] grid-cols-4 gap-2">
                    {experienceLogoItems.slice(0, 12).map((item, index) => (
                      <div
                        key={`${item.companyName || 'company'}-${index}`}
                        className="flex aspect-square items-center justify-center p-1.5"
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
              <div className="relative">
                <div className={`space-y-4 transition-all duration-300 ${isAboutExpanded ? '' : 'max-h-40 overflow-hidden'}`}>
                  {aboutContent}
                </div>
                {!isAboutExpanded && (
                  <div className="pointer-events-none absolute inset-x-0 bottom-12 h-16 bg-gradient-to-t from-white to-white/0" />
                )}
                <div className="mt-4 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setIsAboutExpanded(current => !current)}
                    className="inline-flex items-center rounded-full bg-primary-50 px-4 py-2 text-sm font-bold text-primary-700 transition hover:bg-primary-100 hover:text-primary-900"
                    aria-expanded={isAboutExpanded}
                  >
                    {isAboutExpanded ? 'Show less' : 'See more'}
                    <ChevronDown className={`ml-2 h-4 w-4 transition-transform ${isAboutExpanded ? 'rotate-180' : ''}`} />
                  </button>
                </div>
              </div>
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
                    <article key={`${item.roleTitle}-${index}`} tabIndex={0} className="group grid grid-cols-[3rem_minmax(0,1fr)] gap-x-4 rounded-lg border border-transparent border-b-gray-100 p-0 pb-6 outline-none transition-all duration-300 ease-out last:border-b-transparent last:pb-0 hover:-translate-y-1 hover:border-primary-100 hover:bg-white hover:p-4 hover:pb-4 hover:shadow-xl hover:shadow-primary-900/10 focus:-translate-y-1 focus:border-primary-100 focus:bg-white focus:p-4 focus:pb-4 focus:shadow-xl focus:shadow-primary-900/10 focus:ring-2 focus:ring-primary-100">
                      <LogoFrame src={item.companyLogoUrl} alt={item.companyName || item.roleTitle} />
                      <div className="relative min-w-0 flex-1 pr-10">
                        <h3 className="font-semibold text-gray-950">{item.roleTitle}</h3>
                        <p className="mt-1 text-sm text-gray-700">
                          {[item.companyName, item.employmentType].filter(Boolean).join(' | ')}
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
                        {(item.description?.length > 0 || toTextList(item.skillsUsed).length > 0) && (
                          <span className="absolute right-0 top-0 flex h-8 w-8 items-center justify-center rounded-full bg-primary-50 text-primary-600 transition duration-300 group-hover:rotate-180 group-hover:bg-primary-600 group-hover:text-white group-focus:rotate-180 group-focus:bg-primary-600 group-focus:text-white group-focus-within:rotate-180 group-focus-within:bg-primary-600 group-focus-within:text-white" aria-hidden="true">
                            <ChevronDown className="h-4 w-4" />
                          </span>
                        )}
                      </div>
                      {item.description?.length > 0 && (
                        <div className="col-span-2 grid max-h-0 overflow-hidden opacity-0 transition-all duration-300 ease-out group-hover:mt-3 group-hover:max-h-none group-hover:opacity-100 group-focus:mt-3 group-focus:max-h-none group-focus:opacity-100 group-focus-within:mt-3 group-focus-within:max-h-none group-focus-within:opacity-100">
                          <div className="space-y-3 border-t border-gray-100 pt-3 pl-0 [&_ol]:ml-0 [&_ul]:ml-0">
                            {renderPortableText(item.description, true)}
                          </div>
                        </div>
                      )}
                      {toTextList(item.skillsUsed).length > 0 && (
                        <div className="col-span-2 flex max-h-0 flex-wrap gap-2 overflow-hidden opacity-0 transition-all duration-300 ease-out group-hover:mt-3 group-hover:max-h-none group-hover:opacity-100 group-focus:mt-3 group-focus:max-h-none group-focus:opacity-100 group-focus-within:mt-3 group-focus-within:max-h-none group-focus-within:opacity-100">
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

            {relatedInsights.length > 0 && (
              <Section title="Related Insights">
                <div className="mb-5 flex flex-wrap gap-2">
                  {assignedCapabilities.map(capability => (
                    <Link
                      key={capability._id}
                      to={`/capabilities/${capability.slug || capability._id}`}
                      className="rounded-full bg-primary-50 px-3 py-1.5 text-xs font-bold text-primary-700 transition hover:bg-primary-100"
                    >
                      {capability.title}
                    </Link>
                  ))}
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  {relatedInsights.map((insight) => (
                    <Link
                      key={insight._id}
                      to={`/insights/${insight.slug || insight._id}`}
                      className="group overflow-hidden rounded-lg border border-gray-200 bg-white transition hover:-translate-y-0.5 hover:border-primary-200 hover:shadow-lg hover:shadow-primary-900/10"
                    >
                      <div className="flex aspect-[16/9] items-center justify-center bg-gradient-to-br from-primary-700 to-cyan-500 text-white">
                        {insight.imageUrl ? (
                          <img
                            src={insight.imageUrl}
                            alt={insight.title}
                            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <FileText className="h-10 w-10 text-white/80" />
                        )}
                      </div>
                      <div className="p-4">
                        {insight.capability?.title && (
                          <p className="mb-2 text-xs font-bold uppercase tracking-[0.14em] text-primary-600">{insight.capability.title}</p>
                        )}
                        <h3 className="line-clamp-2 font-semibold leading-6 text-gray-950 transition group-hover:text-primary-600">
                          {insight.title}
                        </h3>
                      </div>
                    </Link>
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

        <DescribeProblemCTA />

        <div className="mt-8 flex justify-center">
          <Link to={capabilityPath} className="inline-flex max-w-full items-center justify-center rounded-full bg-[#000047] px-5 py-3 text-lg font-semibold text-white shadow-lg shadow-primary-600/20 transition hover:bg-primary-700 sm:px-7 sm:text-base">
            <ArrowLeft className="mr-2 h-8 w-8" />
            <span className="truncate">{backLabel}</span>
          </Link>
        </div>
      </div>

      
    </div>
  )
}
