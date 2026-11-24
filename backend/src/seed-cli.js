import { config } from './config.js'
import { openDatabase } from './db.js'
import { seed } from './seed.js'
import { StyleStore } from './store.js'

const counts = seed(new StyleStore(openDatabase(config.databasePath)))
console.log(`Reset ${config.databasePath}: ${counts.categories} categories, ${counts.outfits} outfits, ${counts.collections} collections, ${counts.wardrobe} wardrobe items.`)
