export interface Notification {
  id: string
  userId: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  read: boolean
  createdAt: Date
}

export interface CreateNotificationInput {
  userId: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
}

