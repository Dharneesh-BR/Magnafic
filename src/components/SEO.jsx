import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import {
  DEFAULT_DESCRIPTION,
  DEFAULT_IMAGE,
  SITE_NAME,
  SITE_URL,
  absoluteUrl,
  buildTitle,
  staticRouteSeo,
} from '../lib/seo'

function upsertMeta(selector, attributes) {
  let element = document.head.querySelector(selector)

  if (!element) {
    element = document.createElement('meta')
    document.head.appendChild(element)
  }

  Object.entries(attributes).forEach(([key, value]) => {
    element.setAttribute(key, value)
  })
}

function upsertLink(selector, attributes) {
  let element = document.head.querySelector(selector)

  if (!element) {
    element = document.createElement('link')
    document.head.appendChild(element)
  }

  Object.entries(attributes).forEach(([key, value]) => {
    element.setAttribute(key, value)
  })
}

function upsertJsonLd(id, data) {
  let element = document.getElementById(id)

  if (!element) {
    element = document.createElement('script')
    element.id = id
    element.type = 'application/ld+json'
    document.head.appendChild(element)
  }

  element.textContent = JSON.stringify(data)
}

function removeJsonLd(id) {
  const element = document.getElementById(id)
  element?.remove()
}

export default function SEO({ title, description, path, image, type = 'website', jsonLd, noIndex = false }) {
  const location = useLocation()
  const routeSeo = staticRouteSeo[location.pathname] || {}
  const pageTitle = buildTitle(title || routeSeo.title)
  const pageDescription = description || routeSeo.description || DEFAULT_DESCRIPTION
  const canonical = absoluteUrl(path || location.pathname)
  const pageImage = image ? absoluteUrl(image) : DEFAULT_IMAGE

  useEffect(() => {
    document.title = pageTitle

    upsertMeta('meta[name="description"]', { name: 'description', content: pageDescription })
    upsertMeta('meta[name="robots"]', {
      name: 'robots',
      content: noIndex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large',
    })
    upsertMeta('meta[property="og:site_name"]', { property: 'og:site_name', content: SITE_NAME })
    upsertMeta('meta[property="og:title"]', { property: 'og:title', content: pageTitle })
    upsertMeta('meta[property="og:description"]', { property: 'og:description', content: pageDescription })
    upsertMeta('meta[property="og:type"]', { property: 'og:type', content: type })
    upsertMeta('meta[property="og:url"]', { property: 'og:url', content: canonical })
    upsertMeta('meta[property="og:image"]', { property: 'og:image', content: pageImage })
    upsertMeta('meta[property="og:image:width"]', { property: 'og:image:width', content: '1200' })
    upsertMeta('meta[property="og:image:height"]', { property: 'og:image:height', content: '630' })
    upsertMeta('meta[property="og:image:alt"]', { property: 'og:image:alt', content: `${SITE_NAME} expert consulting for FMCG and consumer brand growth` })
    upsertMeta('meta[name="twitter:card"]', { name: 'twitter:card', content: 'summary_large_image' })
    upsertMeta('meta[name="twitter:title"]', { name: 'twitter:title', content: pageTitle })
    upsertMeta('meta[name="twitter:description"]', { name: 'twitter:description', content: pageDescription })
    upsertMeta('meta[name="twitter:image"]', { name: 'twitter:image', content: pageImage })
    upsertMeta('meta[name="twitter:image:alt"]', { name: 'twitter:image:alt', content: `${SITE_NAME} expert consulting for FMCG and consumer brand growth` })
    upsertLink('link[rel="canonical"]', { rel: 'canonical', href: canonical })

    upsertJsonLd('site-json-ld', {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
      logo: absoluteUrl('/Magnafic.png'),
      image: DEFAULT_IMAGE,
      description: DEFAULT_DESCRIPTION,
    })

    upsertJsonLd('website-json-ld', {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: SITE_NAME,
      url: SITE_URL,
    })

    if (jsonLd) {
      upsertJsonLd('page-json-ld', jsonLd)
    } else {
      removeJsonLd('page-json-ld')
    }
  }, [canonical, jsonLd, noIndex, pageDescription, pageImage, pageTitle, type])

  return null
}
