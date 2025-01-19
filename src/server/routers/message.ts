import { router, protectedProcedure } from '../trpc';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';

const createMessageSchema = z.object({
  receiverId: z.string(),
  content: z.string().min(1).max(1000),
});

export const messageRouter = router({
  sendMessage: protectedProcedure
    .input(createMessageSchema)
    .mutation(async ({ input, ctx }) => {
      const { data: message, error: messageError } = await ctx.supabase
        .from('messages')
        .insert({
          sender_id: ctx.user.id,
          receiver_id: input.receiverId,
          content: input.content,
          read: false,
        })
        .select()
        .single();

      if (messageError) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to send message',
          cause: messageError,
        });
      }

      // Create a notification for the receiver
      const { error: notificationError } = await ctx.supabase
        .from('notifications')
        .insert({
          user_id: input.receiverId,
          message: `You have a new message from ${ctx.user.name}`,
          type: 'info',
        });

      if (notificationError) {
        console.error('Failed to create notification:', notificationError);
      }

      return message;
    }),

  getConversation: protectedProcedure
    .input(z.object({ otherId: z.string() }))
    .query(async ({ input, ctx }) => {
      const { data: messages, error } = await ctx.supabase
        .from('messages')
        .select('*')
        .or(`sender_id.eq.${ctx.user.id},receiver_id.eq.${ctx.user.id}`)
        .or(`sender_id.eq.${input.otherId},receiver_id.eq.${input.otherId}`)
        .order('created_at', { ascending: false });

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch messages',
          cause: error,
        });
      }

      return messages;
    }),

  markAsRead: protectedProcedure
    .input(z.object({ messageId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const { error } = await ctx.supabase
        .from('messages')
        .update({ read: true })
        .eq('id', input.messageId)
        .eq('receiver_id', ctx.user.id);

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to mark message as read',
          cause: error,
        });
      }

      return { success: true };
    }),

  getUnreadCount: protectedProcedure.query(async ({ ctx }) => {
    const { count, error } = await ctx.supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('receiver_id', ctx.user.id)
      .eq('read', false);

    if (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to get unread count',
        cause: error,
      });
    }

    return count || 0;
  }),
});
