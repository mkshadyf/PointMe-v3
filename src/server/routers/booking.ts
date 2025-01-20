import { z } from 'zod'
import { router, publicProcedure, protectedProcedure } from '../trpc'
import { TRPCError } from '@trpc/server'
import { supabase } from '../supabase'
 
export const bookingRouter = router({
  list: publicProcedure
    .input(
      z.object({
        serviceId: z.string(),
        userId: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      const query = supabase
        .from('bookings')
        .select(`
          *,
          user:users(*),
          service:services(
            *,
            business:businesses(*)
          )
        `)
        .eq('service_id', input.serviceId)
      
      if (input.userId) {
        query.eq('user_id', input.userId)
      }

      const { data: bookings, error } = await query

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message,
        })
      }

      return bookings
    }),

  create: protectedProcedure
    .input(
      z.object({
        serviceId: z.string(),
        startTime: z.date(),
        endTime: z.date(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Check for overlapping bookings
      const { data: overlappingBookings, error: checkError } = await supabase
        .from('bookings')
        .select('*')
        .eq('service_id', input.serviceId)
        .eq('status', 'confirmed')
        .or(`and(start_time.lte.${input.startTime.toISOString()},end_time.gt.${input.startTime.toISOString()}),and(start_time.lt.${input.endTime.toISOString()},end_time.gte.${input.endTime.toISOString()})`)

      if (checkError) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: checkError.message,
        })
      }

      if (overlappingBookings.length > 0) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'This time slot is already booked',
        })
      }

      const { data: booking, error } = await supabase
        .from('bookings')
        .insert({
          service_id: input.serviceId,
          user_id: ctx.session.user.id,
          start_time: input.startTime,
          end_time: input.endTime,
          notes: input.notes,
          status: 'pending',
        })
        .select(`
          *,
          user:users(*),
          service:services(
            *,
            business:businesses(*)
          )
        `)
        .single()

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message,
        })
      }

      return booking
    }),

  update: protectedProcedure
    .input(
      z.object({
        bookingId: z.string(),
        startTime: z.date(),
        endTime: z.date(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Check if booking exists and user owns it
      const { data: existingBooking, error: fetchError } = await supabase
        .from('bookings')
        .select('*')
        .eq('id', input.bookingId)
        .single()

      if (fetchError || !existingBooking) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Booking not found',
        })
      }

      if (existingBooking.user_id !== ctx.session.user.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You can only update your own bookings',
        })
      }

      // Check for overlapping bookings
      const { data: overlappingBookings, error: checkError } = await supabase
        .from('bookings')
        .select('*')
        .eq('service_id', existingBooking.service_id)
        .eq('status', 'confirmed')
        .neq('id', input.bookingId)
        .or(`and(start_time.lte.${input.startTime.toISOString()},end_time.gt.${input.startTime.toISOString()}),and(start_time.lt.${input.endTime.toISOString()},end_time.gte.${input.endTime.toISOString()})`)

      if (checkError) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: checkError.message,
        })
      }

      if (overlappingBookings.length > 0) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'This time slot is already booked',
        })
      }

      const { data: updatedBooking, error } = await supabase
        .from('bookings')
        .update({
          start_time: input.startTime,
          end_time: input.endTime,
          notes: input.notes,
        })
        .eq('id', input.bookingId)
        .select(`
          *,
          user:users(*),
          service:services(
            *,
            business:businesses(*)
          )
        `)
        .single()

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message,
        })
      }

      return updatedBooking
    }),

  cancel: protectedProcedure
    .input(z.object({ bookingId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      // Check if booking exists and user owns it
      const { data: existingBooking, error: fetchError } = await supabase
        .from('bookings')
        .select('*')
        .eq('id', input.bookingId)
        .single()

      if (fetchError || !existingBooking) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Booking not found',
        })
      }

      if (existingBooking.user_id !== ctx.session.user.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You can only cancel your own bookings',
        })
      }

      const { data: cancelledBooking, error } = await supabase
        .from('bookings')
        .update({ status: 'cancelled' })
        .eq('id', input.bookingId)
        .select(`
          *,
          user:users(*),
          service:services(
            *,
            business:businesses(*)
          )
        `)
        .single()

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message,
        })
      }

      return cancelledBooking
    }),
})
