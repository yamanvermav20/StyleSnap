import { readFileSync } from 'node:fs'
import express from 'express'
import { WARDROBE_PHOTOS } from './seed-data.js'
import {
  parseCollectionInput,
  parseCollectionOutfitInput,
  parseItemType,
  parseOutfitFilter,
  parseWardrobeItemInput,
  ValidationError,
} from './validation.js'

/** @param {import('express').Response} res @param {number} status @param {'validation' | 'notFound' | 'internal'} code @param {string} message */
function sendError(res, status, code, message) {
  res.status(status).json({ code, message })
}

/**
 * The StyleSnap API, exactly as contracts/api.json describes it.
 * @param {{ store: import('./store.js').StyleStore, openApiPath?: string, log?: boolean, delayMs?: number }} options
 */
export function createApp({ store, openApiPath, log = false, delayMs = 0 }) {
  const app = express()
  app.disable('x-powered-by')

  if (log) {
    app.use((req, res, next) => {
      const start = Date.now()
      res.on('finish', () => console.log(`${req.method} ${req.originalUrl} ${res.statusCode} ${Date.now() - start}ms`))
      next()
    })
  }

  // Any origin: the web app runs on its own dev and preview ports, and there are no cookies.
  app.use((req, res, next) => {
    res.set('Access-Control-Allow-Origin', '*')
    res.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    res.set('Access-Control-Allow-Headers', 'Content-Type')
    if (req.method === 'OPTIONS') return res.sendStatus(204)
    next()
  })

  // DELAY_MS slows every response, to look at loading states.
  if (delayMs > 0) app.use((_req, _res, next) => setTimeout(next, delayMs))

  app.use(express.json({ limit: '100kb' }))

  app.get('/health', (_req, res) => res.json({ status: 'ok', ...store.counts() }))

  if (openApiPath) {
    app.get('/openapi.json', (_req, res) => res.type('application/json').send(readFileSync(openApiPath, 'utf8')))
  }

  // Catalog

  app.get('/categories', (_req, res) => res.json(store.listCategories()))

  app.get('/outfits', (req, res) => {
    res.json(store.listOutfits(parseOutfitFilter(/** @type {Record<string, unknown>} */ (req.query))))
  })

  app.get('/outfits/:outfitId', (req, res) => {
    const outfit = store.getOutfit(req.params.outfitId)
    if (!outfit) return sendError(res, 404, 'notFound', 'No outfit has this id.')
    res.json(outfit)
  })

  // Collections

  app.get('/collections', (_req, res) => res.json(store.listCollections()))

  app.post('/collections', (req, res) => {
    res.status(201).json(store.createCollection(parseCollectionInput(req.body)))
  })

  app.get('/collections/:collectionId', (req, res) => {
    const collection = store.getCollection(req.params.collectionId)
    if (!collection) return sendError(res, 404, 'notFound', 'No collection has this id.')
    res.json(collection)
  })

  app.put('/collections/:collectionId', (req, res) => {
    const collection = store.updateCollection(req.params.collectionId, parseCollectionInput(req.body))
    if (!collection) return sendError(res, 404, 'notFound', 'No collection has this id.')
    res.json(collection)
  })

  app.delete('/collections/:collectionId', (req, res) => {
    if (!store.deleteCollection(req.params.collectionId)) return sendError(res, 404, 'notFound', 'No collection has this id.')
    res.sendStatus(204)
  })

  app.get('/collections/:collectionId/outfits', (req, res) => {
    const outfits = store.listCollectionOutfits(req.params.collectionId)
    if (!outfits) return sendError(res, 404, 'notFound', 'No collection has this id.')
    res.json(outfits)
  })

  app.post('/collections/:collectionId/outfits', (req, res) => {
    const { outfitId } = parseCollectionOutfitInput(req.body)
    const result = store.addOutfit(req.params.collectionId, outfitId)
    if (result === 'noCollection') return sendError(res, 404, 'notFound', 'No collection has this id.')
    if (result === 'noOutfit') return sendError(res, 400, 'validation', 'No outfit has this id.')
    res.json(result)
  })

  app.delete('/collections/:collectionId/outfits/:outfitId', (req, res) => {
    const collection = store.removeOutfit(req.params.collectionId, req.params.outfitId)
    if (!collection) return sendError(res, 404, 'notFound', 'No collection has this id.')
    res.json(collection)
  })

  // Wardrobe

  app.get('/wardrobe', (req, res) => res.json(store.listWardrobe(parseItemType(req.query.type))))

  app.post('/wardrobe', (req, res) => {
    res.status(201).json(store.createWardrobeItem(parseWardrobeItemInput(req.body)))
  })

  app.get('/wardrobe/photos', (_req, res) => res.json(WARDROBE_PHOTOS))

  app.get('/wardrobe/:itemId', (req, res) => {
    const item = store.getWardrobeItem(req.params.itemId)
    if (!item) return sendError(res, 404, 'notFound', 'No wardrobe item has this id.')
    res.json(item)
  })

  app.put('/wardrobe/:itemId', (req, res) => {
    const item = store.updateWardrobeItem(req.params.itemId, parseWardrobeItemInput(req.body))
    if (!item) return sendError(res, 404, 'notFound', 'No wardrobe item has this id.')
    res.json(item)
  })

  app.delete('/wardrobe/:itemId', (req, res) => {
    if (!store.deleteWardrobeItem(req.params.itemId)) return sendError(res, 404, 'notFound', 'No wardrobe item has this id.')
    res.sendStatus(204)
  })

  app.use((_req, res) => sendError(res, 404, 'notFound', 'No such endpoint.'))

  // Express needs all four arguments to treat this as the error handler.
  app.use((/** @type {any} */ err, /** @type {any} */ _req, /** @type {import('express').Response} */ res, /** @type {any} */ _next) => {
    if (err instanceof ValidationError) return sendError(res, 400, 'validation', err.message)
    if (err?.type === 'entity.parse.failed') return sendError(res, 400, 'validation', 'The body is not valid JSON.')
    console.error(err)
    sendError(res, 500, 'internal', 'Something went wrong on the server.')
  })

  return app
}
