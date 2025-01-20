import { z } from 'zod'
import { router, protectedProcedure } from '../trpc'
import { TRPCError } from '@trpc/server'
import { supabase } from '../supabase'
 
export const messageRouter = router({
  list: protectedProcedure
    .input(
      z.object({
        otherUserId: z.string(),
        cursor: z.number().min(0).default(0),
        limit: z.number().min(1).max(50).default(20),
      })
    )
    .query(async ({ input, ctx }) => {
      const { data: messages, error, count } = await supabase
        .from('messages')
        .select(`
          *,
          sender:users!sender_id(*),
          receiver:users!receiver_id(*)
        `, { count: 'exact' })
        .or(`and(sender_id.eq.${ctx.session.user.id},receiver_id.eq.${input.otherUserId}),and(sender_id.eq.${input.otherUserId},receiver_id.eq.${ctx.session.user.id})`)
        .range(input.cursor, input.cursor + input.limit - 1)
        .order('created_at', { ascending: false })

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message,
        })
      }

      return {
        items: messages,
        nextCursor: messages.length === input.limit ? input.cursor + input.limit : null,
        total: count,
      }
    }),

  send: protectedProcedure
    .input(
      z.object({
        receiverId: z.string(),
        content: z.string().min(1),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { data: message, error } = await supabase
        .from('messages')
        .insert({
          sender_id: ctx.session.user.id,
          receiver_id: input.receiverId,
          content: input.content,
        })
        .select(`
          *,
          sender:users!sender_id(*),
          receiver:users!receiver_id(*)
        `)
        .single()

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message,
        })
      }

      // Create notification for receiver
      await supabase
        .from('notifications')
        .insert({
          user_id: input.receiverId,
          type: 'message',
          title: 'New Message',
          content: `${ctx.session.user.email} sent you a message`,
          read: false,
        })

      return message
    }),

  markAsRead: protectedProcedure
    .input(z.string())
    .mutation(async ({ input, ctx }) => {
      const { error } = await supabase
        .from('messages')
        .update({ read: true })
        .eq('id', input)
        .eq('receiver_id', ctx.session.user.id)

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message,
        })
      }

      return { success: true }
    }),

  delete: protectedProcedure
    .input(z.string())
    .mutation(async ({ input, ctx }) => {
      const { error } = await supabase
        .from('messages')
        .delete()
        .eq('id', input)
        .eq('sender_id', ctx.session.user.id)

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message,
        })
      }

      return { success: true }
    }),
})
