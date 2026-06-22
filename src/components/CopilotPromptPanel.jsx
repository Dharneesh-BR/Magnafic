import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Clock3, Send } from 'lucide-react'
import { getAuthUser } from '../lib/auth'

const COPILOT_PROMPT_KEY = 'magnafic-copilot-prompt'

export default function CopilotPromptPanel({ className = '' }) {
  const navigate = useNavigate()
  const [prompt, setPrompt] = useState('')
  const [authUser, setAuthUser] = useState(() => getAuthUser())

  useEffect(() => {
    const syncAuth = () => setAuthUser(getAuthUser())

    window.addEventListener('magnafic-auth-change', syncAuth)
    window.addEventListener('storage', syncAuth)

    return () => {
      window.removeEventListener('magnafic-auth-change', syncAuth)
      window.removeEventListener('storage', syncAuth)
    }
  }, [])

  const handleSubmit = (event) => {
    event.preventDefault()
    const question = prompt.trim()

    if (!question) return

    sessionStorage.setItem(COPILOT_PROMPT_KEY, question)

    if (!authUser) {
      navigate('/login', {
        state: {
          openCopilotAfterLogin: true,
        },
      })
      return
    }

    navigate('/dashboard')
  }

  return (
    <div className={`relative mx-auto flex w-full max-w-2xl items-center py-2 lg:max-w-none lg:py-4 ${className}`}>
      <div className="pointer-events-none absolute inset-8 bg-[radial-gradient(circle,rgba(0,255,255,0.2)_0%,rgba(53,52,205,0.18)_38%,transparent_72%)] blur-3xl" />
      <div className="relative w-full px-1 py-3 sm:px-4 sm:py-4">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_38%,rgba(0,255,255,0.13),transparent_44%)]" />

        <div className="relative text-center">
          <h2 className="mb-4 text-2xl font-extrabold text-white sm:text-3xl">
            Start Scaling Today.
          </h2>
          <img
            src="/Copilot 1.png"
            alt="Magnafic AI Copilot"
            className="ai-shortcut-float mx-auto h-24 w-24 object-contain drop-shadow-[0_0_16px_rgba(0,255,255,0.35)] sm:h-28 sm:w-28"
          />
          <h3 className="mt-1 bg-gradient-to-r from-[#64d9ff] via-[#a78bfa] to-[#ff6f91] bg-clip-text text-2xl font-semibold text-transparent sm:text-3xl">
            Hello, there
          </h3>
          <p className="mt-2 text-lg font-semibold text-white">Magnafic Copilot</p>
          <p className="mt-1 text-sm font-medium text-white/75 sm:text-base">Your AI Business Research Partner</p>
        </div>

        <form onSubmit={handleSubmit} className="relative mt-7">
          <div className="copilot-prompt-glow rounded-[1.65rem] p-[2px]">
            <div className="rounded-[calc(1.65rem-2px)] bg-[#08085c] px-4 pb-3 pt-3 shadow-2xl shadow-cyan-400/10 sm:px-5">
              <textarea
                rows={2}
                value={prompt}
                onChange={(event) => setPrompt(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && !event.shiftKey) {
                    event.preventDefault()
                    handleSubmit(event)
                  }
                }}
                placeholder="Ask Magnafic Copilot"
                aria-label="Ask Magnafic Copilot"
                className="max-h-32 min-h-16 w-full resize-none border-0 bg-transparent px-1 py-1 text-sm leading-6 text-white outline-none placeholder:text-white/50 sm:text-base"
              />
              <div className="flex items-center justify-between gap-3">
                
                <button
                  type="submit"
                  disabled={!prompt.trim()}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-cyan-400 text-[#000047] shadow-[0_0_18px_rgba(0,255,255,0.45)] transition hover:scale-105 hover:bg-cyan-300 disabled:cursor-not-allowed disabled:bg-white/15 disabled:text-white/40 disabled:shadow-none"
                  aria-label={authUser ? 'Open Magnafic Copilot' : 'Log in to use Magnafic Copilot'}
                >
                  <Send className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
          <p className="mt-2 text-center text-[10px] text-white/35 sm:text-[11px]">
            Magnafic Copilot can make mistakes. Review important recommendations.
          </p>
        </form>
      </div>
    </div>
  )
}
