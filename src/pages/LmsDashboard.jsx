import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Award, BookOpen, CheckCircle2, Download, Linkedin, Lock, LogIn, PlayCircle } from 'lucide-react'
import SEO from '../components/SEO'
import MagnaLoader from '../components/MagnaLoader'
import { useLmsAuth } from '../lib/lmsAuth'
import { lmsApi, lmsDownload, shareCertificateOnLinkedIn } from '../lib/lmsApi'

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60)
  return `${minutes}:${Math.floor(seconds % 60).toString().padStart(2, '0')}`
}

export default function LmsDashboard() {
  const { user, loading: authLoading } = useLmsAuth()
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [certificates, setCertificates] = useState([])
  const [certificateAction, setCertificateAction] = useState('')
  const certificatesByCourse = useMemo(
    () => new Map(certificates.map((certificate) => [certificate.courseId, certificate])),
    [certificates],
  )

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      setLoading(false)
      return
    }
    Promise.all([lmsApi('/api/dashboard'), lmsApi('/api/certificates')])
      .then(([dashboardResult, certificateResult]) => {
        setCourses(dashboardResult.courses || [])
        setCertificates(certificateResult.certificates || [])
      })
      .catch((loadError) => setError(loadError.message))
      .finally(() => setLoading(false))
  }, [authLoading, user])

  if (authLoading || loading) return <div className="min-h-screen bg-[#f7f9ff] px-4 pb-16 pt-28"><MagnaLoader message="Loading your learning dashboard..." className="mx-auto max-w-3xl" /></div>

  if (!user) {
    return <div className="min-h-screen bg-[#f7f9ff] px-4 pb-16 pt-28"><section className="mx-auto max-w-2xl rounded-3xl bg-white p-8 text-center shadow-xl ring-1 ring-primary-100"><LogIn className="mx-auto h-10 w-10 text-primary-600" /><h1 className="mt-4 text-3xl font-black">Learner login required</h1><p className="mt-3 text-gray-600">Sign in to view your courses and resume saved videos.</p><Link to="/programs/login" className="mt-6 inline-flex rounded-xl bg-primary-600 px-5 py-3 font-bold text-white">Login</Link></section></div>
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#f7f9ff] px-4 pb-12 pt-24 sm:px-6 sm:pb-16 sm:pt-28 lg:px-8">
      <SEO title="Learning Dashboard | Magnafic" description="Resume your Magnafic courses." path="/programs/dashboard" noIndex />
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div><p className="text-xs font-black uppercase tracking-[0.2em] text-primary-600 sm:text-sm">Magnafic learner hub</p><h1 className="mt-2 text-3xl font-black text-gray-950 sm:text-4xl">My programs</h1><p className="mt-3 text-gray-600">Continue your self-paced learning.</p></div>
          <Link to="/programs" className="inline-flex w-fit items-center gap-2 rounded-xl border border-primary-100 bg-white px-4 py-3 font-bold text-primary-700"><BookOpen className="h-5 w-5" />Browse Programs</Link>
        </div>
        {error && <p className="mt-6 rounded-xl bg-red-50 p-4 font-semibold text-red-700">{error}</p>}
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {courses.map((course) => (
            <article key={course.sanityId} className="min-w-0 rounded-2xl bg-white p-4 shadow-lg shadow-primary-900/5 ring-1 ring-gray-100 sm:p-6">
              <div className="flex items-start justify-between gap-4"><div><h2 className="text-xl font-black text-gray-950">{course.title}</h2><p className="mt-2 text-sm font-semibold text-gray-500">{course.completedLessons} of {course.totalLessons} lessons completed</p></div><BookOpen className="h-6 w-6 shrink-0 text-primary-600" /></div>
              <div className="mt-5 flex justify-between text-sm font-bold"><span>Course progress</span><span>{course.completionPercentage}%</span></div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-100" role="progressbar" aria-valuenow={course.completionPercentage} aria-valuemin="0" aria-valuemax="100"><div className="h-full rounded-full bg-gradient-to-r from-primary-600 to-cyan-400" style={{ width: `${course.completionPercentage}%` }} /></div>
              <div className="mt-5 flex flex-wrap gap-3"><Link to={`/programs/courses/${course.sanityId}`} className="rounded-xl bg-primary-950 px-4 py-2 text-sm font-bold text-white">Course</Link>{course.lastWatchedLessonId && <Link to={`/programs/courses/${course.sanityId}/lessons/${course.lastWatchedLessonId}`} className="inline-flex items-center gap-2 rounded-xl bg-cyan-400 px-4 py-2 text-sm font-black text-primary-950"><PlayCircle className="h-4 w-4" />{course.resumeSeconds > 0 ? `Resume at ${formatTime(course.resumeSeconds)}` : 'Start learning'}</Link>}{certificatesByCourse.has(course.sanityId) && (() => {
                const certificate = certificatesByCourse.get(course.sanityId)
                return certificate.linkedinSharedAt ? (
                  <>
                    <button type="button" disabled={certificateAction === certificate.certificateNumber} onClick={async () => {
                      setCertificateAction(certificate.certificateNumber)
                      setError('')
                      try {
                        await shareCertificateOnLinkedIn(certificate)
                      } catch (shareError) {
                        setError(shareError.message)
                      } finally {
                        setCertificateAction('')
                      }
                    }} className="inline-flex items-center gap-2 rounded-xl bg-[#0a66c2] px-4 py-2 text-sm font-black text-white disabled:opacity-60"><Linkedin className="h-4 w-4" />Share again</button>
                    <button type="button" disabled={certificateAction === certificate.certificateNumber} onClick={async () => {
                      setCertificateAction(certificate.certificateNumber)
                      setError('')
                      try {
                        await lmsDownload(`/api/certificates/${certificate.certificateNumber}/pdf`, `${certificate.certificateNumber}.pdf`)
                      } catch (downloadError) {
                        setError(downloadError.message)
                      } finally {
                        setCertificateAction('')
                      }
                    }} className="inline-flex items-center gap-2 rounded-xl border border-primary-200 px-4 py-2 text-sm font-black text-primary-700 disabled:opacity-60"><Award className="h-4 w-4" /><Download className="h-4 w-4" />{certificateAction === certificate.certificateNumber ? 'Working...' : 'Certificate'}</button>
                  </>
                ) : (
                  <button type="button" disabled={certificateAction === certificate.certificateNumber} onClick={async () => {
                    setCertificateAction(certificate.certificateNumber)
                    setError('')
                    try {
                      const updatedCertificate = await shareCertificateOnLinkedIn(certificate)
                      setCertificates((current) => current.map((item) => (
                        item.certificateNumber === updatedCertificate.certificateNumber
                          ? updatedCertificate
                          : item
                      )))
                    } catch (shareError) {
                      setError(shareError.message)
                    } finally {
                      setCertificateAction('')
                    }
                  }} className="inline-flex items-center gap-2 rounded-xl bg-[#0a66c2] px-4 py-2 text-sm font-black text-white disabled:opacity-60"><Linkedin className="h-4 w-4" />{certificateAction === certificate.certificateNumber ? 'Opening...' : 'Share to unlock'}</button>
                )
              })()}</div>
              <div className="mt-6 divide-y divide-gray-100 border-t border-gray-100">
                {course.lessons?.map((lesson) => (
                  <div key={lesson.id} className="py-4">
                    <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <p className={`truncate text-sm font-bold ${lesson.locked ? 'text-gray-400' : 'text-gray-900'}`}>{lesson.title}</p>
                        <p className="mt-1 text-xs font-semibold text-gray-500">{lesson.locked ? 'Complete the previous lesson' : lesson.completed ? 'Completed' : lesson.watchedSeconds > 0 ? `${formatTime(lesson.watchedSeconds)} watched` : 'Not started'}</p>
                      </div>
                      {lesson.locked ? (
                        <span aria-label={`${lesson.title} locked`} className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-gray-200 bg-gray-50 text-gray-400"><Lock className="h-4 w-4" /></span>
                      ) : (
                        <Link
                          to={`/programs/courses/${course.sanityId}/lessons/${lesson.id}`}
                          aria-label={`${lesson.watchedSeconds > 0 && !lesson.completed ? 'Resume' : 'Open'} ${lesson.title}`}
                          className="inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-xs font-black text-primary-600 transition hover:bg-primary-50 sm:w-auto"
                        >
                          {lesson.completed ? <CheckCircle2 className="h-4 w-4" /> : <PlayCircle className="h-4 w-4" />}
                          {lesson.completed ? 'Review' : lesson.watchedSeconds > 0 ? `Resume ${formatTime(lesson.watchedSeconds)}` : 'Start'}
                        </Link>
                      )}
                    </div>
                    <div className="mt-2 flex items-center gap-3">
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-100" role="progressbar" aria-label={`${lesson.title} progress`} aria-valuemin="0" aria-valuemax="100" aria-valuenow={lesson.percentage}>
                        <div className="h-full rounded-full bg-primary-600 transition-[width]" style={{ width: `${lesson.percentage}%` }} />
                      </div>
                      <span className="w-9 text-right text-xs font-bold text-gray-500">{lesson.percentage}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
        {!courses.length && !error && <section className="mt-8 rounded-3xl border border-dashed border-primary-200 bg-white p-8 text-center"><h2 className="text-2xl font-black">No courses available yet</h2><p className="mt-2 text-gray-600">Published self-paced courses will appear here.</p><Link to="/courses" className="mt-5 inline-flex rounded-xl bg-primary-600 px-5 py-3 font-bold text-white">Browse Courses</Link></section>}
      </div>
    </div>
  )
}
