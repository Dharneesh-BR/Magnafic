import { ArrowRight, ChevronRight, Sparkles, Target, Zap } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function Hero() {
  return (
    <section className="premium-hero relative isolate overflow-hidden overflow-x-hidden px-4 pb-4 pt-4 text-white sm:px-6 sm:pb-10 lg:px-8 rounded-3xl mx-4 sm:mx-6 lg:mx-8 mt-4">
      <div className="premium-hero__texture pointer-events-none absolute inset-0 z-0 rounded-3xl" />
      <div className="premium-hero__sheen pointer-events-none absolute inset-0 z-0 rounded-3xl" />
      <div className="pointer-events-none absolute inset-x-6 top-0 z-0 h-px bg-gradient-to-r from-transparent via-[#d9bc75]/70 to-transparent" />
      <div className="pointer-events-none absolute bottom-0 left-1/2 z-0 h-px w-[82%] -translate-x-1/2 bg-gradient-to-r from-transparent via-white/20 to-transparent" />

      <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-10 lg:min-h-[calc(100vh-4rem)] lg:grid-cols-[1.04fr_.96fr] lg:gap-8">
        <div className="max-w-xl">
          

          <h1 className="max-w-2xl text-4xl font-extrabold leading-[1.08] tracking-normal text-white sm:text-5xl pb-4 pt-2 lg:text-[2.75rem]">
            Top 1% Elite Experts for Scaling Consumer Brands
          </h1>

          <p className="mt-3 max-w-2xl text-2xl font-semibold leading-snug text-cyan sm:text-2xl py-2">
            Where Conscious Strategy Meets AI-Powered 10X Growth.
          </p>

          
          
            <p className="text-lg font-semibold leading-6 text-slate-200 py-2">
              Say goodbye to generic frameworks, big firm bureaucracy, and bloated pyramid staffing models packed with Junior Analysts.<br/>
              Modern consumer brands need speed, flexibility, intelligence, and execution.
            </p>

            <p className="text-lg font-semibold leading-6 text-slate-300 py-2">
              Magnafic gives brands on-demand access to experienced <span className="text-cyan">CPG Leaders</span>, <span className="text-cyan">Fractional CXOs</span> & <span className="text-cyan">AI systems</span> tailored to their exact stage of growth.
              
            </p>

            <p className="mt-3 max-w-2xl text-2xl font-semibold leading-snug text-cyan sm:text-2xl py-2">
            Welcome to New Era of Consulting 4.0
          </p>
          

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link
              to="/experts"
              className="group inline-flex text-xl rounded-full items-center justify-center gap-2 bg-gradient-primary text-white px-4 py-3 text-sm font-bold"
            >
              <div className="h-5 w-5" />
              Find Experts
              <div className="h-8 w-8 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              to="/contact"
              className="group inline-flex text-xl rounded-full items-center justify-center gap-2 bg-gradient-primary text-white px-4 py-3 text-sm font-bold"
            >
              <div className="h-5 w-5" />
              Let's Talk
              <div className="h-8 w-8 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

        </div>

        <div className="hero-visual relative mx-auto w-full max-w-[360px] sm:max-w-[400px] lg:max-w-[430px]">
          <img src="/Banner_1.png" alt="Mind Magna Banner" className="hero-visual__image relative z-10 h-auto max-w-[280px] sm:max-w-[320px] lg:max-w-[350px] mx-auto mt-12" />
          <img src="/icon_1.png" alt="" aria-hidden="true" className="hero-floating-icon hero-floating-icon--one" />
          <img src="/icon_2.png" alt="" aria-hidden="true" className="hero-floating-icon hero-floating-icon--two" />
          <img src="/icon_3.png" alt="" aria-hidden="true" className="hero-floating-icon hero-floating-icon--three" />
          <img src="/icon_4_1.png" alt="" aria-hidden="true" className="hero-floating-icon hero-floating-icon--four" />
          <img src="/icon_5.png" alt="" aria-hidden="true" className="hero-floating-icon hero-floating-icon--five" />
        </div>
      </div>
    </section>
  )
}
