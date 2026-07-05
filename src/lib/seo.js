export const SITE_NAME = 'Magnafic'
export const DEFAULT_SITE_URL = 'https://magnafic.com'
export const SITE_URL = (import.meta.env.VITE_SITE_URL || DEFAULT_SITE_URL).replace(/\/$/, '')
export const DEFAULT_IMAGE = `${SITE_URL}/share-banner.jpg`
export const DEFAULT_DESCRIPTION =
  'Magnafic is an end-to-end expert consulting platform for FMCG and consumer brands, connecting businesses with fractional CXOs, operators, and AI-enabled execution.'

export const staticRouteSeo = {
  '/': {
    title: 'Magnafic - Expert Consulting for FMCG & Consumer Brand Growth',
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
    title: 'About Magnafic',
    description:
      'Learn about Magnafic, India first distributed consulting network for CPG and consumer brand leaders.',
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

export function absoluteUrl(path = '/') {
  if (/^https?:\/\//i.test(path)) return path

  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${SITE_URL}${normalizedPath}`
}

export function buildTitle(title) {
  if (!title) return staticRouteSeo['/'].title
  return title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`
}
