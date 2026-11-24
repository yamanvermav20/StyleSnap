import type { Category, Outfit } from '#/generated/api'
import type { Occasion, Season } from '#/core/labels'

export type OutfitSort = 'popular' | 'newest'

export type OutfitFilter = {
  search?: string
  categoryId?: string
  season?: Season
  occasion?: Occasion
  sort?: OutfitSort
}

export interface CatalogRepository {
  listCategories(): Promise<Category[]>
  listOutfits(filter?: OutfitFilter): Promise<Outfit[]>
  getOutfit(outfitId: string): Promise<Outfit>
}

export const catalogKeys = {
  categories: ['catalog', 'categories'] as const,
  outfits: (filter: OutfitFilter) => ['catalog', 'outfits', normalizeFilter(filter)] as const,
  outfit: (outfitId: string) => ['catalog', 'outfit', outfitId] as const,
}

/** Stable query-key shape, with empty text omitted the way the API omits it. */
export function normalizeFilter(filter: OutfitFilter = {}): OutfitFilter {
  const search = filter.search?.trim()
  return {
    search: search ? search : undefined,
    categoryId: filter.categoryId || undefined,
    season: filter.season,
    occasion: filter.occasion,
    sort: filter.sort ?? 'popular',
  }
}
