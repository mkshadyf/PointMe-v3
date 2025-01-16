export interface PaymentIntent {
  id: string
  amount: number
  status: 'requires_payment_method' | 'requires_confirmation' | 'succeeded'
  clientSecret: string
}

export interface CreatePaymentIntentInput {
  amount: number
  currency: string
}

