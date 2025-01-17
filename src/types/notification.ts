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

export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  channel: NotificationChannel;
  data?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateNotificationInput {
  userId: string;
  type: string;
  title: string;
  message: string;
  channel: NotificationChannel;
  data?: Record<string, any>;
}

export interface UpdateNotificationInput {
  read?: boolean;
  data?: Record<string, any>;
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
