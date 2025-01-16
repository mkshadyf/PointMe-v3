export type UserRole = 'user' | 'business_owner' | 'admin'

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
}

