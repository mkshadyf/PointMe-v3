 import { inferRouterInputs, inferRouterOutputs } from '@trpc/server'
import type { AppRouter } from '../server/routers/_app'

export type RouterInput = inferRouterInputs<AppRouter>
export type RouterOutput = inferRouterOutputs<AppRouter>

export type TRPCRouterOutput = RouterOutput
export type TRPCRouterInput = RouterInput

export interface User {
  id: string
  name: string
  email: string
  avatar?: string
  roles: string[]
  createdAt: Date
  updatedAt: Date
}

export interface Business {
  id: string
  name: string
  description: string
  address: string
  phone: string
  email: string
  website?: string
  coverImage?: string
  categories: string[]
  ownerId: string
  owner: User
  createdAt: Date
  updatedAt: Date
}

export interface Service {
  id: string
  name: string
  description: string
  price: number
  duration: number
  businessId: string
  business: Business
  createdAt: Date
  updatedAt: Date
}

export interface Booking {
  id: string
  startTime: Date
  endTime: Date
  status: 'pending' | 'confirmed' | 'cancelled'
  notes?: string
  userId: string
  user: User
  serviceId: string
  service: Service
  createdAt: Date
  updatedAt: Date
}

export interface Review {
  id: string
  rating: number
  content: string
  userId: string
  user: User
  businessId: string
  business: Business
  createdAt: Date
  updatedAt: Date
}

export interface Message {
  id: string
  content: string
  senderId: string
  sender: User
  receiverId: string
  receiver: User
  createdAt: Date
  updatedAt: Date
}

export interface Notification {
  id: string
  type: 'booking' | 'message' | 'review'
  title: string
  content: string
  read: boolean
  userId: string
  user: User
  createdAt: Date
  updatedAt: Date
}

export interface TRPCError {
  message: string
  code: string
  path?: string[]
  cause?: unknown
}

export interface CreateBusinessInput {
  name: string
  description: string
  address: string
  phone: string
  email: string
  website?: string
  categories: string[]
}

export interface UpdateBusinessInput extends Partial<CreateBusinessInput> {
  id: string
}

export interface CreateServiceInput {
  name: string
  description: string
  price: number
  duration: number
  businessId: string
}

export interface UpdateServiceInput extends Partial<CreateServiceInput> {
  id: string
}

export interface CreateBookingInput {
  serviceId: string
  date: Date
  status: 'pending' | 'confirmed' | 'cancelled'
  notes?: string
}

export interface CreateReviewInput {
  serviceId: string
  rating: number
  comment: string
}

export interface MessageInput {
  content: string
  recipientId: string
}

export interface NotificationInput {
  type: 'booking' | 'message' | 'review'
  title: string
  content: string
  recipientId: string
}

export type AuthState = {
  user: User | null
  token: string | null
  isAuthenticated: boolean | null
  isLoading: boolean | null
  setAuth: (user: User | null, token: string | null) => void
  updateUser: (updatedUser: Partial<User>) => void
  logout: () => void
}

export type Context = {
  user: User | null
}
