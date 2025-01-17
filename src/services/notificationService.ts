import { supabase } from '../lib/supabase'
import { useEffect } from 'react'
import { useNotification } from '../contexts/NotificationContext'

export interface Notification {
  id: string
  userId: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  isRead: boolean
  createdAt: string
  metadata?: Record<string, any>
}

class NotificationService {
  async getNotifications(userId: string): Promise<Notification[]> {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('userId', userId)
      .order('createdAt', { ascending: false })

    if (error) {
      throw error
    }

    return data
  }

  async markAsRead(notificationId: string): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .update({ isRead: true })
      .eq('id', notificationId)

    if (error) {
      throw error
    }
  }

  async markAllAsRead(userId: string): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .update({ isRead: true })
      .eq('userId', userId)

    if (error) {
      throw error
    }
  }

  async deleteNotification(notificationId: string): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId)

    if (error) {
      throw error
    }
  }

  async createNotification(
    userId: string,
    title: string,
    message: string,
    type: 'info' | 'success' | 'warning' | 'error' = 'info',
    metadata?: Record<string, any>
  ): Promise<void> {
    const { error } = await supabase.from('notifications').insert([
      {
        userId,
        title,
        message,
        type,
        isRead: false,
        metadata,
      },
    ])

    if (error) {
      throw error
    }
  }

  subscribeToNotifications(userId: string, callback: (notification: Notification) => void) {
    return supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `userId=eq.${userId}`,
        },
        (payload) => {
          callback(payload.new as Notification)
        }
      )
      .subscribe()
  }
}

const notificationService = new NotificationService()
export default notificationService

export const useNotificationSubscription = (userId: string | null) => {
  const { showNotification } = useNotification()

  useEffect(() => {
    if (!userId) return

    const subscription = notificationService.subscribeToNotifications(
      userId,
      (notification) => {
        showNotification(notification.message, notification.type)
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [userId, showNotification])
}
