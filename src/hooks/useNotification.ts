import { create } from 'zustand'

type NotificationType = 'success' | 'error' | 'info' | 'warning'

interface Notification {
  message: string
  type: NotificationType
  id: string
}

interface NotificationStore {
  notifications: Notification[]
  showNotification: (message: string, type: NotificationType) => void
  hideNotification: (id: string) => void
}

export const useNotification = create<NotificationStore>((set) => ({
  notifications: [],
  showNotification: (message: string, type: NotificationType) => {
    const id = Math.random().toString(36).substr(2, 9)
    set((state) => ({
      notifications: [
        ...state.notifications,
        {
          id,
          message,
          type,
        },
      ],
    }))

    setTimeout(() => {
      set((state) => ({
        notifications: state.notifications.filter((n) => n.id !== id),
      }))
    }, 3000)
  },
  hideNotification: (id: string) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    })),
}))
