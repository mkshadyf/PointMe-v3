import { useState } from 'react'
import useSWR from 'swr'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { LoadingSpinner } from '@/components/ui/loading'
import { useToast } from '@/hooks/useToast'
import { appointmentService } from '@/services/appointmentService'
import { paymentService } from '@/services/paymentService'

export default function PaymentPage({
  params,
}: {
  params: { id: string }
}) {
  const { id } = params
  const toast = useToast()
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentForm, setPaymentForm] = useState<{ url: string; data: Record<string, string> } | null>(null)

  const { data: appointment, error } = useSWR(
    id ? `appointments/${id}` : null,
    () => appointmentService.getAppointmentById(id!)
  )

  const initializePayment = async () => {
    try {
      setIsProcessing(true)
      const form = await paymentService.createPaymentForm({
        appointmentId: id!,
        amount: appointment?.price || 0,
        itemName: `Appointment #${id}`,
        itemDescription: appointment?.service?.name || 'Service Appointment',
      })
      setPaymentForm(form)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to initialize payment.',
        variant: 'destructive',
      })
    } finally {
      setIsProcessing(false)
    }
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Failed to load appointment details. Please try again later.
        </AlertDescription>
      </Alert>
    )
  }

  if (!appointment) {
    return <LoadingSpinner />
  }

  if (appointment.status === 'paid') {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Payment Complete</CardTitle>
          <CardDescription>
            Your appointment has been successfully paid for.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Details</CardTitle>
        <CardDescription>
          Complete your payment to confirm your appointment
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between">
            <span>Service:</span>
            <span>{appointment.service?.name}</span>
          </div>
          <div className="flex justify-between font-medium">
            <span>Total Amount:</span>
            <span>R {appointment.price?.toFixed(2)}</span>
          </div>

          {paymentForm ? (
            <form action={paymentForm.url} method="POST">
              {Object.entries(paymentForm.data).map(([key, value]) => (
                <input key={key} type="hidden" name={key} value={value} />
              ))}
              <Button type="submit" className="w-full">
                Proceed to Payment
              </Button>
            </form>
          ) : (
            <Button
              onClick={initializePayment}
              disabled={isProcessing}
              className="w-full"
            >
              {isProcessing ? (
                <>
                  <LoadingSpinner className="mr-2 h-4 w-4" />
                  Initializing...
                </>
              ) : (
                'Pay Now'
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
