import { DayOfWeek } from './business';

export interface Staff {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  businessId: string;
  services: string[];
  isActive: boolean;
  avatar_url?: string;
  workingHours: {
    [key in DayOfWeek]: {
      isWorking: boolean;
      start: string;
      end: string;
    };
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateStaffInput {
  name: string;
  email: string;
  phone?: string;
  role: string;
  businessId: string;
  services: string[];
  workingHours: {
    [key in DayOfWeek]: {
      isWorking: boolean;
      start: string;
      end: string;
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
    [key in DayOfWeek]: {
      isWorking: boolean;
      start: string;
      end: string;
    };
  };
}
