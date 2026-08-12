export const SITE_NAME = 'Magnafic'
export const DEFAULT_SITE_URL = 'https://magnafic.com'
export const SITE_URL = (import.meta.env.VITE_SITE_URL || DEFAULT_SITE_URL).replace(/\/$/, '')
export const DEFAULT_IMAGE = `${SITE_URL}/share-banner.jpg`
export const BRAND_LOGO = `${SITE_URL}/Magnafic.png`
export const BRAND_POSITIONING = 'Magnafic - Top 1% expert consulting platform for FMCG & CPG Growth'
export const BRAND_EMAIL = 'dharneesh@magnafic.com'
export const BRAND_PHONE = '+91 99804 56995'
export const BRAND_SOCIAL_PROFILES = [
  'https://www.linkedin.com/company/magnafic/',
  'https://www.instagram.com/magnafic.global',
  'https://youtube.com/@magnafic',
]
export const BRAND_ALTERNATE_NAMES = [
  'Magnafic Global',
  'Magnafic Consulting',
  'Magnafic - Top 1% expert consulting platform for FMCG & CPG Growth',
  'Magnafic Academy',
  'Magnafic Top 1% Expert Club',
]
export const BRAND_KEYWORDS = [
  'Magnafic',
  'Magnafic Business Consulting',
  'Magnafic consulting',
  'Magnafic experts',
  'Magnafic Academy',
  'FMCG consulting',
  'CPG consulting',
  'consumer brand consulting',
  'fractional CXO',
  'business growth consulting',
  'AI-enabled consulting',
]
export const DEFAULT_DESCRIPTION =
  'Magnafic is the Top 1% expert consulting platform for FMCG and CPG growth, connecting consumer brands with fractional CXOs, operators, and AI-enabled execution.'

export const staticRouteSeo = {
  '/': {
    title: BRAND_POSITIONING,
    description: DEFAULT_DESCRIPTION,
  },
  '/experts': {
    title: 'Find Expert Consultants | Magnafic',
    description:
      'Browse Magnafic expert consultants across strategy, growth, technology, operations, AI systems, and consumer brand transformation.',
  },
  '/digital-transformation': {
    title: 'Digital Transformation for Consumer Brands | Magnafic',
    description:
      'Build AI-enabled operating systems, digital workflows, and transformation programs for modern consumer brand growth.',
  },
  '/insights': {
    title: 'Insights | Magnafic',
    description:
      'Read Magnafic insights, research, articles, and case studies for consumer brand strategy, growth, operations, and transformation.',
  },
  '/join-experts-hub': {
    title: 'Join the Top 1% Expert Club | Magnafic',
    description:
      'Apply to the Magnafic Top 1% Expert Club for accomplished CPG leaders, consultants, advisors, and fractional CXOs shaping high-growth consumer brands.',
  },
  '/founder-community': {
    title: 'Top 1% Founder Community | Magnafic',
    description:
      'Join the Magnafic Founder Community for ambitious consumer brand founders learning from Top 1% experts, peers, workshops, and practical growth resources.',
  },
  '/add': {
    title: 'Business Growth Masterclass | Magnafic',
    description:
      'Register for a 4-hour online business growth masterclass for MSME business owners, entrepreneurs, and founders ready to build systems, revenue, and scale.',
  },
  '/about': {
    title: 'About Magnafic - Official Brand Story',
    description:
      'Learn about Magnafic, the official expert consulting brand built to help CPG and consumer brand leaders access elite operators and AI-enabled execution.',
  },
  '/academy': {
    title: 'Academy | Magnafic',
    description:
      'Explore Magnafic Academy programs and learning experiences for consumer brand operators and leaders.',
  },
  '/contact': {
    title: 'Contact Magnafic',
    description:
      'Contact Magnafic to connect with expert consultants, fractional leaders, and AI-enabled growth systems.',
  },
  '/capabilities': {
    title: 'Expert Services | Magnafic',
    description:
      'Explore Magnafic expert services across growth, strategy, operations, distribution, technology, AI systems, branding, and transformation.',
  },
  '/services': {
    title: 'Consulting Services | Magnafic',
    description:
      'Explore Magnafic consulting services for FMCG, CPG, consumer products, D2C, retail, and emerging-market growth.',
  },
  '/magna-business-masterclass': {
    title: 'Magna Business Masterclass | Magnafic',
    description:
      'Join a Magnafic business masterclass for founders and MSME business owners building stronger systems, revenue, and scale.',
  },
  '/terms-and-conditions': {
    title: 'Terms & Conditions',
    description:
      'Read Magnafic terms and conditions for using our website, expert services, programs, products, workshops, dashboards, and payment flows.',
  },
  '/privacy-policy': {
    title: 'Privacy Policy',
    description:
      'Read how Magnafic collects, uses, shares, protects, and retains personal information across our website, services, dashboards, and programs.',
  },
  '/refund-cancellation-policy': {
    title: 'Refund & Cancellation Policy',
    description:
      'Read Magnafic refund and cancellation terms for workshops, programs, consulting services, digital products, and payment transactions.',
  },
}

export const organizationJsonLd = {
  '@type': ['Organization', 'ProfessionalService'],
  '@id': `${SITE_URL}/#organization`,
  name: SITE_NAME,
  legalName: SITE_NAME,
  alternateName: BRAND_ALTERNATE_NAMES,
  url: SITE_URL,
  logo: {
    '@type': 'ImageObject',
    '@id': `${SITE_URL}/#logo`,
    url: BRAND_LOGO,
  },
  image: DEFAULT_IMAGE,
  description: DEFAULT_DESCRIPTION,
  email: BRAND_EMAIL,
  telephone: BRAND_PHONE,
  sameAs: BRAND_SOCIAL_PROFILES,
  slogan: 'Top 1% expert consulting platform for FMCG & CPG Growth',
  knowsAbout: [
    'FMCG consulting',
    'CPG consulting',
    'consumer brand growth',
    'fractional CXO services',
    'digital transformation',
    'AI-enabled business execution',
    'distribution strategy',
    'go-to-market strategy',
  ],
  contactPoint: [
    {
      '@type': 'ContactPoint',
      contactType: 'customer support',
      email: BRAND_EMAIL,
      telephone: BRAND_PHONE,
      areaServed: ['IN', 'Global'],
      availableLanguage: ['en'],
    },
  ],
}

export const websiteJsonLd = {
  '@type': 'WebSite',
  '@id': `${SITE_URL}/#website`,
  name: SITE_NAME,
  alternateName: BRAND_ALTERNATE_NAMES,
  url: SITE_URL,
  publisher: {
    '@id': `${SITE_URL}/#organization`,
  },
  inLanguage: 'en',
}

export function absoluteUrl(path = '/') {
  if (/^https?:\/\//i.test(path)) return path

  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${SITE_URL}${normalizedPath}`
}

export function buildTitle(title) {
  if (!title) return staticRouteSeo['/'].title
  return title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`
}

export function pathSegmentToLabel(segment) {
  return segment
    .split('-')
    .filter(Boolean)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

export function breadcrumbJsonLd(path = '/') {
  const normalizedPath = path.split('?')[0].replace(/\/$/, '') || '/'
  const segments = normalizedPath === '/' ? [] : normalizedPath.split('/').filter(Boolean)
  const items = [
    {
      '@type': 'ListItem',
      position: 1,
      name: SITE_NAME,
      item: `${SITE_URL}/`,
    },
  ]

  segments.forEach((segment, index) => {
    const itemPath = `/${segments.slice(0, index + 1).join('/')}`
    const routeSeo = staticRouteSeo[itemPath]
    const name = routeSeo?.title
      ? routeSeo.title.replace(/\s+\|\s+Magnafic$/i, '').replace(/\s+-\s+Magnafic.*$/i, '')
      : pathSegmentToLabel(segment)

    items.push({
      '@type': 'ListItem',
      position: index + 2,
      name,
      item: absoluteUrl(itemPath),
    })
  })

  return {
    '@type': 'BreadcrumbList',
    '@id': `${absoluteUrl(normalizedPath)}#breadcrumb`,
    itemListElement: items,
  }
}
