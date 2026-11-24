import { randomUUID } from 'node:crypto'

/** @typedef {import('node:sqlite').DatabaseSync} Database */

const MAX_COVERS = 4

/** @param {any} row */
function toCategory(row) {
  return { id: row.id, name: row.name, description: row.description, imageUrl: row.image_url, outfitCount: Number(row.outfit_count) }
}

/** @param {any} row */
function toOutfit(row) {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    imageUrl: row.image_url,
    gallery: JSON.parse(row.gallery),
    categoryId: row.category_id,
    categoryName: row.category_name,
    creatorName: row.creator_name,
    season: row.season,
    occasion: row.occasion,
    tags: JSON.parse(row.tags),
    likes: Number(row.likes),
    items: JSON.parse(row.items),
    createdAt: row.created_at,
  }
}

/** @param {any} row */
function toWardrobeItem(row) {
  return {
    id: row.id,
    name: row.name,
    brand: row.brand,
    type: row.type,
    color: row.color,
    season: row.season,
    imageUrl: row.image_url,
    notes: row.notes,
    favorite: Boolean(row.favorite),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

const OUTFIT_SELECT = `SELECT o.*, c.name AS category_name FROM outfits o JOIN categories c ON c.id = o.category_id`

/** Escapes LIKE wildcards so a search for "100%" matches literally. @param {string} value */
const likePattern = (value) => `%${value.replace(/[\\%_]/g, (ch) => `\\${ch}`)}%`

export class StyleStore {
  /** @param {Database} db @param {() => Date} [now] */
  constructor(db, now = () => new Date()) {
    this.db = db
    this.now = now
  }

  clear() {
    this.db.exec('DELETE FROM collection_outfits; DELETE FROM collections; DELETE FROM wardrobe_items; DELETE FROM outfits; DELETE FROM categories;')
  }

  counts() {
    const n = (/** @type {string} */ table) => Number(/** @type {any} */ (this.db.prepare(`SELECT COUNT(*) AS n FROM ${table}`).get()).n)
    return { categories: n('categories'), outfits: n('outfits'), collections: n('collections'), wardrobe: n('wardrobe_items') }
  }

  // Catalog

  listCategories() {
    return this.db
      .prepare(`SELECT c.*, (SELECT COUNT(*) FROM outfits o WHERE o.category_id = c.id) AS outfit_count FROM categories c ORDER BY c.position`)
      .all()
      .map(toCategory)
  }

  /** @param {{ search?: string, categoryId?: string, season?: string, occasion?: string, sort: string }} filter */
  listOutfits(filter) {
    const where = []
    /** @type {string[]} */
    const params = []
    if (filter.search) {
      where.push(`o.search_text LIKE ? ESCAPE '\\'`)
      params.push(likePattern(filter.search))
    }
    if (filter.categoryId) {
      where.push('o.category_id = ?')
      params.push(filter.categoryId)
    }
    if (filter.season) {
      where.push(`(o.season = ? OR o.season = 'allSeason')`)
      params.push(filter.season)
    }
    if (filter.occasion) {
      where.push('o.occasion = ?')
      params.push(filter.occasion)
    }
    const order = filter.sort === 'newest' ? 'o.created_at DESC, o.id ASC' : 'o.likes DESC, o.id ASC'
    const sql = `${OUTFIT_SELECT} ${where.length ? `WHERE ${where.join(' AND ')}` : ''} ORDER BY ${order}`
    return this.db.prepare(sql).all(...params).map(toOutfit)
  }

  /** @param {string} id */
  getOutfit(id) {
    const row = this.db.prepare(`${OUTFIT_SELECT} WHERE o.id = ?`).get(id)
    return row ? toOutfit(row) : null
  }

  /** @param {{ id: string, name: string, description: string, imageUrl: string }} category @param {number} position */
  insertCategory(category, position) {
    this.db
      .prepare('INSERT INTO categories (id, name, description, image_url, position) VALUES (?, ?, ?, ?, ?)')
      .run(category.id, category.name, category.description, category.imageUrl, position)
  }

  /** @param {any} outfit @param {string} createdAt */
  insertOutfit(outfit, createdAt) {
    const searchText = [outfit.title, outfit.description, outfit.creatorName, ...outfit.tags, ...outfit.items.flatMap((/** @type {any} */ i) => [i.name, i.brand])]
      .join(' ')
      .toLowerCase()
    this.db
      .prepare(
        `INSERT INTO outfits (id, title, description, image_url, gallery, category_id, creator_name, season, occasion, tags, likes, items, search_text, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .run(
        outfit.id, outfit.title, outfit.description, outfit.imageUrl, JSON.stringify(outfit.gallery), outfit.categoryId, outfit.creatorName,
        outfit.season, outfit.occasion, JSON.stringify(outfit.tags), outfit.likes, JSON.stringify(outfit.items), searchText, createdAt,
      )
  }

  // Collections

  /** @param {any} row */
  toCollection(row) {
    const outfits = /** @type {any[]} */ (
      this.db
        .prepare(
          `SELECT o.id, o.image_url FROM collection_outfits co JOIN outfits o ON o.id = co.outfit_id
           WHERE co.collection_id = ? ORDER BY co.added_at DESC, co.rowid DESC`,
        )
        .all(row.id)
    )
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      outfitIds: outfits.map((o) => o.id),
      coverImageUrls: outfits.slice(0, MAX_COVERS).map((o) => o.image_url),
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }
  }

  listCollections() {
    return this.db.prepare('SELECT * FROM collections ORDER BY updated_at DESC, id ASC').all().map((row) => this.toCollection(row))
  }

  /** @param {string} id */
  getCollection(id) {
    const row = this.db.prepare('SELECT * FROM collections WHERE id = ?').get(id)
    return row ? this.toCollection(row) : null
  }

  /** @param {{ name: string, description: string }} input @param {{ id?: string, createdAt?: string }} [meta] */
  createCollection(input, meta = {}) {
    const id = meta.id ?? randomUUID()
    const timestamp = meta.createdAt ?? this.now().toISOString()
    this.db
      .prepare('INSERT INTO collections (id, name, description, created_at, updated_at) VALUES (?, ?, ?, ?, ?)')
      .run(id, input.name, input.description, timestamp, timestamp)
    return this.getCollection(id)
  }

  /** @param {string} id @param {{ name: string, description: string }} input */
  updateCollection(id, input) {
    const result = this.db
      .prepare('UPDATE collections SET name = ?, description = ?, updated_at = ? WHERE id = ?')
      .run(input.name, input.description, this.now().toISOString(), id)
    return result.changes ? this.getCollection(id) : null
  }

  /** @param {string} id */
  deleteCollection(id) {
    return this.db.prepare('DELETE FROM collections WHERE id = ?').run(id).changes > 0
  }

  /** @param {string} id */
  listCollectionOutfits(id) {
    if (!this.getCollection(id)) return null
    return this.db
      .prepare(`${OUTFIT_SELECT} JOIN collection_outfits co ON co.outfit_id = o.id WHERE co.collection_id = ? ORDER BY co.added_at DESC, co.rowid DESC`)
      .all(id)
      .map(toOutfit)
  }

  /**
   * @param {string} collectionId @param {string} outfitId @param {string} [addedAt]
   * @returns {'noCollection' | 'noOutfit' | ReturnType<StyleStore['getCollection']>}
   */
  addOutfit(collectionId, outfitId, addedAt) {
    if (!this.getCollection(collectionId)) return 'noCollection'
    if (!this.getOutfit(outfitId)) return 'noOutfit'
    const timestamp = addedAt ?? this.now().toISOString()
    const inserted = this.db
      .prepare('INSERT OR IGNORE INTO collection_outfits (collection_id, outfit_id, added_at) VALUES (?, ?, ?)')
      .run(collectionId, outfitId, timestamp)
    if (inserted.changes && !addedAt) this.touchCollection(collectionId, timestamp)
    return this.getCollection(collectionId)
  }

  /** @param {string} collectionId @param {string} outfitId */
  removeOutfit(collectionId, outfitId) {
    if (!this.getCollection(collectionId)) return null
    const removed = this.db.prepare('DELETE FROM collection_outfits WHERE collection_id = ? AND outfit_id = ?').run(collectionId, outfitId)
    if (removed.changes) this.touchCollection(collectionId, this.now().toISOString())
    return this.getCollection(collectionId)
  }

  /** @param {string} id @param {string} timestamp */
  touchCollection(id, timestamp) {
    this.db.prepare('UPDATE collections SET updated_at = ? WHERE id = ?').run(timestamp, id)
  }

  // Wardrobe

  /** @param {string} [type] */
  listWardrobe(type) {
    const sql = `SELECT * FROM wardrobe_items ${type ? 'WHERE type = ?' : ''} ORDER BY created_at DESC, id ASC`
    return this.db.prepare(sql).all(...(type ? [type] : [])).map(toWardrobeItem)
  }

  /** @param {string} id */
  getWardrobeItem(id) {
    const row = this.db.prepare('SELECT * FROM wardrobe_items WHERE id = ?').get(id)
    return row ? toWardrobeItem(row) : null
  }

  /** @param {ReturnType<typeof import('./validation.js').parseWardrobeItemInput>} input @param {{ id?: string, createdAt?: string }} [meta] */
  createWardrobeItem(input, meta = {}) {
    const id = meta.id ?? randomUUID()
    const timestamp = meta.createdAt ?? this.now().toISOString()
    this.db
      .prepare(
        `INSERT INTO wardrobe_items (id, name, brand, type, color, season, image_url, notes, favorite, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .run(id, input.name, input.brand, input.type, input.color, input.season, input.imageUrl, input.notes, input.favorite ? 1 : 0, timestamp, timestamp)
    return this.getWardrobeItem(id)
  }

  /** @param {string} id @param {ReturnType<typeof import('./validation.js').parseWardrobeItemInput>} input */
  updateWardrobeItem(id, input) {
    const result = this.db
      .prepare(
        `UPDATE wardrobe_items SET name = ?, brand = ?, type = ?, color = ?, season = ?, image_url = ?, notes = ?, favorite = ?, updated_at = ?
         WHERE id = ?`,
      )
      .run(input.name, input.brand, input.type, input.color, input.season, input.imageUrl, input.notes, input.favorite ? 1 : 0, this.now().toISOString(), id)
    return result.changes ? this.getWardrobeItem(id) : null
  }

  /** @param {string} id */
  deleteWardrobeItem(id) {
    return this.db.prepare('DELETE FROM wardrobe_items WHERE id = ?').run(id).changes > 0
  }
}
