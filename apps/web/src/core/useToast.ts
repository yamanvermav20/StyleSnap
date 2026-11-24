import { useQuery, useQueryClient, type QueryClient } from '@tanstack/react-query'
import { useCallback } from 'react'

const toastKey = ['ui', 'toast'] as const

export function publishToast(queryClient: QueryClient, message: string) {
  queryClient.setQueryData(toastKey, message)
}

/** A toast that survives a navigation, such as saving a new collection and returning to an outfit. */
export function useToastMessage() {
  const queryClient = useQueryClient()
  const { data } = useQuery({
    queryKey: toastKey,
    queryFn: async () => queryClient.getQueryData<string | null>(toastKey) ?? null,
    initialData: null as string | null,
    staleTime: Infinity,
    retry: false,
  })
  const show = useCallback((message: string) => publishToast(queryClient, message), [queryClient])
  const clear = useCallback(() => queryClient.setQueryData(toastKey, null), [queryClient])
  return { message: data ?? null, show, clear }
}
