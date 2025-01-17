import { Business } from './business';

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
  duration: number;
  notes?: string;
  paymentStatus: PaymentStatus;
  paymentAmount: number;
  paymentMethod?: string;
  cancellationReason?: string;
  business?: Business;
  service?: Service;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateAppointmentInput {
  businessId: string;
  customerId: string;
  serviceId: string;
  staffId?: string;
  date: string;
  startTime: string;
  notes?: string;
}

export interface UpdateAppointmentInput {
  serviceId?: string;
  staffId?: string;
  status?: AppointmentStatus;
  date?: string;
  startTime?: string;
  notes?: string;
  paymentStatus?: PaymentStatus;
  cancellationReason?: string;
}

export type AppointmentStatus =
  | 'pending'
  | 'confirmed'
  | 'in-progress'
  | 'completed'
  | 'cancelled'
  | 'no-show';

export type PaymentStatus =
  | 'pending'
  | 'paid'
  | 'partially_paid'
  | 'refunded'
  | 'failed';

export interface AppointmentFilters {
  businessId?: string;
  customerId?: string;
  staffId?: string;
  status?: AppointmentStatus;
  startDate?: string;
  endDate?: string;
  paymentStatus?: PaymentStatus;
}

export interface Service {
  id: string;
  name: string;
  duration: number;
  price: number;
}
