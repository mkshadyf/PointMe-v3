import useSWR, { SWRResponse, useSWRConfig } from 'swr'

export type UseQueryResult<T> = SWRResponse<T>

// Wrapper around useSWR for backward compatibility
export function useQuery<T>(key: string | null, fetcher: () => Promise<T>): SWRResponse<T> {
  return useSWR<T>(key, fetcher)
}

// Mutation helper that uses SWR's mutate
export async function mutate<T>(key: string | null, data?: T) {
  const { mutate: swrMutate } = useSWRConfig()
  return swrMutate(key, data)
}

// Type exports for compatibility
export type { SWRResponse as QueryResponse }
