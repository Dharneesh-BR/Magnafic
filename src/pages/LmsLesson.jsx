import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { PortableText } from '@portabletext/react'
import { ArrowLeft, ArrowRight, CheckCircle2, ClipboardCheck, Clock, FileText, Lock, LogIn, Presentation } from 'lucide-react'
import SEO from '../components/SEO'
import MagnaLoader from '../components/MagnaLoader'
import LmsDocumentViewer from '../components/LmsDocumentViewer'
import LmsVideoPlayer from '../components/LmsVideoPlayer'
import LmsAssessment from '../components/LmsAssessment'
import { useLmsAuth } from '../lib/lmsAuth'
import { lmsApi } from '../lib/lmsApi'

function LessonMaterial({ material, onReachedEnd }) {
  const extension = String(material.extension || material.fileName?.split('.').pop() || '').toLowerCase()
  const isPresentation = ['ppt', 'pptx'].includes(extension) || material.mimeType?.includes('presentation')

  return (
    <article className="min-w-0 overflow-hidden rounded-xl border border-gray-200 bg-white">
      <div className="flex items-center gap-3 border-b border-gray-100 px-3 py-3 sm:px-4">
        <div className="flex min-w-0 items-center gap-3">
          {isPresentation ? <Presentation className="h-5 w-5 shrink-0 text-primary-600" /> : <FileText className="h-5 w-5 shrink-0 text-primary-600" />}
          <div className="min-w-0">
            <h3 className="truncate text-sm font-black text-gray-950">{material.title}</h3>
            <p className="mt-0.5 text-xs font-semibold text-gray-500">
              {material.resourceType === 'reference' ? 'Reference material' : 'Lesson content'}
            </p>
          </div>
        </div>
      </div>

      <LmsDocumentViewer material={material} onReachedEnd={onReachedEnd} />
    </article>
  )
}

function ContentEndTracker({ enabled, onReachedEnd }) {
  const markerRef = useRef(null)
  const completedRef = useRef(false)

  useEffect(() => {
    completedRef.current = false
  }, [enabled])

  useEffect(() => {
    if (!enabled || !markerRef.current) return undefined
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !completedRef.current) {
          completedRef.current = true
          onReachedEnd()
        }
      },
      { threshold: 1 },
    )
    observer.observe(markerRef.current)
    return () => observer.disconnect()
  }, [enabled, onReachedEnd])

  return <span ref={markerRef} className="block h-px w-full" aria-hidden="true" />
}

export default function LmsLesson() {
  const { courseId, lessonId } = useParams()
  const { user, loading: authLoading } = useLmsAuth()
  const [course, setCourse] = useState(null)
  const [lessonProgress, setLessonProgress] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [progressError, setProgressError] = useState('')
  const [completionSaving, setCompletionSaving] = useState(false)
  const completionRequestRef = useRef(false)

  useEffect(() => {
    completionRequestRef.current = false
  }, [lessonId])

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      setLoading(false)
      return
    }

    let mounted = true
    const load = async () => {
      setLoading(true)
      setError('')
      try {
        const [result, progressResult] = await Promise.all([
          lmsApi(`/api/course/${courseId}`),
          lmsApi(`/api/progress/${courseId}`),
        ])
        if (!mounted) return
        setCourse(result.course)
        setLessonProgress(progressResult.progress.find((item) => item.lessonId === lessonId) || null)
      } catch (loadError) {
        if (mounted) setError(loadError.message)
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [authLoading, courseId, lessonId, user])

  const lessons = useMemo(() => course?.modules?.flatMap((module) => module.lessons || []) || [], [course])
  const lessonIndex = lessons.findIndex((item) => item._id === lessonId)
  const lesson = lessonIndex >= 0 ? lessons[lessonIndex] : null
  const previousLesson = lessonIndex > 0 ? lessons[lessonIndex - 1] : null
  const nextLesson = lessonIndex >= 0 && lessonIndex < lessons.length - 1 ? lessons[lessonIndex + 1] : null
  const primaryMaterial = !lesson?.videoUrl
    ? lesson?.materials?.find((material) => material.resourceType !== 'reference') || null
    : null
  const completionMode = lesson?.videoUrl
    ? 'video'
    : primaryMaterial
      ? 'document'
      : lesson?.content?.length
        ? 'content'
        : 'none'

  const saveProgress = async (update) => {
    setProgressError('')
    try {
      const result = await lmsApi('/api/progress/update', {
        method: 'POST',
        body: JSON.stringify({ courseId, lessonId, ...update }),
      })

      setLessonProgress(result.progress)
      if (result.course) setCourse(result.course)
      return result
    } catch (progressSaveError) {
      setProgressError(progressSaveError.message)
      return null
    }
  }

  const completePrimaryContent = async (completionSource) => {
    if (
      completionRequestRef.current ||
      lessonProgress?.contentCompleted ||
      lessonProgress?.completed
    ) return null

    completionRequestRef.current = true
    setCompletionSaving(true)
    try {
      const result = await saveProgress({ completed: true, completionSource })
      if (!result) completionRequestRef.current = false
      return result
    } finally {
      setCompletionSaving(false)
    }
  }
  const handleAssessmentPassed = (result) => {
    if (result.course) setCourse(result.course)
    setLessonProgress((current) => ({
      ...current,
      lessonId,
      contentCompleted: true,
      completed: true,
    }))
  }

  if (authLoading || loading) return <div className="min-h-screen bg-[#f7f9ff] px-4 pb-16 pt-28"><MagnaLoader message="Loading lesson..." className="mx-auto max-w-3xl" /></div>

  if (!user) {
    const returnTo = encodeURIComponent(`/programs/courses/${courseId}/lessons/${lessonId}`)
    return (
      <div className="min-h-screen bg-[#f7f9ff] px-4 pb-16 pt-28">
        <section className="mx-auto max-w-2xl rounded-3xl bg-white p-8 text-center shadow-xl ring-1 ring-primary-100">
          <LogIn className="mx-auto h-10 w-10 text-primary-600" />
          <h1 className="mt-4 text-3xl font-black text-gray-950">Learner login required</h1>
          <p className="mt-3 text-gray-600">Sign in to access this lesson and restore your saved video position.</p>
          <Link to={`/programs/login?returnTo=${returnTo}`} className="mt-6 inline-flex rounded-xl bg-primary-600 px-5 py-3 font-bold text-white">Login to continue</Link>
        </section>
      </div>
    )
  }

  if (!lesson) {
    return (
      <div className="min-h-screen bg-[#f7f9ff] px-4 pb-16 pt-28">
        <section className="mx-auto max-w-3xl rounded-3xl bg-white p-8 text-center shadow-xl ring-1 ring-gray-100"><h1 className="text-3xl font-black">Lesson unavailable</h1><p className="mt-3 text-gray-600">{error || 'This lesson could not be loaded.'}</p><Link to={`/programs/courses/${courseId}`} className="mt-6 inline-flex rounded-xl bg-primary-600 px-5 py-3 font-bold text-white">Back to course</Link></section>
      </div>
    )
  }

  if (lesson.locked) {
    return (
      <div className="min-h-screen bg-[#f7f9ff] px-4 pb-16 pt-28">
        <section className="mx-auto max-w-2xl rounded-3xl bg-white p-8 text-center shadow-xl ring-1 ring-primary-100">
          <Lock className="mx-auto h-10 w-10 text-primary-600" />
          <h1 className="mt-4 text-3xl font-black text-gray-950">Lesson locked</h1>
          <p className="mt-3 text-gray-600">Complete the previous lesson to unlock {lesson.title}.</p>
          <Link to={`/programs/courses/${courseId}`} className="mt-6 inline-flex rounded-xl bg-primary-600 px-5 py-3 font-bold text-white">Back to course</Link>
        </section>
      </div>
    )
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#f7f9ff] px-3 pb-12 pt-24 sm:px-6 sm:pb-16 sm:pt-28 lg:px-8">
      <SEO title={`${lesson.title} | Magnafic Learning`} description={lesson.summary || `Continue ${course.title} on Magnafic.`} path={`/programs/courses/${courseId}/lessons/${lessonId}`} noIndex />
      <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[minmax(0,1fr)_330px]">
        <main className="min-w-0 rounded-2xl bg-white p-4 shadow-xl shadow-primary-900/5 ring-1 ring-gray-100 sm:rounded-3xl sm:p-7">
          <h1 className="break-words text-2xl font-black leading-tight text-gray-950 sm:text-3xl">{lesson.title}</h1>
          {lesson.duration && <p className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-gray-500"><Clock className="h-4 w-4" />{lesson.duration}</p>}
          {lesson.videoUrl && (
            <div className="mt-6">
              <LmsVideoPlayer
                url={lesson.videoUrl}
                initialSeconds={lessonProgress?.contentCompleted ? 0 : lessonProgress?.watchedSeconds || 0}
                onProgressSave={saveProgress}
              />
            </div>
          )}
          {lesson.summary && (
            <section className={`${lesson.videoUrl ? 'mt-5' : 'mt-6'} rounded-2xl bg-gray-50 p-4 sm:p-5`}>
              <h2 className="text-sm font-black uppercase tracking-[0.12em] text-primary-700">Lesson description</h2>
              <p className="mt-2 break-words text-base leading-7 text-gray-700">{lesson.summary}</p>
            </section>
          )}
          {lesson.materials?.length > 0 && (
            <section className="mt-7 space-y-4">
              <h2 className="text-xl font-black text-gray-950">Lesson materials</h2>
              {lesson.materials.map((material) => (
                <LessonMaterial
                  key={material._key}
                  material={material}
                  onReachedEnd={
                    material === primaryMaterial && material.resourceType !== 'reference'
                      ? () => completePrimaryContent('document-last-page')
                      : undefined
                  }
                />
              ))}
            </section>
          )}
          <section className="prose mt-7 max-w-none overflow-x-auto break-words rounded-2xl bg-gray-50 p-4 sm:p-6">
            {lesson.content?.length ? <PortableText value={lesson.content} /> : <p>Lesson notes will be available here.</p>}
            <ContentEndTracker
              enabled={
                completionMode === 'content' &&
                !lessonProgress?.contentCompleted &&
                !lessonProgress?.completed
              }
              onReachedEnd={() => completePrimaryContent('content-end')}
            />
          </section>
          {completionSaving && (
            <div className="mt-5 inline-flex items-center gap-2 rounded-xl bg-cyan-50 px-4 py-3 text-sm font-black text-primary-800">
              <CheckCircle2 className="h-5 w-5" />
              Saving lesson completion...
            </div>
          )}
          {lesson.assessment && lessonProgress?.contentCompleted && !lessonProgress?.completed && (
            <div className="mt-7">
              <LmsAssessment
                endpoint={`/api/assessments/lesson/${courseId}/${lessonId}`}
                onPassed={handleAssessmentPassed}
              />
            </div>
          )}
          {progressError && <p className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm font-bold text-red-700">{progressError}</p>}
          <nav className="mt-7 grid grid-cols-1 gap-3 sm:flex sm:flex-wrap sm:justify-between">
            {previousLesson ? <Link to={`/programs/courses/${courseId}/lessons/${previousLesson._id}`} className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 px-4 py-2 font-bold text-gray-800 sm:w-auto"><ArrowLeft className="h-4 w-4" />Previous</Link> : <span className="hidden sm:block" />}
            {nextLesson && (nextLesson.locked
              ? <span className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gray-100 px-4 py-2 font-bold text-gray-400 sm:w-auto"><Lock className="h-4 w-4" />Next lesson</span>
              : <Link to={`/programs/courses/${courseId}/lessons/${nextLesson._id}`} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary-600 px-4 py-2 font-bold text-white sm:w-auto">Next lesson<ArrowRight className="h-4 w-4" /></Link>)}
          </nav>
          <Link
            to={`/programs/courses/${courseId}`}
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-primary-200 bg-primary-50 px-4 py-3 font-black text-primary-700 transition hover:bg-primary-100"
          >
            <ArrowLeft className="h-5 w-5" />
            Back to course
          </Link>
        </main>

        <aside className="h-fit min-w-0 rounded-2xl bg-white p-4 shadow-xl shadow-primary-900/5 ring-1 ring-primary-100 sm:rounded-3xl sm:p-5 lg:sticky lg:top-28">
          <h2 className="text-lg font-black text-gray-950">Course lessons</h2>
          <div className="mt-4 space-y-2">
            {lessons.map((item) => {
              const content = (
                <>
                  <span className="flex items-center gap-2 text-sm font-semibold">
                    {item.locked && <Lock className="h-3.5 w-3.5 shrink-0" />}
                    {item.title}
                  </span>
                </>
              )

              return item.locked ? (
                <div key={item._id} className="cursor-not-allowed rounded-xl bg-gray-50 px-3 py-2.5 text-gray-400" aria-label={`${item.title} locked`}>
                  {content}
                </div>
              ) : (
                <Link
                  key={item._id}
                  to={`/programs/courses/${courseId}/lessons/${item._id}`}
                  className={`block rounded-xl px-3 py-2.5 transition ${item._id === lessonId ? 'bg-primary-50 text-primary-700 ring-1 ring-primary-100' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  {content}
                </Link>
              )
            })}
          </div>
          {lessonProgress?.completed ? (
            nextLesson && !nextLesson.locked ? (
              <Link to={`/programs/courses/${courseId}/lessons/${nextLesson._id}`} className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary-600 px-4 py-3 font-black text-white">
                Next lesson
                <ArrowRight className="h-5 w-5" />
              </Link>
            ) : (
              <div className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-green-50 px-4 py-3 font-black text-green-700">
                <CheckCircle2 className="h-5 w-5" />
                {nextLesson ? 'Lesson completed' : 'Course completed'}
              </div>
            )
          ) : lesson.assessment && lessonProgress?.contentCompleted ? (
            <div className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-amber-50 px-4 py-3 text-center font-black text-amber-800">
              <ClipboardCheck className="h-5 w-5 shrink-0" />
              Pass the assessment to continue
            </div>
          ) : (
            <div className="mt-5 rounded-xl bg-primary-50 px-4 py-3 text-center text-sm font-bold leading-6 text-primary-700">
              {completionMode === 'video'
                ? 'Watch the complete video to unlock the next lesson.'
                : completionMode === 'document'
                  ? 'Reach the final page or slide to unlock the next lesson.'
                  : completionMode === 'content'
                    ? 'Read to the end of the lesson to unlock the next lesson.'
                    : 'This lesson does not have trackable lesson content yet.'}
            </div>
          )}
        </aside>
      </div>
    </div>
  )
}
