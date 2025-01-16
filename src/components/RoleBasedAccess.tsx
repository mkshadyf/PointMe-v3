import React from 'react'
import { useAuthStore } from '../stores/authStore'
import { UserRole } from '../types/user'

interface RoleBasedAccessProps {
  allowedRoles: UserRole[]
  children: React.ReactNode
}

const RoleBasedAccess: React.FC<RoleBasedAccessProps> = ({ allowedRoles, children }) => {
  const user = useAuthStore((state) => state.user)

  if (!user || !allowedRoles.includes(user.role)) {
    return null
  }

  return <>{children}</>
}

export default RoleBasedAccess

