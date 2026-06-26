import {useEffect, useMemo, useState} from 'react'
import {ArrowLeft, ArrowRight, CheckCircle2, Minus, PackageOpen, Plus} from 'lucide-react'
import {Link, useParams} from 'react-router-dom'
import MagnaLoader from '../components/MagnaLoader'
import SEO from '../components/SEO'
import {mentorClient} from '../lib/sanityClient'

const productFields = `
  _id,
  title,
  "slug": slug.current,
  status,
  shortDescription,
  productUrl,
  buttonLabel,
  featured,
  displayOrder,
  "bannerImageUrl": bannerImage.asset->url,
  "bannerImageAlt": bannerImage.alt,
  sections[]{
    _key,
    eyebrow,
    sectionTitle,
    sectionFormat,
    defaultOpenItem,
    intro,
    body[],
    items[]{
      _key,
      title,
      description,
      "imageUrl": image.asset->url,
      "imageAlt": image.alt
    },
    "sectionImageUrl": sectionImage.asset->url,
    "sectionImageAlt": sectionImage.alt,
    cta{
      headline,
      description,
      buttonLabel,
      buttonUrl,
      "imageUrl": image.asset->url,
      "imageAlt": image.alt
    }
  },
  seoTitle,
  seoDescription
`

function blockText(block) {
  return block?.children?.map((child) => child.text).join('') || ''
}

function ProductRichText({blocks = []}) {
  return (
    <div className="space-y-4 text-base leading-8 text-gray-600">
      {blocks.map((block) => {
        const text = blockText(block)
        if (!text) return null

        if (block.style === 'h2' || block.style === 'h3') {
          return <h3 key={block._key} className="text-xl font-black text-gray-950">{text}</h3>
        }

        if (block.listItem) {
          return (
            <div key={block._key} className="flex items-start gap-3">
              <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-primary-600" />
              <p>{text}</p>
            </div>
          )
        }

        return <p key={block._key}>{text}</p>
      })}
    </div>
  )
}

function ProductAccordion({section, index}) {
  const initialItem = Number(section.defaultOpenItem)
  const [openIndex, setOpenIndex] = useState(
    Number.isInteger(initialItem) && initialItem > 0 ? initialItem - 1 : -1,
  )
  const hasSectionImage = Boolean(section.sectionImageUrl)
  const imageOnLeft = index % 2 === 0

  return (
    <section className="bg-[#f3f6fa] px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
      <div
        className={`mx-auto grid max-w-7xl items-center gap-10 ${
          hasSectionImage ? 'lg:grid-cols-2' : ''
        }`}
      >
        {hasSectionImage && (
          <div className={`relative ${imageOnLeft ? 'lg:order-1' : 'lg:order-2'}`}>
            <img
              src={section.sectionImageUrl}
              alt={section.sectionImageAlt || section.sectionTitle}
              className="aspect-[4/3] w-full object-contain drop-shadow-xl"
            />
          </div>
        )}

        <div className={hasSectionImage && imageOnLeft ? 'lg:order-2' : 'lg:order-1'}>
          <div className="mb-10">
            {section.eyebrow && (
              <p className="text-sm font-black uppercase tracking-[0.2em] text-primary-600">
                {section.eyebrow}
              </p>
            )}
            <h2 className="mt-3 text-3xl font-black text-[#000047] sm:text-4xl">
              {section.sectionTitle}
            </h2>
            {section.intro && <p className="mt-5 text-lg leading-8 text-gray-600">{section.intro}</p>}
          </div>

          <div className="divide-y divide-primary-200 border-t border-primary-300">
            {(section.items || []).map((item, itemIndex) => {
              const isOpen = openIndex === itemIndex
              const panelId = `product-accordion-${section._key || 'section'}-${itemIndex}`

              return (
                <article key={item._key || `${item.title}-${itemIndex}`} className="bg-white/65">
                  <button
                    type="button"
                    onClick={() => setOpenIndex(isOpen ? -1 : itemIndex)}
                    className="flex w-full items-center justify-between gap-6 px-5 py-5 text-left transition hover:bg-white sm:px-8"
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                  >
                    <span className="text-lg font-black text-gray-950 sm:text-xl">{item.title}</span>
                    {isOpen ? (
                      <Minus className="h-6 w-6 shrink-0 text-gray-950" aria-hidden="true" />
                    ) : (
                      <Plus className="h-6 w-6 shrink-0 text-gray-950" aria-hidden="true" />
                    )}
                  </button>

                  {isOpen && item.description && (
                    <div id={panelId} className="px-5 pb-7 sm:px-8">
                      <p className="max-w-4xl whitespace-pre-line text-base leading-8 text-gray-700">
                        {item.description}
                      </p>
                    </div>
                  )}
                </article>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}

function ProductSection({section, index}) {
  const format = section.sectionFormat || 'content'
  const imageOnLeft = index % 2 === 0
  const hasImage = Boolean(section.sectionImageUrl)

  if (format === 'cards') {
    return (
      <section className="bg-[#050545] px-4 py-16 text-white sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto mb-12 max-w-3xl text-center">
            {section.eyebrow && <p className="text-sm font-black uppercase tracking-[0.2em] text-cyan-200">{section.eyebrow}</p>}
            <h2 className="mt-3 text-3xl font-black sm:text-4xl">{section.sectionTitle}</h2>
            {section.intro && <p className="mt-5 text-lg leading-8 text-cyan-50/80">{section.intro}</p>}
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {(section.items || []).map((item, itemIndex) => (
              <article
                key={item._key || `${item.title}-${itemIndex}`}
                className="rounded-3xl border border-cyan-100/25 bg-gradient-to-br from-[#383ad7] via-[#258edc] to-[#0bbfcf] p-7 shadow-2xl shadow-black/20"
              >
                <div className="mx-auto flex h-16 w-16 items-center justify-center">
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.imageAlt || item.title || `Product feature ${itemIndex + 1}`}
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <span className="text-lg font-black text-primary-700">
                      {String(itemIndex + 1).padStart(2, '0')}
                    </span>
                  )}
                </div>
                <div className="text-center">
                  {item.title && <h3 className="mt-6 text-xl font-black">{item.title}</h3>}
                  {item.description && <p className="mt-3 leading-7 text-white/85">{item.description}</p>}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (format === 'differentiators') {
    return (
      <section className="bg-[#f6f7ff] px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto mb-12 max-w-3xl text-center">
            {section.eyebrow && <p className="text-sm font-black uppercase tracking-[0.2em] text-primary-600">{section.eyebrow}</p>}
            <h2 className="mt-3 text-3xl font-black text-[#000047] sm:text-4xl">{section.sectionTitle}</h2>
            {section.intro && <p className="mt-5 text-lg leading-8 text-gray-600">{section.intro}</p>}
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {(section.items || []).map((item, itemIndex) => (
              <article
                key={item._key || `${item.title}-${itemIndex}`}
                className={`rounded-3xl border p-7 shadow-xl ${
                  itemIndex % 2 === 0
                    ? 'border-gray-200 bg-white'
                    : 'border-cyan-200 bg-gradient-to-br from-primary-600 to-cyan-600 text-white'
                }`}
              >
                <div className="flex items-start gap-4">
                  <CheckCircle2 className={`mt-1 h-6 w-6 shrink-0 ${itemIndex % 2 === 0 ? 'text-primary-600' : 'text-cyan-100'}`} />
                  <div>
                    {item.title && <h3 className="text-xl font-black">{item.title}</h3>}
                    {item.description && (
                      <p className={`mt-3 whitespace-pre-line leading-7 ${itemIndex % 2 === 0 ? 'text-gray-600' : 'text-white/90'}`}>
                        {item.description}
                      </p>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (format === 'accordion') {
    return <ProductAccordion section={section} index={index} />
  }

  if (format === 'cta') {
    const cta = section.cta || {}
    return (
      <section className="bg-white px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        <div className="relative mx-auto grid max-w-7xl items-center gap-8 overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#000047] via-primary-700 to-cyan-600 p-8 text-white shadow-2xl lg:grid-cols-[1fr_auto] lg:p-12">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,255,255,0.18),transparent_35%)]" />
          <div className="relative max-w-3xl">
            {section.eyebrow && <p className="text-sm font-black uppercase tracking-[0.2em] text-cyan-200">{section.eyebrow}</p>}
            <h2 className="mt-3 text-3xl font-black sm:text-4xl">{cta.headline || section.sectionTitle}</h2>
            {(cta.description || section.intro) && <p className="mt-5 text-lg leading-8 text-cyan-50">{cta.description || section.intro}</p>}
            {cta.buttonLabel && cta.buttonUrl && (
              <a href={cta.buttonUrl} className="mt-7 inline-flex items-center rounded-full bg-white px-7 py-4 font-extrabold text-primary-700 shadow-xl transition hover:-translate-y-0.5">
                {cta.buttonLabel}
                <ArrowRight className="ml-2 h-5 w-5" />
              </a>
            )}
          </div>
          {cta.imageUrl && (
            <img src={cta.imageUrl} alt={cta.imageAlt || cta.headline || section.sectionTitle} className="relative max-h-64 w-full object-contain drop-shadow-xl lg:w-80" />
          )}
        </div>
      </section>
    )
  }

  return (
    <section className={index % 2 === 0 ? 'bg-white' : 'bg-[#f6f7ff]'}>
      <div className={`mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 lg:px-8 lg:py-24 ${hasImage ? 'lg:grid-cols-2' : ''}`}>
        {hasImage && (
          <div className={`relative ${imageOnLeft ? 'lg:order-1' : 'lg:order-2'}`}>
            <img
              src={section.sectionImageUrl}
              alt={section.sectionImageAlt || section.sectionTitle}
              className="aspect-[4/3] h-full w-full object-contain drop-shadow-xl"
            />
          </div>
        )}

        <div className={`${imageOnLeft && hasImage ? 'lg:order-2' : 'lg:order-1'} ${hasImage ? '' : 'mx-auto max-w-4xl text-center'}`}>
          {section.eyebrow && (
            <p className="mb-3 text-sm font-black uppercase tracking-[0.2em] text-primary-600">{section.eyebrow}</p>
          )}
          <h2 className="text-3xl font-black leading-tight text-[#000047] sm:text-4xl">{section.sectionTitle}</h2>
          {section.intro && <p className="mt-5 text-lg leading-8 text-gray-600">{section.intro}</p>}
          {section.body?.length > 0 && <div className="mt-6"><ProductRichText blocks={section.body} /></div>}

          {section.items?.length > 0 && (
            <div className={`mt-7 grid gap-4 ${hasImage ? '' : 'text-left sm:grid-cols-2'}`}>
              {section.items.map((item, itemIndex) => (
                <div key={item._key || `${item.title}-${itemIndex}`} className="flex gap-3 rounded-2xl border border-primary-100 bg-white p-4 shadow-sm">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary-600" />
                  <div>
                    {item.title && <h3 className="font-black text-gray-950">{item.title}</h3>}
                    {item.description && <p className="mt-1 leading-7 text-gray-600">{item.description}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </div>
    </section>
  )
}

function ProductCard({product}) {
  return (
    <Link
      to={`/products/${product.slug || product._id}`}
      className="group overflow-hidden rounded-3xl bg-white shadow-xl shadow-primary-900/5 ring-1 ring-gray-100 transition hover:-translate-y-1 hover:shadow-2xl"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-gradient-to-br from-[#000047] via-primary-700 to-cyan-500">
        {product.bannerImageUrl ? (
          <img
            src={product.bannerImageUrl}
            alt={product.bannerImageAlt || product.title}
            className="h-full w-full object-contain transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <PackageOpen className="h-16 w-16 text-white/80" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#000047]/70 to-transparent" />
        <p className="absolute bottom-4 left-5 text-xs font-black uppercase tracking-[0.2em] text-cyan-100">Software Product</p>
      </div>
      <div className="p-6">
        <h2 className="text-2xl font-black text-[#000047]">{product.title}</h2>
        <p className="mt-3 line-clamp-3 leading-7 text-gray-600">{product.shortDescription}</p>
        <span className="mt-6 inline-flex items-center font-extrabold text-primary-600">
          View Product
          <ArrowRight className="ml-2 h-5 w-5 transition group-hover:translate-x-1" />
        </span>
      </div>
    </Link>
  )
}

export default function Products() {
  const {slug} = useParams()
  const [products, setProducts] = useState([])
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let mounted = true

    async function fetchProducts() {
      setLoading(true)
      setError('')

      try {
        if (slug) {
          const data = await mentorClient.fetch(
            `*[_type == "products" && status == "published" && (slug.current == $slug || _id == $slug)][0] { ${productFields} }`,
            {slug},
          )
          if (mounted) setProduct(data || null)
        } else {
          const data = await mentorClient.fetch(
            `*[_type == "products" && status == "published"] | order(featured desc, coalesce(displayOrder, 9999) asc, title asc) { ${productFields} }`,
          )
          if (mounted) setProducts(data || [])
        }
      } catch (fetchError) {
        console.error('Products fetch failed:', fetchError)
        if (mounted) setError('Unable to load products right now.')
      } finally {
        if (mounted) setLoading(false)
      }
    }

    fetchProducts()
    return () => {
      mounted = false
    }
  }, [slug])

  const pageTitle = useMemo(
    () => (product ? `${product.seoTitle || product.title} | Magnafic Products` : 'Software Products | Magnafic'),
    [product],
  )

  if (loading) {
    return <div className="min-h-screen bg-[#f7f9ff] px-4 pb-16 pt-28"><MagnaLoader message="Loading products..." /></div>
  }

  if (error || (slug && !product)) {
    return (
      <div className="min-h-screen bg-[#f7f9ff] px-4 pb-16 pt-28">
        <SEO title="Product Not Found" path={slug ? `/products/${slug}` : '/products'} />
        <div className="mx-auto max-w-3xl rounded-3xl bg-white p-8 text-center shadow-xl">
          <h1 className="text-3xl font-black text-[#000047]">Product not found</h1>
          <p className="mt-3 text-gray-600">{error || 'This product is not currently available.'}</p>
          <Link to="/products" className="mt-6 inline-flex items-center rounded-full bg-primary-600 px-5 py-3 font-bold text-white">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Products
          </Link>
        </div>
      </div>
    )
  }

  if (product) {
    return (
      <div className="min-h-screen bg-white">
        <SEO
          title={pageTitle}
          description={product.seoDescription || product.shortDescription}
          path={`/products/${product.slug || product._id}`}
          image={product.bannerImageUrl}
        />
        <section className="relative overflow-hidden bg-[#000047] px-4 pb-8 pt-24 text-white sm:px-6 sm:pb-10 lg:px-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_40%,rgba(0,255,255,0.18),transparent_35%)]" />
          <div className="relative mx-auto grid max-w-7xl items-center gap-6 lg:grid-cols-[1.05fr_0.95fr]">
            <div>
              <h1 className="text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">{product.title}</h1>
              <p className="mt-4 max-w-2xl text-lg leading-8 text-cyan-50">{product.shortDescription}</p>
              {product.productUrl && (
                <a href={product.productUrl} className="mt-6 inline-flex items-center rounded-full bg-white px-7 py-4 font-extrabold text-primary-700 shadow-xl transition hover:-translate-y-0.5">
                  {product.buttonLabel || 'Explore Product'}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </a>
              )}
            </div>
            {product.bannerImageUrl && (
              <div className="relative">
                <img
                  src={product.bannerImageUrl}
                  alt={product.bannerImageAlt || product.title}
                  className="relative aspect-[4/3] w-full object-contain drop-shadow-2xl"
                />
              </div>
            )}
          </div>
        </section>

        <main>
          {product.sections?.length > 0 ? (
            product.sections.map((section, index) => (
              <ProductSection key={section._key || `${section.sectionTitle}-${index}`} section={section} index={index} />
            ))
          ) : (
            <section className="px-4 py-20 text-center sm:px-6">
              <h2 className="text-3xl font-black text-[#000047]">More product details are coming soon.</h2>
            </section>
          )}
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f7f9ff]">
      <SEO title={pageTitle} description="Explore Magnafic software products built for ambitious consumer businesses." path="/products" />
      <section className="bg-[#000047] px-4 pb-16 pt-28 text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <p className="text-sm font-black uppercase tracking-[0.22em] text-cyan-200">Products</p>
          <h1 className="mt-4 max-w-4xl text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">Software built to turn business intelligence into action</h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-cyan-50">Explore Magnafic software products designed for modern consumer businesses.</p>
        </div>
      </section>
      <section className="px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          {products.length > 0 ? (
            <div className="grid gap-7 md:grid-cols-2 lg:grid-cols-3">
              {products.map((item) => <ProductCard key={item._id} product={item} />)}
            </div>
          ) : (
            <div className="rounded-3xl bg-white p-10 text-center shadow-xl ring-1 ring-gray-100">
              <PackageOpen className="mx-auto h-12 w-12 text-primary-600" />
              <h2 className="mt-4 text-2xl font-black text-[#000047]">Products are coming soon</h2>
              <p className="mt-2 text-gray-600">Published products from Sanity will appear here.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
