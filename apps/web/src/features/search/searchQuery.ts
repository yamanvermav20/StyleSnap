import type { Occasion, Season } from '#/core/labels'
import { isOccasion, isSeason } from '#/core/labels'
import { normalizeFilter, type OutfitFilter, type OutfitSort } from '#/features/catalog/CatalogRepository'

export type SearchQuery = {
  search: string
  categoryId: string
  season: string
  occasion: string
  sort: OutfitSort
}

export const defaultSearchQuery: SearchQuery = {
  search: '',
  categoryId: '',
  season: '',
  occasion: '',
  sort: 'popular',
}

export const SEARCH_DEBOUNCE_MS = 300

export function normalizeSearch(search: Record<string, unknown>): SearchQuery {
  return {
    search: typeof search.search === 'string' ? search.search : '',
    categoryId: typeof search.categoryId === 'string' ? search.categoryId : '',
    season: isSeason(search.season) ? search.season : '',
    occasion: isOccasion(search.occasion) ? search.occasion : '',
    sort: search.sort === 'newest' ? 'newest' : 'popular',
  }
}

export function toOutfitFilter(query: SearchQuery): OutfitFilter {
  return normalizeFilter({
    search: query.search,
    categoryId: query.categoryId || undefined,
    season: isSeason(query.season) ? (query.season as Season) : undefined,
    occasion: isOccasion(query.occasion) ? (query.occasion as Occasion) : undefined,
    sort: query.sort,
  })
}

export function filtersActive(query: SearchQuery) {
  return Boolean(query.categoryId || query.season || query.occasion || query.sort !== 'popular')
}
