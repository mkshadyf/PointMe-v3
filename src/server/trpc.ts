import { initTRPC, TRPCError } from '@trpc/server'
import { type CreateNextContextOptions } from '@trpc/server/adapters/next'
import { getSession } from '@/lib/auth'
import { createClient } from '@/utils/supabase/server'

export async function createContext({ req, res }: CreateNextContextOptions) {
  const session = await getSession({ req })
  const supabase = createClient()
  
  return {
    req,
    res,
    supabase,
    session,
    user: session?.user,
  }
}

export type Context = Awaited<ReturnType<typeof createContext>>

const t = initTRPC.context<Context>().create()

export const router = t.router
export const publicProcedure = t.procedure

const isAuthed = t.middleware(({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'You must be logged in',
    })
  }
  return next({
    ctx: {
      user: ctx.user,
    },
  })
})

export const protectedProcedure = t.procedure.use(isAuthed)
