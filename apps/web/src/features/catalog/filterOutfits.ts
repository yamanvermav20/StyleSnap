import type { Outfit } from '#/generated/api'
import type { OutfitFilter } from './CatalogRepository'

/** Same matching rules as the API: case-insensitive text, AND filters, allSeason matches any season. */
export function filterOutfits(outfits: Outfit[], filter: OutfitFilter = {}) {
  const search = filter.search?.trim().toLowerCase()
  const matched = outfits.filter((outfit) => {
    if (filter.categoryId && outfit.categoryId !== filter.categoryId) return false
    if (filter.season && outfit.season !== filter.season && outfit.season !== 'allSeason') return false
    if (filter.occasion && outfit.occasion !== filter.occasion) return false
    if (search) {
      const haystack = [
        outfit.title,
        outfit.description,
        outfit.creatorName,
        ...outfit.tags,
        ...outfit.items.flatMap((item) => [item.name, item.brand]),
      ]
        .join(' ')
        .toLowerCase()
      if (!haystack.includes(search)) return false
    }
    return true
  })
  const newest = filter.sort === 'newest'
  return matched.sort((a, b) => {
    if (newest) {
      const byDate = b.createdAt.localeCompare(a.createdAt)
      if (byDate !== 0) return byDate
    } else if (b.likes !== a.likes) {
      return b.likes - a.likes
    }
    return a.id.localeCompare(b.id)
  })
}
