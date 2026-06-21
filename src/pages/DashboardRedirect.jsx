import { Navigate } from 'react-router-dom'
import { getAuthUser } from '../lib/auth'

export default function DashboardRedirect() {
  const user = getAuthUser()

  if (!user) return <Navigate to="/login" replace />
  if (user.role === 'consultant') return <Navigate to="/dashboard/consultant" replace />
  if (user.role === 'admin' || user.isAdmin === true) return <Navigate to="/admin" replace />
  if (user.role === 'client') return <Navigate to="/dashboard/client" replace />

  return <Navigate to="/dashboard/client" replace />
}
