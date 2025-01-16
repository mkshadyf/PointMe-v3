import { router, protectedProcedure } from '../trpc'
import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { prisma } from '../prisma'

const createNotificationSchema = z.object({
  userId: z.string(),
  message: z.string(),
  type: z.enum(['info', 'success', 'warning', 'error']),
})

export const notificationRouter = router({
  createNotification: protectedProcedure
    .input(createNotificationSchema)
    .mutation(async ({ input }) => {
      const notification = await prisma.notification.create({
        data: {
          ...input,
          read: false,
        },
      })
      return notification
    }),

  getUserNotifications: protectedProcedure
    .query(async ({ ctx }) => {
      const notifications = await prisma.notification.findMany({
        where: { userId: ctx.user.id },
        orderBy: { createdAt: 'desc' },
      })
      return notifications
    }),

  markNotificationAsRead: protectedProcedure
    .input(z.string())
    .mutation(async ({ input, ctx }) => {
      const notification = await prisma.notification.findUnique({
        where: { id: input },
      })

      if (!notification || notification.userId !== ctx.user.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have permission to update this notification',
        })
      }

      const updatedNotification = await prisma.notification.update({
        where: { id: input },
        data: { read: true },
      })

      return updatedNotification
    }),
})

