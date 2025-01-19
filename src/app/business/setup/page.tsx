import { BusinessSetupForm } from '@/components/business/BusinessSetupForm'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function BusinessSetupPage() {
  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <Card className="w-full max-w-2xl">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">Set up your business</CardTitle>
          <CardDescription className="text-center">
            Tell us about your business to get started
          </CardDescription>
        </CardHeader>
        <CardContent>
          <BusinessSetupForm />
        </CardContent>
      </Card>
    </div>
  )
}
