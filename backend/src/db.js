import { mkdirSync } from 'node:fs'
import path from 'node:path'
import { DatabaseSync } from 'node:sqlite'

const SEASONS = `'spring', 'summer', 'fall', 'winter', 'allSeason'`
const ITEM_TYPES = `'top', 'bottom', 'dress', 'outerwear', 'shoes', 'accessory'`

const SCHEMA = `
CREATE TABLE IF NOT EXISTS categories (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  description TEXT NOT NULL,
  image_url   TEXT NOT NULL,
  position    INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS outfits (
  id           TEXT PRIMARY KEY,
  title        TEXT NOT NULL,
  description  TEXT NOT NULL,
  image_url    TEXT NOT NULL,
  gallery      TEXT NOT NULL,
  category_id  TEXT NOT NULL REFERENCES categories (id),
  creator_name TEXT NOT NULL,
  season       TEXT NOT NULL CHECK (season IN (${SEASONS})),
  occasion     TEXT NOT NULL CHECK (occasion IN ('everyday', 'work', 'party', 'date', 'travel', 'sport')),
  tags         TEXT NOT NULL,
  likes        INTEGER NOT NULL,
  items        TEXT NOT NULL,
  search_text  TEXT NOT NULL,
  created_at   TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS outfits_category ON outfits (category_id);
CREATE TABLE IF NOT EXISTS collections (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  created_at  TEXT NOT NULL,
  updated_at  TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS collection_outfits (
  collection_id TEXT NOT NULL REFERENCES collections (id) ON DELETE CASCADE,
  outfit_id     TEXT NOT NULL REFERENCES outfits (id) ON DELETE CASCADE,
  added_at      TEXT NOT NULL,
  PRIMARY KEY (collection_id, outfit_id)
);
CREATE TABLE IF NOT EXISTS wardrobe_items (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  brand       TEXT NOT NULL DEFAULT '',
  type        TEXT NOT NULL CHECK (type IN (${ITEM_TYPES})),
  color       TEXT NOT NULL DEFAULT '',
  season      TEXT NOT NULL CHECK (season IN (${SEASONS})),
  image_url   TEXT NOT NULL,
  notes       TEXT NOT NULL DEFAULT '',
  favorite    INTEGER NOT NULL DEFAULT 0,
  created_at  TEXT NOT NULL,
  updated_at  TEXT NOT NULL
);
`

/**
 * Opens (and creates if needed) the SQLite database. Pass ":memory:" for a throwaway one.
 * @param {string} file
 */
export function openDatabase(file) {
  if (file !== ':memory:') mkdirSync(path.dirname(file), { recursive: true })
  const db = new DatabaseSync(file)
  db.exec('PRAGMA journal_mode = WAL;')
  db.exec('PRAGMA foreign_keys = ON;')
  db.exec(SCHEMA)
  return db
}
