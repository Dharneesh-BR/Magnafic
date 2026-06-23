import { useEffect, useRef, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import {
  AlertCircle, ArrowLeft, BarChart3, ChevronDown, Lightbulb,
  BookOpen, Loader2, LogOut, Menu, MessageSquarePlus, Mic, MicOff, Newspaper,
  PanelLeftClose, PanelLeftOpen, Send, Sparkles,
  Table2, X,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { callResearchWorkflow } from '../lib/aiCopilot'
import { clearAuthUser } from '../lib/auth'
import { mentorClient } from '../lib/sanityClient'

const PROMPT_KEY = 'magnafic-copilot-prompt'

function formatDate(value) {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '' : new Intl.DateTimeFormat('en', {
    day: '2-digit', month: 'short',
  }).format(date)
}

function ListCard({ title, items, icon: Icon, tone = 'cyan' }) {
  if (!items?.length) return null
  const tones = {
    cyan: 'border-cyan-300/35 bg-gradient-to-br from-cyan-400/20 to-blue-500/10 text-cyan-100',
    blue: 'border-blue-300/35 bg-gradient-to-br from-blue-400/20 to-indigo-500/10 text-blue-100',
    green: 'border-emerald-300/40 bg-gradient-to-br from-emerald-400/25 to-green-600/10 text-emerald-100',
    red: 'border-rose-300/40 bg-gradient-to-br from-rose-400/25 to-red-600/10 text-rose-100',
    teal: 'border-teal-300/40 bg-gradient-to-br from-teal-400/25 to-cyan-600/10 text-teal-100',
    amber: 'border-amber-300/35 bg-gradient-to-br from-amber-400/20 to-orange-500/10 text-amber-100',
    violet: 'border-violet-300/35 bg-gradient-to-br from-violet-400/20 to-purple-600/10 text-violet-100',
  }
  return (
    <section className={`rounded-2xl border p-5 ${tones[tone]}`}>
      <h3 className="flex items-center gap-2 text-sm font-extrabold uppercase tracking-[0.12em]">
        <Icon className="h-5 w-5" /> {title}
      </h3>
      <ul className="mt-4 space-y-3 text-sm leading-6 text-white/85">
        {items.map((item, index) => (
          <li key={`${title}-${index}`} className="flex gap-3">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-current" />
            <span>{typeof item === 'string' ? item : item?.text || JSON.stringify(item)}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}

const CHART_COLORS = ['#22d3ee', '#818cf8', '#34d399', '#fbbf24', '#fb7185', '#c084fc']

function BarChart({ visual }) {
  const values = (visual.values || []).map(Number).filter(Number.isFinite)
  const labels = (visual.labels || []).slice(0, values.length)
  if (!values.length || labels.length !== values.length) return null
  const maxValue = Math.max(...values, 1)

  return (
    <div className="mt-5 space-y-3">
      {values.map((value, index) => (
        <div key={`${labels[index]}-${index}`} className="grid grid-cols-[minmax(7rem,0.8fr)_2fr_auto] items-center gap-3 text-sm">
          <span className="truncate text-white/70" title={labels[index]}>{labels[index]}</span>
          <div className="h-7 overflow-hidden rounded-md bg-white/5">
            <div
              className="flex h-full min-w-1 items-center rounded-md px-2 font-bold text-[#000047] transition-all"
              style={{
                width: `${Math.max((value / maxValue) * 100, 3)}%`,
                backgroundColor: CHART_COLORS[index % CHART_COLORS.length],
              }}
            />
          </div>
          <span className="font-extrabold text-white">{value.toLocaleString()}</span>
        </div>
      ))}
    </div>
  )
}

function PieChart({ visual }) {
  const values = (visual.values || []).map(Number).filter((value) => Number.isFinite(value) && value >= 0)
  const labels = (visual.labels || []).slice(0, values.length)
  const total = values.reduce((sum, value) => sum + value, 0)
  if (!total || labels.length !== values.length) return null

  let offset = 0
  const stops = values.map((value, index) => {
    const start = (offset / total) * 100
    offset += value
    const end = (offset / total) * 100
    return `${CHART_COLORS[index % CHART_COLORS.length]} ${start}% ${end}%`
  })

  return (
    <div className="mt-5 grid items-center gap-5 sm:grid-cols-[11rem_1fr]">
      <div
        className="mx-auto aspect-square w-40 rounded-full border-4 border-white/10 shadow-[0_0_25px_rgba(34,211,238,0.12)]"
        style={{ background: `conic-gradient(${stops.join(',')})` }}
        role="img"
        aria-label={visual.title}
      />
      <div className="space-y-2">
        {values.map((value, index) => (
          <div key={`${labels[index]}-${index}`} className="flex items-center justify-between gap-4 text-sm">
            <span className="flex min-w-0 items-center gap-2 text-white/70">
              <span className="h-3 w-3 shrink-0 rounded-sm" style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }} />
              <span className="truncate">{labels[index]}</span>
            </span>
            <span className="font-extrabold text-white">{((value / total) * 100).toFixed(1)}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function DataTable({ visual }) {
  const columns = visual.columns || []
  const rows = (visual.rows || []).filter((row) => Array.isArray(row) && row.length === columns.length)
  if (!columns.length || !rows.length) return null

  return (
    <div className="mt-5 overflow-x-auto rounded-xl border border-white/10">
      <table className="w-full min-w-[34rem] text-left text-sm">
        <thead className="bg-cyan-300/10 text-cyan-100">
          <tr>{columns.map((column) => <th key={column} className="px-4 py-3 font-extrabold">{column}</th>)}</tr>
        </thead>
        <tbody className="divide-y divide-white/10 text-white/75">
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex} className="transition hover:bg-white/5">
              {row.map((cell, cellIndex) => <td key={cellIndex} className="px-4 py-3 align-top">{cell}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function Visuals({ visuals = [] }) {
  const usableVisuals = visuals.filter((visual) => {
    if (visual.kind === 'table') return visual.columns?.length && visual.rows?.length
    if (visual.kind === 'chart') return visual.labels?.length && visual.values?.length
    return visual.kind === 'infographic' && visual.description
  })
  if (!usableVisuals.length) return null

  return (
    <section className="rounded-2xl border border-cyan-300/20 bg-gradient-to-br from-cyan-400/10 to-violet-500/10 p-5 sm:p-6">
      <h3 className="flex items-center gap-2 text-sm font-extrabold uppercase tracking-[0.12em] text-cyan-200">
        <BarChart3 className="h-5 w-5" /> Data and comparisons
      </h3>
      <div className="mt-5 space-y-5">
        {usableVisuals.map((visual, index) => (
          <div key={`${visual.title}-${index}`} className="rounded-2xl border border-white/10 bg-[#08085c]/80 p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-cyan-300">
                  {visual.kind === 'chart' ? `${visual.chartType || 'bar'} chart` : visual.kind}
                </p>
                <h4 className="mt-1 font-extrabold text-white">{visual.title}</h4>
              </div>
              {visual.kind === 'table' && <Table2 className="h-5 w-5 shrink-0 text-cyan-300" />}
            </div>
            {visual.description && <p className="mt-2 text-sm leading-6 text-white/55">{visual.description}</p>}
            {visual.kind === 'chart' && visual.chartType === 'pie' && <PieChart visual={visual} />}
            {visual.kind === 'chart' && visual.chartType !== 'pie' && <BarChart visual={visual} />}
            {visual.kind === 'table' && <DataTable visual={visual} />}
            {visual.kind === 'infographic' && (
              <div className="mt-4 rounded-xl bg-violet-300/10 p-4 text-sm leading-6 text-violet-100">
                {visual.description}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}

function sectionTone(title = '') {
  const value = title.toLowerCase()
  if (/(risk|threat|challenge|weakness|con)/.test(value)) return 'red'
  if (/(opportun|benefit|strength|advantage|pro)/.test(value)) return 'green'
  if (/(recommend|strategy|action|roadmap)/.test(value)) return 'blue'
  if (/(next|implementation|timeline)/.test(value)) return 'teal'
  if (/(assumption|limitation|caution)/.test(value)) return 'amber'
  if (/(insight|analysis|market|research)/.test(value)) return 'violet'
  return 'cyan'
}

function legacyToDynamicReport(report) {
  if (!report || report.sections?.length) return report
  const sections = []
  const addText = (title, text) => text?.trim() && sections.push({ title, contentType: 'text', text })
  const addList = (title, items) => items?.length && sections.push({ title, contentType: 'list', items })
  addText('Executive summary', report.executiveSummary)
  addList('Key findings', report.keyFindings)
  addList('Market insights', report.marketInsights)
  addList('Opportunities', report.opportunities)
  addList('Risks', report.risks)
  addText('Business analysis', report.businessAnalysis)
  addList('Recommendations', report.recommendations)
  ;(report.visualSuggestions || []).forEach((visual) => sections.push({
    ...visual,
    contentType: visual.kind === 'table' ? 'table' : 'chart',
  }))
  addList('Next steps', report.nextSteps)
  addList('Assumptions and limitations', [
    ...(report.assumptions || []),
    ...(report.lowConfidenceStatements || []),
  ])
  return { title: report.title || 'Research report', sections }
}

function DynamicSection({ section }) {
  if (!section?.title) return null
  if (section.contentType === 'chart') return <Visuals visuals={[{ ...section, kind: 'chart' }]} />
  if (section.contentType === 'table') return <Visuals visuals={[{ ...section, kind: 'table' }]} />
  if (section.contentType === 'list') {
    return <ListCard title={section.title} items={section.items} icon={Sparkles} tone={sectionTone(section.title)} />
  }
  if (!section.text?.trim()) return null
  return (
    <section className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/10 to-white/[0.03] p-5 sm:p-6">
      <h3 className="text-sm font-extrabold uppercase tracking-[0.12em] text-cyan-200">{section.title}</h3>
      {section.description && <p className="mt-2 text-sm text-white/50">{section.description}</p>}
      <div className="mt-4 text-sm leading-7 text-white/80 sm:text-base">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{section.text}</ReactMarkdown>
      </div>
    </section>
  )
}

function Report({ report, question, user, workflowName }) {
  const dynamicReport = legacyToDynamicReport(report)
  if (!dynamicReport) return null
  return (
    <article className="mx-auto w-full max-w-5xl space-y-5 pb-8">
      {question && (
        <div className="flex justify-end gap-3 py-2">
          <div className="max-w-[88%] rounded-[1.4rem] rounded-tr-md border border-cyan-300/20 bg-[#17175f] px-5 py-4 text-sm font-medium leading-7 text-white shadow-lg shadow-black/10 sm:max-w-[75%] sm:text-base">
            {question}
          </div>
          {user?.imageUrl ? (
            <img
              src={user.imageUrl}
              alt={user.name || 'User'}
              className="h-10 w-10 shrink-0 rounded-full border border-cyan-300/30 object-cover"
            />
          ) : (
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-cyan-300/25 bg-cyan-300/10 text-sm font-extrabold text-cyan-100">
              {(user?.name || user?.email || 'U').charAt(0).toUpperCase()}
            </span>
          )}
        </div>
      )}
      <div className="flex items-center gap-3 pt-2">
        <img src="/Copilot 5.png" alt="" className="h-11 w-11 object-contain" />
        <div>
          <p className="font-extrabold text-white">Magnafic Copilot</p>
          <p className="text-xs text-cyan-100/50">{workflowName || 'Copilot response'}</p>
        </div>
      </div>
      {dynamicReport.title && (
        <h2 className="rounded-3xl border border-cyan-300/20 bg-gradient-to-br from-cyan-300/10 to-violet-400/10 px-6 py-5 text-xl font-extrabold text-white shadow-[0_0_45px_rgba(0,255,255,0.06)] sm:text-2xl">
          {dynamicReport.title}
        </h2>
      )}
      {(dynamicReport.sections || []).map((section, index) => (
        <DynamicSection key={`${section.title}-${index}`} section={section} />
      ))}

    </article>
  )
}

function isUsableReport(report) {
  const dynamicReport = legacyToDynamicReport(report)
  return Boolean(
    dynamicReport?.title?.trim() &&
    dynamicReport?.sections?.some((section) => (
      section?.text?.trim() ||
      section?.items?.length ||
      section?.rows?.length ||
      section?.values?.length
    ))
  )
}

function normalizeReport(report) {
  if (!report || typeof report !== 'string') return report
  try {
    return JSON.parse(report)
  } catch {
    return null
  }
}

function ChatConversation({ messages, user, sending }) {
  return (
    <div className="mx-auto w-full max-w-4xl space-y-7 pb-8">
      {messages.map((message) => (
        message.role === 'user' ? (
          <div key={message._key} className="flex justify-end gap-3">
            <div className="max-w-[85%] rounded-[1.4rem] rounded-tr-md border border-cyan-300/20 bg-[#17175f] px-5 py-3 text-sm leading-7 text-white sm:max-w-[75%]">
              {message.content}
            </div>
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-cyan-300/25 bg-cyan-300/10 text-sm font-extrabold text-cyan-100">
              {(user?.name || user?.email || 'U').charAt(0).toUpperCase()}
            </span>
          </div>
        ) : (
          <div key={message._key} className="flex items-start gap-3">
            <img src="/Copilot 5.png" alt="" className="h-11 w-11 shrink-0 object-contain" />
            <div className="max-w-[88%] rounded-[1.4rem] rounded-tl-md border border-white/10 bg-white/5 px-5 py-4 text-sm leading-7 text-white/85">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
            </div>
          </div>
        )
      ))}
      {sending && (
        <div className="flex items-center gap-3">
          <img src="/Copilot 5.png" alt="" className="h-11 w-11 object-contain" />
          <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm text-white/55">
            <Loader2 className="h-4 w-4 animate-spin text-cyan-300" />
            Magnafic Copilot is thinking…
          </div>
        </div>
      )}
    </div>
  )
}

export default function IntelligenceOS({ onClose }) {
  const navigate = useNavigate()
  const [workspace, setWorkspace] = useState(null)
  const [sessions, setSessions] = useState([])
  const [activeSessionId, setActiveSessionId] = useState('')
  const [messages, setMessages] = useState([])
  const [prompt, setPrompt] = useState(() => sessionStorage.getItem(PROMPT_KEY) || '')
  const [businessContext, setBusinessContext] = useState('')
  const [files, setFiles] = useState([])
  const [incompleteQuestion, setIncompleteQuestion] = useState('')
  const [loading, setLoading] = useState(true)
  const [loadingSession, setLoadingSession] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [retrySeconds, setRetrySeconds] = useState(0)
  const [servicesOpen, setServicesOpen] = useState(false)
  const [capabilities, setCapabilities] = useState([])
  const [selectedWorkflowId, setSelectedWorkflowId] = useState('')
  const recognitionRef = useRef(null)
  const textareaRef = useRef(null)

  useEffect(() => {
    callResearchWorkflow('bootstrap')
      .then((data) => {
        setWorkspace(data)
        setSessions(data.sessions || [])
      })
      .catch((loadError) => setError(loadError.message))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    mentorClient.fetch(
      `*[_type == "capabilities"] | order(coalesce(displayOrder, 9999) asc, title asc) {
        _id, title, "slug": slug.current
      }`
    )
      .then((data) => setCapabilities(data || []))
      .catch((capabilityError) => console.error('Expert services failed to load:', capabilityError))
  }, [])

  useEffect(() => () => recognitionRef.current?.stop(), [])

  useEffect(() => {
    if (retrySeconds <= 0) return undefined
    const timer = window.setInterval(() => {
      setRetrySeconds((current) => Math.max(0, current - 1))
    }, 1000)
    return () => window.clearInterval(timer)
  }, [retrySeconds])

  const startNew = () => {
    setActiveSessionId('')
    setMessages([])
    setPrompt('')
    setBusinessContext('')
    setFiles([])
    setIncompleteQuestion('')
    setError('')
    setRetrySeconds(0)
    setSelectedWorkflowId('')
    setSidebarOpen(false)
  }

  const openMenuPage = (path) => {
    setSidebarOpen(false)
    navigate(path)
  }

  const handleLogout = async () => {
    setError('')
    try {
      await clearAuthUser()
      navigate('/', { replace: true })
    } catch (logoutError) {
      console.error('Magnafic Copilot logout failed:', logoutError)
      setError('Unable to log out right now. Please try again.')
    }
  }

  const openSession = async (sessionId) => {
    setLoadingSession(true)
    setError('')
    try {
      const data = await callResearchWorkflow('session', { sessionId })
      setActiveSessionId(data.session._id)
      setMessages(data.session.messages || [])
      if (data.session.projectWorkflowId) {
        setSelectedWorkflowId(data.session.projectWorkflowId)
      } else {
        setSelectedWorkflowId('')
      }
      const storedReport = normalizeReport(
        [...(data.session.messages || [])].reverse().find((item) => item.report)?.report
      )
      const originalQuestion = data.session.projectQuestion
        || (data.session.messages || []).find((item) => item.role === 'user')?.content
        || data.session.sessionTitle
        || ''
      if (storedReport && !isUsableReport(storedReport)) {
        setIncompleteQuestion(originalQuestion)
        setPrompt(originalQuestion)
      } else {
        setIncompleteQuestion('')
        setPrompt('')
      }
      setSidebarOpen(false)
    } catch (sessionError) {
      setError(sessionError.message)
    } finally {
      setLoadingSession(false)
    }
  }

  const submit = async (event, questionOverride = '', reuseCurrentSession = false) => {
    event?.preventDefault()
    const question = String(questionOverride || prompt).trim()
    if (!question || sending) return
    const shouldReuseSession = reuseCurrentSession || (!selectedWorkflowId && Boolean(activeSessionId))
    const optimistic = { _key: `pending-${Date.now()}`, role: 'user', content: question }
    setMessages((current) => (
      shouldReuseSession ? [...current, optimistic] : [optimistic]
    ))
    setPrompt('')
    setSending(true)
    setError('')
    setRetrySeconds(0)
    sessionStorage.removeItem(PROMPT_KEY)
    try {
      const data = await callResearchWorkflow('research', {
        sessionId: shouldReuseSession ? activeSessionId : '',
        question,
        businessContext: businessContext.trim(),
        files,
        workflowId: selectedWorkflowId,
      })
      setActiveSessionId(data.sessionId)
      setIncompleteQuestion('')
      if (data.tokenUsage) {
        setWorkspace((current) => ({ ...current, tokenUsage: data.tokenUsage }))
      }
      setMessages((current) => (
        shouldReuseSession
          ? [
              ...current.filter((item) => item._key !== optimistic._key),
              data.userMessage,
              data.assistantMessage,
            ]
          : [data.userMessage, data.assistantMessage]
      ))
      const now = new Date().toISOString()
      setSessions((current) => {
        const found = current.some((item) => item._id === data.sessionId)
        if (found) return current.map((item) => item._id === data.sessionId
          ? {
              ...item,
              sessionTitle: selectedWorkflowId
                ? (question.length > 80 ? `${question.slice(0, 77)}...` : question)
                : item.sessionTitle,
              updatedAt: now,
              messageCount: (item.messageCount || 0) + 2,
            }
          : item)
        return [{
          _id: data.sessionId,
          sessionTitle: question.length > 80 ? `${question.slice(0, 77)}...` : question,
          updatedAt: now,
          messageCount: 2,
        }, ...current]
      })
    } catch (submitError) {
      setMessages((current) => current.filter((item) => item._key !== optimistic._key))
      setPrompt(question)
      if (submitError.code === 'DAILY_TOKEN_LIMIT_REACHED') {
        setRetrySeconds(0)
        setError(submitError.message)
      } else if (submitError.status === 429) {
        setRetrySeconds(submitError.retryAfter || 30)
        setError('Magnafic Copilot has reached its current request limit. Your question is preserved—retry when the countdown ends.')
      } else {
        setError(submitError.message)
      }
    } finally {
      setSending(false)
    }
  }

  const voice = () => {
    if (isListening) return recognitionRef.current?.stop()
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) return setError('Voice input is not supported in this browser.')
    const recognition = new SpeechRecognition()
    recognition.interimResults = true
    recognition.lang = navigator.language || 'en-IN'
    const original = prompt.trim()
    recognition.onstart = () => setIsListening(true)
    recognition.onresult = (event) => {
      const spoken = Array.from(event.results).map((result) => result[0].transcript).join(' ')
      setPrompt([original, spoken].filter(Boolean).join(' '))
    }
    recognition.onerror = () => setError('Voice input could not be captured.')
    recognition.onend = () => { setIsListening(false); recognitionRef.current = null }
    recognitionRef.current = recognition
    recognition.start()
  }

  if (loading) return (
    <section className="fixed inset-0 z-50 flex items-center justify-center bg-[#000047] text-cyan-200">
      <Loader2 className="h-8 w-8 animate-spin" />
    </section>
  )

  if (!workspace) return (
    <section className="fixed inset-0 z-50 flex items-center justify-center bg-[#000047] p-5">
      <div className="max-w-lg rounded-2xl border border-red-300/20 bg-white/5 p-6 text-white">
        <AlertCircle className="h-7 w-7 text-red-300" />
        <h2 className="mt-4 text-xl font-bold">Magnafic Copilot is unavailable</h2>
        <p className="mt-2 text-white/65">{error}</p>
        {onClose && <button onClick={onClose} className="mt-5 rounded-full bg-cyan-400 px-5 py-2 font-bold text-[#000047]">Close</button>}
      </div>
    </section>
  )

  const latestStoredReport = normalizeReport(
    [...messages].reverse().find((item) => item.report)?.report
  )
  const latestReport = isUsableReport(latestStoredReport) ? latestStoredReport : null
  const hasIncompleteStoredReport = Boolean(latestStoredReport && !latestReport)
  const latestQuestion = [...messages].reverse().find((item) => item.role === 'user')?.content || ''
  const isFreshResearch = messages.length === 0 && !activeSessionId
  const recoverableQuestion = incompleteQuestion
    || messages.find((item) => item.role === 'user')?.content
    || prompt
  const selectedWorkflow = workspace.workflows?.find((workflow) => workflow._id === selectedWorkflowId)
  const tokenUsage = workspace.tokenUsage || {}
  const tokenLimit = tokenUsage.limit || 10000
  const tokenUsed = tokenUsage.used || 0
  const tokenPercent = Math.min((tokenUsed / tokenLimit) * 100, 100)

  return (
    <section className="fixed inset-0 z-50 flex overflow-hidden bg-[#000047] text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_55%_40%,rgba(0,255,255,0.14),transparent_43%)]" />
      {sidebarOpen && <button className="fixed inset-0 z-40 bg-black/60 lg:hidden" onClick={() => setSidebarOpen(false)} aria-label="Close history" />}

      <aside className={`fixed inset-y-0 left-0 z-50 flex w-[17rem] flex-col border-r border-cyan-300/25 bg-[#000047] p-4 transition-all lg:static ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } ${sidebarCollapsed ? 'lg:w-0 lg:-translate-x-full lg:overflow-hidden lg:p-0' : 'lg:translate-x-0'}`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-extrabold">Magnafic Copilot</p>
            <p className="text-xs text-cyan-100/55">{workspace.user.name || workspace.user.email}</p>
          </div>
          <button onClick={() => { setSidebarOpen(false); setSidebarCollapsed(true) }} className="rounded-full border border-cyan-300/20 p-2 text-cyan-100">
            <span className="lg:hidden"><X className="h-4 w-4" /></span>
            <span className="hidden lg:block"><PanelLeftClose className="h-4 w-4" /></span>
          </button>
        </div>
        <button onClick={startNew} className="mt-6 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#3534cd] to-cyan-400 px-4 py-3 text-sm font-extrabold">
          <MessageSquarePlus className="h-5 w-5" /> New research
        </button>

        <nav className="mt-5 space-y-1 border-y border-cyan-300/15 py-4">
          <button
            type="button"
            onClick={() => setServicesOpen((current) => !current)}
            className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm font-bold text-white/80 transition hover:bg-cyan-300/10 hover:text-white"
            aria-expanded={servicesOpen}
          >
            <span className="flex items-center gap-3">
              <Lightbulb className="h-4 w-4 text-cyan-300" />
              Expert Services
            </span>
            <ChevronDown className={`h-4 w-4 text-cyan-200 transition-transform ${servicesOpen ? 'rotate-180' : ''}`} />
          </button>
          {servicesOpen && (
            <div className="copilot-scrollbar ml-5 max-h-52 space-y-1 overflow-y-auto border-l border-cyan-300/20 py-1 pl-3 pr-1">
              {capabilities.length ? capabilities.map((capability) => (
                <button
                  key={capability._id}
                  type="button"
                  onClick={() => openMenuPage(`/capabilities/${capability.slug || capability._id}`)}
                  className="block w-full rounded-lg px-3 py-2 text-left text-xs font-semibold leading-5 text-cyan-50/70 transition hover:bg-cyan-300/10 hover:text-white"
                >
                  {capability.title}
                </button>
              )) : (
                <p className="px-3 py-2 text-xs text-white/45">Loading expert services…</p>
              )}
            </div>
          )}
          <button type="button" onClick={() => openMenuPage('/programs')} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-bold text-white/80 transition hover:bg-cyan-300/10 hover:text-white">
            <BookOpen className="h-4 w-4 text-cyan-300" />
            Programs
          </button>
          <button type="button" onClick={() => openMenuPage('/insights')} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-bold text-white/80 transition hover:bg-cyan-300/10 hover:text-white">
            <Newspaper className="h-4 w-4 text-cyan-300" />
            Insights
          </button>
        </nav>

        <p className="mt-5 text-xs font-extrabold uppercase tracking-[0.16em] text-cyan-200">Recent reports</p>
        <div className="copilot-scrollbar mt-3 min-h-0 flex-1 space-y-2 overflow-y-auto">
          {sessions.map((session) => (
            <button key={session._id} onClick={() => openSession(session._id)} className={`w-full rounded-xl border p-3 text-left ${
              session._id === activeSessionId ? 'border-cyan-300/45 bg-cyan-300/15' : 'border-white/10 bg-white/5 hover:bg-white/10'
            }`}>
              <span className="block truncate text-sm font-semibold">{session.sessionTitle}</span>
              <span className="mt-1 block text-[11px] text-white/40">{formatDate(session.updatedAt)}</span>
            </button>
          ))}
        </div>
        <div className="rounded-xl border border-cyan-300/20 bg-cyan-300/5 p-3">
          <div className="flex items-center justify-between text-xs font-bold text-white">
            <span>{tokenUsage.adminTestingAccess ? 'Admin testing tokens' : 'Daily tokens'}</span>
            <span>{tokenUsed.toLocaleString()} / {tokenLimit.toLocaleString()}</span>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-violet-400 transition-all"
              style={{ width: `${tokenPercent}%` }}
            />
          </div>
          <p className="mt-2 text-[11px] text-white/50">
            {tokenUsage.adminTestingAccess
              ? 'Expanded backend testing access enabled'
              : `${(tokenUsage.remaining ?? 10000).toLocaleString()} tokens remaining today`}
          </p>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-cyan-300/30 bg-cyan-300/5 px-4 py-3 text-sm font-bold text-white transition hover:bg-cyan-300/15"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </aside>

      <div className="relative z-10 flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-cyan-300/15 px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button onClick={() => { setSidebarOpen(true); setSidebarCollapsed(false) }} className={`${sidebarCollapsed ? 'flex' : 'flex lg:hidden'} h-10 w-10 items-center justify-center rounded-full border border-cyan-300/20 bg-cyan-300/10`}>
              <span className="lg:hidden"><Menu className="h-5 w-5" /></span>
              <span className="hidden lg:block"><PanelLeftOpen className="h-5 w-5" /></span>
            </button>
            <div>
              <h1 className="font-extrabold">Magnafic Copilot</h1>
              <p className="text-xs text-cyan-100/55">Market Intelligence & Research Copilot</p>
            </div>
          </div>
          {onClose && <button onClick={onClose} className="flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm font-bold"><ArrowLeft className="h-4 w-4" /><span className="hidden sm:inline">Dashboard</span></button>}
        </header>

        <main className={`copilot-scrollbar min-h-0 flex-1 overflow-y-auto px-4 pt-6 sm:px-6 ${
          isFreshResearch ? 'pb-64' : 'pb-32'
        }`}>
          {loadingSession ? <Loader2 className="mx-auto mt-20 h-8 w-8 animate-spin text-cyan-300" /> : latestReport ? (
            <Report
              report={latestReport}
              question={latestQuestion}
              user={workspace.user}
              workflowName={selectedWorkflow?.workflowName}
            />
          ) : messages.length ? (
            <ChatConversation messages={messages} user={workspace.user} sending={sending} />
          ) : (
            <div className="mx-auto flex min-h-full max-w-3xl flex-col items-center justify-center pb-32 text-center">
              <img src="/Copilot 1.png" alt="" className="ai-shortcut-float h-28 w-28 object-contain" />
              <h2 className="mt-2 bg-gradient-to-r from-cyan-300 via-violet-300 to-pink-300 bg-clip-text text-3xl font-semibold text-transparent">
                Hello, {workspace.user.name?.split(' ')[0] || 'there'}
              </h2>
              <p className="mt-3 text-lg text-white/75">What should we research?</p>
              {hasIncompleteStoredReport && (
                <div className="mt-6 max-w-xl rounded-2xl border border-amber-300/25 bg-amber-300/10 px-5 py-4 text-left">
                  <p className="font-bold text-amber-200">This report needs to be regenerated</p>
                  <p className="mt-1 text-sm leading-6 text-white/60">
                    The earlier response was saved without usable report content. Your original question is ready to run again.
                  </p>
                  <button
                    type="button"
                    onClick={() => submit(null, recoverableQuestion, true)}
                    disabled={!recoverableQuestion || sending}
                    className="mt-4 rounded-full bg-amber-300 px-4 py-2 text-sm font-extrabold text-[#000047] shadow-lg shadow-amber-300/10 transition hover:bg-amber-200 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {sending ? 'Regenerating…' : 'Regenerate complete report'}
                  </button>
                </div>
              )}
              {sending && (
                <div className="mt-8 rounded-2xl border border-cyan-300/20 bg-cyan-300/5 px-6 py-5">
                  <Loader2 className="mx-auto h-6 w-6 animate-spin text-cyan-300" />
                  <p className="mt-3 font-bold">Building your workflow response…</p>
                  <p className="mt-1 text-sm text-white/50">Following the selected workflow and its Sanity output instructions.</p>
                </div>
              )}
            </div>
          )}
        </main>

        <div className={`absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#000047] via-[#000047] to-transparent px-4 pb-5 sm:px-6 ${
          isFreshResearch ? 'pt-20' : 'pt-10'
        }`}>
          <form onSubmit={submit} className="mx-auto max-w-3xl">
            {error && (
              <div className="mb-3 flex items-center justify-between gap-3 rounded-xl bg-red-400/10 px-4 py-3 text-sm text-red-200">
                <span>{error}</span>
                {retrySeconds > 0 && (
                  <span className="shrink-0 rounded-full bg-red-200/10 px-3 py-1 font-bold">
                    Retry in {retrySeconds}s
                  </span>
                )}
              </div>
            )}
            <div className="mb-3">
              <div className="mb-2 flex items-center justify-between gap-3">
                <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-cyan-200/80">
                  Choose Insight Area
                </p>
                {selectedWorkflowId && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedWorkflowId('')
                      setError('')
                    }}
                    className="text-[11px] font-bold text-white/45 transition hover:text-cyan-200"
                  >
                    Clear
                  </button>
                )}
              </div>
              <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-4 lg:grid-cols-6">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedWorkflowId('')
                    setError('')
                  }}
                  className={`min-h-11 rounded-lg border px-2 py-2 text-center text-[10px] font-extrabold leading-3.5 transition sm:text-[11px] ${
                    !selectedWorkflowId
                      ? 'border-cyan-300 bg-cyan-300 text-[#000047] shadow-[0_0_18px_rgba(34,211,238,0.22)]'
                      : 'border-white/15 bg-white/5 text-white/70 hover:border-cyan-300/35 hover:bg-cyan-300/10 hover:text-white'
                  }`}
                >
                  General AI Chat
                </button>
                {workspace.workflows?.length ? workspace.workflows.map((workflow) => (
                  <button
                    key={workflow._id}
                    type="button"
                    onClick={() => {
                      setSelectedWorkflowId(workflow._id)
                      setError('')
                    }}
                    className={`min-h-11 rounded-lg border px-2 py-2 text-center text-[10px] font-extrabold leading-3.5 transition sm:text-[11px] ${
                      selectedWorkflowId === workflow._id
                        ? 'border-cyan-300 bg-cyan-300 text-[#000047] shadow-[0_0_18px_rgba(34,211,238,0.22)]'
                        : 'border-white/15 bg-white/5 text-white/70 hover:border-cyan-300/35 hover:bg-cyan-300/10 hover:text-white'
                    }`}
                    title={workflow.description}
                  >
                    {workflow.workflowName}
                  </button>
                )) : (
                  <span className="rounded-full border border-amber-300/25 bg-amber-300/10 px-4 py-2 text-xs font-bold text-amber-200">
                    No active workflows configured in Sanity
                  </span>
                )}
              </div>
              {selectedWorkflow?.description && (
                <p className="mt-3 rounded-xl border border-cyan-300/15 bg-cyan-300/5 px-4 py-3 text-xs leading-5 text-cyan-50/70">
                  {selectedWorkflow.description}
                </p>
              )}
            </div>
            <div className="copilot-prompt-glow rounded-full p-[2px] transition-all duration-300">
              <div className="flex items-center gap-2 rounded-full bg-[#08085c] py-2 pl-5 pr-2 transition-all duration-300">
                <textarea ref={textareaRef} rows={1} value={prompt} onChange={(event) => setPrompt(event.target.value)}
                  onKeyDown={(event) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); submit() } }}
                  placeholder={selectedWorkflow?.exampleInput || (selectedWorkflow ? `Ask using ${selectedWorkflow.workflowName}` : 'Ask Magnafic Copilot')} disabled={sending}
                  className="h-10 min-h-10 w-full resize-none overflow-hidden bg-transparent py-2 text-sm outline-none placeholder:text-white/40" />
                <div className="flex shrink-0 items-center">
                  <div className="flex gap-2">
                    <button type="button" onClick={voice} disabled={sending} className={`flex h-9 w-9 items-center justify-center rounded-full border ${isListening ? 'border-red-300 bg-red-400/20 text-red-200' : 'border-cyan-300/30 bg-cyan-300/10 text-cyan-200'}`}>
                      {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                    </button>
                    <button type="submit" disabled={!prompt.trim() || sending || retrySeconds > 0} className="flex h-9 w-9 items-center justify-center rounded-full bg-cyan-400 text-[#000047] disabled:bg-white/15 disabled:text-white/30">
                      {sending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </section>
  )
}
