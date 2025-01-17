import create from 'zustand'
import { persist } from 'zustand/middleware'
import { User } from '../types/user'
import authService from '../services/authService'

interface AuthState {
  isAuthenticated: boolean
  user: User | null
  session: any | null
  loading: boolean
  error: string | null
  login: (email: string, password: string) => Promise<void>
  loginWithGoogle: () => Promise<void>
  logout: () => Promise<void>
  updateUser: (user: Partial<User>) => void
  clearError: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      user: null,
      session: null,
      loading: false,
      error: null,

      login: async (email: string, password: string) => {
        set({ loading: true, error: null })
        try {
          const response = await authService.signInWithEmail(email, password)
          if (response.error) throw response.error
          set({
            isAuthenticated: true,
            user: response.user,
            session: response.session,
            loading: false
          })
        } catch (error) {
          set({
            loading: false,
            error: (error as Error).message
          })
        }
      },

      loginWithGoogle: async () => {
        set({ loading: true, error: null })
        try {
          const response = await authService.signInWithGoogle()
          if (response.error) throw response.error
          set({
            isAuthenticated: true,
            user: response.user,
            session: response.session,
            loading: false
          })
        } catch (error) {
          set({
            loading: false,
            error: (error as Error).message
          })
        }
      },

      logout: async () => {
        set({ loading: true, error: null })
        try {
          await authService.signOut()
          set({
            isAuthenticated: false,
            user: null,
            session: null,
            loading: false
          })
        } catch (error) {
          set({
            loading: false,
            error: (error as Error).message
          })
        }
      },

      updateUser: (updatedUser) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updatedUser } : null,
        })),

      clearError: () => set({ error: null })
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        user: state.user,
        session: state.session
      })
    }
  )
)
