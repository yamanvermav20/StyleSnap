import { LocalStorageSettingsRepository } from '#/features/settings/LocalStorageSettingsRepository'
import type { SettingsRepository } from '#/features/settings/SettingsRepository'
import { ApiCatalogRepository } from '#/features/catalog/ApiCatalogRepository'
import type { CatalogRepository } from '#/features/catalog/CatalogRepository'
import { ApiCollectionsRepository } from '#/features/collections/ApiCollectionsRepository'
import type { CollectionsRepository } from '#/features/collections/CollectionsRepository'
import { ApiWardrobeRepository } from '#/features/wardrobe/ApiWardrobeRepository'
import type { WardrobeRepository } from '#/features/wardrobe/WardrobeRepository'

/**
 * The app's dependencies, created once per router and shared through router context.
 * Live builds talk to the API. Tests pass in-memory repositories instead.
 */
export interface AppContainer {
  settingsRepository: SettingsRepository
  catalogRepository: CatalogRepository
  collectionsRepository: CollectionsRepository
  wardrobeRepository: WardrobeRepository
}

export function createAppContainer(): AppContainer {
  const storage = typeof window === 'undefined' ? undefined : window.localStorage
  return {
    settingsRepository: new LocalStorageSettingsRepository(storage),
    catalogRepository: new ApiCatalogRepository(),
    collectionsRepository: new ApiCollectionsRepository(),
    wardrobeRepository: new ApiWardrobeRepository(),
  }
}
