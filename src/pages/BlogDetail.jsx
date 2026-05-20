import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Calendar, Clock, FileText, Sparkles, Tag } from 'lucide-react'
import { blogClient } from '../lib/sanityClient'

function formatDate(dateString) {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  })
}

function getTypeLabel(type) {
  switch (type) {
    case 'research':
      return 'Research & Insights'
    case 'article':
      return 'Article'
    case 'case-study':
      return 'Case Study'
    default:
      return 'Insight'
  }
}

function renderSpan(child, markDefs = []) {
  const marks = child.marks || []

  return marks.reduce((content, mark) => {
    const markDef = markDefs.find(def => def._key === mark)

    if (mark === 'strong') {
      return <strong key={mark} className="font-semibold text-gray-950">{content}</strong>
    }

    if (mark === 'em') {
      return <em key={mark}>{content}</em>
    }

    if (mark === 'underline') {
      return <span key={mark} className="underline">{content}</span>
    }

    if (mark === 'code') {
      return <code key={mark} className="rounded-md bg-primary-50 px-1.5 py-0.5 text-sm font-semibold text-primary-700">{content}</code>
    }

    if (markDef?._type === 'link' && markDef.href) {
      return (
        <a
          key={mark}
          href={markDef.href}
          target={markDef.blank === false ? undefined : '_blank'}
          rel="noreferrer"
          className="font-semibold text-primary-600 underline decoration-primary-200 underline-offset-4 hover:text-primary-700"
        >
          {content}
        </a>
      )
    }

    return content
  }, child.text)
}

function renderBlockText(block) {
  return block.children?.map(child => (
    <span key={child._key}>{renderSpan(child, block.markDefs)}</span>
  ))
}

function renderBlock(block) {
  if (block._type === 'image') {
    const imageUrl = block.asset?.url

    if (!imageUrl) return null

    return (
      <figure key={block._key} className="my-12">
        <img
          src={imageUrl}
          alt={block.alt || ''}
          className="w-full rounded-[2rem] object-cover shadow-2xl shadow-primary-900/10"
        />
        {block.caption && (
          <figcaption className="mt-4 text-center text-sm font-medium text-gray-500">{block.caption}</figcaption>
        )}
      </figure>
    )
  }

  if (block._type !== 'block') return null

  switch (block.style) {
    case 'h1':
      return <h1 key={block._key} className="mt-14 mb-5 text-4xl font-bold leading-tight text-gray-950">{renderBlockText(block)}</h1>
    case 'h2':
      return <h2 key={block._key} className="mt-14 mb-5 text-3xl font-bold leading-tight text-gray-950">{renderBlockText(block)}</h2>
    case 'h3':
      return <h3 key={block._key} className="mt-10 mb-4 text-2xl font-semibold leading-tight text-gray-950">{renderBlockText(block)}</h3>
    case 'blockquote':
      return (
        <blockquote key={block._key} className="my-10 rounded-r-[2rem] border-l-4 border-cyan-400 bg-primary-50/80 px-7 py-6 text-xl font-semibold italic leading-9 text-primary-900">
          {renderBlockText(block)}
        </blockquote>
      )
    default:
      return <p key={block._key} className="mb-7 text-lg leading-9 text-gray-700">{renderBlockText(block)}</p>
  }
}

function renderContent(blocks = []) {
  const rendered = []

  for (let index = 0; index < blocks.length; index += 1) {
    const block = blocks[index]

    if (block._type === 'block' && block.listItem) {
      const listType = block.listItem === 'number' ? 'ol' : 'ul'
      const items = []

      while (
        index < blocks.length &&
        blocks[index]._type === 'block' &&
        blocks[index].listItem === block.listItem
      ) {
        items.push(blocks[index])
        index += 1
      }

      index -= 1

      const ListTag = listType
      rendered.push(
        <ListTag
          key={block._key}
          className={`mb-9 ml-6 space-y-3 text-lg leading-9 text-gray-700 marker:font-bold marker:text-primary-600 ${
            listType === 'ol' ? 'list-decimal' : 'list-disc'
          }`}
        >
          {items.map(item => (
            <li key={item._key}>{renderBlockText(item)}</li>
          ))}
        </ListTag>
      )
      continue
    }

    rendered.push(renderBlock(block))
  }

  return rendered
}

export default function BlogDetail() {
  const { slug } = useParams()
  const [blog, setBlog] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchBlog = async () => {
      setLoading(true)
      setError('')

      try {
        const query = `*[_type == "blog" && (slug.current == $slug || _id == $slug)][0] {
          _id,
          title,
          "slug": slug.current,
          excerpt,
          type,
          category,
          publishedAt,
          readTime,
          "imageUrl": mainImage.asset->url,
          "content": coalesce(
            content[]{..., asset->{url}},
            body[]{..., asset->{url}},
            articleBody[]{..., asset->{url}},
            []
          ),
          "contentText": coalesce(string(content), string(body), string(articleBody))
        }`

        const data = await blogClient.fetch(query, { slug })
        setBlog(data)
      } catch (fetchError) {
        console.error('Error fetching blog:', fetchError)
        setError('We could not load this insight right now.')
      } finally {
        setLoading(false)
      }
    }

    fetchBlog()
  }, [slug])

  const content = useMemo(() => renderContent(blog?.content), [blog?.content])

  if (loading) {
    return (
      <div className="min-h-screen bg-white px-4 pt-32 pb-20">
        <div className="mx-auto max-w-4xl text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-b-2 border-primary-600"></div>
          <p className="mt-4 text-gray-600">Loading insight...</p>
        </div>
      </div>
    )
  }

  if (error || !blog) {
    return (
      <div className="min-h-screen bg-white px-4 pt-32 pb-20">
        <div className="mx-auto max-w-3xl text-center">
          <FileText className="mx-auto mb-6 h-14 w-14 text-primary-500" />
          <h1 className="mb-4 text-3xl font-bold text-gray-950">Insight not found</h1>
          <p className="mb-8 text-gray-600">{error || 'The insight you are looking for is not available.'}</p>
          <Link to="/insights" className="inline-flex items-center rounded-full bg-primary-600 px-6 py-3 font-semibold text-white hover:bg-primary-700">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Insights
          </Link>
        </div>
      </div>
    )
  }

  return (
    <article className="min-h-screen bg-[#f7f9ff]">
      <section className="relative overflow-hidden bg-primary-900 px-4 pt-28 pb-20 text-white sm:px-6 lg:px-8">
        {blog.imageUrl && (
          <>
            <img
              src={blog.imageUrl}
              alt=""
              aria-hidden="true"
              className="absolute inset-0 h-full w-full object-cover opacity-25"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-primary-900 via-primary-900/95 to-cyan-900/80"></div>
          </>
        )}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_22%,rgba(0,255,255,0.16),transparent_30%),radial-gradient(circle_at_82%_14%,rgba(255,255,255,0.12),transparent_26%)]"></div>

        <div className="relative mx-auto max-w-6xl">
          <Link to="/insights" className="mb-10 inline-flex items-center rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-cyan-100 ring-1 ring-white/15 transition hover:bg-white/15 hover:text-white">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Insights
          </Link>

          <div className="grid gap-10 lg:grid-cols-[1fr_380px] lg:items-end">
            <div>
              <div className="mb-6 flex flex-wrap gap-3">
                {blog.category && (
                  <span className="inline-flex items-center rounded-full bg-white px-4 py-2 text-sm font-bold text-primary-700 shadow-lg shadow-primary-950/10">
                    <Tag className="mr-2 h-4 w-4" />
                    {blog.category}
                  </span>
                )}
                <span className="inline-flex items-center rounded-full bg-cyan-400/15 px-4 py-2 text-sm font-semibold text-cyan-100 ring-1 ring-cyan-200/20">
                  <Sparkles className="mr-2 h-4 w-4" />
                  {getTypeLabel(blog.type)}
                </span>
              </div>

              <h1 className="max-w-5xl text-4xl font-bold leading-tight md:text-6xl">
                {blog.title}
              </h1>

              {blog.excerpt && (
                <p className="mt-6 max-w-3xl text-lg leading-8 text-gray-200 md:text-xl">
                  {blog.excerpt}
                </p>
              )}
            </div>

            <div className="rounded-[2rem] border border-white/15 bg-white/10 p-5 shadow-2xl shadow-primary-950/20 backdrop-blur">
              <p className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-cyan-100">Reading Brief</p>
              <div className="space-y-4 text-sm text-gray-100">
                {blog.publishedAt && (
                  <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-4">
                    <span className="inline-flex items-center text-gray-300">
                      <Calendar className="mr-2 h-4 w-4 text-cyan-200" />
                      Published
                    </span>
                    <span className="text-right font-semibold">{formatDate(blog.publishedAt)}</span>
                  </div>
                )}
                {blog.readTime && (
                  <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-4">
                    <span className="inline-flex items-center text-gray-300">
                      <Clock className="mr-2 h-4 w-4 text-cyan-200" />
                      Read time
                    </span>
                    <span className="text-right font-semibold">{blog.readTime}</span>
                  </div>
                )}
                <div className="flex items-center justify-between gap-4">
                  <span className="inline-flex items-center text-gray-300">
                    <FileText className="mr-2 h-4 w-4 text-cyan-200" />
                    Format
                  </span>
                  <span className="text-right font-semibold">{getTypeLabel(blog.type)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {blog.imageUrl && (
        <div className="relative px-4 sm:px-6 lg:px-8">
          <div className="mx-auto -mt-12 max-w-6xl">
            <img
              src={blog.imageUrl}
              alt={blog.title}
              className="h-[300px] w-full rounded-[2rem] object-cover shadow-2xl shadow-primary-900/20 ring-1 ring-white md:h-[500px]"
            />
          </div>
        </div>
      )}

      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[220px_1fr]">
          <aside className="hidden lg:block">
            <div className="sticky top-24 rounded-[1.5rem] bg-white p-5 shadow-lg shadow-primary-900/5 ring-1 ring-gray-100">
              <p className="mb-4 text-sm font-bold uppercase tracking-[0.16em] text-gray-400">Insight</p>
              <div className="space-y-3 text-sm text-gray-600">
                {blog.category && (
                  <p className="rounded-2xl bg-primary-50 px-3 py-2 font-semibold text-primary-700">{blog.category}</p>
                )}
                {blog.publishedAt && <p>{formatDate(blog.publishedAt)}</p>}
                {blog.readTime && <p>{blog.readTime}</p>}
              </div>
            </div>
          </aside>

          <div className="rounded-[2rem] bg-white px-6 py-10 shadow-xl shadow-primary-900/5 ring-1 ring-gray-100 sm:px-10 lg:px-14">
            <div className="mx-auto max-w-3xl">
              {content.length > 0 ? (
                content
              ) : (
                <p className="text-lg leading-9 text-gray-700">
                  {blog.contentText || blog.excerpt || 'This insight does not have any published content yet.'}
                </p>
              )}

              <div className="mt-14 border-t border-gray-200 pt-8">
                <Link to="/insights" className="inline-flex items-center rounded-full bg-primary-600 px-6 py-3 font-semibold text-white shadow-lg shadow-primary-600/20 transition hover:bg-primary-700">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Insights
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </article>
  )
}
