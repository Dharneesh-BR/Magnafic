import { useEffect, useMemo, useState } from 'react'
import { AlertCircle, Award, BookOpen, CalendarDays, Loader2, Users } from 'lucide-react'
import SEO from '../components/SEO'
import { getAuthUser } from '../lib/auth'
import { subscribeConsultantOpportunities } from '../lib/dashboard'

function formatDate(date) {
  if (!date) return 'Not scheduled'

  return new Intl.DateTimeFormat('en', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

function getDashboardError(error) {
  if (error?.code === 'permission-denied') {
    return 'Firestore permissions are blocking consultant opportunities. Allow consultants to read briefs assigned to their uid.'
  }

  return error?.message || 'Unable to load consultant dashboard data right now.'
}

export default function ConsultantDashboard() {
  const user = getAuthUser()
  const [opportunities, setOpportunities] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let unsubscribe = null

    try {
      unsubscribe = subscribeConsultantOpportunities(
        (items) => {
          setOpportunities(items)
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

  const stats = useMemo(() => ({
    opportunities: opportunities.length,
    scheduled: opportunities.filter((item) => item.status === 'scheduled').length,
    active: opportunities.filter((item) => item.status === 'active').length,
  }), [opportunities])

  return (
    <div className="min-h-screen bg-[#f7f9ff] px-4 pt-28 pb-16 sm:px-6 lg:px-8">
      <SEO title="Consultant Dashboard" description="Magnafic consultant dashboard." path="/dashboard/consultant" noIndex />
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary-600">Consultant Dashboard</p>
          <h1 className="mt-3 break-words text-3xl font-bold text-gray-950 sm:text-4xl">
            Welcome{user?.name || user?.email ? `, ${user.name || user.email}` : ''}
          </h1>
          <p className="mt-3 max-w-2xl text-gray-600">Review assigned opportunities, scheduled sessions, and profile activity from Firebase.</p>
        </div>

        {error && (
          <div className="mb-6 flex gap-3 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: Users, label: 'Assigned opportunities', value: stats.opportunities },
            { icon: CalendarDays, label: 'Scheduled calls', value: stats.scheduled },
            { icon: Award, label: 'Active workspaces', value: stats.active },
            { icon: BookOpen, label: 'Knowledge assets', value: 0 },
          ].map(item => (
            <section key={item.label} className="rounded-[1.5rem] bg-white p-6 shadow-xl shadow-primary-900/5 ring-1 ring-gray-100">
              <item.icon className="mb-5 h-7 w-7 text-primary-600" />
              <p className="text-3xl font-bold text-gray-950">{loading ? '-' : item.value}</p>
              <p className="mt-1 text-sm font-medium text-gray-500">{item.label}</p>
            </section>
          ))}
        </div>

        <section className="mt-8 rounded-3xl bg-white p-5 shadow-xl shadow-primary-900/5 ring-1 ring-gray-100 sm:p-8">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-950">Assigned opportunities</h2>
              <p className="mt-2 max-w-3xl text-gray-600">Briefs appear here when their `assignedConsultantId` matches your Firebase uid.</p>
            </div>
            {loading && <Loader2 className="h-5 w-5 animate-spin text-primary-600" />}
          </div>

          {!loading && opportunities.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-200 p-8 text-center">
              <Users className="mx-auto mb-4 h-10 w-10 text-primary-500" />
              <h3 className="text-lg font-bold text-gray-950">No assigned opportunities yet</h3>
              <p className="mt-2 text-sm text-gray-600">Approved consultant assignments will appear here automatically.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {opportunities.map((item) => (
                <article key={item.id} className="rounded-2xl border border-gray-100 p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h3 className="font-bold text-gray-950">{item.title}</h3>
                      <p className="mt-1 text-sm font-medium text-primary-700">{item.capability}</p>
                    </div>
                    <span className="w-fit rounded-full bg-gray-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-gray-700">
                      {item.status || 'assigned'}
                    </span>
                  </div>
                  <p className="mt-3 line-clamp-2 text-sm leading-6 text-gray-600">{item.description}</p>
                  <p className="mt-4 text-xs font-medium text-gray-500">Created: {formatDate(item.createdAtDate)}</p>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
