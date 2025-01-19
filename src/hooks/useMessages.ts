import { useEffect } from 'react'
import useSWR, { mutate } from 'swr'
import { trpc } from '@/utils/trpc'
import { createClient } from '@/utils/supabase/client'
import type { Message } from '@/types/message'

const supabase = createClient()

export function useMessages(otherId: string) {
  const { data: messages, error } = useSWR(
    ['messages', otherId],
    () => trpc.message.getConversation.query({ otherId })
  )

  useEffect(() => {
    const channel = supabase
      .channel('messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `sender_id=eq.${otherId},receiver_id=eq.${supabase.auth.user()?.id}`,
        },
        (payload) => {
          const newMessage = payload.new as Message
          mutate(
            ['messages', otherId],
            (currentMessages?: Message[]) => {
              if (!currentMessages) return [newMessage]
              return [...currentMessages, newMessage]
            },
            false
          )

          // Mark as unread
          trpc.message.markAsRead.mutate({ messageId: newMessage.id })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [otherId])

  const sendMessage = async (content: string) => {
    try {
      const newMessage = await trpc.message.sendMessage.mutate({
        receiverId: otherId,
        content,
      })

      mutate(
        ['messages', otherId],
        (currentMessages?: Message[]) => {
          if (!currentMessages) return [newMessage]
          return [...currentMessages, newMessage]
        },
        false
      )

      return newMessage
    } catch (error) {
      console.error('Failed to send message:', error)
      throw error
    }
  }

  const markAsRead = async (messageId: string) => {
    try {
      await trpc.message.markAsRead.mutate({ messageId })
      mutate(['messages', otherId])
    } catch (error) {
      console.error('Failed to mark message as read:', error)
      throw error
    }
  }

  return {
    messages,
    error,
    sendMessage,
    markAsRead,
    isLoading: !messages && !error,
  }
}

export function useUnreadMessageCount() {
  const { data: count, error } = useSWR(
    'unreadMessageCount',
    () => trpc.message.getUnreadCount.query(),
    {
      refreshInterval: 30000, // Refresh every 30 seconds
    }
  )

  useEffect(() => {
    const channel = supabase
      .channel('messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `receiver_id=eq.${supabase.auth.user()?.id}`,
        },
        () => {
          mutate('unreadMessageCount')
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
