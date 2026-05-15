import { Navigate } from 'react-router-dom'
import type { ReactNode } from 'react'

import { useAuth } from '../../features/auth/hooks/useAuth'

type Role = 'ADMIN' | 'HOST' | 'GUEST'

type ProtectedRouteProps = {
  children: ReactNode
  allowedRoles?: Role[]
}

export function ProtectedRoute({
  children,
  allowedRoles,
}: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuth()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (
    allowedRoles &&
    user?.role &&
    !allowedRoles.includes(user.role)
  ) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}