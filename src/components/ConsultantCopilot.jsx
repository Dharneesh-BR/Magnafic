import { useEffect, useMemo, useRef, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import {
  AlertCircle,
  ArrowLeft,
  Clock3,
  Coins,
  Loader2,
  Menu,
  MessageSquarePlus,
  PanelLeftClose,
  PanelLeftOpen,
  Send,
  UserRound,
  X,
} from 'lucide-react'
import { callAiCopilot } from '../lib/aiCopilot'

const SERVICE_LINE_LABELS = {
  'ai-digital-transformation': 'AI & Digital Transformation',
  'distribution-gtm': 'Distribution & GTM',
  'ecommerce-d2c': 'E-Commerce & D2C',
  'brand-strategy-marketing': 'Brand Strategy & Marketing',
  'organisation-people': 'Organisation & People',
  'international-expansion-gtm': 'International Expansion & GTM',
}

function formatSessionDate(value) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''

  return new Intl.DateTimeFormat('en', {
    day: '2-digit',
    month: 'short',
  }).format(date)
}

function UserAvatar({ imageUrl }) {
  const [imageFailed, setImageFailed] = useState(false)

  if (imageUrl && !imageFailed) {
    return (
      <span className="mt-1 hidden h-10 w-10 shrink-0 overflow-hidden rounded-full border border-cyan-300/30 bg-[#17175f] shadow-[0_0_16px_rgba(0,255,255,0.2)] sm:flex">
        <img
          src={imageUrl}
          alt="User profile"
          className="h-full w-full object-cover object-center"
          onError={() => setImageFailed(true)}
        />
      </span>
    )
  }

  return (
    <span className="mt-1 hidden h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-50 text-primary-800 sm:flex">
      <UserRound className="h-5 w-5" />
    </span>
  )
}

function ChatMessage({ message, userImageUrl }) {
  const isAssistant = message.role === 'assistant'

  return (
    <article className={`mx-auto flex w-full max-w-3xl gap-4 ${isAssistant ? '' : 'justify-end'}`}>
      {isAssistant && (
        <span className="mt-1 flex h-14 w-14 shrink-0 items-center justify-center">
          <img
            src="/Copilot 5.png"
            alt="Magnafic Copilot"
            className="ai-shortcut-float h-14 w-14 object-contain drop-shadow-[0_0_12px_rgba(0,255,255,0.35)]"
          />
        </span>
      )}
      <div className={`min-w-0 max-w-[88%] sm:max-w-[82%] ${
        isAssistant
          ? 'flex-1 pt-1 text-[#e8f1ff]'
          : 'rounded-[1.4rem] border border-cyan-300/15 bg-[#17175f] px-5 py-3 text-white'
      }`}>
        {isAssistant ? (
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              h1: ({ children }) => <h1 className="mb-3 mt-5 text-xl font-black text-white first:mt-0">{children}</h1>,
              h2: ({ children }) => <h2 className="mb-2 mt-5 text-lg font-black text-white first:mt-0">{children}</h2>,
              h3: ({ children }) => <h3 className="mb-2 mt-4 text-base font-bold text-white first:mt-0">{children}</h3>,
              p: ({ children }) => <p className="my-3 break-words text-sm leading-6 text-[#e8f1ff] first:mt-0 last:mb-0 sm:text-[0.95rem] sm:leading-7">{children}</p>,
              strong: ({ children }) => <strong className="font-extrabold text-white">{children}</strong>,
              ul: ({ children }) => <ul className="my-3 list-disc space-y-1.5 pl-6 text-sm leading-6 text-[#e8f1ff] marker:text-cyan-300 sm:text-[0.95rem] sm:leading-7">{children}</ul>,
              ol: ({ children }) => <ol className="my-3 list-decimal space-y-1.5 pl-6 text-sm leading-6 text-[#e8f1ff] marker:text-cyan-300 sm:text-[0.95rem] sm:leading-7">{children}</ol>,
              li: ({ children }) => <li className="break-words pl-1 text-[#e8f1ff]">{children}</li>,
              blockquote: ({ children }) => <blockquote className="my-4 border-l-4 border-cyan-400 bg-white/5 px-4 py-2 text-gray-300">{children}</blockquote>,
              a: ({ children, href }) => (
                <a href={href} target="_blank" rel="noreferrer" className="font-semibold text-cyan-300 underline decoration-cyan-500 underline-offset-2">
                  {children}
                </a>
              ),
              code: ({ children, className }) => className ? (
                <code className={`${className} block overflow-x-auto rounded-xl bg-[#111827] p-4 text-xs leading-6 text-gray-100`}>
                  {children}
                </code>
              ) : (
                <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-[0.85em] text-cyan-200">{children}</code>
              ),
              pre: ({ children }) => <pre className="my-4 overflow-x-auto">{children}</pre>,
              table: ({ children }) => (
                <div className="my-4 overflow-x-auto rounded-xl border border-white/10">
                  <table className="w-full min-w-[32rem] border-collapse text-left text-sm text-[#e8f1ff]">{children}</table>
                </div>
              ),
              th: ({ children }) => <th className="border-b border-white/10 bg-white/5 px-3 py-2 font-bold text-white">{children}</th>,
              td: ({ children }) => <td className="border-b border-white/5 px-3 py-2 align-top text-[#e8f1ff]">{children}</td>,
              hr: () => <hr className="my-5 border-white/10" />,
            }}
          >
            {message.content}
          </ReactMarkdown>
        ) : (
          <p className="whitespace-pre-wrap break-words text-sm leading-6 text-white sm:text-[0.95rem] sm:leading-7">
            {message.content}
          </p>
        )}
      </div>
      {!isAssistant && <UserAvatar imageUrl={userImageUrl} />}
    </article>
  )
}

export default function ConsultantCopilot({ onClose }) {
  const [workspace, setWorkspace] = useState(null)
  const [messages, setMessages] = useState([])
  const [activeSessionId, setActiveSessionId] = useState('')
  const [prompt, setPrompt] = useState(() => {
    const pendingPrompt = sessionStorage.getItem('magnafic-copilot-prompt') || ''
    sessionStorage.removeItem('magnafic-copilot-prompt')
    return pendingPrompt
  })
  const [loading, setLoading] = useState(true)
  const [loadingSession, setLoadingSession] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const messagesEndRef = useRef(null)
  const textareaRef = useRef(null)

  const loadWorkspace = async () => {
    setLoading(true)
    setError('')

    try {
      const data = await callAiCopilot('bootstrap')
      setWorkspace(data)
    } catch (loadError) {
      setError(loadError.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadWorkspace()
  }, [])

  useEffect(() => {
    const previousBodyOverflow = document.body.style.overflow
    const previousHtmlOverflow = document.documentElement.style.overflow
    document.body.style.overflow = 'hidden'
    document.documentElement.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = previousBodyOverflow
      document.documentElement.style.overflow = previousHtmlOverflow
    }
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }, [messages, sending])

  const creditPercentage = useMemo(() => {
    if (!workspace?.credits?.monthlyLimit) return 0
    return Math.min((workspace.credits.used / workspace.credits.monthlyLimit) * 100, 100)
  }, [workspace?.credits])

  const startNewChat = () => {
    setActiveSessionId('')
    setMessages([])
    setPrompt('')
    setError('')
    textareaRef.current?.focus()
  }

  const openSession = async (sessionId) => {
    if (!sessionId || sessionId === activeSessionId || loadingSession) return

    setLoadingSession(true)
    setError('')

    try {
      const data = await callAiCopilot('session', { sessionId })
      setActiveSessionId(data.session._id)
      setMessages(data.session.messages || [])
      setSidebarOpen(false)
    } catch (sessionError) {
      setError(sessionError.message)
    } finally {
      setLoadingSession(false)
    }
  }

  const sendPrompt = async (event) => {
    event?.preventDefault()
    const nextPrompt = prompt.trim()
    if (!nextPrompt || sending) return

    const optimisticMessage = {
      _key: `pending-${Date.now()}`,
      role: 'user',
      content: nextPrompt,
      timestamp: new Date().toISOString(),
    }

    setMessages((current) => [...current, optimisticMessage])
    setPrompt('')
    setSending(true)
    setError('')

    try {
      const data = await callAiCopilot('chat', {
        sessionId: activeSessionId,
        prompt: nextPrompt,
      })

      setActiveSessionId(data.sessionId)
      setMessages((current) => [
        ...current.filter((message) => message._key !== optimisticMessage._key),
        data.userMessage,
        data.assistantMessage,
      ])
      setWorkspace((current) => {
        const existingSession = current.sessions.find((session) => session._id === data.sessionId)
        const now = new Date().toISOString()
        const sessions = existingSession
          ? current.sessions.map((session) => (
              session._id === data.sessionId
                ? { ...session, updatedAt: now, messageCount: (session.messageCount || 0) + 2 }
                : session
            ))
          : [{
              _id: data.sessionId,
              sessionTitle: nextPrompt.length > 64 ? `${nextPrompt.slice(0, 61)}...` : nextPrompt,
              createdAt: now,
              updatedAt: now,
              messageCount: 2,
            }, ...current.sessions]

        return { ...current, credits: data.credits, sessions }
      })
    } catch (sendError) {
      setMessages((current) => current.filter((message) => message._key !== optimisticMessage._key))
      setPrompt(nextPrompt)
      setError(sendError.message)
    } finally {
      setSending(false)
    }
  }

  if (loading) {
    return (
      <section className="fixed inset-0 z-50 flex items-center justify-center bg-[#000047]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,255,255,0.14),transparent_38%)]" />
        <div className="text-center">
          <img
            src="/Copilot 2.png"
            alt="Loading Magnafic AI Copilot"
            className="ai-shortcut-float mx-auto h-32 w-32 object-contain drop-shadow-[0_0_20px_rgba(0,255,255,0.45)] sm:h-40 sm:w-40"
          />
          <p className="mt-4 text-sm font-semibold text-white/75">Loading your AI Copilot...</p>
        </div>
      </section>
    )
  }

  if (!workspace) {
    return (
      <section className="fixed inset-0 z-50 flex items-center justify-center bg-[#f8f9fc] p-4">
        <div className="w-full max-w-lg rounded-2xl border border-amber-200 bg-white p-6 shadow-xl">
          <AlertCircle className="h-7 w-7 text-amber-700" />
          <h2 className="mt-4 text-xl font-bold text-gray-950">AI Copilot is not available</h2>
          <p className="mt-2 text-sm leading-6 text-gray-700">{error}</p>
          <div className="mt-5 flex gap-3">
            <button type="button" onClick={loadWorkspace} className="rounded-full bg-[#000047] px-5 py-2.5 text-sm font-bold text-white">
              Try again
            </button>
            <button type="button" onClick={onClose} className="rounded-full bg-gray-100 px-5 py-2.5 text-sm font-bold text-gray-700">
              Close
            </button>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="fixed inset-0 z-50 flex overflow-hidden bg-[#0d0e10] text-gray-100">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_55%_46%,rgba(24,48,139,0.42),rgba(13,14,16,0)_42%)]" />
      {sidebarOpen && (
        <button
          type="button"
          className="fixed inset-0 z-50 bg-black/60 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close chat history"
        />
      )}

      <aside className={`fixed inset-y-0 left-0 z-[60] flex w-[15rem] flex-col border-r border-white/5 bg-[#111214] p-3 text-gray-200 transition-all duration-300 lg:static lg:z-10 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } ${sidebarCollapsed ? 'lg:w-0 lg:-translate-x-full lg:overflow-hidden lg:p-0' : 'lg:w-[15rem] lg:translate-x-0'}`}>
        <div className="flex items-center justify-between px-2 py-2">
          <button type="button" onClick={() => setSidebarOpen(false)} className="flex h-10 w-10 items-center justify-center rounded-full text-gray-600 hover:bg-gray-200 lg:hidden" aria-label="Close menu">
            <X className="h-5 w-5" />
          </button>
          <span className="hidden text-sm font-bold text-gray-200 lg:block">Magnafic Copilot</span>
          <button type="button" onClick={() => setSidebarCollapsed(true)} className="hidden h-9 w-9 items-center justify-center rounded-full text-gray-400 hover:bg-white/10 hover:text-white lg:flex" aria-label="Close chat history" title="Close menu">
            <PanelLeftClose className="h-5 w-5" />
          </button>
        </div>

        <button
          type="button"
          onClick={() => {
            startNewChat()
            setSidebarOpen(false)
          }}
          className="mt-3 flex w-fit items-center gap-3 rounded-2xl bg-[#232427] px-4 py-3 text-sm font-bold text-gray-100 transition hover:bg-[#2d2f33]"
        >
          <MessageSquarePlus className="h-5 w-5" />
          New chat
        </button>

        <div className="mt-7 min-h-0 flex-1">
          <p className="px-3 text-xs font-bold text-gray-500">Recent</p>
          <div className="mt-2 max-h-full space-y-1 overflow-y-auto">
            {workspace.sessions.length ? workspace.sessions.map((session) => (
              <button
                key={session._id}
                type="button"
                onClick={() => openSession(session._id)}
                className={`w-full rounded-xl px-3 py-2.5 text-left transition ${
                  activeSessionId === session._id
                    ? 'bg-[#242b43] text-white'
                    : 'text-gray-400 hover:bg-white/5 hover:text-gray-100'
                }`}
              >
                <span className="block truncate text-sm font-semibold">{session.sessionTitle}</span>
                <span className="mt-1 flex justify-between text-[11px] text-gray-500">
                  <span>{session.messageCount || 0} messages</span>
                  <span>{formatSessionDate(session.updatedAt)}</span>
                </span>
              </button>
            )) : (
          <p className="px-3 py-5 text-xs leading-5 text-gray-500">Your conversations will appear here.</p>
            )}
          </div>
        </div>

        <div className="rounded-2xl bg-white/5 p-3">
          <div className="flex items-center justify-between text-xs font-bold text-gray-300">
            <span className="inline-flex items-center gap-1.5"><Coins className="h-4 w-4 text-primary-600" /> Credits</span>
            <span>{workspace.credits.remaining.toLocaleString()}</span>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
            <div className="h-full rounded-full bg-gradient-to-r from-primary-700 to-cyan-400" style={{ width: `${creditPercentage}%` }} />
          </div>
        </div>
      </aside>

      <div className="relative z-10 flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-white/5 px-3 sm:px-5">
          <div className="flex min-w-0 items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setSidebarOpen(true)
                setSidebarCollapsed(false)
              }}
              className={`h-10 w-10 shrink-0 items-center justify-center rounded-full text-gray-400 hover:bg-white/10 hover:text-white ${
                sidebarCollapsed ? 'flex' : 'flex lg:hidden'
              }`}
              aria-label="Open chat history"
              title="Open menu"
            >
              <span className="lg:hidden"><Menu className="h-5 w-5" /></span>
              <span className="hidden lg:block"><PanelLeftOpen className="h-5 w-5" /></span>
            </button>
            <div className="min-w-0">
              <h1 className="truncate text-base font-bold text-gray-100 sm:text-lg">{workspace.agent.name}</h1>
              <p className="truncate text-[11px] font-semibold text-gray-500 sm:text-xs">
                {SERVICE_LINE_LABELS[workspace.agent.serviceLine] || workspace.agent.serviceLine}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 text-sm font-bold text-gray-200 transition hover:bg-white/10 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Back to Dashboard</span>
            <span className="sm:hidden">Back</span>
          </button>
        </header>

        <div className="relative min-h-0 flex-1">
          <div className="absolute inset-0 overflow-y-auto px-4 pb-40 pt-4 sm:px-6">
            {loadingSession ? (
              <div className="flex h-full items-center justify-center">
                <Loader2 className="h-7 w-7 animate-spin text-primary-600" />
              </div>
            ) : messages.length ? (
              <div className="space-y-8 py-4">
                {messages.map((message) => (
                  <ChatMessage
                    key={message._key}
                    message={message}
                    userImageUrl={workspace.consultant.imageUrl}
                  />
                ))}
                {sending && (
                  <div className="mx-auto flex w-full max-w-3xl items-center gap-4">
                    <img
                      src="/Copilot 5.png"
                      alt=""
                      className="ai-shortcut-float h-14 w-14 object-contain drop-shadow-[0_0_12px_rgba(0,255,255,0.35)]"
                    />
                    <span className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Thinking...
                    </span>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            ) : (
              <div className="mx-auto flex min-h-full max-w-4xl flex-col items-center justify-center pb-32 pt-8 text-center">
                <img
                  src="/Copilot 1.png"
                  alt="Magnafic AI Copilot"
                  className="ai-shortcut-float h-24 w-24 object-contain sm:h-32 sm:w-32"
                />
                <h2 className="mt-2 bg-gradient-to-r from-[#64d9ff] via-[#a78bfa] to-[#ff6f91] bg-clip-text text-2xl font-semibold text-transparent sm:text-4xl">
                  Hello, {workspace.consultant.name?.split(' ')[0] || 'Consultant'}
                </h2>
                <p className="mt-2 text-lg font-medium text-gray-200 sm:text-xl"> Magnafic Copilot <br/>Your AI Business Research Partner</p>

              </div>
            )}
          </div>

          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#0d0e10] via-[#0d0e10] to-transparent px-4 pb-4 pt-10 sm:px-6 sm:pb-6">
            <form onSubmit={sendPrompt} className="mx-auto max-w-3xl">
              {error && (
                <div className="mb-3 flex items-start gap-2 rounded-xl bg-red-50 px-3 py-2.5 text-sm font-medium text-red-700">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}
              <div className="copilot-prompt-glow rounded-[2rem] p-[2px]">
                <div className="relative rounded-[calc(2rem-2px)] bg-[#202124] px-5 pb-3 pt-3 shadow-2xl shadow-black/30">
                <textarea
                  ref={textareaRef}
                  rows={2}
                  value={prompt}
                  onChange={(event) => setPrompt(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' && !event.shiftKey) {
                      event.preventDefault()
                      sendPrompt()
                    }
                  }}
                  disabled={sending || workspace.credits.remaining < workspace.actionCosts.chat}
                  placeholder="Ask Magnafic Copilot"
                  className="max-h-40 min-h-12 w-full resize-none border-0 bg-transparent px-1 py-2 text-base leading-6 text-gray-100 outline-none placeholder:text-gray-400 disabled:cursor-not-allowed"
                />
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1 text-[11px] text-gray-400">
                    <Clock3 className="h-3.5 w-3.5" />
                    {workspace.actionCosts.chat} credit per message
                  </span>
                  <button
                    type="submit"
                    disabled={!prompt.trim() || sending || workspace.credits.remaining < workspace.actionCosts.chat}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-[#3b82f6] text-white transition hover:bg-[#2563eb] disabled:cursor-not-allowed disabled:bg-gray-600"
                    aria-label="Send message"
                  >
                    {sending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                  </button>
                </div>
                </div>
              </div>
              <p className="mt-2 text-center text-[11px] text-gray-600">Magnafic Copilot can make mistakes. Review important recommendations.</p>
            </form>
          </div>
        </div>
      </div>
    </section>
  )
}
