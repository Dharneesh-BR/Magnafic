// Add future markers as: { id, label, xPercent, yPercent }.
const mapLocations = []

export default function ExpertWorldMap() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(0,255,255,0.18),transparent_32%),radial-gradient(circle_at_85%_80%,rgba(53,52,205,0.45),transparent_35%)]" />
      <div className="absolute left-1/2 top-1/2 w-[68rem] max-w-[115%] -translate-x-1/2 -translate-y-1/2 opacity-[0.14] sm:opacity-[0.18]">
        <img
          src="/world-map.svg"
          alt=""
          className="block h-auto w-full brightness-0 invert"
        />

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
