import fs from 'node:fs'
import path from 'node:path'
import {fileURLToPath} from 'node:url'
import {createClient} from '@sanity/client'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')

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

function media(asset) {
  return {
    mediaType: 'image',
    image: {
      _type: 'image',
      asset: {
        _type: 'reference',
        _ref: asset._id,
      },
    },
  }
}

async function uploadImage(relativePath, label) {
  const absolutePath = path.join(rootDir, 'public', relativePath)
  const stream = fs.createReadStream(absolutePath)
  return client.assets.upload('image', stream, {
    filename: path.basename(absolutePath),
    title: label,
  })
}

const [mentorAsset, programAsset] = await Promise.all([
  uploadImage('dharneesh-mentor.png', 'Dharneesh B R mentor image'),
  uploadImage('dharneesh-program.png', 'Business Growth Masterclass program image'),
])

const mentorMedia = media(mentorAsset)
const programMedia = media(programAsset)

const joinOutcomes = [
  'You Unlock Secrets To Create Time & Wealth In Business',
  'You Learn Strong Foundational Activities To Win In Your Business',
  'Your Business Growth With Increased Revenue & Cashflow',
  'More Profit, More Freedom, More Scale Is Guaranteed If You Follow The Exact Steps Covered In The Workshop',
]

const bestFor = [
  'MSME Business Owners',
  'Entrepreneurs looking to scale',
  'Founders stuck in daily operations',
  'Business owners seeking growth',
]

const fourHourLearnings = [
  'How to build a growth business rather than a survival business',
  'Characteristics of growth and survival businesses',
  '3 Reasons why business owners get stuck in survival',
  'Focus areas to build a growth business',
]

const struggles = [
  'Handling sales, operations, team follow-ups, and decisions yourself',
  'Growing, but still feeling stuck, stressed, or unclear',
  'Working harder every year without building real freedom',
  'Facing inconsistent revenue, shrinking margins, or cashflow pressure',
  'Depending too much on people instead of repeatable systems',
  'Not having a clear roadmap to scale profitably',
  'Feeling trapped in daily firefighting instead of strategic growth',
]

const transformations = [
  'Build a system-driven business that can run without constant founder involvement',
  'Create predictable growth engines instead of relying on guesswork',
  'Gain clarity on numbers, cashflow, profitability, and key business levers',
  'Upgrade your decision-making from operator mode to leadership mode',
  'Design workflows, SOPs, and AI-enabled structures that reduce chaos',
]

const magnaSystem = [
  ['M', 'Mindset Alignment', 'Shift from pressure-based execution to clear founder leadership.'],
  ['A', 'Architecture of Systems', 'Build SOPs, workflows, dashboards, and repeatable operating systems.'],
  ['G', 'Growth Engine Design', 'Engineer leads, conversion, retention, referrals, and revenue visibility.'],
  ['N', 'Numbers & Navigation', 'Track the few metrics that actually reveal growth, leaks, and profit.'],
  ['A', 'Alignment of Team & Execution', 'Create team ownership so growth does not depend only on you.'],
]

const workshopFlow = [
  ['Fix What Is Stopping Your Growth', 'Identify the patterns that keep business owners stuck in survival mode.'],
  ['Build A Strong Growth Foundation', 'Understand the difference between a survival business and a growth business.'],
  ['Design Systems That Reduce Dependency', 'Map the repeatable activities, SOPs, workflows, and tools your business needs.'],
  ['Create Predictable Revenue', 'See where growth leaks happen across leads, conversion, pricing, and follow-up.'],
  ['Read Your Numbers Clearly', 'Get sharper visibility on cashflow, margins, KPIs, and founder decisions.'],
  ['Ask, Clarify, And Plan Next Steps', 'Leave with practical direction for implementation after the workshop.'],
]

const greatFit = [
  'MSME founders stuck in daily operations',
  'Business owners with revenue who want to scale with clarity',
  'Entrepreneurs who want systems, not just ideas',
  'Retail, service, manufacturing, and consumer-brand owners building repeatable growth',
  'Founders ready to move from operator to architect to leader',
]

const notFit = [
  'People looking for shortcuts or overnight success',
  'Founders unwilling to implement after learning',
  'Anyone expecting motivation-only content without practical work',
  'People not serious about building long-term systems',
  'Non-business owners who are not ready to take action',
]

const mentorPoints = [
  '23+ years of building systems, scaling products, and creating measurable business impact',
  'Experience across Samsung, Philips, Unilever, GlaxoSmithKline, EAZY, Recibo.AI, and Mind Magna',
  '650+ brands served across 8 countries through venture and growth work',
  '7,88,175+ business owners trained in the last 6 years',
  'Practical frameworks at the intersection of business coaching, brand strategy, and founder transformation',
]

const faqs = [
  ['Who should attend this workshop?', 'MSME business owners, entrepreneurs, and founders looking to scale their business and break free from daily operations.'],
  ['What will I learn in 4 hours?', 'You will learn proven strategies to build a growth business, characteristics of successful businesses, and actionable steps to increase revenue and profit.'],
  ['Is the price really just Rs 99?', "Yes. Today's special price is Rs 99/- only. Register before the timer ends to secure this special offer and bonuses worth Rs 6,487/-."],
  ['What if I am not satisfied?', 'There is a 100% satisfaction guarantee. If you do not find value in the workshop, your investment is refunded.'],
  ['Is this a live workshop?', 'Yes. The workshop is designed as a live, interactive learning experience with practical business examples and implementation clarity.'],
  ['Will this help if my business is already running?', 'Yes. This is especially useful for owners who already have a business and want to move from daily operations into structured growth, systems, and leadership.'],
  ['Do I need advanced marketing or finance knowledge?', 'No. The workshop focuses on practical frameworks that business owners can understand, apply, and refine inside their own context.'],
]

const existing = await client.fetch(
  '*[_type == "adPages" && (slug.current == $slug || _id == $slug)][0]{_id}',
  {slug: 'business-growth-masterclass'},
)

const documentId = existing?._id || 'adpage-business-growth-masterclass'

const doc = {
  _id: documentId,
  _type: 'adPages',
  title: 'Business Growth Masterclass',
  slug: {_type: 'slug', current: 'business-growth-masterclass'},
  status: 'published',
  headline: "Join and Become Like The Top 1% Successful Business Owners & Entrepreneurs Before It's Too Late",
  shortDescription: 'A 4 hour online workshop with Dharneesh B R on 6th May 2026, 9:00 AM - 1:00 PM IST.',
  primaryButtonLabel: 'Register Now at Rs 99/- Only',
  primaryButtonAction: 'razorpay',
  primaryRazorpayAmount: 99,
  primaryRazorpayDescription: 'Business Growth Masterclass',
  primaryFormTitle: 'Reserve Your Workshop Seat',
  primaryFormDescription: 'Business Growth Masterclass - Rs 99/-',
  primaryFormButtonLabel: 'Pay Rs 99/-',
  theme: 'dark',
  heroMedia: mentorMedia,
  sections: [
    {
      _key: 'what-happens-when-you-join',
      sectionTitle: 'What Happens When You Join?',
      sectionFormat: 'list',
      intro: 'Learn directly from Dharneesh B R, India\'s MSME Business Coach, who has trained over 7,88,175 business owners in the last 6 years.',
      media: mentorMedia,
      items: joinOutcomes.map((description, index) => item(`Outcome ${index + 1}`, description)),
    },
    {
      _key: 'register-timer',
      sectionTitle: 'Register in next',
      sectionFormat: 'cta',
      intro: 'To unlock bonuses worth Rs 6,487.',
      cta: {
        headline: 'Register in next 15 minutes',
        description: 'Reserve your seat before the timer ends to unlock bonuses worth Rs 6,487/-. Today\'s price: Rs 99/-.',
        buttonLabel: 'Register Now at Rs 99/- Only',
        buttonAction: 'razorpay',
        razorpayAmount: 99,
        razorpayDescription: 'Business Growth Masterclass',
        formTitle: 'Reserve Your Workshop Seat',
        formDescription: 'Business Growth Masterclass - Rs 99/-',
        formButtonLabel: 'Pay Rs 99/-',
        showMessageField: false,
        media: programMedia,
      },
    },
    {
      _key: 'best-for-and-learnings',
      sectionTitle: 'Who This Workshop Will Help The Best?',
      sectionFormat: 'cards',
      intro: 'A practical workshop for business owners who want stronger foundations, clearer numbers, and system-led growth.',
      media: programMedia,
      items: [
        ...bestFor.map((description, index) => item(`Best For ${index + 1}`, description)),
        ...fourHourLearnings.map((description, index) => item(`Learning ${index + 1}`, description)),
      ],
    },
    {
      _key: 'struggles',
      sectionTitle: 'Are You Still Struggling To Run And Scale Your Business?',
      sectionFormat: 'differentiators',
      intro: 'Stop here if this feels familiar. If you are nodding along, it is time to make a change.',
      items: [
        item('Common Founder Struggles', struggles.join('\n')),
        item('What Changes After The Workshop', 'This workshop is built to help you move from daily firefighting to structured, profitable, system-led growth.'),
      ],
    },
    {
      _key: 'transformations',
      sectionTitle: 'How Your Business Can Transform After This Workshop',
      sectionFormat: 'outcomes',
      intro: 'Get clarity, systems, and practical direction for scaling without burning yourself out.',
      items: transformations.map((description, index) => item(`Transformation ${index + 1}`, description)),
    },
    {
      _key: 'magna-growth-system',
      sectionTitle: 'A Conscious Growth Framework For Scaling Smarter',
      sectionFormat: 'cards',
      intro: 'The MAGNA Growth System brings mindset, systems, growth, numbers, and alignment into one practical founder framework.',
      items: magnaSystem.map(([iconLabel, title, description]) => item(title, description, {iconLabel})),
    },
    {
      _key: 'workshop-flow',
      sectionTitle: 'What You Will Learn Inside The Workshop',
      sectionFormat: 'cards',
      intro: 'A practical, no-fluff flow designed to help you identify leaks and build the next version of your business.',
      items: workshopFlow.map(([title, description], index) => item(title, description, {iconLabel: String(index + 1)})),
    },
    {
      _key: 'fit-check',
      sectionTitle: 'Is This Workshop Right For You?',
      sectionFormat: 'differentiators',
      items: [
        item('You Are A Great Fit If You Are:', greatFit.join('\n')),
        item('This May Not Be A Fit If You Are:', notFit.join('\n')),
      ],
    },
    {
      _key: 'mentor',
      sectionTitle: 'Learn From A Proven Business Builder',
      sectionFormat: 'content',
      intro: 'Meet your mentor: Dharneesh B R, Business Growth Strategist, Founder & Business Coach.',
      media: mentorMedia,
      items: mentorPoints.map((description, index) => item(`Mentor Point ${index + 1}`, description)),
    },
    {
      _key: 'business-breakthrough',
      sectionTitle: 'What Will Change In Your Business?',
      sectionFormat: 'cards',
      intro: 'Business breakthrough comes from the right psychology, right strategies, and right systems.',
      items: [
        item('Right Psychology Of Running The Business', 'Upgrade from operator mode to leadership mode.'),
        item('Right Strategies', 'Focus on the few moves that create predictable growth.'),
        item('Right Systems', 'Create repeatable workflows that reduce founder dependency.'),
      ],
    },
    {
      _key: 'mission-stats',
      sectionTitle: "I'm On A MISSION To Help 1 Million Business Owners Achieve Profit & Growth",
      sectionFormat: 'stats',
      items: [
        item('Business Owners Trained', 'Business owners trained through workshops and growth programs.', {metric: '7.8L+'}),
        item('Social Media Reach', 'Entrepreneurs reached through practical business growth content.', {metric: '2.3M+'}),
        item('Workshops Conducted', 'Workshops conducted for business owners and founders.', {metric: '600+'}),
        item('Average Rating', 'Average participant rating for workshop experiences.', {metric: '4.96'}),
      ],
    },
    {
      _key: 'guarantee',
      sectionTitle: 'A Promise',
      sectionFormat: 'content',
      intro: "If you don't feel this workshop provides immense value and actionable insights to transform your business, we'll refund your investment. No questions asked.",
      media: programMedia,
    },
    {
      _key: 'faqs',
      sectionTitle: 'Frequently Asked Questions',
      sectionFormat: 'faqs',
      faqs: faqs.map(([question, answer]) => ({_key: key(question), question, answer})),
    },
    {
      _key: 'magna-business-program',
      sectionTitle: 'Join the MAGNA Business Program',
      sectionFormat: 'curriculum',
      intro: 'Two focused days to move from founder-led chaos to a system-driven business with clearer growth, control, and execution.',
      modules: [
        {
          _key: 'day-1',
          title: 'Day 1: Foundation & Systems',
          description: 'Mindset, architecture, and growth engine design.',
          lessons: [
            'The 3 identity shifts required to scale beyond Rs 1Cr to Rs 100 Cr+',
            'Why hard work is killing growth and what replaces it',
            'Breaking founder dependency loop',
            'Designing SOPs that actually get followed',
            'Where AI actually fits in MSME businesses',
            'How to create predictable monthly revenue',
          ],
        },
        {
          _key: 'day-2',
          title: 'Day 2: Scale & Sustainability',
          description: 'Numbers, alignment, ownership, and next-step clarity.',
          lessons: [
            'The only KPIs that actually matter for founders',
            'Understanding CAC, LTV, conversion ratios, and margins',
            'How to stop profit leaks in your business',
            'Aligning team, systems, and founder energy',
            'Creating a culture of ownership, not dependency',
            'Addressing specific challenges and questions from participants',
          ],
        },
      ],
    },
  ],
  seoTitle: 'Business Growth Masterclass | Magnafic',
  seoDescription: 'Join Dharneesh B R for a 4 hour online workshop to build systems, growth clarity, and business scale.',
}

const result = await client.createOrReplace(doc)
console.log(JSON.stringify({
  updated: true,
  id: result._id,
  slug: result.slug?.current,
  sectionCount: result.sections?.length || 0,
}, null, 2))
