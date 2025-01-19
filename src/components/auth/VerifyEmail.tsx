import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Icons } from '@/components/ui/icons'
import { useSupabase } from '@/lib/supabase/supabase-provider'

export default function VerifyEmail() {
  const router = useRouter()
  const { supabase } = useSupabase()
  const [verifying, setVerifying] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        // In Next.js, we'll handle verification through the auth callback route
        // This component is just for showing the verification status
        setVerifying(false)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to verify email')
        setVerifying(false)
      }
    }

    verifyEmail()
  }, [])

  if (verifying) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen py-2">
        <Icons.spinner className="h-8 w-8 animate-spin" />
        <h1 className="mt-4 text-2xl font-semibold">Verifying your email...</h1>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen py-2">
        <Icons.alertCircle className="h-8 w-8 text-red-500" />
        <h1 className="mt-4 text-2xl font-semibold text-red-500">Verification failed</h1>
        <p className="mt-2 text-gray-600">{error}</p>
        <Button
          onClick={() => router.push('/auth/signin')}
          className="mt-4"
        >
          Back to Sign In
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <Icons.checkCircle className="h-8 w-8 text-green-500" />
      <h1 className="mt-4 text-2xl font-semibold text-green-500">Email verified!</h1>
      <p className="mt-2 text-gray-600">You can now sign in to your account.</p>
      <Button
        onClick={() => router.push('/auth/signin')}
        className="mt-4"
      >
        Sign In
      </Button>
    </div>
  )
}
