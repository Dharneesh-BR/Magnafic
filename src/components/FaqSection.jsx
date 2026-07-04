import { ChevronDown } from 'lucide-react'
import { commonFaqs } from '../data/commonFaqs'

export default function FaqSection({
  title = 'Frequently Asked Questions',
  intro = "Got questions? We've got answers to help you make the most of your MAGNA experience",
  faqs = commonFaqs,
}) {
  return (
    <section className="bg-[#fbfaf9] px-4 py-12">
      <div className="mx-auto max-w-sm overflow-hidden rounded-none bg-gradient-to-r from-[#3533cd] to-[#00d9e8] px-5 py-9 text-center sm:max-w-3xl sm:px-8 sm:py-12">
        <h2 className="mx-auto max-w-xs text-3xl font-extrabold leading-[1.12] text-white sm:max-w-lg sm:text-5xl sm:leading-tight">
          {title}
        </h2>
        {intro && (
          <p className="mx-auto mt-6 max-w-sm whitespace-pre-line text-xl font-normal leading-7 text-white sm:max-w-xl sm:text-2xl sm:leading-9">
            {intro}
          </p>
        )}
        <div className="mt-8 space-y-4 text-left">
          {faqs.map((faq, index) => (
            <details key={`${faq.question}-${index}`} className="group min-w-0 rounded-xl bg-white p-4 shadow-lg shadow-blue-950/10 ring-1 ring-white/40">
              <summary className="flex min-w-0 cursor-pointer list-none items-center justify-between gap-4 text-base font-bold leading-6 text-gray-950 sm:text-lg">
                <span className="min-w-0">{faq.question}</span>
                <ChevronDown className="h-5 w-5 shrink-0 text-primary-600 transition group-open:rotate-180" />
              </summary>
              {faq.answer && <p className="mt-4 border-t border-gray-100 pt-4 text-base leading-6 text-gray-600">{faq.answer}</p>}
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}
