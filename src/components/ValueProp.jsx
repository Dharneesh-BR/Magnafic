import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle2, Clock3, MinusCircle, Send } from 'lucide-react'
import { getAuthUser } from '../lib/auth'

const growthRules = [
  'No bloated teams',
  'No generic playbooks',
  'Just outcome-driven expertise'
]

const COPILOT_PROMPT_KEY = 'magnafic-copilot-prompt'

export default function ValueProp() {
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

  const handleCopilotSubmit = (event) => {
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
    <section className="relative overflow-hidden bg-[#000047] px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_72%_50%,rgba(0,255,255,0.1),transparent_38%)]" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan/70 to-transparent" />

      <div className="relative mx-auto max-w-7xl">
        <div className="grid items-center gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:gap-8 lg:items-stretch">
          <div className="relative p-1 text-center sm:text-left lg:py-4">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_18%,rgba(0,255,255,0.14),transparent_42%)]" />
            
            <div className="relative">
            <h2 className="mb-4 text-center text-2xl font-extrabold leading-tight text-white sm:text-left sm:text-3xl">
              Big consulting is too big to evolve.
              <span className="block text-cyan-300">Consumer brands cannot afford to wait.</span>
            </h2>

            <div className="mx-auto mb-6 max-w-2xl text-center lg:mx-0 lg:text-left">
              <p className="py-4 text-base font-semibold leading-7 text-white/85 sm:text-lg">
                In today's dynamic marketplace, growth requires agility, intelligence, and execution, not endless presentations and oversized consulting structures.
              </p>
              
            </div>

            <h3 className="mb-4 text-lg font-extrabold leading-tight text-white sm:text-xl">
              Modern expertise for modern growth:
            </h3>

            <ul className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              {growthRules.map((rule, index) => (
                <li
                  key={rule}
                  className={`flex items-start justify-start gap-2 py-1 text-sm font-extrabold sm:text-base ${index < 2 ? 'text-red-100' : 'text-white'}`}
                >
                  {index < 2 ? (
                    <MinusCircle className="h-4 w-4 flex-shrink-0 text-red-300" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-cyan-300" />
                  )}
                  <span>{rule}</span>
                </li>
              ))}
            </ul>
            </div>
          </div>

          <div className="relative mx-auto flex w-full max-w-2xl items-center py-2 lg:h-full lg:max-w-none lg:py-4">
            <div className="pointer-events-none absolute inset-8 bg-[radial-gradient(circle,rgba(0,255,255,0.2)_0%,rgba(53,52,205,0.18)_38%,transparent_72%)] blur-3xl" />
            <div className="relative w-full px-1 py-3 sm:px-4 sm:py-4">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_38%,rgba(0,255,255,0.13),transparent_44%)]" />

              <div className="relative text-center">
                <h3 className="mb-4 text-2xl font-semibold text-white sm:text-3xl">
                  Start Your Journey Now
                </h3>
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

              <form onSubmit={handleCopilotSubmit} className="relative mt-7">
                <div className="copilot-prompt-glow rounded-[1.65rem] p-[2px]">
                  <div className="rounded-[calc(1.65rem-2px)] bg-[#08085c] px-4 pb-3 pt-3 shadow-2xl shadow-cyan-400/10 sm:px-5">
                    <textarea
                      rows={2}
                      value={prompt}
                      onChange={(event) => setPrompt(event.target.value)}
                      placeholder="Ask Magnafic Copilot"
                      aria-label="Ask Magnafic Copilot"
                      className="max-h-32 min-h-16 w-full resize-none border-0 bg-transparent px-1 py-1 text-sm leading-6 text-white outline-none placeholder:text-white/50 sm:text-base"
                    />
                    <div className="flex items-center justify-between gap-3">
                      <span className="inline-flex items-center gap-1.5 text-[11px] text-white/55">
                        <Clock3 className="h-3.5 w-3.5" />
                        1 credit per message
                      </span>
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
        </div>
      </div>
    </section>
  )
}
