import { useEffect, useRef, useState } from 'react'
import {
  AlertCircle, ArrowLeft, BarChart3, ChevronDown, Clock3, FileSearch, Lightbulb,
  Loader2, Menu, MessageSquarePlus, Mic, MicOff, PanelLeftClose, PanelLeftOpen,
  Paperclip, Send, ShieldAlert, Sparkles, Table2, Target, X,
} from 'lucide-react'
import { callResearchWorkflow } from '../lib/aiCopilot'

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
    cyan: 'border-cyan-300/20 bg-cyan-300/5 text-cyan-200',
    green: 'border-emerald-300/20 bg-emerald-300/5 text-emerald-200',
    amber: 'border-amber-300/20 bg-amber-300/5 text-amber-200',
    violet: 'border-violet-300/20 bg-violet-300/5 text-violet-200',
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

function Report({ report }) {
  if (!report) return null
  return (
    <article className="mx-auto w-full max-w-5xl space-y-5 pb-8">
      <section className="rounded-3xl border border-cyan-300/25 bg-gradient-to-br from-cyan-300/10 to-violet-400/10 p-6 shadow-[0_0_45px_rgba(0,255,255,0.08)] sm:p-8">
        <p className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.18em] text-cyan-300">
          <Sparkles className="h-4 w-4" /> Executive summary
        </p>
        <p className="mt-4 text-base leading-8 text-white/90 sm:text-lg">{report.executiveSummary}</p>
      </section>

      <div className="grid gap-5 lg:grid-cols-2">
        <ListCard title="Key findings" items={report.keyFindings} icon={FileSearch} />
        <ListCard title="Market insights" items={report.marketInsights} icon={BarChart3} tone="violet" />
        <ListCard title="Opportunity areas" items={report.opportunities} icon={Lightbulb} tone="green" />
        <ListCard title="Risks" items={report.risks} icon={ShieldAlert} tone="amber" />
      </div>

      {report.businessAnalysis && (
        <details className="group rounded-2xl border border-white/10 bg-white/5 p-5" open>
          <summary className="flex cursor-pointer list-none items-center justify-between font-extrabold text-white">
            Business analysis <ChevronDown className="h-5 w-5 transition group-open:rotate-180" />
          </summary>
          <p className="mt-4 whitespace-pre-line text-sm leading-7 text-white/70">{report.businessAnalysis}</p>
        </details>
      )}

      <ListCard title="Recommendations" items={report.recommendations} icon={Target} tone="cyan" />
      <Visuals visuals={report.visualSuggestions} />
      <ListCard title="Next steps" items={report.nextSteps} icon={Sparkles} tone="green" />

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

export default function IntelligenceOS({ onClose }) {
  const [workspace, setWorkspace] = useState(null)
  const [sessions, setSessions] = useState([])
  const [activeSessionId, setActiveSessionId] = useState('')
  const [messages, setMessages] = useState([])
  const [prompt, setPrompt] = useState(() => sessionStorage.getItem(PROMPT_KEY) || '')
  const [businessContext, setBusinessContext] = useState('')
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingSession, setLoadingSession] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [isListening, setIsListening] = useState(false)
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

  useEffect(() => () => recognitionRef.current?.stop(), [])

  const startNew = () => {
    setActiveSessionId('')
    setMessages([])
    setPrompt('')
    setBusinessContext('')
    setFiles([])
    setError('')
    setSidebarOpen(false)
  }

  const openSession = async (sessionId) => {
    setLoadingSession(true)
    setError('')
    try {
      const data = await callResearchWorkflow('session', { sessionId })
      setActiveSessionId(data.session._id)
      setMessages(data.session.messages || [])
      setSidebarOpen(false)
    } catch (sessionError) {
      setError(sessionError.message)
    } finally {
      setLoadingSession(false)
    }
  }

  const submit = async (event) => {
    event?.preventDefault()
    const question = prompt.trim()
    if (!question || sending) return
    const optimistic = { _key: `pending-${Date.now()}`, role: 'user', content: question }
    setMessages((current) => [...current, optimistic])
    setPrompt('')
    setSending(true)
    setError('')
    sessionStorage.removeItem(PROMPT_KEY)
    try {
      const data = await callResearchWorkflow('research', {
        sessionId: activeSessionId,
        question,
        businessContext: businessContext.trim(),
        files,
      })
      setActiveSessionId(data.sessionId)
      setMessages((current) => [
        ...current.filter((item) => item._key !== optimistic._key),
        data.userMessage,
        data.assistantMessage,
      ])
      const now = new Date().toISOString()
      setSessions((current) => {
        const found = current.some((item) => item._id === data.sessionId)
        if (found) return current.map((item) => item._id === data.sessionId
          ? { ...item, updatedAt: now, messageCount: (item.messageCount || 0) + 2 }
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
      setError(submitError.message)
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
    const readable = await Promise.all(selected.map(async (file) => ({
      name: file.name,
      type: file.type,
      text: await file.text(),
    })))
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
        <h2 className="mt-4 text-xl font-bold">Intelligence OS is unavailable</h2>
        <p className="mt-2 text-white/65">{error}</p>
        {onClose && <button onClick={onClose} className="mt-5 rounded-full bg-cyan-400 px-5 py-2 font-bold text-[#000047]">Close</button>}
      </div>
    </section>
  )

  const latestReport = [...messages].reverse().find((item) => item.report)?.report

  return (
    <section className="fixed inset-0 z-50 flex overflow-hidden bg-[#000047] text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_55%_40%,rgba(0,255,255,0.14),transparent_43%)]" />
      {sidebarOpen && <button className="fixed inset-0 z-40 bg-black/60 lg:hidden" onClick={() => setSidebarOpen(false)} aria-label="Close history" />}

      <aside className={`fixed inset-y-0 left-0 z-50 flex w-[17rem] flex-col border-r border-cyan-300/25 bg-[#000047] p-4 transition-all lg:static ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } ${sidebarCollapsed ? 'lg:w-0 lg:-translate-x-full lg:overflow-hidden lg:p-0' : 'lg:translate-x-0'}`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-extrabold">Intelligence OS</p>
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
        <p className="mt-7 text-xs font-extrabold uppercase tracking-[0.16em] text-cyan-200">Recent reports</p>
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
              <h1 className="font-extrabold">Magnafic Intelligence OS</h1>
              <p className="text-xs text-cyan-100/55">Market Intelligence & Research Copilot</p>
            </div>
          </div>
          {onClose && <button onClick={onClose} className="flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm font-bold"><ArrowLeft className="h-4 w-4" /><span className="hidden sm:inline">Dashboard</span></button>}
        </header>

        <main className="copilot-scrollbar min-h-0 flex-1 overflow-y-auto px-4 pb-64 pt-6 sm:px-6">
          {loadingSession ? <Loader2 className="mx-auto mt-20 h-8 w-8 animate-spin text-cyan-300" /> : latestReport ? (
            <Report report={latestReport} />
          ) : (
            <div className="mx-auto flex min-h-full max-w-3xl flex-col items-center justify-center pb-32 text-center">
              <img src="/Copilot 1.png" alt="" className="ai-shortcut-float h-28 w-28 object-contain" />
              <h2 className="mt-2 bg-gradient-to-r from-cyan-300 via-violet-300 to-pink-300 bg-clip-text text-3xl font-semibold text-transparent">
                Hello, {workspace.user.name?.split(' ')[0] || 'there'}
              </h2>
              <p className="mt-3 text-lg text-white/75">What strategic decision should we research?</p>
              {sending && (
                <div className="mt-8 rounded-2xl border border-cyan-300/20 bg-cyan-300/5 px-6 py-5">
                  <Loader2 className="mx-auto h-6 w-6 animate-spin text-cyan-300" />
                  <p className="mt-3 font-bold">Building your intelligence report…</p>
                  <p className="mt-1 text-sm text-white/50">Scouting topics, synthesizing findings, validating claims, and designing visuals.</p>
                </div>
              )}
            </div>
          )}
        </main>

        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#000047] via-[#000047] to-transparent px-4 pb-5 pt-20 sm:px-6">
          <form onSubmit={submit} className="mx-auto max-w-3xl">
            {error && <p className="mb-3 rounded-xl bg-red-400/10 px-4 py-2 text-sm text-red-200">{error}</p>}
            <div className="copilot-prompt-glow rounded-[2rem] p-[2px]">
              <div className="rounded-[calc(2rem-2px)] bg-[#08085c] px-5 py-3">
                <textarea ref={textareaRef} rows={2} value={prompt} onChange={(event) => setPrompt(event.target.value)}
                  onKeyDown={(event) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); submit() } }}
                  placeholder="Ask a strategic business or market question" disabled={sending}
                  className="min-h-12 w-full resize-none bg-transparent py-2 outline-none placeholder:text-white/40" />
                <details className="mb-2 text-xs text-white/45">
                  <summary className="cursor-pointer">Add business context (optional)</summary>
                  <textarea value={businessContext} onChange={(event) => setBusinessContext(event.target.value)} rows={2}
                    placeholder="Company, market, constraints, goals, known data…" className="mt-2 w-full resize-none rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-white outline-none" />
                </details>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1 text-[11px] text-white/45"><Clock3 className="h-3.5 w-3.5" /> Structured research report</span>
                    <label className="flex cursor-pointer items-center gap-1 text-[11px] text-cyan-200 hover:text-white">
                      <Paperclip className="h-3.5 w-3.5" />
                      {files.length ? `${files.length} attached` : 'Attach context'}
                      <input type="file" multiple accept=".txt,.md,.csv,.json,text/*" onChange={attachFiles} className="sr-only" />
                    </label>
                  </div>
                  <div className="flex gap-2">
                    <button type="button" onClick={voice} disabled={sending} className={`flex h-10 w-10 items-center justify-center rounded-full border ${isListening ? 'border-red-300 bg-red-400/20 text-red-200' : 'border-cyan-300/30 bg-cyan-300/10 text-cyan-200'}`}>
                      {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                    </button>
                    <button type="submit" disabled={!prompt.trim() || sending} className="flex h-10 w-10 items-center justify-center rounded-full bg-cyan-400 text-[#000047] disabled:bg-white/15 disabled:text-white/30">
                      {sending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <p className="mt-2 text-center text-[11px] text-white/30">Review assumptions before using recommendations for material decisions.</p>
          </form>
        </div>
      </div>
    </section>
  )
}
