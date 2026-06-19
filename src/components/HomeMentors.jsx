import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, ChevronLeft, ChevronRight, User } from 'lucide-react'
import { mentorClient } from '../lib/sanityClient'
import { getExpertImage } from '../lib/expertImages'
import MagnaLoader from './MagnaLoader'
import ExpertWorldMap from './ExpertWorldMap'

function ExpertCard({ mentor, isDuplicate = false, compact = false, className = '', style }) {
  const expertImage = getExpertImage(mentor)

  return (
    <Link
      to={`/experts/${mentor.slug || mentor._id}`}
      aria-hidden={isDuplicate}
      tabIndex={isDuplicate ? -1 : undefined}
      className={`group relative flex shrink-0 snap-start flex-col overflow-hidden rounded-3xl bg-white shadow-xl shadow-primary-900/5 ring-1 ring-gray-100 transition hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary-900/10 ${className}`}
      style={style}
    >
      <div className={`relative overflow-visible bg-gradient-to-br from-primary-900 via-primary-700 to-cyan-500 ${compact ? 'h-20' : 'h-24 sm:h-28'}`}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_20%,rgba(255,255,255,0.22),transparent_30%)]"></div>
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(0,255,255,0.18),transparent_45%,rgba(255,255,255,0.16))]"></div>
        <img
          src="/favicon.png"
          alt=""
          aria-hidden="true"
          className={`absolute right-3 top-3 p-1 ${compact ? 'h-7 w-7' : 'h-8 w-8'}`}
        />
        {expertImage ? (
          <img
            src={expertImage}
            alt={mentor.fullName}
            className={`absolute left-1/2 bottom-4 -translate-x-1/2 translate-y-1/2 rounded-full border-4 border-white bg-white object-cover shadow-xl shadow-primary-900/20 transition duration-300 group-hover:scale-105 ${compact ? 'h-20 w-20' : 'h-24 w-24 sm:h-28 sm:w-28'}`}
          />
        ) : (
          <div className={`absolute left-1/2 bottom-4 flex -translate-x-1/2 translate-y-1/2 items-center justify-center rounded-full border-4 border-white bg-primary-100 shadow-xl shadow-primary-900/20 ${compact ? 'h-20 w-20' : 'h-24 w-24 sm:h-28 sm:w-28'}`}>
            <User className={`${compact ? 'h-8 w-8' : 'h-10 w-10'} text-primary-600`} />
          </div>
        )}
      </div>

      <div className={`flex flex-1 flex-col text-center ${compact ? 'p-3 pt-12 pb-4' : 'p-4 pt-14 pb-6 sm:p-4 sm:pt-16'}`}>
        <h3 className={`${compact ? 'text-base' : 'text-lg'} line-clamp-2 font-bold leading-tight text-gray-950`}>{mentor.fullName}</h3>
        {(mentor.headline || mentor.currentDesignation || mentor.designation) && (
          <p className={`${compact ? 'text-[11px] leading-[16px]' : 'text-[12px] leading-[18px]'} mt-2.5 line-clamp-3 font-medium text-primary-700`}>{mentor.headline || mentor.currentDesignation || mentor.designation}</p>
        )}
        {!(mentor.headline || mentor.currentDesignation || mentor.designation) && (
          <span className="mt-1.5 block" aria-hidden="true"></span>
        )}
        {mentor.totalYearsOfExperience ? (
          <p className="mt-2 line-clamp-1 text-xs font-bold text-primary-700">
            {mentor.totalYearsOfExperience}+ years experience
          </p>
        ) : (
          <span className="mt-2 block" aria-hidden="true"></span>
        )}
        {(mentor.location || mentor.city) && (
          <p className="mb-2 mt-2 line-clamp-1 text-xs font-bold text-primary-700">{mentor.location || mentor.city}</p>
        )}
        {!(mentor.location || mentor.city) && (
          <span className="mb-2 mt-2 block" aria-hidden="true"></span>
        )}
        <span className={`mx-auto mt-auto inline-flex items-center justify-center rounded-full bg-gradient-to-r from-primary-600 to-cyan-400 font-bold text-white shadow-lg shadow-primary-900/20 transition group-hover:bg-primary-600 group-hover:shadow-primary-600/30 ${compact ? 'px-3 py-2 text-[11px]' : 'px-4 py-2.5 text-xs'}`}>
          View Profile
          <ArrowRight className="ml-2 h-4 w-4 transition group-hover:translate-x-0.5" />
        </span>
      </div>
      <div className="absolute inset-x-0 bottom-0 h-1.5 bg-gradient-to-r from-primary-600 to-cyan-400"></div>
    </Link>
  )
}

export default function HomeMentors() {
  const [mentors, setMentors] = useState([])
  const [loading, setLoading] = useState(true)
  const [isOrbitPaused, setIsOrbitPaused] = useState(false)
  const [orbitPhase, setOrbitPhase] = useState(0)
  const [orbitMetrics, setOrbitMetrics] = useState({ x: 380, y: 104, compact: false })

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
    if (mentors.length <= 1 || isOrbitPaused) return undefined

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (reduceMotion.matches) return undefined

    let animationFrameId
    let previousTimestamp

    const orbitExperts = (timestamp) => {
      if (previousTimestamp === undefined) previousTimestamp = timestamp

      const elapsedSeconds = (timestamp - previousTimestamp) / 1000
      previousTimestamp = timestamp

      setOrbitPhase(current => (current + elapsedSeconds * 0.34) % (Math.PI * 2))
      animationFrameId = window.requestAnimationFrame(orbitExperts)
    }

    animationFrameId = window.requestAnimationFrame(orbitExperts)

    return () => {
      window.cancelAnimationFrame(animationFrameId)
    }
  }, [mentors.length, isOrbitPaused])

  useEffect(() => {
    const updateOrbitMetrics = () => {
      const width = window.innerWidth
      if (width < 640) {
        setOrbitMetrics({ x: 116, y: 46, compact: true })
      } else if (width < 1024) {
        setOrbitMetrics({ x: 220, y: 68, compact: true })
      } else {
        setOrbitMetrics({ x: 380, y: 104, compact: false })
      }
    }

    updateOrbitMetrics()
    window.addEventListener('resize', updateOrbitMetrics)

    return () => {
      window.removeEventListener('resize', updateOrbitMetrics)
    }
  }, [])

  if (loading) {
    return (
      <section className="bg-[#f7f9ff] px-4 py-12 sm:px-6 lg:px-8">
        <MagnaLoader message="Loading experts..." className="mx-auto max-w-3xl" />
      </section>
    )
  }

  if (mentors.length === 0) return null

  const orbitMentors = mentors.slice(0, Math.min(mentors.length, 8))
  const orbitStep = orbitMentors.length ? (Math.PI * 2) / orbitMentors.length : 0
  const rotateOrbit = (direction) => {
    setOrbitPhase(current => (current + direction * orbitStep + Math.PI * 2) % (Math.PI * 2))
  }
  const orbitAngles = orbitMentors.map((_, index) => orbitPhase + ((Math.PI * 2) / orbitMentors.length) * index)
  const frontCardPosition = orbitStep
    ? (((Math.PI / 2 - orbitPhase) / orbitStep) % orbitMentors.length + orbitMentors.length) % orbitMentors.length
    : 0
  const orbitCards = orbitMentors.map((mentor, index) => {
    const angle = orbitAngles[index]
    const depth = (Math.sin(angle) + 1) / 2
    const isBehind = Math.sin(angle) < -0.12
    const compactOffsetRaw = index - frontCardPosition
    const compactOffset = compactOffsetRaw > orbitMentors.length / 2
      ? compactOffsetRaw - orbitMentors.length
      : compactOffsetRaw < -orbitMentors.length / 2
        ? compactOffsetRaw + orbitMentors.length
        : compactOffsetRaw
    const compactDistance = Math.abs(compactOffset)
    const compactVisibility = Math.max(0, Math.min(1, 1.35 - compactDistance))
    const isHiddenOnCompact = orbitMetrics.compact && compactVisibility <= 0
    const x = orbitMetrics.compact ? compactOffset * orbitMetrics.x : Math.cos(angle) * orbitMetrics.x
    const y = orbitMetrics.compact ? 34 - compactDistance * 16 : Math.sin(angle) * orbitMetrics.y
    const scale = orbitMetrics.compact ? 0.9 - Math.min(compactDistance, 1.45) * 0.18 : 0.68 + depth * 0.28
    const opacity = orbitMetrics.compact
      ? compactVisibility
      : (isBehind ? 0 : 0.78 + depth * 0.22)

    return {
      mentor,
      isBehind,
      style: {
        opacity,
        pointerEvents: isHiddenOnCompact || (!orbitMetrics.compact && isBehind) ? 'none' : 'auto',
        zIndex: orbitMetrics.compact
          ? 60 - Math.round(compactDistance * 18)
          : (isBehind ? 10 + Math.round(depth * 8) : 40 + Math.round(depth * 12)),
        transform: `translate(-50%, -50%) translate(${x}px, ${y}px) scale(${scale})`,
      },
    }
  })

  return (
    <section className="relative overflow-hidden bg-[linear-gradient(145deg,#000047,#24238f_58%,#087f9d)] px-4 py-6 sm:px-6 lg:px-8 lg:py-6">
      <ExpertWorldMap className="hidden" />

      <div className="relative mx-auto max-w-7xl">
        <div
          className="expert-orbit-stage"
          onMouseEnter={() => setIsOrbitPaused(true)}
          onMouseLeave={() => setIsOrbitPaused(false)}
          onFocus={() => setIsOrbitPaused(true)}
          onBlur={() => setIsOrbitPaused(false)}
        >
          <div className="expert-orbit-title text-white">
            <img src="/favicon.png" alt="Magnafic icon" className="mx-auto h-10 w-10 object-contain sm:h-14 sm:w-14 lg:h-16 lg:w-16" />
            <h2 className="text-xl font-bold leading-tight sm:text-2xl lg:text-3xl">
              World's first, <br/>Global Community of Experts Offering End-to-End Consulting for FMCG and Consumer Goods Businesses
            </h2>
          </div>

          <div className="expert-orbit-ring" />

          <button
            type="button"
            onClick={() => rotateOrbit(-1)}
            className="expert-orbit-arrow expert-orbit-arrow--left"
            aria-label="Previous expert"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            type="button"
            onClick={() => rotateOrbit(1)}
            className="expert-orbit-arrow expert-orbit-arrow--right"
            aria-label="Next expert"
          >
            <ChevronRight className="h-6 w-6" />
          </button>

          {orbitCards.map(({ mentor, style }) => (
            <div key={mentor._id} className="expert-orbit-card" style={style}>
              <ExpertCard mentor={mentor} compact className={orbitMetrics.compact ? 'h-[18.5rem] w-52' : 'h-[18.75rem] w-56'} />
            </div>
          ))}

          <div className="expert-orbit-globe" aria-hidden="true">
            <img src="/Globe_1.png" alt="" className="expert-orbit-globe__image" />
          </div>
        </div>

      </div>
    </section>
  )
}
