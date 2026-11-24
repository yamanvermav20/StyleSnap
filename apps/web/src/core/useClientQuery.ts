import { useQuery, type QueryKey } from '@tanstack/react-query'
import { useHydrated } from '#/core/useHydrated'

/**
 * A query that runs only in the browser. Server rendering stays on the loading state when the
 * API is unreachable, instead of throwing during the request.
 */
export function useClientQuery<T>(options: {
  queryKey: QueryKey
  queryFn: () => Promise<T>
  enabled?: boolean
  staleTime?: number
  refetchOnMount?: boolean | 'always'
}) {
  const hydrated = useHydrated()
  return useQuery({
    queryKey: options.queryKey,
    queryFn: options.queryFn,
    enabled: hydrated && (options.enabled ?? true),
    staleTime: options.staleTime,
    refetchOnMount: options.refetchOnMount,
    retry: false,
  })
}
