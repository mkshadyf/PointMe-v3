import { supabase } from '../supabase'
import { Stripe } from 'stripe'
import { Appointment } from '../scheduling/AppointmentManager'
import { NotificationManager } from '../notifications/NotificationManager'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
})

export enum PaymentStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}

export interface PaymentIntent {
  id: string
  amount: number
  currency: string
  status: PaymentStatus
  customerId: string
  businessId: string
  description: string
  metadata: any
  createdAt: Date
}

export interface RefundRequest {
  paymentIntentId: string
  amount?: number
  reason?: string
}

export class PaymentManager {
  private notificationManager: NotificationManager

  constructor() {
    this.notificationManager = new NotificationManager()
  }

  async createPaymentIntent(data: {
    amount: number
    currency: string
    customerId: string
    businessId: string
    description: string
    metadata?: any
  }): Promise<PaymentIntent> {
    try {
      // Get or create Stripe customer
      const { data: customer } = await supabase
        .from('customers')
        .select('stripeCustomerId')
        .eq('id', data.customerId)
        .single()

      let stripeCustomerId = customer?.stripeCustomerId

      if (!stripeCustomerId) {
        // Get customer details from your database
        const { data: customerData } = await supabase
          .from('users')
          .select('email, name')
          .eq('id', data.customerId)
          .single()

        if (!customerData) {
          throw new Error('Customer data not found')
        }

        // Create Stripe customer
        const stripeCustomer = await stripe.customers.create({
          email: customerData.email,
          name: customerData.name,
          metadata: {
            userId: data.customerId,
          },
        })

        stripeCustomerId = stripeCustomer.id

        // Save Stripe customer ID
        await supabase
          .from('customers')
          .upsert([
            {
              id: data.customerId,
              stripeCustomerId,
            },
          ])
      }

      // Get business Stripe account
      const { data: business } = await supabase
        .from('businesses')
        .select('stripeAccountId')
        .eq('id', data.businessId)
        .single()

      if (!business?.stripeAccountId) {
        throw new Error('Business Stripe account not found')
      }

      // Create Stripe PaymentIntent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: data.amount,
        currency: data.currency,
        customer: stripeCustomerId,
        description: data.description,
        metadata: {
          ...data.metadata,
          businessId: data.businessId,
          customerId: data.customerId,
        },
        application_fee_amount: this.calculateApplicationFee(data.amount),
        transfer_data: {
          destination: business.stripeAccountId,
        },
      })

      // Create payment record in your database
      const { data: payment, error } = await supabase
        .from('payments')
        .insert([
          {
            stripePaymentIntentId: paymentIntent.id,
            amount: data.amount,
            currency: data.currency,
            status: PaymentStatus.PENDING,
            customerId: data.customerId,
            businessId: data.businessId,
            description: data.description,
            metadata: data.metadata,
          },
        ])
        .select()
        .single()

      if (error) throw error

      return payment
    } catch (error) {
      console.error('Error creating payment intent:', error)
      throw error
    }
  }

  private calculateApplicationFee(amount: number): number {
    // Implement your fee calculation logic
    // Example: 10% platform fee
    return Math.round(amount * 0.1)
  }

  async handleStripeWebhook(
    event: Stripe.Event
  ): Promise<void> {
    try {
      switch (event.type) {
        case 'payment_intent.succeeded':
          await this.handlePaymentSuccess(event.data.object as Stripe.PaymentIntent)
          break
        case 'payment_intent.payment_failed':
          await this.handlePaymentFailure(event.data.object as Stripe.PaymentIntent)
          break
        case 'charge.refunded':
          await this.handleRefund(event.data.object as Stripe.Charge)
          break
      }
    } catch (error) {
      console.error('Error handling Stripe webhook:', error)
      throw error
    }
  }

  private async handlePaymentSuccess(
    paymentIntent: Stripe.PaymentIntent
  ): Promise<void> {
    try {
      // Update payment status in your database
      const { error } = await supabase
        .from('payments')
        .update({
          status: PaymentStatus.COMPLETED,
          updatedAt: new Date().toISOString(),
        })
        .eq('stripePaymentIntentId', paymentIntent.id)

      if (error) throw error

      // Get payment details
      const { data: payment } = await supabase
        .from('payments')
        .select('*')
        .eq('stripePaymentIntentId', paymentIntent.id)
        .single()

      // Update appointment payment status if applicable
      if (payment.metadata?.appointmentId) {
        await supabase
          .from('appointments')
          .update({
            paymentStatus: 'paid',
            updatedAt: new Date().toISOString(),
          })
          .eq('id', payment.metadata.appointmentId)
      }

      // Send payment confirmation notification
      await this.notificationManager.sendPaymentConfirmation({
        appointment: payment.metadata?.appointmentId,
        customerId: payment.customerId,
      })
    } catch (error) {
      console.error('Error handling payment success:', error)
      throw error
    }
  }

  private async handlePaymentFailure(
    paymentIntent: Stripe.PaymentIntent
  ): Promise<void> {
    try {
      // Update payment status in your database
      const { error } = await supabase
        .from('payments')
        .update({
          status: PaymentStatus.FAILED,
          updatedAt: new Date().toISOString(),
        })
        .eq('stripePaymentIntentId', paymentIntent.id)

      if (error) throw error

      // Get payment details
      const { data: payment } = await supabase
        .from('payments')
        .select('*')
        .eq('stripePaymentIntentId', paymentIntent.id)
        .single()

      // Update appointment payment status if applicable
      if (payment.metadata?.appointmentId) {
        await supabase
          .from('appointments')
          .update({
            paymentStatus: 'failed',
            updatedAt: new Date().toISOString(),
          })
          .eq('id', payment.metadata.appointmentId)
      }

      // Send payment failure notification
      await this.notificationManager.sendPaymentFailedNotification({
        userId: payment.customerId,
        paymentId: payment.id,
      })
    } catch (error) {
      console.error('Error handling payment failure:', error)
      throw error
    }
  }

  private async handleRefund(charge: Stripe.Charge): Promise<void> {
    try {
      // Update payment status in your database
      const { error } = await supabase
        .from('payments')
        .update({
          status: PaymentStatus.REFUNDED,
          updatedAt: new Date().toISOString(),
        })
        .eq('stripePaymentIntentId', charge.payment_intent)

      if (error) throw error

      // Get payment details
      const { data: payment } = await supabase
        .from('payments')
        .select('*')
        .eq('stripePaymentIntentId', charge.payment_intent)
        .single()

      // Update appointment payment status if applicable
      if (payment.metadata?.appointmentId) {
        await supabase
          .from('appointments')
          .update({
            paymentStatus: 'refunded',
            updatedAt: new Date().toISOString(),
          })
          .eq('id', payment.metadata.appointmentId)
      }

      // Send refund notification
      await this.notificationManager.sendPaymentRefundedNotification({
        userId: payment.customerId,
        paymentId: payment.id,
        amount: charge.amount,
        currency: charge.currency,
      })
    } catch (error) {
      console.error('Error handling refund:', error)
      throw error
    }
  }

  async processRefund(request: RefundRequest): Promise<void> {
    try {
      // Get payment details
      const { data: payment } = await supabase
        .from('payments')
        .select('*')
        .eq('stripePaymentIntentId', request.paymentIntentId)
        .single()

      if (!payment) {
        throw new Error('Payment not found')
      }

      // Create refund in Stripe
      await stripe.refunds.create({
        payment_intent: request.paymentIntentId,
        amount: request.amount,
        reason: request.reason as Stripe.RefundCreateParams.Reason,
      })

      // Update will be handled by webhook
    } catch (error) {
      console.error('Error processing refund:', error)
      throw error
    }
  }

  async applyNoShowFee(appointment: Appointment): Promise<void> {
    try {
      // Get business no-show fee policy
      const { data: business } = await supabase
        .from('businesses')
        .select('noShowFeeAmount, noShowFeePercentage')
        .eq('id', appointment.businessId)
        .single()

      if (!business) {
        throw new Error('Business not found')
      }

      let feeAmount = 0
      if (business.noShowFeeAmount) {
        feeAmount = business.noShowFeeAmount
      } else if (business.noShowFeePercentage) {
        feeAmount = Math.round(
          appointment.price * (business.noShowFeePercentage / 100)
        )
      }

      if (feeAmount > 0) {
        // Create payment intent for no-show fee
        await this.createPaymentIntent({
          amount: feeAmount,
          currency: 'usd',
          customerId: appointment.customerId,
          businessId: appointment.businessId,
          description: `No-show fee for appointment ${appointment.id}`,
          metadata: {
            appointmentId: appointment.id,
            type: 'no_show_fee',
          },
        })
      }
    } catch (error) {
      console.error('Error applying no-show fee:', error)
      throw error
    }
  }

  async getPaymentMethods(customerId: string): Promise<any[]> {
    try {
      // Get Stripe customer ID
      const { data: customer } = await supabase
        .from('customers')
        .select('stripeCustomerId')
        .eq('id', customerId)
        .single()

      if (!customer?.stripeCustomerId) {
        return []
      }

      // Get payment methods from Stripe
      const paymentMethods = await stripe.paymentMethods.list({
        customer: customer.stripeCustomerId,
        type: 'card',
      })

      return paymentMethods.data
    } catch (error) {
      console.error('Error getting payment methods:', error)
      throw error
    }
  }

  async addPaymentMethod(
    customerId: string,
    paymentMethodId: string
  ): Promise<void> {
    try {
      // Get Stripe customer ID
      const { data: customer } = await supabase
        .from('customers')
        .select('stripeCustomerId')
        .eq('id', customerId)
        .single()

      if (!customer?.stripeCustomerId) {
        throw new Error('Customer not found')
      }

      // Attach payment method to customer
      await stripe.paymentMethods.attach(paymentMethodId, {
        customer: customer.stripeCustomerId,
      })
    } catch (error) {
      console.error('Error adding payment method:', error)
      throw error
    }
  }

  async removePaymentMethod(
    customerId: string,
    paymentMethodId: string
  ): Promise<void> {
    try {
      // Get Stripe customer ID
      const { data: customer } = await supabase
        .from('customers')
        .select('stripeCustomerId')
        .eq('id', customerId)
        .single()

      if (!customer?.stripeCustomerId) {
        throw new Error('Customer not found')
      }

      // Detach payment method from customer
      await stripe.paymentMethods.detach(paymentMethodId)
    } catch (error) {
      console.error('Error removing payment method:', error)
      throw error
    }
  }
}

export const paymentManager = new PaymentManager()
