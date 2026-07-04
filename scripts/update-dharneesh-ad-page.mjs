import fs from 'node:fs'
import path from 'node:path'
import {fileURLToPath} from 'node:url'
import {createClient} from '@sanity/client'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')
const sourceUrl = 'https://dharneesh.com/magna-business-masterclass'

function readEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return {}

  return Object.fromEntries(
    fs.readFileSync(filePath, 'utf8')
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith('#') && line.includes('='))
      .map((line) => {
        const index = line.indexOf('=')
        return [line.slice(0, index), line.slice(index + 1)]
      }),
  )
}

const env = {...readEnvFile(path.join(rootDir, '.env')), ...process.env}
const token = env.VITE_SANITY_WRITE_TOKEN || env.SANITY_WRITE_TOKEN

if (!token) {
  throw new Error('Missing VITE_SANITY_WRITE_TOKEN or SANITY_WRITE_TOKEN.')
}

const client = createClient({
  projectId: '8pf5fxwy',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token,
})

function key(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 48)
}

function item(title, description, extra = {}) {
  return {_key: key(title), title, description, ...extra}
}

function media(asset, caption = '') {
  return {
    mediaType: 'image',
    image: {
      _type: 'image',
      asset: {
        _type: 'reference',
        _ref: asset._id,
      },
    },
    caption,
  }
}

async function uploadRemoteImage(url, label) {
  const response = await fetch(url)
  if (!response.ok) throw new Error(`Unable to download ${url}: ${response.status}`)

  const buffer = Buffer.from(await response.arrayBuffer())
  const filename = decodeURIComponent(new URL(url).pathname.split('/').pop() || `${key(label)}.png`)

  return client.assets.upload('image', buffer, {
    filename,
    title: label,
    contentType: response.headers.get('content-type') || undefined,
    source: {
      name: 'dharneesh.com',
      id: url,
      url,
    },
  })
}

const imageSources = {
  hero: ['https://dharneesh.com/Magna.png', 'Scale Your Consumer Brand'],
  mentor: ['https://dharneesh.com/Edited-1.png', 'Dharneesh B R'],
  program: ['https://dharneesh.com/Program.png', 'Business Magna Program'],
  programLong: ['https://dharneesh.com/Programs.png', 'Business Magna Program Details'],
  alarm: ['https://dharneesh.com/Alaram.png', 'Alarm'],
  guarantee: ['https://dharneesh.com/Guarntee.webp', 'Guarantee'],
  brand1: ['https://dharneesh.com/Company%20Logos/1-2.png', 'Brand 1'],
  brand2: ['https://dharneesh.com/Company%20Logos/2.png', 'Brand 2'],
  brand3: ['https://dharneesh.com/Company%20Logos/3.png', 'Brand 3'],
  brand4: ['https://dharneesh.com/Company%20Logos/4.png', 'Brand 4'],
  brand5: ['https://dharneesh.com/Company%20Logos/5.png', 'Brand 5'],
  brand6: ['https://dharneesh.com/Company%20Logos/6.png', 'Brand 6'],
  brand7: ['https://dharneesh.com/Company%20Logos/7.png', 'Brand 7'],
  brand8: ['https://dharneesh.com/Company%20Logos/8-2.png', 'Brand 8'],
  brand9: ['https://dharneesh.com/Company%20Logos/9.png', 'Brand 9'],
}

const uploadedEntries = await Promise.all(
  Object.entries(imageSources).map(async ([name, [url, label]]) => [name, await uploadRemoteImage(url, label)]),
)
const assets = Object.fromEntries(uploadedEntries)

const ctaText = 'Join Now @ just ₹1/- 2999'
const programName = 'MAGNA Business Program'
const headline = 'From Bottlenecks to Breakthrough Scale Your Consumer Brand 3X in 90 Days'
const shortDescription = '2 Day Live Intensive Workshop for MSME Consumer Brands'

const mentorPoints = [
  '23+ years of building systems, scaling products, and creating measurable business impact',
  'Founder of Recibo.AI and EAZY.AI, enabling SME & MNC brands across 8 countries with AI-powered Sales & Distribution solutions.',
  'Corporate leadership experience spanning FMCG, Consumer Durables, Mobile Devices, and Pharma, with a track record of working across global organizations including Samsung, Philips, Unilever, PepsiCo, Nestle and GlaxoSmithKline.',
  'Partnered with 650+ brands in 8 countries to drive scalable growth and business outcomes.',
  'Practical frameworks at the intersection of business coaching, brand strategy, and founder transformation',
]

const magnaFramework = [
  ['M', 'MINDSET ALIGNMENT', 'Before strategy, fix the lens of thinking.'],
  ['A', 'ARCHITECTURE OF SYSTEMS', 'Business stops depending on you when systems start thinking.'],
  ['G', 'GROWTH ENGINE DESIGN', 'Growth is engineered, not hoped for.'],
  ['N', 'NUMBERS & NAVIGATION', 'What gets measured gets multiplied.'],
  ['A', 'ALIGNMENT OF TEAM & EXECUTION', 'Sustainable growth needs team alignment and peak performance.'],
]

const achievements = [
  ['Move From Chaos to Clarity', 'Stop reacting daily. Start operating with structure.'],
  ['Build Systems That Replace You', 'Create SOPs, workflows, and AI-powered systems that reduce dependency.'],
  ['Design Predictable Growth Engines', 'No more guesswork—build repeatable marketing and sales systems.'],
  ['Gain Complete Financial Visibility', 'Understand your numbers, cash flow, and profitability clearly.'],
  ['Scale Without Burnout', 'Align your energy, team, and execution for long-term sustainability.'],
]

const magnaDifference = [
  ['Not Just Training', "We don't just teach. We redesign how your business operates."],
  ['Built for MSME Reality', 'No startup theory. Everything is designed for real Indian businesses.'],
  ['AI + Business Systems Integration', 'We combine:\n• AI tools\n• Business frameworks\n• Execution systems'],
  ['Founder + Business Growth Together', 'Because scaling a business without evolving the founder leads to burnout.'],
]

const dayOneLessons = [
  'Session 1: M — Mindset',
  'The 3 identity shifts required to scale beyond ₹1Cr → ₹100 Cr+',
  'Why "hard work" is killing growth (and what replaces it)',
  'Breaking "founder dependency loop"',
  'Moving from firefighting → foresight-driven leadership',
  'Session 2: A — Architecture',
  'How to remove "people dependency"',
  'Designing SOPs that actually get followed',
  'Tools & workflows to reduce manual effort by 30–50%',
  'Automating marketing, sales follow-ups, and operation',
  'Where AI actually fits in MSME businesses',
  'Session 3: G — Growth',
  'How to create predictable monthly revenue',
  'Fixing inconsistent sales pipelines',
  'Positioning & messaging for premium growth',
]

const dayTwoLessons = [
  'Session 4: N — Numbers',
  'The only KPIs that actually matter for founders',
  'Understanding CAC, LTV, conversion ratios, and margins',
  'How to stop "profit leaks" in your business',
  'Session 5: A — Alignment',
  'Aligning team, systems, and founder energy',
  'Hiring for scale vs hiring for survival',
  'Time, energy & focus management for founders',
  'Creating a culture of ownership, not dependency',
  'Session 6: Q & A Session',
  'Addressing specific challenges and questions from participants',
  'Final insights and next steps for implementation',
]

const mustAttend = [
  ['Learn from a Proven Business Builder', 'Gain real-world insights from a coach who has successfully built and scaled multiple businesses. No theory—only practical strategies tailored for MSMEs like yours.'],
  ['Follow a System That Drives Sustainable Growth', 'Understand a proven framework used by 25,000+ business professionals to scale efficiently without being stuck in day-to-day operations.'],
  ['Step into True Leadership', 'Move beyond managing tasks. Learn how to build, train, and empower a team that runs independently while you focus on growth.'],
  ['Solve Your Most Critical Business Challenges', "Whether it's low margins, delayed payments, or stagnant sales—discover actionable solutions you can implement immediately."],
  ['Take Back Control of Your Time and Business', 'Break free from daily chaos by building strong systems and teams that allow your business to run smoothly without constant supervision.'],
  ['Leave with a Clear, Actionable Growth Plan', 'Walk away with a personalized action plan tailored to your business—ready to implement from day one.'],
]

const closeWork = [
  ['Personal Clarity', 'Deep dive into your unique business challenges and breakthrough opportunities'],
  ['Real Implementation', 'Build actual systems during the program, not just theoretical frameworks'],
  ['Measurable Outcomes', 'Track concrete improvements in revenue, systems, and personal freedom'],
]

const faqs = [
  'How I\'ll get link to attend program?',
  'Will I get recording of Program?',
  'Who is this seminar ideal for?',
  'Can I attend this program along with my business partner(s)?',
  'Is it a LIVE webinar?',
]

function ctaSection(keySuffix) {
  return {
    _key: `cta-${keySuffix}`,
    sectionTitle: 'Don’t wait because your competition won’t !',
    sectionFormat: 'cta',
    media: media(assets.alarm, 'Alarm'),
    cta: {
      headline: 'Don’t wait because your competition won’t !',
      description: 'Remaining Time',
      buttonLabel: ctaText,
      buttonAction: 'razorpay',
      razorpayAmount: 1,
      razorpayDescription: programName,
      formTitle: 'Join the MAGNA Business Program',
      formDescription: `${programName} - ₹1/-`,
      formButtonLabel: 'Pay ₹1/-',
      showMessageField: false,
      countdownMinutes: 15,
      countdownLabel: 'Remaining Time',
      confirmationEmail: {
        enabled: true,
        subject: 'Your {{Program}} registration is confirmed',
        fromName: 'Dharneesh B R',
        body: [
          'Dear {{First Name}},',
          '',
          'Thank you for registering for {{Program}}.',
          '',
          'Your payment has been successfully received and your registration is confirmed.',
          '',
          'Amount: {{Amount}}',
          'Payment ID: {{Payment ID}}',
          '',
          'Warm regards,',
          'Dharneesh B R',
        ].join('\n'),
      },
    },
  }
}

const existing = await client.fetch(
  '*[_type == "adPages" && (slug.current == $slug || _id == $legacySlug)][0]{_id}',
  {slug: 'magna-business-masterclass', legacySlug: 'business-growth-masterclass'},
)

const documentId = existing?._id || 'adpage-magna-business-masterclass'

const doc = {
  _id: documentId,
  _type: 'adPages',
  title: headline,
  slug: {_type: 'slug', current: 'magna-business-masterclass'},
  status: 'published',
  headline,
  shortDescription,
  primaryButtonLabel: ctaText,
  primaryButtonAction: 'razorpay',
  primaryRazorpayAmount: 1,
  primaryRazorpayDescription: programName,
  primaryFormTitle: 'Join the MAGNA Business Program',
  primaryFormDescription: `${programName} - ₹1/-`,
  primaryFormButtonLabel: 'Pay ₹1/-',
  primaryConfirmationEmail: {
    enabled: true,
    subject: 'Your {{Program}} registration is confirmed',
    fromName: 'Dharneesh B R',
    body: [
      'Dear {{First Name}},',
      '',
      'Thank you for registering for {{Program}}.',
      '',
      'Your action has been successfully received by Magnafic.',
      '',
      'Action: {{Action}}',
      'Amount: {{Amount}}',
      'Payment ID: {{Payment ID}}',
      '',
      'Warm regards,',
      'Dharneesh B R',
    ].join('\n'),
  },
  secondaryButtonLabel: '',
  secondaryButtonUrl: '',
  theme: 'light',
  heroMedia: media(assets.hero, 'Scale Your Consumer Brand'),
  workshopDetails: [
    {_key: 'workshop-date', icon: 'calendar', label: '30th & 31st of May'},
    {_key: 'workshop-language', icon: 'language', label: 'English, Hindi'},
    {_key: 'workshop-time', icon: 'clock', label: '6 PM to 9 PM'},
    {_key: 'workshop-platform', icon: 'video', label: 'Live on Zoom'},
  ],
  stickyRegistrationBar: {
    enabled: true,
    buttonLabel: ctaText,
    countdownMinutes: 15,
    countdownLabel: 'left',
  },
  sections: [
    {
      _key: 'proven-business-builder',
      sectionTitle: 'Learn from a proven Business Builder',
      sectionFormat: 'list',
      intro: 'Dharneesh B R\n\n3x Founder | CPG Business Strategist\n\nEx-Samsung, Philips, Unilever, Pepsico, Nestle, GSK',
      media: media(assets.mentor, 'Dharneesh B R'),
      items: mentorPoints.map((description, index) => item(`Mentor Point ${index + 1}`, description)),
    },
    {
      _key: 'consumer-brand-transformation',
      sectionTitle: 'Build a Consumer Brand that scales without burning you out',
      sectionFormat: 'differentiators',
      media: media(assets.mentor, 'Dharneesh B R'),
      items: [
        item('Are you still:', [
          'Handling sales, operations, and decisions yourself?',
          'Growing—but feeling stuck, stressed, or unclear?',
          'Working harder every year but not building real freedom?',
        ].join('\n')),
        item('A high impact business transformation program designed for MSME founders to:', [
          'Build system-driven Brand with sustained profitability',
          'Create predictable growth engines',
          'Gain clarity, control, and efficiency',
          '',
          'Unlike traditional programs, this is not about motivation or theory.',
          '',
          'This is about restructuring how your business actually runs.',
        ].join('\n')),
      ],
    },
    {
      _key: 'magna-framework',
      sectionTitle: 'MAGNA Framework',
      sectionFormat: 'cards',
      intro: 'A Conscious Growth System for Scaling Consumer Brands',
      items: magnaFramework.map(([iconLabel, title, description]) => item(title, description, {iconLabel})),
    },
    {
      _key: 'what-you-will-achieve',
      sectionTitle: 'WHAT YOU WILL ACHIEVE',
      sectionFormat: 'outcomes',
      items: achievements.map(([title, description], index) => item(title, description, {iconLabel: String(index + 1)})),
    },
    ctaSection('first'),
    {
      _key: 'what-makes-magna-different',
      sectionTitle: 'WHAT MAKES MAGNA DIFFERENT',
      sectionFormat: 'cards',
      items: magnaDifference.map(([title, description]) => item(title, description)),
    },
    {
      _key: 'who-is-this-for',
      sectionTitle: 'Who is this for?',
      sectionFormat: 'differentiators',
      intro: "Use this quick check to see if you're a fit for the Business MAGNA Program.",
      items: [
        item('WHO THIS IS FOR', [
          'This program designed for',
          'MSME founders stuck in daily operations',
          'Business owners with ₹20L–₹5Cr+ revenue looking to scale',
          'Entrepreneurs who want systems, not just ideas',
          'Founders ready to move from operator → architect → leader',
        ].join('\n')),
        item('WHO THIS IS NOT FOR', [
          'This will not be a fit if:',
          'People looking for quick hacks or shortcuts',
          'Founders unwilling to implement',
          'Those expecting "motivation-only" programs',
          '',
          'This is for builders who want real transformation.',
        ].join('\n')),
      ],
    },
    {
      _key: 'join-magna-business-program',
      sectionTitle: 'Join the MAGNA Business Program',
      sectionFormat: 'curriculum',
      intro: 'Two focused days to move from founder-led chaos to a system-driven business with clearer growth, control, and execution.',
      media: media(assets.program, 'Business Magna Program'),
      modules: [
        {
          _key: 'day-1-foundation-systems',
          title: 'Day 1: FOUNDATION & SYSTEMS',
          description: 'M — Mindset, A — Architecture, G — Growth',
          lessons: dayOneLessons,
        },
        {
          _key: 'day-2-scale-sustainability',
          title: 'Day 2: SCALE & SUSTAINABILITY',
          description: 'N — Numbers, A — Alignment, Q & A Session',
          lessons: dayTwoLessons,
        },
      ],
    },
    ctaSection('second'),
    {
      _key: 'before-after-magna',
      sectionTitle: 'BEFORE vs AFTER MAGNA PROGRAM',
      sectionFormat: 'differentiators',
      items: [
        item('Before', [
          'Where most founders start',
          'Constant firefighting',
          'No time to think',
          'Revenue is inconsistent',
          'Business depends on you',
        ].join('\n')),
        item('After', [
          'What MAGNA unlocks',
          'Structured systems in place',
          'Team operates independently',
          'Growth becomes predictable',
          'You lead instead of execute',
        ].join('\n')),
      ],
    },
    {
      _key: 'trusted-by-leading-brands',
      sectionTitle: 'Trusted by Leading Brands',
      sectionFormat: 'media-gallery',
      intro: 'Partnered with industry leaders to drive innovation and excellence',
      items: Object.entries(assets)
        .filter(([name]) => name.startsWith('brand'))
        .map(([name, asset], index) => item(`Brand ${index + 1}`, '', {media: media(asset, name)})),
    },
    {
      _key: 'our-guarantee',
      sectionTitle: 'Our Guarantee',
      sectionFormat: 'content',
      intro: "A Promise\n\nIf you don't feel this workshop provides immense value and actionable insights to transform your business, we'll refund your investment. No questions asked.",
      media: media(assets.guarantee, 'Guarantee'),
    },
    {
      _key: 'must-attend-entrepreneurs',
      sectionTitle: 'What Makes This Program a Must-Attend for Entrepreneurs',
      sectionFormat: 'cards',
      items: mustAttend.map(([title, description]) => item(title, description)),
    },
    {
      _key: 'work-closely-with-founders',
      sectionTitle: 'We work closely with founders to ensure',
      sectionFormat: 'cards',
      intro: 'Real transformation requires deep focus and personalized attention',
      items: closeWork.map(([title, description]) => item(title, description)),
    },
    ctaSection('final'),
    {
      _key: 'frequently-asked-questions',
      sectionTitle: 'Frequently Asked Questions',
      sectionFormat: 'faqs',
      intro: "Got questions? We've got answers to help you make the most of your MAGNA experience",
      faqs: faqs.map((question) => ({
        _key: key(question),
        question,
        answer: 'Not provided on the source page.',
      })),
    },
  ],
  seoTitle: 'MAGNA Business Masterclass | Dharneesh B R',
  seoDescription: 'Join Dharneesh B R for the MAGNA Business Program to scale your consumer brand 3X in 90 days.',
}

const result = await client.createOrReplace(doc)
console.log(JSON.stringify({
  updated: true,
  sourceUrl,
  id: result._id,
  slug: result.slug?.current,
  title: result.title,
  sectionCount: result.sections?.length || 0,
  uploadedAssetCount: uploadedEntries.length,
}, null, 2))
