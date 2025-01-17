export interface BusinessCategory {
  id: string;
  name: string;
  description: string;
  icon?: string;
  businessCount?: number;
  subcategories?: BusinessCategory[];
  parentId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ServiceCategory {
  id: string
  name: string
  description: string
  businessCategoryId: string
  createdAt: Date
  updatedAt: Date
}

export interface CreateBusinessCategoryInput {
  name: string
  description: string
  icon?: string
  parentId?: string
}

export interface UpdateBusinessCategoryInput {
  name?: string
  description?: string
  icon?: string
  parentId?: string
}

export interface CreateServiceCategoryInput {
  name: string
  description: string
  businessCategoryId: string
}

export interface UpdateServiceCategoryInput {
  name?: string
  description?: string
  businessCategoryId?: string
}
