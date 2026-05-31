const CompanyLogos = () => {
  const logos = [
    { src: '/Company Logos/1-2.png', name: 'Company 1' },
    { src: '/Company Logos/11.jpg', name: 'Company 11' },
    { src: '/Company Logos/14.jpg', name: 'Company 14' },
    { src: '/Company Logos/15.jpg', name: 'Company 15' },
    { src: '/Company Logos/2.jpg', name: 'Company 2 JPG' },
    { src: '/Company Logos/2.png', name: 'Company 2' },
    { src: '/Company Logos/3.png', name: 'Company 3' },
    { src: '/Company Logos/4.png', name: 'Company 4' },
    { src: '/Company Logos/5.jpg', name: 'Company 5 JPG' },
    { src: '/Company Logos/5.png', name: 'Company 5' },
    { src: '/Company Logos/6.png', name: 'Company 6' },
    { src: '/Company Logos/7.png', name: 'Company 7' },
    { src: '/Company Logos/8-2.png', name: 'Company 8' },
    { src: '/Company Logos/9.png', name: 'Company 9' },
  ]
  const midpoint = Math.ceil(logos.length / 2)
  const firstRow = logos.slice(0, midpoint)
  const secondRow = logos.slice(midpoint)

  const LogoTile = ({ logo }) => (
    <div className="mx-2 flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border border-white/80 bg-white p-3 shadow-xl shadow-primary-900/10 ring-1 ring-gray-100 sm:mx-3 sm:h-24 sm:w-24">
      <img
        src={logo.src}
        alt={logo.name}
        className="max-h-12 max-w-full object-contain sm:max-h-16"
      />
    </div>
  )

  return (
    <section className="relative overflow-hidden bg-white px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
      <style>{`
        @keyframes logo-marquee-left {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }

        @keyframes logo-marquee-right {
          from { transform: translateX(-50%); }
          to { transform: translateX(0); }
        }

        .logo-marquee-left {
          animation: logo-marquee-left 28s linear infinite;
        }

        .logo-marquee-right {
          animation: logo-marquee-right 28s linear infinite;
        }
      `}</style>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_8%_12%,rgba(0,255,255,0.18),transparent_26%),radial-gradient(circle_at_92%_25%,rgba(53,52,205,0.16),transparent_28%),linear-gradient(180deg,#ffffff,rgba(247,249,255,0.85))]" />

      <div className="relative mx-auto max-w-7xl">
        <div className="mb-10 text-center">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-primary-600">Trusted By</p>
          <h2 className="mt-3 text-2xl font-bold text-gray-950 sm:text-3xl">
            Companies our experts have helped scale
          </h2>
        </div>

        <div className="space-y-7 overflow-hidden pb-5">
          <div className="flex w-max logo-marquee-left">
            {[...firstRow, ...firstRow, ...firstRow].map((logo, index) => (
              <LogoTile key={`${logo.src}-top-${index}`} logo={logo} />
            ))}
          </div>

          <div className="flex w-max logo-marquee-right">
            {[...secondRow, ...secondRow, ...secondRow].map((logo, index) => (
              <LogoTile key={`${logo.src}-bottom-${index}`} logo={logo} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default CompanyLogos
