import { z } from 'zod';
import { router, protectedProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';
import { supabase } from '../supabase';
 
export const notificationRouter = router({
  list: protectedProcedure
    .input(
      z.object({
        cursor: z.number().min(0).default(0),
        limit: z.number().min(1).max(50).default(20),
        unreadOnly: z.boolean().default(false),
      })
    )
    .query(async ({ input, ctx }) => {
      let query = supabase
        .from('notifications')
        .select(`
          *,
          user:users(*)
        `, { count: 'exact' })
        .eq('user_id', ctx.session.user.id)
        .range(input.cursor, input.cursor + input.limit - 1)
        .order('created_at', { ascending: false })

      if (input.unreadOnly) {
        query = query.eq('read', false)
      }

      const { data: notifications, error, count } = await query

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message,
        })
      }

      return {
        items: notifications,
        nextCursor: notifications.length === input.limit ? input.cursor + input.limit : null,
        total: count,
      }
    }),

  markAsRead: protectedProcedure
    .input(z.string())
    .mutation(async ({ input, ctx }) => {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', input)
        .eq('user_id', ctx.session.user.id)

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message,
        })
      }

      return { success: true }
    }),

  markAllAsRead: protectedProcedure
    .mutation(async ({ ctx }) => {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', ctx.session.user.id)
        .eq('read', false)

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message,
        })
      }

      return { success: true }
    }),

  getUnreadCount: protectedProcedure
    .query(async ({ ctx }) => {
      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', ctx.session.user.id)
        .eq('read', false)

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message,
        })
      }

      return { count }
    }),

  delete: protectedProcedure
    .input(z.string())
    .mutation(async ({ input, ctx }) => {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', input)
        .eq('user_id', ctx.session.user.id)

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message,
        })
      }

      return { success: true }
    }),
})
