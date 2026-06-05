import { Globe2, MapPin } from 'lucide-react'

// Add future markers as: { id, label, xPercent, yPercent }.
const mapLocations = []

export default function ExpertWorldMap() {
  return (
    <aside className="mx-auto mt-6 w-full max-w-4xl overflow-hidden rounded-3xl bg-[linear-gradient(145deg,#000047,#3534cd_58%,#00bfcf)] p-5 text-white shadow-2xl shadow-primary-900/20 ring-1 ring-white/20 sm:p-6">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/20">
          <Globe2 className="h-6 w-6" />
        </span>
        <div>
          <h3 className="text-xl font-bold">Global Expert Network</h3>
          <p className="mt-1 text-sm leading-5 text-cyan-50">Expert locations around the world</p>
        </div>
      </div>

      <div className="relative mt-6 overflow-hidden rounded-2xl bg-[#05052f]/55 px-3 py-6 ring-1 ring-white/15 sm:px-8 sm:py-8">
        <div className="relative mx-auto max-w-3xl">
          <img
            src="/world-map.svg"
            alt="World map showing the global expert network"
            className="block h-auto w-full opacity-90 brightness-0 invert"
          />

          {mapLocations.map(location => (
            <span
              key={location.id}
              title={location.label}
              aria-label={location.label}
              className="absolute flex h-5 w-5 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-cyan-300 shadow-[0_0_0_7px_rgba(0,255,255,0.18),0_0_18px_rgba(0,255,255,0.8)]"
              style={{ left: `${location.xPercent}%`, top: `${location.yPercent}%` }}
            >
              <span className="h-2 w-2 rounded-full bg-[#000047]" />
            </span>
          ))}
        </div>

        {mapLocations.length === 0 && (
          <div className="absolute inset-x-4 bottom-4 flex items-center justify-center gap-2 rounded-xl bg-[#000047]/80 px-3 py-2 text-center text-xs font-semibold text-cyan-50 backdrop-blur-sm">
            <MapPin className="h-4 w-4 shrink-0 text-cyan-300" />
            Location points will be added soon
          </div>
        )}
      </div>
    </aside>
  )
}
