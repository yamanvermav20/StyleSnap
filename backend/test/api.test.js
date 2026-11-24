import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { after, before, beforeEach, describe, test } from 'node:test'
import { createApp } from '../src/app.js'
import { config } from '../src/config.js'
import { openDatabase } from '../src/db.js'
import { seed } from '../src/seed.js'
import { StyleStore } from '../src/store.js'

const contract = JSON.parse(readFileSync(config.openApiPath, 'utf8'))
const schemas = contract.components.schemas

const store = new StyleStore(openDatabase(':memory:'))
/** @type {import('node:http').Server} */
let server
let base = ''

before(async () => {
  server = createApp({ store }).listen(0)
  await new Promise((resolve) => server.once('listening', resolve))
  const address = /** @type {import('node:net').AddressInfo} */ (server.address())
  base = `http://127.0.0.1:${address.port}`
})
after(() => server.close())
beforeEach(() => seed(store))

/** @param {string} path @param {{ method?: string, body?: unknown }} [options] */
async function call(path, { method = 'GET', body } = {}) {
  const res = await fetch(base + path, {
    method,
    headers: body === undefined ? {} : { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  })
  const text = await res.text()
  return { status: res.status, body: text ? JSON.parse(text) : undefined }
}

/** Every required field of the schema is present, recursively through $refs. @param {unknown} value @param {string} name */
function assertShape(value, name) {
  const schema = schemas[name]
  assert.ok(value && typeof value === 'object', `${name} is an object`)
  for (const field of schema.required ?? []) {
    assert.ok(field in /** @type {object} */ (value), `${name}.${field} is present`)
    const prop = schema.properties[field]
    const fieldValue = /** @type {any} */ (value)[field]
    if (prop.$ref) assertShape(fieldValue, prop.$ref.split('/').pop())
    if (prop.type === 'array' && prop.items.$ref) fieldValue.forEach((/** @type {unknown} */ v) => assertShape(v, prop.items.$ref.split('/').pop()))
    if (prop.enum) assert.ok(prop.enum.includes(fieldValue), `${name}.${field} "${fieldValue}" is in the enum`)
  }
}

const wardrobeInput = {
  name: 'Linen overshirt',
  brand: 'Northline',
  type: 'outerwear',
  color: 'Sand',
  season: 'summer',
  imageUrl: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600',
  notes: '',
  favorite: false,
}

describe('contract', () => {
  test('every operation in contracts/api.json is served', async () => {
    const ids = { outfitId: 'outfit-01', collectionId: 'collection-weekend', itemId: 'wardrobe-01' }
    for (const [path, item] of Object.entries(contract.paths)) {
      for (const method of Object.keys(item)) {
        const url = path.replace(/\{(\w+)\}/g, (_, name) => ids[/** @type {keyof typeof ids} */ (name)])
        const res = await fetch(base + url, { method: method.toUpperCase(), headers: { 'Content-Type': 'application/json' }, body: method === 'get' || method === 'delete' ? undefined : '{}' })
        const text = await res.text()
        assert.notEqual(text.includes('No such endpoint'), true, `${method.toUpperCase()} ${path} is routed`)
      }
    }
  })
})

describe('catalog', () => {
  test('lists categories in order with outfit counts', async () => {
    const { status, body } = await call('/categories')
    assert.equal(status, 200)
    assert.equal(body.length, 8)
    assert.equal(body[0].id, 'streetwear')
    body.forEach((/** @type {unknown} */ c) => assertShape(c, 'Category'))
    assert.equal(body.reduce((/** @type {number} */ n, /** @type {any} */ c) => n + c.outfitCount, 0), 30)
  })

  test('lists outfits by popularity by default', async () => {
    const { body } = await call('/outfits')
    assert.equal(body.length, 30)
    body.forEach((/** @type {unknown} */ o) => assertShape(o, 'Outfit'))
    for (let i = 1; i < body.length; i++) assert.ok(body[i - 1].likes >= body[i].likes)
  })

  test('sorts newest first', async () => {
    const { body } = await call('/outfits?sort=newest')
    for (let i = 1; i < body.length; i++) assert.ok(body[i - 1].createdAt >= body[i].createdAt)
  })

  test('searches title, tags, creators and item brands, case-insensitively', async () => {
    assert.deepEqual((await call('/outfits?search=TRENCH')).body.map((/** @type {any} */ o) => o.id), ['outfit-28'])
    assert.ok((await call('/outfits?search=indigo%20lab')).body.length > 3)
    assert.equal((await call('/outfits?search=zzzz')).body.length, 0)
  })

  test('combines category, season and occasion filters; allSeason matches every season', async () => {
    const { body } = await call('/outfits?categoryId=evening&season=winter&occasion=party')
    assert.deepEqual(body.map((/** @type {any} */ o) => o.id).sort(), ['outfit-24', 'outfit-26'])
  })

  test('rejects an unknown filter value', async () => {
    const { status, body } = await call('/outfits?season=monsoon')
    assert.equal(status, 400)
    assertShape(body, 'ErrorResponse')
  })

  test('gets one outfit, or 404', async () => {
    assertShape((await call('/outfits/outfit-05')).body, 'Outfit')
    assert.equal((await call('/outfits/nope')).status, 404)
  })
})

describe('collections', () => {
  test('lists seeded collections, most recently updated first, with covers', async () => {
    const { body } = await call('/collections')
    assert.deepEqual(body.map((/** @type {any} */ c) => c.id), ['collection-weekend', 'collection-office', 'collection-night-out'])
    body.forEach((/** @type {unknown} */ c) => assertShape(c, 'OutfitCollection'))
    assert.deepEqual(body[0].outfitIds, ['outfit-13', 'outfit-17', 'outfit-04', 'outfit-15'])
    assert.equal(body[0].coverImageUrls.length, 4)
  })

  test('create, rename, delete', async () => {
    const created = await call('/collections', { method: 'POST', body: { name: '  Holiday  ', description: '' } })
    assert.equal(created.status, 201)
    assert.equal(created.body.name, 'Holiday')
    assert.deepEqual(created.body.outfitIds, [])
    assert.equal((await call('/collections')).body[0].id, created.body.id)

    const renamed = await call(`/collections/${created.body.id}`, { method: 'PUT', body: { name: 'Holiday 2026', description: 'Sun' } })
    assert.equal(renamed.body.name, 'Holiday 2026')

    assert.equal((await call(`/collections/${created.body.id}`, { method: 'DELETE' })).status, 204)
    assert.equal((await call(`/collections/${created.body.id}`)).status, 404)
  })

  test('validates the name', async () => {
    assert.equal((await call('/collections', { method: 'POST', body: { name: '   ', description: '' } })).status, 400)
    assert.equal((await call('/collections', { method: 'POST', body: { name: 'x'.repeat(41), description: '' } })).status, 400)
  })

  test('adds an outfit to the front once, and removes it', async () => {
    const added = await call('/collections/collection-office/outfits', { method: 'POST', body: { outfitId: 'outfit-10' } })
    assert.equal(added.body.outfitIds[0], 'outfit-10')
    const again = await call('/collections/collection-office/outfits', { method: 'POST', body: { outfitId: 'outfit-10' } })
    assert.equal(again.body.outfitIds.length, 4)
    assert.equal((await call('/collections')).body[0].id, 'collection-office')

    const outfits = await call('/collections/collection-office/outfits')
    assert.equal(outfits.body[0].id, 'outfit-10')

    const removed = await call('/collections/collection-office/outfits/outfit-10', { method: 'DELETE' })
    assert.equal(removed.status, 200)
    assert.ok(!removed.body.outfitIds.includes('outfit-10'))
  })

  test('adding an unknown outfit is a validation error', async () => {
    assert.equal((await call('/collections/collection-office/outfits', { method: 'POST', body: { outfitId: 'nope' } })).status, 400)
  })

  test('deleting a collection keeps its outfits', async () => {
    await call('/collections/collection-weekend', { method: 'DELETE' })
    assert.equal((await call('/outfits/outfit-13')).status, 200)
  })
})

describe('wardrobe', () => {
  test('lists items newest first, and filters by type', async () => {
    const all = await call('/wardrobe')
    assert.equal(all.body.length, 10)
    all.body.forEach((/** @type {unknown} */ i) => assertShape(i, 'WardrobeItem'))
    assert.equal(all.body[0].id, 'wardrobe-01')
    const shoes = await call('/wardrobe?type=shoes')
    assert.ok(shoes.body.every((/** @type {any} */ i) => i.type === 'shoes'))
    assert.equal((await call('/wardrobe?type=hats')).status, 400)
  })

  test('create, update, delete', async () => {
    const created = await call('/wardrobe', { method: 'POST', body: wardrobeInput })
    assert.equal(created.status, 201)
    assertShape(created.body, 'WardrobeItem')
    assert.equal((await call('/wardrobe')).body[0].id, created.body.id)

    const updated = await call(`/wardrobe/${created.body.id}`, { method: 'PUT', body: { ...wardrobeInput, favorite: true, name: 'Linen shirt' } })
    assert.equal(updated.body.favorite, true)
    assert.equal(updated.body.name, 'Linen shirt')

    assert.equal((await call(`/wardrobe/${created.body.id}`, { method: 'DELETE' })).status, 204)
    assert.equal((await call(`/wardrobe/${created.body.id}`)).status, 404)
  })

  test('validates input', async () => {
    assert.equal((await call('/wardrobe', { method: 'POST', body: { ...wardrobeInput, name: '' } })).status, 400)
    assert.equal((await call('/wardrobe', { method: 'POST', body: { ...wardrobeInput, imageUrl: 'http://insecure' } })).status, 400)
    assert.equal((await call('/wardrobe', { method: 'POST', body: { ...wardrobeInput, type: 'hat' } })).status, 400)
  })

  test('serves the photo library grouped by type', async () => {
    const { body } = await call('/wardrobe/photos')
    assert.ok(body.length >= 30)
    body.forEach((/** @type {unknown} */ p) => assertShape(p, 'WardrobePhoto'))
    assert.equal(body[0].type, 'top')
  })
})
