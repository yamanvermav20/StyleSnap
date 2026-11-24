import { SEED_CATEGORIES, SEED_COLLECTIONS, SEED_OUTFITS, SEED_WARDROBE } from './seed-data.js'

const DAY = 86_400_000
const HOUR = 3_600_000

/**
 * Replaces everything with the seed data. Timestamps are relative to when the seed runs.
 * @param {import('./store.js').StyleStore} store
 * @param {Date} [now]
 */
export function seed(store, now = new Date()) {
  const ago = (/** @type {number} */ days, /** @type {number} */ hours = 0) => new Date(now.getTime() - days * DAY - hours * HOUR).toISOString()
  store.db.exec('BEGIN')
  try {
    store.clear()
    SEED_CATEGORIES.forEach((category, index) => store.insertCategory(category, index))
    SEED_OUTFITS.forEach((outfit, index) => store.insertOutfit(outfit, ago(outfit.daysAgo, index)))
    for (const collection of SEED_COLLECTIONS) {
      store.createCollection({ name: collection.name, description: collection.description }, { id: collection.id, createdAt: ago(collection.daysAgo + 7) })
      // outfitIds are listed newest first.
      collection.outfitIds.forEach((outfitId, index) => store.addOutfit(collection.id, outfitId, ago(collection.daysAgo, index)))
      store.touchCollection(collection.id, ago(collection.daysAgo))
    }
    for (const item of SEED_WARDROBE) {
      const { id, daysAgo, ...input } = item
      store.createWardrobeItem(/** @type {any} */ (input), { id, createdAt: ago(daysAgo) })
    }
    store.db.exec('COMMIT')
  } catch (error) {
    store.db.exec('ROLLBACK')
    throw error
  }
  return store.counts()
}
