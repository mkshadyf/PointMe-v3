export type UserRole = 'user' | 'business_owner' | 'admin' | 'business'

export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  role: UserRole;
  phone?: string;
  avatar?: string;
  avatar_url?: string;
  isActive: boolean;
  status?: string;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
  lastLogin?: Date;
  emailVerified?: boolean;
  businessId?: string;
  businessName?: string;
  reportCount?: number;
}

export interface UserProfile extends User {
  address?: string
  notifications?: Notification[]
}

export interface CreateUserInput {
  email: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  role?: UserRole;
  phone?: string;
  avatar?: string;
  businessId?: string;
}

export interface UpdateUserInput {
  firstName?: string
  lastName?: string
  email?: string
  name?: string;
  role?: UserRole
  phone?: string;
  avatar?: string;
  businessId?: string;
}

export interface Notification {
  id: string
  userId: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  isRead: boolean
  metadata?: Record<string, any>
  createdAt: Date
  updatedAt: Date
}
