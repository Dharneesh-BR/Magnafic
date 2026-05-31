import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function DescribeProblemCTA() {
  return (
    <section className="px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl overflow-hidden rounded-3xl bg-[#000047] shadow-2xl shadow-primary-900/15">
        <div className="relative px-6 py-10 sm:px-10 lg:px-12">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_20%,rgba(0,255,255,0.20),transparent_28%),radial-gradient(circle_at_90%_30%,rgba(255,255,255,0.16),transparent_30%)]" />
          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-3xl">
              <h2 className="text-3xl font-bold leading-tight text-white sm:text-4xl">Describe your problem</h2>
              <p className="mt-3 text-base leading-7 text-cyan-50 sm:text-lg">
                Answer a few quick questions so we can understand your challenge and guide you to the right expertise.
              </p>
            </div>

            <Link
              to="/describe-your-problem"
              className="inline-flex w-fit items-center justify-center gap-2 whitespace-nowrap rounded-full bg-white px-6 py-3 font-bold text-primary-700 shadow-lg shadow-cyan-950/20 transition hover:-translate-y-0.5 hover:bg-cyan-50"
            >
              Start now
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
