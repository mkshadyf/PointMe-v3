import { ReactNode } from 'react'
import { Navigate } from '@tanstack/react-router'
import { useAuth } from '../contexts/AuthContext'

interface ProtectedRouteProps {
  children: ReactNode
  roles?: string[]
}

export default function ProtectedRoute({ children, roles }: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />
  }

  if (roles && !roles.some(role => user?.roles?.includes(role))) {
    return <Navigate to="/unauthorized" />
  }

  return <>{children}</>
}
