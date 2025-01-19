import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { type UserRole } from '@/types/user'

interface RoleBasedRouteProps {
  children: React.ReactNode
  allowedRoles: UserRole[]
}

const RoleBasedRoute: React.FC<RoleBasedRouteProps> = ({
  children,
  allowedRoles,
}) => {
  const { user } = useAuthStore()
  const location = useLocation()

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (!allowedRoles.includes(user.role)) {
    // Redirect based on user role
    switch (user.role) {
      case 'admin':
        return <Navigate to="/admin" replace />
      case 'business_owner':
        return <Navigate to="/business" replace />
      default:
        return <Navigate to="/" replace />
    }
  }

  return <>{children}</>
}

export default RoleBasedRoute
