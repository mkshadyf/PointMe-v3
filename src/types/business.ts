export interface Business {
  id: string
  name: string
  description: string
  ownerId: string
  createdAt: Date
  updatedAt: Date
}

export interface CreateBusinessInput {
  name: string
  description: string
}

export interface UpdateBusinessInput {
  name?: string
  description?: string
}

