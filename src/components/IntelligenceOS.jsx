import { useEffect, useRef, useState } from 'react'
import {
  AlertCircle, ArrowLeft, BarChart3, ChevronDown, Clock3, FileSearch, Lightbulb,
  BookOpen, Loader2, Menu, MessageSquarePlus, Mic, MicOff, Newspaper,
  PanelLeftClose, PanelLeftOpen, Paperclip, Send, ShieldAlert, Sparkles,
  Table2, Target, X,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { callResearchWorkflow } from '../lib/aiCopilot'
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

function Visuals({ visuals = [] }) {
  if (!visuals.length) return null
  const tables = visuals.filter((item) => item.kind === 'table')
  const other = visuals.filter((item) => item.kind !== 'table')
  return (
    <section className="rounded-2xl border border-white/10 bg-white/5 p-5">
      <h3 className="flex items-center gap-2 text-sm font-extrabold uppercase tracking-[0.12em] text-cyan-200">
        <BarChart3 className="h-5 w-5" /> Visual recommendations
      </h3>
      {other.length > 0 && (
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {other.map((item, index) => (
            <div key={`visual-${index}`} className="rounded-xl border border-cyan-300/15 bg-[#08085c] p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-cyan-300">{item.type || item.kind}</p>
              <p className="mt-1 font-bold text-white">{item.title}</p>
              {item.description && <p className="mt-2 text-sm leading-6 text-white/60">{item.description}</p>}
            </div>
          ))}
        </div>
      )}
      {tables.map((table, index) => (
        <div key={`table-${index}`} className="mt-5 overflow-hidden rounded-xl border border-white/10">
          <div className="flex items-center gap-2 bg-white/5 px-4 py-3 font-bold text-white">
            <Table2 className="h-4 w-4 text-cyan-300" /> {table.title}
          </div>
          {table.columns?.length && table.rows?.length ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[34rem] text-left text-sm">
                <thead className="bg-cyan-300/10 text-cyan-100">
                  <tr>{table.columns.map((column) => <th key={column} className="px-4 py-3">{column}</th>)}</tr>
                </thead>
                <tbody className="divide-y divide-white/10 text-white/75">
                  {table.rows.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                      {(Array.isArray(row) ? row : table.columns.map((column) => row?.[column])).map((cell, cellIndex) => (
                        <td key={cellIndex} className="px-4 py-3">{String(cell ?? '')}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="px-4 py-3 text-sm text-white/55">{table.description || 'Recommended table for the final presentation.'}</p>
          )}
        </div>
      ))}
    </section>
  )
}

function Report({ report, question, user }) {
  if (!report) return null
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
          <p className="text-xs text-cyan-100/50">Executive research report</p>
        </div>
      </div>
      <section className="rounded-3xl border border-cyan-300/25 bg-gradient-to-br from-cyan-300/10 to-violet-400/10 p-6 shadow-[0_0_45px_rgba(0,255,255,0.08)] sm:p-8">
        <p className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.18em] text-cyan-300">
          <Sparkles className="h-4 w-4" /> Executive summary
        </p>
        <p className="mt-4 text-base leading-8 text-white/90 sm:text-lg">{report.executiveSummary}</p>
      </section>

      <div className="grid gap-5 lg:grid-cols-2">
        <ListCard title="Key findings" items={report.keyFindings} icon={FileSearch} />
        <ListCard title="Market insights" items={report.marketInsights} icon={BarChart3} tone="violet" />
        <ListCard title="Opportunities / Pros" items={report.opportunities} icon={Lightbulb} tone="green" />
        <ListCard title="Risks / Cons" items={report.risks} icon={ShieldAlert} tone="red" />
      </div>

      {report.businessAnalysis && (
        <details className="group rounded-2xl border border-white/10 bg-white/5 p-5" open>
          <summary className="flex cursor-pointer list-none items-center justify-between font-extrabold text-white">
            Business analysis <ChevronDown className="h-5 w-5 transition group-open:rotate-180" />
          </summary>
          <p className="mt-4 whitespace-pre-line text-sm leading-7 text-white/70">{report.businessAnalysis}</p>
        </details>
      )}

      <ListCard title="Recommendations" items={report.recommendations} icon={Target} tone="blue" />
      <Visuals visuals={report.visualSuggestions} />
      <ListCard title="Next steps" items={report.nextSteps} icon={Sparkles} tone="teal" />

      {(report.assumptions?.length || report.lowConfidenceStatements?.length) && (
        <details className="group rounded-2xl border border-amber-300/20 bg-amber-300/5 p-5">
          <summary className="flex cursor-pointer list-none items-center justify-between font-extrabold text-amber-200">
            Assumptions and limitations <ChevronDown className="h-5 w-5 transition group-open:rotate-180" />
          </summary>
          <ul className="mt-4 space-y-2 text-sm leading-6 text-white/65">
            {[...(report.assumptions || []), ...(report.lowConfidenceStatements || [])].map((item, index) => (
              <li key={index}>• {item}</li>
            ))}
          </ul>
        </details>
      )}
    </article>
  )
}

function isUsableReport(report) {
  return Boolean(
    report?.executiveSummary?.trim() ||
    report?.keyFindings?.length ||
    report?.marketInsights?.length
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
    setSidebarOpen(false)
  }

  const openMenuPage = (path) => {
    setSidebarOpen(false)
    navigate(path)
  }

  const openSession = async (sessionId) => {
    setLoadingSession(true)
    setError('')
    try {
      const data = await callResearchWorkflow('session', { sessionId })
      setActiveSessionId(data.session._id)
      setMessages(data.session.messages || [])
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
    const optimistic = { _key: `pending-${Date.now()}`, role: 'user', content: question }
    setMessages((current) => (
      reuseCurrentSession ? [...current, optimistic] : [optimistic]
    ))
    setPrompt('')
    setSending(true)
    setError('')
    setRetrySeconds(0)
    sessionStorage.removeItem(PROMPT_KEY)
    try {
      const data = await callResearchWorkflow('research', {
        sessionId: reuseCurrentSession ? activeSessionId : '',
        question,
        businessContext: businessContext.trim(),
        files,
      })
      setActiveSessionId(data.sessionId)
      setIncompleteQuestion('')
      setMessages((current) => (
        reuseCurrentSession
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
              sessionTitle: question.length > 80 ? `${question.slice(0, 77)}...` : question,
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
      if (submitError.status === 429) {
        setRetrySeconds(submitError.retryAfter || 30)
        setError('Gemini has reached its current request limit. Your question is preserved—retry when the countdown ends.')
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

  const attachFiles = async (event) => {
    const selected = Array.from(event.target.files || []).slice(0, 5)
    let remainingCharacters = 12000
    const readable = []

    for (const file of selected) {
      if (remainingCharacters <= 0) break
      const excerpt = await file.slice(0, remainingCharacters).text()
      readable.push({
        name: file.name,
        type: file.type,
        text: excerpt,
      })
      remainingCharacters -= excerpt.length
    }

    setFiles(readable)
    event.target.value = ''
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
        <div className="rounded-xl border border-cyan-300/15 bg-cyan-300/5 p-3 text-xs text-white/55">
          Phase 1 uses model knowledge and your context. Live sources arrive in Phase 2.
        </div>
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
            <Report report={latestReport} question={latestQuestion} user={workspace.user} />
          ) : (
            <div className="mx-auto flex min-h-full max-w-3xl flex-col items-center justify-center pb-32 text-center">
              <img src="/Copilot 1.png" alt="" className="ai-shortcut-float h-28 w-28 object-contain" />
              <h2 className="mt-2 bg-gradient-to-r from-cyan-300 via-violet-300 to-pink-300 bg-clip-text text-3xl font-semibold text-transparent">
                Hello, {workspace.user.name?.split(' ')[0] || 'there'}
              </h2>
              <p className="mt-3 text-lg text-white/75">What strategic decision should we research?</p>
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
                  <p className="mt-3 font-bold">Building your intelligence report…</p>
                  <p className="mt-1 text-sm text-white/50">Analyzing the question and preparing concise executive recommendations.</p>
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
            <div className={`copilot-prompt-glow p-[2px] transition-all duration-300 ${isFreshResearch ? 'rounded-[2rem]' : 'rounded-full'}`}>
              <div className={`bg-[#08085c] transition-all duration-300 ${isFreshResearch ? 'rounded-[calc(2rem-2px)] px-5 py-3' : 'flex items-center gap-2 rounded-full py-2 pl-5 pr-2'}`}>
                <textarea ref={textareaRef} rows={isFreshResearch ? 2 : 1} value={prompt} onChange={(event) => setPrompt(event.target.value)}
                  onKeyDown={(event) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); submit() } }}
                  placeholder={isFreshResearch ? 'Ask a strategic business or market question' : 'Ask another research question'} disabled={sending}
                  className={`w-full resize-none bg-transparent outline-none placeholder:text-white/40 ${isFreshResearch ? 'min-h-12 py-2' : 'h-10 min-h-10 overflow-hidden py-2 text-sm'}`} />
                {isFreshResearch && <details className="mb-2 text-xs text-white/45">
                  <summary className="cursor-pointer">Add business context (optional)</summary>
                  <textarea value={businessContext} onChange={(event) => setBusinessContext(event.target.value)} rows={2}
                    placeholder="Company, market, constraints, goals, known data…" className="mt-2 w-full resize-none rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-white outline-none" />
                </details>}
                <div className={`flex items-center ${isFreshResearch ? 'justify-between' : 'shrink-0'}`}>
                  {isFreshResearch && <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1 text-[11px] text-white/45"><Clock3 className="h-3.5 w-3.5" /> Structured research report</span>
                    <label className="flex cursor-pointer items-center gap-1 text-[11px] text-cyan-200 hover:text-white">
                      <Paperclip className="h-3.5 w-3.5" />
                      {files.length ? `${files.length} attached` : 'Attach context'}
                      <input type="file" multiple accept=".txt,.md,.csv,.json,text/*" onChange={attachFiles} className="sr-only" />
                    </label>
                  </div>}
                  <div className="flex gap-2">
                    <button type="button" onClick={voice} disabled={sending} className={`flex items-center justify-center rounded-full border ${isFreshResearch ? 'h-10 w-10' : 'h-9 w-9'} ${isListening ? 'border-red-300 bg-red-400/20 text-red-200' : 'border-cyan-300/30 bg-cyan-300/10 text-cyan-200'}`}>
                      {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                    </button>
                    <button type="submit" disabled={!prompt.trim() || sending || retrySeconds > 0} className={`flex items-center justify-center rounded-full bg-cyan-400 text-[#000047] disabled:bg-white/15 disabled:text-white/30 ${isFreshResearch ? 'h-10 w-10' : 'h-9 w-9'}`}>
                      {sending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
            {isFreshResearch && <p className="mt-2 text-center text-[11px] text-white/30">Review assumptions before using recommendations for material decisions.</p>}
          </form>
        </div>
      </div>
    </section>
  )
}
