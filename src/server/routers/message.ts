import { router, protectedProcedure } from '../trpc';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { prisma } from '../prisma';

const createMessageSchema = z.object({
  receiverId: z.string(),
  content: z.string().min(1).max(1000),
});

export const messageRouter = router({
  sendMessage: protectedProcedure
    .input(createMessageSchema)
    .mutation(async ({ input, ctx }) => {
      const message = await prisma.message.create({
        data: {
          senderId: ctx.user.id,
          receiverId: input.receiverId,
          content: input.content,
          read: false,
        },
      });

      // Create a notification for the receiver
      await prisma.notification.create({
        data: {
          userId: input.receiverId,
          message: `You have a new message from ${ctx.user.name}`,
          type: 'info',
        },
      });

      return message;
    }),

  getConversations: protectedProcedure
    .query(async ({ ctx }) => {
      const conversations = await prisma.message.findMany({
        where: {
          OR: [
            { senderId: ctx.user.id },
            { receiverId: ctx.user.id },
          ],
        },
        orderBy: { createdAt: 'desc' },
        distinct: ['senderId', 'receiverId'],
        include: {
          sender: { select: { id: true, name: true } },
          receiver: { select: { id: true, name: true } },
        },
      });

      return conversations.map((message) => ({
        userId: message.senderId === ctx.user.id ? message.receiverId : message.senderId,
        userName: message.senderId === ctx.user.id ? message.receiver.name : message.sender.name,
        lastMessage: message.content,
        lastMessageDate: message.createdAt,
      }));
    }),

  getMessages: protectedProcedure
    .input(z.string())
    .query(async ({ input: userId, ctx }) => {
      const messages = await prisma.message.findMany({
        where: {
          OR: [
            { senderId: ctx.user.id, receiverId: userId },
            { senderId: userId, receiverId: ctx.user.id },
          ],
        },
        orderBy: { createdAt: 'asc' },
        include: {
          sender: { select: { id: true, name: true } },
          receiver: { select: { id: true, name: true } },
        },
      });

      // Mark messages as read
      await prisma.message.updateMany({
        where: {
          senderId: userId,
          receiverId: ctx.user.id,
          read: false,
        },
        data: { read: true },
      });

      return messages;
    }),
});

