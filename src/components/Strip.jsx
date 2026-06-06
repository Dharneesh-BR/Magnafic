export default function Strip() {
  return (
    <section className="premium-hero relative isolate mx-2 mb-0 mt-3 overflow-hidden overflow-x-hidden rounded-2xl px-4 pb-8 pt-6 text-white sm:mx-6 sm:mb-0 sm:px-6 sm:pb-10 lg:mx-8 lg:px-8">
      <div className="premium-hero__texture pointer-events-none absolute inset-0 z-0 rounded-3xl" />
      <div className="premium-hero__sheen pointer-events-none absolute inset-0 z-0 rounded-3xl" />
      <div className="pointer-events-none absolute inset-x-6 top-0 z-0 h-px bg-gradient-to-r from-transparent via-[#d9bc75]/70 to-transparent" />
      <div className="pointer-events-none absolute bottom-0 left-1/2 z-0 h-px w-[82%] -translate-x-1/2 bg-gradient-to-r from-transparent via-white/20 to-transparent" />

      <div className="relative z-10 max-w-7xl mx-auto text-center">
        <h2 className="text-3xl sm:text-3xl font-extrabold text-white mb-8 sm:mb-6 leading-tight">
          Magnafic is World's first, end-to-end consulting platform <br/>built exclusively for FMCG Business, from Brand strategy to market scale.
        </h2>
      </div>
    </section>
  )
}
