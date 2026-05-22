import { CalendarDays, ClipboardList, Search, Sparkles } from 'lucide-react'
import SEO from '../components/SEO'
import { getAuthUser } from '../lib/auth'

export default function ClientDashboard() {
  const user = getAuthUser()

  return (
    <div className="min-h-screen bg-[#f7f9ff] px-4 pt-28 pb-16 sm:px-6 lg:px-8">
      <SEO title="Client Dashboard" description="Magnafic client dashboard." path="/dashboard/client" noIndex />
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary-600">Client Dashboard</p>
          <h1 className="mt-3 break-words text-3xl font-bold text-gray-950 sm:text-4xl">Welcome{user?.name ? `, ${user.name}` : ''}</h1>
          <p className="mt-3 max-w-2xl text-gray-600">Track briefs, discover experts, and manage active consulting workspaces.</p>
        </div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: ClipboardList, label: 'Active briefs', value: '0' },
            { icon: Search, label: 'Expert matches', value: 'Ready' },
            { icon: CalendarDays, label: 'Upcoming sessions', value: '0' },
            { icon: Sparkles, label: 'AI recommendations', value: 'New' },
          ].map(item => (
            <section key={item.label} className="rounded-[1.5rem] bg-white p-6 shadow-xl shadow-primary-900/5 ring-1 ring-gray-100">
              <item.icon className="mb-5 h-7 w-7 text-primary-600" />
              <p className="text-3xl font-bold text-gray-950">{item.value}</p>
              <p className="mt-1 text-sm font-medium text-gray-500">{item.label}</p>
            </section>
          ))}
        </div>

        <section className="mt-8 rounded-3xl bg-white p-5 shadow-xl shadow-primary-900/5 ring-1 ring-gray-100 sm:p-8">
          <h2 className="text-2xl font-bold text-gray-950">Start a new expert brief</h2>
          <p className="mt-3 max-w-3xl text-gray-600">Create a project brief for growth, digital transformation, GTM, operations, AI systems, or category strategy. The matching workflow can connect to your backend when ready.</p>
          <button className="mt-6 rounded-xl bg-primary-600 px-6 py-3 font-semibold text-white transition hover:bg-primary-700">
            Create brief
          </button>
        </section>
      </div>
    </div>
  )
}
