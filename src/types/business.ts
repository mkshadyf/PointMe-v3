export interface Business {
  id: string;
  name: string;
  description: string;
  ownerId: string;
  email: string;
  phone: string;
  address: string;
  website?: string;
  logoUrl?: string;
  coverImageUrl?: string;
  category: string;
  subcategories?: string[];
  rating?: number;
  reviewCount?: number;
  status: 'pending' | 'approved' | 'rejected' | 'suspended';
  workingHours: WorkingHours;
  services: Service[];
  paymentSettings: PaymentSettings;
  notificationSettings: NotificationSettings;
  socialMedia?: SocialMedia;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateBusinessInput {
  name: string;
  description: string;
  email: string;
  phone: string;
  address: string;
  website?: string;
  category: string;
  subcategories?: string[];
}

export interface UpdateBusinessInput {
  name?: string;
  description?: string;
  email?: string;
  phone?: string;
  address?: string;
  website?: string;
  logoUrl?: string;
  coverImageUrl?: string;
  category?: string;
  subcategories?: string[];
  status?: 'pending' | 'approved' | 'rejected' | 'suspended';
}

export interface WorkingHours {
  monday: DaySchedule;
  tuesday: DaySchedule;
  wednesday: DaySchedule;
  thursday: DaySchedule;
  friday: DaySchedule;
  saturday: DaySchedule;
  sunday: DaySchedule;
  holidays?: Holiday[];
  specialHours?: SpecialHours[];
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

export interface Holiday {
  date: string;
  name: string;
  isWorking: boolean;
  workingHours?: TimeSlot[];
}

export interface SpecialHours {
  date: string;
  reason: string;
  timeSlots: TimeSlot[];
}

export interface Service {
  id: string;
  name: string;
  description: string;
  duration: number;
  price: number;
  category?: string;
  image?: string;
  isActive: boolean;
  maxParticipants?: number;
  requiresConfirmation: boolean;
  cancellationPolicy?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaymentSettings {
  acceptsCash: boolean;
  acceptsCard: boolean;
  stripeConnected?: boolean;
  paypalConnected?: boolean;
  depositRequired?: boolean;
  depositAmount?: number;
  depositPercentage?: number;
  cancellationFee?: number;
  taxRate?: number;
}

export interface NotificationSettings {
  emailNotifications: boolean;
  smsNotifications: boolean;
  pushNotifications: boolean;
  appointmentReminders: boolean;
  reminderTime: number;
  marketingEmails: boolean;
  newReviewNotifications: boolean;
  lowInventoryAlerts?: boolean;
}

export interface SocialMedia {
  facebook?: string;
  twitter?: string;
  instagram?: string;
}

export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

export interface BusinessHours {
  [key: string]: {
    isWorking: boolean;
    start?: string;
    end?: string;
  };
}

export interface BusinessAnalytics {
  revenue: {
    daily: number;
    weekly: number;
    monthly: number;
    yearly: number;
  };
  appointments: {
    total: number;
    completed: number;
    cancelled: number;
    noShow: number;
  };
  customers: {
    total: number;
    new: number;
    returning: number;
  };
  services: {
    popular: Array<{
      id: string;
      name: string;
      bookings: number;
    }>;
    revenue: Array<{
      id: string;
      name: string;
      revenue: number;
    }>;
  };
  ratings: {
    average: number;
    total: number;
    distribution: {
      [key: number]: number;
    };
  };
}

export interface BusinessSettings {
  general: {
    language: string;
    timezone: string;
    currency: string;
    dateFormat: string;
    timeFormat: string;
  };
  booking: {
    allowInstantBooking: boolean;
    requireDeposit: boolean;
    depositAmount?: number;
    depositPercentage?: number;
    minimumNotice: number;
    maximumAdvance: number;
    allowCancellation: boolean;
    cancellationDeadline: number;
    cancellationFee?: number;
  };
  notifications: NotificationSettings;
  payment: PaymentSettings;
  workingHours: WorkingHours;
}
