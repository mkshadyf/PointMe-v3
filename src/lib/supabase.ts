import { createBrowserClient, createServerClient } from '@supabase/ssr'
import { Database } from '../types/supabase'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const createClient = () => {
  return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey)
}

export const createServerSupabaseClient = ({ 
  headers = {},
  cookies = {},
}: {
  headers?: Record<string, string>
  cookies?: Record<string, string>
} = {}) => {
  return createServerClient<Database>(
    supabaseUrl,
    supabaseAnonKey,
    { headers, cookies }
  )
}

// Database Types
export type Tables = {
  users: {
    Row: {
      id: string
      email: string
      role: 'user' | 'business_owner' | 'admin'
      created_at: string
      updated_at: string
    }
    Insert: {
      email: string
      role?: 'user' | 'business_owner' | 'admin'
    }
    Update: {
      email?: string
      role?: 'user' | 'business_owner' | 'admin'
    }
  }
  businesses: {
    Row: {
      id: string
      name: string
      description: string
      user_id: string
      created_at: string
      updated_at: string
    }
    Insert: {
      name: string
      description: string
      user_id: string
    }
    Update: {
      name?: string
      description?: string
    }
  }
  services: {
    Row: {
      id: string
      name: string
      description: string
      price: number
      duration: number
      business_id: string
      created_at: string
      updated_at: string
    }
    Insert: {
      name: string
      description: string
      price: number
      duration: number
      business_id: string
    }
    Update: {
      name?: string
      description?: string
      price?: number
      duration?: number
    }
  }
  bookings: {
    Row: {
      id: string
      user_id: string
      service_id: string
      start_time: string
      end_time: string
      status: 'pending' | 'confirmed' | 'cancelled'
      created_at: string
      updated_at: string
    }
    Insert: {
      user_id: string
      service_id: string
      start_time: string
      end_time: string
      status?: 'pending' | 'confirmed' | 'cancelled'
    }
    Update: {
      status?: 'pending' | 'confirmed' | 'cancelled'
    }
  }
  reviews: {
    Row: {
      id: string
      user_id: string
      service_id: string
      rating: number
      comment: string
      created_at: string
      updated_at: string
    }
    Insert: {
      user_id: string
      service_id: string
      rating: number
      comment: string
    }
    Update: {
      rating?: number
      comment?: string
    }
  }
  business_reviews: {
    Row: {
      id: string
      user_id: string
      business_id: string
      rating: number
      comment: string
      created_at: string
      updated_at: string
    }
    Insert: {
      user_id: string
      business_id: string
      rating: number
      comment: string
    }
    Update: {
      rating?: number
      comment?: string
    }
  }
  notifications: {
    Row: {
      id: string
      user_id: string
      title: string
      message: string
      type: 'info' | 'success' | 'warning' | 'error'
      is_read: boolean
      metadata?: Record<string, any>
      created_at: string
      updated_at: string
    }
    Insert: {
      user_id: string
      title: string
      message: string
      type?: 'info' | 'success' | 'warning' | 'error'
      is_read?: boolean
      metadata?: Record<string, any>
    }
    Update: {
      is_read?: boolean
      metadata?: Record<string, any>
    }
  }
}
