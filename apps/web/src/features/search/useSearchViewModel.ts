import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { useNavigate, useRouteContext, useSearch } from '@tanstack/react-router'
import { useEffect, useRef, useState } from 'react'
import { OCCASIONS, SEASONS } from '#/core/labels'
import { useClientQuery } from '#/core/useClientQuery'
import { useHydrated } from '#/core/useHydrated'
import { catalogKeys } from '#/features/catalog/CatalogRepository'
import { SEARCH_DEBOUNCE_MS, filtersActive, toOutfitFilter, type SearchQuery } from './searchQuery'

export function useSearchViewModel() {
  const { container } = useRouteContext({ from: '__root__' })
  const catalog = container.catalogRepository
  const query = useSearch({ from: '/search' })
  const navigate = useNavigate({ from: '/search' })
  const [draft, setDraft] = useState(query.search)
  const queryRef = useRef(query)
  queryRef.current = query

  useEffect(() => {
    setDraft((current) => (current.trim() === query.search ? current : query.search))
  }, [query.search])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const next = draft.trim()
      if (next === queryRef.current.search) return
      void navigate({
        to: '/search',
        search: { ...queryRef.current, search: next },
        replace: true,
      })
    }, SEARCH_DEBOUNCE_MS)
    return () => window.clearTimeout(timer)
  }, [draft, navigate])

  const hydrated = useHydrated()
  const filter = toOutfitFilter(query)
  const categories = useClientQuery({
    queryKey: catalogKeys.categories,
    queryFn: () => catalog.listCategories(),
    staleTime: Infinity,
  })
  const outfits = useQuery({
    queryKey: ['search', 'results', filter],
    queryFn: () => catalog.listOutfits(filter),
    enabled: hydrated,
    placeholderData: keepPreviousData,
    retry: false,
  })

  function replace(partial: Partial<SearchQuery>) {
    void navigate({
      to: '/search',
      search: { ...queryRef.current, ...partial, search: draft.trim() },
      replace: true,
    })
  }

  const initialLoading = outfits.isPending && outfits.data === undefined
  const status = outfits.isError ? ('error' as const) : initialLoading ? ('loading' as const) : ('ready' as const)

  return {
    draft,
    setDraft,
    query,
    categories: categories.data ?? [],
    seasons: SEASONS,
    occasions: OCCASIONS,
    filtersActive: filtersActive(query),
    outfits: outfits.isError ? [] : (outfits.data ?? []),
    fetching: outfits.isFetching && !initialLoading && !outfits.isError,
    status,
    setCategory: (categoryId: string) => replace({ categoryId }),
    setSeason: (season: string) => replace({ season }),
    setOccasion: (occasion: string) => replace({ occasion }),
    setSort: (sort: SearchQuery['sort']) => replace({ sort }),
    clearFilters: () => replace({ categoryId: '', season: '', occasion: '', sort: 'popular' }),
    retry: () => void outfits.refetch(),
  }
}
