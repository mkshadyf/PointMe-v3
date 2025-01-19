import { createClient } from '../lib/supabase'
import { type User } from '../types/user'

interface AuthResponse {
  user: User | null
  error: Error | null
}

interface UserMetadata {
  name?: string
  role?: string
  avatarUrl?: string
}

const supabase = createClient()

const authService = {
  async signUp(email: string, password: string, metadata: UserMetadata): Promise<AuthResponse> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata
        }
      })

      if (error) throw error

      return {
        user: data.user ? {
          id: data.user.id,
          email: data.user.email,
          name: data.user.user_metadata?.name,
          role: data.user.user_metadata?.role,
          avatarUrl: data.user.user_metadata?.avatarUrl
        } : null,
        error: null
      }
    } catch (error) {
      return {
        user: null,
        error: error as Error
      }
    }
  },

  async signIn(email: string, password: string): Promise<AuthResponse> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) throw error

      return {
        user: data.user ? {
          id: data.user.id,
          email: data.user.email,
          name: data.user.user_metadata?.name,
          role: data.user.user_metadata?.role,
          avatarUrl: data.user.user_metadata?.avatarUrl
        } : null,
        error: null
      }
    } catch (error) {
      return {
        user: null,
        error: error as Error
      }
    }
  },

  async signOut(): Promise<void> {
    await supabase.auth.signOut()
  },

  async resetPassword(email: string): Promise<{ error: Error | null }> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email)
      if (error) throw error
      return { error: null }
    } catch (error) {
      return { error: error as Error }
    }
  },

  async updatePassword(newPassword: string): Promise<{ error: Error | null }> {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      })
      if (error) throw error
      return { error: null }
    } catch (error) {
      return { error: error as Error }
    }
  },

  async getCurrentUser(): Promise<User | null> {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) return null

    return {
      id: user.id,
      email: user.email!,
      name: user.user_metadata?.name,
      role: user.user_metadata?.role,
      avatarUrl: user.user_metadata?.avatarUrl
    }
  },

  async updateProfile(updates: Partial<UserMetadata>): Promise<{ error: Error | null }> {
    try {
      const { error } = await supabase.auth.updateUser({
        data: updates
      })

      if (error) throw error
      return { error: null }
    } catch (error) {
      return { error: error as Error }
    }
  },

  onAuthStateChange(callback: (user: User | null) => void) {
    return supabase.auth.onAuthStateChange((event, session) => {
      const user = session?.user
      if (user) {
        callback({
          id: user.id,
          email: user.email!,
          name: user.user_metadata?.name,
          role: user.user_metadata?.role,
          avatarUrl: user.user_metadata?.avatarUrl
        })
      } else {
        callback(null)
      }
    })
  }
}

export default authService
