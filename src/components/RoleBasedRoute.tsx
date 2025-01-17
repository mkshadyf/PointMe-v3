import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { UserRole } from '../types/user'

interface RoleBasedRouteProps {
  children: React.ReactNode
  allowedRoles: UserRole[]
}

const RoleBasedRoute: React.FC<RoleBasedRouteProps> = ({ children, allowedRoles }) => {
  const location = useLocation()
  const { isAuthenticated, user } = useAuthStore()

  if (!isAuthenticated || !user) {
    // Redirect to login page but save the attempted location
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (!allowedRoles.includes(user.role)) {
    // Redirect based on user role
    switch (user.role) {
      case 'admin':
        return <Navigate to="/admin/dashboard" replace />
      case 'business_owner':
        return <Navigate to="/business/dashboard" replace />
      default:
        return <Navigate to="/dashboard" replace />
    }
  }

  return <>{children}</>
}

export default RoleBasedRoute
