import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, User } from 'lucide-react'
import { mentorClient } from '../lib/sanityClient'
import { getExpertImage } from '../lib/expertImages'
import MagnaLoader from './MagnaLoader'
import ExpertWorldMap from './ExpertWorldMap'

export default function HomeMentors() {
  const [mentors, setMentors] = useState([])
  const [loading, setLoading] = useState(true)
  const [isAutoScrollPaused, setIsAutoScrollPaused] = useState(false)
  const scrollerRef = useRef(null)

  useEffect(() => {
    const fetchMentors = async () => {
      try {
        const query = `*[_type == "mentor"] | order(fullName asc) {
          _id,
          "slug": slug.current,
          fullName,
          "imageUrl": profileImage.asset->url,
          headline,
          currentDesignation,
          designation,
          location,
          city,
          totalYearsOfExperience
        }`

        const data = await mentorClient.fetch(query)
        setMentors((data || []).filter(Boolean))
      } catch (error) {
        console.error('Error fetching home mentors:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchMentors()
  }, [])

  useEffect(() => {
    const scroller = scrollerRef.current
    if (!scroller || mentors.length <= 1 || isAutoScrollPaused) return undefined

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (reduceMotion.matches) return undefined

    let animationFrameId
    let previousTimestamp
    const scrollSpeed = 34

    const scrollExperts = (timestamp) => {
      if (previousTimestamp === undefined) previousTimestamp = timestamp

      const elapsedSeconds = (timestamp - previousTimestamp) / 1000
      previousTimestamp = timestamp

      const loopWidth = scroller.scrollWidth / 2
      scroller.scrollLeft += scrollSpeed * elapsedSeconds

      if (loopWidth > 0 && scroller.scrollLeft >= loopWidth) {
        scroller.scrollLeft -= loopWidth
      }

      animationFrameId = window.requestAnimationFrame(scrollExperts)
    }

    animationFrameId = window.requestAnimationFrame(scrollExperts)

    return () => {
      window.cancelAnimationFrame(animationFrameId)
    }
  }, [mentors.length, isAutoScrollPaused])

  if (loading) {
    return (
      <section className="bg-[#f7f9ff] px-4 py-12 sm:px-6 lg:px-8">
        <MagnaLoader message="Loading experts..." className="mx-auto max-w-3xl" />
      </section>
    )
  }

  if (mentors.length === 0) return null

  const mentorsForScroller = mentors.length > 1 ? [...mentors, ...mentors] : mentors

  return (
    <section className="relative overflow-hidden bg-[linear-gradient(145deg,#000047,#24238f_58%,#087f9d)] px-4 py-12 sm:px-6 lg:px-8">
      <ExpertWorldMap />

      <div className="relative mx-auto max-w-7xl">
        <div className="mb-8 flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 text-white ring-1 ring-white/20 backdrop-blur-sm">
            <User className="h-6 w-6" />
          </span>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan-200">Global Expert Network</p>
            <h2 className="text-2xl font-bold text-white sm:text-3xl">Explore Experts</h2>
          </div>
        </div>

        <div
          ref={scrollerRef}
          className="expert-scroller overflow-x-auto pb-7"
          onMouseEnter={() => setIsAutoScrollPaused(true)}
          onMouseLeave={() => setIsAutoScrollPaused(false)}
          onFocus={() => setIsAutoScrollPaused(true)}
          onBlur={() => setIsAutoScrollPaused(false)}
        >
          <div className="flex snap-x snap-mandatory gap-4">
            {mentorsForScroller.map((mentor, index) => {
              const isDuplicate = index >= mentors.length

              return (
              <Link
                key={`${mentor._id}-${index}`}
                to={`/experts/${mentor.slug || mentor._id}`}
                aria-hidden={isDuplicate}
                tabIndex={isDuplicate ? -1 : undefined}
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
                  {getExpertImage(mentor) ? (
                    <img
                      src={getExpertImage(mentor)}
                      alt={mentor.fullName}
                      className="absolute left-1/2 bottom-4 h-24 w-24 -translate-x-1/2 translate-y-1/2 rounded-full border-4 border-white bg-white object-cover shadow-xl shadow-primary-900/20 transition duration-300 group-hover:scale-105 sm:h-28 sm:w-28"
                    />
                  ) : (
                    <div className="absolute left-1/2 bottom-4 flex h-24 w-24 -translate-x-1/2 translate-y-1/2 items-center justify-center rounded-full border-4 border-white bg-primary-100 shadow-xl shadow-primary-900/20 sm:h-28 sm:w-28">
                      <User className="h-10 w-10 text-primary-600" />
                    </div>
                  )}
                </div>

                <div className="flex flex-1 flex-col p-4 pt-14 pb-6 text-center sm:p-4 sm:pt-16">
                  <h3 className="line-clamp-2 min-h-[2.75rem] text-lg font-bold leading-tight text-gray-950">{mentor.fullName}</h3>
                  {(mentor.headline || mentor.currentDesignation || mentor.designation) && (
                    <p className="mt-0 line-clamp-3 min-h-[3.35rem] text-[12px] font-medium leading-[18px] text-primary-600">{mentor.headline || mentor.currentDesignation || mentor.designation}</p>
                  )}
                  {!(mentor.headline || mentor.currentDesignation || mentor.designation) && (
                    <span className="mt-0.5 block min-h-[3.35rem]" aria-hidden="true"></span>
                  )}
                  {mentor.totalYearsOfExperience ? (
                    <p className="mt-2 line-clamp-1 min-h-[1rem] text-xs font-bold text-primary-700">
                      {mentor.totalYearsOfExperience}+ years experience
                    </p>
                  ) : (
                    <span className="mt-2 block min-h-[1rem]" aria-hidden="true"></span>
                  )}
                  {(mentor.location || mentor.city) && (
                    <p className="mt-2 mb-3 line-clamp-1 min-h-[1rem] text-xs font-bold text-primary-700">{mentor.location || mentor.city}</p>
                  )}
                  {!(mentor.location || mentor.city) && (
                    <span className="mt-2 mb-3 block min-h-[1rem]" aria-hidden="true"></span>
                  )}
                  <span className="mx-auto mt-auto inline-flex items-center justify-center rounded-full bg-gradient-to-r from-primary-600 to-cyan-400 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-primary-900/20 transition group-hover:bg-primary-600 group-hover:shadow-primary-600/30">
                    View Profile
                    <ArrowRight className="ml-2 h-4 w-4 transition group-hover:translate-x-0.5" />
                  </span>
                </div>
                <div className="absolute inset-x-0 bottom-0 h-1.5 bg-gradient-to-r from-primary-600 to-cyan-400"></div>
              </Link>
              )
            })}
          </div>
        </div>

      </div>
    </section>
  )
}
