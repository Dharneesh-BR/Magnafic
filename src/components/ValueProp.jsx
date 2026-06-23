import { CheckCircle2 } from 'lucide-react'
import CopilotPromptPanel from './CopilotPromptPanel'

const growthRules = [
'Reduce operating costs by 50%',
'Make critical business decisions 70% faster',
'Reduce consulting costs by 80% (vs traditional BIG consulting models)'
]

export default function ValueProp() {
  return (
    <section className="relative overflow-hidden bg-[#000047] px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_72%_50%,rgba(0,255,255,0.1),transparent_38%)]" />

      <div className="relative mx-auto max-w-7xl">
        <div className="grid items-center gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:gap-8 lg:items-stretch">
          <div className="relative p-1 text-center sm:text-left lg:py-8">
            
            
            <div className="relative">
            <h2 className="mb-8 text-center text-2xl font-extrabold leading-tight text-white sm:text-left sm:text-3xl">
              The Next-Gen <br/>Consulting is here - 
              <span className=" block text-cyan-300"> Top 1% Experts + Agentic AI.</span>
            </h2>

            <ul className="mx-auto grid max-w-xl gap-4 text-left sm:mx-0 sm:grid-cols-1 lg:gap-5">
              {growthRules.map((rule) => (
                <li
                  key={rule}
                  className="flex items-start gap-3 px-1 py-1 text-base font-extrabold leading-6 text-white sm:px-0 sm:text-xl sm:leading-7"
                >
                  <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-cyan-300 sm:h-5 sm:w-5" />
                  <span>{rule}</span>
                </li>
              ))}
            </ul>
            </div>
            <div className="mx-auto mb-6 max-w-2xl text-center lg:mx-0 lg:text-left">
              <p className="py-6 text-xl font-extrabold leading-7 text-white/85 sm:text-xl">
                No Hourly Billing. No Bloated Teams. No Generic Playbooks.
              </p>
            </div>

          </div>

          <CopilotPromptPanel className="lg:h-full" />
        </div>
      </div>
    </section>
  )
}
