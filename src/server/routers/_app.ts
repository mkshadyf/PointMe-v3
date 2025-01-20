import { router } from '../trpc'
import { bookingRouter } from './booking'
import businessRouter from './business'
import { messageRouter } from './message'
import { notificationRouter } from './notification'
import { authRouter } from './auth'
import { serviceRouter } from './service'
import { reviewRouter } from './review'

export const appRouter = router({
  business: businessRouter,
  booking: bookingRouter,
  message: messageRouter,
  notification: notificationRouter,
  auth: authRouter,
  service: serviceRouter,
  review: reviewRouter,
})

export type AppRouter = typeof appRouter
