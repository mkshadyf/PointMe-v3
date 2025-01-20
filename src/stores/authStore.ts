import { create } from 'zustand'
import { supabase } from '../server/supabase'
import { Session, User } from '@supabase/supabase-js'

interface AuthState {
  [x: string]: any
  session: Session | null
  user: User | null
  loading: boolean
  error: string | null
  initialize: () => Promise<void>
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  signup: (email: string, password: string, name: string) => Promise<void>
}

const useAuthStore = create<AuthState>((set) => ({
  session: null,
  user: null,
  loading: true,
  error: null,

  initialize: async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      if (error) throw error
      set({ session, user: session?.user ?? null, loading: false })
    } catch (error) {
      set({ error: (error as Error).message, loading: false })
    }
  },

  login: async (email: string, password: string) => {
    try {
      set({ loading: true, error: null })
      const { data: { session }, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error
      set({ session, user: session?.user ?? null })
    } catch (error) {
      set({ error: (error as Error).message })
    } finally {
      set({ loading: false })
    }
  },

  logout: async () => {
    try {
      set({ loading: true, error: null })
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      set({ session: null, user: null })
    } catch (error) {
      set({ error: (error as Error).message })
    } finally {
      set({ loading: false })
    }
  },

  signup: async (email: string, password: string, name: string) => {
    try {
      set({ loading: true, error: null })
      const { data: { session }, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
        },
      })
      if (error) throw error
      set({ session, user: session?.user ?? null })
    } catch (error) {
      set({ error: (error as Error).message })
    } finally {
      set({ loading: false })
    }
  },
}))

export default useAuthStore
