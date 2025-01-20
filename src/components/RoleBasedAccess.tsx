import React from 'react'
import { ReactNode } from 'react'
import { useAuth } from '../contexts/AuthContext'

interface RoleBasedAccessProps {
  children: ReactNode
  roles: string[]
  fallback?: ReactNode
}

const RoleBasedAccess: React.FC<RoleBasedAccessProps> = ({ children, roles, fallback = null }) => {
  const { user } = useAuth()

  if (!user || !roles.some(role => user.roles?.includes(role))) {
    return <>{fallback}</>
  }

  return <>{children}</>
}

export default RoleBasedAccess

