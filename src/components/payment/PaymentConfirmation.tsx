import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Icons } from '@/components/ui/icons'
import { mockPaymentService } from '@/services/mockPaymentService'
import { Payment } from '@/types/payment'

interface PaymentConfirmationProps {
  paymentId: string
  appointmentId: string
}

export function PaymentConfirmation({
  paymentId,
  appointmentId,
}: PaymentConfirmationProps) {
  const router = useRouter()
  const [payment, setPayment] = useState<Payment | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadPayment = async () => {
      try {
        const paymentData = await mockPaymentService.getPayment(paymentId)
        setPayment(paymentData)
      } catch (error) {
        console.error('Failed to load payment:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadPayment()
  }, [paymentId])

  if (isLoading) {
    return (
      <Card className="w-full max-w-lg">
        <CardContent className="flex flex-col items-center justify-center py-10">
          <Icons.spinner className="h-8 w-8 animate-spin" />
          <p className="mt-4 text-muted-foreground">Loading payment details...</p>
        </CardContent>
      </Card>
    )
  }

  if (!payment) {
    return (
      <Card className="w-full max-w-lg">
        <CardContent className="flex flex-col items-center justify-center py-10">
          <Icons.alertCircle className="h-8 w-8 text-destructive" />
          <p className="mt-4 text-muted-foreground">Payment not found</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-lg">
      <CardHeader>
        <div className="flex justify-center mb-6">
          {payment.status === 'completed' ? (
            <div className="rounded-full bg-green-100 p-3">
              <Icons.checkCircle className="h-8 w-8 text-green-600" />
            </div>
          ) : (
            <div className="rounded-full bg-red-100 p-3">
              <Icons.xCircle className="h-8 w-8 text-red-600" />
            </div>
          )}
        </div>
        <CardTitle className="text-center">
          {payment.status === 'completed'
            ? 'Payment Successful!'
            : 'Payment Failed'}
        </CardTitle>
        <CardDescription className="text-center">
          {payment.status === 'completed'
            ? 'Your payment has been processed successfully'
            : 'There was an issue processing your payment'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between py-2 border-b">
            <span className="text-muted-foreground">Payment ID</span>
            <span className="font-mono">{payment.id}</span>
          </div>
          <div className="flex justify-between py-2 border-b">
            <span className="text-muted-foreground">Amount</span>
            <span className="font-semibold">
              {new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: payment.currency,
              }).format(payment.amount / 100)}
            </span>
          </div>
          <div className="flex justify-between py-2 border-b">
            <span className="text-muted-foreground">Payment Method</span>
            <span className="capitalize">{payment.method}</span>
          </div>
          <div className="flex justify-between py-2 border-b">
            <span className="text-muted-foreground">Date</span>
            <span>
              {new Date(payment.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>
          {payment.transactionId && (
            <div className="flex justify-between py-2 border-b">
              <span className="text-muted-foreground">Transaction ID</span>
              <span className="font-mono">{payment.transactionId}</span>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex-col space-y-4">
        <Button
          className="w-full"
          onClick={() => router.push(`/appointments/${appointmentId}`)}
        >
          View Appointment Details
        </Button>
        {payment.status === 'completed' && (
          <Button
            variant="outline"
            className="w-full"
            onClick={() => {
              // Mock download receipt
              window.alert('Downloading receipt... (Mock functionality)')
            }}
          >
            <Icons.download className="mr-2 h-4 w-4" />
            Download Receipt
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
