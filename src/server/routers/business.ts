import { z } from 'zod'
import { router, protectedProcedure, publicProcedure } from '../trpc'
import { TRPCError } from '@trpc/server'
import { supabase } from '../supabase'
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
});

const createBusinessSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  address: z.string().min(1),
  phone: z.string().min(1),
  email: z.string().email(),
  website: z.string().url().optional(),
  coverImage: z.string().url().optional(),
  categories: z.array(z.string()),
});

const updateBusinessSchema = z.object({
  id: z.string(),
  name: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  address: z.string().min(1).optional(),
  phone: z.string().min(1).optional(),
  email: z.string().email().optional(),
  website: z.string().url().optional(),
  coverImage: z.string().url().optional(),
  categories: z.array(z.string()).optional(),
});

const createServiceSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
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

const businessRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    const { data: businesses, error } = await supabase
      .from('businesses')
      .select('*')
      .eq('owner_id', ctx.user?.id)

    if (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: error.message,
      })
    }

    return businesses
  }),

  create: protectedProcedure
    .input(createBusinessSchema)
    .mutation(async ({ input, ctx }) => {
      const { data: business, error } = await supabase
        .from('businesses')
        .insert([
          {
            ...input,
            owner_id: ctx.user?.id,
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

      return business
    }),

  update: protectedProcedure
    .input(updateBusinessSchema)
    .mutation(async ({ input, ctx }) => {
      const { data: business, error } = await supabase
        .from('businesses')
        .update(input)
        .eq('id', input.id)
        .eq('owner_id', ctx.user?.id)
        .select()
        .single()

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message,
        })
      }

      return business
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const { error } = await supabase
        .from('businesses')
        .delete()
        .eq('id', input.id)
        .eq('owner_id', ctx.user?.id)

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message,
        })
      }

      return { success: true }
    }),

  get: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const { data: business, error } = await supabase
        .from('businesses')
        .select('*')
        .eq('id', input.id)
        .single()

      if (error) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Business not found',
        })
      }

      return business
    }),

  getBusinessStats: protectedProcedure
    .input(z.object({ businessId: z.string() }))
    .query(async ({ input, ctx }) => {
      const { data: stats, error } = await supabase.rpc('get_business_stats', {
        p_business_id: input.businessId,
      })

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message,
        })
      }

      return stats
    }),

  createBusiness: protectedProcedure
    .input(createBusinessSchema)
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Must be logged in to create a business',
        });
      }

      // Create Stripe account for the business
      const stripeAccount = await stripe.accounts.create({
        type: 'standard',
        email: input.email,
        business_type: 'company',
        company: {
          name: input.name,
        },
      });

      const { data: business, error } = await supabase
        .from('businesses')
        .insert({
          ...input,
          ownerId: ctx.user.id,
          stripeAccountId: stripeAccount.id,
        })
        .select(`
          *,
          owner:users(*)
        `)
        .single();

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message,
        });
      }

      return business;
    }),

  updateBusiness: protectedProcedure
    .input(updateBusinessSchema)
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Must be logged in to update a business',
        });
      }

      const { data: existingBusiness, error: fetchError } = await supabase
        .from('businesses')
        .select('*')
        .eq('id', input.id)
        .single();

      if (fetchError || !existingBusiness) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Business not found',
        });
      }

      if (existingBusiness.ownerId !== ctx.user.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You can only update your own business',
        });
      }

      const { data: updatedBusiness, error } = await supabase
        .from('businesses')
        .update(input)
        .eq('id', input.id)
        .select(`
          *,
          owner:users(*)
        `)
        .single();

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message,
        });
      }

      return updatedBusiness;
    }),

  deleteBusiness: protectedProcedure
    .input(z.string())
    .mutation(async ({ input: businessId, ctx }) => {
      if (!ctx.user) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Must be logged in to delete a business',
        });
      }

      const { data: existingBusiness, error: fetchError } = await supabase
        .from('businesses')
        .select('*')
        .eq('id', businessId)
        .single();

      if (fetchError || !existingBusiness) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Business not found',
        });
      }

      if (existingBusiness.ownerId !== ctx.user.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You can only delete your own business',
        });
      }

      const { error } = await supabase
        .from('businesses')
        .delete()
        .eq('id', businessId);

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message,
        });
      }

      return { success: true };
    }),

  businessStatistics: publicProcedure
    .input(z.string())
    .query(async ({ input: businessId, ctx }) => {
      const { data: business, error } = await supabase
        .from('businesses')
        .select(`
          *,
          services:services(
            *,
            bookings:bookings(*)
          ),
          reviews:reviews(*)
        `)
        .eq('id', businessId)
        .single();

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message,
        });
      }

      if (!business) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Business not found',
        });
      }

      // Calculate revenue
      const totalRevenue = business.services?.reduce((sum: number, service: any) => {
        const serviceRevenue = service.bookings?.reduce((sum: number, booking: any) => 
          booking.status === 'completed' ? sum + service.price : sum, 0) || 0
        return sum + serviceRevenue
      }, 0) || 0

      // Calculate service stats
      const totalServices = business.services?.length || 0
      const totalBookings = business.services?.reduce((sum: number, service: any) => 
        sum + (service.bookings?.length || 0), 0) || 0

      // Calculate review stats
      const totalReviews = business.reviews?.length || 0
      const averageRating = totalReviews > 0
        ? business.reviews?.reduce((sum: number, review: any) => sum + review.rating, 0) / totalReviews
        : 0

      return {
        totalRevenue,
        totalServices,
        totalBookings,
        totalReviews,
        averageRating,
      };
    }),

  createService: protectedProcedure
    .input(createServiceSchema)
    .mutation(async ({ input, ctx }) => {
      const { data: business, error: businessError } = await supabase
        .from('businesses')
        .select('*')
        .eq('id', input.businessId)
        .single();

      if (businessError || !business) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Business not found',
        });
      }

      if (business.ownerId !== ctx.user.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have permission to create a service for this business',
        });
      }

      const { data: service, error } = await supabase
        .from('services')
        .insert(input)
        .select('*')
        .single();

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message,
        });
      }

      return service;
    }),

  updateService: protectedProcedure
    .input(z.object({
      id: z.string(),
      data: updateServiceSchema,
    }))
    .mutation(async ({ input, ctx }) => {
      const { data: service, error: serviceError } = await supabase
        .from('services')
        .select('*')
        .eq('id', input.id)
        .single();

      if (serviceError || !service) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Service not found',
        });
      }

      if (service.businessId !== ctx.user.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have permission to update this service',
        });
      }

      const { data: updatedService, error } = await supabase
        .from('services')
        .update(input.data)
        .eq('id', input.id)
        .select('*')
        .single();

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message,
        });
      }

      return updatedService;
    }),

  getBusinessServices: protectedProcedure
    .input(z.string())
    .query(async ({ input, ctx }) => {
      const { data: business, error: businessError } = await supabase
        .from('businesses')
        .select('*')
        .eq('id', input)
        .single();

      if (businessError || !business) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Business not found',
        });
      }

      if (business.ownerId !== ctx.user.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have permission to view services for this business',
        });
      }

      const { data: services, error } = await supabase
        .from('services')
        .select('*')
        .eq('businessId', input);

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message,
        });
      }

      return services;
    }),

  createBooking: protectedProcedure
    .input(createBookingSchema)
    .mutation(async ({ input, ctx }) => {
      const { data: service, error: serviceError } = await supabase
        .from('services')
        .select('*')
        .eq('id', input.serviceId)
        .single();

      if (serviceError || !service) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Service not found',
        });
      }

      const endTime = new Date(input.startTime.getTime() + service.duration * 60000);

      const { data: booking, error } = await supabase
        .from('bookings')
        .insert({
          serviceId: input.serviceId,
          userId: ctx.user.id,
          startTime: input.startTime,
          endTime,
          status: 'pending',
        })
        .select('*')
        .single();

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message,
        });
      }

      return booking;
    }),

  getUserBookings: protectedProcedure
    .query(async ({ ctx }) => {
      const { data: bookings, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('userId', ctx.user.id);

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message,
        });
      }

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
      const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .select('*')
        .eq('id', input.bookingId)
        .single();

      if (bookingError || !booking) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Booking not found',
        });
      }

      if (booking.userId !== ctx.user.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have permission to confirm this booking',
        });
      }

      const paymentIntent = await stripe.paymentIntents.retrieve(input.paymentIntentId);

      if (paymentIntent.status !== 'succeeded') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Payment has not been successfully processed',
        });
      }

      const { data: updatedBooking, error } = await supabase
        .from('bookings')
        .update({
          status: 'paid',
          paymentIntentId: input.paymentIntentId,
        })
        .eq('id', input.bookingId)
        .select('*')
        .single();

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message,
        });
      }

      return updatedBooking;
    }),

  createReview: protectedProcedure
    .input(createReviewSchema)
    .mutation(async ({ input, ctx }) => {
      const { data: service, error: serviceError } = await supabase
        .from('services')
        .select('*')
        .eq('id', input.serviceId)
        .single();

      if (serviceError || !service) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Service not found',
        });
      }

      const { data: review, error } = await supabase
        .from('reviews')
        .insert({
          ...input,
          userId: ctx.user.id,
        })
        .select('*')
        .single();

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message,
        });
      }

      // Create a notification for the business owner
      await supabase
        .from('notifications')
        .insert({
          userId: service.businessId,
          message: `New review for your service "${service.name}"`,
          type: 'info',
        });

      return review;
    }),

  getServiceReviews: protectedProcedure
    .input(z.string())
    .query(async ({ input }) => {
      const { data: reviews, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('serviceId', input)
        .order('createdAt', { ascending: false });

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message,
        });
      }

      return reviews;
    }),

  getAnalytics: protectedProcedure
    .input(z.string())
    .query(async ({ input: businessId, ctx }) => {
      const { data: business, error: businessError } = await supabase
        .from('businesses')
        .select(`
          *,
          services:services(
            *,
            bookings:bookings(*)
          ),
          reviews:reviews(*)
        `)
        .eq('id', businessId)
        .single();

      if (businessError || !business) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Business not found',
        });
      }

      if (business.ownerId !== ctx.user.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have permission to view analytics for this business',
        });
      }

      // Calculate revenue
      const totalRevenue = business.services?.reduce((sum: number, service: any) => {
        const serviceRevenue = service.bookings?.reduce((sum: number, booking: any) => 
          booking.status === 'completed' ? sum + service.price : sum, 0) || 0
        return sum + serviceRevenue
      }, 0) || 0

      // Calculate service stats
      const totalServices = business.services?.length || 0
      const totalBookings = business.services?.reduce((sum: number, service: any) => 
        sum + (service.bookings?.length || 0), 0) || 0

      // Calculate review stats
      const totalReviews = business.reviews?.length || 0
      const averageRating = totalReviews > 0
        ? business.reviews?.reduce((sum: number, review: any) => sum + review.rating, 0) / totalReviews
        : 0

      return {
        totalRevenue,
        totalServices,
        totalBookings,
        totalReviews,
        averageRating,
      };
    }),

  createBusinessReview: protectedProcedure
    .input(createBusinessReviewSchema)
    .mutation(async ({ input, ctx }) => {
      const { data: business, error: businessError } = await supabase
        .from('businesses')
        .select('*')
        .eq('id', input.businessId)
        .single();

      if (businessError || !business) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Business not found',
        });
      }

      const { data: review, error } = await supabase
        .from('businessReviews')
        .insert({
          ...input,
          userId: ctx.user.id,
        })
        .select('*')
        .single();

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message,
        });
      }

      // Create a notification for the business owner
      await supabase
        .from('notifications')
        .insert({
          userId: business.ownerId,
          message: `New review for your business "${business.name}"`,
          type: 'info',
        });

      return review;
    }),

  getBusinessReviews: publicProcedure
    .input(z.string())
    .query(async ({ input: businessId }) => {
      const { data: reviews, error } = await supabase
        .from('businessReviews')
        .select('*')
        .eq('businessId', businessId)
        .order('createdAt', { ascending: false });

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message,
        });
      }

      return reviews;
    }),

  getPublicBusinessDetails: publicProcedure
    .input(z.string())
    .query(async ({ input: businessId }) => {
      const { data: business, error } = await supabase
        .from('businesses')
        .select(`
          *,
          services:services(*),
          reviews:businessReviews(*)
        `)
        .eq('id', businessId)
        .single();

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message,
        });
      }

      if (!business) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Business not found',
        });
      }

      // Calculate business stats
      const totalServices = business.services?.length || 0
      const totalRevenue = business.services?.reduce((sum: number, service: any) => 
        sum + (service.price || 0), 0) || 0
      const averageServicePrice = totalServices > 0 ? totalRevenue / totalServices : 0

      const totalReviews = business.reviews?.length || 0
      const averageRating = totalReviews > 0
        ? business.reviews?.reduce((sum: number, review: any) => sum + review.rating, 0) / totalReviews
        : 0

      return {
        ...business,
        stats: {
          totalServices,
          totalRevenue,
          averageServicePrice,
          totalReviews,
          averageRating,
        },
      };
    }),
});

export default businessRouter;
