import {useEffect, useMemo, useState} from 'react'
import {addDoc, collection, serverTimestamp} from 'firebase/firestore'
import {ArrowRight, CheckCircle2, ChevronDown, CreditCard, Loader2, Quote, Sparkles, X} from 'lucide-react'
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
  eyebrow,
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
  secondaryButtonLabel,
  secondaryButtonUrl,
  theme,
  heroMedia{${mediaFields}},
  sections[]{
    _key,
    eyebrow,
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
      media{${mediaFields}}
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
    <div className="space-y-4 text-base leading-8 text-gray-600">
      {blocks.map((block) => {
        const text = blockText(block)
        if (!text) return null

        if (block.style === 'h2') return <h2 key={block._key} className="text-3xl font-black leading-tight text-[#000047]">{text}</h2>
        if (block.style === 'h3') return <h3 key={block._key} className="text-xl font-black leading-tight text-[#000047]">{text}</h3>
        if (block.listItem) {
          return (
            <div key={block._key} className="flex gap-3">
              <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-cyan" />
              <p>{text}</p>
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
          className="max-h-[34rem] w-full object-contain"
        />
        {media.caption && <figcaption className="mt-3 text-sm font-semibold text-gray-500">{media.caption}</figcaption>}
      </figure>
    )
  }

  return null
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
      <figure className="relative">
        <img
          src={media.imageUrl}
          alt={media.imageAlt || media.caption || ''}
          className="max-h-[36rem] w-full object-contain"
        />
        {media.caption && <figcaption className="mt-3 text-sm font-semibold text-cyan-50/80">{media.caption}</figcaption>}
      </figure>
    )
  }

  return null
}

function SectionHeader({section, light = false}) {
  return (
    <div className="mb-10 max-w-3xl">
      {section.eyebrow && (
        <p className={`text-sm font-black uppercase tracking-[0.2em] ${light ? 'text-cyan-200' : 'text-primary-600'}`}>{section.eyebrow}</p>
      )}
      <h2 className={`mt-3 text-3xl font-black leading-tight sm:text-4xl ${light ? 'text-white' : 'text-[#000047]'}`}>{section.sectionTitle}</h2>
      {section.intro && <p className={`mt-5 text-lg leading-8 ${light ? 'text-cyan-50/85' : 'text-gray-600'}`}>{section.intro}</p>}
    </div>
  )
}

function SectionShell({children, className = '', dark = false}) {
  return (
    <section className={`${dark ? 'bg-[#050545] text-white' : 'bg-white text-gray-950'} px-4 py-14 sm:px-6 lg:px-8 lg:py-20 ${className}`}>
      <div className="mx-auto max-w-7xl">{children}</div>
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

function InlineItemList({items = [], light = false}) {
  if (!items.length) return null

  return (
    <div className="space-y-4">
      {items.map((item, itemIndex) => (
        <div key={item._key || `${item.title}-${itemIndex}`} className={`flex gap-4 border-b pb-4 last:border-b-0 last:pb-0 ${light ? 'border-white/15' : 'border-gray-100'}`}>
          <CheckCircle2 className={`mt-1 h-5 w-5 shrink-0 ${light ? 'text-cyan-200' : 'text-cyan'}`} />
          <div>
            {item.title && <h3 className={`text-lg font-black leading-tight sm:text-xl ${light ? 'text-white' : 'text-[#000047]'}`}>{item.title}</h3>}
            {item.description && <p className={`mt-2 text-base leading-8 ${light ? 'text-cyan-50/85' : 'text-gray-600'}`}>{item.description}</p>}
            <MediaBlock media={item.media} className="mt-4" />
          </div>
        </div>
      ))}
    </div>
  )
}

function CtaButton({action, variant = 'primary', onOpenCta}) {
  if (!action?.label) return null

  const className = variant === 'secondary'
    ? 'inline-flex items-center rounded-full border border-white/30 px-7 py-4 font-extrabold text-white transition hover:bg-white/10'
    : 'inline-flex items-center rounded-full bg-cyan px-7 py-4 font-extrabold text-[#000047] shadow-lg shadow-cyan/20 transition hover:-translate-y-0.5'

  if (action.action === 'link' && action.url) {
    return (
      <a href={action.url} className={className}>
        {action.label}
        {variant !== 'secondary' && <ArrowRight className="ml-2 h-5 w-5" />}
      </a>
    )
  }

  return (
    <button type="button" onClick={() => onOpenCta(action)} className={className}>
      {action.label}
      {action.action === 'razorpay' ? <CreditCard className="ml-2 h-5 w-5" /> : <ArrowRight className="ml-2 h-5 w-5" />}
    </button>
  )
}

function AdSection({section, index, onOpenCta}) {
  const format = section.sectionFormat || 'content'
  const items = section.items || []
  const modules = section.modules || []
  const timeline = section.timeline || []
  const faqs = section.faqs || []
  const testimonials = section.testimonials || []

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
    }

    return (
      <SectionShell className="bg-[#f7fbff]">
        <div className="grid items-center gap-8 overflow-hidden rounded-lg bg-[#000047] p-7 text-white shadow-xl ring-1 ring-cyan-200/20 lg:grid-cols-[1fr_0.8fr] lg:p-10">
          <div>
            {section.eyebrow && <p className="text-sm font-black uppercase tracking-[0.2em] text-cyan-100">{section.eyebrow}</p>}
            <h2 className="mt-3 text-3xl font-black leading-tight sm:text-4xl">{cta.headline || section.sectionTitle}</h2>
            {(cta.description || section.intro) && <p className="mt-5 text-lg leading-8 text-cyan-50">{cta.description || section.intro}</p>}
            <div className="mt-8">
              <CtaButton action={ctaAction} onOpenCta={onOpenCta} />
            </div>
          </div>
          <MediaBlock media={cta.media || section.media} />
        </div>
      </SectionShell>
    )
  }

  if (format === 'content' || format === 'rich-text') {
    const imageOnLeft = index % 2 === 1
    return (
      <SectionShell className={index % 2 === 0 ? 'bg-white' : 'bg-[#f7fbff]'}>
        <div className={`grid items-center gap-10 ${section.media ? 'lg:grid-cols-2' : ''}`}>
          {section.media && (
            <div className={imageOnLeft ? 'lg:order-1' : 'lg:order-2'}>
              <MediaBlock media={section.media} />
            </div>
          )}
          <div className={imageOnLeft ? 'lg:order-2' : 'lg:order-1'}>
            {section.eyebrow && <p className="text-sm font-black uppercase tracking-[0.2em] text-primary-600">{section.eyebrow}</p>}
            <h2 className="mt-3 text-3xl font-black leading-tight text-[#000047] sm:text-4xl">{section.sectionTitle}</h2>
            {section.intro && <p className="mt-5 text-lg leading-8 text-gray-600">{section.intro}</p>}
            <div className="mt-6"><RichText blocks={section.body || []} /></div>
            {items.length > 0 && (
              <div className="mt-7">
                <InlineItemList items={items} />
              </div>
            )}
          </div>
        </div>
      </SectionShell>
    )
  }

  if (format === 'list') {
    return (
      <SectionShell className={index % 2 === 0 ? 'bg-[#f7fbff]' : 'bg-white'}>
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
    const isDark = format === 'cards'
    return (
      <SectionShell dark={isDark} className={isDark ? '' : 'bg-[#f7fbff]'}>
          <SectionHeader section={section} light={isDark} />
          <div className={`grid gap-6 ${format === 'media-gallery' ? 'md:grid-cols-2' : 'md:grid-cols-2 lg:grid-cols-3'}`}>
            {items.map((item, itemIndex) => (
              <article key={item._key || `${item.title}-${itemIndex}`} className={`${isDark ? 'border-white/15 bg-white/10 text-white' : 'border-gray-100 bg-white text-gray-950'} rounded-lg border p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg`}>
                <MediaBlock media={item.media} className="mb-5" />
                <div className="mb-4 flex items-center justify-between gap-4">
                  {format === 'stats' && item.metric ? <p className="text-4xl font-black text-primary-600">{item.metric}</p> : <ItemMark label={item.iconLabel} index={itemIndex} light={isDark} />}
                </div>
                {item.title && <h3 className="text-xl font-black leading-tight">{item.title}</h3>}
                {item.description && <p className={`mt-3 text-base leading-7 ${isDark ? 'text-cyan-50/85' : 'text-gray-600'}`}>{item.description}</p>}
              </article>
            ))}
          </div>
      </SectionShell>
    )
  }

  if (format === 'differentiators') {
    return (
      <SectionShell className="bg-[#f7fbff]">
          <SectionHeader section={section} />
          <div className="grid gap-6 lg:grid-cols-2">
            {items.map((item, itemIndex) => (
              <article key={item._key || `${item.title}-${itemIndex}`} className="rounded-lg bg-white p-6 shadow-sm ring-1 ring-cyan-100">
                <div className="flex items-start gap-4">
                  <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${itemIndex === 0 ? 'bg-primary-50 text-primary-700' : 'bg-red-50 text-red-600'}`}>
                    {itemIndex === 0 ? <CheckCircle2 className="h-6 w-6" /> : <X className="h-6 w-6" />}
                  </span>
                  <div>
                    {item.title && <h3 className="text-xl font-black text-gray-950">{item.title}</h3>}
                    {item.description && <p className="mt-3 whitespace-pre-line text-base leading-7 text-gray-600">{item.description}</p>}
                    <MediaBlock media={item.media} className="mt-5" />
                  </div>
                </div>
              </article>
            ))}
          </div>
      </SectionShell>
    )
  }

  if (format === 'accordion' || format === 'faqs') {
    const rows = format === 'faqs' ? faqs.map((faq) => ({title: faq.question, description: faq.answer, media: faq.media})) : items
    return (
      <SectionShell>
        <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <SectionHeader section={section} />
            <MediaBlock media={section.media} />
          </div>
          <div className="space-y-4">
            {rows.map((row, rowIndex) => (
              <details key={`${row.title}-${rowIndex}`} className="group rounded-lg bg-[#f7fbff] p-5 shadow-sm ring-1 ring-cyan-100">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-lg font-black text-gray-950">
                  <span>{row.title}</span>
                  <ChevronDown className="h-5 w-5 shrink-0 text-primary-600 transition group-open:rotate-180" />
                </summary>
                {row.description && <p className="mt-4 border-t border-gray-100 pt-4 text-base leading-7 text-gray-600">{row.description}</p>}
                <MediaBlock media={row.media} className="mt-5" />
              </details>
            ))}
          </div>
        </div>
      </SectionShell>
    )
  }

  if (format === 'curriculum' || format === 'timeline') {
    const rows = format === 'curriculum' ? modules : timeline
    return (
      <SectionShell dark>
          <SectionHeader section={section} light />
          <div className="space-y-5">
            {rows.map((row, rowIndex) => (
              <article key={row._key || `${row.title}-${rowIndex}`} className="rounded-lg border border-white/15 bg-white/10 p-6 shadow-lg">
                <p className="text-sm font-black uppercase tracking-[0.18em] text-cyan-200">{row.timeLabel || `Step ${rowIndex + 1}`}</p>
                <h3 className="mt-2 text-2xl font-black">{row.title}</h3>
                {row.description && <p className="mt-3 text-base leading-7 text-cyan-50/85">{row.description}</p>}
                {row.lessons?.length > 0 && (
                  <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                    {row.lessons.map((lesson) => <li key={lesson} className="flex gap-3"><Sparkles className="mt-1 h-4 w-4 shrink-0 text-cyan-200" />{lesson}</li>)}
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
      <SectionShell className="bg-[#f7fbff]">
          <SectionHeader section={section} />
          <div className="grid gap-6 md:grid-cols-2">
            {testimonials.map((testimonial, testimonialIndex) => (
              <figure key={testimonial._key || `${testimonial.name}-${testimonialIndex}`} className="rounded-lg bg-white p-6 shadow-sm ring-1 ring-cyan-100">
                <MediaBlock media={testimonial.media} className="mb-5" />
                <Quote className="mb-5 h-9 w-9 text-primary-600" />
                <blockquote className="text-lg leading-8 text-gray-800">{testimonial.quote}</blockquote>
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

export default function AdPage() {
  const {slug} = useParams()
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
  } : null, [page])

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
    <div className="min-h-screen bg-white">
      <SEO
        title={pageTitle}
        description={page.seoDescription || page.shortDescription}
        path={`/ads/${page.slug || page._id}`}
        image={page.heroMedia?.imageUrl}
      />
      <section className="relative overflow-hidden bg-[#000047] px-4 py-16 text-white sm:px-6 lg:px-8 lg:py-20">
        <div className="absolute inset-x-0 bottom-0 h-1 bg-cyan" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-[1fr_0.9fr]">
          <div>
            {page.eyebrow && <p className="text-sm font-black uppercase tracking-[0.22em] text-cyan-200">{page.eyebrow}</p>}
            <h1 className="mt-4 max-w-4xl text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">{page.headline}</h1>
            {page.shortDescription && <p className="mt-5 max-w-2xl text-lg leading-8 text-cyan-50">{page.shortDescription}</p>}
            <div className="mt-8 flex flex-wrap gap-4">
              <CtaButton action={primaryAction} onOpenCta={setActiveCta} />
              {page.secondaryButtonLabel && page.secondaryButtonUrl && (
                <a href={page.secondaryButtonUrl} className="inline-flex items-center rounded-full border border-white/30 px-7 py-4 font-extrabold text-white transition hover:bg-white/10">
                  {page.secondaryButtonLabel}
                </a>
              )}
            </div>
          </div>
          <HeroMediaBlock media={page.heroMedia} />
        </div>
      </section>

      <main>
        {(page.sections || []).map((section, index) => (
          <AdSection key={section._key || `${section.sectionTitle}-${index}`} section={section} index={index} onOpenCta={setActiveCta} />
        ))}
      </main>
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

      setStatus({type: 'success', message: 'Thank you. Your details have been submitted successfully.'})
      setFormData({name: '', contactNo: '', email: '', message: ''})
    } catch (submitError) {
      console.error('Ad CTA submission failed:', submitError)
      setStatus({type: 'error', message: submitError.message || 'Unable to submit right now.'})
    } finally {
      if (!isPayment) setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#000047]/80 px-4 py-6 backdrop-blur-sm">
      <div className="relative max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-lg bg-white shadow-2xl">
        <button
          type="button"
          onClick={closeModal}
          disabled={submitting}
          className="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-white transition hover:bg-white/25 disabled:opacity-50"
          aria-label="Close form"
        >
          <X className="h-5 w-5" />
        </button>
        <div className="bg-[#000047] px-6 py-8 text-white sm:px-8">
          <h2 className="pr-12 text-2xl font-extrabold sm:text-3xl">{cta.title || (isPayment ? 'Complete Registration' : 'Submit Your Details')}</h2>
          {cta.description && <p className="mt-2 text-white/80">{cta.description}</p>}
          {isPayment && <p className="mt-3 font-bold text-cyan">Amount: Rs {Number(cta.amount) > 0 ? Number(cta.amount) : 99}</p>}
        </div>
        <form onSubmit={handleFormSubmit} className="space-y-5 p-6 sm:p-8">
          <AdInput id="ad-cta-name" name="name" label="Name" value={formData.name} onChange={updateField} autoComplete="name" placeholder="Your full name" />
          <AdInput id="ad-cta-contact" name="contactNo" label="Contact Number" type="tel" value={formData.contactNo} onChange={updateField} autoComplete="tel" placeholder="+91 98765 43210" />
          <AdInput id="ad-cta-email" name="email" label="Email ID" type="email" value={formData.email} onChange={updateField} autoComplete="email" placeholder="you@example.com" />
          {!isPayment && cta.showMessageField !== false && (
            <div>
              <label htmlFor="ad-cta-message" className="mb-2 block text-sm font-bold text-gray-800">Message</label>
              <textarea
                id="ad-cta-message"
                name="message"
                value={formData.message}
                onChange={updateField}
                rows={4}
                placeholder="Tell us what you are looking for"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
              />
            </div>
          )}
          {status.message && (
            <div className={`rounded-lg p-4 text-sm font-semibold ${status.type === 'success' ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100' : 'bg-red-50 text-red-700 ring-1 ring-red-100'}`}>
              {status.message}
            </div>
          )}
          <button
            type="submit"
            disabled={submitting || status.type === 'success'}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#000047] px-6 py-4 font-extrabold text-white transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : isPayment ? <CreditCard className="h-5 w-5" /> : <ArrowRight className="h-5 w-5" />}
            {submitting ? (isPayment ? 'Opening Payment...' : 'Submitting...') : isPayment ? `Pay Rs ${Number(cta.amount) > 0 ? Number(cta.amount) : 99}` : (cta.submitLabel || 'Submit')}
          </button>
        </form>
      </div>
    </div>
  )
}

function AdInput({id, name, label, type = 'text', value, onChange, autoComplete, placeholder}) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-bold text-gray-800">{label} *</label>
      <input
        id={id}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        required
        autoComplete={autoComplete}
        placeholder={placeholder}
        className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
      />
    </div>
  )
}
