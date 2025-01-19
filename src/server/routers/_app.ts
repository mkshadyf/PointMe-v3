import { router } from '../trpc'
import { messageRouter } from './message'
import { notificationRouter } from './notification'
import { adminRouter } from './admin'

export const appRouter = router({
  message: messageRouter,
  notification: notificationRouter,
  admin: adminRouter,
})

export type AppRouter = typeof appRouter
