import { CreatePaymentInput, Payment, PaymentIntent, RefundInput } from '@/types/payment'

// Simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

class MockPaymentService {
  private static instance: MockPaymentService
  private transactions: Map<string, Payment>

  private constructor() {
    this.transactions = new Map()
  }

  public static getInstance(): MockPaymentService {
    if (!MockPaymentService.instance) {
      MockPaymentService.instance = new MockPaymentService()
    }
    return MockPaymentService.instance
  }

  async createPaymentIntent(amount: number, currency: string): Promise<PaymentIntent> {
    await delay(1000) // Simulate API call
    
    const id = Math.random().toString(36).substring(7)
    return {
      id,
      amount,
      status: 'requires_payment_method',
      clientSecret: `mock_client_secret_${id}`,
    }
  }

  async processPayment(input: CreatePaymentInput): Promise<Payment> {
    await delay(1500) // Simulate payment processing

    // Simulate random success/failure (90% success rate)
    const success = Math.random() < 0.9

    if (!success) {
      throw new Error('Payment failed. Please try again.')
    }

    const payment: Payment = {
      id: Math.random().toString(36).substring(7),
      amount: input.amount,
      currency: input.currency,
      status: 'completed',
      method: input.method,
      appointmentId: input.appointmentId,
      customerId: input.customerId,
      businessId: input.businessId,
      transactionId: `mock_tx_${Math.random().toString(36).substring(7)}`,
      metadata: {},
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    this.transactions.set(payment.id, payment)
    return payment
  }

  async refundPayment(input: RefundInput): Promise<Payment> {
    await delay(1000) // Simulate refund processing

    const payment = this.transactions.get(input.paymentId)
    if (!payment) {
      throw new Error('Payment not found')
    }

    const refundedPayment: Payment = {
      ...payment,
      status: 'refunded',
      refundId: `mock_refund_${Math.random().toString(36).substring(7)}`,
      metadata: {
        ...payment.metadata,
        refundReason: input.reason,
        refundAmount: input.amount,
      },
      updatedAt: new Date(),
    }

    this.transactions.set(payment.id, refundedPayment)
    return refundedPayment
  }

  async getPayment(id: string): Promise<Payment | null> {
    await delay(500)
    return this.transactions.get(id) || null
  }

  // Helper method to simulate card validation
  validateCard(card: {
    number: string
    expiry: string
    cvc: string
    name: string
  }): boolean {
    // Basic validation
    return (
      card.number.length === 16 &&
      /^\d{2}\/\d{2}$/.test(card.expiry) &&
      card.cvc.length === 3 &&
      card.name.length > 0
    )
  }
}

export const mockPaymentService = MockPaymentService.getInstance()
