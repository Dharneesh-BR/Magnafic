import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { BookOpen, GraduationCap } from 'lucide-react'
import MagnaLoader from '../components/MagnaLoader'
import SEO from '../components/SEO'
import { lmsApi } from '../lib/lmsApi'

function CourseCard({ course }) {
  const detailsUrl = `/courses/${course._id}`
  const courseImage = course.mainImage?.cardUrl || course.mainImage?.url

  return (
    <article className="group relative overflow-hidden rounded-[1.5rem] bg-white pb-1.5 shadow-lg shadow-primary-900/5 transition hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary-900/12">
      <Link to={detailsUrl} className="relative block aspect-[4/5] overflow-hidden bg-primary-700">
        {courseImage ? (
          <img
            src={courseImage}
            alt={course.mainImage.alt || course.title}
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <img src="/Magnafic.png" alt="" className="w-2/3 object-contain brightness-0 invert" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-black/5 to-black/35" />
        <div className="absolute bottom-6 left-5 right-5 rounded-[1.5rem] bg-gray-100/80 p-5 text-gray-950 shadow-2xl shadow-primary-950/15 backdrop-blur-sm">
          <h2 className="text-xl font-semibold leading-snug text-gray-950">{course.title}</h2>
          <div className="mt-3 flex flex-wrap items-center gap-4 text-xs font-bold text-gray-600">
            <span className="inline-flex items-center gap-1.5">
              <BookOpen className="h-4 w-4 text-primary-600" />
              {course.lessonCount || 0} lessons
            </span>
            <span className="inline-flex items-center gap-1.5">
              <GraduationCap className="h-4 w-4 text-primary-600" />
              {course.moduleCount || 0} modules
            </span>
          </div>
        </div>
      </Link>
      <div className="absolute inset-x-0 bottom-0 h-1.5 bg-gradient-to-r from-primary-600 to-cyan-400" aria-hidden="true" />
    </article>
  )
}

export default function Courses() {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let mounted = true

    const loadCourses = async () => {
      setLoading(true)
      setError('')

      try {
        const courseResult = await lmsApi('/api/courses')

        if (!mounted) return
        setCourses(courseResult.courses || [])
      } catch {
        if (mounted) setError('Courses are temporarily unavailable. Please try again shortly.')
      } finally {
        if (mounted) setLoading(false)
      }
    }

    loadCourses()
    return () => {
      mounted = false
    }
  }, [])

  return (
    <div className="min-h-screen bg-[#f7f9ff]">
      <SEO title="Courses | Magnafic" description="Explore self-paced Magnafic courses and continue your learning across devices." path="/courses" />

      <section className="premium-hero relative isolate mx-2 mt-24 overflow-hidden overflow-x-hidden rounded-2xl px-4 pb-9 pt-8 text-white sm:mx-6 sm:px-8 sm:pb-12 lg:mx-8 lg:px-10 lg:py-12">
        <div className="premium-hero__texture pointer-events-none absolute inset-0 z-0 rounded-3xl" />
        <div className="premium-hero__sheen pointer-events-none absolute inset-0 z-0 rounded-3xl" />
        <div className="pointer-events-none absolute inset-x-6 top-0 z-0 h-px bg-gradient-to-r from-transparent via-[#d9bc75]/70 to-transparent" />
        <div className="pointer-events-none absolute bottom-0 left-1/2 z-0 h-px w-[82%] -translate-x-1/2 bg-gradient-to-r from-transparent via-white/20 to-transparent" />

        <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-8 lg:min-h-[31rem] lg:grid-cols-[1.06fr_.94fr] lg:gap-12">
          <div className="mx-auto max-w-2xl text-center lg:mx-0 lg:text-left">
            <p className="text-base font-black text-cyan sm:text-lg">Magnafic Academy</p>
            <h1 className="mt-4 text-3xl font-black leading-tight text-white sm:text-4xl lg:text-5xl">
              Your Journey to Top1% Starts here.
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-cyan-50 sm:text-lg sm:leading-8 lg:mx-0">
              Master real-world strategies and AI-powered skills through self-paced courses that transform professionals into high-impact leaders.
            </p>
          </div>

          <div className="course-bulb-visual relative mx-auto flex min-h-[16rem] w-full max-w-[420px] items-center justify-center sm:min-h-[21rem] lg:min-h-[27rem] lg:max-w-[500px]">
            <img
              src="/course-learning-bulb-transparent-v2.png"
              alt="A glowing light bulb representing learning and new ideas"
              className="course-bulb-image relative z-10 h-auto w-full max-w-[270px] object-contain sm:max-w-[350px] lg:max-w-[430px]"
            />
          </div>
        </div>
      </section>

      <main className="px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          {loading ? (
            <MagnaLoader message="Loading courses..." className="mx-auto max-w-3xl" />
          ) : error ? (
            <div className="rounded-2xl border border-dashed border-red-200 bg-red-50 p-7 text-center font-semibold text-red-700">{error}</div>
          ) : courses.length ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {courses.map((course) => (
                <CourseCard key={course._id} course={course} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-cyan-200 bg-white p-8 text-center">
              <BookOpen className="mx-auto h-9 w-9 text-primary-600" />
              <h2 className="mt-4 text-2xl font-black text-gray-950">Courses are coming soon</h2>
              <p className="mt-2 text-gray-600">Published LMS courses will appear here.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
