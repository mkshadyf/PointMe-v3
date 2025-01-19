import { trpc } from './trpc'

// Helper to convert tRPC queries to SWR fetchers
export function createTrpcFetcher<TInput = void, TOutput = any>(
  path: string[],
  input?: TInput
) {
  return async () => {
    const caller = path.reduce((acc, part) => acc[part], trpc) as any
    return caller.query(input)
  }
}

// Helper to convert tRPC mutations to SWR mutate functions
export function createTrpcMutation<TInput = void, TOutput = any>(
  path: string[]
) {
  return async (input: TInput) => {
    const caller = path.reduce((acc, part) => acc[part], trpc) as any
    return caller.mutate(input)
  }
}

// Helper to create a key for SWR cache
export function createTrpcKey(path: string[], input?: any) {
  return input ? [...path, input] : path
}
