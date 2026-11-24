import { createApp } from './app.js'
import { config } from './config.js'
import { openDatabase } from './db.js'
import { seed } from './seed.js'
import { StyleStore } from './store.js'

const store = new StyleStore(openDatabase(config.databasePath))
if (store.counts().outfits === 0) {
  const counts = seed(store)
  console.log(`Seeded ${counts.outfits} outfits, ${counts.collections} collections and ${counts.wardrobe} wardrobe items into ${config.databasePath}`)
}

const app = createApp({ store, openApiPath: config.openApiPath, log: true, delayMs: Number(process.env.DELAY_MS ?? 0) })
app.listen(config.port, () => {
  console.log(`StyleSnap API on http://127.0.0.1:${config.port} (OpenAPI at /openapi.json)`)
})
