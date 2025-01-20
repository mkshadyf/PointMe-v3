import { createTRPCReact } from '@trpc/react-query'
import { httpBatchLink } from '@trpc/client'
import { QueryClient } from '@tanstack/react-query'
import type { AppRouter } from '../server/routers/_app'

export const trpc = createTRPCReact<AppRouter>()

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
      staleTime: 5 * 1000,
    },
  },
})

export const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: '/api/trpc',
      // You can pass any HTTP headers you wish here
      headers() {
        return {}
      },
    }),
  ],
})
