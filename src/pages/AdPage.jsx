import {useEffect, useMemo, useState} from 'react'
import {addDoc, collection, serverTimestamp} from 'firebase/firestore'
import {motion} from 'framer-motion'
import {Brain, CalendarDays, Check, CheckCircle2, ChevronDown, Clock3, Languages, Loader2, Quote, Repeat2, Rocket, Settings, Sparkles, Video, X} from 'lucide-react'
import {useParams} from 'react-router-dom'
import MagnaLoader from '../components/MagnaLoader'
import SEO from '../components/SEO'
import {db} from '../lib/firebase'
import {mentorClient} from '../lib/sanityClient'

const mediaFields = `
  mediaType,
  "imageUrl": image.asset->url,
  "imageAlt": image.alt,
  videoUrl,
  "videoFileUrl": videoFile.asset->url,
  caption
`

const adPageFields = `
  _id,
  title,
  "slug": slug.current,
  status,
  headline,
  shortDescription,
  primaryButtonLabel,
  primaryButtonAction,
  primaryButtonUrl,
  primaryRazorpayAmount,
  primaryRazorpayDescription,
  primaryFormTitle,
  primaryFormDescription,
  primaryFormButtonLabel,
  primaryConfirmationEmail{
    enabled,
    subject,
    fromName,
    body
  },
  secondaryButtonLabel,
  secondaryButtonUrl,
  theme,
  heroMedia{${mediaFields}},
  workshopDetails[]{
    _key,
    icon,
    label
  },
  stickyRegistrationBar{
    enabled,
    buttonLabel,
    countdownMinutes,
    countdownLabel
  },
  sections[]{
    _key,
    sectionTitle,
    sectionFormat,
    intro,
    body[],
    media{${mediaFields}},
    items[]{
      _key,
      title,
      description,
      metric,
      iconLabel,
      media{${mediaFields}}
    },
    modules[]{
      _key,
      title,
      description,
      lessons,
      media{${mediaFields}}
    },
    timeline[]{
      _key,
      timeLabel,
      title,
      description,
      media{${mediaFields}}
    },
    faqs[]{
      _key,
      question,
      answer,
      media{${mediaFields}}
    },
    testimonials[]{
      _key,
      quote,
      name,
      designation,
      media{${mediaFields}}
    },
    cta{
      headline,
      description,
      buttonLabel,
      buttonAction,
      buttonUrl,
      razorpayAmount,
      razorpayDescription,
      formTitle,
      formDescription,
      formButtonLabel,
      showMessageField,
      countdownMinutes,
      countdownLabel,
      confirmationEmail{
        enabled,
        subject,
        fromName,
        body
      }
    }
  },
  seoTitle,
  seoDescription
`

function blockText(block) {
  return block?.children?.map((child) => child.text).join('') || ''
}

function RichText({blocks = []}) {
  if (!blocks.length) return null

  return (
    <div className="space-y-4 text-sm leading-7 text-gray-600 sm:text-base sm:leading-8">
      {blocks.map((block) => {
        const text = blockText(block)
        if (!text) return null

        if (block.style === 'h2') return <h2 key={block._key} className="text-2xl font-black leading-tight text-[#000047] sm:text-3xl">{text}</h2>
        if (block.style === 'h3') return <h3 key={block._key} className="text-lg font-black leading-tight text-[#000047] sm:text-xl">{text}</h3>
        if (block.listItem) {
          return (
            <div key={block._key} className="flex min-w-0 gap-3">
              <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-cyan" />
              <p className="min-w-0">{text}</p>
            </div>
          )
        }

        return <p key={block._key}>{text}</p>
      })}
    </div>
  )
}

function getEmbedUrl(url) {
  if (!url) return ''

  try {
    const parsed = new URL(url)
    if (parsed.hostname.includes('youtube.com')) {
      const videoId = parsed.searchParams.get('v')
      return videoId ? `https://www.youtube.com/embed/${videoId}` : url
    }
    if (parsed.hostname.includes('youtu.be')) {
      const videoId = parsed.pathname.split('/').filter(Boolean)[0]
      return videoId ? `https://www.youtube.com/embed/${videoId}` : url
    }
    if (parsed.hostname.includes('vimeo.com')) {
      const videoId = parsed.pathname.split('/').filter(Boolean).pop()
      return videoId ? `https://player.vimeo.com/video/${videoId}` : url
    }
  } catch {
    return url
  }

  return url
}

function loadRazorpayCheckout() {
  if (window.Razorpay) return Promise.resolve(true)

  return new Promise((resolve) => {
    const existingScript = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]')
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(true), {once: true})
      existingScript.addEventListener('error', () => resolve(false), {once: true})
      return
    }

    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}

async function sendAdActionEmail({page, cta, formData, actionType, paymentId = '', amount = ''}) {
  try {
    const response = await fetch('/.netlify/functions/send-ad-action-email', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        pageId: page._id,
        pageSlug: page.slug || page._id,
        pageTitle: page.title || '',
        ctaKey: cta.ctaKey || 'primary',
        actionType,
        name: formData.name,
        email: formData.email,
        contactNo: formData.contactNo,
        message: formData.message || '',
        program: cta.paymentDescription || cta.title || page.title || '',
        amount,
        paymentId,
      }),
    })
    const result = await response.json().catch(() => ({}))

    if (!response.ok) {
      console.warn('Ad action confirmation email was not sent:', result)
    }

    return result
  } catch (emailError) {
    console.warn('Ad action confirmation email failed:', emailError)
    return {confirmationSent: false, error: emailError?.message || 'Unable to send confirmation email.'}
  }
}

function MediaBlock({media, className = ''}) {
  if (!media) return null

  if (media.mediaType === 'video-url' && media.videoUrl) {
    return (
      <figure className={className}>
        <div className="overflow-hidden rounded-lg bg-gray-950 shadow-xl ring-1 ring-black/5">
          <iframe
            src={getEmbedUrl(media.videoUrl)}
            title={media.caption || 'Ad page video'}
            className="aspect-video w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>
        {media.caption && <figcaption className="mt-3 text-sm font-semibold text-gray-500">{media.caption}</figcaption>}
      </figure>
    )
  }

  if (media.mediaType === 'video-file' && media.videoFileUrl) {
    return (
      <figure className={className}>
        <video className="w-full rounded-lg bg-gray-950 shadow-xl ring-1 ring-black/5" controls playsInline>
          <source src={media.videoFileUrl} />
        </video>
        {media.caption && <figcaption className="mt-3 text-sm font-semibold text-gray-500">{media.caption}</figcaption>}
      </figure>
    )
  }

  if (media.imageUrl) {
    return (
      <figure className={className}>
        <img
          src={media.imageUrl}
          alt={media.imageAlt || media.caption || ''}
          className="max-h-[26rem] w-full object-contain sm:max-h-[36rem]"
        />
        {media.caption && <figcaption className="mt-3 text-sm font-semibold text-gray-500">{media.caption}</figcaption>}
      </figure>
    )
  }

  return null
}

function FirstSectionMediaBlock({media}) {
  if (!media?.imageUrl) return <MediaBlock media={media} className="mx-auto text-center [&_figcaption]:text-center [&_img]:mx-auto" />

  return (
    <figure className="mx-auto inline-block max-w-full text-center">
      <img
        src={media.imageUrl}
        alt={media.imageAlt || media.caption || ''}
        className="block max-h-[17rem] w-full object-contain sm:max-h-[24rem]"
      />
      <div className="h-1 w-full bg-gradient-to-r from-[#3b2bd9] to-[#12e6e8]" />
      {media.caption && <figcaption className="mt-4 text-center text-2xl font-black leading-8 text-[#0b176d] sm:text-3xl sm:leading-9">{media.caption}</figcaption>}
    </figure>
  )
}

function MentorIntroDetails({intro}) {
  const lines = String(intro || '')
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
  const details = lines.slice(1)

  if (!details.length) return null

  return (
    <div className="mx-auto mt-2 max-w-md text-center">
      {details.map((line, index) => (
        <p key={`${line}-${index}`} className="text-sm font-bold leading-6 text-gray-800 sm:text-base">
          {line}
        </p>
      ))}
    </div>
  )
}

function HeroMediaBlock({media}) {
  if (!media) return null

  if (media.mediaType === 'video-url' && media.videoUrl) {
    return (
      <div className="relative overflow-hidden rounded-lg bg-gray-950 shadow-2xl ring-1 ring-white/15">
        <iframe
          src={getEmbedUrl(media.videoUrl)}
          title={media.caption || 'Ad page video'}
          className="aspect-video w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>
    )
  }

  if (media.mediaType === 'video-file' && media.videoFileUrl) {
    return (
      <video className="w-full rounded-lg bg-gray-950 shadow-2xl ring-1 ring-white/15" controls playsInline>
        <source src={media.videoFileUrl} />
      </video>
    )
  }

  if (media.imageUrl) {
    return (
      <figure className="relative overflow-visible">
        <img
          src={media.imageUrl}
          alt={media.imageAlt || media.caption || ''}
          className="h-auto w-full max-w-none rounded-2xl object-cover shadow-xl sm:scale-125"
        />
      </figure>
    )
  }

  return null
}

function SectionHeader({section, light = false}) {
  return (
    <div className="mx-auto mb-8 max-w-6xl text-center">
      <h2 className={`text-2xl font-extrabold leading-8 sm:text-3xl sm:leading-9 ${light ? 'text-white' : 'text-[#071a78]'}`}>{section.sectionTitle}</h2>
      {section.intro && <p className={`mx-auto mt-4 max-w-4xl whitespace-pre-line text-base leading-6 sm:text-lg sm:leading-7 ${light ? 'text-cyan-50/85' : 'text-gray-700'}`}>{section.intro}</p>}
    </div>
  )
}

function SectionShell({children, className = '', dark = false}) {
  return (
    <section className={`${dark ? 'bg-[#000047] text-white' : 'bg-[#fbfaf9] text-gray-950'} overflow-hidden px-4 py-12 ${className}`}>
      <div className="mx-auto max-w-6xl">{children}</div>
    </section>
  )
}

function ItemMark({label, index, light = false}) {
  const content = label || String(index + 1).padStart(2, '0')
  return (
    <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-sm font-black ${light ? 'bg-white/10 text-cyan-100 ring-1 ring-white/15' : 'bg-primary-50 text-primary-700 ring-1 ring-primary-100'}`}>
      {content.slice(0, 3)}
    </span>
  )
}

function InlineItemList({items = [], light = false, centered = false, gradientIcons = false, bulletStyle = false}) {
  if (!items.length) return null

  return (
    <div className={bulletStyle ? 'space-y-5' : 'space-y-4'}>
      {items.map((item, itemIndex) => (
        <div key={item._key || `${item.title}-${itemIndex}`} className={`flex min-w-0 ${bulletStyle ? 'items-start gap-3 border-b-0 pb-0' : `gap-3 border-b pb-4 last:border-b-0 last:pb-0 sm:gap-4 ${centered ? 'flex-col items-center text-center' : ''} ${light ? 'border-white/15' : 'border-gray-100'}`}`}>
          {bulletStyle ? (
            <span className="mt-2.5 h-2 w-2 shrink-0 rounded-full bg-[#3d35d7]" />
          ) : gradientIcons ? (
            <span className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-blue-700 to-cyan-400 shadow-sm shadow-cyan-500/20">
              <CheckCircle2 className="h-4.5 w-4.5 text-white" />
            </span>
          ) : (
            <CheckCircle2 className={`mt-1 h-5 w-5 shrink-0 ${light ? 'text-cyan-200' : 'text-cyan'}`} />
          )}
          <div className="min-w-0">
            {!bulletStyle && item.title && <h3 className={`text-lg font-black leading-tight sm:text-xl ${light ? 'text-white' : 'text-[#000047]'}`}>{item.title}</h3>}
            {item.description && <p className={`${bulletStyle ? 'text-sm font-normal leading-relaxed text-gray-950' : `mt-2 text-sm leading-7 sm:text-base sm:leading-8 ${light ? 'text-cyan-50/85' : 'text-gray-600'}`}`}>{item.description}</p>}
            <MediaBlock media={item.media} className="mt-4" />
          </div>
        </div>
      ))}
    </div>
  )
}

function splitButtonLabel(label = '') {
  const words = label.trim().split(/\s+/).filter(Boolean)
  if (words.length <= 1) return [label]

  const splitIndex = Math.ceil(words.length / 2)
  return [
    words.slice(0, splitIndex).join(' '),
    words.slice(splitIndex).join(' '),
  ].filter(Boolean)
}

function formatOfferButtonLabel(label = '') {
  const match = label.match(/^(.*?₹\s*1\s*\/-)\s*(2999)$/)
  if (!match) return null

  return {
    main: match[1].trim(),
    oldPrice: match[2],
  }
}

function CtaButton({action, variant = 'primary', twoLine = false, fitContent = false, onOpenCta}) {
  if (!action?.label) return null

  const className = variant === 'secondary'
    ? 'inline-flex w-full min-w-0 items-center justify-center rounded-full border border-white/30 px-5 py-3.5 text-center text-lg font-extrabold leading-snug text-white transition hover:bg-white/10 sm:w-auto sm:px-7 sm:py-4 sm:text-base'
    : `inline-flex min-w-0 items-center justify-center rounded-2xl bg-gradient-to-r from-[#3533cd] to-[#00d9e8] px-10 text-center font-bold leading-7 text-white shadow-[0_16px_30px_rgba(37,99,235,0.25)] transition hover:-translate-y-0.5 ${twoLine ? 'w-full max-w-full py-5 text-xl' : fitContent ? 'w-full max-w-full py-5 text-xl' : 'w-full py-5 text-xl'}`
  const labelLines = twoLine ? splitButtonLabel(action.label) : []
  const offerLabel = formatOfferButtonLabel(action.label)
  const labelContent = offerLabel ? (
    <span className="flex min-w-0 flex-col items-center justify-center leading-tight">
      <span className="min-w-0 whitespace-nowrap text-xl font-extrabold leading-7">{offerLabel.main}</span>
      <span className="mt-0.5 min-w-0 text-xl font-extrabold leading-6 line-through decoration-white decoration-2">{offerLabel.oldPrice}</span>
    </span>
  ) : twoLine ? (
    <span className="flex min-w-0 flex-col items-center justify-center leading-tight">
      {labelLines.map((line, index) => (
        <span key={`${line}-${index}`} className="min-w-0 break-words">{line}</span>
      ))}
    </span>
  ) : (
    <span className="min-w-0 break-words">{action.label}</span>
  )

  if (action.action === 'link' && action.url) {
    return (
      <a href={action.url} className={className}>
        {labelContent}
      </a>
    )
  }

  return (
    <button type="button" onClick={() => onOpenCta(action)} className={className}>
      {labelContent}
    </button>
  )
}

function formatCountdown(seconds) {
  const safeSeconds = Math.max(0, Number(seconds) || 0)
  const hours = Math.floor(safeSeconds / 3600)
  const minutes = Math.floor((safeSeconds % 3600) / 60)
  const remainingSeconds = safeSeconds % 60
  const parts = hours > 0 ? [hours, minutes, remainingSeconds] : [minutes, remainingSeconds]

  return parts.map((part) => String(part).padStart(2, '0')).join(':')
}

function CtaCountdown({minutes, label}) {
  const durationSeconds = Math.max(0, Math.floor(Number(minutes) * 60))
  const [remainingSeconds, setRemainingSeconds] = useState(durationSeconds)

  useEffect(() => {
    setRemainingSeconds(durationSeconds)
    if (!durationSeconds) return undefined

    const intervalId = window.setInterval(() => {
      setRemainingSeconds((current) => Math.max(0, current - 1))
    }, 1000)

    return () => window.clearInterval(intervalId)
  }, [durationSeconds])

  if (!durationSeconds) return null

  return (
    <div className="mx-auto mt-8 text-center">
      <span className="block font-mono text-2xl font-extrabold leading-none text-[#07142d] sm:text-3xl">
        {formatCountdown(remainingSeconds)}
      </span>
      <span className="mt-2 block text-xl font-bold leading-7 text-red-600 sm:text-2xl">
        {label || 'Remaining Time'}
      </span>
    </div>
  )
}

function CtaAlarmImage({media}) {
  if (!media?.imageUrl) return null

  return (
    <img
      src={media.imageUrl}
      alt={media.imageAlt || media.caption || ''}
      className="mx-auto h-28 w-28 object-contain sm:h-32 sm:w-32"
    />
  )
}

function MagnaDifferentIcon({index}) {
  const className = 'h-5 w-5 text-white'
  if (index === 0) return <Repeat2 className={className} />
  if (index === 1) return <Sparkles className={className} />
  return <Check className={className} />
}

function CurriculumSessionCard({title, lessons = []}) {
  const sessionGroups = []
  let current = null

  lessons.forEach((lesson) => {
    if (/^Session\s+\d+:/i.test(lesson)) {
      current = {heading: lesson, bullets: []}
      sessionGroups.push(current)
      return
    }

    if (!current) {
      current = {heading: title, bullets: []}
      sessionGroups.push(current)
    }

    current.bullets.push(lesson)
  })

  return (
    <div className="space-y-6">
      {sessionGroups.map((session) => {
        const headingSeparatorIndex = session.heading.indexOf(':')
        const sessionLabel = headingSeparatorIndex >= 0 ? session.heading.slice(0, headingSeparatorIndex) : session.heading
        const sessionTitle = headingSeparatorIndex >= 0 ? session.heading.slice(headingSeparatorIndex + 1).trim() : ''
        const titleMatch = sessionTitle.match(/^([A-Z])\s+(?:—|-)\s+(.+)$/)

        return (
          <article key={session.heading} className="rounded-2xl bg-white px-5 py-6 text-center text-[#07142d] shadow-lg sm:px-7">
            <h4 className="text-lg font-extrabold leading-7 text-black">{sessionLabel}:</h4>
            {sessionTitle && (
              <p className="mt-1 text-lg font-extrabold leading-7">
                {titleMatch ? (
                  <>
                    <span className="text-[#3533cd]">{titleMatch[1]}</span>
                    <span className="text-[#07142d]"> - </span>
                    <span className="text-[#00bcd4]">{titleMatch[2]}</span>
                  </>
                ) : (
                  <span className="text-[#00bcd4]">{sessionTitle}</span>
                )}
              </p>
            )}
            <div className="mt-5 space-y-4 text-left">
              {session.bullets.map((lesson) => (
                <div key={lesson} className="flex min-w-0 items-start gap-3">
                  <span className="mt-0.5 shrink-0 text-sm leading-6 text-[#1512b8]">→</span>
                  <p className="min-w-0 text-sm leading-relaxed text-[#111827]">{lesson}</p>
                </div>
              ))}
            </div>
          </article>
        )
      })}
    </div>
  )
}

const detailIconMap = {
  calendar: CalendarDays,
  language: Languages,
  clock: Clock3,
  video: Video,
  info: Sparkles,
}

function workshopDetailsFromDescription(description = '') {
  const text = String(description || '')
  const dateMatch = text.match(/on\s+([^,.]+(?:,\s*[^,.]+)?)/i)
  const timeMatch = text.match(/(\d{1,2}(?::\d{2})?\s*(?:AM|PM)\s*-\s*\d{1,2}(?::\d{2})?\s*(?:AM|PM)(?:\s*[A-Z]+)?)/i)

  return [
    {icon: 'calendar', label: dateMatch?.[1]?.trim() || 'Workshop date'},
    {icon: 'language', label: 'English, Hindi'},
    {icon: 'clock', label: timeMatch?.[1]?.trim() || 'Live session'},
    {icon: 'video', label: 'Live on Zoom'},
  ]
}

function findCountdownCta(sections = []) {
  return sections.find((section) => section.sectionFormat === 'cta' && Number(section.cta?.countdownMinutes) > 0)?.cta || null
}

function textLines(text = '') {
  return String(text)
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
}

function StickyRegistrationBar({action, settings, countdownCta, onOpenCta}) {
  const countdownMinutes = settings?.countdownMinutes || countdownCta?.countdownMinutes
  const durationSeconds = Math.max(0, Math.floor(Number(countdownMinutes) * 60))
  const [remainingSeconds, setRemainingSeconds] = useState(durationSeconds)

  useEffect(() => {
    setRemainingSeconds(durationSeconds)
    if (!durationSeconds) return undefined

    const intervalId = window.setInterval(() => {
      setRemainingSeconds((current) => Math.max(0, current - 1))
    }, 1000)

    return () => window.clearInterval(intervalId)
  }, [durationSeconds])

  if (settings?.enabled === false || !action?.label) return null
  const displayAction = {...action, label: settings?.buttonLabel || action.label}
  const offerLabel = formatOfferButtonLabel(displayAction.label)
  const handleClick = () => {
    if (displayAction.action === 'link' && displayAction.url) {
      window.location.href = displayAction.url
      return
    }
    onOpenCta(displayAction)
  }

  return (
    <motion.div
      className="fixed inset-x-0 bottom-0 z-50"
      initial={{opacity: 0, y: 100}}
      animate={{opacity: 1, y: 0}}
      transition={{duration: 0.3, delay: 1}}
    >
      <motion.button
        type="button"
        onClick={handleClick}
        className="group relative inline-flex w-full items-center justify-center overflow-hidden px-10 py-6 text-xl font-bold text-white shadow-2xl transition-all duration-300"
        style={{
          background: 'rgba(0, 0, 71, 0.7)',
          boxShadow: '0 0 30px rgba(0, 255, 255, 0.4), 0 20px 40px rgba(0, 0, 71, 0.3)',
          minHeight: '80px',
          borderRadius: '50px',
        }}
        whileHover={{
          scale: 1.08,
          boxShadow: '0 0 40px rgba(0, 255, 255, 0.5), 0 25px 50px rgba(0, 0, 71, 0.35)',
        }}
        whileTap={{scale: 0.98}}
      >
        <span className="relative z-10 flex min-w-0 flex-col items-center">
          <span className="flex min-w-0 items-center justify-center gap-2 whitespace-nowrap text-xl font-medium">
            <Rocket className="h-5 w-5 shrink-0 text-white" />
            {offerLabel ? (
              <>
                <span className="shrink whitespace-nowrap">{offerLabel.main}</span>
                <span className="shrink-0 whitespace-nowrap line-through decoration-white decoration-2">{offerLabel.oldPrice}</span>
              </>
            ) : (
              <span className="min-w-0 whitespace-nowrap">{displayAction.label}</span>
            )}
          </span>
          {durationSeconds > 0 && (
            <span className="mt-1 inline-flex items-center gap-1 text-xl font-bold leading-7 text-white/90">
              <Clock3 className="h-5 w-5 shrink-0 text-white" strokeWidth={2.8} />
              {formatCountdown(remainingSeconds)} {settings?.countdownLabel || 'left'}
            </span>
          )}
        </span>
        <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-white/0 via-white/20 to-white/0 transition-transform duration-700 group-hover:translate-x-full" />
      </motion.button>
    </motion.div>
  )
}

function sectionHasPrimaryMedia(section) {
  if (!section) return false
  if (section.media?.imageUrl || section.media?.videoUrl || section.media?.videoFileUrl) return true
  return false
}

function AdSection({section, index, previousSectionHasMedia = false, previousSection = null, onOpenCta}) {
  const format = section.sectionFormat || 'content'
  const items = section.items || []
  const modules = section.modules || []
  const timeline = section.timeline || []
  const faqs = section.faqs || []
  const testimonials = section.testimonials || []
  const useCenteredFirstSection = index === 0 && section.media && items.length > 0 && ['content', 'rich-text', 'list'].includes(format)
  const keyName = section._key || ''
  const isFrameworkSection = keyName === 'magna-framework'
  const isMagnaDifferentSection = keyName === 'what-makes-magna-different'
  const isMustAttendSection = keyName === 'must-attend-entrepreneurs'
  const isCloseWorkSection = keyName === 'work-closely-with-founders'
  const isGuaranteeSection = keyName === 'our-guarantee'
  const isFaqSection = keyName === 'frequently-asked-questions'
  const isFitCheckSection = keyName === 'who-is-this-for'
  const isTrustedBrandsSection = keyName === 'trusted-by-leading-brands'
  const isAchievementsSection = keyName === 'what-you-will-achieve'
  const frameworkMedia = isFrameworkSection ? section.media || previousSection?.media : null

  if (useCenteredFirstSection) {
    return (
      <SectionShell className="bg-[#fbfaf9] px-4 py-12">
        <div className="mx-auto w-full rounded-none bg-gradient-to-r from-[#3533cd] to-[#00ffff] px-4 py-12 text-center shadow-xl sm:px-8">
          <h2 className="mx-auto mb-9 max-w-md text-2xl font-bold leading-tight text-white">{section.sectionTitle}</h2>
          <div className="rounded-xl bg-white/95 p-5 shadow-xl sm:p-6">
            <FirstSectionMediaBlock media={section.media} />
            <MentorIntroDetails intro={section.intro} />
            {(section.body || []).length > 0 && <div className="mx-auto mt-6 max-w-3xl"><RichText blocks={section.body || []} /></div>}
            <div className="mx-auto mt-5 h-1 max-w-md bg-gradient-to-r from-[#3533cd] to-[#00ffff]" />
            <div className="mx-auto mt-6 max-w-5xl text-left">
              <InlineItemList items={items} bulletStyle />
            </div>
          </div>
        </div>
      </SectionShell>
    )
  }

  if (format === 'cta') {
    const cta = section.cta || {}
    const ctaAction = {
      label: cta.buttonLabel,
      action: cta.buttonAction || (cta.buttonUrl ? 'link' : 'form'),
      url: cta.buttonUrl,
      amount: cta.razorpayAmount,
      title: cta.formTitle || cta.headline || section.sectionTitle,
      description: cta.formDescription || cta.description || section.intro,
      submitLabel: cta.formButtonLabel,
      paymentDescription: cta.razorpayDescription || cta.headline || section.sectionTitle,
      sourceLabel: section.sectionTitle,
      showMessageField: cta.showMessageField !== false,
      ctaKey: section._key,
    }

    return (
      <SectionShell className="bg-[#fbfaf9] px-4 py-12">
        <div className="mx-auto max-w-md text-center">
          <CtaButton action={ctaAction} onOpenCta={onOpenCta} />
          <div className="mt-9 rounded-xl bg-red-50/80 px-6 py-10 text-center shadow-xl shadow-gray-300/60 ring-1 ring-red-100 sm:px-8">
            <CtaAlarmImage media={section.media} />
            <CtaCountdown minutes={cta.countdownMinutes} label={cta.countdownLabel} />
            <h2 className="mx-auto mt-8 max-w-sm text-xl font-bold leading-8 text-red-700 sm:text-2xl sm:leading-9">{cta.headline || section.sectionTitle}</h2>
          </div>
        </div>
      </SectionShell>
    )
  }

  if (format === 'content' || format === 'rich-text') {
    if (isGuaranteeSection) {
      const guaranteeLines = textLines(section.intro)
      const promiseTitle = guaranteeLines[0]
      const promiseBody = guaranteeLines.slice(1).join(' ')

      return (
        <SectionShell className="bg-white px-4 py-12">
          <div className="mx-auto max-w-sm rounded-2xl bg-gradient-to-br from-[#3533cd] to-[#00e0e6] px-6 py-8 text-center text-white shadow-2xl shadow-cyan-100/80 sm:max-w-3xl sm:px-10">
            <h2 className="text-2xl font-bold leading-tight text-white">{section.sectionTitle}</h2>
            {section.media?.imageUrl && (
              <img
                src={section.media.imageUrl}
                alt={section.media.imageAlt || section.media.caption || section.sectionTitle}
                className="mx-auto mt-8 h-32 w-32 object-contain sm:h-36 sm:w-36"
              />
            )}
            {promiseTitle && <h3 className="mt-8 text-2xl font-bold leading-8 text-white">{promiseTitle}</h3>}
            {promiseBody && (
              <p className="mx-auto mt-5 max-w-xs text-lg font-normal leading-relaxed text-white sm:max-w-md">
                {promiseBody}
              </p>
            )}
          </div>
        </SectionShell>
      )
    }

    const imageOnLeft = index % 2 === 1
    const contentBetweenContinuousImages = previousSectionHasMedia && sectionHasPrimaryMedia(section)
    const mediaOrderClass = contentBetweenContinuousImages
      ? 'order-2'
      : imageOnLeft
        ? 'order-1'
        : 'order-2'
    const contentOrderClass = contentBetweenContinuousImages
      ? 'order-1'
      : imageOnLeft
        ? 'order-2'
        : 'order-1'

    return (
      <SectionShell className={isGuaranteeSection ? 'bg-white px-4 py-12' : 'bg-[#fbfaf9] px-4 py-12'}>
        <div className={`${isGuaranteeSection ? 'rounded-2xl border border-[#3533cd]/20 bg-gradient-to-br from-[#3533cd] to-[#00ffff] p-5 shadow-xl' : ''}`}>
        <div className={`grid items-center gap-10 ${section.media ? 'lg:grid-cols-2' : ''}`}>
          {section.media && (
            <div className={mediaOrderClass}>
              <MediaBlock media={section.media} />
            </div>
          )}
          <div className={`${contentOrderClass} min-w-0`}>
            <h2 className={`text-2xl font-bold leading-tight ${isGuaranteeSection ? 'text-center text-white' : 'text-[#071a78]'}`}>{section.sectionTitle}</h2>
            {section.intro && <p className={`mt-4 whitespace-pre-line text-base leading-6 sm:text-lg sm:leading-7 ${isGuaranteeSection ? 'text-center text-white' : 'text-gray-700'}`}>{section.intro}</p>}
            <div className="mt-6"><RichText blocks={section.body || []} /></div>
            {items.length > 0 && (
              <div className="mt-7">
                <InlineItemList items={items} />
              </div>
            )}
          </div>
        </div>
        </div>
      </SectionShell>
    )
  }

  if (format === 'list') {
    return (
      <SectionShell className="bg-[#fbfaf9] px-4 py-12">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <SectionHeader section={section} />
            <MediaBlock media={section.media} />
          </div>
          <div className="self-center">
            <InlineItemList items={items} />
          </div>
        </div>
      </SectionShell>
    )
  }

  if (['cards', 'outcomes', 'stats', 'media-gallery'].includes(format)) {
    if (isAchievementsSection) {
      return (
        <SectionShell className="bg-white px-4 pb-24 pt-12">
          <div className="mx-auto max-w-sm text-center sm:max-w-3xl">
            <h2 className="mx-auto max-w-xs text-4xl font-bold uppercase leading-[1.08] text-gray-950 sm:max-w-2xl md:text-5xl">
              {section.sectionTitle}
            </h2>
            <div className="mx-auto mt-6 h-1 w-24 rounded-full bg-white shadow-sm" />
            <div className="mt-9 space-y-6 text-left">
              {items.map((item, itemIndex) => (
                <article key={item._key || `${item.title}-${itemIndex}`} className="rounded-xl bg-[#ded8ff] px-6 py-6 shadow-sm sm:px-8">
                  <div className="flex min-w-0 items-start gap-4">
                    <span className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#3533cd] text-lg font-extrabold leading-none text-white">
                      {item.iconLabel || itemIndex + 1}
                    </span>
                    <div className="min-w-0">
                      {item.title && <h3 className="text-xl font-bold leading-tight text-gray-950 md:text-2xl">{item.title}</h3>}
                      {item.description && <p className="mt-4 text-base leading-relaxed text-[#273044]">{item.description}</p>}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </SectionShell>
      )
    }

    if (isFrameworkSection) {
      return (
        <SectionShell className="bg-white px-4 py-0">
          <div className="mx-auto max-w-sm overflow-hidden bg-white sm:max-w-3xl">
            {frameworkMedia?.imageUrl && (
              <div className="bg-white px-5 pt-0 text-center">
                <img
                  src={frameworkMedia.imageUrl}
                  alt={frameworkMedia.imageAlt || frameworkMedia.caption || section.sectionTitle}
                  className="mx-auto h-auto max-h-[19rem] w-full object-contain sm:max-h-[26rem]"
                />
              </div>
            )}
          </div>
          <div className="-mx-4 bg-[#000047] px-4 py-14 text-center text-white sm:py-16">
            <div className="mx-auto max-w-sm sm:max-w-3xl">
              <h2 className="mx-auto max-w-xs text-4xl font-extrabold leading-[1.12] text-white sm:max-w-md md:text-5xl">
                {section.sectionTitle}
              </h2>
              {section.intro && (
                <p className="mx-auto mt-6 max-w-xs text-2xl font-semibold leading-8 text-white/90 sm:max-w-md">
                  {section.intro}
                </p>
              )}
              <div className="mt-9 space-y-6 text-left">
                {items.map((item, itemIndex) => (
                  <article key={item._key || `${item.title}-${itemIndex}`} className="rounded-2xl border border-white/10 bg-white/10 px-4 py-6 text-white shadow-lg shadow-blue-950/20 ring-1 ring-white/5 sm:px-6">
                    <div className="flex min-w-0 items-center gap-5">
                      <span className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full border-2 border-cyan-300 bg-white text-5xl font-extrabold leading-none text-[#5630e8] shadow-[0_0_28px_rgba(0,217,232,0.55)]">
                        {(item.iconLabel || item.title || String(itemIndex + 1)).slice(0, 1)}
                      </span>
                      <div className="min-w-0">
                        {item.title && <h3 className="text-xl font-extrabold uppercase leading-7 text-white/90 md:text-2xl md:leading-8">{item.title}</h3>}
                        {item.description && <p className="mt-3 text-base font-bold leading-6 text-white/90 sm:text-lg sm:leading-7">{item.description}</p>}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </SectionShell>
      )
    }

    if (isMagnaDifferentSection) {
      return (
        <SectionShell dark className="bg-[#000047] px-4 py-16">
          <div className="mx-auto max-w-sm sm:max-w-3xl">
            <h2 className="mx-auto mb-12 max-w-xs text-center text-4xl font-extrabold uppercase leading-[1.14] text-white sm:max-w-xl md:text-5xl">
              {section.sectionTitle}
            </h2>
            <div className="space-y-6">
              {items.map((item, itemIndex) => (
                <article key={item._key || `${item.title}-${itemIndex}`} className="rounded-2xl border border-cyan-200/30 bg-gradient-to-r from-[#2f5bdc] to-[#10d7df] px-6 py-7 text-white shadow-xl shadow-blue-950/20">
                  <div className="flex items-start gap-4">
                    <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/20">
                      <MagnaDifferentIcon index={itemIndex} />
                    </span>
                    <div className="min-w-0">
                      {item.title && <h3 className="text-lg font-bold leading-7 text-white">{item.title}</h3>}
                      {item.description && <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-white/90">{item.description}</p>}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </SectionShell>
      )
    }

    if (isMustAttendSection) {
      return (
        <SectionShell dark className="bg-[#000047] px-4 pb-24 pt-16">
          <div className="mx-auto max-w-sm sm:max-w-3xl">
            <h2 className="mx-auto max-w-sm text-center text-4xl font-extrabold leading-[1.12] text-white sm:max-w-2xl md:text-5xl">
              {section.sectionTitle}
            </h2>
            <div className="mt-12 space-y-7">
              {items.map((item, itemIndex) => (
                <article key={item._key || `${item.title}-${itemIndex}`} className="rounded-2xl bg-[#f5fcff] px-6 py-7 text-center text-[#07142d] shadow-xl shadow-blue-950/20 sm:px-8">
                  <div className="min-w-0">
                    <span className="mx-auto mb-5 flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#3478f6] text-white">
                      <Sparkles className="h-5 w-5" />
                    </span>
                    <div className="min-w-0 text-left">
                      {item.title && <h3 className="text-xl font-bold leading-tight text-gray-950">{item.title}</h3>}
                      {item.description && <p className="mt-3 text-base leading-relaxed text-[#273044]">{item.description}</p>}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </SectionShell>
      )
    }

    if (isCloseWorkSection) {
      return (
        <SectionShell dark className="bg-[#000047] px-4 pb-24 pt-4">
          <div className="mx-auto max-w-sm rounded-3xl border border-white/10 border-t-cyan-300 bg-white/15 px-6 py-10 text-center text-white shadow-2xl shadow-blue-950/30 sm:max-w-3xl sm:px-10">
            <h2 className="mx-auto max-w-sm text-2xl font-bold leading-tight text-white md:text-3xl">
              {section.sectionTitle}
            </h2>
            {section.intro && (
              <p className="mx-auto mt-6 max-w-xs text-lg font-normal leading-relaxed text-white/80 sm:max-w-md">
                {section.intro}
              </p>
            )}
            <div className="mt-12 space-y-9">
              {items.map((item, itemIndex) => (
                <article key={item._key || `${item.title}-${itemIndex}`} className="mx-auto max-w-xs text-center">
                  <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#3533cd] to-[#00d9e8] text-white shadow-lg shadow-blue-950/20">
                    {itemIndex === 0 ? <Brain className="h-7 w-7" /> : itemIndex === 1 ? <Settings className="h-7 w-7" /> : <CheckCircle2 className="h-7 w-7" />}
                  </span>
                  {item.title && <h3 className="mt-5 text-lg font-bold leading-7 text-white">{item.title}</h3>}
                  {item.description && <p className="mt-3 text-sm font-normal leading-relaxed text-white/80">{item.description}</p>}
                </article>
              ))}
            </div>
          </div>
        </SectionShell>
      )
    }

    if (isTrustedBrandsSection) {
      return (
        <SectionShell className="bg-white px-4 py-10">
          <div className="mx-auto max-w-sm rounded-2xl border-2 border-[#1f2937] bg-white px-5 py-9 text-center shadow-sm sm:max-w-3xl sm:px-8">
            <h2 className="mx-auto max-w-xs text-3xl font-bold leading-tight text-gray-900 sm:max-w-md sm:text-4xl lg:text-5xl">
              {section.sectionTitle}
            </h2>
            <div className="mx-auto mt-5 h-1 w-16 rounded-full bg-gradient-to-r from-[#3533cd] to-[#00d9e8]" />
            {section.intro && (
              <p className="mx-auto mt-7 max-w-xs text-lg leading-relaxed text-gray-600 sm:max-w-md sm:text-xl">
                {section.intro}
              </p>
            )}
            <div className="mx-auto mt-14 grid max-w-xs grid-cols-3 items-center gap-x-4 gap-y-10 sm:max-w-lg sm:gap-x-8 sm:gap-y-12">
              {items.map((item, itemIndex) => (
                <div key={item._key || `${item.title}-${itemIndex}`} className="flex h-10 min-w-0 items-center justify-center">
                  {item.media?.imageUrl && (
                    <img
                      src={item.media.imageUrl}
                      alt={item.media.imageAlt || item.media.caption || item.title || `Brand ${itemIndex + 1}`}
                      className="max-h-10 w-full object-contain"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </SectionShell>
      )
    }

    const isDark = format === 'cards' || isMustAttendSection || isCloseWorkSection
    const isTallDarkBand = isFrameworkSection || isMustAttendSection
    return (
      <SectionShell dark={isDark} className={isDark ? `bg-[#000047] ${isTallDarkBand ? 'py-20 md:py-24' : 'py-16 md:py-20'}` : 'bg-[#fbfaf9] px-4 py-12'}>
          <SectionHeader section={section} light={isDark} />
          <div className={`grid gap-6 ${format === 'media-gallery' ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-3' : isFrameworkSection ? 'space-y-7' : 'md:grid-cols-2 lg:grid-cols-3'}`}>
            {items.map((item, itemIndex) => (
              <article key={item._key || `${item.title}-${itemIndex}`} className={`${isDark ? 'border-white/15 bg-white/10 text-white' : 'border-[#3533cd]/20 bg-white text-gray-950'} ${isFrameworkSection ? 'flex items-center gap-8 rounded-xl px-5 py-5 md:px-6 md:py-6' : 'rounded-xl p-4'} min-w-0 border shadow-lg shadow-blue-950/5 transition hover:-translate-y-0.5 hover:shadow-xl`}>
                <MediaBlock media={item.media} className="mb-5" />
                <div className={`${isFrameworkSection ? 'mb-0' : 'mb-4'} flex items-center justify-between gap-4`}>
                  {format === 'stats' && item.metric ? <p className="text-3xl font-black text-primary-600 sm:text-4xl">{item.metric}</p> : <ItemMark label={item.iconLabel} index={itemIndex} light={isDark} />}
                </div>
                <div className="min-w-0">
                {item.title && <h3 className="text-xl font-bold leading-7">{item.title}</h3>}
                {item.description && <p className={`mt-3 whitespace-pre-line text-base leading-6 ${isDark ? 'text-cyan-50/85' : 'text-gray-600'}`}>{item.description}</p>}
                </div>
              </article>
            ))}
          </div>
      </SectionShell>
    )
  }

  if (format === 'differentiators') {
    const isTransformationSection = keyName === 'consumer-brand-transformation'
    const isBeforeAfterSection = keyName === 'before-after-magna'

    if (isFitCheckSection) {
      return (
        <SectionShell className="bg-white px-4 py-12">
          <div className="mx-auto max-w-sm text-center sm:max-w-4xl">
            <h2 className="text-4xl font-extrabold leading-tight text-gray-950 md:text-5xl">{section.sectionTitle}</h2>
            {section.intro && (
              <p className="mx-auto mt-5 max-w-sm whitespace-pre-line text-2xl font-semibold leading-8 text-gray-700 sm:max-w-2xl">
                {section.intro}
              </p>
            )}
            <div className="mt-14 grid gap-8 lg:grid-cols-2">
              {items.map((item, itemIndex) => {
                const lines = textLines(item.description)
                const introLine = lines[0]
                const bullets = lines.slice(1)

                return (
                  <article key={item._key || `${item.title}-${itemIndex}`} className="overflow-hidden rounded-2xl bg-white text-gray-950 shadow-[0_0_34px_rgba(0,207,224,0.22)] ring-1 ring-cyan-100">
                    <div className="px-6 pb-10 pt-6">
                      <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-r from-[#3533cd] to-[#00d9e8] text-white">
                        {itemIndex === 0 ? <Check className="h-5 w-5" /> : <X className="h-5 w-5" />}
                      </span>
                      {item.title && <h3 className="mt-5 text-base font-bold uppercase leading-6 text-[#2716d8]">{item.title}</h3>}
                      {introLine && <p className="mx-auto mt-2 max-w-[13rem] text-lg font-extrabold leading-7 text-[#000047]">{introLine}</p>}
                    </div>
                    <div className="border-t border-gray-100 px-6 py-7 text-left">
                      <div className="space-y-5">
                        {bullets.map((line) => (
                          <div key={line} className="flex min-w-0 items-start gap-4">
                            <span className={`mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${itemIndex === 0 ? 'bg-indigo-50 text-[#3533cd]' : 'bg-red-50 text-red-600'}`}>
                              {itemIndex === 0 ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                            </span>
                            <p className="min-w-0 text-lg leading-relaxed text-gray-800">{line}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>
          </div>
        </SectionShell>
      )
    }

    if (isTransformationSection) {
      const problemLines = textLines(items[0]?.description)
      const outcomeLines = textLines(items[1]?.description)
      const outcomeBullets = outcomeLines.slice(0, 3)
      const outcomeNotes = outcomeLines.slice(3)

      return (
        <SectionShell className="bg-white px-4 py-10">
          <div className="mx-auto max-w-sm rounded-lg bg-gradient-to-b from-[#3533cd] via-[#256fdf] to-[#00cfe0] px-4 pb-8 pt-5 text-white shadow-md sm:max-w-3xl sm:px-6 lg:max-w-4xl">
            <h2 className="mx-auto mb-8 max-w-md text-center text-lg font-bold leading-7 text-white md:text-xl">
              {section.sectionTitle}
            </h2>

            {items[0] && (
              <article className="rounded-lg bg-red-50/95 p-4 text-gray-950 shadow-sm">
                {items[0].title && <h3 className="mb-3 text-base font-bold leading-6 text-gray-900">{items[0].title}</h3>}
                <div className="space-y-3">
                  {problemLines.map((line) => (
                    <div key={line} className="flex min-w-0 items-start gap-3">
                      <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600">
                        <X className="h-3.5 w-3.5" />
                      </span>
                      <p className="min-w-0 text-base leading-6 text-gray-950">{line}</p>
                    </div>
                  ))}
                </div>
              </article>
            )}

            {items[1] && (
              <div className="mt-9">
                {items[1].title && (
                  <h3 className="mx-auto mb-8 max-w-sm text-center text-xl font-bold leading-8 text-white">
                    {items[1].title}
                  </h3>
                )}
                <article className="rounded-lg bg-emerald-50/95 p-4 text-gray-950 shadow-sm">
                  <div className="space-y-3">
                    {outcomeBullets.map((line) => (
                      <div key={line} className="flex min-w-0 items-start gap-3">
                        <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                          <Check className="h-3.5 w-3.5" />
                        </span>
                        <p className="min-w-0 text-base leading-6 text-gray-950">{line}</p>
                      </div>
                    ))}
                  </div>
                </article>
                {outcomeNotes.length > 0 && (
                  <div className="mx-auto mt-7 max-w-sm space-y-4 text-center text-lg font-bold leading-7 text-white">
                    {outcomeNotes.map((line) => <p key={line}>{line}</p>)}
                  </div>
                )}
              </div>
            )}
          </div>
        </SectionShell>
      )
    }

    if (isBeforeAfterSection) {
      return (
        <SectionShell className="bg-white px-4 py-10">
          <div className="mx-auto max-w-sm space-y-9 sm:max-w-3xl">
            {isBeforeAfterSection && (
              <h2 className="mx-auto max-w-sm text-center text-4xl font-extrabold uppercase leading-[1.08] text-gray-950 sm:max-w-2xl md:text-5xl">
                {section.sectionTitle}
              </h2>
            )}
            {items.slice(0, 2).map((item, itemIndex) => {
              const isBefore = itemIndex === 0
              const lines = textLines(item.description)
              const headline = lines[0]
              const bullets = lines.slice(1)

              return (
                <article
                  key={item._key || `${item.title}-${itemIndex}`}
                  className={`overflow-hidden rounded-2xl border bg-white shadow-lg shadow-gray-300/60 ${
                    isBefore
                      ? 'border-red-100 border-t-[6px] border-t-red-400 bg-red-50/45'
                      : 'border-emerald-100 border-t-[6px] border-t-emerald-400 bg-cyan-50/35'
                  }`}
                >
                  <div className="px-6 pb-7 pt-6 text-center">
                    <div className="inline-flex items-center justify-center gap-3">
                      <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-white ${isBefore ? 'bg-red-600' : 'bg-gradient-to-br from-emerald-500 to-cyan-400'}`}>
                        {isBefore ? <span className="text-xl font-bold leading-none">!</span> : <Check className="h-5 w-5" />}
                      </span>
                      {item.title && <h3 className={`text-lg font-bold leading-7 ${isBefore ? 'text-red-600' : 'text-emerald-600'}`}>{item.title}</h3>}
                    </div>
                    {headline && <p className="mx-auto mt-7 max-w-xs text-center text-xl font-extrabold leading-7 text-[#000047] sm:text-2xl sm:leading-8">{headline}</p>}
                  </div>
                  {bullets.length > 0 && (
                    <div className={`border-t px-7 py-7 text-left ${isBefore ? 'border-red-100' : 'border-cyan-100'}`}>
                      <div className="space-y-6">
                        {bullets.map((line) => (
                          <div key={line} className="flex min-w-0 items-start gap-4">
                            <span className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${isBefore ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-700'}`}>
                              {isBefore ? <X className="h-4 w-4" /> : <Check className="h-4 w-4" />}
                            </span>
                            <p className="min-w-0 text-lg leading-7 text-[#07142d]">{line}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </article>
              )
            })}
          </div>
        </SectionShell>
      )
    }

    return (
      <SectionShell className="bg-[#fbfaf9] px-4 py-12">
          <div className="grid items-start gap-6 lg:grid-cols-[70%_30%] lg:gap-8">
            <div className="rounded-lg bg-gradient-to-br from-[#3533cd] to-[#00ffff] p-4 text-white shadow-md lg:-ml-3">
              <SectionHeader section={section} light />
              <div className="grid gap-5">
            {items.map((item, itemIndex) => (
              <article key={item._key || `${item.title}-${itemIndex}`} className={`${itemIndex === 0 ? 'bg-red-50/95' : 'bg-emerald-50/95'} min-w-0 rounded-xl p-4 text-gray-950 shadow-sm ring-1 ring-white/40`}>
                <div className="flex min-w-0 items-start gap-3 sm:gap-4">
                  <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${itemIndex === 0 ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-700'}`}>
                    {itemIndex === 0 ? <X className="h-4 w-4" /> : <Check className="h-4 w-4" />}
                  </span>
                  <div className="min-w-0">
                    {item.title && <h3 className="text-xl font-bold leading-7 text-gray-950">{item.title}</h3>}
                    {item.description && <p className="mt-3 whitespace-pre-line text-base leading-6 text-gray-600">{item.description}</p>}
                    <MediaBlock media={item.media} className="mt-5" />
                  </div>
                </div>
              </article>
            ))}
              </div>
            </div>
            <MediaBlock media={section.media} className="hidden lg:block" />
          </div>
      </SectionShell>
    )
  }

  if (format === 'accordion' || format === 'faqs') {
    const rows = format === 'faqs' ? faqs.map((faq) => ({title: faq.question, description: faq.answer, media: faq.media})) : items

    if (isFaqSection) {
      return (
        <SectionShell className="bg-[#fbfaf9] px-4 py-12">
          <div className="mx-auto max-w-sm overflow-hidden rounded-none bg-gradient-to-r from-[#3533cd] to-[#00d9e8] px-5 py-9 text-center sm:max-w-3xl sm:px-8 sm:py-12">
            <h2 className="mx-auto max-w-xs text-2xl font-bold leading-tight text-white sm:max-w-lg">
              {section.sectionTitle}
            </h2>
            {section.intro && (
              <p className="mx-auto mt-6 max-w-sm whitespace-pre-line text-base font-normal leading-relaxed text-white sm:max-w-xl">
                {section.intro}
              </p>
            )}
            <div className="mt-8 space-y-4 text-left">
              {rows.map((row, rowIndex) => (
                <details key={`${row.title}-${rowIndex}`} className="group min-w-0 rounded-xl bg-white p-4 shadow-lg shadow-blue-950/10 ring-1 ring-white/40">
                  <summary className="flex min-w-0 cursor-pointer list-none items-center justify-between gap-4 text-base font-bold leading-6 text-gray-950 sm:text-lg">
                    <span className="min-w-0">{row.title}</span>
                    <ChevronDown className="h-5 w-5 shrink-0 text-primary-600 transition group-open:rotate-180" />
                  </summary>
                  {row.description && <p className="mt-4 border-t border-gray-100 pt-4 text-base leading-6 text-gray-600">{row.description}</p>}
                  <MediaBlock media={row.media} className="mt-5" />
                </details>
              ))}
            </div>
          </div>
        </SectionShell>
      )
    }

    return (
      <SectionShell className="bg-[#fbfaf9] px-4 py-12">
        <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <SectionHeader section={section} />
            <MediaBlock media={section.media} />
          <div className="space-y-4">
            {rows.map((row, rowIndex) => (
              <details key={`${row.title}-${rowIndex}`} className="group min-w-0 rounded-xl bg-white p-4 shadow-lg shadow-blue-950/5 ring-1 ring-[#3533cd]/20">
                <summary className="flex min-w-0 cursor-pointer list-none items-center justify-between gap-4 text-base font-bold leading-6 text-gray-950 sm:text-lg">
                  <span className="min-w-0">{row.title}</span>
                  <ChevronDown className="h-5 w-5 shrink-0 text-primary-600 transition group-open:rotate-180" />
                </summary>
                {row.description && <p className="mt-4 border-t border-gray-100 pt-4 text-base leading-6 text-gray-600">{row.description}</p>}
                <MediaBlock media={row.media} className="mt-5" />
              </details>
            ))}
          </div>
          </div>
        </div>
      </SectionShell>
    )
  }

  if (format === 'curriculum' || format === 'timeline') {
    const rows = format === 'curriculum' ? modules : timeline

    if (format === 'curriculum') {
      return (
        <SectionShell dark className="bg-[#000047] px-4 py-12">
          <div className="mx-auto max-w-sm space-y-8 sm:max-w-3xl">
            <div className="mx-auto mb-14 max-w-md text-center sm:max-w-2xl">
              <h2 className="text-4xl font-extrabold leading-tight text-white md:text-5xl md:leading-tight">
                {section.sectionTitle}
              </h2>
              {section.intro && (
                <p className="mx-auto mt-7 max-w-md whitespace-pre-line text-xl font-normal leading-8 text-white/90 md:text-2xl md:leading-9">
                  {section.intro}
                </p>
              )}
            </div>
            {rows.map((row, rowIndex) => {
              const titleParts = String(row.title || '').split(':')
              const dayLabel = titleParts[0]?.trim() || `Day ${rowIndex + 1}`
              const dayTitle = titleParts.slice(1).join(':').trim() || row.title

              return (
                <article key={row._key || `${row.title}-${rowIndex}`} className="rounded-3xl border border-cyan-300/30 border-t-cyan-300 bg-gradient-to-br from-[#3533cd] to-[#1f74e4] px-6 py-8 text-white shadow-2xl shadow-blue-950/30 sm:px-8">
                  <div className="mx-auto flex h-16 w-20 items-center justify-center rounded-2xl bg-white text-center text-lg font-extrabold text-[#3533cd] shadow-lg">
                    {dayLabel}
                  </div>
                  <h2 className="mx-auto mt-7 max-w-xs text-center text-2xl font-extrabold uppercase leading-8 text-white md:text-3xl md:leading-tight">
                    {dayTitle}
                  </h2>
                  <div className="mt-7">
                    <CurriculumSessionCard title={row.title} lessons={row.lessons || []} />
                  </div>
                </article>
              )
            })}
          </div>
        </SectionShell>
      )
    }

    return (
      <SectionShell dark className="bg-[#000047] px-4 py-16 md:py-20">
          <SectionHeader section={section} light />
          <div className="space-y-5">
            {rows.map((row, rowIndex) => (
              <article key={row._key || `${row.title}-${rowIndex}`} className="min-w-0 rounded-xl border border-white/15 bg-white/10 p-4 shadow-lg sm:p-6">
                <p className="text-xs font-black uppercase tracking-[0.14em] text-cyan-200 sm:text-sm sm:tracking-[0.18em]">{row.timeLabel || `Step ${rowIndex + 1}`}</p>
                <h3 className="mt-2 text-xl font-black leading-tight sm:text-2xl">{row.title}</h3>
                {row.description && <p className="mt-3 text-sm leading-6 text-cyan-50/85 sm:text-base sm:leading-7">{row.description}</p>}
                {row.lessons?.length > 0 && (
                  <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                    {row.lessons.map((lesson) => <li key={lesson} className="flex min-w-0 gap-3 text-sm leading-6 sm:text-base"><Sparkles className="mt-1 h-4 w-4 shrink-0 text-cyan-200" /><span className="min-w-0">{lesson}</span></li>)}
                  </ul>
                )}
                <MediaBlock media={row.media} className="mt-6" />
              </article>
            ))}
          </div>
      </SectionShell>
    )
  }

  if (format === 'testimonials') {
    return (
      <SectionShell className="bg-[#fbfaf9]">
          <SectionHeader section={section} />
          <div className="grid gap-6 md:grid-cols-2">
            {testimonials.map((testimonial, testimonialIndex) => (
              <figure key={testimonial._key || `${testimonial.name}-${testimonialIndex}`} className="min-w-0 rounded-lg bg-white p-5 shadow-sm ring-1 ring-cyan-100 sm:p-6">
                <MediaBlock media={testimonial.media} className="mb-5" />
                <Quote className="mb-5 h-9 w-9 text-primary-600" />
                <blockquote className="text-base leading-7 text-gray-800 sm:text-lg sm:leading-8">{testimonial.quote}</blockquote>
                {(testimonial.name || testimonial.designation) && (
                  <figcaption className="mt-6 border-t border-gray-100 pt-5 font-black text-gray-950">
                    {testimonial.name}
                    {testimonial.designation && <span className="block pt-1 font-semibold text-gray-500">{testimonial.designation}</span>}
                  </figcaption>
                )}
              </figure>
            ))}
          </div>
      </SectionShell>
    )
  }

  return null
}

export default function AdPage({slugOverride, pathOverride}) {
  const params = useParams()
  const slug = slugOverride || params.slug
  const [page, setPage] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeCta, setActiveCta] = useState(null)

  useEffect(() => {
    let mounted = true

    async function fetchAdPage() {
      setLoading(true)
      setError('')

      try {
        const data = await mentorClient.fetch(
          `*[_type == "adPages" && status == "published" && (slug.current == $slug || _id == $slug)][0] { ${adPageFields} }`,
          {slug},
        )
        if (mounted) setPage(data || null)
      } catch (fetchError) {
        console.error('Ad page fetch failed:', fetchError)
        if (mounted) setError('Unable to load this page right now.')
      } finally {
        if (mounted) setLoading(false)
      }
    }

    fetchAdPage()
    return () => {
      mounted = false
    }
  }, [slug])

  const pageTitle = useMemo(() => page ? `${page.seoTitle || page.title} | Magnafic` : 'Ad Page | Magnafic', [page])
  const primaryAction = useMemo(() => page ? {
    label: page.primaryButtonLabel,
    action: page.primaryButtonAction || (page.primaryButtonUrl ? 'link' : 'form'),
    url: page.primaryButtonUrl,
    amount: page.primaryRazorpayAmount,
    title: page.primaryFormTitle || page.headline || page.title,
    description: page.primaryFormDescription || page.shortDescription,
    submitLabel: page.primaryFormButtonLabel,
    paymentDescription: page.primaryRazorpayDescription || page.headline || page.title,
    sourceLabel: page.title,
    showMessageField: true,
    ctaKey: 'primary',
  } : null, [page])
  const countdownCta = useMemo(() => findCountdownCta(page?.sections || []), [page])
  const workshopDetails = useMemo(() => {
    if (page?.workshopDetails?.length) return page.workshopDetails
    return workshopDetailsFromDescription(page?.shortDescription)
  }, [page?.shortDescription, page?.workshopDetails])

  if (loading) return <div className="min-h-screen bg-[#f7f9ff] px-4 py-20"><MagnaLoader message="Loading page..." /></div>

  if (error || !page) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7f9ff] px-4">
        <SEO title="Ad Page Not Found" path={slug ? `/ads/${slug}` : '/ads'} />
        <div className="max-w-xl rounded-lg bg-white p-8 text-center shadow-xl">
          <h1 className="text-3xl font-black text-[#000047]">Page not found</h1>
          <p className="mt-3 text-gray-600">{error || 'This ad page is not published or does not exist.'}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#fbfaf9] pb-28">
      <SEO
        title={pageTitle}
        description={page.seoDescription || page.shortDescription}
        path={pathOverride || `/ads/${page.slug || page._id}`}
        image={page.heroMedia?.imageUrl}
      />
      <section className="relative overflow-hidden bg-[#fbfaf9] px-4 pb-8 pt-12 sm:pb-12 sm:pt-10">
        <div className="relative mx-auto max-w-6xl">
          <h1 className="mx-auto mb-7 max-w-6xl bg-gradient-to-r from-[#000080] via-[#1e3a8a] to-[#1e40af] bg-clip-text text-center text-3xl font-black leading-tight text-transparent md:text-4xl lg:text-5xl">{page.headline}</h1>
          {page.shortDescription && (
            <div className="mx-auto max-w-6xl rounded-xl border border-[#3533cd]/20 bg-gradient-to-r from-[#3533cd] to-[#00ffff] px-5 py-4 text-center shadow-lg">
              <p className="text-xl font-medium leading-normal text-white md:text-2xl">{page.shortDescription}</p>
            </div>
          )}
          <div className="mt-7 grid items-start gap-8 lg:mt-1 lg:grid-cols-[0.48fr_0.52fr]">
            <div className="order-2 min-w-0 pt-3 text-center lg:order-1 lg:pt-24">
              <h2 className="mb-6 text-2xl font-bold leading-8 text-gray-900">Workshop Details</h2>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
                {workshopDetails.map((detail, detailIndex) => {
                  const DetailIcon = detailIconMap[detail.icon] || Sparkles
                  return (
                    <div key={detail._key || `${detail.label}-${detailIndex}`} className="min-w-0 rounded-xl border border-[#3533cd]/20 bg-white p-4 text-center shadow-lg">
                      <span className="mx-auto flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-r from-[#342fd8] to-[#12e6e8] text-white">
                        <DetailIcon className="h-4 w-4" />
                      </span>
                      <p className="mt-3 text-sm font-normal leading-6 text-gray-700">{detail.label}</p>
                    </div>
                  )
                })}
              </div>
              <div className="mt-12 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-center sm:gap-4">
                <CtaButton action={primaryAction} onOpenCta={setActiveCta} />
                {page.secondaryButtonLabel && page.secondaryButtonUrl && (
                  <a href={page.secondaryButtonUrl} className="inline-flex w-full min-w-0 items-center justify-center rounded-[1.15rem] border border-[#342fd8]/30 px-5 py-3.5 text-center text-sm font-extrabold leading-snug text-[#071a78] transition hover:bg-white sm:w-auto sm:px-7 sm:py-4 sm:text-base">
                    <span className="min-w-0 break-words">{page.secondaryButtonLabel}</span>
                  </a>
                )}
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <HeroMediaBlock media={page.heroMedia} />
            </div>
          </div>
        </div>
      </section>

      <main>
        {(page.sections || []).map((section, index, sections) => (
          <AdSection
            key={section._key || `${section.sectionTitle}-${index}`}
            section={section}
            index={index}
            previousSectionHasMedia={sectionHasPrimaryMedia(sections[index - 1])}
            previousSection={sections[index - 1]}
            onOpenCta={setActiveCta}
          />
        ))}
      </main>
      <StickyRegistrationBar action={primaryAction} settings={page.stickyRegistrationBar} countdownCta={countdownCta} onOpenCta={setActiveCta} />
      <AdCtaModal page={page} cta={activeCta} onClose={() => setActiveCta(null)} />
    </div>
  )
}

function AdCtaModal({page, cta, onClose}) {
  const [formData, setFormData] = useState({name: '', contactNo: '', email: '', message: ''})
  const [status, setStatus] = useState({type: '', message: ''})
  const [submitting, setSubmitting] = useState(false)
  const isPayment = cta?.action === 'razorpay'

  useEffect(() => {
    if (!cta) return undefined

    const handleEscape = (event) => {
      if (event.key === 'Escape' && !submitting) onClose()
    }

    document.addEventListener('keydown', handleEscape)
    document.body.style.overflow = 'hidden'
    if (isPayment) loadRazorpayCheckout()

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = ''
    }
  }, [cta, isPayment, onClose, submitting])

  if (!cta) return null

  const updateField = (event) => {
    const {name, value} = event.target
    setFormData((current) => ({...current, [name]: value}))
  }

  const closeModal = () => {
    if (submitting) return
    setStatus({type: '', message: ''})
    setFormData({name: '', contactNo: '', email: '', message: ''})
    onClose()
  }

  const handleFormSubmit = async (event) => {
    event.preventDefault()
    setSubmitting(true)
    setStatus({type: '', message: ''})

    try {
      if (isPayment) {
        const checkoutLoaded = await loadRazorpayCheckout()
        if (!checkoutLoaded || !window.Razorpay) {
          throw new Error('Unable to load the payment gateway. Please try again.')
        }

        const amount = Number(cta.amount) > 0 ? Number(cta.amount) : 99
        const paymentPayload = {
          ...formData,
          amount,
          program: cta.paymentDescription || cta.title || page.title,
          sourcePath: `/ads/${page.slug || page._id}`,
        }
        const orderResponse = await fetch('/.netlify/functions/create-workshop-order', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify(paymentPayload),
        })
        const orderResult = await orderResponse.json().catch(() => ({}))
        if (!orderResponse.ok) throw new Error(orderResult.error || 'Unable to start payment.')

        const razorpay = new window.Razorpay({
          key: orderResult.keyId,
          amount: orderResult.order.amount,
          currency: orderResult.order.currency,
          name: 'Magnafic',
          description: cta.paymentDescription || cta.title || page.title,
          order_id: orderResult.order.id,
          prefill: {
            name: formData.name.trim(),
            email: formData.email.trim(),
            contact: formData.contactNo.trim(),
          },
          notes: {
            program: cta.paymentDescription || cta.title || page.title,
            source: `/ads/${page.slug || page._id}`,
          },
          theme: {color: '#000047'},
          modal: {ondismiss: () => setSubmitting(false)},
          handler: async (paymentResponse) => {
            try {
              const verificationResponse = await fetch('/.netlify/functions/verify-workshop-payment', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                  ...paymentPayload,
                  razorpayOrderId: paymentResponse.razorpay_order_id,
                  razorpayPaymentId: paymentResponse.razorpay_payment_id,
                  razorpaySignature: paymentResponse.razorpay_signature,
                }),
              })
              const verificationResult = await verificationResponse.json().catch(() => ({}))
              if (!verificationResponse.ok || !verificationResult.verified) {
                throw new Error(verificationResult.error || 'Payment could not be verified.')
              }

              await sendAdActionEmail({
                page,
                cta,
                formData,
                actionType: 'payment',
                paymentId: verificationResult.paymentId || paymentResponse.razorpay_payment_id,
                amount,
              })
              setStatus({type: 'success', message: 'Payment successful. Our team will contact you shortly.'})
              setFormData({name: '', contactNo: '', email: '', message: ''})
            } catch (verificationError) {
              console.error('Ad page payment verification failed:', verificationError)
              setStatus({type: 'error', message: verificationError.message || 'Payment verification failed.'})
            } finally {
              setSubmitting(false)
            }
          },
        })

        razorpay.on('payment.failed', (response) => {
          console.error('Ad page payment failed:', response.error)
          setStatus({type: 'error', message: response.error?.description || 'Payment failed. Please try again.'})
          setSubmitting(false)
        })

        razorpay.open()
        return
      }

      await addDoc(collection(db, 'contactMessages'), {
        name: formData.name.trim(),
        email: formData.email.trim(),
        contactNo: formData.contactNo.trim(),
        message: formData.message.trim(),
        sourcePath: `/ads/${page.slug || page._id}`,
        sourceType: 'ad-page-form',
        sourceTitle: page.title || '',
        ctaTitle: cta.sourceLabel || cta.title || '',
        status: 'sent',
        channel: 'ad-page-form',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })

      await sendAdActionEmail({
        page,
        cta,
        formData,
        actionType: 'form',
      })
      setStatus({type: 'success', message: 'Thank you. Your details have been submitted successfully.'})
      setFormData({name: '', contactNo: '', email: '', message: ''})
    } catch (submitError) {
      console.error('Ad CTA submission failed:', submitError)
      setStatus({type: 'error', message: submitError.message || 'Unable to submit right now.'})
    } finally {
      if (!isPayment) setSubmitting(false)
    }
  }

  const modalTitle = 'Register for MAGNA Program'
  const submitText = isPayment ? 'Pay ₹1 & Register' : (cta.submitLabel || 'Register')

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/55 px-4 py-6 backdrop-blur-sm">
      <div className="relative max-h-[92vh] w-full max-w-sm overflow-y-auto rounded-2xl bg-white px-6 py-7 shadow-2xl sm:max-w-md sm:px-8">
        <button
          type="button"
          onClick={closeModal}
          disabled={submitting}
          className="absolute right-5 top-8 inline-flex h-8 w-8 items-center justify-center rounded-full text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50"
          aria-label="Close form"
        >
          <X className="h-6 w-6" strokeWidth={2.8} />
        </button>
        <h2 className="pr-10 text-2xl font-extrabold leading-tight text-gray-900 sm:text-3xl">
          {modalTitle}
        </h2>
        <form onSubmit={handleFormSubmit} className="mt-7 space-y-4">
          <AdInput id="ad-cta-name" name="name" label="Full Name" value={formData.name} onChange={updateField} autoComplete="name" placeholder="Enter your full name" />
          <AdInput id="ad-cta-contact" name="contactNo" label="Mobile Number" type="tel" value={formData.contactNo} onChange={updateField} autoComplete="tel" placeholder="Enter 10-digit mobile number" />
          <AdInput id="ad-cta-email" name="email" label="Email Address" type="email" value={formData.email} onChange={updateField} autoComplete="email" placeholder="Enter your email address" />
          {status.message && (
            <div className={`rounded-lg p-4 text-sm font-semibold ${status.type === 'success' ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100' : 'bg-red-50 text-red-700 ring-1 ring-red-100'}`}>
              {status.message}
            </div>
          )}
          <button
            type="submit"
            disabled={submitting || status.type === 'success'}
            className="mt-6 inline-flex w-full min-w-0 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#3533cd] to-[#00d9e8] px-6 py-4 text-center text-lg font-extrabold leading-snug text-white shadow-lg shadow-cyan-500/20 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting && <Loader2 className="h-5 w-5 animate-spin" />}
            <span className="min-w-0 break-words">
              {submitting ? (isPayment ? 'Opening Payment...' : 'Submitting...') : submitText}
            </span>
          </button>
          <p className="mx-auto max-w-xs text-center text-sm leading-5 text-gray-500">
            By registering, you agree to our{' '}
            <a href="/terms-and-conditions" target="_blank" rel="noopener noreferrer" className="font-semibold text-[#3533cd] underline underline-offset-2">
              terms
            </a>{' '}
            and{' '}
            <a href="/privacy-policy" target="_blank" rel="noopener noreferrer" className="font-semibold text-[#3533cd] underline underline-offset-2">
              privacy policy
            </a>
          </p>
        </form>
      </div>
    </div>
  )
}

function AdInput({id, name, label, type = 'text', value, onChange, autoComplete, placeholder}) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-semibold text-gray-700">{label} *</label>
      <input
        id={id}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        required
        autoComplete={autoComplete}
        placeholder={placeholder}
        className="w-full rounded-lg border border-gray-300 px-4 py-3.5 text-base text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#3533cd] focus:ring-2 focus:ring-[#3533cd]/15"
      />
    </div>
  )
}
