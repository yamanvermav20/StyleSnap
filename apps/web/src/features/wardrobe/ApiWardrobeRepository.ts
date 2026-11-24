import {
  createWardrobeItem,
  deleteWardrobeItem,
  getWardrobeItem,
  listWardrobeItems,
  listWardrobePhotos,
  updateWardrobeItem,
  type WardrobeItemInput,
} from '#/generated/api'
import type { ItemType } from '#/core/labels'
import type { WardrobeRepository } from './WardrobeRepository'

export class ApiWardrobeRepository implements WardrobeRepository {
  list(type?: ItemType) {
    return listWardrobeItems(type ? { type } : {})
  }

  get(itemId: string) {
    return getWardrobeItem({ itemId })
  }

  create(input: WardrobeItemInput) {
    return createWardrobeItem({ body: input })
  }

  update(itemId: string, input: WardrobeItemInput) {
    return updateWardrobeItem({ itemId, body: input })
  }

  async delete(itemId: string) {
    await deleteWardrobeItem({ itemId })
  }

  listPhotos() {
    return listWardrobePhotos()
  }
}
