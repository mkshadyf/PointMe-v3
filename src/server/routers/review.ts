import { z } from 'zod'
import { router, protectedProcedure, publicProcedure } from '../trpc'
import { TRPCError } from '@trpc/server'
import { supabase } from '../supabase'

export const reviewRouter = router({
  list: publicProcedure
    .input(z.object({ businessId: z.string() }))
    .query(async ({ input }) => {
      const { data: reviews, error } = await supabase
        .from('reviews')
        .select(`
          *,
          user:users(name, avatar)
        `)
        .eq('business_id', input.businessId)
        .order('created_at', { ascending: false })

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message,
        })
      }

      return reviews
    }),

  create: protectedProcedure
    .input(
      z.object({
        businessId: z.string(),
        rating: z.number().min(1).max(5),
        content: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { data: review, error } = await supabase
        .from('reviews')
        .insert([
          {
            business_id: input.businessId,
            user_id: ctx.user?.id,
            rating: input.rating,
            content: input.content,
          },
        ])
        .select()
        .single()

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message,
        })
      }

      return review
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        rating: z.number().min(1).max(5).optional(),
        content: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { data: review, error } = await supabase
        .from('reviews')
        .update({
          rating: input.rating,
          content: input.content,
        })
        .eq('id', input.id)
        .eq('user_id', ctx.user?.id)
        .select()
        .single()

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message,
        })
      }

      return review
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', input.id)
        .eq('user_id', ctx.user?.id)

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message,
        })
      }

      return { success: true }
    }),
})
