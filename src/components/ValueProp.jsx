import { CheckCircle2, MinusCircle } from 'lucide-react'
import CopilotPromptPanel from './CopilotPromptPanel'

const growthRules = [
  'No bloated teams',
  'No generic playbooks',
  'Just outcome-driven expertise'
]

export default function ValueProp() {
  return (
    <section className="relative overflow-hidden bg-[#000047] px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_72%_50%,rgba(0,255,255,0.1),transparent_38%)]" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan/70 to-transparent" />

      <div className="relative mx-auto max-w-7xl">
        <div className="grid items-center gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:gap-8 lg:items-stretch">
          <div className="relative p-1 text-center sm:text-left lg:py-4">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_18%,rgba(0,255,255,0.14),transparent_42%)]" />
            
            <div className="relative">
            <h2 className="mb-4 text-center text-2xl font-extrabold leading-tight text-white sm:text-left sm:text-3xl">
              Big consulting is too big to evolve.
              <span className="block text-cyan-300">Consumer brands cannot afford to wait.</span>
            </h2>

            <div className="mx-auto mb-6 max-w-2xl text-center lg:mx-0 lg:text-left">
              <p className="py-4 text-base font-semibold leading-7 text-white/85 sm:text-lg">
                In today's dynamic marketplace, growth requires agility, intelligence, and execution, not endless presentations and oversized consulting structures.
              </p>
              
            </div>

            <h3 className="mb-4 text-lg font-extrabold leading-tight text-white sm:text-xl">
              Modern expertise for modern growth:
            </h3>

            <ul className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              {growthRules.map((rule, index) => (
                <li
                  key={rule}
                  className={`flex items-start justify-start gap-2 py-1 text-sm font-extrabold sm:text-base ${index < 2 ? 'text-red-100' : 'text-white'}`}
                >
                  {index < 2 ? (
                    <MinusCircle className="h-4 w-4 flex-shrink-0 text-red-300" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-cyan-300" />
                  )}
                  <span>{rule}</span>
                </li>
              ))}
            </ul>
            </div>
          </div>

          <CopilotPromptPanel className="lg:h-full" />
        </div>
      </div>
    </section>
  )
}
