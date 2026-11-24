import { ApiError, type WardrobeItem, type WardrobeItemInput, type WardrobePhoto } from '#/generated/api'
import type { ItemType } from '#/core/labels'
import { fixturePhotos, fixtureWardrobe } from '#/features/catalog/fixture'
import { normalizeWardrobeInput, type WardrobeRepository } from './WardrobeRepository'

export class InMemoryWardrobeRepository implements WardrobeRepository {
  private items: WardrobeItem[]
  private photos: WardrobePhoto[]

  constructor(items: WardrobeItem[] = fixtureWardrobe(), photos: WardrobePhoto[] = fixturePhotos()) {
    this.items = structuredClone(items)
    this.photos = structuredClone(photos)
  }

  private now() {
    return new Date().toISOString()
  }

  private sorted(items: WardrobeItem[]) {
    return [...items].sort((a, b) => b.createdAt.localeCompare(a.createdAt) || a.id.localeCompare(b.id))
  }

  async list(type?: ItemType) {
    const matched = type ? this.items.filter((item) => item.type === type) : this.items
    return this.sorted(matched)
  }

  async get(itemId: string) {
    const item = this.items.find((entry) => entry.id === itemId)
    if (!item) throw new ApiError(404, '')
    return structuredClone(item)
  }

  async create(input: WardrobeItemInput) {
    const normalized = normalizeWardrobeInput(input)
    const timestamp = this.now()
    const item: WardrobeItem = { id: crypto.randomUUID(), ...normalized, createdAt: timestamp, updatedAt: timestamp }
    this.items.push(item)
    return structuredClone(item)
  }

  async update(itemId: string, input: WardrobeItemInput) {
    const item = this.items.find((entry) => entry.id === itemId)
    if (!item) throw new ApiError(404, '')
    const normalized = normalizeWardrobeInput(input)
    Object.assign(item, normalized, { updatedAt: this.now() })
    return structuredClone(item)
  }

  async delete(itemId: string) {
    const index = this.items.findIndex((entry) => entry.id === itemId)
    if (index < 0) throw new ApiError(404, '')
    this.items.splice(index, 1)
  }

  async listPhotos() {
    return structuredClone(this.photos)
  }
}
