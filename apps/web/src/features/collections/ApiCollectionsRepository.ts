import {
  addOutfitToCollection,
  createCollection,
  deleteCollection,
  getCollection,
  listCollectionOutfits,
  listCollections,
  removeOutfitFromCollection,
  updateCollection,
  type CollectionInput,
  type OutfitCollection,
} from '#/generated/api'
import type { CollectionsRepository } from './CollectionsRepository'

export class ApiCollectionsRepository implements CollectionsRepository {
  list() {
    return listCollections()
  }

  get(collectionId: string) {
    return getCollection({ collectionId })
  }

  listOutfits(collectionId: string) {
    return listCollectionOutfits({ collectionId })
  }

  create(input: CollectionInput) {
    return createCollection({ body: input })
  }

  update(collectionId: string, input: CollectionInput) {
    return updateCollection({ collectionId, body: input })
  }

  async delete(collectionId: string) {
    await deleteCollection({ collectionId })
  }

  addOutfit(collectionId: string, outfitId: string) {
    return addOutfitToCollection({ collectionId, body: { outfitId } })
  }

  removeOutfit(collectionId: string, outfitId: string): Promise<OutfitCollection> {
    return removeOutfitFromCollection({ collectionId, outfitId })
  }
}
