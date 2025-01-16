import { router, protectedProcedure, publicProcedure } from '../trpc';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { prisma } from '../prisma';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2022-11-15',
});

const createBusinessSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().min(1).max(500),
});

const updateBusinessSchema = createBusinessSchema.partial()

const createServiceSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().min(1).max(500),
  price: z.number().positive(),
  duration: z.number().int().positive(),
  businessId: z.string(),
});

const updateServiceSchema = createServiceSchema.partial().omit({ businessId: true })

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
      const business = await prisma.business.findUnique({
        where: { id: input.businessId },
      })

      if (!business || business.ownerId !== ctx.user.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have permission to create a service for this business',
        })
      }

      const service = await prisma.service.create({
        data: input,
      })

      return service
    }),

  updateService: protectedProcedure
    .input(z.object({
      id: z.string(),
      data: updateServiceSchema,
    }))
    .mutation(async ({ input, ctx }) => {
      const service = await prisma.service.findUnique({
        where: { id: input.id },
        include: { business: true },
      })

      if (!service || service.business.ownerId !== ctx.user.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have permission to update this service',
        })
      }

      const updatedService = await prisma.service.update({
        where: { id: input.id },
        data: input.data,
      })

      return updatedService
    }),

  getBusinessServices: protectedProcedure
    .input(z.string())
    .query(async ({ input, ctx }) => {
      const business = await prisma.business.findUnique({
        where: { id: input },
      })

      if (!business || business.ownerId !== ctx.user.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have permission to view services for this business',
        })
      }

      const services = await prisma.service.findMany({
        where: { businessId: input },
      })

      return services
    }),

  createBooking: protectedProcedure
    .input(createBookingSchema)
    .mutation(async ({ input, ctx }) => {
      const service = await prisma.service.findUnique({
        where: { id: input.serviceId },
        include: { business: true },
      })

      if (!service) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Service not found',
        })
      }

      const endTime = new Date(input.startTime.getTime() + service.duration * 60000)

      const booking = await prisma.booking.create({
        data: {
          serviceId: input.serviceId,
          userId: ctx.user.id,
          startTime: input.startTime,
          endTime,
          status: 'pending',
        },
      })

      return booking
    }),

  getUserBookings: protectedProcedure
    .query(async ({ ctx }) => {
      const bookings = await prisma.booking.findMany({
        where: { userId: ctx.user.id },
        include: { service: true },
      })

      return bookings
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
      })

      return {
        id: paymentIntent.id,
        clientSecret: paymentIntent.client_secret,
        amount: paymentIntent.amount,
        status: paymentIntent.status,
      }
    }),

  confirmBookingPayment: protectedProcedure
    .input(z.object({
      bookingId: z.string(),
      paymentIntentId: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      const booking = await prisma.booking.findUnique({
        where: { id: input.bookingId },
        include: { service: true },
      })

      if (!booking) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Booking not found',
        })
      }

      if (booking.userId !== ctx.user.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have permission to confirm this booking',
        })
      }

      const paymentIntent = await stripe.paymentIntents.retrieve(input.paymentIntentId)

      if (paymentIntent.status !== 'succeeded') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Payment has not been successfully processed',
        })
      }

      const updatedBooking = await prisma.booking.update({
        where: { id: input.bookingId },
        data: {
          status: 'paid',
          paymentIntentId: input.paymentIntentId,
        },
      })

      return updatedBooking
    }),
  createReview: protectedProcedure
    .input(createReviewSchema)
    .mutation(async ({ input, ctx }) => {
      const service = await prisma.service.findUnique({
        where: { id: input.serviceId },
      })

      if (!service) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Service not found',
        })
      }

      const review = await prisma.review.create({
        data: {
          ...input,
          userId: ctx.user.id,
        },
      })

      // Create a notification for the business owner
      await prisma.notification.create({
        data: {
          userId: service.businessId,
          message: `New review for your service "${service.name}"`,
          type: 'info',
        },
      })

      return review
    }),

  getServiceReviews: protectedProcedure
    .input(z.string())
    .query(async ({ input }) => {
      const reviews = await prisma.review.findMany({
        where: { serviceId: input },
        include: { user: { select: { name: true } } },
        orderBy: { createdAt: 'desc' },
      })
      return reviews
    }),
  getAnalytics: protectedProcedure
    .input(z.string())
    .query(async ({ input: businessId, ctx }) => {
      const business = await prisma.business.findUnique({
        where: { id: businessId },
      })

      if (!business || business.ownerId !== ctx.user.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have permission to view analytics for this business',
        })
      }

      const bookings = await prisma.booking.findMany({
        where: {
          service: {
            businessId: businessId,
          },
          status: 'paid',
        },
        include: {
          service: true,
        },
      })

      const totalBookings = bookings.length
      const totalRevenue = bookings.reduce((sum, booking) => sum + booking.service.price, 0)

      const servicePerformance = await prisma.service.findMany({
        where: { businessId: businessId },
        select: {
          id: true,
          name: true,
          bookings: {
            where: { status: 'paid' },
          },
        },
      })

      const servicePerformanceData = servicePerformance.map((service) => ({
        name: service.name,
        bookings: service.bookings.length,
        revenue: service.bookings.reduce((sum, booking) => sum + booking.service.price, 0),
      }))

      return {
        totalBookings,
        totalRevenue,
        servicePerformance: servicePerformanceData,
      }
    }),
  createBusinessReview: protectedProcedure
    .input(createBusinessReviewSchema)
    .mutation(async ({ input, ctx }) => {
      const business = await prisma.business.findUnique({
        where: { id: input.businessId },
      });

      if (!business) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Business not found',
        });
      }

      const review = await prisma.businessReview.create({
        data: {
          ...input,
          userId: ctx.user.id,
        },
      });

      // Create a notification for the business owner
      await prisma.notification.create({
        data: {
          userId: business.ownerId,
          message: `New review for your business "${business.name}"`,
          type: 'info',
        },
      });

      return review;
    }),

  getBusinessReviews: publicProcedure
    .input(z.string())
    .query(async ({ input: businessId }) => {
      const reviews = await prisma.businessReview.findMany({
        where: { businessId },
        include: { user: { select: { name: true } } },
        orderBy: { createdAt: 'desc' },
      });
      return reviews;
    }),

  getPublicBusinessDetails: publicProcedure
    .input(z.string())
    .query(async ({ input: businessId }) => {
      const business = await prisma.business.findUnique({
        where: { id: businessId },
        include: {
          services: true,
          reviews: {
            include: { user: { select: { name: true } } },
            orderBy: { createdAt: 'desc' },
          },
        },
      });

      if (!business) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Business not found',
        });
      }

      const averageRating = business.reviews.length > 0
        ? business.reviews.reduce((sum, review) => sum + review.rating, 0) / business.reviews.length
        : null;

      return {
        ...business,
        averageRating,
      };
    }),
});

