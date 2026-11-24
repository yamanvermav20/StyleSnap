export const SEASONS = ['spring', 'summer', 'fall', 'winter', 'allSeason']
export const OCCASIONS = ['everyday', 'work', 'party', 'date', 'travel', 'sport']
export const ITEM_TYPES = ['top', 'bottom', 'dress', 'outerwear', 'shoes', 'accessory']
export const SORTS = ['popular', 'newest']

export class ValidationError extends Error {}

/** @param {unknown} body */
function objectBody(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) throw new ValidationError('The body must be a JSON object.')
  return /** @type {Record<string, unknown>} */ (body)
}

/** @param {unknown} value @param {string} field @param {{ min?: number, max: number }} limits */
function text(value, field, { min = 0, max }) {
  if (typeof value !== 'string') throw new ValidationError(`${field} must be a string.`)
  const trimmed = value.trim()
  if (trimmed.length < min) throw new ValidationError(`${field} is required.`)
  if (trimmed.length > max) throw new ValidationError(`${field} must be ${max} characters or fewer.`)
  return trimmed
}

/** @template {string} T @param {unknown} value @param {string} field @param {readonly T[]} allowed @returns {T} */
function oneOf(value, field, allowed) {
  if (typeof value !== 'string' || !allowed.includes(/** @type {T} */ (value))) {
    throw new ValidationError(`${field} must be one of ${allowed.join(', ')}.`)
  }
  return /** @type {T} */ (value)
}

/** @param {Record<string, unknown>} query */
export function parseOutfitFilter(query) {
  /** @type {{ search?: string, categoryId?: string, season?: string, occasion?: string, sort: string }} */
  const filter = { sort: 'popular' }
  if (typeof query.search === 'string' && query.search.trim()) filter.search = query.search.trim().toLowerCase()
  if (typeof query.categoryId === 'string' && query.categoryId) filter.categoryId = query.categoryId
  if (query.season != null && query.season !== '') filter.season = oneOf(query.season, 'season', SEASONS)
  if (query.occasion != null && query.occasion !== '') filter.occasion = oneOf(query.occasion, 'occasion', OCCASIONS)
  if (query.sort != null && query.sort !== '') filter.sort = oneOf(query.sort, 'sort', SORTS)
  return filter
}

/** @param {unknown} value */
export function parseItemType(value) {
  return value == null || value === '' ? undefined : oneOf(value, 'type', ITEM_TYPES)
}

/** @param {unknown} raw */
export function parseCollectionInput(raw) {
  const body = objectBody(raw)
  return {
    name: text(body.name, 'name', { min: 1, max: 40 }),
    description: text(body.description ?? '', 'description', { max: 140 }),
  }
}

/** @param {unknown} raw */
export function parseCollectionOutfitInput(raw) {
  const body = objectBody(raw)
  return { outfitId: text(body.outfitId, 'outfitId', { min: 1, max: 100 }) }
}

/** @param {unknown} raw */
export function parseWardrobeItemInput(raw) {
  const body = objectBody(raw)
  const imageUrl = text(body.imageUrl, 'imageUrl', { min: 1, max: 500 })
  if (!imageUrl.startsWith('https://')) throw new ValidationError('imageUrl must be an https URL.')
  if (body.favorite != null && typeof body.favorite !== 'boolean') throw new ValidationError('favorite must be true or false.')
  return {
    name: text(body.name, 'name', { min: 1, max: 60 }),
    brand: text(body.brand ?? '', 'brand', { max: 40 }),
    type: oneOf(body.type, 'type', ITEM_TYPES),
    color: text(body.color ?? '', 'color', { max: 30 }),
    season: oneOf(body.season, 'season', SEASONS),
    imageUrl,
    notes: text(body.notes ?? '', 'notes', { max: 280 }),
    favorite: body.favorite === true,
  }
}
