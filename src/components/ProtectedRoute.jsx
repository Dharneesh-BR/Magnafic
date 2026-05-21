import { Navigate } from 'react-router-dom'
import { getAuthUser } from '../lib/auth'

export default function ProtectedRoute({ role, children }) {
  const user = getAuthUser()

  if (!user) return <Navigate to="/login" replace />
  if (role && user.role !== role) return <Navigate to="/dashboard" replace />

  return children
}
