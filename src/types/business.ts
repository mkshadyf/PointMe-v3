export enum DayOfWeek {
  MONDAY = 'monday',
  TUESDAY = 'tuesday',
  WEDNESDAY = 'wednesday',
  THURSDAY = 'thursday',
  FRIDAY = 'friday',
  SATURDAY = 'saturday',
  SUNDAY = 'sunday'
}

export interface Business {
  id: string;
  name: string;
  description?: string;
  email: string;
  phone?: string;
  address?: string;
  category: string;
  subcategories?: string[];
  ownerId: string;
  status: 'pending' | 'approved' | 'rejected';
  isActive: boolean;
  imageUrl?: string;
  logoUrl?: string;
  coverUrl?: string;
  location?: {
    latitude: number;
    longitude: number;
    address: string;
  };
  website?: string;
  socialMedia?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    linkedin?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface WorkingHours {
  monday: DaySchedule;
  tuesday: DaySchedule;
  wednesday: DaySchedule;
  thursday: DaySchedule;
  friday: DaySchedule;
  saturday: DaySchedule;
  sunday: DaySchedule;
}

export interface DaySchedule {
  isOpen: boolean;
  timeSlots: TimeSlot[];
  breaks?: Break[];
}

export interface TimeSlot {
  start: string;
  end: string;
}

export interface Break {
  start: string;
  end: string;
  description?: string;
}

export interface BusinessSettings {
  notifications: NotificationSettings;
  payments: PaymentSettings;
  scheduling: SchedulingSettings;
}

export interface NotificationSettings {
  email: {
    enabled: boolean;
    recipients: string[];
    templates: {
      booking: string;
      confirmation: string;
      reminder: string;
      cancellation: string;
    };
  };
  sms: {
    enabled: boolean;
    recipients: string[];
    templates: {
      booking: string;
      confirmation: string;
      reminder: string;
      cancellation: string;
    };
  };
  emailNotifications: boolean;
  smsNotifications: boolean;
  pushNotifications: boolean;
  reminderTime: number;
  notifyOnNewBooking: boolean;
  notifyOnCancellation: boolean;
  notifyOnReschedule: boolean;
  notifyOnReview: boolean;
  emailRecipients: string[];
  phoneRecipients: string[];
  reminderHours: number;
  sendInstantConfirmation: boolean;
}

export interface PaymentSettings {
  currency: string;
  depositRequired: boolean;
  depositPercentage: number;
  stripeConnected: boolean;
  stripeAccountId?: string;
  acceptedPaymentMethods: string[];
  refundPolicy?: string;
  taxRate?: number;
  acceptOnlinePayments: boolean;
  cancellationPolicy: 'none' | 'flexible' | 'moderate' | 'strict';
  cancellationFee?: number;
  paymentMethods: string[];
}

export interface SchedulingSettings {
  allowInstantBooking: boolean;
  minNoticeHours: number;
  maxFutureMonths: number;
  bufferMinutes: number;
  defaultDuration: number;
  allowStaffSelection: boolean;
  allowMultipleBookings: boolean;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number;
  category: string;
  maxParticipants?: number;
  businessId: string;
  isActive: boolean;
  isEnabled: boolean;
  requiresDeposit: boolean;
  depositAmount?: number;
  requiresConfirmation?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBusinessInput {
  name: string;
  description?: string;
  email: string;
  phone?: string;
  address?: string;
  category: string;
  subcategories?: string[];
  ownerId: string;
}

export interface UpdateBusinessInput {
  name?: string;
  description?: string;
  email?: string;
  phone?: string;
  address?: string;
  category?: string;
  subcategories?: string[];
  isActive?: boolean;
  imageUrl?: string;
  location?: {
    latitude: number;
    longitude: number;
    address: string;
  };
  website?: string;
  socialMedia?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    linkedin?: string;
  };
}
