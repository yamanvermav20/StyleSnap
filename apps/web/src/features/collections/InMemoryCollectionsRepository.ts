import { ApiError, type CollectionInput, type Outfit, type OutfitCollection } from '#/generated/api'
import { fixtureCollections } from '#/features/catalog/fixture'
import type { CollectionsRepository } from './CollectionsRepository'

const MAX_COVERS = 4

export class InMemoryCollectionsRepository implements CollectionsRepository {
  private collections: OutfitCollection[]

  constructor(
    private readonly outfitById: (outfitId: string) => Outfit | undefined,
    initial: OutfitCollection[] = fixtureCollections(),
  ) {
    this.collections = structuredClone(initial)
  }

  private now() {
    return new Date().toISOString()
  }

  private require(collectionId: string) {
    const collection = this.collections.find((entry) => entry.id === collectionId)
    if (!collection) throw new ApiError(404, '')
    return collection
  }

  private sort(collections: OutfitCollection[]) {
    return [...collections].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt) || a.id.localeCompare(b.id))
  }

  private refreshCovers(collection: OutfitCollection) {
    collection.coverImageUrls = collection.outfitIds
      .slice(0, MAX_COVERS)
      .map((outfitId) => this.outfitById(outfitId)?.imageUrl)
      .filter((url): url is string => Boolean(url))
  }

  async list() {
    return this.sort(this.collections)
  }

  async get(collectionId: string) {
    return structuredClone(this.require(collectionId))
  }

  async listOutfits(collectionId: string) {
    const collection = this.require(collectionId)
    return collection.outfitIds.flatMap((outfitId) => {
      const outfit = this.outfitById(outfitId)
      return outfit ? [outfit] : []
    })
  }

  async create(input: CollectionInput) {
    const timestamp = this.now()
    const collection: OutfitCollection = {
      id: crypto.randomUUID(),
      name: input.name.trim(),
      description: input.description.trim(),
      outfitIds: [],
      coverImageUrls: [],
      createdAt: timestamp,
      updatedAt: timestamp,
    }
    this.collections.push(collection)
    return structuredClone(collection)
  }

  async update(collectionId: string, input: CollectionInput) {
    const collection = this.require(collectionId)
    collection.name = input.name.trim()
    collection.description = input.description.trim()
    collection.updatedAt = this.now()
    return structuredClone(collection)
  }

  async delete(collectionId: string) {
    const index = this.collections.findIndex((entry) => entry.id === collectionId)
    if (index < 0) throw new ApiError(404, '')
    this.collections.splice(index, 1)
  }

  async addOutfit(collectionId: string, outfitId: string) {
    const collection = this.require(collectionId)
    if (!this.outfitById(outfitId)) throw new ApiError(404, '')
    if (!collection.outfitIds.includes(outfitId)) {
      collection.outfitIds.unshift(outfitId)
      collection.updatedAt = this.now()
      this.refreshCovers(collection)
    }
    return structuredClone(collection)
  }

  async removeOutfit(collectionId: string, outfitId: string) {
    const collection = this.require(collectionId)
    const next = collection.outfitIds.filter((id) => id !== outfitId)
    if (next.length !== collection.outfitIds.length) {
      collection.outfitIds = next
      collection.updatedAt = this.now()
      this.refreshCovers(collection)
    }
    return structuredClone(collection)
  }
}
