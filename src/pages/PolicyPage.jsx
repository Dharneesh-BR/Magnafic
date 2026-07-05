import {Link} from 'react-router-dom'
import SEO from '../components/SEO'

const CONTACT_EMAIL = 'dharneesh@magnafic.com'
const LAST_UPDATED = 'July 5, 2026'

const policies = {
  terms: {
    title: 'Terms & Conditions',
    path: '/terms-and-conditions',
    description: 'Terms and conditions for using Magnafic services, programs, products, dashboards, workshops, and payment flows.',
    intro: 'These Terms & Conditions govern your access to and use of Magnafic websites, dashboards, programs, expert services, workshops, digital products, and related offerings.',
    sections: [
      {
        heading: '1. Acceptance of Terms',
        body: [
          'By accessing our website, creating an account, submitting a form, booking a consultation, joining a community or program, purchasing a product, or making a payment, you agree to these Terms & Conditions.',
          'If you do not agree with these terms, please do not use our website or services.',
        ],
      },
      {
        heading: '2. About Magnafic',
        body: [
          'Magnafic provides business consulting, expert services, founder programs, digital transformation support, community experiences, workshops, learning programs, and related products for businesses, founders, consultants, and professionals.',
          'Specific services, deliverables, timelines, and fees may be governed by separate proposals, statements of work, invoices, program pages, or written agreements. If there is a conflict, the specific written agreement will prevail for that engagement.',
        ],
      },
      {
        heading: '3. Eligibility and Account Responsibility',
        body: [
          'You must provide accurate, current, and complete information when submitting forms, registering, booking services, or creating an account.',
          'You are responsible for maintaining the confidentiality of your login credentials and for all activity under your account.',
          'You must not misuse our website, dashboards, content, forms, payment systems, or communication channels.',
        ],
      },
      {
        heading: '4. Services, Programs, and Bookings',
        body: [
          'Consultations, workshops, expert services, programs, and community access are subject to availability, eligibility, payment status, and any additional terms shared at the time of booking or purchase.',
          'We may reschedule, modify, pause, or cancel a session, workshop, or program where required due to operational, expert availability, technical, compliance, or business reasons. We will make reasonable efforts to notify affected participants.',
          'Business outcomes depend on your business context, execution, market conditions, team capacity, and other factors. We do not guarantee a specific revenue, valuation, fundraising, or growth outcome.',
        ],
      },
      {
        heading: '5. Payments and Taxes',
        body: [
          'Fees shown on the website, ad pages, invoices, or payment links may be in Indian Rupees unless stated otherwise.',
          'Payments may be processed through third-party payment providers such as Razorpay. Their terms, payment methods, risk checks, and security controls may also apply.',
          'You are responsible for providing correct billing details and paying any applicable taxes, charges, or fees unless expressly stated otherwise.',
        ],
      },
      {
        heading: '6. Intellectual Property',
        body: [
          'All website content, program frameworks, workshop materials, designs, text, graphics, videos, templates, tools, dashboards, and brand assets are owned by Magnafic or its licensors unless stated otherwise.',
          'You may use materials provided to you only for your internal learning or business use. You must not copy, resell, distribute, publish, train competing systems with, or commercially exploit our content without written permission.',
        ],
      },
      {
        heading: '7. User Submissions and Confidentiality',
        body: [
          'You may submit business details, forms, documents, briefs, questions, project information, and other materials to Magnafic. You confirm that you have the right to share such information.',
          'We will take reasonable care with confidential business information shared with us. However, please do not submit information that you are not authorised to share.',
          'Where consultants, experts, or service partners are involved, relevant information may be shared with them for evaluation, allocation, delivery, and support.',
        ],
      },
      {
        heading: '8. Prohibited Use',
        body: [
          'You must not use our website or services for unlawful, misleading, abusive, fraudulent, harmful, or unauthorised purposes.',
          'You must not attempt to interfere with security, reverse engineer systems, scrape protected data, impersonate others, upload malware, or misuse payment or booking flows.',
        ],
      },
      {
        heading: '9. Third-Party Links and Tools',
        body: [
          'Our website may link to third-party websites, tools, calendar links, video platforms, payment gateways, analytics services, or embedded content.',
          'We are not responsible for third-party websites, services, content, availability, or policies. Your use of third-party tools is subject to their terms.',
        ],
      },
      {
        heading: '10. Limitation of Liability',
        body: [
          'To the maximum extent permitted by applicable law, Magnafic will not be liable for indirect, incidental, consequential, special, punitive, or loss-of-profit damages arising from your use of our website or services.',
          'Our aggregate liability for a paid service will not exceed the amount paid by you to Magnafic for that specific service giving rise to the claim, unless applicable law requires otherwise.',
        ],
      },
      {
        heading: '11. Changes to Terms',
        body: [
          'We may update these Terms & Conditions from time to time. The updated version will be posted on this page with the latest update date.',
          'Continued use of our website or services after changes are posted means you accept the updated terms.',
        ],
      },
      {
        heading: '12. Governing Law and Disputes',
        body: [
          'These terms are governed by the laws of India. Subject to applicable law, disputes will be handled by the courts having jurisdiction over Magnafic\'s registered place of business.',
          `For questions about these terms, contact us at ${CONTACT_EMAIL}.`,
        ],
      },
    ],
  },
  privacy: {
    title: 'Privacy Policy',
    path: '/privacy-policy',
    description: 'Privacy policy explaining how Magnafic collects, uses, shares, protects, and retains personal information.',
    intro: 'This Privacy Policy explains how Magnafic collects, uses, stores, shares, and protects personal information when you use our website, dashboards, forms, programs, payments, and services.',
    sections: [
      {
        heading: '1. Information We Collect',
        body: [
          'We may collect your name, email address, phone number, company name, role, city, business details, enquiry information, community application details, booking details, payment status, uploaded documents, messages, and account information.',
          'We may also collect technical information such as device type, browser, IP address, pages visited, referral source, approximate location, cookies, and usage logs.',
        ],
      },
      {
        heading: '2. How We Collect Information',
        body: [
          'We collect information when you fill forms, create an account, book calls, register for programs, make payments, upload documents, subscribe to updates, contact us, or interact with our dashboards.',
          'Some information may be collected automatically through cookies, analytics tools, hosting logs, security tools, and similar technologies.',
        ],
      },
      {
        heading: '3. How We Use Information',
        body: [
          'We use information to respond to enquiries, provide services, allocate consultants, manage bookings, process payments, run programs, send confirmations, maintain dashboards, verify applications, improve user experience, and support business operations.',
          'We may also use information for security, fraud prevention, legal compliance, analytics, internal reporting, service improvement, and relevant communication about Magnafic offerings.',
        ],
      },
      {
        heading: '4. Payments',
        body: [
          'Payment details may be processed by third-party payment providers such as Razorpay. We do not store full card, UPI, or net banking credentials on our website.',
          'We may receive and store payment-related information such as payment status, amount, order ID, payment ID, registration details, and transaction references for fulfilment, support, accounting, and compliance.',
        ],
      },
      {
        heading: '5. Sharing of Information',
        body: [
          'We may share necessary information with consultants, experts, delivery partners, payment providers, email providers, cloud hosting providers, analytics services, customer support tools, legal or compliance advisors, and authorised internal team members.',
          'We do not sell your personal information. We share information only where needed to operate, deliver, secure, improve, or comply with our services and obligations.',
        ],
      },
      {
        heading: '6. Cookies and Analytics',
        body: [
          'We may use cookies and similar technologies to remember preferences, maintain sessions, understand website performance, improve content, and analyse visitor behaviour.',
          'You can control cookies through your browser settings. Some features may not work properly if cookies are disabled.',
        ],
      },
      {
        heading: '7. Data Retention',
        body: [
          'We retain information for as long as necessary to provide services, maintain accounts, complete transactions, resolve disputes, comply with legal obligations, maintain business records, and improve our services.',
          'When information is no longer required, we will delete, anonymise, or securely archive it in accordance with applicable requirements and operational needs.',
        ],
      },
      {
        heading: '8. Security',
        body: [
          'We use reasonable technical, organisational, and administrative measures to protect information against unauthorised access, misuse, loss, alteration, or disclosure.',
          'No internet-based system is completely secure. You are responsible for protecting your account credentials and using secure devices and networks.',
        ],
      },
      {
        heading: '9. Your Choices and Rights',
        body: [
          'Subject to applicable law, you may request access, correction, update, deletion, withdrawal of consent, or grievance redressal regarding your personal information.',
          `To make a privacy request, contact us at ${CONTACT_EMAIL}. We may need to verify your identity before acting on the request.`,
        ],
      },
      {
        heading: '10. Children',
        body: [
          'Our services are intended for businesses, founders, consultants, professionals, and adult users. We do not knowingly collect personal information from children for targeted commercial services.',
          'If you believe a child has provided personal information to us without appropriate consent, please contact us so we can review and take appropriate action.',
        ],
      },
      {
        heading: '11. Cross-Border Processing',
        body: [
          'Our service providers, cloud systems, analytics tools, and communication tools may process information in India or other jurisdictions, subject to applicable law and contractual safeguards where required.',
        ],
      },
      {
        heading: '12. Updates and Contact',
        body: [
          'We may update this Privacy Policy from time to time. The latest version will be posted on this page.',
          `For privacy questions or requests, contact us at ${CONTACT_EMAIL}.`,
        ],
      },
    ],
  },
  refund: {
    title: 'Refund & Cancellation Policy',
    path: '/refund-cancellation-policy',
    description: 'Refund and cancellation policy for Magnafic workshops, programs, consulting services, digital products, and payments.',
    intro: 'This Refund & Cancellation Policy explains how cancellations, rescheduling, and refunds are handled for Magnafic workshops, programs, expert services, consulting engagements, digital products, and related payments.',
    sections: [
      {
        heading: '1. General Policy',
        body: [
          'Refunds and cancellations depend on the type of service purchased, the stage of delivery, and the specific terms communicated on the relevant page, proposal, invoice, or agreement.',
          'Where a specific written agreement or invoice contains refund or cancellation terms, those terms will apply to that purchase.',
        ],
      },
      {
        heading: '2. Workshops, Webinars, and Paid Sessions',
        body: [
          'For live workshops, webinars, and paid sessions, cancellation or refund requests must be raised at least 24 hours before the scheduled start time unless the page or offer states otherwise.',
          'If you miss a live session, join late, or are unable to attend due to personal, device, network, or scheduling reasons, the payment may be non-refundable. We may, at our discretion, provide access to a replay, future session, or alternate support where available.',
          'Promotional, low-ticket, trial, or limited-time offers may be non-refundable unless expressly stated otherwise on the offer page.',
        ],
      },
      {
        heading: '3. Consulting Services and Expert Engagements',
        body: [
          'Consulting calls, strategy sessions, implementation support, expert services, and project engagements may be rescheduled if requested at least 24 hours before the confirmed time, subject to expert availability.',
          'Once consulting work has started, strategy time has been blocked, deliverables have been prepared, or expert allocation has been completed, fees may be partially or fully non-refundable depending on the work completed.',
          'For project-based consulting, refunds, credits, milestones, and termination terms will follow the signed proposal, statement of work, invoice, or written agreement.',
        ],
      },
      {
        heading: '4. Programs and Communities',
        body: [
          'Program and community fees may be refundable only if a refund request is made before access is granted, onboarding begins, or program materials, sessions, groups, dashboards, or resources are made available.',
          'After access to program content, community spaces, live sessions, recordings, templates, or private groups is provided, fees may be non-refundable unless required by applicable law or expressly stated in writing.',
        ],
      },
      {
        heading: '5. Digital Products and Downloadable Materials',
        body: [
          'Digital products, downloadable resources, templates, recordings, playbooks, and similar materials are generally non-refundable once access, download, or delivery has been provided.',
          'If there is a technical issue preventing access, please contact us. We will make reasonable efforts to restore access, provide an alternate delivery method, or offer an appropriate resolution.',
        ],
      },
      {
        heading: '6. Duplicate or Failed Payments',
        body: [
          'If you are charged twice for the same transaction or a payment succeeds but access/registration is not confirmed, contact us with your payment details.',
          'Verified duplicate payments or confirmed payment errors will be refunded to the original payment method where possible.',
        ],
      },
      {
        heading: '7. Refund Processing Timeline',
        body: [
          'Approved refunds will generally be initiated within 7 to 10 business days after verification.',
          'The actual credit timeline depends on the payment provider, bank, card network, UPI provider, or wallet used for the transaction.',
          'Payment gateway charges, taxes, bank charges, or processing fees may be deducted where applicable and legally permitted.',
        ],
      },
      {
        heading: '8. Cancellation by Magnafic',
        body: [
          'If Magnafic cancels a paid workshop, session, program, or service before delivery, we may offer a rescheduled date, credit, alternate service, or refund depending on the situation.',
          'We are not responsible for indirect costs such as travel, accommodation, opportunity cost, lost profit, or other consequential losses related to a cancellation or reschedule.',
        ],
      },
      {
        heading: '9. How to Request a Refund or Cancellation',
        body: [
          `Email ${CONTACT_EMAIL} with your name, registered email address, phone number, service/program name, payment ID or order ID, payment date, and reason for the request.`,
          'We may ask for additional details to verify the transaction and evaluate the request.',
        ],
      },
    ],
  },
}

export default function PolicyPage({type}) {
  const policy = policies[type] || policies.terms

  return (
    <div className="bg-[#fbfaf9] text-gray-950">
      <SEO title={policy.title} description={policy.description} path={policy.path} />
      <section className="bg-[#000047] px-4 py-16 text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl text-center">
          <p className="text-sm font-bold uppercase tracking-[0.22em] text-cyan-200">Magnafic Policies</p>
          <h1 className="mt-4 text-4xl font-black leading-tight sm:text-5xl">{policy.title}</h1>
          <p className="mx-auto mt-5 max-w-3xl text-base leading-7 text-white/80 sm:text-lg">{policy.intro}</p>
          <p className="mt-5 text-sm font-semibold text-cyan-100">Last updated: {LAST_UPDATED}</p>
        </div>
      </section>

      <section className="px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[280px_1fr]">
          <aside className="h-fit rounded-lg border border-cyan-100 bg-white p-5 shadow-sm lg:sticky lg:top-24">
            <h2 className="text-sm font-black uppercase tracking-[0.14em] text-[#000047]">Policy Pages</h2>
            <nav className="mt-4 space-y-2 text-sm font-semibold text-gray-700">
              <Link className="block rounded-md px-3 py-2 hover:bg-cyan-50 hover:text-[#000047]" to="/terms-and-conditions">Terms & Conditions</Link>
              <Link className="block rounded-md px-3 py-2 hover:bg-cyan-50 hover:text-[#000047]" to="/privacy-policy">Privacy Policy</Link>
              <Link className="block rounded-md px-3 py-2 hover:bg-cyan-50 hover:text-[#000047]" to="/refund-cancellation-policy">Refund & Cancellation Policy</Link>
            </nav>
          </aside>

          <article className="rounded-lg border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
            <div className="space-y-8">
              {policy.sections.map((section) => (
                <section key={section.heading}>
                  <h2 className="text-xl font-black leading-7 text-[#000047] sm:text-2xl">{section.heading}</h2>
                  <div className="mt-3 space-y-3 text-base leading-7 text-gray-700">
                    {section.body.map((paragraph) => (
                      <p key={paragraph}>{paragraph}</p>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </article>
        </div>
      </section>
    </div>
  )
}
