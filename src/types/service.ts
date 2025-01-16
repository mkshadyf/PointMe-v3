export interface Service {
  id: string
  name: string
  description: string
  price: number
  duration: number // in minutes
  businessId: string
  createdAt: Date
  updatedAt: Date
}

export interface CreateServiceInput {
  name: string
  description: string
  price: number
  duration: number
  businessId: string
}

export interface UpdateServiceInput {
  name?: string
  description?: string
  price?: number
  duration?: number
}

