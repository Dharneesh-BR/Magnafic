function formatInsightDate(value) {
  if (!value) return ''

  return new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function formatReadTime(value = '') {
  return String(value)
    .replace(/\bminutes?\b/gi, 'mins')
    .replace(/\bmin\b/gi, 'mins')
    .trim()
}

function titleCase(value = '') {
  return value
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

function getInsightType(item = {}) {
  if (item.contentKind === 'video' || item.youtubeUrl) return 'Video'
  if (item.type) return titleCase(item.type)
  if (item.category) return titleCase(item.category)
  return 'Insight'
}

export default function InsightMeta({ item, className = '', tone = 'light' }) {
  const insightType = getInsightType(item)
  const readTime = formatReadTime(item.readTime || item.duration || '')
  const publishedAt = formatInsightDate(item.publishedAt)
  const items = [insightType, publishedAt, readTime].filter(Boolean)

  if (!items.length) return null

  const textClass = tone === 'dark' ? 'text-black' : 'text-black'
  const summary = items.join(' | ').toUpperCase()

  return (
    <div title={summary} className={`flex min-w-0 max-w-full flex-nowrap items-center gap-2 overflow-hidden whitespace-nowrap text-[10px] font-black uppercase tracking-[0.14em] ${textClass} ${className}`}>
      {items.map((value) => (
        <span key={value} className="min-w-0 truncate after:ml-2 after:text-gray-300 after:content-['|'] last:after:hidden">
          {value}
        </span>
      ))}
    </div>
  )
}
