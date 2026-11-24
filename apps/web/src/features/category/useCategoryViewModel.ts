import { useRouteContext } from '@tanstack/react-router'
import { useClientQuery } from '#/core/useClientQuery'
import { catalogKeys } from '#/features/catalog/CatalogRepository'

export function useCategoryViewModel(categoryId: string) {
  const { container } = useRouteContext({ from: '__root__' })
  const catalog = container.catalogRepository
  const categories = useClientQuery({
    queryKey: catalogKeys.categories,
    queryFn: () => catalog.listCategories(),
    staleTime: Infinity,
  })
  const outfits = useClientQuery({
    queryKey: catalogKeys.outfits({ categoryId, sort: 'popular' }),
    queryFn: () => catalog.listOutfits({ categoryId, sort: 'popular' }),
    staleTime: Infinity,
  })
  const category = categories.data?.find((entry) => entry.id === categoryId)
  const missing = categories.isSuccess && !category
  const failed = categories.isError || outfits.isError || missing
  const loading = !failed && (categories.isPending || outfits.isPending)

  return {
    status: loading ? ('loading' as const) : failed ? ('error' as const) : ('ready' as const),
    category,
    outfits: outfits.data ?? [],
    retry: () => {
      void categories.refetch()
      void outfits.refetch()
    },
  }
}
