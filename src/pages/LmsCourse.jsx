import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { PortableText } from '@portabletext/react'
import { ArrowLeft, ArrowRight, BookOpen, Clock, FileText, Lock, LogIn, PlayCircle } from 'lucide-react'
import SEO from '../components/SEO'
import MagnaLoader from '../components/MagnaLoader'
import LmsAssessment from '../components/LmsAssessment'
import CertificateClaim from '../components/CertificateClaim'
import { useLmsAuth } from '../lib/lmsAuth'
import { lmsApi } from '../lib/lmsApi'

const COURSE_PROGRESS_SEGMENTS = 20
const COURSE_PROGRESS_COLORS = ['#5b43e6', '#347ded', '#08dce6']

const courseDescriptionComponents = {
  block: {
    h1: ({ children }) => <h2 className="text-3xl font-extrabold leading-tight text-blue-900 sm:text-4xl">{children}</h2>,
    h2: ({ children }) => <h2 className="text-3xl font-extrabold leading-tight text-blue-900 sm:text-4xl">{children}</h2>,
    h3: ({ children }) => <h3 className="text-2xl font-extrabold leading-tight text-blue-900 sm:text-3xl">{children}</h3>,
    normal: ({ children }) => <p className="mx-auto mt-6 max-w-3xl text-xl font-semibold leading-7 text-gray-700 lg:text-2xl lg:leading-9">{children}</p>,
    blockquote: ({ children }) => <blockquote className="mx-auto mt-6 max-w-3xl text-xl font-semibold italic leading-8 text-gray-700">{children}</blockquote>,
  },
}

function CircularCourseProgress({ value }) {
  const percentage = Math.max(0, Math.min(100, Math.round(Number(value) || 0)))
  const activeSegments = Math.round((percentage / 100) * COURSE_PROGRESS_SEGMENTS)

  const segmentColor = (index) => {
    if (activeSegments <= 1) return COURSE_PROGRESS_COLORS[2]
    const colorIndex = Math.min(
      COURSE_PROGRESS_COLORS.length - 1,
      Math.floor((index / activeSegments) * COURSE_PROGRESS_COLORS.length),
    )
    return COURSE_PROGRESS_COLORS[colorIndex]
  }

  return (
    <div
      className="relative mx-auto h-40 w-40 shrink-0 sm:h-44 sm:w-44"
      role="progressbar"
      aria-label="Course completion"
      aria-valuemin="0"
      aria-valuemax="100"
      aria-valuenow={percentage}
    >
      <span className="absolute bottom-0 left-1/2 h-2 w-16 -translate-x-1/2 rounded-full bg-cyan-300/20 blur-sm" aria-hidden="true" />
      <svg viewBox="0 0 120 120" className="relative h-full w-full drop-shadow-[0_0_14px_rgba(0,255,255,0.2)]" aria-hidden="true">
        {Array.from({ length: COURSE_PROGRESS_SEGMENTS }, (_, index) => (
          <rect
            key={index}
            x="56"
            y="5"
            width="8"
            height="21"
            rx="2"
            fill={index < activeSegments ? segmentColor(index) : 'rgba(0,0,71,0.12)'}
            transform={`rotate(${index * (360 / COURSE_PROGRESS_SEGMENTS)} 60 60)`}
          />
        ))}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-black leading-none text-[#000047]">{percentage}%</span>
        <span className="mt-1 text-xs font-bold uppercase text-primary-600">progress</span>
      </div>
    </div>
  )
}

export default function LmsCourse() {
  const { courseId } = useParams()
  const { user, loading: authLoading } = useLmsAuth()
  const [course, setCourse] = useState(null)
  const [progress, setProgress] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [errorStatus, setErrorStatus] = useState(null)

  const loadCourse = async () => {
    setLoading(true)
    setError('')
    setErrorStatus(null)
    try {
      const result = await lmsApi(`/api/course/${courseId}`)
      setCourse(result.course)
      if (user) {
        const progressResult = await lmsApi(`/api/progress/${courseId}`)
        setProgress(progressResult)
      } else {
        setProgress(null)
      }
    } catch (loadError) {
      setError(loadError.message)
      setErrorStatus(loadError.status || null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!authLoading) loadCourse()
  }, [authLoading, courseId, user])

  const lessons = useMemo(() => course?.modules?.flatMap((module) => module.lessons || []) || [], [course])
  const firstLesson = lessons.find((lesson) => !lesson.locked)
  const completion = lessons.length ? Math.round(((progress?.completed || 0) / lessons.length) * 100) : 0
  const handleFinalPassed = (result) => {
    setProgress((current) => ({
      ...current,
      finalAssessment: result.finalAssessment,
      courseCompleted: result.courseCompleted,
    }))
  }

  if (loading) return <div className="min-h-screen bg-[#f7f9ff] px-4 pb-16 pt-28"><MagnaLoader message="Loading course..." className="mx-auto max-w-3xl" /></div>

  if (!course) {
    return (
      <div className="min-h-screen bg-[#f7f9ff] px-4 pb-16 pt-28">
        <section className="mx-auto max-w-3xl rounded-3xl bg-white p-8 text-center shadow-xl ring-1 ring-gray-100">
          <h1 className="text-3xl font-black text-gray-950">{errorStatus === 404 ? 'Course not found' : 'Unable to load course'}</h1>
          <p className="mt-3 text-gray-600">{error || 'This course is not currently available.'}</p>
          <Link to="/programs" className="mt-6 inline-flex rounded-full bg-primary-600 px-5 py-3 font-bold text-white">Back to Programs</Link>
        </section>
      </div>
    )
  }

  const lastWatchedLesson = lessons.find(
    (lesson) => lesson._id === progress?.lastWatchedLessonId && !lesson.locked
  )
  const continueLessonId = lastWatchedLesson?._id || firstLesson?._id
  const returnTo = encodeURIComponent(`/programs/courses/${courseId}`)

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#f7f9ff]">
      <SEO title={`${course.title} | Magnafic Programs`} description={course.excerpt} path={`/programs/courses/${courseId}`} image={course.mainImage?.bannerUrl || course.mainImage?.url} noIndex />
      <section className="bg-[#000047] px-4 pb-10 pt-24 text-white sm:px-6 sm:pb-16 sm:pt-28 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_22rem]">
            <div className="min-w-0 text-center lg:text-left">
              <Link
                to="/courses"
                className="inline-flex items-center gap-2 text-sm font-bold text-cyan-100 transition hover:text-white"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to courses
              </Link>
              <p className="text-base font-black text-cyan sm:text-lg">Magnafic Academy</p>
              <h1 className="mt-3 break-words text-3xl font-black leading-tight sm:text-5xl lg:text-6xl">{course.title}</h1>
              {course.excerpt && <p className="mx-auto mt-4 max-w-3xl text-base leading-7 text-cyan-50 sm:mt-6 sm:text-lg sm:leading-8 lg:mx-0">{course.excerpt}</p>}
            </div>

            <div className="mx-auto w-full max-w-sm lg:mx-0">
              {course.mainImage?.bannerUrl || course.mainImage?.url ? (
                <img
                  src={course.mainImage.bannerUrl || course.mainImage.url}
                  alt={course.mainImage.alt || course.title}
                  className="aspect-[3/4] h-[420px] w-full rounded-[1.75rem] object-cover shadow-2xl shadow-primary-950/30 ring-1 ring-white/20"
                />
              ) : (
                <div className="flex aspect-[3/4] h-[420px] w-full items-center justify-center rounded-[1.75rem] bg-white/10 p-8 shadow-2xl shadow-primary-950/30 ring-1 ring-white/20">
                  <img src="/Magnafic.png" alt="" className="w-3/4 object-contain brightness-0 invert" />
                </div>
              )}
            </div>
          </div>

        </div>
      </section>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        {error && <p className="mb-6 rounded-xl bg-red-50 p-4 font-semibold text-red-700">{error}</p>}
        <section className="grid items-center gap-8 lg:grid-cols-[minmax(0,1fr)_19rem] lg:gap-12">
          <div className="min-w-0">
            {course.description?.length > 0 ? (
              <div className="break-words py-4 text-center">
                <h2 className="text-3xl font-extrabold leading-tight text-blue-900 sm:text-4xl">About this course</h2>
                <PortableText value={course.description} components={courseDescriptionComponents} />
              </div>
            ) : (
              <div className="py-4 text-center">
                <h2 className="text-3xl font-extrabold leading-tight text-blue-900 sm:text-4xl">About this course</h2>
                <p className="mx-auto mt-6 max-w-3xl text-xl font-semibold leading-7 text-gray-700 lg:text-2xl lg:leading-9">{course.excerpt}</p>
              </div>
            )}
          </div>

          <aside className="flex min-w-0 flex-col items-center justify-center gap-5 text-center">
            {!user ? (
              <>
                <p className="text-sm font-semibold leading-6 text-gray-600">Sign in to save progress and unlock lessons in order.</p>
                <Link to={`/programs/login?returnTo=${returnTo}`} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#5b43e6] via-[#347ded] to-[#08dce6] px-5 py-3 font-black text-white shadow-lg shadow-cyan-500/25 sm:w-auto"><LogIn className="h-5 w-5" />Login to continue</Link>
              </>
            ) : (
              <>
                <CircularCourseProgress value={completion} />
                {continueLessonId && (
                  <Link
                    to={`/programs/courses/${courseId}/lessons/${continueLessonId}`}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#5b43e6] via-[#347ded] to-[#08dce6] px-5 py-3 font-black text-white shadow-lg shadow-cyan-500/25 transition hover:-translate-y-0.5 hover:shadow-cyan-400/40 sm:w-auto"
                  >
                    <PlayCircle className="h-5 w-5" />
                    {progress?.lastWatchedLessonId ? 'Resume learning' : 'Start course'}
                  </Link>
                )}
              </>
            )}
          </aside>
        </section>
        <section className="mt-8 space-y-5">
          {course.modules?.map((module) => (
            <article key={module._id} className="overflow-hidden rounded-2xl bg-white shadow-lg shadow-primary-900/5 ring-1 ring-gray-100">
              <div className="border-b border-white/20 bg-gradient-to-r from-[#5b43e6] via-[#347ded] to-[#08dce6] px-4 py-4 sm:px-6">
                <h2 className="break-words text-lg font-black text-white sm:text-xl">{module.title}</h2>
              </div>
              <div className="divide-y divide-gray-100 px-4 sm:px-6">
                {module.lessons?.map((lesson) => (
                  <div key={lesson._id} className={`flex flex-col items-stretch gap-3 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4 ${lesson.locked ? 'bg-gray-50/80' : ''}`}>
                    <div className="flex min-w-0 items-start gap-3 sm:items-center">
                      {lesson.locked
                        ? <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gray-200 text-gray-500"><Lock className="h-4 w-4" /></span>
                        : <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary-50 text-primary-600"><BookOpen className="h-4 w-4" /></span>}
                      <div className="min-w-0">
                        <p className="font-bold text-gray-900">{lesson.title}</p>
                        {lesson.summary && <p className="mt-1 max-w-2xl text-sm leading-5 text-gray-600">{lesson.summary}</p>}
                        <div className="mt-1 flex flex-wrap items-center gap-3 text-xs font-semibold text-gray-500">
                          {lesson.duration && <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" />{lesson.duration}</span>}
                          {lesson.materials?.length > 0 && <span className="inline-flex items-center gap-1"><FileText className="h-3 w-3" />{lesson.materials.length} {lesson.materials.length === 1 ? 'file' : 'files'}</span>}
                        </div>
                      </div>
                    </div>
                    {lesson.locked
                      ? <span className="inline-flex w-fit shrink-0 self-center items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-gray-100 px-3 py-2 text-sm font-bold text-gray-400 sm:self-auto sm:bg-transparent sm:px-0"><Lock className="h-4 w-4" />Locked</span>
                      : <Link to={`/programs/courses/${courseId}/lessons/${lesson._id}`} className="inline-flex w-fit shrink-0 self-center items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-primary-600 px-3 py-2 text-sm font-bold text-white sm:self-auto">Open <ArrowRight className="h-4 w-4" /></Link>}
                  </div>
                ))}
              </div>
            </article>
          ))}
        </section>
        {user && progress?.finalAssessment && !progress.finalAssessment.passed && (
          <section className="mt-8">
            <LmsAssessment
              endpoint={`/api/assessments/course/${courseId}/final`}
              locked={!progress.finalAssessment.unlocked}
              onPassed={handleFinalPassed}
            />
          </section>
        )}
        {user && progress?.courseCompleted && (
          <div className="mt-8 flex items-center gap-3 rounded-2xl bg-green-50 p-6 text-lg font-black text-green-700">
            <BookOpen className="h-6 w-6" />
            Course completed
          </div>
        )}
        {user && progress?.courseCompleted && <CertificateClaim courseId={courseId} />}
      </main>
    </div>
  )
}
