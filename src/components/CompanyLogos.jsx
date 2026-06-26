const CompanyLogos = () => {
  const logos = [
    { src: '/Company Logos/1-2.png', name: 'Company 1' },
    { src: '/Company Logos/11.jpg', name: 'Company 11' },
    { src: '/Company Logos/3.png', name: 'Company 3' },
    { src: '/Company Logos/4.png', name: 'Company 4' },
    { src: '/Company Logos/7.png', name: 'Company 7' },
    { src: '/Company Logos/8-2.png', name: 'Company 8' },
    { src: '/Company Logos/9.png', name: 'Company 9' },
  ]

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
        @keyframes logo-marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }

        .logo-marquee {
          animation: logo-marquee 26s linear infinite;
        }
      `}</style>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_8%_12%,rgba(0,255,255,0.18),transparent_26%),radial-gradient(circle_at_92%_25%,rgba(53,52,205,0.16),transparent_28%),linear-gradient(180deg,#ffffff,rgba(247,249,255,0.85))]" />

      <div className="relative mx-auto max-w-7xl">
        <div className="mb-10 text-center">
          <p className="text-3xl font-bold text-primary-600">Trusted by leading CPG businesses</p>
          
        </div>

        <div className="overflow-hidden pb-5">
          <div className="flex w-max logo-marquee">
            {[...logos, ...logos, ...logos, ...logos].map((logo, index) => (
              <LogoTile key={`${logo.src}-${index}`} logo={logo} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default CompanyLogos
