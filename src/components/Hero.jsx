import { ArrowRight, ChevronRight, Sparkles, Target, Zap } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function Hero() {
  return (
    <section className="premium-hero relative isolate mx-2 mt-3 overflow-hidden overflow-x-hidden rounded-2xl px-4 pb-8 pt-6 text-white sm:mx-6 sm:px-6 sm:pb-10 lg:mx-8 lg:px-8">
      <div className="premium-hero__texture pointer-events-none absolute inset-0 z-0 rounded-3xl" />
      <div className="premium-hero__sheen pointer-events-none absolute inset-0 z-0 rounded-3xl" />
      <div className="pointer-events-none absolute inset-x-6 top-0 z-0 h-px bg-gradient-to-r from-transparent via-[#d9bc75]/70 to-transparent" />
      <div className="pointer-events-none absolute bottom-0 left-1/2 z-0 h-px w-[82%] -translate-x-1/2 bg-gradient-to-r from-transparent via-white/20 to-transparent" />

      <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-8 lg:min-h-[calc(100vh-4rem)] lg:grid-cols-[1.04fr_.96fr] lg:gap-8">
        <div className="mx-auto max-w-xl text-center lg:mx-0 lg:text-left">
          

          <h1 className="mx-auto max-w-2xl pb-4 pt-12 text-4xl font-extrabold leading-[1.08] tracking-normal text-white lg:mx-0 sm:pt-6 sm:text-5xl lg:text-[2.75rem]">
            Top 1% <br/>
            <span className="text-cyan">Elite Consultants</span>  <br className="sm:hidden" />
            for Scaling <br className="sm:hidden" /> FMCG & Consumer Business
          </h1>

          <p className="mx-auto mt-4 max-w-2xl py-3 text-2xl font-bold leading-snug text-cyan lg:mx-0 sm:text-3xl">
            Where <br className="sm:hidden" />Conscious Strategy <br/>meets AI-Powered <br className="sm:hidden" /><span className="text-cyan">10X Growth</span>.
          </p>
            <p className="py-3 text-2xl font-bold leading-7 text-slate-300 sm:text-lg">
              Magnafic gives brands <br className="sm:hidden" />on-demand access to experienced <span className="text-cyan">Fractional CXOs</span> and <span className="text-cyan">Consultants</span> tailored to their exact stage of growth.
            </p>

            <p className="mx-auto mt-4 max-w-2xl py-3 text-2xl font-semibold leading-snug text-cyan lg:mx-0 sm:text-2xl">
            Welcome to New Era of Consulting 4.0
          </p>
          

          <div className="mt-6 flex flex-col items-center gap-3 pb-8 sm:flex-row sm:justify-center sm:pb-0 lg:items-start lg:justify-start">
            <Link
              to="/experts"
              className="group inline-flex w-72 items-center justify-center gap-2 rounded-full bg-gradient-primary px-6 py-3 text-lg font-bold text-white sm:w-48 sm:px-8 sm:py-4 sm:text-lg"
            >
              Find Experts
            </Link>
            <Link
              to="/contact"
              className="group inline-flex w-72 items-center justify-center gap-2 rounded-full bg-gradient-primary px-6 py-3 text-lg font-bold text-white sm:w-48 sm:px-8 sm:py-4 sm:text-lg"
            >
              Let's Talk
            </Link>
          </div>

        </div>

        <div className="hero-visual relative mx-auto w-full max-w-[300px] sm:max-w-[400px] lg:max-w-[430px]">
          <img src="/Banner_1.png" alt="Mind Magna Banner" className="hero-visual__image relative z-10 mx-auto mt-2 h-auto max-w-[230px] sm:mt-12 sm:max-w-[320px] lg:max-w-[350px]" />
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
