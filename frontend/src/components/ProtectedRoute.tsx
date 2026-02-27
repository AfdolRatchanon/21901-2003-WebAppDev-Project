import { Navigate } from 'react-router-dom'
import type { UserRole } from '../types'

interface ProtectedRouteProps {
  children: React.ReactNode
  isAuthenticated: boolean
  userRole?: UserRole | null
  requiredRole?: UserRole
}

export function ProtectedRoute({
  children,
  isAuthenticated,
  userRole,
  requiredRole,
}: ProtectedRouteProps) {
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (requiredRole && userRole !== requiredRole) {
    return <Navigate to="/forbidden" replace />
  }

  return <>{children}</>
}
