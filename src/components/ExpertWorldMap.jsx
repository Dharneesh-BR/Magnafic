// Add future markers as: { id, label, xPercent, yPercent }.
const mapLocations = []

export default function ExpertWorldMap({ className = '' }) {
  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`} aria-hidden="true">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(0,255,255,0.14),transparent_30%),radial-gradient(circle_at_78%_50%,rgba(0,255,255,0.18),transparent_34%),linear-gradient(180deg,rgba(0,0,28,0.28),rgba(0,0,71,0.12))]" />
      <div className="absolute left-1/2 top-[58%] aspect-square w-[34rem] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-full border border-cyan-100/50 bg-[#020a3b]/85 shadow-[0_0_120px_rgba(0,255,255,0.44),0_0_32px_rgba(255,255,255,0.20),inset_0_0_70px_rgba(0,255,255,0.30)] sm:w-[48rem] lg:w-[62rem]">
        <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_34%_24%,rgba(255,255,255,0.34),transparent_18%),radial-gradient(circle_at_58%_52%,rgba(0,255,255,0.28),transparent_48%),linear-gradient(115deg,rgba(255,255,255,0.20),transparent_36%,rgba(0,0,38,0.42)_76%)]" />
        <img
          src="/world-map.svg"
          alt=""
          className="absolute left-1/2 top-1/2 h-auto w-[215%] -translate-x-[61%] -translate-y-[51%] brightness-0 invert opacity-75 drop-shadow-[0_0_14px_rgba(255,255,255,0.38)]"
        />
        <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_44%_38%,transparent_0,transparent_42%,rgba(0,0,71,0.16)_62%,rgba(0,0,0,0.48)_100%)]" />
        <div className="absolute inset-0 rounded-full ring-2 ring-inset ring-cyan-100/55" />

        {mapLocations.map(location => (
          <span
            key={location.id}
            className="absolute flex h-4 w-4 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-cyan-300 shadow-[0_0_0_6px_rgba(0,255,255,0.18),0_0_16px_rgba(0,255,255,0.8)]"
            style={{ left: `${location.xPercent}%`, top: `${location.yPercent}%` }}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-[#000047]" />
          </span>
        ))}
      </div>
    </div>
  )
}
