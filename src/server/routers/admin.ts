import { router, protectedProcedure } from '../trpc'
import { z } from 'zod'
import { TRPCError } from '@trpc/server'

const isAdmin = async (ctx: any) => {
  const { data: profile } = await ctx.supabase
    .from('profiles')
    .select('role')
    .eq('id', ctx.user.id)
    .single()

  if (!profile || profile.role !== 'admin') {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Only admins can access this resource',
    })
  }
}

export const adminRouter = router({
  // Dashboard
  getStats: protectedProcedure.query(async ({ ctx }) => {
    await isAdmin(ctx)
    const { data: stats } = await ctx.supabase.rpc('get_admin_stats')
    return stats
  }),

  // Content Moderation
  getContentReports: protectedProcedure.query(async ({ ctx }) => {
    await isAdmin(ctx)
    const { data, error } = await ctx.supabase
      .from('reported_content')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  }),

  resolveReport: protectedProcedure
    .input(z.object({ 
      id: z.string(),
      action: z.enum(['approve', 'reject']),
      reason: z.string().optional()
    }))
    .mutation(async ({ ctx, input }) => {
      await isAdmin(ctx)
      const { error } = await ctx.supabase
        .from('reported_content')
        .update({ 
          status: input.action === 'approve' ? 'approved' : 'rejected',
          rejection_reason: input.reason
        })
        .eq('id', input.id)

      if (error) throw error
      return { success: true }
    }),

  dismissReport: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await isAdmin(ctx)
      const { error } = await ctx.supabase
        .from('reported_content')
        .update({ status: 'dismissed' })
        .eq('id', input.id)

      if (error) throw error
      return { success: true }
    }),

  // Settings Management
  getSettings: protectedProcedure
    .input(z.enum(['general', 'security', 'email', 'payment', 'integration']).optional())
    .query(async ({ ctx, input }) => {
      await isAdmin(ctx)
      const { data, error } = await ctx.supabase
        .from('admin_settings')
        .select(input ? input : '*')
        .single()

      if (error) throw error
      return data
    }),

  updateSettings: protectedProcedure
    .input(z.object({
      type: z.enum(['general', 'security', 'email', 'payment', 'integration']),
      settings: z.record(z.any()),
    }))
    .mutation(async ({ ctx, input }) => {
      await isAdmin(ctx)
      const { data, error } = await ctx.supabase
        .from('admin_settings')
        .update({
          [input.type]: input.settings,
          updated_at: new Date().toISOString(),
        })
        .eq('id', 'default')
        .select()
        .single()

      if (error) throw error
      return data
    }),

  // User Management
  getUsers: protectedProcedure
    .input(z.object({
      page: z.number().optional(),
      limit: z.number().optional(),
      search: z.string().optional(),
      role: z.enum(['user', 'business', 'admin']).optional(),
      status: z.enum(['active', 'inactive', 'suspended']).optional(),
    }).optional())
    .query(async ({ ctx, input }) => {
      await isAdmin(ctx)
      const { data, error } = await ctx.supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      return data
    }),

  updateUser: protectedProcedure
    .input(z.object({
      id: z.string(),
      data: z.object({
        role: z.enum(['user', 'business', 'admin']).optional(),
        status: z.enum(['active', 'inactive', 'suspended']).optional(),
      }),
    }))
    .mutation(async ({ ctx, input }) => {
      await isAdmin(ctx)
      const { data, error } = await ctx.supabase
        .from('profiles')
        .update(input.data)
        .eq('id', input.id)
        .select()
        .single()

      if (error) throw error
      return data
    }),

  deleteUser: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await isAdmin(ctx)
      const { error } = await ctx.supabase.auth.admin.deleteUser(input.id)
      if (error) throw error
      return { success: true }
    }),
})
