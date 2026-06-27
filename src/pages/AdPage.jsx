import {useEffect, useMemo, useState} from 'react'
import {ArrowRight, CheckCircle2, HelpCircle, Quote, Sparkles, X} from 'lucide-react'
import {useParams} from 'react-router-dom'
import MagnaLoader from '../components/MagnaLoader'
import SEO from '../components/SEO'
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
  primaryButtonUrl,
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
      buttonUrl,
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
    <div className="space-y-4 text-base leading-8 text-gray-700">
      {blocks.map((block) => {
        const text = blockText(block)
        if (!text) return null

        if (block.style === 'h2') return <h2 key={block._key} className="text-2xl font-black text-gray-950">{text}</h2>
        if (block.style === 'h3') return <h3 key={block._key} className="text-xl font-black text-gray-950">{text}</h3>
        if (block.listItem) {
          return (
            <div key={block._key} className="flex gap-3">
              <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-primary-600" />
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

function MediaBlock({media, className = ''}) {
  if (!media) return null

  if (media.mediaType === 'video-url' && media.videoUrl) {
    return (
      <div className={`overflow-hidden rounded-3xl bg-gray-950 shadow-2xl ${className}`}>
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
      <video className={`aspect-video w-full rounded-3xl bg-gray-950 object-cover shadow-2xl ${className}`} controls playsInline>
        <source src={media.videoFileUrl} />
      </video>
    )
  }

  if (media.imageUrl) {
    return (
      <figure className={className}>
        <img
          src={media.imageUrl}
          alt={media.imageAlt || media.caption || ''}
          className="aspect-[4/3] w-full rounded-3xl object-cover shadow-2xl"
        />
        {media.caption && <figcaption className="mt-3 text-sm font-semibold text-gray-500">{media.caption}</figcaption>}
      </figure>
    )
  }

  return null
}

function SectionHeader({section, light = false}) {
  return (
    <div className="mb-10 text-center">
      {section.eyebrow && (
        <p className={`text-sm font-black uppercase tracking-[0.22em] ${light ? 'text-cyan-200' : 'text-primary-600'}`}>{section.eyebrow}</p>
      )}
      <h2 className={`mt-3 text-3xl font-black leading-tight sm:text-4xl ${light ? 'text-white' : 'text-[#000047]'}`}>{section.sectionTitle}</h2>
      {section.intro && <p className={`mx-auto mt-5 max-w-3xl text-base leading-7 ${light ? 'text-cyan-50/85' : 'text-gray-600'}`}>{section.intro}</p>}
    </div>
  )
}

function AdSection({section, index}) {
  const format = section.sectionFormat || 'content'
  const items = section.items || []
  const modules = section.modules || []
  const timeline = section.timeline || []
  const faqs = section.faqs || []
  const testimonials = section.testimonials || []

  if (format === 'cta') {
    const cta = section.cta || {}
    return (
      <section className="bg-white px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-6xl items-center gap-8 overflow-hidden rounded-3xl bg-gradient-to-br from-[#000047] via-primary-700 to-cyan-600 p-8 text-white shadow-2xl lg:grid-cols-[1fr_0.8fr] lg:p-12">
          <div>
            {section.eyebrow && <p className="text-sm font-black uppercase tracking-[0.22em] text-cyan-100">{section.eyebrow}</p>}
            <h2 className="mt-3 text-3xl font-black leading-tight sm:text-4xl">{cta.headline || section.sectionTitle}</h2>
            {(cta.description || section.intro) && <p className="mt-5 text-base leading-7 text-cyan-50">{cta.description || section.intro}</p>}
            {cta.buttonLabel && cta.buttonUrl && (
              <a href={cta.buttonUrl} className="mt-8 inline-flex items-center rounded-full bg-white px-7 py-4 font-black text-primary-700 shadow-xl transition hover:-translate-y-0.5">
                {cta.buttonLabel}
                <ArrowRight className="ml-2 h-5 w-5" />
              </a>
            )}
          </div>
          <MediaBlock media={cta.media || section.media} />
        </div>
      </section>
    )
  }

  if (format === 'content' || format === 'rich-text') {
    const imageOnLeft = index % 2 === 1
    return (
      <section className={index % 2 === 0 ? 'bg-white' : 'bg-[#f7fbff]'}>
        <div className={`mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 lg:px-8 lg:py-24 ${section.media ? 'lg:grid-cols-2' : ''}`}>
          {section.media && (
            <div className={imageOnLeft ? 'lg:order-1' : 'lg:order-2'}>
              <MediaBlock media={section.media} />
            </div>
          )}
          <div className={imageOnLeft ? 'lg:order-2' : 'lg:order-1'}>
            {section.eyebrow && <p className="text-sm font-black uppercase tracking-[0.22em] text-primary-600">{section.eyebrow}</p>}
            <h2 className="mt-3 text-3xl font-black leading-tight text-[#000047] sm:text-4xl">{section.sectionTitle}</h2>
            {section.intro && <p className="mt-5 text-base leading-7 text-gray-600">{section.intro}</p>}
            <div className="mt-6"><RichText blocks={section.body || []} /></div>
          </div>
        </div>
      </section>
    )
  }

  if (['cards', 'outcomes', 'stats', 'media-gallery'].includes(format)) {
    const isDark = format === 'cards'
    return (
      <section className={`${isDark ? 'bg-[#050545] text-white' : 'bg-[#fbfaf9]'} px-4 py-16 sm:px-6 lg:px-8`}>
        <div className="mx-auto max-w-7xl">
          <SectionHeader section={section} light={isDark} />
          <div className={`grid gap-6 ${format === 'media-gallery' ? 'md:grid-cols-2' : 'md:grid-cols-2 lg:grid-cols-3'}`}>
            {items.map((item, itemIndex) => (
              <article key={item._key || `${item.title}-${itemIndex}`} className={`${isDark ? 'border-white/15 bg-white/10 text-white' : 'border-gray-100 bg-white text-gray-950'} rounded-3xl border p-6 shadow-xl`}>
                <MediaBlock media={item.media} className="mb-5" />
                {format === 'stats' && item.metric && <p className="text-4xl font-black text-primary-600">{item.metric}</p>}
                {item.title && <h3 className="text-xl font-black">{item.title}</h3>}
                {item.description && <p className={`mt-3 leading-7 ${isDark ? 'text-cyan-50/85' : 'text-gray-600'}`}>{item.description}</p>}
              </article>
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (format === 'differentiators') {
    return (
      <section className="bg-[#f7fbff] px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionHeader section={section} />
          <div className="grid gap-6 lg:grid-cols-2">
            {items.map((item, itemIndex) => (
              <article key={item._key || `${item.title}-${itemIndex}`} className="rounded-3xl bg-white p-7 shadow-xl ring-1 ring-cyan-100">
                <div className="flex items-start gap-4">
                  <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${itemIndex === 0 ? 'bg-primary-50 text-primary-700' : 'bg-red-50 text-red-600'}`}>
                    {itemIndex === 0 ? <CheckCircle2 className="h-6 w-6" /> : <X className="h-6 w-6" />}
                  </span>
                  <div>
                    {item.title && <h3 className="text-xl font-black text-gray-950">{item.title}</h3>}
                    {item.description && <p className="mt-3 whitespace-pre-line leading-7 text-gray-600">{item.description}</p>}
                    <MediaBlock media={item.media} className="mt-5" />
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (format === 'accordion' || format === 'faqs') {
    const rows = format === 'faqs' ? faqs.map((faq) => ({title: faq.question, description: faq.answer, media: faq.media})) : items
    return (
      <section className="bg-white px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <SectionHeader section={section} />
            <MediaBlock media={section.media} />
          </div>
          <div className="space-y-4">
            {rows.map((row, rowIndex) => (
              <details key={`${row.title}-${rowIndex}`} className="group rounded-3xl bg-[#f7fbff] p-6 shadow-lg ring-1 ring-cyan-100">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-lg font-black text-gray-950">
                  <span>{row.title}</span>
                  <HelpCircle className="h-5 w-5 shrink-0 text-primary-600" />
                </summary>
                {row.description && <p className="mt-4 border-t border-gray-100 pt-4 leading-7 text-gray-600">{row.description}</p>}
                <MediaBlock media={row.media} className="mt-5" />
              </details>
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (format === 'curriculum' || format === 'timeline') {
    const rows = format === 'curriculum' ? modules : timeline
    return (
      <section className="bg-[#050545] px-4 py-16 text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <SectionHeader section={section} light />
          <div className="space-y-5">
            {rows.map((row, rowIndex) => (
              <article key={row._key || `${row.title}-${rowIndex}`} className="rounded-3xl border border-white/15 bg-white/10 p-6 shadow-xl backdrop-blur">
                <p className="text-sm font-black uppercase tracking-[0.18em] text-cyan-200">{row.timeLabel || `Step ${rowIndex + 1}`}</p>
                <h3 className="mt-2 text-2xl font-black">{row.title}</h3>
                {row.description && <p className="mt-3 leading-7 text-cyan-50/85">{row.description}</p>}
                {row.lessons?.length > 0 && (
                  <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                    {row.lessons.map((lesson) => <li key={lesson} className="flex gap-3"><Sparkles className="mt-1 h-4 w-4 shrink-0 text-cyan-200" />{lesson}</li>)}
                  </ul>
                )}
                <MediaBlock media={row.media} className="mt-6" />
              </article>
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (format === 'testimonials') {
    return (
      <section className="bg-[#f7fbff] px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionHeader section={section} />
          <div className="grid gap-6 md:grid-cols-2">
            {testimonials.map((testimonial, testimonialIndex) => (
              <figure key={testimonial._key || `${testimonial.name}-${testimonialIndex}`} className="rounded-3xl bg-white p-7 shadow-xl ring-1 ring-cyan-100">
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
        </div>
      </section>
    )
  }

  return null
}

export default function AdPage() {
  const {slug} = useParams()
  const [page, setPage] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

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

  if (loading) return <div className="min-h-screen bg-[#f7f9ff] px-4 py-20"><MagnaLoader message="Loading page..." /></div>

  if (error || !page) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7f9ff] px-4">
        <SEO title="Ad Page Not Found" path={slug ? `/ads/${slug}` : '/ads'} />
        <div className="max-w-xl rounded-3xl bg-white p-8 text-center shadow-xl">
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
      <section className="relative overflow-hidden bg-[#000047] px-4 py-20 text-white sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_25%,rgba(0,255,255,0.2),transparent_32%)]" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-[1fr_0.9fr]">
          <div>
            {page.eyebrow && <p className="text-sm font-black uppercase tracking-[0.22em] text-cyan-200">{page.eyebrow}</p>}
            <h1 className="mt-4 text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">{page.headline}</h1>
            {page.shortDescription && <p className="mt-5 max-w-2xl text-lg leading-8 text-cyan-50">{page.shortDescription}</p>}
            <div className="mt-8 flex flex-wrap gap-4">
              {page.primaryButtonLabel && page.primaryButtonUrl && (
                <a href={page.primaryButtonUrl} className="inline-flex items-center rounded-full bg-white px-7 py-4 font-black text-primary-700 shadow-xl transition hover:-translate-y-0.5">
                  {page.primaryButtonLabel}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </a>
              )}
              {page.secondaryButtonLabel && page.secondaryButtonUrl && (
                <a href={page.secondaryButtonUrl} className="inline-flex items-center rounded-full border border-white/30 px-7 py-4 font-black text-white transition hover:bg-white/10">
                  {page.secondaryButtonLabel}
                </a>
              )}
            </div>
          </div>
          <MediaBlock media={page.heroMedia} />
        </div>
      </section>

      <main>
        {(page.sections || []).map((section, index) => (
          <AdSection key={section._key || `${section.sectionTitle}-${index}`} section={section} index={index} />
        ))}
      </main>
    </div>
  )
}
