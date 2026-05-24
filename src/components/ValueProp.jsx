import { CheckCircle2, MinusCircle } from 'lucide-react'

const growthRules = [
  'No bloated teams',
  'No generic playbooks',
  'Just outcome-driven expertise'
]

export default function ValueProp() {
  return (
    <section className="relative overflow-hidden px-4 pt-12 sm:px-6 sm:pt-16 lg:px-8">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan/70 to-transparent" />

      <div className="relative mx-auto max-w-7xl">
        <div className="grid items-center gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-0 lg:items-stretch">
          <div className="relative rounded-lg border border-primary-100 bg-white p-5 text-left shadow-xl shadow-primary-900/5 sm:border-0 sm:bg-transparent sm:shadow-none sm:p-0">
            

            <h2 className="mb-5 text-3xl font-extrabold leading-tight text-blue-900 sm:text-4xl">
              Big consulting is too big to evolve.
              <span className="block text-primary-700">Consumer brands cannot afford to wait.</span>
            </h2>

            <div className="mx-auto mb-6 max-w-2xl lg:mx-0">
              <p className="py-6 text-2xl font-semibold leading-relaxed text-gray-700">
                In today's dynamic marketplace, growth requires agility, intelligence, and execution, not endless presentations and oversized consulting structures.
              </p>
              
            </div>

            <h3 className="mb-4 text-xl font-extrabold leading-tight text-gray-950 sm:text-2xl">
              Modern expertise for modern growth:
            </h3>

            <ul className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              {growthRules.map((rule, index) => (
                <li
                  key={rule}
                  className="flex items-start justify-start gap-2 rounded-lg border border-gray-100 bg-gradient-to-r from-primary-50 to-cyan-50 px-4 py-3 text-lg font-extrabold text-gray-800 shadow-sm"
                >
                  {index < 2 ? (
                    <MinusCircle className="h-4 w-4 flex-shrink-0 text-primary-600" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-cyan-700" />
                  )}
                  <span>{rule}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="relative mx-auto w-full max-w-md lg:max-w-none bg-white p-0 lg:h-full">
            <img
              src="/Image.png"
              alt="Magnafic Banner"
              className="relative mx-auto h-auto max-h-[320px] w-full object-contain lg:h-full lg:max-h-none"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
