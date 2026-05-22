import { Award, BookOpen, CalendarDays, Users } from 'lucide-react'
import SEO from '../components/SEO'
import { getAuthUser } from '../lib/auth'

export default function ConsultantDashboard() {
  const user = getAuthUser()

  return (
    <div className="min-h-screen bg-[#f7f9ff] px-4 pt-28 pb-16 sm:px-6 lg:px-8">
      <SEO title="Consultant Dashboard" description="Magnafic consultant dashboard." path="/dashboard/consultant" noIndex />
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary-600">Consultant Dashboard</p>
          <h1 className="mt-3 break-words text-3xl font-bold text-gray-950 sm:text-4xl">Welcome{user?.email ? `, ${user.email}` : ''}</h1>
          <p className="mt-3 max-w-2xl text-gray-600">Review assigned opportunities, sessions, and expert profile activity.</p>
        </div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: Users, label: 'Client opportunities', value: '0' },
            { icon: CalendarDays, label: 'Scheduled calls', value: '0' },
            { icon: Award, label: 'Profile status', value: 'Managed' },
            { icon: BookOpen, label: 'Knowledge assets', value: '0' },
          ].map(item => (
            <section key={item.label} className="rounded-[1.5rem] bg-white p-6 shadow-xl shadow-primary-900/5 ring-1 ring-gray-100">
              <item.icon className="mb-5 h-7 w-7 text-primary-600" />
              <p className="text-3xl font-bold text-gray-950">{item.value}</p>
              <p className="mt-1 text-sm font-medium text-gray-500">{item.label}</p>
            </section>
          ))}
        </div>

        <section className="mt-8 rounded-3xl bg-white p-5 shadow-xl shadow-primary-900/5 ring-1 ring-gray-100 sm:p-8">
          <h2 className="text-2xl font-bold text-gray-950">Backend-managed consultant access</h2>
          <p className="mt-3 max-w-3xl text-gray-600">Consultant signup is intentionally not exposed here. Once backend authentication is connected, approved consultants can land on this dashboard after login.</p>
        </section>
      </div>
    </div>
  )
}
