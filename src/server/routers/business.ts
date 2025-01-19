import { router, protectedProcedure, publicProcedure } from '../trpc';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';
import type { Tables } from '@/lib/supabase';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-02-15',
});

const createBusinessSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().min(1).max(500),
});

const updateBusinessSchema = createBusinessSchema.partial();

const createServiceSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().min(1).max(500),
  price: z.number().positive(),
  duration: z.number().int().positive(),
  businessId: z.string(),
});

const updateServiceSchema = createServiceSchema.partial().omit({ businessId: true });

const createBookingSchema = z.object({
  serviceId: z.string(),
  startTime: z.date(),
});

const createReviewSchema = z.object({
  serviceId: z.string(),
  rating: z.number().min(1).max(5),
  comment: z.string().min(1).max(500),
});

const createBusinessReviewSchema = z.object({
  businessId: z.string(),
  rating: z.number().min(1).max(5),
  comment: z.string().min(1).max(500),
});

export const businessRouter = router({
  createService: protectedProcedure
    .input(createServiceSchema)
    .mutation(async ({ input, ctx }) => {
      // Verify business ownership
      const { data: business } = await supabase
        .from('businesses')
        .select()
        .eq('id', input.businessId)
        .eq('user_id', ctx.user.id)
        .single();

      if (!business) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not own this business',
        });
      }

      const { data: service, error } = await supabase
        .from('services')
        .insert({
          name: input.name,
          description: input.description,
          price: input.price,
          duration: input.duration,
          business_id: input.businessId,
        })
        .select()
        .single();

      if (error) throw new TRPCError({ code: 'BAD_REQUEST', message: error.message });
      return service;
    }),

  updateService: protectedProcedure
    .input(z.object({
      id: z.string(),
      ...updateServiceSchema.shape,
    }))
    .mutation(async ({ input, ctx }) => {
      const { data: service, error } = await supabase
        .from('services')
        .update({
          name: input.name,
          description: input.description,
          price: input.price,
          duration: input.duration,
        })
        .eq('id', input.id)
        .select('*, business!inner(*)')
        .single();

      if (error) throw new TRPCError({ code: 'BAD_REQUEST', message: error.message });

      // Verify business ownership
      if (service.business.user_id !== ctx.user.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not own this business',
        });
      }

      return service;
    }),

  getBusinessServices: protectedProcedure
    .input(z.string())
    .query(async ({ input, ctx }) => {
      const { data: services, error } = await supabase
        .from('services')
        .select()
        .eq('business_id', input);

      if (error) throw new TRPCError({ code: 'BAD_REQUEST', message: error.message });

      // Verify business ownership
      if (services.length > 0 && services[0].business.user_id !== ctx.user.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not own this business',
        });
      }

      return services;
    }),

  createBooking: protectedProcedure
    .input(createBookingSchema)
    .mutation(async ({ input, ctx }) => {
      const { data: service } = await supabase
        .from('services')
        .select('*, business(*)')
        .eq('id', input.serviceId)
        .single();

      if (!service) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Service not found',
        });
      }

      // Calculate end time based on service duration
      const endTime = new Date(input.startTime);
      endTime.setMinutes(endTime.getMinutes() + service.duration);

      const { data: booking, error } = await supabase
        .from('bookings')
        .insert({
          user_id: ctx.user.id,
          service_id: input.serviceId,
          start_time: input.startTime.toISOString(),
          end_time: endTime.toISOString(),
        })
        .select()
        .single();

      if (error) throw new TRPCError({ code: 'BAD_REQUEST', message: error.message });

      // Create notification for business owner
      await supabase.from('notifications').insert({
        user_id: service.business.user_id,
        title: 'New Booking',
        message: `New booking for ${service.name}`,
        type: 'info',
      });

      return booking;
    }),

  getUserBookings: protectedProcedure
    .query(async ({ ctx }) => {
      const { data: bookings, error } = await supabase
        .from('bookings')
        .select('*, service!inner(*, business!inner(*))')
        .eq('user_id', ctx.user.id);

      if (error) throw new TRPCError({ code: 'BAD_REQUEST', message: error.message });

      return bookings;
    }),

  createPaymentIntent: protectedProcedure
    .input(z.object({
      amount: z.number().positive(),
      currency: z.string().min(3).max(3),
    }))
    .mutation(async ({ input, ctx }) => {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: input.amount,
        currency: input.currency,
      });

      return {
        id: paymentIntent.id,
        clientSecret: paymentIntent.client_secret,
        amount: paymentIntent.amount,
        status: paymentIntent.status,
      };
    }),

  confirmBookingPayment: protectedProcedure
    .input(z.object({
      bookingId: z.string(),
      paymentIntentId: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      const { data: booking, error } = await supabase
        .from('bookings')
        .select('*, service!inner(*, business!inner(*))')
        .eq('id', input.bookingId)
        .single();

      if (error) throw new TRPCError({ code: 'BAD_REQUEST', message: error.message });

      if (!booking) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Booking not found',
        });
      }

      if (booking.user_id !== ctx.user.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not own this booking',
        });
      }

      const paymentIntent = await stripe.paymentIntents.retrieve(input.paymentIntentId);

      if (paymentIntent.status !== 'succeeded') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Payment has not been successfully processed',
        });
      }

      const { data: updatedBooking, error: updateError } = await supabase
        .from('bookings')
        .update({
          status: 'paid',
          payment_intent_id: input.paymentIntentId,
        })
        .eq('id', input.bookingId)
        .select()
        .single();

      if (updateError) throw new TRPCError({ code: 'BAD_REQUEST', message: updateError.message });

      return updatedBooking;
    }),

  createReview: protectedProcedure
    .input(createReviewSchema)
    .mutation(async ({ input, ctx }) => {
      const { data: service } = await supabase
        .from('services')
        .select()
        .eq('id', input.serviceId)
        .single();

      if (!service) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Service not found',
        });
      }

      const { data: review, error } = await supabase
        .from('reviews')
        .insert({
          user_id: ctx.user.id,
          service_id: input.serviceId,
          rating: input.rating,
          comment: input.comment,
        })
        .select('*, service!inner(*, business!inner(*))')
        .single();

      if (error) throw new TRPCError({ code: 'BAD_REQUEST', message: error.message });

      // Create notification for business owner
      await supabase.from('notifications').insert({
        user_id: review.service.business.user_id,
        title: 'New Review',
        message: `New review for ${review.service.name}`,
        type: 'info',
      });

      return review;
    }),

  getServiceReviews: protectedProcedure
    .input(z.string())
    .query(async ({ input }) => {
      const { data: reviews, error } = await supabase
        .from('reviews')
        .select('*, user!inner(*)')
        .eq('service_id', input)
        .order('created_at', { ascending: false });

      if (error) throw new TRPCError({ code: 'BAD_REQUEST', message: error.message });

      return reviews;
    }),

  getAnalytics: protectedProcedure
    .input(z.string())
    .query(async ({ input: businessId, ctx }) => {
      const { data: business, error } = await supabase
        .from('businesses')
        .select()
        .eq('id', businessId)
        .single();

      if (error) throw new TRPCError({ code: 'BAD_REQUEST', message: error.message });

      if (!business || business.user_id !== ctx.user.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not own this business',
        });
      }

      const { data: bookings, error: bookingsError } = await supabase
        .from('bookings')
        .select('*, service!inner(*)')
        .eq('service.business_id', businessId)
        .eq('status', 'paid');

      if (bookingsError) throw new TRPCError({ code: 'BAD_REQUEST', message: bookingsError.message });

      const totalBookings = bookings.length;
      const totalRevenue = bookings.reduce((sum, booking) => sum + booking.service.price, 0);

      const { data: services, error: servicesError } = await supabase
        .from('services')
        .select('*, bookings(*)')
        .eq('business_id', businessId);

      if (servicesError) throw new TRPCError({ code: 'BAD_REQUEST', message: servicesError.message });

      const servicePerformanceData = services.map((service) => ({
        name: service.name,
        bookings: service.bookings.length,
        revenue: service.bookings.reduce((sum, booking) => sum + booking.service.price, 0),
      }));

      return {
        totalBookings,
        totalRevenue,
        servicePerformance: servicePerformanceData,
      };
    }),

  createBusinessReview: protectedProcedure
    .input(createBusinessReviewSchema)
    .mutation(async ({ input, ctx }) => {
      const { data: business } = await supabase
        .from('businesses')
        .select()
        .eq('id', input.businessId)
        .single();

      if (!business) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Business not found',
        });
      }

      const { data: review, error } = await supabase
        .from('business_reviews')
        .insert({
          user_id: ctx.user.id,
          business_id: input.businessId,
          rating: input.rating,
          comment: input.comment,
        })
        .select('*, business(*)')
        .single();

      if (error) throw new TRPCError({ code: 'BAD_REQUEST', message: error.message });

      // Create notification for business owner
      await supabase.from('notifications').insert({
        user_id: review.business.user_id,
        title: 'New Business Review',
        message: `New review for your business`,
        type: 'info',
      });

      return review;
    }),

  getBusinessReviews: publicProcedure
    .input(z.string())
    .query(async ({ input: businessId }) => {
      const { data: reviews, error } = await supabase
        .from('business_reviews')
        .select('*, user!inner(*)')
        .eq('business_id', businessId)
        .order('created_at', { ascending: false });

      if (error) throw new TRPCError({ code: 'BAD_REQUEST', message: error.message });

      return reviews;
    }),

  getPublicBusinessDetails: publicProcedure
    .input(z.string())
    .query(async ({ input: businessId }) => {
      const { data: business, error } = await supabase
        .from('businesses')
        .select('*, services(*)')
        .eq('id', businessId)
        .single();

      if (error) throw new TRPCError({ code: 'BAD_REQUEST', message: error.message });

      if (!business) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Business not found',
        });
      }

      const averageRating =
        business.reviews.length > 0
          ? business.reviews.reduce((sum, review) => sum + review.rating, 0) / business.reviews.length
          : null;

      return {
        ...business,
        averageRating,
      };
    }),
});
