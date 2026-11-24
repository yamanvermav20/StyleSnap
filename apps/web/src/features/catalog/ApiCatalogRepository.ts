import { getOutfit, listCategories, listOutfits, type Outfit } from '#/generated/api'
import type { CatalogRepository, OutfitFilter } from './CatalogRepository'
import { normalizeFilter } from './CatalogRepository'

export class ApiCatalogRepository implements CatalogRepository {
  listCategories() {
    return listCategories()
  }

  listOutfits(filter: OutfitFilter = {}) {
    const normalized = normalizeFilter(filter)
    return listOutfits({
      search: normalized.search,
      categoryId: normalized.categoryId,
      season: normalized.season,
      occasion: normalized.occasion,
      sort: normalized.sort,
    })
  }

  getOutfit(outfitId: string): Promise<Outfit> {
    return getOutfit({ outfitId })
  }
}
