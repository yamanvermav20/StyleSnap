import { useRouteContext } from '@tanstack/react-router'
import { useClientQuery } from '#/core/useClientQuery'
import { catalogKeys } from '#/features/catalog/CatalogRepository'

export function useFeedViewModel() {
  const { container } = useRouteContext({ from: '__root__' })
  const catalog = container.catalogRepository
  const categories = useClientQuery({
    queryKey: catalogKeys.categories,
    queryFn: () => catalog.listCategories(),
    staleTime: Infinity,
  })
  const outfits = useClientQuery({
    queryKey: catalogKeys.outfits({ sort: 'popular' }),
    queryFn: () => catalog.listOutfits({ sort: 'popular' }),
    staleTime: Infinity,
  })
  const failed = categories.isError || outfits.isError
  const loading = !failed && (categories.isPending || outfits.isPending)

  return {
    status: loading ? ('loading' as const) : failed ? ('error' as const) : ('ready' as const),
    categories: categories.data ?? [],
    outfits: outfits.data ?? [],
    retry: () => {
      void categories.refetch()
      void outfits.refetch()
    },
  }
}
