import { router } from '../trpc';
import { businessRouter } from './business';
import { notificationRouter } from './notification';
import { messageRouter } from './message';

export const appRouter = router({
  business: businessRouter,
  notification: notificationRouter,
  message: messageRouter,
});

export type AppRouter = typeof appRouter;

