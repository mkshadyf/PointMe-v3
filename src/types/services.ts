import { Appointment, AppointmentFilters } from './appointment'
import { Business, CreateBusinessInput, UpdateBusinessInput } from './business'
import { StaffMember, CreateStaffInput, UpdateStaffInput } from './staff'

export interface Service {
  id: string;
  name: string;
  description?: string;
  price: number;
  duration: number;
  categoryId: string;
  businessId: string;
  maxParticipants?: number;
  image?: string;
  createdAt: Date;
  updatedAt: Date;
  isEnabled: boolean;
  requiresDeposit: boolean;
  depositAmount?: number;
  category: {
    id: string
    name: string
    description?: string
  }
  staffMembers: Array<{
    id: string
    name: string
    email: string
  }>
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  businessId: string;
  parentId?: string;
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Staff {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  businessId: string;
  services: string[];
  isActive: boolean;
  workingHours: {
    [key: string]: {
      start: string;
      end: string;
      isWorking: boolean;
    };
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateServiceInput {
  name: string;
  description?: string;
  price: number;
  duration: number;
  categoryId: string;
  maxParticipants?: number;
  image?: string;
  isEnabled?: boolean;
  requiresDeposit?: boolean;
  depositAmount?: number;
  staffIds?: string[]
}

export interface UpdateServiceInput {
  name?: string;
  description?: string;
  price?: number;
  duration?: number;
  categoryId?: string;
  maxParticipants?: number;
  image?: string;
  isEnabled?: boolean;
  requiresDeposit?: boolean;
  depositAmount?: number;
  staffIds?: string[]
}

export interface CreateCategoryInput {
  name: string;
  description?: string;
  parentId?: string;
  order?: number;
}

export interface UpdateCategoryInput {
  name?: string;
  description?: string;
  parentId?: string;
  order?: number;
  isActive?: boolean;
}

export interface CreateStaffInput {
  name: string;
  email: string;
  phone?: string;
  role: string;
  services: string[];
  workingHours: {
    [key: string]: {
      start: string;
      end: string;
      isWorking: boolean;
    };
  };
}

export interface UpdateStaffInput {
  name?: string;
  email?: string;
  phone?: string;
  role?: string;
  services?: string[];
  isActive?: boolean;
  workingHours?: {
    [key: string]: {
      start: string;
      end: string;
      isWorking: boolean;
    };
  };
}

export interface ServiceFilters {
  businessId?: string
  categoryId?: string
  isActive?: boolean
  search?: string
}

export interface AdminService {
  getBusinesses(): Promise<Business[]>
  getBusinessById(id: string): Promise<Business>
  getBusinessByOwnerId(ownerId: string): Promise<Business>
  createBusiness(input: CreateBusinessInput): Promise<Business>
  updateBusiness(id: string, input: UpdateBusinessInput): Promise<Business>
  deleteBusiness(id: string): Promise<void>
  approveBusiness(id: string): Promise<void>
  rejectBusiness(id: string): Promise<void>
  getCategories(): Promise<Category[]>
  updateBusinessProfile(id: string, input: UpdateBusinessInput): Promise<Business>
  updateBusinessImage(id: string, imageUrl: string): Promise<Business>
  uploadBusinessImage(file: File): Promise<string>
}

export interface AppointmentService {
  getAppointments(filters?: AppointmentFilters): Promise<Appointment[]>
  getAppointmentById(id: string): Promise<Appointment>
  createAppointment(input: any): Promise<Appointment>
  updateAppointment(id: string, input: any): Promise<Appointment>
  deleteAppointment(id: string): Promise<void>
  calculateEndTime(startTime: string, durationMinutes: number): string
  getCustomerAppointments(customerId: string): Promise<Appointment[]>
  updateAppointmentStatus(id: string, status: string): Promise<Appointment>
}

export interface ServiceService {
  getServices(businessId: string, filters?: ServiceFilters): Promise<Service[]>
  getServiceById(id: string): Promise<Service>
  createService(businessId: string, input: CreateServiceInput): Promise<Service>
  updateService(id: string, input: UpdateServiceInput): Promise<Service>
  deleteService(id: string): Promise<void>
  uploadServiceImage(file: File): Promise<string>
  getBusinessServices(businessId: string): Promise<Service[]>
  getServiceCategories(): Promise<Category[]>
}

export interface StaffService {
  getStaffMembers(businessId: string): Promise<StaffMember[]>
  getStaffMemberById(id: string): Promise<StaffMember>
  createStaffMember(businessId: string, input: CreateStaffInput): Promise<StaffMember>
  updateStaffMember(id: string, input: UpdateStaffInput): Promise<StaffMember>
  deleteStaffMember(id: string): Promise<void>
  getBusinessStaff(businessId: string): Promise<StaffMember[]>
  isWithinBreak(breaks: any[], time: string): boolean
}
