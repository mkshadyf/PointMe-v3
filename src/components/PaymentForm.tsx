import React, { useState } from 'react'
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { Button, Box, Typography } from '@mui/material'
import { trpc } from '../utils/trpc'

interface PaymentFormProps {
  bookingId: string
  amount: number
  onPaymentSuccess: () => void
}

const PaymentForm: React.FC<PaymentFormProps> = ({ bookingId, amount, onPaymentSuccess }) => {
  const stripe = useStripe()
  const elements = useElements()
  const [error, setError] = useState<string | null>(null)
  const [processing, setProcessing] = useState(false)

  const createPaymentIntentMutation = trpc.business.createPaymentIntent.useMutation()
  const confirmBookingPaymentMutation = trpc.business.confirmBookingPayment.useMutation()

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!stripe || !elements) {
      return
    }

    setProcessing(true)

    try {
      const { clientSecret } = await createPaymentIntentMutation.mutateAsync({
        amount,
        currency: 'usd',
      })

      const cardElement = elements.getElement(CardElement)

      if (!cardElement) {
        throw new Error('Card element not found')
      }

      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
        },
      })

      if (stripeError) {
        setError(stripeError.message || 'An error occurred during payment processing')
      } else if (paymentIntent.status === 'succeeded') {
        await confirmBookingPaymentMutation.mutateAsync({
          bookingId,
          paymentIntentId: paymentIntent.id,
        })
        onPaymentSuccess()
      }
    } catch (err) {
      setError('An error occurred during payment processing')
    }

    setProcessing(false)
  }

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 400, margin: 'auto' }}>
      <CardElement
        options={{
          style: {
            base: {
              fontSize: '16px',
              color: '#424770',
              '::placeholder': {
                color: '#aab7c4',
              },
            },
            invalid: {
              color: '#9e2146',
            },
          },
        }}
      />
      <Button
        type="submit"
        fullWidth
        variant="contained"
        color="primary"
        disabled={!stripe || processing}
        sx={{ mt: 3 }}
      >
        Pay ${(amount / 100).toFixed(2)}
      </Button>
      {error && (
        <Typography color="error" sx={{ mt: 2 }}>
          {error}
        </Typography>
      )}
    </Box>
  )
}

export default PaymentForm

