import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Building2, Copy, Facebook, FileText, Linkedin, MapPin, Share2, Twitter, UserRound } from 'lucide-react'
import { mentorClient } from '../lib/sanityClient'
import SEO from '../components/SEO'
import { absoluteUrl } from '../lib/seo'
import MagnaLoader from '../components/MagnaLoader'

function formatDate(dateString) {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  })
}

function formatCategory(category) {
  if (!category) return 'Insight'
  return category
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
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

    if (mark === 'underline') {
      return <span key={mark} className="underline">{content}</span>
    }

    if (mark === 'code') {
      return <code key={mark} className="rounded-md bg-primary-50 px-1.5 py-0.5 text-sm font-semibold text-primary-700">{content}</code>
    }

    if (markDef?._type === 'link' && markDef.href) {
      const openInNewTab = markDef.openInNewTab !== false && markDef.blank !== false

      return (
        <a
          key={mark}
          href={markDef.href}
          target={openInNewTab ? '_blank' : undefined}
          rel={openInNewTab ? 'noreferrer' : undefined}
          className="font-semibold text-primary-600 underline decoration-primary-200 underline-offset-4 hover:text-primary-700"
        >
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

function renderBlock(block) {
  if (block._type === 'image') {
    const imageUrl = block.asset?.url

    if (!imageUrl) return null

    return (
      <figure key={block._key} className="my-12">
        <img
          src={imageUrl}
          alt={block.alt || ''}
          className="w-full rounded-[2rem] object-cover shadow-2xl shadow-primary-900/10"
        />
        {block.caption && (
          <figcaption className="mt-4 text-center text-sm font-medium text-gray-500">{block.caption}</figcaption>
        )}
      </figure>
    )
  }

  if (block._type === 'codeBlock') {
    return (
      <div key={block._key} className="my-10 overflow-hidden rounded-2xl bg-gray-950 shadow-xl shadow-primary-900/10">
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-gray-400">
          <span>{block.filename || 'Code'}</span>
          {block.language && <span>{block.language}</span>}
        </div>
        <pre className="overflow-x-auto p-5 text-sm leading-7 text-cyan-50">
          <code>{block.code}</code>
        </pre>
      </div>
    )
  }

  if (block._type === 'cta') {
    const styleClasses = {
      primary: 'bg-primary-600 text-white hover:bg-primary-700',
      secondary: 'bg-cyan-100 text-primary-800 hover:bg-cyan-200',
      outline: 'border border-primary-200 bg-white text-primary-700 hover:bg-primary-50',
    }

    return (
      <div key={block._key} className="my-10">
        <a
          href={block.url}
          className={`inline-flex rounded-full px-6 py-3 font-semibold shadow-lg shadow-primary-900/10 transition ${styleClasses[block.style] || styleClasses.primary}`}
        >
          {block.text}
        </a>
      </div>
    )
  }

  if (block._type !== 'block') return null

  switch (block.style) {
    case 'h1':
      return <h1 key={block._key} className="mt-14 mb-5 text-4xl font-bold leading-tight text-gray-950">{renderBlockText(block)}</h1>
    case 'h2':
      return <h2 key={block._key} className="mt-14 mb-5 text-3xl font-bold leading-tight text-gray-950">{renderBlockText(block)}</h2>
    case 'h3':
      return <h3 key={block._key} className="mt-10 mb-4 text-2xl font-semibold leading-tight text-gray-950">{renderBlockText(block)}</h3>
    case 'blockquote':
      return (
        <blockquote key={block._key} className="my-10 rounded-r-[2rem] border-l-4 border-cyan-400 bg-primary-50/80 px-7 py-6 text-xl font-semibold italic leading-9 text-primary-900">
          {renderBlockText(block)}
        </blockquote>
      )
    default:
      return <p key={block._key} className="mb-7 text-lg leading-9 text-gray-700">{renderBlockText(block)}</p>
  }
}

function renderContent(blocks = []) {
  const rendered = []

  for (let index = 0; index < blocks.length; index += 1) {
    const block = blocks[index]

    if (block._type === 'block' && block.listItem) {
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
        <ListTag
          key={block._key}
          className={`mb-9 ml-6 space-y-3 text-lg leading-9 text-gray-700 marker:font-bold marker:text-primary-600 ${
            listType === 'ol' ? 'list-decimal' : 'list-disc'
          }`}
        >
          {items.map(item => (
            <li key={item._key}>{renderBlockText(item)}</li>
          ))}
        </ListTag>
      )
      continue
    }

    rendered.push(renderBlock(block))
  }

  return rendered
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
  const words = `${text || ''}`.split(/\s+/).filter(Boolean)
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

function getCanvasTextLines(context, text, maxWidth) {
  const words = `${text || ''}`.split(/\s+/).filter(Boolean)
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
  return lines
}

function drawFittedCanvasText(context, text, x, y, maxWidth, maxLines, {
  fontWeight = 700,
  fontFamily = 'Arial',
  maxFontSize = 30,
  minFontSize = 20,
  lineHeightRatio = 1.18,
} = {}) {
  let fontSize = maxFontSize
  let lines = []

  while (fontSize >= minFontSize) {
    context.font = `${fontWeight} ${fontSize}px ${fontFamily}`
    lines = getCanvasTextLines(context, text, maxWidth)

    if (lines.length <= maxLines) break
    fontSize -= 1
  }

  const lineHeight = Math.round(fontSize * lineHeightRatio)
  lines.slice(0, maxLines).forEach((lineText, index) => {
    context.fillText(lineText, x, y + (index * lineHeight))
  })

  return {
    lineCount: Math.min(lines.length, maxLines),
    lineHeight,
    fontSize,
  }
}

function initials(name = '') {
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
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

async function createInsightShareCard({ blog, categoryLabel }) {
  const canvas = document.createElement('canvas')
  canvas.width = 420
  canvas.height = 558
  const context = canvas.getContext('2d')
  const author = blog.experts?.[0]
  const authorName = author?.fullName || 'Magnafic'
  const authorRole = author
    ? author.headline || author.currentDesignation || author.designation || 'Expert Mentor'
    : 'Expert Insights'

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

  const headerHeight = 206
  let headerImageDrawn = false

  if (blog.imageUrl) {
    try {
      const insightImage = await loadShareImage(blog.imageUrl)
      drawImageCover(context, insightImage, cardX, cardY, cardWidth, headerHeight)
      headerImageDrawn = true
    } catch {
      headerImageDrawn = false
    }
  }

  if (!headerImageDrawn) {
    const headerGradient = context.createLinearGradient(cardX, cardY, cardX + cardWidth, cardY + headerHeight)
    headerGradient.addColorStop(0, '#000047')
    headerGradient.addColorStop(0.58, '#3534cd')
    headerGradient.addColorStop(1, '#00ffff')
    context.fillStyle = headerGradient
    context.fillRect(cardX, cardY, cardWidth, headerHeight)
  }

  const headerOverlay = context.createLinearGradient(cardX, cardY, cardX, cardY + headerHeight)
  headerOverlay.addColorStop(0, 'rgba(0, 0, 71, 0.08)')
  headerOverlay.addColorStop(1, 'rgba(0, 0, 71, 0.32)')
  context.fillStyle = headerOverlay
  context.fillRect(cardX, cardY, cardWidth, headerHeight)

  try {
    const logo = await loadShareImage('/favicon.png')
    context.drawImage(logo, cardX + cardWidth - 68, cardY + 18, 46, 38)
  } catch {
    context.fillStyle = '#ffffff'
    context.font = '700 28px Arial'
    context.fillText('M', cardX + cardWidth - 56, cardY + 46)
  }

  context.textAlign = 'center'
  context.fillStyle = '#030712'
  const titleMetrics = drawFittedCanvasText(context, blog.title, cardX + (cardWidth / 2), cardY + 252, cardWidth - 56, 6, {
    maxFontSize: 30,
    minFontSize: 21,
    lineHeightRatio: 1.15,
  })

  const titleBottom = cardY + 252 + ((titleMetrics.lineCount - 1) * titleMetrics.lineHeight)

  const authorX = cardX + 70
  const authorY = Math.min(Math.max(titleBottom + 68, cardY + 430), cardY + 444)
  const authorRadius = 24
  const authorBandX = cardX + 34
  const authorBandY = authorY - 38
  const authorBandWidth = cardWidth - 68
  const authorBandHeight = 76

  roundedRect(context, authorBandX, authorBandY, authorBandWidth, authorBandHeight, 18)
  context.fillStyle = '#f3f4f6'
  context.fill()

  context.save()
  context.beginPath()
  context.arc(authorX, authorY, authorRadius, 0, Math.PI * 2)
  context.closePath()
  context.fillStyle = '#e6f7ff'
  context.fill()
  context.clip()

  let authorImageDrawn = false

  if (author?.imageUrl) {
    try {
      const authorImage = await loadShareImage(author.imageUrl)
      drawImageCover(context, authorImage, authorX - authorRadius, authorY - authorRadius, authorRadius * 2, authorRadius * 2)
      authorImageDrawn = true
    } catch {
      context.fillStyle = '#e6f7ff'
      context.fillRect(authorX - authorRadius, authorY - authorRadius, authorRadius * 2, authorRadius * 2)
    }
  }

  context.restore()

  if (!authorImageDrawn) {
    context.font = '700 18px Arial'
    context.fillStyle = '#3534cd'
    context.textAlign = 'center'
    context.fillText(initials(authorName) || 'M', authorX, authorY + 7)
  }

  context.strokeStyle = '#ffffff'
  context.lineWidth = 4
  context.beginPath()
  context.arc(authorX, authorY, authorRadius + 1, 0, Math.PI * 2)
  context.stroke()

  context.textAlign = 'left'
  context.fillStyle = '#030712'
  context.font = '700 17px Arial'
  context.fillText(authorName, authorX + 38, authorY - 4)

  context.fillStyle = '#6b7280'
  context.font = '600 13px Arial'
  wrapCanvasText(context, authorRole, authorX + 38, authorY + 16, cardWidth - 128, 17, 1)

  const metaY = authorY + 64

  context.textAlign = 'center'
  context.fillStyle = '#1d4ed8'
  context.font = '700 18px Arial'
  wrapCanvasText(context, categoryLabel, cardX + (cardWidth / 2), metaY, cardWidth - 80, 24, 1)

  const publishedLabel = formatDate(blog.publishedAt)
  if (publishedLabel) {
    context.fillStyle = '#1d4ed8'
    context.font = '700 16px Arial'
    context.fillText(publishedLabel, cardX + (cardWidth / 2), metaY + 30)
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

function ExpertInsightCard({ expert }) {
  const headline = expert.headline || expert.currentDesignation || expert.designation || 'Expert Mentor'
  const company = expert.currentCompany || expert.company
  const location = expert.location || expert.city
  const profilePath = expert.slug ? `/experts/${expert.slug}` : `/experts/${expert._id}`

  return (
    <Link
      to={profilePath}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-lg shadow-primary-900/5 transition hover:-translate-y-1 hover:border-cyan-200 hover:shadow-xl hover:shadow-primary-900/10 sm:flex-row"
    >
      <div className="relative flex h-56 shrink-0 items-end justify-center bg-gradient-to-br from-cyan-100 via-sky-100 to-primary-100 sm:h-auto sm:w-44">
        {expert.imageUrl ? (
          <img src={expert.imageUrl} alt={expert.fullName} className="h-full w-full object-contain object-bottom p-3" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-primary-600">
            <UserRound className="h-16 w-16" />
          </div>
        )}
      </div>
      <div className="flex min-w-0 flex-1 flex-col justify-center p-5 sm:p-6">
        <h3 className="break-words text-xl font-bold leading-tight text-gray-950">{expert.fullName}</h3>
        <p className="mt-2 break-words text-sm font-semibold leading-6 text-primary-700">{headline}</p>
        <div className="mt-4 space-y-2 text-sm font-medium text-gray-600">
          {company && (
            <p className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-primary-500" />
              <span>{company}</span>
            </p>
          )}
          {location && (
            <p className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary-500" />
              <span>{location}</span>
            </p>
          )}
        </div>
        <span className="mt-5 inline-flex w-fit items-center rounded-full bg-primary-50 px-4 py-2 text-sm font-bold text-primary-700 transition group-hover:bg-primary-600 group-hover:text-white">
          View profile
        </span>
      </div>
    </Link>
  )
}

export default function BlogDetail() {
  const { slug } = useParams()
  const [blog, setBlog] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [shareMenuOpen, setShareMenuOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [isSharing, setIsSharing] = useState(false)

  useEffect(() => {
    const fetchBlog = async () => {
      setLoading(true)
      setError('')

      try {
        const query = `*[_type == "blog" && status != "archived" && (slug.current == $slug || _id == $slug)][0] {
          _id,
          title,
          "slug": slug.current,
          excerpt,
          type,
          category,
          publishedAt,
          _updatedAt,
          readTime,
          "imageUrl": mainImage.asset->url,
          capability->{
            title,
            "slug": slug.current
          },
          experts[]->{
            _id,
            fullName,
            "slug": slug.current,
            "imageUrl": profileImage.asset->url,
            headline,
            currentDesignation,
            designation,
            currentCompany,
            company,
            location,
            city
          },
          "content": coalesce(
            content[]{..., asset->{url}},
            body[]{..., asset->{url}},
            articleBody[]{..., asset->{url}},
            []
          ),
          "contentText": coalesce(string(content), string(body), string(articleBody))
        }`

        const data = await mentorClient.fetch(query, { slug })
        setBlog(data)
      } catch (fetchError) {
        console.error('Error fetching blog:', fetchError)
        setError('We could not load this insight right now.')
      } finally {
        setLoading(false)
      }
    }

    fetchBlog()
  }, [slug])

  const content = useMemo(() => renderContent(blog?.content), [blog?.content])
  const canNativeShare = typeof navigator !== 'undefined' && Boolean(navigator.share)

  const handleShare = async (platform) => {
    const path = `/insights/${blog.slug || blog._id}`
    const url = absoluteUrl(path)
    const linkedinUrl = `${url}?share=${encodeURIComponent((blog._updatedAt || blog.publishedAt || '').slice(0, 10) || 'latest')}`
    const title = blog.title
    const categoryLabel = formatCategory(blog.type || blog.category || blog.capability?.title)

    try {
      if (platform === 'native' && canNativeShare) {
        setIsSharing(true)
        const shareData = {
          title,
          text: blog.excerpt || title,
          url,
        }

        try {
          const shareCard = await createInsightShareCard({ blog, categoryLabel })
          const shareFile = new File([shareCard], `${blog.slug || blog._id || 'magnafic-insight'}-share.png`, { type: 'image/png' })
          const fileShareData = { ...shareData, files: [shareFile] }

          if (!navigator.canShare || navigator.canShare(fileShareData)) {
            await navigator.share(fileShareData)
            setShareMenuOpen(false)
            return
          }
        } catch (shareImageError) {
          console.warn('Insight share image could not be attached:', shareImageError)
        }

        await navigator.share(shareData)
        setShareMenuOpen(false)
        return
      }

      if (platform === 'copy') {
        await navigator.clipboard.writeText(url)
        setCopied(true)
        setShareMenuOpen(false)
        window.setTimeout(() => setCopied(false), 1800)
        return
      }

      const shareUrls = {
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
        twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
        linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(linkedinUrl)}`,
      }

      if (shareUrls[platform]) {
        window.open(shareUrls[platform], '_blank', 'width=600,height=420')
        setShareMenuOpen(false)
      }
    } catch (shareError) {
      console.error('Error sharing insight:', shareError)
      setShareMenuOpen(false)
    } finally {
      setIsSharing(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white px-4 pt-32 pb-20">
        <MagnaLoader message="Loading insight..." className="mx-auto max-w-4xl" />
      </div>
    )
  }

  if (error || !blog) {
    return (
      <div className="min-h-screen bg-white px-4 pt-32 pb-20">
        <div className="mx-auto max-w-3xl text-center">
          <FileText className="mx-auto mb-6 h-14 w-14 text-primary-500" />
          <h1 className="mb-4 text-3xl font-bold text-gray-950">Insight not found</h1>
          <p className="mb-8 text-gray-600">{error || 'The insight you are looking for is not available.'}</p>
          <Link to="/insights" className="inline-flex items-center rounded-full bg-primary-600 px-6 py-3 font-semibold text-white hover:bg-primary-700">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Insights
          </Link>
        </div>
      </div>
    )
  }

  return (
    <article className="min-h-screen bg-[#f7f9ff]">
      <SEO
        title={blog.title}
        description={blog.excerpt}
        path={`/insights/${blog.slug || blog._id}`}
        image={blog.imageUrl}
        type="article"
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: blog.title,
          description: blog.excerpt,
          image: blog.imageUrl,
          datePublished: blog.publishedAt,
          mainEntityOfPage: absoluteUrl(`/insights/${blog.slug || blog._id}`),
          publisher: {
            '@type': 'Organization',
            name: 'Magnafic',
            logo: {
              '@type': 'ImageObject',
              url: absoluteUrl('/Magnafic.png'),
            },
          },
        }}
      />
      <section className="relative overflow-hidden bg-primary-900 px-4 pt-24 pb-20 text-white sm:px-6 lg:px-8">
        {blog.imageUrl && (
          <>
            <img
              src={blog.imageUrl}
              alt=""
              aria-hidden="true"
              className="absolute inset-0 h-full w-full object-cover opacity-25"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-primary-900 via-primary-900/95 to-cyan-900/80"></div>
          </>
        )}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_22%,rgba(0,255,255,0.16),transparent_30%),radial-gradient(circle_at_82%_14%,rgba(255,255,255,0.12),transparent_26%)]"></div>

        <div className="relative mx-auto max-w-6xl">
          <div className="mb-10 flex flex-wrap items-center justify-between gap-4">
            <Link to="/insights" className="inline-flex items-center rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-cyan-100 ring-1 ring-white/15 transition hover:bg-white/15 hover:text-white">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Insights
            </Link>

            <div className="relative">
              <button
                type="button"
                onClick={() => setShareMenuOpen(open => !open)}
                className="inline-flex items-center rounded-full bg-white px-4 py-2 text-sm font-bold text-primary-700 shadow-lg shadow-primary-950/10 transition hover:bg-cyan-50"
              >
                <Share2 className="mr-2 h-4 w-4" />
                {isSharing ? 'Sharing...' : copied ? 'Copied' : 'Share'}
              </button>
              {shareMenuOpen && (
                <div className="absolute right-0 z-20 mt-2 w-52 overflow-hidden rounded-2xl border border-white/20 bg-white py-2 text-gray-700 shadow-2xl shadow-primary-950/20">
                  {canNativeShare && (
                    <button
                      type="button"
                      onClick={() => handleShare('native')}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm font-semibold hover:bg-gray-50"
                    >
                      <Share2 className="h-4 w-4 text-primary-600" />
                      Share
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleShare('facebook')}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm font-semibold hover:bg-gray-50"
                  >
                    <Facebook className="h-4 w-4 text-blue-600" />
                    Facebook
                  </button>
                  <button
                    type="button"
                    onClick={() => handleShare('twitter')}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm font-semibold hover:bg-gray-50"
                  >
                    <Twitter className="h-4 w-4 text-sky-500" />
                    Twitter
                  </button>
                  <button
                    type="button"
                    onClick={() => handleShare('linkedin')}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm font-semibold hover:bg-gray-50"
                  >
                    <Linkedin className="h-4 w-4 text-blue-700" />
                    LinkedIn
                  </button>
                  <button
                    type="button"
                    onClick={() => handleShare('copy')}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm font-semibold hover:bg-gray-50"
                  >
                    <Copy className="h-4 w-4 text-gray-600" />
                    Copy link
                  </button>
                </div>
              )}
            </div>
          </div>

          <div>
            <h1 className="max-w-5xl text-3xl font-bold leading-tight sm:text-4xl md:text-6xl">
              {blog.title}
            </h1>

            {blog.excerpt && (
              <p className="mt-5 max-w-3xl text-base leading-7 text-gray-200 md:text-xl md:leading-8">
                {blog.excerpt}
              </p>
            )}
          </div>
        </div>
      </section>

      {blog.imageUrl && (
        <div className="relative px-4 sm:px-6 lg:px-8">
          <div className="mx-auto -mt-12 max-w-6xl">
            <img
              src={blog.imageUrl}
              alt={blog.title}
              className="h-[220px] w-full rounded-3xl object-cover shadow-2xl shadow-primary-900/20 ring-1 ring-white sm:h-[300px] md:h-[500px]"
            />
          </div>
        </div>
      )}

      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[330px_1fr]">
          <aside>
            <div className="sticky top-24 rounded-[1.75rem] bg-white p-7 shadow-xl shadow-primary-900/5 ring-1 ring-gray-100">
              <p className="mb-6 text-sm font-black uppercase tracking-[0.22em] text-gray-400">Insight</p>
              <div className="space-y-4 text-lg font-medium text-gray-700">
                {blog.category && (
                  <p className="rounded-2xl bg-[#e8e5ff] px-5 py-3 font-semibold text-[#000047]">{formatCategory(blog.category)}</p>
                )}
                {blog.capability?.title && (
                  <p className="rounded-2xl bg-[#ddfbfb] px-5 py-3 font-semibold text-[#000047]">{blog.capability.title}</p>
                )}
                {blog.publishedAt && <p className="px-1 pt-2">{formatDate(blog.publishedAt)}</p>}
                {blog.readTime && <p className="px-1">{blog.readTime}</p>}
              </div>
            </div>
          </aside>

          <div className="rounded-3xl bg-white px-5 py-8 shadow-xl shadow-primary-900/5 ring-1 ring-gray-100 sm:px-10 sm:py-10 lg:px-14">
            <div className="mx-auto max-w-3xl">
              {content.length > 0 ? (
                content
              ) : (
                <p className="text-lg leading-9 text-gray-700">
                  {blog.contentText || blog.excerpt || 'This insight does not have any published content yet.'}
                </p>
              )}

              {blog.experts?.length > 0 && (
                <section className="mt-14 border-t border-gray-200 pt-10">
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-950">Author</h2>
                  </div>
                  <div className="grid gap-5">
                    {blog.experts.map((expert) => (
                      <ExpertInsightCard key={expert._id} expert={expert} />
                    ))}
                  </div>
                </section>
              )}

              <div className="mt-14 border-t border-gray-200 pt-8">
                <Link to="/insights" className="inline-flex items-center rounded-full bg-primary-600 px-6 py-3 font-semibold text-white shadow-lg shadow-primary-600/20 transition hover:bg-primary-700">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Insights
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </article>
  )
}
