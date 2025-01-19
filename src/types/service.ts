export interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number; // in minutes
  businessId: string;
  category?: string;
  isActive: boolean;
  isEnabled: boolean;
  maxParticipants?: number;
  requiresConfirmation?: boolean;
  requiresDeposit?: boolean;
  depositAmount?: number;
  image?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateServiceInput {
  name: string;
  description: string;
  price: number;
  duration: number;
  businessId: string;
  category?: string;
  isActive?: boolean;
  isEnabled?: boolean;
  maxParticipants?: number;
  requiresConfirmation?: boolean;
  requiresDeposit?: boolean;
  depositAmount?: number;
  image?: string;
}

export interface UpdateServiceInput {
  name?: string;
  description?: string;
  price?: number;
  duration?: number;
  category?: string;
  isActive?: boolean;
  isEnabled?: boolean;
  maxParticipants?: number;
  requiresConfirmation?: boolean;
  requiresDeposit?: boolean;
  depositAmount?: number;
  image?: string;
}

export interface ServiceCategory {
  id: string;
  name: string;
  description?: string;
  parentId?: string;
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateServiceCategoryInput {
  name: string;
  description?: string;
  parentId?: string;
  order: number;
  isActive: boolean;
}

export interface UpdateServiceCategoryInput {
  name?: string;
  description?: string;
  parentId?: string;
  order?: number;
  isActive?: boolean;
}
