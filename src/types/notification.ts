export type NotificationChannel = 'email' | 'sms' | 'push' | 'in_app';

export interface NotificationSettings {
  emailNotifications: boolean;
  smsNotifications: boolean;
  pushNotifications: boolean;
  appointmentReminders: boolean;
  reminderTime: number; // in minutes
  marketingEmails: boolean;
  newReviewNotifications: boolean;
  lowInventoryAlerts?: boolean;
  notifyOnNewBooking: boolean;
  notifyOnCancellation: boolean;
  notifyOnReschedule: boolean;
  notifyOnReview: boolean;
  emailRecipients: string[];
  phoneRecipients: string[];
}

export type NotificationType = 
  | 'APPOINTMENT_CREATED'
  | 'APPOINTMENT_CANCELLED'
  | 'APPOINTMENT_UPDATED'
  | 'MESSAGE_RECEIVED'
  | 'REVIEW_RECEIVED'
  | 'PAYMENT_RECEIVED'
  | 'SYSTEM_NOTIFICATION'

export interface NotificationData {
  appointmentId?: string
  date?: string
  senderName?: string
  rating?: number
  amount?: number
  message?: string
  [key: string]: any
}

export interface Notification {
  id: string
  userId: string
  type: NotificationType
  title: string
  message: string
  data: NotificationData
  readAt?: string
  createdAt: string
  updatedAt: string
}

export interface CreateNotificationInput {
  userId: string
  type: NotificationType
  title: string
  message: string
  data: NotificationData
}

export interface UpdateNotificationInput {
  id: string
  readAt?: string
}

export interface NotificationPreferences {
  channels: {
    email: boolean;
    sms: boolean;
    push: boolean;
    in_app: boolean;
  };
  types: {
    appointments: boolean;
    reviews: boolean;
    marketing: boolean;
    system: boolean;
  };
  schedule: {
    start: string; // 24h format HH:mm
    end: string; // 24h format HH:mm
    timezone: string;
    quietHours: boolean;
  };
}
