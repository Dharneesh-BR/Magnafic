import { useEffect, useMemo, useState } from 'react'
import { AlertCircle, CalendarDays, ClipboardList, Loader2, Plus, Search, Sparkles } from 'lucide-react'
import SEO from '../components/SEO'
import { getAuthUser } from '../lib/auth'
import { createClientBrief, getBriefStats, subscribeClientBriefs } from '../lib/dashboard'

const initialBrief = {
  title: '',
  capability: '',
  urgency: 'medium',
  description: '',
}

function formatDate(date) {
  if (!date) return 'Just now'

  return new Intl.DateTimeFormat('en', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

function getDashboardError(error) {
  if (error?.code === 'permission-denied') {
    return 'Firestore permissions are blocking dashboard data. Allow signed-in users to create and read their own clientBriefs documents.'
  }

  return error?.message || 'Unable to load dashboard data right now.'
}

export default function ClientDashboard() {
  const user = getAuthUser()
  const [briefs, setBriefs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [form, setForm] = useState(initialBrief)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    let unsubscribe = null

    try {
      unsubscribe = subscribeClientBriefs(
        (items) => {
          setBriefs(items)
          setLoading(false)
          setError('')
        },
        (dashboardError) => {
          setError(getDashboardError(dashboardError))
          setLoading(false)
        }
      )
    } catch (dashboardError) {
      setError(getDashboardError(dashboardError))
      setLoading(false)
    }

    return () => unsubscribe?.()
  }, [])

  const stats = useMemo(() => getBriefStats(briefs), [briefs])
  const greetingName = user?.name && user.name.toLowerCase() !== user.email?.split('@')[0]?.toLowerCase()
    ? user.name
    : ''

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }))
    setError('')
  }

  const handleCreateBrief = async (event) => {
    event.preventDefault()
    setSubmitting(true)
    setError('')

    try {
      await createClientBrief(form)
      setForm(initialBrief)
    } catch (createError) {
      setError(getDashboardError(createError))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f7f9ff] px-4 pt-28 pb-16 sm:px-6 lg:px-8">
      <SEO title="Client Dashboard" description="Magnafic client dashboard." path="/dashboard/client" noIndex />
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary-600">Client Dashboard</p>
            <h1 className="mt-3 break-words text-3xl font-bold text-gray-950 sm:text-4xl">
              Welcome{greetingName ? `, ${greetingName}` : ''}
            </h1>
            <p className="mt-3 max-w-2xl text-gray-600">
              Track your expert briefs, matching progress, and consulting workspaces from one live Firebase dashboard.
            </p>
          </div>

          <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-xl shadow-primary-900/5">
            <p className="text-sm font-semibold text-gray-500">Signed in as</p>
            <p className="mt-2 break-words text-lg font-bold text-gray-950">{user?.email}</p>
            {user?.company && <p className="mt-1 text-sm text-gray-600">{user.company}</p>}
          </section>
        </div>

        {error && (
          <div className="mb-6 flex gap-3 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: ClipboardList, label: 'Total briefs', value: stats.total },
            { icon: Search, label: 'Active briefs', value: stats.active },
            { icon: CalendarDays, label: 'Scheduled sessions', value: stats.scheduled },
            { icon: Sparkles, label: 'In matching', value: stats.matching },
          ].map(item => (
            <section key={item.label} className="rounded-[1.5rem] bg-white p-6 shadow-xl shadow-primary-900/5 ring-1 ring-gray-100">
              <item.icon className="mb-5 h-7 w-7 text-primary-600" />
              <p className="text-3xl font-bold text-gray-950">{loading ? '-' : item.value}</p>
              <p className="mt-1 text-sm font-medium text-gray-500">{item.label}</p>
            </section>
          ))}
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[420px_minmax(0,1fr)]">
          <section className="rounded-3xl bg-white p-5 shadow-xl shadow-primary-900/5 ring-1 ring-gray-100 sm:p-6">
            <div className="mb-6 flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-50 text-primary-600">
                <Plus className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-xl font-bold text-gray-950">Create expert brief</h2>
                <p className="text-sm text-gray-500">Saved to Firestore in real time.</p>
              </div>
            </div>

            <form className="space-y-4" onSubmit={handleCreateBrief}>
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">Brief title</label>
                <input
                  required
                  value={form.title}
                  onChange={(event) => updateField('title', event.target.value)}
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                  placeholder="Launch GTM strategy"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">Capability</label>
                <input
                  value={form.capability}
                  onChange={(event) => updateField('capability', event.target.value)}
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                  placeholder="Distribution, AI, M&A, finance..."
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">Urgency</label>
                <select
                  value={form.urgency}
                  onChange={(event) => updateField('urgency', event.target.value)}
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">Description</label>
                <textarea
                  required
                  rows={5}
                  value={form.description}
                  onChange={(event) => updateField('description', event.target.value)}
                  className="w-full resize-none rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                  placeholder="Describe the business challenge, timeline, and outcome you need."
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="flex w-full items-center justify-center rounded-xl bg-primary-600 px-6 py-3 font-semibold text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Creating brief...
                  </>
                ) : (
                  'Create brief'
                )}
              </button>
            </form>
          </section>

          <section className="rounded-3xl bg-white p-5 shadow-xl shadow-primary-900/5 ring-1 ring-gray-100 sm:p-6">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-gray-950">Your briefs</h2>
                <p className="text-sm text-gray-500">Live from Firestore `clientBriefs`.</p>
              </div>
              {loading && <Loader2 className="h-5 w-5 animate-spin text-primary-600" />}
            </div>

            {!loading && briefs.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-gray-200 p-8 text-center">
                <ClipboardList className="mx-auto mb-4 h-10 w-10 text-primary-500" />
                <h3 className="text-lg font-bold text-gray-950">No briefs yet</h3>
                <p className="mt-2 text-sm text-gray-600">Create your first brief to start matching with Magnafic experts.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {briefs.map((brief) => (
                  <article key={brief.id} className="rounded-2xl border border-gray-100 p-4 transition hover:border-primary-200 hover:bg-primary-50/40">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <h3 className="font-bold text-gray-950">{brief.title}</h3>
                        <p className="mt-1 text-sm font-medium text-primary-700">{brief.capability}</p>
                      </div>
                      <span className="w-fit rounded-full bg-gray-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-gray-700">
                        {brief.status || 'new'}
                      </span>
                    </div>
                    <p className="mt-3 line-clamp-2 text-sm leading-6 text-gray-600">{brief.description}</p>
                    <div className="mt-4 flex flex-wrap gap-3 text-xs font-medium text-gray-500">
                      <span>Urgency: {brief.urgency || 'medium'}</span>
                      <span>Created: {formatDate(brief.createdAtDate)}</span>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}
