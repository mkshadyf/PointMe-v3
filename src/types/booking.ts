export interface Booking {
  id: string
  serviceId: string
  userId: string
  startTime: Date
  endTime: Date
  status: 'pending' | 'confirmed' | 'cancelled' | 'paid'
  paymentIntentId?: string
  createdAt: Date
  updatedAt: Date
  notes?: string
}

export interface CreateBookingInput {
  serviceId: string
  startTime: Date
}

