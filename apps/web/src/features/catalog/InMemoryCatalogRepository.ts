import { ApiError, type Category, type Outfit } from '#/generated/api'
import type { CatalogRepository, OutfitFilter } from './CatalogRepository'
import { filterOutfits } from './filterOutfits'
import { fixtureCategories, fixtureOutfits } from './fixture'

export class InMemoryCatalogRepository implements CatalogRepository {
  readonly categories: Category[]
  readonly outfits: Outfit[]

  constructor(outfits: Outfit[] = fixtureOutfits(), categories: Category[] = fixtureCategories()) {
    this.outfits = structuredClone(outfits)
    this.categories = structuredClone(categories)
  }

  peek(outfitId: string) {
    return this.outfits.find((outfit) => outfit.id === outfitId)
  }

  async listCategories() {
    return this.categories.map((category) => ({
      ...category,
      outfitCount: this.outfits.filter((outfit) => outfit.categoryId === category.id).length,
    }))
  }

  async listOutfits(filter: OutfitFilter = {}) {
    return filterOutfits(this.outfits, filter)
  }

  async getOutfit(outfitId: string) {
    const outfit = this.peek(outfitId)
    if (!outfit) throw new ApiError(404, '')
    return outfit
  }
}
