import React from 'react'
import { useAuthStore } from '@/stores/authStore'
import { type UserRole } from '@/types/user'

interface RoleBasedAccessProps {
  children: React.ReactNode
  allowedRoles: UserRole[]
}

const RoleBasedAccess: React.FC<RoleBasedAccessProps> = ({
  children,
  allowedRoles,
}) => {
  const { user } = useAuthStore()

  if (!user || !allowedRoles.includes(user.role)) {
    return null
  }

  return <>{children}</>
}

export default RoleBasedAccess
