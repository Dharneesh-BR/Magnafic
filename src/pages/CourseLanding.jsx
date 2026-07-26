import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { PortableText } from '@portabletext/react'
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  GraduationCap,
  PlayCircle,
  Quote,
  Sparkles,
} from 'lucide-react'
import MagnaLoader from '../components/MagnaLoader'
import SEO from '../components/SEO'
import { lmsApi } from '../lib/lmsApi'

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
      const parts = parsed.pathname.split('/').filter(Boolean)
      const videoId = parts.find((part) => /^\d+$/.test(part))
      return videoId ? `https://player.vimeo.com/video/${videoId}` : url
    }
  } catch {
    return url
  }
  return url
}

function SectionMedia({ media, title, className = '' }) {
  if (!media) return null
  const mediaClass = `w-full overflow-hidden rounded-2xl bg-gray-100 shadow-xl shadow-primary-900/10 ${className}`

  if (media.imageUrl) {
    return (
      <figure className={mediaClass}>
        <img
          src={media.imageUrl}
          alt={media.imageAlt || media.caption || title || ''}
          loading="lazy"
          className="aspect-[4/3] h-full w-full object-cover"
        />
        {media.caption && <figcaption className="bg-white px-4 py-3 text-sm text-gray-500">{media.caption}</figcaption>}
      </figure>
    )
  }

  if (media.videoFileUrl) {
    return (
      <figure className={mediaClass}>
        <video src={media.videoFileUrl} controls playsInline preload="metadata" className="aspect-video w-full bg-black" />
        {media.caption && <figcaption className="bg-white px-4 py-3 text-sm text-gray-500">{media.caption}</figcaption>}
      </figure>
    )
  }

  if (media.videoUrl) {
    return (
      <figure className={mediaClass}>
        <iframe
          src={getEmbedUrl(media.videoUrl)}
          title={media.caption || title || 'Course media'}
          loading="lazy"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          className="aspect-video w-full border-0"
        />
        {media.caption && <figcaption className="bg-white px-4 py-3 text-sm text-gray-500">{media.caption}</figcaption>}
      </figure>
    )
  }

  return null
}

function RichText({ value, light = false }) {
  if (!value?.length) return null
  return (
    <div className={`prose max-w-none break-words prose-headings:font-bold ${light ? 'prose-invert text-white/85' : 'prose-headings:text-[#071a78] text-gray-700'}`}>
      <PortableText value={value} />
    </div>
  )
}

function SectionHeader({ section, dark = false, centered = false }) {
  return (
    <div className={centered ? 'mx-auto max-w-3xl text-center' : 'max-w-3xl'}>
      <h2 className={`text-2xl font-bold leading-tight sm:text-3xl ${dark ? 'text-white' : 'text-[#071a78]'}`}>
        {section.sectionTitle}
      </h2>
      {section.intro && (
        <p className={`mt-4 whitespace-pre-line text-base leading-6 sm:text-lg sm:leading-7 ${dark ? 'text-white/85' : 'text-gray-700'}`}>
          {section.intro}
        </p>
      )}
    </div>
  )
}

function CourseSection({ section, index, theme, syllabusUrl }) {
  const format = section.sectionFormat || 'content'
  const dark = theme === 'dark' || (theme === 'alternating' && index % 2 === 1)
  const bandClass = dark ? 'bg-[#000047] text-white' : 'bg-[#fbfaf9] text-gray-950'
  const items = section.items || []

  if (format === 'content' || format === 'rich-text') {
    const hasMedia = Boolean(section.media?.imageUrl || section.media?.videoUrl || section.media?.videoFileUrl)
    return (
      <section className={`${bandClass} px-4 py-12 sm:px-6 lg:px-8`}>
        <div className={`mx-auto grid max-w-6xl items-center gap-10 ${hasMedia ? 'lg:grid-cols-2' : ''}`}>
          <div className={hasMedia && index % 2 === 1 ? 'lg:order-2' : ''}>
            <SectionHeader section={section} dark={dark} />
            {section.body?.length > 0 && <div className="mt-7"><RichText value={section.body} light={dark} /></div>}
            {items.length > 0 && (
              <div className="mt-7 space-y-4">
                {items.map((item, itemIndex) => (
                  <div key={item._key || itemIndex} className="flex items-start gap-3">
                    <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-cyan-400" />
                    <div>
                      {item.title && <h3 className="font-bold">{item.title}</h3>}
                      {item.description && <p className={`mt-1 leading-7 ${dark ? 'text-white/80' : 'text-gray-700'}`}>{item.description}</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          {hasMedia && <SectionMedia media={section.media} title={section.sectionTitle} className={index % 2 === 1 ? 'lg:order-1' : ''} />}
        </div>
      </section>
    )
  }

  if (format === 'list') {
    return (
      <section className={`${bandClass} px-4 py-12 sm:px-6 lg:px-8`}>
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
          <div>
            <SectionHeader section={section} dark={dark} />
            {section.media && <SectionMedia media={section.media} title={section.sectionTitle} className="mt-7" />}
          </div>
          <div className="space-y-4">
            {items.map((item, itemIndex) => (
              <div key={item._key || itemIndex} className={`flex flex-col items-center gap-4 rounded-xl border p-5 text-center shadow-lg md:flex-row md:items-start md:text-left ${dark ? 'border-white/15 bg-white/10' : 'border-[#3533cd]/20 bg-white'}`}>
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-gradient-to-r from-[#342fd8] to-[#12e6e8] font-bold text-white">
                  {item.iconLabel || itemIndex + 1}
                </span>
                <div>
                  {item.title && <h3 className="font-bold">{item.title}</h3>}
                  {item.description && <p className={`mt-1 leading-7 ${dark ? 'text-white/80' : 'text-gray-700'}`}>{item.description}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (['cards', 'outcomes', 'stats', 'media-gallery', 'differentiators'].includes(format)) {
    const gallery = format === 'media-gallery'
    return (
      <section className={`${bandClass} px-4 py-12 sm:px-6 lg:px-8`}>
        <div className="mx-auto max-w-6xl">
          <SectionHeader section={section} dark={dark} centered />
          <div className={`mt-10 grid gap-6 ${gallery ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'md:grid-cols-2 lg:grid-cols-3'}`}>
            {items.map((item, itemIndex) => (
              <article key={item._key || itemIndex} className={`min-w-0 overflow-hidden rounded-xl border p-5 shadow-lg ${dark ? 'border-white/15 bg-white/10' : 'border-[#3533cd]/20 bg-white'}`}>
                {item.media && <SectionMedia media={item.media} title={item.title || section.sectionTitle} className="mb-5 shadow-none" />}
                {format === 'stats' && item.metric ? (
                  <p className={`text-4xl font-bold ${dark ? 'text-cyan-300' : 'text-[#3533cd]'}`}>{item.metric}</p>
                ) : (
                  <span className="mx-auto grid h-10 w-10 place-items-center rounded-full bg-gradient-to-r from-[#342fd8] to-[#12e6e8] font-bold text-white md:mx-0">
                    {item.iconLabel || itemIndex + 1}
                  </span>
                )}
                {item.title && <h3 className="mt-4 text-xl font-bold">{item.title}</h3>}
                {item.description && <p className={`mt-3 whitespace-pre-line leading-7 ${dark ? 'text-white/80' : 'text-gray-700'}`}>{item.description}</p>}
              </article>
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (format === 'accordion' || format === 'faqs') {
    const entries = format === 'faqs'
      ? (section.faqs || []).map((item) => ({ ...item, title: item.question, description: item.answer }))
      : items
    return (
      <section className={`${bandClass} px-4 py-12 sm:px-6 lg:px-8`}>
        <div className="mx-auto max-w-4xl">
          <SectionHeader section={section} dark={dark} centered />
          <div className="mt-9 space-y-3">
            {entries.map((item, itemIndex) => (
              <details key={item._key || itemIndex} className={`group rounded-xl border shadow-sm ${dark ? 'border-white/15 bg-white/10' : 'border-[#3533cd]/20 bg-white'}`}>
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 font-bold">
                  {item.title}
                  <ChevronDown className="h-5 w-5 shrink-0 transition group-open:rotate-180" />
                </summary>
                {item.description && <p className={`px-5 pb-5 leading-7 ${dark ? 'text-white/80' : 'text-gray-700'}`}>{item.description}</p>}
              </details>
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (format === 'curriculum') {
    return (
      <section className={`${bandClass} px-4 py-12 sm:px-6 lg:px-8`}>
        <div className="mx-auto max-w-5xl">
          <SectionHeader section={section} dark={dark} centered />
          <div className="mt-10 space-y-4">
            {(section.modules || []).map((module, moduleIndex) => (
              <details
                key={module._key || moduleIndex}
                className="group overflow-hidden rounded-xl border border-white/20 bg-gradient-to-br from-[#5b43e6] via-[#347ded] to-[#08dce6] text-white shadow-lg shadow-blue-900/15"
              >
                <summary className="relative flex cursor-pointer list-none items-center justify-center border-b border-transparent px-5 py-5 text-center text-white transition group-open:border-white/20 md:justify-between md:px-6 md:text-left">
                  <div className="min-w-0">
                    <p className="text-xs font-bold uppercase text-white/80">Module {moduleIndex + 1}</p>
                    <h3 className="mt-1 break-words text-xl font-bold text-white">{module.title}</h3>
                  </div>
                  <ChevronDown className="absolute right-5 h-5 w-5 shrink-0 transition duration-300 group-open:rotate-180 md:static" />
                </summary>

                <div className="px-5 py-6 text-white/90 md:px-6">
                  {module.description && <p className="leading-7">{module.description}</p>}
                  {module.lessons?.length > 0 && (
                    <ul className="mt-5 space-y-3">
                      {module.lessons.map((lesson) => (
                        <li key={lesson} className="flex flex-col items-center gap-2 md:flex-row md:items-start">
                          <CheckCircle2 className="h-4 w-4 shrink-0 text-white md:mt-1" />
                          <span>{lesson}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  {module.media && <div className="mt-6 w-full"><SectionMedia media={module.media} title={module.title} className="shadow-none" /></div>}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (format === 'timeline') {
    return (
      <section className={`${bandClass} px-4 py-12 sm:px-6 lg:px-8`}>
        <div className="mx-auto max-w-4xl">
          <SectionHeader section={section} dark={dark} />
          <div className="mt-10 border-l-2 border-cyan-400 pl-6 sm:pl-8">
            {(section.timeline || []).map((item, itemIndex) => (
              <article key={item._key || itemIndex} className="relative pb-9 last:pb-0">
                <span className="absolute -left-[2.15rem] top-1 h-4 w-4 rounded-full border-4 border-cyan-400 bg-white sm:-left-[2.65rem]" />
                {item.timeLabel && <p className={`text-sm font-bold uppercase ${dark ? 'text-cyan-300' : 'text-[#3533cd]'}`}>{item.timeLabel}</p>}
                <h3 className="mt-1 text-xl font-bold">{item.title}</h3>
                {item.description && <p className={`mt-2 leading-7 ${dark ? 'text-white/80' : 'text-gray-700'}`}>{item.description}</p>}
              </article>
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (format === 'testimonials') {
    return (
      <section className={`${bandClass} px-4 py-12 sm:px-6 lg:px-8`}>
        <div className="mx-auto max-w-6xl">
          <SectionHeader section={section} dark={dark} centered />
          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {(section.testimonials || []).map((item, itemIndex) => (
              <figure key={item._key || itemIndex} className={`rounded-xl border p-6 shadow-lg ${dark ? 'border-white/15 bg-white/10' : 'border-[#3533cd]/20 bg-white'}`}>
                <Quote className="h-8 w-8 text-cyan-400" />
                <blockquote className="mt-4 text-lg font-semibold leading-8">{item.quote}</blockquote>
                <figcaption className={`mt-5 text-sm ${dark ? 'text-white/75' : 'text-gray-700'}`}>
                  <span className="block font-bold">{item.name}</span>
                  {item.designation}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (format === 'cta') {
    const cta = section.cta || {}
    const isLink = cta.buttonAction === 'link' && cta.buttonUrl
    const buttonClass = 'mt-7 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#3533cd] to-[#00d9e8] px-7 py-3.5 font-bold text-white shadow-lg shadow-cyan-500/20 transition hover:-translate-y-0.5'
    return (
      <section className="bg-[#fbfaf9] px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl rounded-xl border border-[#3533cd]/20 bg-white px-6 py-10 text-center shadow-xl sm:px-10">
          <Sparkles className="mx-auto h-9 w-9 text-[#3533cd]" />
          <h2 className="mt-5 text-2xl font-bold leading-tight text-[#071a78] sm:text-3xl">{cta.headline || section.sectionTitle}</h2>
          {(cta.description || section.intro) && <p className="mx-auto mt-4 max-w-2xl text-lg leading-8 text-gray-700">{cta.description || section.intro}</p>}
          {isLink ? (
            <a href={cta.buttonUrl} className={buttonClass}>{cta.buttonLabel || 'Learn more'}<ArrowRight className="h-5 w-5" /></a>
          ) : (
            <Link to={syllabusUrl} className={buttonClass}>{cta.buttonLabel || 'Start course'}<ArrowRight className="h-5 w-5" /></Link>
          )}
        </div>
      </section>
    )
  }

  return null
}

export default function CourseLanding() {
  const { courseId } = useParams()
  const [course, setCourse] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let mounted = true
    setLoading(true)
    lmsApi(`/api/course/${courseId}`)
      .then((result) => {
        if (mounted) setCourse(result.course)
      })
      .catch((loadError) => {
        if (mounted) setError(loadError.message)
      })
      .finally(() => {
        if (mounted) setLoading(false)
      })
    return () => { mounted = false }
  }, [courseId])

  const lessonCount = useMemo(
    () => course?.modules?.reduce((total, module) => total + (module.lessons?.length || 0), 0) || 0,
    [course],
  )

  if (loading) return <div className="min-h-screen bg-[#f7f9ff] px-4 pb-16 pt-28"><MagnaLoader message="Loading course details..." className="mx-auto max-w-3xl" /></div>

  if (!course) {
    return (
      <main className="min-h-screen bg-[#f7f9ff] px-4 pb-16 pt-28">
        <section className="mx-auto max-w-2xl rounded-2xl bg-white p-8 text-center shadow-xl ring-1 ring-gray-100">
          <h1 className="text-3xl font-black">Course unavailable</h1>
          <p className="mt-3 text-gray-600">{error || 'This course could not be loaded.'}</p>
          <Link to="/courses" className="mt-6 inline-flex rounded-xl bg-primary-600 px-5 py-3 font-black text-white">Back to courses</Link>
        </section>
      </main>
    )
  }

  const page = course.landingPage || {}
  const syllabusUrl = `/programs/courses/${courseId}`
  const heroImage = course.mainImage?.bannerUrl || course.mainImage?.url
  const theme = page.theme || 'alternating'
  const hasCourseCta = page.sections?.some((section) => section.sectionFormat === 'cta')

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#fbfaf9] text-center md:text-left">
      <SEO
        title={page.seoTitle || `${course.title} | Magnafic Courses`}
        description={page.seoDescription || page.shortDescription || course.excerpt}
        path={`/courses/${courseId}`}
        image={heroImage}
      />

      <section className="bg-[#000047] px-4 pb-12 pt-24 text-white sm:px-6 sm:pb-16 sm:pt-28 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <Link to="/courses" className="inline-flex items-center gap-2 text-sm font-bold text-cyan-100 transition hover:text-white">
            <ArrowLeft className="h-4 w-4" />
            Back to courses
          </Link>
          <div className="mt-7 grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_22rem]">
            <div className="min-w-0">
              <p className="text-base font-black text-cyan sm:text-lg">Magnafic Academy</p>
              <h1 className="mt-4 break-words text-3xl font-black leading-tight sm:text-4xl lg:text-5xl">{page.headline || course.title}</h1>
              {(page.shortDescription || course.excerpt) && <p className="mt-5 max-w-2xl text-base leading-7 text-cyan-50 sm:text-lg sm:leading-8">{page.shortDescription || course.excerpt}</p>}
              <div className="mt-6 flex flex-wrap justify-center gap-4 text-sm font-bold text-cyan-100 md:justify-start">
                <span className="inline-flex items-center gap-2"><GraduationCap className="h-4 w-4" />{course.modules?.length || 0} modules</span>
                <span className="inline-flex items-center gap-2"><BookOpen className="h-4 w-4" />{lessonCount} lessons</span>
              </div>
              <Link
                to={syllabusUrl}
                className="group mt-7 inline-flex items-center gap-2 rounded-full bg-gradient-primary px-7 py-3.5 font-black text-white shadow-lg shadow-cyan-400/20 transition duration-300 hover:-translate-y-0.5 hover:shadow-cyan-300/35"
              >
                <PlayCircle className="h-5 w-5" />
                {page.startButtonLabel || 'Start course'}
              </Link>
            </div>
            <div className="mx-auto w-full max-w-sm lg:mx-0">
              {heroImage ? (
                <img src={heroImage} alt={course.mainImage?.alt || course.title} className="aspect-[3/4] h-[420px] w-full rounded-[1.75rem] object-cover shadow-2xl shadow-primary-950/30 ring-1 ring-white/20" />
              ) : (
                <div className="flex aspect-[3/4] h-[420px] w-full items-center justify-center rounded-[1.75rem] bg-white/10 p-8 ring-1 ring-white/20">
                  <img src="/Magnafic.png" alt="" className="w-3/4 object-contain brightness-0 invert" />
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {page.sections?.length > 0 ? (
        page.sections.map((section, index) => (
          <CourseSection
            key={section._key || `${section.sectionTitle}-${index}`}
            section={section}
            index={index}
            theme={theme}
            syllabusUrl={syllabusUrl}
          />
        ))
      ) : (
        <section className="bg-[#fbfaf9] px-4 py-12 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl">
            <h2 className="text-2xl font-bold text-[#071a78] sm:text-3xl">About this course</h2>
            {course.description?.length > 0 ? (
              <div className="mt-7"><RichText value={course.description} /></div>
            ) : (
              <p className="mt-4 text-lg leading-8 text-gray-700">{course.excerpt}</p>
            )}
          </div>
        </section>
      )}

      {!hasCourseCta && (
        <section className="bg-[#fbfaf9] px-4 py-12 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl rounded-xl border border-[#3533cd]/20 bg-white px-6 py-10 text-center shadow-xl sm:px-10">
            <BarChart3 className="mx-auto h-9 w-9 text-[#3533cd]" />
            <h2 className="mt-5 text-2xl font-bold text-[#071a78] sm:text-3xl">Ready to begin?</h2>
            <p className="mt-3 text-lg leading-8 text-gray-700">Open the syllabus, review the modules, and begin with the first unlocked lesson.</p>
            <Link to={syllabusUrl} className="mt-7 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#3533cd] to-[#00d9e8] px-7 py-3.5 font-bold text-white shadow-lg shadow-cyan-500/20 transition hover:-translate-y-0.5">
              {page.startButtonLabel || 'Start course'}
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </section>
      )}
    </div>
  )
}
