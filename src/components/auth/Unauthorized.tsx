import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Icons } from '@/components/ui/icons'

export default function Unauthorized() {
  const navigate = useNavigate()

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col items-center space-y-4">
          <Icons.warning className="h-12 w-12 text-yellow-500" />
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">
              Access Denied
            </h1>
            <p className="text-sm text-muted-foreground">
              You don't have permission to access this page.
            </p>
          </div>
          <div className="flex gap-4">
            <Button onClick={() => navigate(-1)}>
              Go Back
            </Button>
            <Button variant="outline" onClick={() => navigate('/')}>
              Home
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
