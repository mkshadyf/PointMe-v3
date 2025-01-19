import { Business } from './business';
import { Service } from './service';

export interface Appointment {
  id: string;
  businessId: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  serviceId: string;
  serviceName: string;
  staffId?: string;
  status: AppointmentStatus;
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  notes?: string;
  price: number;
  currency: string;
  isPaid: boolean;
  paymentIntentId?: string;
  paymentStatus?: 'pending' | 'paid' | 'failed';
  paymentAmount?: number;
  cancellationReason?: string;
  business?: Business;
  service?: Service;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateAppointmentInput {
  businessId: string;
  customerId?: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  serviceId: string;
  staffId?: string;
  date: string;
  startTime: Date | string;
  notes?: string;
  status?: AppointmentStatus;
}

export interface UpdateAppointmentInput {
  serviceId?: string;
  staffId?: string;
  status?: AppointmentStatus;
  date?: string;
  startTime?: string;
  notes?: string;
  isPaid?: boolean;
  paymentIntentId?: string;
  paymentStatus?: 'pending' | 'paid' | 'failed';
  paymentAmount?: number;
  cancellationReason?: string;
}

export enum AppointmentStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
  NO_SHOW = 'no_show',
  RESCHEDULED = 'rescheduled',
  PAID = 'paid',
  REJECTED = 'rejected'
}

export interface AppointmentFilters {
  businessId?: string;
  customerId?: string;
  staffId?: string;
  status?: AppointmentStatus | string;
  startDate?: Date;
  endDate?: Date;
  isPaid?: boolean;
  date?: string;
}
