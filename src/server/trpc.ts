import { initTRPC, TRPCError } from '@trpc/server'
import { type CreateNextContextOptions } from '@trpc/server/adapters/next'
import { type Session } from '@supabase/supabase-js'
import { type User } from '../types'
import { z } from 'zod'

interface CreateContextOptions {
  session: Session | null;
  user: User | null;
}

export const createContextInner = async (opts: CreateContextOptions) => {
  return {
    session: opts.session,
    user: opts.user,
  }
}

export const createContext = async (opts: CreateNextContextOptions) => {

  // Get the session and user from your auth provider here
  const session = null // Replace with actual session
  const user = null // Replace with actual user

  return await createContextInner({
    session,
    user,
  })
}

const t = initTRPC.context<typeof createContext>().create()

export const router = t.router
export const publicProcedure = t.procedure

export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.session || !ctx.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' })
  }
  return next({
    ctx: {
      ...ctx,
      session: ctx.session,
      user: ctx.user,
    },
  })
})

export const adminProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.session || !ctx.user || !ctx.user.roles.includes('admin')) {
    throw new TRPCError({ code: 'UNAUTHORIZED' })
  }
  return next({
    ctx: {
      ...ctx,
      session: ctx.session,
      user: ctx.user,
    },
  })
})

export const businessOwnerProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.session || !ctx.user || !ctx.user.roles.includes('BUSINESS_OWNER')) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'You must be a business owner to perform this action',
    })
  }
  return next({
    ctx: {
      ...ctx,
      session: ctx.session,
      user: ctx.user,
    },
  })
})
