import { supabase } from '../lib/supabase'
import { User } from '../types/user'

interface AuthResponse {
  user: User | null
  session: any | null
  error: Error | null
}

const authService = {
  async signInWithEmail(email: string, password: string): Promise<AuthResponse> {
    try {
      const { data: { user, session }, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      return {
        user: user ? {
          id: user.id,
          email: user.email!,
          name: user.user_metadata.full_name || '',
          role: user.user_metadata.role || 'user',
        } : null,
        session,
        error: null
      }
    } catch (error) {
      return {
        user: null,
        session: null,
        error: error as Error
      }
    }
  },

  async signInWithGoogle(): Promise<AuthResponse> {
    try {
      const { data: { user, session }, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      })

      if (error) throw error

      return {
        user: user ? {
          id: user.id,
          email: user.email!,
          name: user.user_metadata.full_name || '',
          role: user.user_metadata.role || 'user',
        } : null,
        session,
        error: null
      }
    } catch (error) {
      return {
        user: null,
        session: null,
        error: error as Error
      }
    }
  },

  async signOut(): Promise<void> {
    await supabase.auth.signOut()
  },

  async refreshSession(): Promise<AuthResponse> {
    try {
      const { data: { user, session }, error } = await supabase.auth.refreshSession()

      if (error) throw error

      return {
        user: user ? {
          id: user.id,
          email: user.email!,
          name: user.user_metadata.full_name || '',
          role: user.user_metadata.role || 'user',
        } : null,
        session,
        error: null
      }
    } catch (error) {
      return {
        user: null,
        session: null,
        error: error as Error
      }
    }
  },

  onAuthStateChange(callback: (user: User | null) => void) {
    return supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        const user: User = {
          id: session.user.id,
          email: session.user.email!,
          name: session.user.user_metadata.full_name || '',
          role: session.user.user_metadata.role || 'user',
        }
        callback(user)
      } else {
        callback(null)
      }
    })
  }
}

export default authService
