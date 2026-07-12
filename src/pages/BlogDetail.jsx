import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Bell, Copy, Facebook, FileText, Linkedin, Mail, Share2, Twitter, User } from 'lucide-react'
import { mentorClient } from '../lib/sanityClient'
import SEO from '../components/SEO'
import { absoluteUrl } from '../lib/seo'
import MagnaLoader from '../components/MagnaLoader'
import DescribeProblemCTA from '../components/DescribeProblemCTA'
import { subscribeToInsights } from '../lib/insightSubscriptions'

function formatDate(dateString) {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  })
}

function formatShareDate(dateString) {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function formatShareCategory(category) {
  if (!category) return 'Insight'

  return category
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

function getShareTypeLabel(type) {
  switch (type) {
    case 'research':
      return 'Research'
    case 'case-study':
      return 'Case Study'
    case 'article':
      return 'Article'
    default:
      return 'Insight'
  }
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

async function createInsightShareCard({ blog }) {
  const canvas = document.createElement('canvas')
  canvas.width = 420
  canvas.height = 558
  const context = canvas.getContext('2d')
  const author = blog.experts?.[0]
  const authorName = author?.fullName || 'Magnafic'
  const authorRole = author
    ? author.headline || author.currentDesignation || author.designation || 'Expert Mentor'
    : 'Expert Insights'
  const metaItems = [
    getShareTypeLabel(blog.type),
    formatShareDate(blog.publishedAt),
    blog.readTime,
  ].filter(Boolean)
  const categoryLabel = blog.capability?.title || formatShareCategory(blog.category)

  const cardX = 0
  const cardY = 0
  const cardWidth = canvas.width
  const cardHeight = canvas.height
  const cardRadius = 24
  const imageHeight = 410
  const authorSectionY = cardY + imageHeight
  const footerStripHeight = 8

  roundedRect(context, cardX, cardY, cardWidth, cardHeight, cardRadius)
  context.fillStyle = '#ffffff'
  context.fill()

  context.save()
  roundedRect(context, cardX, cardY, cardWidth, cardHeight, cardRadius)
  context.clip()

  let imageDrawn = false

  if (blog.imageUrl) {
    try {
      const insightImage = await loadShareImage(blog.imageUrl)
      drawImageCover(context, insightImage, cardX, cardY, cardWidth, imageHeight)
      imageDrawn = true
    } catch {
      imageDrawn = false
    }
  }

  if (!imageDrawn) {
    const headerGradient = context.createLinearGradient(cardX, cardY, cardX + cardWidth, cardY + imageHeight)
    headerGradient.addColorStop(0, '#000047')
    headerGradient.addColorStop(0.58, '#3534cd')
    headerGradient.addColorStop(1, '#00ffff')
    context.fillStyle = headerGradient
    context.fillRect(cardX, cardY, cardWidth, imageHeight)
  }

  const headerOverlay = context.createLinearGradient(cardX, cardY, cardX, cardY + imageHeight)
  headerOverlay.addColorStop(0, 'rgba(0, 0, 0, 0.24)')
  headerOverlay.addColorStop(0.55, 'rgba(0, 0, 0, 0.05)')
  headerOverlay.addColorStop(1, 'rgba(0, 0, 0, 0.36)')
  context.fillStyle = headerOverlay
  context.fillRect(cardX, cardY, cardWidth, imageHeight)

  try {
    const logo = await loadShareImage('/favicon.png')
    context.drawImage(logo, cardX + cardWidth - 68, cardY + 20, 48, 48)
  } catch {
    context.fillStyle = '#ffffff'
    context.font = '800 30px Arial'
    context.fillText('M', cardX + cardWidth - 55, cardY + 54)
  }

  const categoryPillX = cardX + 20
  const categoryPillY = cardY + 20
  context.font = '900 13px Arial'
  const categoryPillWidth = Math.min(282, Math.max(128, context.measureText(categoryLabel).width + 56))
  const categoryPillHeight = 48
  context.save()
  context.shadowColor = 'rgba(0, 0, 0, 0.22)'
  context.shadowBlur = 14
  context.shadowOffsetY = 6
  roundedRect(context, categoryPillX, categoryPillY, categoryPillWidth, categoryPillHeight, 22)
  context.fillStyle = 'rgba(3, 7, 18, 0.66)'
  context.fill()
  context.restore()
  context.strokeStyle = '#ffffff'
  context.lineWidth = 1
  roundedRect(context, categoryPillX, categoryPillY, categoryPillWidth, categoryPillHeight, 22)
  context.stroke()
  context.textAlign = 'left'
  context.fillStyle = '#ffffff'
  context.font = '900 13px Arial'
  const categoryText = categoryLabel.length > 24 ? `${categoryLabel.slice(0, 23)}...` : categoryLabel
  context.fillText(categoryText.toUpperCase(), categoryPillX + 24, categoryPillY + 31)

  const titlePanelX = cardX + 20
  const titlePanelWidth = cardWidth - 40
  const titlePanelHeight = 128
  const titlePanelY = authorSectionY - titlePanelHeight - 24
  context.save()
  context.shadowColor = 'rgba(0, 0, 71, 0.16)'
  context.shadowBlur = 24
  context.shadowOffsetY = 12
  roundedRect(context, titlePanelX, titlePanelY, titlePanelWidth, titlePanelHeight, 24)
  context.fillStyle = 'rgba(243, 244, 246, 0.76)'
  context.fill()
  context.restore()

  context.fillStyle = '#030712'
  drawFittedCanvasText(context, blog.title, titlePanelX + 24, titlePanelY + 39, titlePanelWidth - 48, 3, {
    fontWeight: 700,
    maxFontSize: 26,
    minFontSize: 20,
    lineHeightRatio: 1.22,
  })

  context.fillStyle = '#f9fafb'
  context.fillRect(cardX, authorSectionY, cardWidth, cardHeight - imageHeight)
  context.strokeStyle = '#f3f4f6'
  context.lineWidth = 1
  context.beginPath()
  context.moveTo(cardX, authorSectionY + 0.5)
  context.lineTo(cardX + cardWidth, authorSectionY + 0.5)
  context.stroke()

  const metaX = cardX + 32
  const metaY = authorSectionY + 36
  context.fillStyle = '#111827'
  context.font = '900 13px Arial'
  context.fillText('AUTHOR', metaX, metaY)

  let metaCursorX = metaX + 86
  context.fillStyle = '#d1d5db'
  context.fillText('|', metaX + 66, metaY)
  context.fillStyle = '#374151'
  metaItems.forEach((item) => {
    context.fillText(`${item}`.toUpperCase(), metaCursorX, metaY)
    metaCursorX += context.measureText(`${item}`.toUpperCase()).width + 18
  })

  const authorX = cardX + 66
  const authorY = authorSectionY + 82
  const authorRadius = 28

  context.save()
  context.beginPath()
  context.arc(authorX, authorY, authorRadius, 0, Math.PI * 2)
  context.closePath()
  context.fillStyle = '#f3f4f6'
  context.fill()
  context.clip()

  let authorImageDrawn = false

  if (author?.imageUrl) {
    try {
      const authorImage = await loadShareImage(author.imageUrl)
      drawImageCover(context, authorImage, authorX - authorRadius, authorY - authorRadius, authorRadius * 2, authorRadius * 2)
      authorImageDrawn = true
    } catch {
      context.fillStyle = '#eff6ff'
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

  context.strokeStyle = '#3534cd'
  context.lineWidth = 2
  context.beginPath()
  context.arc(authorX, authorY, authorRadius + 1, 0, Math.PI * 2)
  context.stroke()

  context.textAlign = 'left'
  context.fillStyle = '#030712'
  context.font = '800 17px Arial'
  context.fillText(authorName, authorX + 42, authorY - 6)

  context.fillStyle = '#6b7280'
  context.font = '600 14px Arial'
  wrapCanvasText(context, authorRole, authorX + 42, authorY + 17, cardWidth - 132, 20, 3)

  const footerGradient = context.createLinearGradient(cardX, cardY + cardHeight - footerStripHeight, cardX + cardWidth, cardY + cardHeight - footerStripHeight)
  footerGradient.addColorStop(0, '#3534cd')
  footerGradient.addColorStop(1, '#00ffff')
  context.fillStyle = footerGradient
  context.fillRect(cardX, cardY + cardHeight - footerStripHeight, cardWidth, footerStripHeight)
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

function RelatedExpertCard({ expert }) {
  const headline = expert.headline || expert.currentDesignation || expert.designation || 'Expert Mentor'
  const profilePath = expert.slug ? `/experts/${expert.slug}` : `/experts/${expert._id}`

  return (
    <Link
      to={profilePath}
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
        {expert.imageUrl ? (
          <img
            src={expert.imageUrl}
            alt={expert.fullName}
            className="absolute left-1/2 bottom-4 h-24 w-24 -translate-x-1/2 translate-y-1/2 rounded-full border-4 border-white bg-white object-cover shadow-xl shadow-primary-900/20 transition duration-300 group-hover:scale-105 sm:h-28 sm:w-28"
          />
        ) : (
          <div className="absolute left-1/2 bottom-4 flex h-24 w-24 -translate-x-1/2 translate-y-1/2 items-center justify-center rounded-full border-4 border-white bg-primary-100 shadow-xl shadow-primary-900/20 sm:h-28 sm:w-28">
            <User className="h-10 w-10 text-primary-600" />
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4 pt-14 pb-6 text-center sm:p-4 sm:pt-16">
        <h3 className="line-clamp-2 min-h-[2.75rem] text-lg font-bold leading-tight text-gray-950">{expert.fullName}</h3>
        {headline ? (
          <p className="mt-0 line-clamp-3 min-h-[3.35rem] text-[12px] font-medium leading-[18px] text-primary-600">{headline}</p>
        ) : (
          <span className="mt-0.5 block min-h-[3.35rem]" aria-hidden="true"></span>
        )}
        {expert.totalYearsOfExperience ? (
          <p className="mt-2 line-clamp-1 min-h-[1rem] text-xs font-bold text-primary-700">
            {expert.totalYearsOfExperience}+ years experience
          </p>
        ) : (
          <span className="mt-2 block min-h-[1rem]" aria-hidden="true"></span>
        )}
        {(expert.location || expert.city) ? (
          <p className="mt-2 mb-3 line-clamp-1 min-h-[1rem] text-xs font-bold text-primary-700">{expert.location || expert.city}</p>
        ) : (
          <span className="mt-2 mb-3 block min-h-[1rem]" aria-hidden="true"></span>
        )}
        <span className="mx-auto mt-auto inline-flex items-center justify-center rounded-full bg-[#000047] px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-primary-900/20 transition group-hover:bg-primary-600 group-hover:shadow-primary-600/30">
          View Profile
          <ArrowRight className="ml-2 h-4 w-4 transition group-hover:translate-x-0.5" />
        </span>
      </div>
      <div className="absolute inset-x-0 bottom-0 h-1.5 bg-gradient-to-r from-primary-600 to-cyan-400"></div>
    </Link>
  )
}

function MoreInsightCard({ insight, isDuplicate = false }) {
  return (
    <Link
      aria-hidden={isDuplicate}
      tabIndex={isDuplicate ? -1 : undefined}
      to={`/insights/${insight.slug || insight._id}`}
      className="group relative block w-[86vw] max-w-[23rem] shrink-0 overflow-hidden rounded-[1.5rem] bg-white pb-1.5 shadow-lg shadow-primary-900/5 transition hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary-900/12 sm:w-[22rem]"
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-gradient-to-br from-indigo-500 to-blue-500">
        {insight.imageUrl ? (
          <img
            src={insight.imageUrl}
            alt={insight.title}
            className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <FileText className="h-16 w-16 text-white/80" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-black/5 to-black/35"></div>
        <div className="absolute right-5 top-5 h-12 w-12">
          <img src="/favicon.png" alt="" className="h-full w-full object-contain" />
        </div>
        <div className="absolute left-5 right-20 top-5">
          <span className="inline-flex max-w-full items-center justify-center rounded-[1.35rem] border border-white bg-gray-950/65 px-6 py-3 text-center text-sm font-black uppercase tracking-wide text-white shadow-lg shadow-black/20 backdrop-blur-sm">
            <span className="truncate">{insight.capability?.title || formatShareCategory(insight.category)}</span>
          </span>
        </div>
        <div className="absolute bottom-6 left-5 right-5 rounded-[1.5rem] bg-gray-100/80 p-5 text-gray-950 shadow-2xl shadow-primary-950/15 backdrop-blur-sm">
          <h3 className="text-xl font-semibold leading-snug text-gray-950">{insight.title}</h3>
        </div>
      </div>
      <div className="absolute inset-x-0 bottom-0 h-1.5 bg-gradient-to-r from-primary-600 to-cyan-400" aria-hidden="true"></div>
    </Link>
  )
}

function MoreInsightsCarousel({ insights }) {
  const scrollerRef = useRef(null)
  const [isPaused, setIsPaused] = useState(false)
  const shouldAutoScroll = insights.length > 1

  useEffect(() => {
    if (!shouldAutoScroll || isPaused) return undefined
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined

    let animationFrameId
    let previousTimestamp

    const moveCarousel = (timestamp) => {
      const scroller = scrollerRef.current
      if (!scroller) return

      if (previousTimestamp === undefined) previousTimestamp = timestamp
      const elapsedSeconds = Math.min((timestamp - previousTimestamp) / 1000, 0.1)
      previousTimestamp = timestamp

      const loopWidth = scroller.scrollWidth / 2
      scroller.scrollLeft += elapsedSeconds * 32

      if (loopWidth > 0 && scroller.scrollLeft >= loopWidth) {
        scroller.scrollLeft -= loopWidth
      }

      animationFrameId = window.requestAnimationFrame(moveCarousel)
    }

    animationFrameId = window.requestAnimationFrame(moveCarousel)
    return () => window.cancelAnimationFrame(animationFrameId)
  }, [isPaused, shouldAutoScroll])

  if (!insights.length) return null

  return (
    <section className="px-4 pb-12 pt-2 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.18em] text-primary-600">More Insights</p>
            <h2 className="mt-2 text-2xl font-bold text-gray-950">Continue reading</h2>
          </div>
          <Link to="/insights" className="hidden rounded-full bg-primary-50 px-5 py-2.5 text-sm font-bold text-primary-700 transition hover:bg-primary-100 sm:inline-flex">
            View all insights
          </Link>
        </div>
        <div
          ref={scrollerRef}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onFocus={() => setIsPaused(true)}
          onBlur={() => setIsPaused(false)}
          className="flex overflow-x-auto pb-5 [scrollbar-width:thin] [scrollbar-color:#3533cd_#e8e7fc]"
        >
          <div className="flex shrink-0 gap-6 pr-6">
            {insights.map((insight) => (
              <MoreInsightCard key={insight._id} insight={insight} />
            ))}
          </div>
          {shouldAutoScroll && (
            <div className="flex shrink-0 gap-6 pr-6" aria-hidden="true">
              {insights.map((insight) => (
                <MoreInsightCard key={`${insight._id}-duplicate`} insight={insight} isDuplicate />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
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
  const [subscriberEmail, setSubscriberEmail] = useState('')
  const [subscribing, setSubscribing] = useState(false)
  const [subscriptionStatus, setSubscriptionStatus] = useState({ type: '', message: '' })
  const [moreInsights, setMoreInsights] = useState([])

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
            _id,
            title,
            "slug": slug.current,
            orderedExperts[]->{
              _id,
              "slug": slug.current,
              fullName,
              "imageUrl": profileImage.asset->url,
              headline,
              currentDesignation,
              designation,
              currentCompany,
              company,
              location,
              city,
              totalYearsOfExperience
            }
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
            city,
            totalYearsOfExperience
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
        if (data?._id) {
          const moreInsightsQuery = `*[_type == "blog" && status != "archived" && _id != $currentId] | order(publishedAt desc, _updatedAt desc)[0...12] {
            _id,
            title,
            "slug": slug.current,
            category,
            type,
            "imageUrl": mainImage.asset->url,
            capability->{
              title,
              "slug": slug.current
            }
          }`
          const moreInsightsData = await mentorClient.fetch(moreInsightsQuery, { currentId: data._id })
          setMoreInsights(moreInsightsData || [])
        } else {
          setMoreInsights([])
        }
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
  const relatedExperts = useMemo(() => {
    const capabilityExperts = Array.isArray(blog?.capability?.orderedExperts) ? blog.capability.orderedExperts : []
    const fallbackExperts = Array.isArray(blog?.experts) ? blog.experts : []
    const sourceExperts = capabilityExperts.length > 0 ? capabilityExperts : fallbackExperts

    return sourceExperts.filter((expert, index, experts) => (
      expert?._id && experts.findIndex((item) => item?._id === expert._id) === index
    ))
  }, [blog?.capability?.orderedExperts, blog?.experts])
  const canNativeShare = typeof navigator !== 'undefined' && Boolean(navigator.share)

  const handleSubscribe = async (event) => {
    event.preventDefault()
    setSubscribing(true)
    setSubscriptionStatus({ type: '', message: '' })

    try {
      const email = await subscribeToInsights(subscriberEmail)
      setSubscriberEmail('')
      setSubscriptionStatus({
        type: 'success',
        message: `You're subscribed. We'll notify ${email} when new insights are published.`,
      })
    } catch (subscribeError) {
      console.error('Insight subscription failed:', subscribeError)
      setSubscriptionStatus({
        type: 'error',
        message: subscribeError.message || 'We could not subscribe you right now. Please try again.',
      })
    } finally {
      setSubscribing(false)
    }
  }

  const handleShare = async (platform) => {
    const path = `/insights/${blog.slug || blog._id}`
    const url = absoluteUrl(path)
    const linkedinUrl = `${url}?share=${encodeURIComponent((blog._updatedAt || blog.publishedAt || '').slice(0, 10) || 'latest')}`
    const title = blog.title

    try {
      if (platform === 'native' && canNativeShare) {
        setIsSharing(true)
        const shareData = {
          title,
          text: blog.excerpt || title,
          url,
        }

        try {
          const shareCard = await createInsightShareCard({ blog })
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
      <section className="relative overflow-hidden bg-primary-900 px-4 pt-24 pb-16 text-white sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_22%,rgba(0,255,255,0.16),transparent_30%),radial-gradient(circle_at_82%_14%,rgba(255,255,255,0.12),transparent_26%)]"></div>

        <div className="relative mx-auto max-w-6xl">
          <div className="mb-8 flex justify-end">
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

          <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_22rem]">
            <div>
              <p className="mb-5 text-sm font-black uppercase tracking-[0.22em] text-cyan-200">Insight</p>
              <h1 className="max-w-4xl text-3xl font-bold leading-tight sm:text-4xl md:text-6xl">
                {blog.title}
              </h1>

              {blog.excerpt && (
                <p className="mt-5 max-w-3xl text-base leading-7 text-gray-200 md:text-xl md:leading-8">
                  {blog.excerpt}
                </p>
              )}
            </div>

            {blog.imageUrl && (
              <div className="mx-auto w-full max-w-sm lg:mx-0">
                <img
                  src={blog.imageUrl}
                  alt={blog.title}
                  className="aspect-[3/4] h-[420px] w-full rounded-[1.75rem] object-cover shadow-2xl shadow-primary-950/30 ring-1 ring-white/20"
                />
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-3xl bg-white px-5 py-8 shadow-xl shadow-primary-900/5 ring-1 ring-gray-100 sm:px-10 sm:py-10 lg:px-14">
            <div className="mx-auto max-w-3xl">
              {content.length > 0 ? (
                content
              ) : (
                <p className="text-lg leading-9 text-gray-700">
                  {blog.contentText || blog.excerpt || 'This insight does not have any published content yet.'}
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 pb-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl overflow-hidden rounded-3xl bg-white shadow-xl shadow-primary-900/5 ring-1 ring-gray-100">
          <div className="grid gap-6 px-6 py-8 sm:px-8 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <div className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-full bg-primary-50 text-primary-700">
                <Bell className="h-5 w-5" />
              </div>
              <h2 className="text-2xl font-bold text-gray-950">Get new insights in your inbox</h2>
              <p className="mt-2 text-sm leading-6 text-gray-600">
                Subscribe to receive a notification whenever Magnafic publishes a new insight.
              </p>
            </div>

            <form onSubmit={handleSubscribe} className="flex min-w-0 flex-col gap-3 sm:min-w-[22rem]">
              <label htmlFor="blog-insight-subscription-email" className="sr-only">Email address</label>
              <div className="flex overflow-hidden rounded-full border border-gray-200 bg-gray-50 p-1 focus-within:border-primary-300 focus-within:ring-2 focus-within:ring-primary-100">
                <span className="flex shrink-0 items-center pl-4 text-gray-400">
                  <Mail className="h-4 w-4" />
                </span>
                <input
                  id="blog-insight-subscription-email"
                  type="text"
                  value={subscriberEmail}
                  onChange={(event) => setSubscriberEmail(event.target.value)}
                  placeholder="Email address"
                  className="min-w-0 flex-1 bg-transparent px-3 py-2.5 text-sm font-medium text-gray-900 outline-none placeholder:text-gray-400"
                  required
                />
                <button
                  type="submit"
                  disabled={subscribing}
                  className="shrink-0 rounded-full bg-primary-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {subscribing ? 'Subscribing...' : 'Subscribe'}
                </button>
              </div>
              {subscriptionStatus.message && (
                <p className={`text-sm font-semibold ${subscriptionStatus.type === 'success' ? 'text-emerald-600' : 'text-red-600'}`}>
                  {subscriptionStatus.message}
                </p>
              )}
            </form>
          </div>
        </div>
      </section>

      {relatedExperts.length > 0 && (
        <section className="px-4 pb-10 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="mb-5">
              <p className="text-sm font-black uppercase tracking-[0.18em] text-primary-600">Related Experts</p>
            </div>
            <div className="expert-scroller overflow-x-auto pb-7">
              <div className="flex snap-x snap-mandatory gap-4">
                {relatedExperts.map((expert) => (
                  <RelatedExpertCard key={expert._id} expert={expert} />
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      <DescribeProblemCTA />

      <MoreInsightsCarousel insights={moreInsights} />

      <section className="px-4 pb-16 text-center sm:px-6 lg:px-8">
        <Link to="/insights" className="inline-flex items-center rounded-full bg-primary-600 px-6 py-3 font-semibold text-white shadow-lg shadow-primary-600/20 transition hover:bg-primary-700">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Insights
        </Link>
      </section>
    </article>
  )
}
