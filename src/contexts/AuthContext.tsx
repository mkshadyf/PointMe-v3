import { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Session, User } from '@supabase/supabase-js'
import { createClient } from '@/utils/supabase/client'
import { useNotification } from '@/hooks/useNotification'

interface AuthContextType {
  user: User | null
  session: Session | null
  isLoading: boolean
  signInWithGoogle: () => Promise<void>
  signInWithEmail: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, role: 'user' | 'business_owner') => Promise<void>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  updatePassword: (password: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { showNotification } = useNotification()
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        setIsLoading(false)

        if (event === 'SIGNED_IN') {
          // Check if user is a business owner and needs to complete setup
          if (session?.user?.user_metadata?.role === 'business_owner') {
            const { data: business } = await supabase
              .from('businesses')
              .select()
              .eq('user_id', session.user.id)
              .single()

            if (!business) {
              router.push('/business/setup')
              return
            }
          }
          router.push('/dashboard')
        }

        if (event === 'SIGNED_OUT') {
          router.push('/auth/signin')
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [router, supabase])

  const handleError = (error: any) => {
    console.error('Auth error:', error)
    showNotification({
      title: 'Error',
      message: error.message || 'An error occurred during authentication',
      type: 'error',
    })
    throw error
  }

  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      if (error) throw error
    } catch (error) {
      handleError(error)
    }
  }

  const signInWithEmail = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error
    } catch (error) {
      handleError(error)
    }
  }

  const signUp = async (email: string, password: string, role: 'user' | 'business_owner') => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            role,
          },
        },
      })
      if (error) throw error

      showNotification({
        title: 'Success',
        message: 'Please check your email to verify your account',
        type: 'success',
      })
    } catch (error) {
      handleError(error)
    }
  }

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
    } catch (error) {
      handleError(error)
    }
  }

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/update-password`,
      })
      if (error) throw error

      showNotification({
        title: 'Success',
        message: 'Password reset instructions have been sent to your email',
        type: 'success',
      })
    } catch (error) {
      handleError(error)
    }
  }

  const updatePassword = async (password: string) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password,
      })
      if (error) throw error

      showNotification({
        title: 'Success',
        message: 'Password updated successfully',
        type: 'success',
      })
      router.push('/dashboard')
    } catch (error) {
      handleError(error)
    }
  }

  const value = {
    user,
    session,
    isLoading,
    signInWithGoogle,
    signInWithEmail,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
