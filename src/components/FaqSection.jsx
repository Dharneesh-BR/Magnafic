import { ChevronDown } from 'lucide-react'
import { commonFaqs } from '../data/commonFaqs'

export default function FaqSection({
  title = 'Frequently Asked Questions',
  intro = "We've got the answers you're looking for.",
  faqs = commonFaqs,
  showImage = false,
  imageSrc = '/faq.png',
  imageAlt = 'Frequently asked questions',
}) {
  return (
    <section className="bg-[#fbfaf9] px-4 py-12">
      <div className="mx-auto max-w-sm overflow-hidden rounded-none bg-gradient-to-r from-[#3533cd] to-[#00d9e8] px-5 py-9 text-center sm:max-w-3xl sm:px-8 sm:py-12">
        {showImage ? (
          <>
            <div className="grid grid-cols-[minmax(0,60%)_minmax(0,40%)] items-start gap-2 text-left sm:gap-6 md:items-center">
              <div className="min-w-0">
                <h2 className="max-w-xs text-3xl font-extrabold leading-[1.12] text-white sm:max-w-lg sm:text-5xl sm:leading-tight">
                  {title}
                </h2>
              </div>
              <img
                src={imageSrc}
                alt={imageAlt}
                className="-mr-4 mt-1 ml-auto w-full max-w-[8.75rem] object-contain sm:mr-0 sm:mt-0 sm:max-w-[11rem] md:ml-4 md:mr-auto md:max-w-[13rem]"
              />
            </div>
            {intro && (
              <p className="mt-6 max-w-sm whitespace-pre-line text-left text-xl font-normal leading-7 text-white sm:max-w-xl sm:text-2xl sm:leading-9">
                {intro}
              </p>
            )}
          </>
        ) : (
          <>
            <h2 className="mx-auto max-w-xs text-3xl font-extrabold leading-[1.12] text-white sm:max-w-lg sm:text-5xl sm:leading-tight">
              {title}
            </h2>
            {intro && (
              <p className="mx-auto mt-6 max-w-sm whitespace-pre-line text-xl font-normal leading-7 text-white sm:max-w-xl sm:text-2xl sm:leading-9">
                {intro}
              </p>
            )}
          </>
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
