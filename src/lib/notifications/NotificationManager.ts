import { supabase } from '../supabase'
import { Appointment } from '../scheduling/AppointmentManager'

export enum NotificationType {
  APPOINTMENT_CREATED = 'appointment_created',
  APPOINTMENT_CONFIRMED = 'appointment_confirmed',
  APPOINTMENT_CANCELLED = 'appointment_cancelled',
  APPOINTMENT_REMINDER = 'appointment_reminder',
  APPOINTMENT_RESCHEDULED = 'appointment_rescheduled',
  PAYMENT_CONFIRMATION = 'payment_confirmation',
  PAYMENT_FAILED = 'payment_failed',
  PAYMENT_REFUNDED = 'payment_refunded',
  FEEDBACK_REQUEST = 'feedback_request',
  NO_SHOW = 'no_show',
}

export enum NotificationChannel {
  EMAIL = 'email',
  SMS = 'sms',
  PUSH = 'push',
  IN_APP = 'in_app',
}

export interface Notification {
  id: string
  type: NotificationType
  userId: string
  title: string
  message: string
  channels: NotificationChannel[]
  metadata: any
  read: boolean
  createdAt: Date
}

export interface NotificationPreferences {
  userId: string
  channels: {
    [key in NotificationType]: NotificationChannel[]
  }
}

export class NotificationManager {
  private async createNotification(
    notification: Omit<Notification, 'id' | 'createdAt'>
  ): Promise<void> {
    try {
      // Get user's notification preferences
      const { data: preferences } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('userId', notification.userId)
        .single()

      // Filter channels based on user preferences
      const enabledChannels = preferences?.channels[notification.type] || [
        NotificationChannel.IN_APP,
      ]
      const channels = notification.channels.filter((channel) =>
        enabledChannels.includes(channel)
      )

      // Create notification record
      const { error } = await supabase.from('notifications').insert([
        {
          ...notification,
          channels,
          createdAt: new Date().toISOString(),
        },
      ])

      if (error) throw error

      // Send notifications through each channel
      await Promise.all(
        channels.map((channel) =>
          this.sendNotificationThroughChannel(notification, channel)
        )
      )
    } catch (error) {
      console.error('Error creating notification:', error)
      throw error
    }
  }

  private async sendNotificationThroughChannel(
    notification: Omit<Notification, 'id' | 'createdAt'>,
    channel: NotificationChannel
  ): Promise<void> {
    try {
      switch (channel) {
        case NotificationChannel.EMAIL:
          await this.sendEmail(notification)
          break
        case NotificationChannel.SMS:
          await this.sendSMS(notification)
          break
        case NotificationChannel.PUSH:
          await this.sendPushNotification(notification)
          break
        case NotificationChannel.IN_APP:
          // In-app notifications are handled by the notification record creation
          break
      }
    } catch (error) {
      console.error(`Error sending ${channel} notification:`, error)
      // Don't throw error to prevent blocking other channels
    }
  }

  private async sendEmail(
    notification: Omit<Notification, 'id' | 'createdAt'>
  ): Promise<void> {
    // Implement email sending logic using your preferred email service
    // Example: SendGrid, AWS SES, etc.
  }

  private async sendSMS(
    notification: Omit<Notification, 'id' | 'createdAt'>
  ): Promise<void> {
    // Implement SMS sending logic using your preferred SMS service
    // Example: Twilio, AWS SNS, etc.
  }

  private async sendPushNotification(
    notification: Omit<Notification, 'id' | 'createdAt'>
  ): Promise<void> {
    // Implement push notification logic using your preferred service
    // Example: Firebase Cloud Messaging, OneSignal, etc.
  }

  async sendAppointmentCreatedNotifications(data: {
    appointment: Appointment
    businessId: string
    customerId: string
    staffId: string
  }): Promise<void> {
    const { appointment, businessId, customerId, staffId } = data

    // Notify customer
    await this.createNotification({
      type: NotificationType.APPOINTMENT_CREATED,
      userId: customerId,
      title: 'Appointment Scheduled',
      message: `Your appointment has been scheduled for ${appointment.startTime}`,
      channels: [
        NotificationChannel.EMAIL,
        NotificationChannel.SMS,
        NotificationChannel.IN_APP,
      ],
      metadata: { appointmentId: appointment.id },
      read: false,
    })

    // Notify business
    await this.createNotification({
      type: NotificationType.APPOINTMENT_CREATED,
      userId: businessId,
      title: 'New Appointment',
      message: `New appointment scheduled for ${appointment.startTime}`,
      channels: [NotificationChannel.IN_APP],
      metadata: { appointmentId: appointment.id },
      read: false,
    })

    // Notify staff
    await this.createNotification({
      type: NotificationType.APPOINTMENT_CREATED,
      userId: staffId,
      title: 'New Appointment',
      message: `You have a new appointment scheduled for ${appointment.startTime}`,
      channels: [NotificationChannel.IN_APP],
      metadata: { appointmentId: appointment.id },
      read: false,
    })
  }

  async sendAppointmentConfirmedNotifications(data: {
    appointment: Appointment
    businessId: string
    customerId: string
    staffId: string
  }): Promise<void> {
    const { appointment, businessId, customerId, staffId } = data

    // Notify customer
    await this.createNotification({
      type: NotificationType.APPOINTMENT_CONFIRMED,
      userId: customerId,
      title: 'Appointment Confirmed',
      message: `Your appointment for ${appointment.startTime} has been confirmed`,
      channels: [
        NotificationChannel.EMAIL,
        NotificationChannel.SMS,
        NotificationChannel.IN_APP,
      ],
      metadata: { appointmentId: appointment.id },
      read: false,
    })

    // Notify staff
    await this.createNotification({
      type: NotificationType.APPOINTMENT_CONFIRMED,
      userId: staffId,
      title: 'Appointment Confirmed',
      message: `Appointment for ${appointment.startTime} has been confirmed`,
      channels: [NotificationChannel.IN_APP],
      metadata: { appointmentId: appointment.id },
      read: false,
    })
  }

  async sendAppointmentCancelledNotifications(data: {
    appointment: Appointment
    businessId: string
    customerId: string
    staffId: string
  }): Promise<void> {
    const { appointment, businessId, customerId, staffId } = data

    // Notify customer
    await this.createNotification({
      type: NotificationType.APPOINTMENT_CANCELLED,
      userId: customerId,
      title: 'Appointment Cancelled',
      message: `Your appointment for ${appointment.startTime} has been cancelled`,
      channels: [
        NotificationChannel.EMAIL,
        NotificationChannel.SMS,
        NotificationChannel.IN_APP,
      ],
      metadata: { appointmentId: appointment.id },
      read: false,
    })

    // Notify business
    await this.createNotification({
      type: NotificationType.APPOINTMENT_CANCELLED,
      userId: businessId,
      title: 'Appointment Cancelled',
      message: `Appointment for ${appointment.startTime} has been cancelled`,
      channels: [NotificationChannel.IN_APP],
      metadata: { appointmentId: appointment.id },
      read: false,
    })

    // Notify staff
    await this.createNotification({
      type: NotificationType.APPOINTMENT_CANCELLED,
      userId: staffId,
      title: 'Appointment Cancelled',
      message: `Appointment for ${appointment.startTime} has been cancelled`,
      channels: [NotificationChannel.IN_APP],
      metadata: { appointmentId: appointment.id },
      read: false,
    })
  }

  async sendAppointmentReminderNotifications(data: {
    appointment: Appointment
    customerId: string
    staffId: string
  }): Promise<void> {
    const { appointment, customerId, staffId } = data

    // Notify customer
    await this.createNotification({
      type: NotificationType.APPOINTMENT_REMINDER,
      userId: customerId,
      title: 'Appointment Reminder',
      message: `Reminder: You have an appointment tomorrow at ${appointment.startTime}`,
      channels: [
        NotificationChannel.EMAIL,
        NotificationChannel.SMS,
        NotificationChannel.IN_APP,
      ],
      metadata: { appointmentId: appointment.id },
      read: false,
    })

    // Notify staff
    await this.createNotification({
      type: NotificationType.APPOINTMENT_REMINDER,
      userId: staffId,
      title: 'Appointment Reminder',
      message: `Reminder: You have an appointment tomorrow at ${appointment.startTime}`,
      channels: [NotificationChannel.IN_APP],
      metadata: { appointmentId: appointment.id },
      read: false,
    })
  }

  async sendPaymentConfirmation(data: {
    appointment: Appointment
    customerId: string
  }): Promise<void> {
    const { appointment, customerId } = data

    await this.createNotification({
      type: NotificationType.PAYMENT_CONFIRMATION,
      userId: customerId,
      title: 'Payment Confirmed',
      message: `Your payment for the appointment on ${appointment.startTime} has been confirmed`,
      channels: [
        NotificationChannel.EMAIL,
        NotificationChannel.SMS,
        NotificationChannel.IN_APP,
      ],
      metadata: { appointmentId: appointment.id },
      read: false,
    })
  }

  async sendFeedbackRequest(data: {
    appointment: Appointment
    customerId: string
  }): Promise<void> {
    const { appointment, customerId } = data

    await this.createNotification({
      type: NotificationType.FEEDBACK_REQUEST,
      userId: customerId,
      title: 'Feedback Request',
      message: `How was your appointment? We'd love to hear your feedback!`,
      channels: [NotificationChannel.EMAIL, NotificationChannel.IN_APP],
      metadata: { appointmentId: appointment.id },
      read: false,
    })
  }

  async sendNoShowNotifications(data: {
    appointment: Appointment
    businessId: string
    customerId: string
  }): Promise<void> {
    const { appointment, businessId, customerId } = data

    // Notify customer
    await this.createNotification({
      type: NotificationType.NO_SHOW,
      userId: customerId,
      title: 'Missed Appointment',
      message: `You missed your appointment scheduled for ${appointment.startTime}. A no-show fee may apply.`,
      channels: [
        NotificationChannel.EMAIL,
        NotificationChannel.SMS,
        NotificationChannel.IN_APP,
      ],
      metadata: { appointmentId: appointment.id },
      read: false,
    })

    // Notify business
    await this.createNotification({
      type: NotificationType.NO_SHOW,
      userId: businessId,
      title: 'Customer No-Show',
      message: `Customer did not show up for appointment scheduled at ${appointment.startTime}`,
      channels: [NotificationChannel.IN_APP],
      metadata: { appointmentId: appointment.id },
      read: false,
    })
  }

  async sendPaymentFailedNotification(data: {
    userId: string
    paymentId: string
  }): Promise<void> {
    await this.createNotification({
      type: NotificationType.PAYMENT_FAILED,
      userId: data.userId,
      title: 'Payment Failed',
      message: 'Your payment could not be processed. Please try again.',
      channels: [NotificationChannel.EMAIL, NotificationChannel.IN_APP],
      metadata: { paymentId: data.paymentId },
      read: false,
    })
  }

  async sendPaymentRefundedNotification(data: {
    userId: string
    paymentId: string
    amount: number
    currency: string
  }): Promise<void> {
    await this.createNotification({
      type: NotificationType.PAYMENT_REFUNDED,
      userId: data.userId,
      title: 'Payment Refunded',
      message: `Your payment of ${
        data.amount / 100
      } ${data.currency.toUpperCase()} has been refunded.`,
      channels: [NotificationChannel.EMAIL, NotificationChannel.IN_APP],
      metadata: { paymentId: data.paymentId },
      read: false,
    })
  }

  async sendAppointmentRescheduledNotifications(data: {
    appointment: Appointment
    businessId: string
    customerId: string
    staffId: string
  }): Promise<void> {
    const { appointment, businessId, customerId, staffId } = data

    // Notify customer
    await this.createNotification({
      type: NotificationType.APPOINTMENT_RESCHEDULED,
      userId: customerId,
      title: 'Appointment Rescheduled',
      message: `Your appointment has been rescheduled to ${appointment.startTime}`,
      channels: [
        NotificationChannel.EMAIL,
        NotificationChannel.SMS,
        NotificationChannel.IN_APP,
      ],
      metadata: { appointmentId: appointment.id },
      read: false,
    })

    // Notify business
    await this.createNotification({
      type: NotificationType.APPOINTMENT_RESCHEDULED,
      userId: businessId,
      title: 'Appointment Rescheduled',
      message: `Appointment has been rescheduled to ${appointment.startTime}`,
      channels: [NotificationChannel.IN_APP],
      metadata: { appointmentId: appointment.id },
      read: false,
    })

    // Notify staff
    await this.createNotification({
      type: NotificationType.APPOINTMENT_RESCHEDULED,
      userId: staffId,
      title: 'Appointment Rescheduled',
      message: `Appointment has been rescheduled to ${appointment.startTime}`,
      channels: [NotificationChannel.IN_APP],
      metadata: { appointmentId: appointment.id },
      read: false,
    })
  }

  async markNotificationAsRead(
    notificationId: string,
    userId: string
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId)
        .eq('userId', userId)

      if (error) throw error
    } catch (error) {
      console.error('Error marking notification as read:', error)
      throw error
    }
  }

  async getUnreadNotifications(userId: string): Promise<Notification[]> {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('userId', userId)
        .eq('read', false)
        .order('createdAt', { ascending: false })

      if (error) throw error

      return data
    } catch (error) {
      console.error('Error fetching unread notifications:', error)
      throw error
    }
  }

  async updateNotificationPreferences(
    userId: string,
    preferences: NotificationPreferences['channels']
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('notification_preferences')
        .upsert([
          {
            userId,
            channels: preferences,
          },
        ])

      if (error) throw error
    } catch (error) {
      console.error('Error updating notification preferences:', error)
      throw error
    }
  }
}

export const notificationManager = new NotificationManager()
