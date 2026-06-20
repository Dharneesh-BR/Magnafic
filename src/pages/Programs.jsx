import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
  Award,
  Bot,
  CalendarDays,
  Check,
  CheckCircle2,
  Clock,
  Factory,
  GitCompareArrows,
  GraduationCap,
  HelpCircle,
  Laptop,
  Loader2,
  MapPin,
  Quote,
  Share2,
  Sparkles,
  Users,
  UsersRound,
  X,
} from 'lucide-react'
import SEO from '../components/SEO'
import MagnaLoader from '../components/MagnaLoader'
import { mentorClient } from '../lib/sanityClient'

function formatDate(value) {
  if (!value) return ''

  return new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function formatTime(value) {
  if (!value) return ''

  return new Date(value).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  })
}

function formatCurrencyAmount(value, currency) {
  const amount = Number(value)
  if (!Number.isFinite(amount)) return ''

  try {
    return new Intl.NumberFormat('en', {
      style: 'currency',
      currency: currency || 'INR',
      maximumFractionDigits: amount % 1 === 0 ? 0 : 2,
    }).format(amount)
  } catch {
    return `${currency || ''} ${amount.toLocaleString('en')}`.trim()
  }
}

function getDiscountedPrice(option) {
  const price = Number(option?.price)
  const discountValue = Number(option?.discountValue)

  if (!Number.isFinite(price)) return null
  if (!Number.isFinite(discountValue) || option.discountType === 'none') return price

  if (option.discountType === 'percentage') {
    return Math.max(price - (price * discountValue / 100), 0)
  }

  if (option.discountType === 'fixed') {
    return Math.max(price - discountValue, 0)
  }

  return price
}

function ProgramPricing({ program, light = false }) {
  const pricingOptions = (program.pricingOptions || []).filter((option) => (
    option?.currency && Number.isFinite(Number(option.price))
  ))

  if (program.pricingType === 'free') {
    return <p className={`font-black ${light ? 'text-white' : 'text-primary-700'}`}>Free</p>
  }

  if (program.pricingType === 'contact') {
    return <p className={`font-black ${light ? 'text-white' : 'text-primary-700'}`}>Contact us for pricing</p>
  }

  if (program.pricingType === 'invite-only') {
    return <p className={`font-black ${light ? 'text-white' : 'text-primary-700'}`}>Invite-only</p>
  }

  if (!pricingOptions.length) {
    return program.price
      ? <p className={`font-black ${light ? 'text-white' : 'text-primary-700'}`}>{program.price}</p>
      : null
  }

  return (
    <div className="flex flex-wrap gap-3">
      {pricingOptions.map((option, index) => {
        const discountedPrice = getDiscountedPrice(option)
        const hasDiscount = discountedPrice !== Number(option.price)
        const discountLabel = option.discountType === 'percentage'
          ? `${option.discountValue}% off`
          : option.discountType === 'fixed'
            ? `${formatCurrencyAmount(option.discountValue, option.currency)} off`
            : ''

        return (
          <div
            key={`${option.currency}-${index}`}
            className={`rounded-xl px-4 py-3 ${
              light
                ? 'border border-white/25 bg-white/10 text-white backdrop-blur-sm'
                : 'border border-primary-100 bg-primary-50 text-gray-950'
            }`}
          >
            {option.label && <p className={`mb-1 text-xs font-bold uppercase tracking-wide ${light ? 'text-cyan-100' : 'text-primary-600'}`}>{option.label}</p>}
            <div className="flex flex-wrap items-baseline gap-2">
              <span className="text-xl font-black">{formatCurrencyAmount(discountedPrice, option.currency)}</span>
              <span className={`text-xs font-extrabold uppercase ${light ? 'text-cyan-100' : 'text-primary-600'}`}>{option.currency}</span>
              {hasDiscount && (
                <span className={`text-sm font-semibold line-through ${light ? 'text-white/60' : 'text-gray-400'}`}>
                  {formatCurrencyAmount(option.price, option.currency)}
                </span>
              )}
            </div>
            {hasDiscount && <p className={`mt-1 text-xs font-bold ${light ? 'text-cyan-100' : 'text-emerald-700'}`}>{discountLabel}</p>}
          </div>
        )
      })}
    </div>
  )
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

function roundedCanvasRect(context, x, y, width, height, radius) {
  context.beginPath()
  context.roundRect(x, y, width, height, radius)
  context.closePath()
}

function drawImageContain(context, image, x, y, width, height) {
  const scale = Math.min(width / image.width, height / image.height)
  const drawWidth = image.width * scale
  const drawHeight = image.height * scale
  context.drawImage(
    image,
    x + ((width - drawWidth) / 2),
    y + ((height - drawHeight) / 2),
    drawWidth,
    drawHeight
  )
}

function drawWrappedText(context, text, x, y, maxWidth, lineHeight, maxLines) {
  const words = String(text || '').split(/\s+/).filter(Boolean)
  const lines = []
  let line = ''

  words.forEach((word) => {
    const candidate = line ? `${line} ${word}` : word
    if (context.measureText(candidate).width > maxWidth && line) {
      lines.push(line)
      line = word
    } else {
      line = candidate
    }
  })
  if (line) lines.push(line)

  lines.slice(0, maxLines).forEach((lineText, index) => {
    const shouldTruncate = index === maxLines - 1 && lines.length > maxLines
    context.fillText(shouldTruncate ? `${lineText}...` : lineText, x, y + (index * lineHeight))
  })
}

async function createProgramShareCard(program) {
  await document.fonts?.ready

  const canvas = document.createElement('canvas')
  canvas.width = 420
  canvas.height = 544
  const context = canvas.getContext('2d')
  const fontFamily = '"Quicksand", Arial, sans-serif'

  roundedCanvasRect(context, 0, 0, canvas.width, canvas.height, 24)
  context.save()
  context.clip()

  const background = context.createLinearGradient(0, 0, canvas.width, canvas.height)
  background.addColorStop(0, '#000047')
  background.addColorStop(0.58, '#3534cd')
  background.addColorStop(1, '#00bfcf')
  context.fillStyle = background
  context.fillRect(0, 0, canvas.width, canvas.height)

  if (program.heroImageUrl) {
    try {
      const heroImage = await loadShareImage(program.heroImageUrl)
      drawImageContain(context, heroImage, 0, 0, canvas.width, canvas.height)
    } catch (imageError) {
      console.warn('Program share artwork could not be loaded:', imageError)
    }
  }

  const overlay = context.createLinearGradient(0, 0, 0, canvas.height)
  overlay.addColorStop(0, 'rgba(0,0,0,0.15)')
  overlay.addColorStop(0.55, 'rgba(0,0,0,0)')
  overlay.addColorStop(1, 'rgba(0,0,0,0.38)')
  context.fillStyle = overlay
  context.fillRect(0, 0, canvas.width, canvas.height)

  try {
    const logo = await loadShareImage('/favicon.png')
    context.drawImage(logo, canvas.width - 68, 20, 48, 48)
  } catch {
    // The card remains usable if the local logo cannot be loaded.
  }

  const typeLabel = formatLabel(program.programType)
  context.font = `800 15px ${fontFamily}`
  const badgeWidth = Math.min(context.measureText(typeLabel.toUpperCase()).width + 52, 280)
  roundedCanvasRect(context, 20, 20, badgeWidth, 54, 27)
  context.fillStyle = 'rgba(3,7,18,0.68)'
  context.fill()
  context.strokeStyle = '#ffffff'
  context.lineWidth = 1.5
  context.stroke()
  context.fillStyle = '#ffffff'
  context.textAlign = 'center'
  context.fillText(typeLabel.toUpperCase(), 20 + (badgeWidth / 2), 53)

  const panelX = 20
  const panelY = canvas.height - 190
  const panelWidth = canvas.width - 40
  const panelHeight = 166
  roundedCanvasRect(context, panelX, panelY, panelWidth, panelHeight, 24)
  context.fillStyle = 'rgba(243,244,246,0.78)'
  context.fill()

  context.textAlign = 'left'
  context.fillStyle = '#030712'
  context.font = `600 25px ${fontFamily}`
  drawWrappedText(context, program.title, panelX + 24, panelY + 42, panelWidth - 48, 34, 3)

  const metadata = [
    program.duration,
    program.startDate && formatDate(program.startDate),
    program.startDate && formatTime(program.startDate),
  ].filter(Boolean).join(' | ')

  if (metadata) {
    context.fillStyle = '#374151'
    context.font = `800 14px ${fontFamily}`
    context.fillText(metadata.toUpperCase(), panelX + 24, panelY + panelHeight - 25)
  }

  const footerGradient = context.createLinearGradient(0, canvas.height - 8, canvas.width, canvas.height - 8)
  footerGradient.addColorStop(0, '#3534cd')
  footerGradient.addColorStop(1, '#00ffff')
  context.fillStyle = footerGradient
  context.fillRect(0, canvas.height - 8, canvas.width, 8)
  context.restore()

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob)
      else reject(new Error('Unable to create the Program share card.'))
    }, 'image/png')
  })
}

function startOfDay(value) {
  if (!value) return null

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null

  date.setHours(0, 0, 0, 0)
  return date
}

function getProgramDateGroup(program, today = new Date()) {
  const todayStart = startOfDay(today)
  const start = startOfDay(program.startDate)
  const end = startOfDay(program.endDate || program.startDate)

  if (!start && !end) return 'upcoming'
  if (end && end < todayStart) return 'past'
  if (start && start > todayStart) return 'upcoming'
  return 'current'
}

function formatLabel(value) {
  if (!value) return ''

  return value
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

function renderBlockText(block) {
  return block.children?.map(child => child.text).join('') || ''
}

function RichText({ blocks = [] }) {
  if (!blocks.length) return null

  return (
    <div className="space-y-4 text-base leading-8 text-gray-700">
      {blocks.map((block) => {
        const text = renderBlockText(block)
        if (!text) return null

        if (block.style === 'h2') {
          return <h2 key={block._key} className="text-2xl font-bold text-gray-950">{text}</h2>
        }

        if (block.style === 'h3') {
          return <h3 key={block._key} className="text-xl font-bold text-gray-950">{text}</h3>
        }

        if (block.listItem) {
          return (
            <div key={block._key} className="flex gap-3">
              <CheckCircle2 className="mt-1.5 h-5 w-5 shrink-0 text-primary-600" />
              <p>{text}</p>
            </div>
          )
        }

        return <p key={block._key}>{text}</p>
      })}
    </div>
  )
}

function ProgramMeta({ program, onShare, shareStatus }) {
  const metaItems = [
    program.programType && { icon: GraduationCap, label: formatLabel(program.programType) },
    program.deliveryMode && { icon: Laptop, label: formatLabel(program.deliveryMode) },
    program.startDate && { icon: CalendarDays, label: formatDate(program.startDate) },
    program.duration && { icon: Clock, label: program.duration },
    onShare && { icon: Share2, label: shareStatus || 'Share', action: onShare },
    program.location && { icon: MapPin, label: program.location },
    program.seats ? { icon: Users, label: `${program.seats} seats` } : null,
  ].filter(Boolean)

  return (
    <div className="flex flex-wrap gap-2">
      {metaItems.map((item) => item.action ? (
        <button
          key="share-program"
          type="button"
          onClick={item.action}
          className="inline-flex items-center rounded-full bg-white/12 px-3 py-1.5 text-sm font-bold text-white ring-1 ring-white/15 transition hover:bg-white hover:text-primary-700"
          aria-label="Share session"
          title="Share session"
        >
          <item.icon className="mr-1.5 h-4 w-4" />
          {item.label}
        </button>
      ) : (
        <span key={`${item.label}-${item.icon.displayName || item.icon.name}`} className="inline-flex items-center rounded-full bg-white/12 px-3 py-1.5 text-sm font-bold text-white ring-1 ring-white/15">
          <item.icon className="mr-1.5 h-4 w-4" />
          {item.label}
        </span>
      ))}
    </div>
  )
}

function ProgramExperts({ mentors = [] }) {
  if (!mentors.length) return null

  return (
    <div className="mt-7 grid max-w-3xl gap-3 sm:grid-cols-2">
      {mentors.map((mentor) => {
        const headline = mentor.headline || mentor.currentDesignation || mentor.designation || 'Expert Mentor'

        return (
          <Link
            key={mentor._id}
            to={`/experts/${mentor.slug || mentor._id}`}
            className="group flex min-w-0 items-center gap-3 rounded-2xl border border-white/20 bg-white/10 p-3 text-left backdrop-blur-sm transition hover:-translate-y-0.5 hover:bg-white/15"
          >
            <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white/15 text-sm font-black text-white ring-1 ring-white/25">
              {mentor.imageUrl ? (
                <img src={mentor.imageUrl} alt={mentor.fullName} className="h-full w-full object-cover object-center" />
              ) : (
                <span>{mentor.fullName?.split(' ').filter(Boolean).map((name) => name[0]).join('').slice(0, 2).toUpperCase()}</span>
              )}
            </div>
            <span className="min-w-0 flex-1">
              <span className="block text-[10px] font-extrabold uppercase tracking-[0.14em] text-cyan-200">Expert</span>
              <span className="mt-0.5 block truncate text-sm font-bold text-white">{mentor.fullName}</span>
              <span className="mt-0.5 block line-clamp-2 text-xs font-medium leading-5 text-cyan-50/85">{headline}</span>
            </span>
            <ArrowRight className="h-4 w-4 shrink-0 text-cyan-200 transition group-hover:translate-x-0.5" />
          </Link>
        )
      })}
    </div>
  )
}

function ProgramSection({ section }) {
  const format = section.sectionFormat || 'rich-text'
  const items = section.items || []
  const modules = section.modules || []
  const timeline = section.timeline || []
  const faqs = section.faqs || []
  const testimonials = section.testimonials || []

  const getTextLines = (value = '') =>
    value
      .split(/\r?\n/)
      .map(line => line.trim())
      .filter(Boolean)

  if (format === 'list') {
    return (
      <section className="w-full bg-[#fbfaf9] px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-black uppercase leading-tight tracking-normal text-gray-950 sm:text-4xl">
              {section.sectionTitle}
            </h2>
            <div className="mx-auto mt-6 h-1 w-36 rounded-full bg-white shadow-sm"></div>
            {section.intro && <p className="mx-auto mt-5 max-w-3xl text-base leading-7 text-gray-600">{section.intro}</p>}
          </div>

          <div className="mx-auto max-w-5xl space-y-8">
            {items.map((item, index) => (
              <div key={`${item.title || item.description || 'item'}-${index}`} className="flex items-start gap-5 rounded-3xl bg-[#dcd7ff] p-6 shadow-2xl shadow-gray-300/40 sm:gap-7 sm:p-8">
                <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#2b1cdd] text-2xl font-black text-white shadow-xl shadow-primary-900/20 sm:h-16 sm:w-16">
                  {index + 1}
                </span>
                <div className="min-w-0 pt-1">
                  {item.title && <h3 className="text-xl font-black leading-tight text-gray-950 sm:text-2xl">{item.title}</h3>}
                  {item.description && <p className="mt-3 text-base leading-7 text-gray-700">{item.description}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (format === 'cards') {
    const cardIcons = [GitCompareArrows, Factory, Bot, UsersRound]

    return (
      <section className="w-full bg-[#050545] px-4 py-16 text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-14 text-center">
            <h2 className="text-3xl font-black uppercase leading-tight tracking-normal text-white sm:text-4xl">
              {section.sectionTitle}
            </h2>
            {section.intro && <p className="mx-auto mt-5 max-w-3xl text-base leading-7 text-cyan-50/80">{section.intro}</p>}
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {items.map((item, index) => {
              const CardIcon = cardIcons[index % cardIcons.length]

              return (
                <div key={`${item.title || item.description || 'item'}-${index}`} className="min-h-[20rem] rounded-3xl border border-cyan-100/25 bg-gradient-to-br from-[#383ad7] via-[#258edc] to-[#0ee3e8] p-7 text-center shadow-2xl shadow-black/25">
                  <div className="mx-auto mb-8 flex h-16 w-16 items-center justify-center rounded-full bg-white/20 text-white ring-1 ring-white/30">
                    <CardIcon className="h-8 w-8" />
                  </div>
                  {item.title && <h3 className="text-xl font-black leading-snug text-white">{item.title}</h3>}
                  {item.description && <p className="mt-4 text-base leading-7 text-white/90">{item.description}</p>}
                </div>
              )
            })}
          </div>
        </div>
      </section>
    )
  }

  if (format === 'differentiators') {
    const differentiatorText = `${section.sectionTitle || ''} ${items.map(item => item.title || '').join(' ')}`
    const isBeforeAfter = /before|after|start|unlock/i.test(differentiatorText)
    const positiveItem = isBeforeAfter ? items[1] || {} : items[0] || {}
    const negativeItem = isBeforeAfter ? items[0] || {} : items[1] || {}
    const positiveLines = getTextLines(positiveItem.description || positiveItem.title)
    const negativeLines = getTextLines(negativeItem.description || negativeItem.title)
    const positiveEyebrow = isBeforeAfter ? 'After' : 'Who This Is For'
    const negativeEyebrow = isBeforeAfter ? 'Before' : 'Who This Is Not For'
    const positiveHeading = positiveItem.title || (isBeforeAfter ? 'What MAGNA unlocks' : 'This program is designed for:')
    const negativeHeading = negativeItem.title || (isBeforeAfter ? 'Where most founders start' : 'This will not be a fit if:')

    const renderDifferentiatorLine = (line, index, variant) => (
      <li key={`${line}-${index}`} className="flex gap-5">
        <span className={`mt-1 flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${variant === 'positive' ? 'bg-[#e5e6ff] text-[#2b2bd8]' : 'bg-red-100 text-red-600'}`}>
          {variant === 'positive' ? <Check className="h-6 w-6 stroke-[3]" /> : <X className="h-6 w-6 stroke-[3]" />}
        </span>
        <span className="min-w-0 text-lg leading-7 text-[#03112f]">
          {line}
        </span>
      </li>
    )

    return (
      <section className="w-full bg-[#fbfaf9] px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-black uppercase leading-tight tracking-normal text-gray-950 sm:text-4xl">
              {section.sectionTitle}
            </h2>
            {section.intro && <p className="mx-auto mt-5 max-w-3xl text-base leading-7 text-gray-600">{section.intro}</p>}
          </div>

          <div className="grid gap-8 lg:grid-cols-2">
            <div className="overflow-hidden rounded-[1.75rem] border border-cyan-100 bg-[#f5fbff] shadow-2xl shadow-cyan-200/40">
              <div className="flex items-start justify-between gap-6 p-8 sm:p-10">
                <div>
                  <p className="text-base font-black uppercase tracking-normal text-[#2b2bd8]">{positiveEyebrow}</p>
                  <h3 className="mt-3 text-2xl font-black leading-tight text-[#030047] sm:text-3xl">{positiveHeading}</h3>
                </div>
                <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-3xl bg-gradient-to-br from-[#3533cd] to-[#00d9e8] text-white">
                  <Check className="h-8 w-8 stroke-[3]" />
                </span>
              </div>
              <div className="border-t border-gray-200 px-8 py-10 sm:px-10 sm:py-12">
                <ul className="space-y-8">
                  {positiveLines.map((line, index) => renderDifferentiatorLine(line, index, 'positive'))}
                </ul>
              </div>
            </div>

            <div className="overflow-hidden rounded-[1.75rem] border border-cyan-100 bg-[#f5fbff] shadow-2xl shadow-cyan-200/40">
              <div className="flex items-start justify-between gap-6 p-8 sm:p-10">
                <div>
                  <p className="text-base font-black uppercase tracking-normal text-red-600">{negativeEyebrow}</p>
                  <h3 className="mt-3 text-2xl font-black leading-tight text-[#030047] sm:text-3xl">{negativeHeading}</h3>
                </div>
                <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-3xl bg-red-600 text-white">
                  <X className="h-8 w-8 stroke-[3]" />
                </span>
              </div>
              <div className="border-t border-red-100 px-8 py-10 sm:px-10 sm:py-12">
                <ul className="space-y-8">
                  {negativeLines.map((line, index) => renderDifferentiatorLine(line, index, 'negative'))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
    )
  }

  if (format === 'curriculum') {
    return (
      <section className="w-full bg-[#050545] px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-black uppercase leading-tight tracking-normal text-white sm:text-4xl">
              {section.sectionTitle}
            </h2>
            {section.intro && <p className="mx-auto mt-5 max-w-3xl text-base leading-7 text-cyan-50/80">{section.intro}</p>}
          </div>

          <div className="grid gap-8 lg:grid-cols-2">
            {modules.map((module, index) => (
              <div key={`${module.title}-${index}`} className="rounded-[2rem] border border-cyan-200/40 bg-gradient-to-br from-[#383ad7] via-[#286fda] to-[#12cde3] p-6 shadow-2xl shadow-black/30 sm:p-8">
                <div className="mb-8 flex items-center gap-6">
                  <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white text-lg font-black text-[#5a2ee8] shadow-lg shadow-black/10">
                    Day {index + 1}
                  </span>
                  <h3 className="text-2xl font-black uppercase leading-tight text-white sm:text-3xl">
                    {module.title}
                  </h3>
                </div>

                <div className="rounded-3xl bg-white p-6 shadow-xl shadow-black/10 sm:p-8">
                  {module.description && <h4 className="text-xl font-black leading-tight text-gray-950">{module.description}</h4>}
                  {module.lessons?.length > 0 && (
                    <ul className="mt-6 space-y-5">
                      {module.lessons.map((lesson) => (
                        <li key={lesson} className="flex gap-4 text-base leading-7 text-gray-700">
                          <span className="mt-0.5 shrink-0 text-[#7c2cff]">-&gt;</span>
                          <span>{lesson}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (format === 'rich-text') {
    return (
      <section className="w-full bg-[#f7fbff] px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl overflow-hidden rounded-[2rem] bg-white shadow-2xl shadow-cyan-200/30 ring-1 ring-cyan-100">
          <div className="h-2 bg-gradient-to-r from-[#3533cd] to-[#00d9e8]"></div>
          <div className="grid gap-8 p-7 sm:p-10 lg:grid-cols-[0.85fr_1.15fr] lg:p-12">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.2em] text-primary-600">Program Note</p>
              <h2 className="mt-4 text-3xl font-black leading-tight text-[#030047]">{section.sectionTitle}</h2>
              {section.intro && <p className="mt-5 text-base leading-7 text-gray-600">{section.intro}</p>}
            </div>
            <div className="rounded-3xl bg-[#f5fbff] p-6 ring-1 ring-cyan-100 sm:p-8">
              <RichText blocks={section.body || []} />
            </div>
          </div>
        </div>
      </section>
    )
  }

  if (format === 'outcomes') {
    return (
      <section className="w-full bg-[#fbfaf9] px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 text-center">
            <p className="text-sm font-black uppercase tracking-[0.22em] text-primary-600">Outcomes</p>
            <h2 className="mt-3 text-3xl font-black uppercase leading-tight text-gray-950 sm:text-4xl">{section.sectionTitle}</h2>
            {section.intro && <p className="mx-auto mt-5 max-w-3xl text-base leading-7 text-gray-600">{section.intro}</p>}
          </div>
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {items.map((item, index) => (
              <div key={`${item.title || item.description || 'item'}-${index}`} className="rounded-3xl bg-white p-7 shadow-2xl shadow-gray-200/60 ring-1 ring-cyan-100">
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#3533cd] to-[#00d9e8] text-lg font-black text-white">
                  {String(index + 1).padStart(2, '0')}
                </div>
                {item.title && <h3 className="text-xl font-black leading-tight text-gray-950">{item.title}</h3>}
                {item.description && <p className="mt-4 text-base leading-7 text-gray-600">{item.description}</p>}
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (format === 'timeline') {
    return (
      <section className="w-full bg-[#050545] px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="mb-12 text-center">
            <p className="text-sm font-black uppercase tracking-[0.22em] text-cyan-200">Flow</p>
            <h2 className="mt-3 text-3xl font-black uppercase leading-tight text-white sm:text-4xl">{section.sectionTitle}</h2>
            {section.intro && <p className="mx-auto mt-5 max-w-3xl text-base leading-7 text-cyan-50/80">{section.intro}</p>}
          </div>
          <div className="relative space-y-6 before:absolute before:left-6 before:top-4 before:h-[calc(100%-2rem)] before:w-px before:bg-cyan-300/40 sm:before:left-8">
            {timeline.map((item, index) => (
              <div key={`${item.title}-${index}`} className="relative grid gap-5 rounded-3xl border border-white/15 bg-white/10 p-6 text-white shadow-2xl shadow-black/20 backdrop-blur sm:grid-cols-[8rem_minmax(0,1fr)] sm:p-8">
                <span className="absolute left-3 top-8 flex h-7 w-7 items-center justify-center rounded-full bg-cyan-300 text-xs font-black text-[#050545] sm:left-5">{index + 1}</span>
                <p className="pl-9 text-sm font-black uppercase tracking-[0.18em] text-cyan-200 sm:pl-0">{item.timeLabel || `Step ${index + 1}`}</p>
                <div>
                  <h3 className="text-xl font-black leading-tight text-white">{item.title}</h3>
                  {item.description && <p className="mt-3 text-base leading-7 text-cyan-50/80">{item.description}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (format === 'faqs') {
    return (
      <section className="w-full bg-[#f7fbff] px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.22em] text-primary-600">Questions</p>
            <h2 className="mt-3 text-3xl font-black uppercase leading-tight text-[#030047] sm:text-4xl">{section.sectionTitle}</h2>
            {section.intro && <p className="mt-5 text-base leading-7 text-gray-600">{section.intro}</p>}
          </div>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <details key={`${faq.question}-${index}`} className="group rounded-3xl bg-white p-6 shadow-xl shadow-cyan-200/25 ring-1 ring-cyan-100">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-lg font-black text-gray-950">
                  <span>{faq.question}</span>
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-50 text-primary-700 transition group-open:rotate-45">+</span>
                </summary>
                <p className="mt-4 border-t border-gray-100 pt-4 text-base leading-7 text-gray-600">{faq.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (format === 'testimonials') {
    return (
      <section className="w-full bg-[#050545] px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 text-center">
            <p className="text-sm font-black uppercase tracking-[0.22em] text-cyan-200">Voices</p>
            <h2 className="mt-3 text-3xl font-black uppercase leading-tight text-white sm:text-4xl">{section.sectionTitle}</h2>
            {section.intro && <p className="mx-auto mt-5 max-w-3xl text-base leading-7 text-cyan-50/80">{section.intro}</p>}
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {testimonials.map((testimonial, index) => (
              <figure key={`${testimonial.name || 'testimonial'}-${index}`} className="rounded-3xl border border-white/15 bg-white p-7 shadow-2xl shadow-black/25">
                <Quote className="mb-5 h-10 w-10 text-primary-600" />
                <blockquote className="text-lg leading-8 text-gray-800">{testimonial.quote}</blockquote>
                {(testimonial.name || testimonial.designation) && (
                  <figcaption className="mt-6 border-t border-gray-100 pt-5 text-base font-black text-gray-950">
                    {testimonial.name}
                    {testimonial.designation && <span className="block pt-1 font-semibold text-gray-500">{testimonial.designation}</span>}
                  </figcaption>
                )}
              </figure>
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (format === 'cta' && section.cta) {
    return (
      <section className="w-full bg-[#fbfaf9] px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#3533cd] via-[#258edc] to-[#00d9e8] p-8 text-center text-white shadow-2xl shadow-cyan-300/35 sm:p-12">
          <p className="text-sm font-black uppercase tracking-[0.22em] text-cyan-50/85">{section.sectionTitle}</p>
          {section.cta.headline && <h2 className="mx-auto mt-4 max-w-3xl text-3xl font-black leading-tight sm:text-4xl">{section.cta.headline}</h2>}
          {section.intro && <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-white/90">{section.intro}</p>}
          {section.cta.buttonLabel && section.cta.buttonUrl && (
            <a href={section.cta.buttonUrl} className="mt-8 inline-flex items-center rounded-full bg-white px-7 py-4 text-base font-black text-primary-700 shadow-xl shadow-black/10 transition hover:bg-cyan-50">
              {section.cta.buttonLabel}
              <ArrowRight className="ml-2 h-5 w-5" />
            </a>
          )}
        </div>
      </section>
    )
  }

  return (
    <section className="w-full bg-[#f7f9ff] px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl rounded-3xl bg-white p-5 shadow-xl shadow-primary-900/5 ring-1 ring-gray-100 sm:p-8">
        <div className="mb-6">
          <p className="mb-2 text-xs font-black uppercase tracking-[0.18em] text-primary-600">{formatLabel(format)}</p>
          <h2 className="text-2xl font-bold text-gray-950 sm:text-3xl">{section.sectionTitle}</h2>
          {section.intro && <p className="mt-3 max-w-3xl text-base leading-7 text-gray-600">{section.intro}</p>}
        </div>

        {format === 'rich-text' && <RichText blocks={section.body || []} />}

        {format === 'outcomes' && (
          <div className="grid gap-4 md:grid-cols-2">
            {items.map((item, index) => (
              <div key={`${item.title || item.description || 'item'}-${index}`} className="rounded-2xl border border-gray-100 bg-[#f8fbff] p-5">
                <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-700">
                  <Sparkles className="h-5 w-5" />
                </div>
                {item.title && <h3 className="text-lg font-bold text-gray-950">{item.title}</h3>}
                {item.description && <p className="mt-2 text-sm leading-6 text-gray-600">{item.description}</p>}
              </div>
            ))}
          </div>
        )}

      {format === 'timeline' && (
        <div className="space-y-4">
          {timeline.map((item, index) => (
            <div key={`${item.title}-${index}`} className="grid gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-lg shadow-gray-200/50 sm:grid-cols-[8rem_minmax(0,1fr)]">
              <p className="text-sm font-black uppercase tracking-[0.16em] text-primary-600">{item.timeLabel || `Step ${index + 1}`}</p>
              <div>
                <h3 className="text-lg font-bold text-gray-950">{item.title}</h3>
                {item.description && <p className="mt-2 leading-7 text-gray-600">{item.description}</p>}
              </div>
            </div>
          ))}
        </div>
      )}

      {format === 'faqs' && (
        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <details key={`${faq.question}-${index}`} className="group rounded-2xl border border-gray-100 bg-[#f8fbff] p-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-base font-bold text-gray-950">
                <span>{faq.question}</span>
                <HelpCircle className="h-5 w-5 shrink-0 text-primary-600" />
              </summary>
              <p className="mt-3 leading-7 text-gray-600">{faq.answer}</p>
            </details>
          ))}
        </div>
      )}

      {format === 'testimonials' && (
        <div className="grid gap-4 md:grid-cols-2">
          {testimonials.map((testimonial, index) => (
            <figure key={`${testimonial.name || 'testimonial'}-${index}`} className="rounded-2xl border border-gray-100 bg-[#f8fbff] p-5">
              <Quote className="mb-4 h-7 w-7 text-primary-600" />
              <blockquote className="leading-7 text-gray-700">{testimonial.quote}</blockquote>
              {(testimonial.name || testimonial.designation) && (
                <figcaption className="mt-4 text-sm font-bold text-gray-950">
                  {testimonial.name}
                  {testimonial.designation && <span className="block font-semibold text-gray-500">{testimonial.designation}</span>}
                </figcaption>
              )}
            </figure>
          ))}
        </div>
      )}

      {format === 'cta' && section.cta && (
        <div className="rounded-2xl bg-[#000047] p-6 text-white">
          {section.cta.headline && <h3 className="text-2xl font-bold">{section.cta.headline}</h3>}
          {section.cta.buttonLabel && section.cta.buttonUrl && (
            <a href={section.cta.buttonUrl} className="mt-5 inline-flex items-center rounded-full bg-white px-5 py-3 text-sm font-bold text-primary-700 transition hover:bg-cyan-50">
              {section.cta.buttonLabel}
              <ArrowRight className="ml-2 h-4 w-4" />
            </a>
          )}
        </div>
      )}
      </div>
    </section>
  )
}

function ProgramCard({ program }) {
  return (
    <article className="group h-[34rem] overflow-hidden rounded-[1.5rem] bg-white shadow-lg shadow-primary-900/5 transition hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary-900/12">
      <Link
        to={`/programs/${program.slug || program._id}`}
        state={{ backTo: '/programs', backLabel: 'Back to Programs' }}
        className="block h-full"
      >
        <div className="relative h-full overflow-hidden bg-gradient-to-br from-[#000047] via-primary-700 to-cyan-500">
          {program.heroImageUrl ? (
            <img src={program.heroImageUrl} alt={program.heroImageAlt || program.title} className="absolute inset-0 h-full w-full object-contain transition duration-500 group-hover:scale-[1.02]" />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <Award className="h-16 w-16 text-white/80" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-black/15 via-black/0 to-black/35"></div>
          <div className="absolute right-5 top-5 h-12 w-12">
            <img src="/favicon.png" alt="" className="h-full w-full object-contain" />
          </div>
          <div className="absolute left-5 right-20 top-5">
            <span className="inline-flex max-w-full items-center justify-center rounded-[1.35rem] border border-white bg-gray-950/65 px-6 py-3 text-center text-sm font-black uppercase tracking-wide text-white shadow-lg shadow-black/20 backdrop-blur-sm">
              <span className="truncate">{formatLabel(program.programType)}</span>
            </span>
          </div>
          <div className="absolute bottom-6 left-5 right-5 rounded-[1.5rem] bg-gray-100/70 p-5 text-gray-950 shadow-2xl shadow-primary-950/15 backdrop-blur-sm">
            <h2 className="line-clamp-3 text-xl font-semibold leading-snug text-gray-950">
              {program.title}
            </h2>
            {(program.duration || program.startDate) && (
              <p className="mt-4 truncate text-xs font-bold uppercase tracking-[0.12em] text-gray-700">
                {[program.duration, program.startDate && formatDate(program.startDate), program.startDate && formatTime(program.startDate)].filter(Boolean).join(' | ')}
              </p>
            )}
          </div>
        </div>
      </Link>
    </article>
  )
}

function ProgramGroup({ title, description, programs, emptyMessage, separated = false }) {
  return (
    <section className="mb-14 last:mb-0">
      {separated && <div className="mb-12 h-2 rounded-full bg-gradient-to-r from-[#3534cd] to-[#00ffff]" aria-hidden="true"></div>}
      <div className="mb-7 flex flex-col gap-4 rounded-3xl bg-white p-5 shadow-xl shadow-primary-900/5 ring-1 ring-cyan-100 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div>
          <p className="inline-flex rounded-full bg-gradient-to-r from-[#3534cd] to-[#00ffff] px-5 py-2 text-sm font-black uppercase tracking-[0.2em] text-white shadow-lg shadow-cyan-200/40">{title}</p>
          {description && <p className="mt-2 max-w-2xl text-base leading-7 text-gray-600">{description}</p>}
        </div>
        <span className="inline-flex w-fit rounded-full bg-primary-50 px-4 py-2 text-sm font-black text-primary-700 ring-1 ring-primary-100">
          {programs.length} {programs.length === 1 ? 'Program' : 'Programs'}
        </span>
      </div>

      {programs.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {programs.map((item) => (
            <ProgramCard key={item._id} program={item} />
          ))}
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed border-cyan-200 bg-white/70 p-7 text-center text-base font-semibold text-gray-500">
          {emptyMessage}
        </div>
      )}
    </section>
  )
}

export default function Programs() {
  const { slug } = useParams()
  const location = useLocation()
  const [programs, setPrograms] = useState([])
  const [program, setProgram] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [shareStatus, setShareStatus] = useState('')

  useEffect(() => {
    let isMounted = true

    const fetchPrograms = async () => {
      setLoading(true)
      setError('')

      try {
        const programFields = `
          _id,
          title,
          "slug": slug.current,
          status,
          programType,
          deliveryMode,
          shortDescription,
          startDate,
          endDate,
          duration,
          location,
          onlineLink,
          registrationUrl,
          pricingType,
          pricingOptions[]{
            _key,
            currency,
            price,
            discountType,
            discountValue,
            label
          },
          price,
          seats,
          featured,
          "heroImageUrl": heroImage.asset->url,
          "heroImageAlt": heroImage.alt,
          mentors[]->{
            _id,
            fullName,
            "slug": slug.current,
            "imageUrl": profileImage.asset->url,
            headline,
            currentDesignation,
            designation
          },
          capabilities[]->{
            _id,
            title,
            "slug": slug.current
          },
          audience,
          sections[]{
            _key,
            sectionTitle,
            sectionFormat,
            intro,
            body[],
            items[]{
              _key,
              title,
              description,
              iconLabel
            },
            modules[]{
              _key,
              title,
              description,
              lessons
            },
            timeline[]{
              _key,
              timeLabel,
              title,
              description
            },
            faqs[]{
              _key,
              question,
              answer
            },
            testimonials[]{
              _key,
              quote,
              name,
              designation
            },
            cta{
              headline,
              buttonLabel,
              buttonUrl
            }
          },
          seoTitle,
          seoDescription
        `

        if (slug) {
          const data = await mentorClient.fetch(`*[_type == "programs" && status != "archived" && (slug.current == $slug || _id == $slug)][0] { ${programFields} }`, { slug })
          if (!isMounted) return
          setProgram(data || null)
          setPrograms([])
        } else {
          const data = await mentorClient.fetch(`*[_type == "programs" && status == "published"] | order(featured desc, startDate desc) { ${programFields} }`)
          if (!isMounted) return
          setPrograms(data || [])
          setProgram(null)
        }
      } catch (fetchError) {
        console.error('Programs fetch failed:', fetchError)
        if (!isMounted) return
        setError('Unable to load programs right now.')
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    fetchPrograms()

    return () => {
      isMounted = false
    }
  }, [slug])

  const pageTitle = useMemo(() => (
    slug && program ? `${program.seoTitle || program.title} | Magnafic Programs` : 'Programs | Magnafic'
  ), [program, slug])

  const groupedPrograms = useMemo(() => {
    const groups = {
      current: [],
      upcoming: [],
      past: [],
    }

    programs.forEach((item) => {
      groups[getProgramDateGroup(item)].push(item)
    })

    groups.current.sort((a, b) => new Date(a.startDate || 0) - new Date(b.startDate || 0))
    groups.upcoming.sort((a, b) => new Date(a.startDate || 0) - new Date(b.startDate || 0))
    groups.past.sort((a, b) => new Date(b.endDate || b.startDate || 0) - new Date(a.endDate || a.startDate || 0))

    return groups
  }, [programs])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f9ff] px-4 pt-28 pb-16">
        <MagnaLoader message="Loading programs..." className="mx-auto max-w-3xl" />
      </div>
    )
  }

  if (error || (slug && !program)) {
    return (
      <div className="min-h-screen bg-[#f7f9ff] px-4 pt-28 pb-16">
        <SEO title="Programs Not Found" description="The requested Magnafic program could not be loaded." path={slug ? `/programs/${slug}` : '/programs'} />
        <section className="mx-auto max-w-3xl rounded-3xl bg-white p-8 text-center shadow-xl shadow-primary-900/5 ring-1 ring-gray-100">
          <h1 className="text-3xl font-bold text-gray-950">Program not found</h1>
          <p className="mt-3 text-gray-600">{error || 'The program you are looking for is not available.'}</p>
          <Link to="/programs" className="mt-6 inline-flex items-center rounded-full bg-primary-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-primary-700">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Programs
          </Link>
        </section>
      </div>
    )
  }

  if (program) {
    const backTo = location.state?.backTo || '/programs'
    const backLabel = location.state?.backLabel || 'Back to Programs'
    const hasPricing = Boolean(
      program.price ||
      program.pricingOptions?.length ||
      ['free', 'contact', 'invite-only'].includes(program.pricingType)
    )
    const handleShareProgram = async () => {
      const programUrl = new URL(`/programs/${program.slug || program._id}`, window.location.origin).href
      const shareData = {
        title: `${program.title} | Magnafic`,
        text: program.shortDescription || `Explore ${program.title}, a Magnafic expert-led session.`,
        url: programUrl,
      }

      try {
        if (navigator.share) {
          try {
            const shareCard = await createProgramShareCard(program)
            const shareFile = new File(
              [shareCard],
              `${program.slug || program._id || 'magnafic-program'}-share.png`,
              { type: 'image/png' }
            )
            const fileShareData = { ...shareData, files: [shareFile] }

            if (!navigator.canShare || navigator.canShare(fileShareData)) {
              await navigator.share(fileShareData)
              setShareStatus('Shared')
              return
            }
          } catch (shareImageError) {
            if (shareImageError?.name === 'AbortError') return
            console.warn('Program share card could not be attached:', shareImageError)
          }

          await navigator.share(shareData)
          setShareStatus('Shared')
          return
        }

        await navigator.clipboard.writeText(programUrl)
        setShareStatus('Link copied')
      } catch (shareError) {
        if (shareError?.name !== 'AbortError') {
          console.error('Program share failed:', shareError)
          setShareStatus('Could not share')
        }
      } finally {
        window.setTimeout(() => setShareStatus(''), 2400)
      }
    }

    return (
      <div className="min-h-screen bg-[#f7f9ff]">
        <SEO
          title={pageTitle}
          description={program.seoDescription || program.shortDescription}
          path={`/programs/${program.slug || program._id}`}
          image={program.heroImageUrl}
        />
        <section className="relative overflow-hidden bg-[#000047] px-4 pt-28 pb-14 text-white sm:px-6 lg:px-8">
          {program.heroImageUrl && (
            <img src={program.heroImageUrl} alt="" className="absolute inset-0 h-full w-full object-cover opacity-35" />
          )}
          <div className="absolute inset-0 bg-gradient-to-br from-[#000047] via-[#000047]/85 to-cyan-700/70"></div>
          <div className="relative mx-auto max-w-6xl">
            <Link to={backTo} className="mb-8 inline-flex items-center text-sm font-bold text-cyan-100 transition hover:text-white">
              <ArrowLeft className="mr-2 h-4 w-4" />
              {backLabel}
            </Link>
            <div className="max-w-4xl">
              <p className="mb-4 text-sm font-black uppercase tracking-[0.22em] text-cyan-200">{formatLabel(program.programType)}</p>
              <h1 className="text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">{program.title}</h1>
              {program.shortDescription && <p className="mt-6 max-w-3xl text-lg leading-8 text-cyan-50">{program.shortDescription}</p>}
              <ProgramExperts mentors={program.mentors} />
              <div className="mt-6">
                <ProgramMeta program={program} onShare={handleShareProgram} shareStatus={shareStatus} />
              </div>
              {(program.registrationUrl || program.onlineLink) && (
                <a href={program.registrationUrl || program.onlineLink} className="mt-8 inline-flex items-center rounded-full bg-white px-6 py-3 font-bold text-primary-700 shadow-xl shadow-black/10 transition hover:bg-cyan-50">
                  Register Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </a>
              )}
            </div>
          </div>
        </section>

        <section className="px-4 py-10 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-6xl gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
            <section className="rounded-3xl bg-white p-6 shadow-xl shadow-primary-900/5 ring-1 ring-gray-100">
              <h2 className="text-xl font-bold text-gray-950">Program Snapshot</h2>
              <div className="mt-5 grid gap-3 text-sm font-semibold text-gray-700 sm:grid-cols-2 lg:grid-cols-3">
                {program.duration && <p><span className="text-gray-400">Duration:</span> {program.duration}</p>}
                {program.deliveryMode && <p><span className="text-gray-400">Mode:</span> {formatLabel(program.deliveryMode)}</p>}
                {program.startDate && <p><span className="text-gray-400">Starts:</span> {formatDate(program.startDate)}</p>}
                {program.location && <p><span className="text-gray-400">Location:</span> {program.location}</p>}
              </div>
            </section>

            {program.audience?.length > 0 && (
              <section className="rounded-3xl bg-white p-6 shadow-xl shadow-primary-900/5 ring-1 ring-gray-100">
                <h2 className="text-xl font-bold text-gray-950">Ideal For</h2>
                <div className="mt-4 flex flex-wrap gap-2">
                  {program.audience.map((item) => (
                    <span key={item} className="rounded-full bg-primary-50 px-3 py-1.5 text-sm font-bold text-primary-700">{item}</span>
                  ))}
                </div>
              </section>
            )}
          </div>
        </section>

        <main>
          {program.sections?.length > 0 ? (
            program.sections.map((section, index) => (
              <ProgramSection key={section._key || `${section.sectionTitle}-${index}`} section={section} />
            ))
          ) : (
            <section className="w-full bg-[#f7f9ff] px-4 py-12 sm:px-6 lg:px-8">
              <div className="mx-auto max-w-6xl rounded-3xl bg-white p-8 shadow-xl shadow-primary-900/5 ring-1 ring-gray-100">
                <h2 className="text-2xl font-bold text-gray-950">Program Details</h2>
                <p className="mt-3 leading-8 text-gray-600">More details for this program will be published soon.</p>
              </div>
            </section>
          )}
        </main>

        {hasPricing && (
          <section className="px-4 pb-14 pt-8 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-6xl overflow-hidden rounded-3xl bg-white shadow-xl shadow-primary-900/5 ring-1 ring-primary-100">
              <div className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-primary-600">Program Price</p>
                  <div className="mt-4">
                    <ProgramPricing program={program} />
                  </div>
                </div>
                {(program.registrationUrl || program.onlineLink) && (
                  <a
                    href={program.registrationUrl || program.onlineLink}
                    className="inline-flex w-full items-center justify-center rounded-full bg-gradient-primary px-7 py-4 font-extrabold text-white shadow-xl shadow-primary-900/20 transition hover:-translate-y-0.5 hover:shadow-glow-combined lg:w-auto"
                  >
                    Register Now
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </a>
                )}
              </div>
              <div className="h-1.5 bg-gradient-to-r from-primary-600 to-cyan-400" />
            </div>
          </section>
        )}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f7f9ff]">
      <SEO title="Programs | Magnafic" description="Explore Magnafic programs, courses, live sessions, online sessions, meetups, and mentor-led learning experiences." path="/programs" />
      <section className="bg-[#000047] px-4 pt-28 pb-16 text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <p className="mb-4 text-sm font-black uppercase tracking-[0.22em] text-cyan-200">Programs</p>
          <h1 className="max-w-4xl text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">Mentor-led programs for consumer brand growth</h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-cyan-50">
            Explore live sessions, online programs, meetups, courses, workshops, and cohort experiences led by Magnafic mentors.
          </p>
        </div>
      </section>

      <section className="px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          {programs.length > 0 ? (
            <>
              <ProgramGroup
                title="Upcoming Programs"
                description="Programs scheduled to begin after today."
                programs={groupedPrograms.upcoming}
                emptyMessage="No upcoming programs are scheduled yet."
              />
              <ProgramGroup
                title="Past Programs"
                description="Completed programs, ordered by the most recent date first."
                programs={groupedPrograms.past}
                emptyMessage="No past programs to show yet."
                separated
              />
            </>
          ) : (
            <div className="rounded-3xl bg-white p-8 text-center shadow-xl shadow-primary-900/5 ring-1 ring-gray-100">
              <Loader2 className="mx-auto mb-4 h-8 w-8 text-primary-600" />
              <h2 className="text-2xl font-bold text-gray-950">Programs are coming soon</h2>
              <p className="mt-3 text-gray-600">Published programs from Sanity will appear here.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
