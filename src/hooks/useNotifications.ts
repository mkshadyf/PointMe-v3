import { useEffect } from 'react'
import useSWR, { mutate } from 'swr'
import { trpc } from '@/utils/trpc'
import { createClient } from '@/utils/supabase/client'
import type { Notification } from '@/types/notification'

const supabase = createClient()

export function useNotifications() {
  const { data: notifications, error } = useSWR(
    'notifications',
    () => trpc.notification.getAll.query(),
    {
      refreshInterval: 30000, // Refresh every 30 seconds
    }
  )

  useEffect(() => {
    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to all changes
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${supabase.auth.user()?.id}`,
        },
        () => {
          mutate('notifications')
          mutate('unreadNotificationCount')
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const markAsRead = async (id: string) => {
    try {
      await trpc.notification.markAsRead.mutate({ id })
      mutate('notifications')
      mutate('unreadNotificationCount')
    } catch (error) {
      console.error('Failed to mark notification as read:', error)
      throw error
    }
  }

  const markAllAsRead = async () => {
    try {
      await trpc.notification.markAllAsRead.mutate()
      mutate('notifications')
      mutate('unreadNotificationCount')
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error)
      throw error
    }
  }

  const deleteNotification = async (id: string) => {
    try {
      await trpc.notification.delete.mutate({ id })
      mutate(
        'notifications',
        (currentNotifications?: Notification[]) => {
          if (!currentNotifications) return []
          return currentNotifications.filter((n) => n.id !== id)
        },
        false
      )
    } catch (error) {
      console.error('Failed to delete notification:', error)
      throw error
    }
  }

  return {
    notifications,
    error,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    isLoading: !notifications && !error,
  }
}

export function useUnreadNotificationCount() {
  const { data: count, error } = useSWR(
    'unreadNotificationCount',
    () => trpc.notification.getUnreadCount.query(),
    {
      refreshInterval: 30000, // Refresh every 30 seconds
    }
  )

  useEffect(() => {
    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${supabase.auth.user()?.id}`,
        },
        () => {
          mutate('unreadNotificationCount')
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  return {
    unreadCount: count ?? 0,
    error,
    isLoading: !count && !error,
  }
}
