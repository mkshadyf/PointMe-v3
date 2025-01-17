import { supabase } from '../supabase'
import {
  addMinutes,
  format,
  parse,
  isWithinInterval,
  areIntervalsOverlapping,
  parseISO,
} from 'date-fns'
import { NotificationManager } from '../notifications/NotificationManager'
import { PaymentManager } from '../payments/PaymentManager'
import { AvailabilityManager } from './AvailabilityManager'

export interface Appointment {
  id: string
  businessId: string
  customerId: string
  serviceId: string
  staffId: string
  startTime: Date
  endTime: Date
  status: AppointmentStatus
  price: number
  notes?: string
  paymentStatus: PaymentStatus
  paymentId?: string
}

export enum AppointmentStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
  NO_SHOW = 'no_show',
}

export enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  REFUNDED = 'refunded',
  FAILED = 'failed',
}

export class AppointmentManager {
  private notificationManager: NotificationManager
  private paymentManager: PaymentManager
  private availabilityManager: AvailabilityManager

  constructor() {
    this.notificationManager = new NotificationManager()
    this.paymentManager = new PaymentManager()
    this.availabilityManager = new AvailabilityManager()
  }

  async createAppointment(
    data: Omit<Appointment, 'id' | 'status' | 'paymentStatus'>
  ): Promise<Appointment> {
    try {
      // Check if the time slot is available
      const isAvailable = await this.availabilityManager.checkAvailability(
        data.businessId,
        data.staffId,
        data.startTime,
        data.endTime
      )

      if (!isAvailable) {
        throw new Error('Selected time slot is not available')
      }

      // Create payment intent
      const paymentIntent = await this.paymentManager.createPaymentIntent({
        amount: data.price,
        currency: 'usd',
        customerId: data.customerId,
        businessId: data.businessId,
        description: `Appointment for service ${data.serviceId}`,
      })

      // Create appointment record
      const { data: appointment, error } = await supabase
        .from('appointments')
        .insert([
          {
            ...data,
            status: AppointmentStatus.PENDING,
            paymentStatus: PaymentStatus.PENDING,
            paymentId: paymentIntent.id,
          },
        ])
        .select()
        .single()

      if (error) throw error

      // Send notifications
      await this.notificationManager.sendAppointmentCreatedNotifications({
        appointment,
        businessId: data.businessId,
        customerId: data.customerId,
        staffId: data.staffId,
      })

      return appointment
    } catch (error) {
      console.error('Error creating appointment:', error)
      throw error
    }
  }

  async updateAppointmentStatus(
    appointmentId: string,
    status: AppointmentStatus,
    notes?: string
  ): Promise<Appointment> {
    try {
      const { data: appointment, error } = await supabase
        .from('appointments')
        .update({
          status,
          notes,
          updatedAt: new Date().toISOString(),
        })
        .eq('id', appointmentId)
        .select()
        .single()

      if (error) throw error

      // Handle status-specific actions
      switch (status) {
        case AppointmentStatus.CONFIRMED:
          await this.handleAppointmentConfirmation(appointment)
          break
        case AppointmentStatus.CANCELLED:
          await this.handleAppointmentCancellation(appointment)
          break
        case AppointmentStatus.COMPLETED:
          await this.handleAppointmentCompletion(appointment)
          break
        case AppointmentStatus.NO_SHOW:
          await this.handleAppointmentNoShow(appointment)
          break
      }

      return appointment
    } catch (error) {
      console.error('Error updating appointment status:', error)
      throw error
    }
  }

  private async handleAppointmentConfirmation(
    appointment: Appointment
  ): Promise<void> {
    // Send confirmation notifications
    await this.notificationManager.sendAppointmentConfirmedNotifications({
      appointment,
      businessId: appointment.businessId,
      customerId: appointment.customerId,
      staffId: appointment.staffId,
    })

    // Update availability
    await this.availabilityManager.blockTimeSlot(
      appointment.businessId,
      appointment.staffId,
      appointment.startTime,
      appointment.endTime
    )
  }

  private async handleAppointmentCancellation(
    appointment: Appointment
  ): Promise<void> {
    // Process refund if applicable
    if (appointment.paymentStatus === PaymentStatus.PAID) {
      await this.refundPayment(appointment.id)
    }

    // Send cancellation notifications
    await this.notificationManager.sendAppointmentCancelledNotifications({
      appointment,
      businessId: appointment.businessId,
      customerId: appointment.customerId,
      staffId: appointment.staffId,
    })

    // Free up the time slot
    await this.availabilityManager.freeTimeSlot(
      appointment.businessId,
      appointment.staffId,
      appointment.startTime,
      appointment.endTime
    )
  }

  private async handleAppointmentCompletion(
    appointment: Appointment
  ): Promise<void> {
    // Send feedback request
    await this.notificationManager.sendFeedbackRequest({
      appointment,
      customerId: appointment.customerId,
    })

    // Update business metrics
    await this.updateBusinessMetrics(appointment)
  }

  private async handleAppointmentNoShow(
    appointment: Appointment
  ): Promise<void> {
    // Apply no-show fee if applicable
    await this.paymentManager.applyNoShowFee(appointment)

    // Send notifications
    await this.notificationManager.sendNoShowNotifications({
      appointment,
      businessId: appointment.businessId,
      customerId: appointment.customerId,
    })

    // Update customer record
    await this.updateCustomerNoShowRecord(appointment)
  }

  async getAppointments(
    filters: {
      businessId?: string
      customerId?: string
      staffId?: string
      startDate?: Date
      endDate?: Date
      status?: AppointmentStatus[]
    }
  ): Promise<Appointment[]> {
    try {
      let query = supabase
        .from('appointments')
        .select('*')

      if (filters.businessId) {
        query = query.eq('businessId', filters.businessId)
      }
      if (filters.customerId) {
        query = query.eq('customerId', filters.customerId)
      }
      if (filters.staffId) {
        query = query.eq('staffId', filters.staffId)
      }
      if (filters.startDate) {
        query = query.gte('startTime', filters.startDate.toISOString())
      }
      if (filters.endDate) {
        query = query.lte('endTime', filters.endDate.toISOString())
      }
      if (filters.status && filters.status.length > 0) {
        query = query.in('status', filters.status)
      }

      const { data, error } = await query

      if (error) throw error

      return data
    } catch (error) {
      console.error('Error fetching appointments:', error)
      throw error
    }
  }

  async updatePaymentStatus(
    appointmentId: string,
    paymentStatus: PaymentStatus
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('appointments')
        .update({
          paymentStatus,
          updatedAt: new Date().toISOString(),
        })
        .eq('id', appointmentId)

      if (error) throw error

      // If payment is successful, send confirmation
      if (paymentStatus === PaymentStatus.PAID) {
        const { data: appointment } = await supabase
          .from('appointments')
          .select('*')
          .eq('id', appointmentId)
          .single()

        await this.notificationManager.sendPaymentConfirmation({
          appointment,
          customerId: appointment.customerId,
        })
      }
    } catch (error) {
      console.error('Error updating payment status:', error)
      throw error
    }
  }

  async refundPayment(appointmentId: string): Promise<void> {
    try {
      const { data: appointment } = await supabase
        .from('appointments')
        .select('*')
        .eq('id', appointmentId)
        .single()

      if (!appointment) {
        throw new Error('Appointment not found')
      }

      await this.paymentManager.processRefund({
        paymentIntentId: appointment.paymentId,
        reason: 'requested_by_customer'
      })
    } catch (error) {
      console.error('Error refunding payment:', error)
      throw error
    }
  }

  private async updateBusinessMetrics(appointment: Appointment): Promise<void> {
    try {
      const { error } = await supabase.rpc('update_business_metrics', {
        business_id: appointment.businessId,
        appointment_id: appointment.id,
      })

      if (error) throw error
    } catch (error) {
      console.error('Error updating business metrics:', error)
      throw error
    }
  }

  private async updateCustomerNoShowRecord(
    appointment: Appointment
  ): Promise<void> {
    try {
      const { error } = await supabase.rpc('update_customer_no_shows', {
        customer_id: appointment.customerId,
        appointment_id: appointment.id,
      })

      if (error) throw error
    } catch (error) {
      console.error('Error updating customer no-show record:', error)
      throw error
    }
  }

  async rescheduleAppointment(
    appointmentId: string,
    newStartTime: Date,
    newEndTime: Date
  ): Promise<Appointment> {
    try {
      const { data: appointment } = await supabase
        .from('appointments')
        .select('*')
        .eq('id', appointmentId)
        .single()

      // Check if new time slot is available
      const isAvailable = await this.availabilityManager.checkAvailability(
        appointment.businessId,
        appointment.staffId,
        newStartTime,
        newEndTime
      )

      if (!isAvailable) {
        throw new Error('Selected time slot is not available')
      }

      // Free up the old time slot
      await this.availabilityManager.freeTimeSlot(
        appointment.businessId,
        appointment.staffId,
        appointment.startTime,
        appointment.endTime
      )

      // Update appointment
      const { data: updatedAppointment, error } = await supabase
        .from('appointments')
        .update({
          startTime: newStartTime.toISOString(),
          endTime: newEndTime.toISOString(),
          updatedAt: new Date().toISOString(),
        })
        .eq('id', appointmentId)
        .select()
        .single()

      if (error) throw error

      // Block the new time slot
      await this.availabilityManager.blockTimeSlot(
        appointment.businessId,
        appointment.staffId,
        newStartTime,
        newEndTime
      )

      // Send rescheduling notifications
      await this.notificationManager.sendAppointmentRescheduledNotifications({
        appointment: updatedAppointment,
        businessId: appointment.businessId,
        customerId: appointment.customerId,
        staffId: appointment.staffId,
      })

      return updatedAppointment
    } catch (error) {
      console.error('Error rescheduling appointment:', error)
      throw error
    }
  }
}

export const appointmentManager = new AppointmentManager()
