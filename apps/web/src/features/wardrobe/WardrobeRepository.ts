import type { WardrobeItem, WardrobeItemInput, WardrobePhoto } from '#/generated/api'
import type { ItemType } from '#/core/labels'
import { isItemType, isSeason } from '#/core/labels'

export interface WardrobeRepository {
  list(type?: ItemType): Promise<WardrobeItem[]>
  get(itemId: string): Promise<WardrobeItem>
  create(input: WardrobeItemInput): Promise<WardrobeItem>
  update(itemId: string, input: WardrobeItemInput): Promise<WardrobeItem>
  delete(itemId: string): Promise<void>
  listPhotos(): Promise<WardrobePhoto[]>
}

export const wardrobeKeys = {
  items: (type: ItemType | 'all') => ['wardrobe', 'items', type] as const,
  item: (itemId: string) => ['wardrobe', 'item', itemId] as const,
  photos: ['wardrobe', 'photos'] as const,
  filter: ['wardrobe', 'typeFilter'] as const,
}

export const WARDROBE_LIMITS = { name: 60, brand: 40, color: 30, notes: 280 }

export function clipWardrobeText(value: string, max: number) {
  return value.slice(0, max)
}

/** Empty name or missing photo, checked before a save. */
export function wardrobeDraftError(name: string, imageUrl: string): 'name' | 'photo' | null {
  if (!name.trim()) return 'name'
  if (!imageUrl) return 'photo'
  return null
}

/** Trims text the way the API does. Invalid payloads throw so a save never stores them. */
export function normalizeWardrobeInput(input: WardrobeItemInput): WardrobeItemInput {
  const name = input.name.trim()
  const brand = input.brand.trim()
  const color = input.color.trim()
  const notes = input.notes.trim()
  const imageUrl = input.imageUrl.trim()
  if (!name || name.length > WARDROBE_LIMITS.name) throw new Error('name')
  if (brand.length > WARDROBE_LIMITS.brand) throw new Error('brand')
  if (color.length > WARDROBE_LIMITS.color) throw new Error('color')
  if (notes.length > WARDROBE_LIMITS.notes) throw new Error('notes')
  if (!imageUrl.startsWith('https://') || imageUrl.length > 500) throw new Error('imageUrl')
  if (!isItemType(input.type) || !isSeason(input.season)) throw new Error('choice')
  return {
    name,
    brand,
    color,
    notes,
    imageUrl,
    type: input.type,
    season: input.season,
    favorite: input.favorite === true,
  }
}
