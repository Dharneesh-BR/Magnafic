import {mkdir, readFile, writeFile} from 'node:fs/promises'
import {dirname, resolve} from 'node:path'
import {fileURLToPath} from 'node:url'
import {createClient} from '@sanity/client'

const __dirname = dirname(fileURLToPath(import.meta.url))
const rootDir = resolve(__dirname, '..')
const distDir = resolve(rootDir, 'dist')
const siteUrl = (process.env.VITE_SITE_URL || process.env.SITE_URL || 'https://magnafic.com').replace(/\/$/, '')
const defaultImage = `${siteUrl}/share-banner.jpg`

const client = createClient({
  projectId: '8pf5fxwy',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
})

function escapeHtml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function stripHtml(value = '') {
  return String(value).replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim()
}

function absoluteUrl(path = '/') {
  if (/^https?:\/\//i.test(path)) return path
  return `${siteUrl}${path.startsWith('/') ? path : `/${path}`}`
}

function replaceTag(html, selector, replacement) {
  const pattern = new RegExp(`<${selector}[^>]*>`, 'i')

  if (pattern.test(html)) {
    return html.replace(pattern, replacement)
  }

  return html.replace('</head>', `    ${replacement}\n  </head>`)
}

function metaName(name, content) {
  return `<meta name="${name}" content="${escapeHtml(content)}" />`
}

function metaProperty(property, content) {
  return `<meta property="${property}" content="${escapeHtml(content)}" />`
}

function linkCanonical(href) {
  return `<link rel="canonical" href="${escapeHtml(href)}" />`
}

function buildInsightHtml(baseHtml, insight) {
  const title = `${insight.title} | Magnafic`
  const description = stripHtml(insight.excerpt || `Read ${insight.title} on Magnafic.`)
  const path = `/insights/${insight.slug}`
  const url = absoluteUrl(path)
  const image = absoluteUrl(insight.imageUrl || defaultImage)

  let html = baseHtml
  html = html.replace(/<title>.*?<\/title>/i, `<title>${escapeHtml(title)}</title>`)
  html = replaceTag(html, 'meta\\s+name="description"', metaName('description', description))
  html = replaceTag(html, 'link\\s+rel="canonical"', linkCanonical(url))
  html = replaceTag(html, 'meta\\s+property="og:title"', metaProperty('og:title', title))
  html = replaceTag(html, 'meta\\s+property="og:description"', metaProperty('og:description', description))
  html = replaceTag(html, 'meta\\s+property="og:type"', metaProperty('og:type', 'article'))
  html = replaceTag(html, 'meta\\s+property="og:url"', metaProperty('og:url', url))
  html = replaceTag(html, 'meta\\s+property="og:image"', metaProperty('og:image', image))
  html = replaceTag(html, 'meta\\s+property="og:image:secure_url"', metaProperty('og:image:secure_url', image))
  html = replaceTag(html, 'meta\\s+property="og:image:alt"', metaProperty('og:image:alt', insight.title))
  html = replaceTag(html, 'meta\\s+name="twitter:title"', metaName('twitter:title', title))
  html = replaceTag(html, 'meta\\s+name="twitter:description"', metaName('twitter:description', description))
  html = replaceTag(html, 'meta\\s+name="twitter:image"', metaName('twitter:image', image))
  html = replaceTag(html, 'meta\\s+name="twitter:image:alt"', metaName('twitter:image:alt', insight.title))

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: insight.title,
    description,
    image,
    datePublished: insight.publishedAt,
    dateModified: insight._updatedAt,
    mainEntityOfPage: url,
    publisher: {
      '@type': 'Organization',
      name: 'Magnafic',
      logo: {
        '@type': 'ImageObject',
        url: absoluteUrl('/Magnafic.png'),
      },
    },
  }

  return html.replace('</head>', `    <script type="application/ld+json">${JSON.stringify(articleJsonLd)}</script>\n  </head>`)
}

const baseHtml = await readFile(resolve(distDir, 'index.html'), 'utf8')
const insights = await client.fetch(`*[_type == "blog" && status != "archived" && defined(slug.current)]{
  title,
  excerpt,
  publishedAt,
  _updatedAt,
  "slug": slug.current,
  "imageUrl": mainImage.asset->url
}`)

for (const insight of insights) {
  const outputDir = resolve(distDir, 'insights', insight.slug)
  await mkdir(outputDir, {recursive: true})
  await writeFile(resolve(outputDir, 'index.html'), buildInsightHtml(baseHtml, insight))
}

console.log(`Generated ${insights.length} insight share page${insights.length === 1 ? '' : 's'}`)
