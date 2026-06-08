import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createClient } from '@sanity/client'

const __dirname = dirname(fileURLToPath(import.meta.url))
const rootDir = resolve(__dirname, '..')
const publicDir = resolve(rootDir, 'public')
const siteUrl = (process.env.VITE_SITE_URL || process.env.SITE_URL || 'https://magnafic.com').replace(/\/$/, '')
const today = new Date().toISOString().slice(0, 10)

const staticRoutes = [
  { path: '/', priority: '1.0', changefreq: 'weekly' },
  { path: '/experts', priority: '0.9', changefreq: 'daily' },
  { path: '/insights', priority: '0.9', changefreq: 'daily' },
  { path: '/digital-transformation', priority: '0.8', changefreq: 'monthly' },
  { path: '/about', priority: '0.7', changefreq: 'monthly' },
  { path: '/academy', priority: '0.7', changefreq: 'monthly' },
  { path: '/programs', priority: '0.7', changefreq: 'monthly' },
  { path: '/join-experts-hub', priority: '0.6', changefreq: 'monthly' },
  { path: '/contact', priority: '0.6', changefreq: 'monthly' },
]

const mentorClient = createClient({
  projectId: '8pf5fxwy',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: true,
})

function escapeXml(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function toUrl(route) {
  const loc = route.path === '/' ? `${siteUrl}/` : `${siteUrl}${route.path}`

  return `  <url>
    <loc>${escapeXml(loc)}</loc>
    <lastmod>${route.lastmod || today}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>`
}

async function fetchDynamicRoutes() {
  try {
    const [blogs, experts] = await Promise.all([
      mentorClient.fetch(`*[_type == "blog" && status != "archived" && defined(slug.current)]{
        "slug": slug.current,
        "updatedAt": coalesce(_updatedAt, publishedAt)
      }`),
      mentorClient.fetch(`*[_type == "mentor" && defined(slug.current)]{
        "slug": slug.current,
        "updatedAt": _updatedAt
      }`),
    ])

    return [
      ...blogs.map(item => ({
        path: `/insights/${item.slug}`,
        lastmod: item.updatedAt?.slice(0, 10) || today,
        priority: '0.7',
        changefreq: 'weekly',
      })),
      ...experts.map(item => ({
        path: `/experts/${item.slug}`,
        lastmod: item.updatedAt?.slice(0, 10) || today,
        priority: '0.7',
        changefreq: 'weekly',
      })),
    ]
  } catch (error) {
    console.warn(`Could not fetch Sanity routes for sitemap: ${error.message}`)
    return []
  }
}

const dynamicRoutes = await fetchDynamicRoutes()
const routes = [...staticRoutes, ...dynamicRoutes]
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes.map(toUrl).join('\n')}
</urlset>
`

const robots = `User-agent: *
Allow: /
Disallow: /login
Disallow: /signup
Disallow: /dashboard

Sitemap: ${siteUrl}/sitemap.xml
`

await mkdir(publicDir, { recursive: true })
await writeFile(resolve(publicDir, 'sitemap.xml'), sitemap)
await writeFile(resolve(publicDir, 'robots.txt'), robots)

console.log(`Generated sitemap with ${routes.length} URLs for ${siteUrl}`)
