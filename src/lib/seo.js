export const SITE_NAME = 'Magnafic'
export const DEFAULT_SITE_URL = 'https://magnafic.com'
export const SITE_URL = (import.meta.env.VITE_SITE_URL || DEFAULT_SITE_URL).replace(/\/$/, '')
export const DEFAULT_IMAGE = `${SITE_URL}/og-image.png`
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
    title: 'Join the Experts Hub | Magnafic',
    description:
      'Join Magnafic as an expert consultant and work with ambitious consumer brands on high-impact growth challenges.',
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
