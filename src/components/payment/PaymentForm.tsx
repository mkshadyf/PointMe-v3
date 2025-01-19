import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Icons } from '@/components/ui/icons'
import { useNotification } from '@/hooks/useNotification'
import { mockPaymentService } from '@/services/mockPaymentService'

const paymentSchema = z.object({
  cardNumber: z.string()
    .length(16, 'Card number must be 16 digits')
    .regex(/^\d+$/, 'Card number must contain only digits'),
  cardName: z.string().min(1, 'Cardholder name is required'),
  expiry: z.string()
    .regex(/^\d{2}\/\d{2}$/, 'Expiry must be in MM/YY format'),
  cvc: z.string()
    .length(3, 'CVC must be 3 digits')
    .regex(/^\d+$/, 'CVC must contain only digits'),
  saveCard: z.boolean().optional(),
})

type PaymentFormInput = z.infer<typeof paymentSchema>

interface PaymentFormProps {
  amount: number
  currency: string
  appointmentId: string
  businessId: string
  onSuccess?: (payment: any) => void
  onError?: (error: any) => void
}

export function PaymentForm({
  amount,
  currency,
  appointmentId,
  businessId,
  onSuccess,
  onError,
}: PaymentFormProps) {
  const router = useRouter()
  const { showNotification } = useNotification()
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'paypal'>('card')

  const form = useForm<PaymentFormInput>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      cardNumber: '',
      cardName: '',
      expiry: '',
      cvc: '',
      saveCard: false,
    },
  })

  const onSubmit = async (data: PaymentFormInput) => {
    try {
      setIsProcessing(true)

      // Validate card details
      const isValid = mockPaymentService.validateCard({
        number: data.cardNumber,
        expiry: data.expiry,
        cvc: data.cvc,
        name: data.cardName,
      })

      if (!isValid) {
        throw new Error('Invalid card details')
      }

      // Create payment intent
      const intent = await mockPaymentService.createPaymentIntent(amount, currency)

      // Process payment
      const payment = await mockPaymentService.processPayment({
        amount,
        currency,
        method: paymentMethod,
        appointmentId,
        customerId: 'mock_customer_id', // In real app, get from auth context
        businessId,
        metadata: {
          saveCard: data.saveCard,
        },
      })

      showNotification({
        title: 'Payment Successful',
        message: 'Your payment has been processed successfully',
        type: 'success',
      })

      onSuccess?.(payment)
      router.push(`/appointments/${appointmentId}/confirmation`)
    } catch (error: any) {
      showNotification({
        title: 'Payment Failed',
        message: error.message || 'Failed to process payment',
        type: 'error',
      })
      onError?.(error)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <Card className="w-full max-w-lg">
      <CardHeader>
        <CardTitle>Payment Details</CardTitle>
        <CardDescription>
          Enter your payment information to complete the booking
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <div className="text-lg font-semibold">
            Total Amount: {new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency,
            }).format(amount / 100)}
          </div>
        </div>

        <div className="mb-6">
          <label className="text-sm font-medium">Payment Method</label>
          <div className="mt-2 flex gap-4">
            <Button
              type="button"
              variant={paymentMethod === 'card' ? 'default' : 'outline'}
              className="flex-1"
              onClick={() => setPaymentMethod('card')}
            >
              <Icons.creditCard className="mr-2 h-4 w-4" />
              Card
            </Button>
            <Button
              type="button"
              variant={paymentMethod === 'paypal' ? 'default' : 'outline'}
              className="flex-1"
              onClick={() => setPaymentMethod('paypal')}
            >
              <Icons.paypal className="mr-2 h-4 w-4" />
              PayPal
            </Button>
          </div>
        </div>

        {paymentMethod === 'card' ? (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="cardNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Card Number</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="1234 5678 9012 3456"
                        maxLength={16}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="cardName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cardholder Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="John Doe" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="expiry"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Expiry Date</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="MM/YY" maxLength={5} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="cvc"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CVC</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="123" maxLength={3} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="saveCard"
                  {...form.register('saveCard')}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <label
                  htmlFor="saveCard"
                  className="text-sm text-muted-foreground"
                >
                  Save card for future payments
                </label>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>Pay Now</>
                )}
              </Button>
            </form>
          </Form>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              You will be redirected to PayPal to complete your payment
            </p>
            <Button
              className="mt-4 w-full"
              onClick={() => {
                showNotification({
                  title: 'Mock PayPal',
                  message: 'This is a mock PayPal integration',
                  type: 'info',
                })
              }}
            >
              <Icons.paypal className="mr-2 h-4 w-4" />
              Continue with PayPal
            </Button>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex-col space-y-2">
        <div className="flex items-center text-sm text-muted-foreground">
          <Icons.shield className="mr-2 h-4 w-4" />
          Your payment information is secure and encrypted
        </div>
        <div className="flex justify-center space-x-4">
          <Icons.visa className="h-8 w-auto opacity-50" />
          <Icons.mastercard className="h-8 w-auto opacity-50" />
          <Icons.amex className="h-8 w-auto opacity-50" />
        </div>
      </CardFooter>
    </Card>
  )
}
