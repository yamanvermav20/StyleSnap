import { describe, expect, test } from 'vitest'
import { ApiError } from '#/generated/api'
import { strings } from '#/generated/strings'
import { InMemoryCatalogRepository } from '#/features/catalog/InMemoryCatalogRepository'
import { applyCollectionSave } from './useCollectionsViewModel'
import { InMemoryCollectionsRepository } from './InMemoryCollectionsRepository'
import { parseCollectionDraft } from './CollectionsRepository'

function repository() {
  const catalog = new InMemoryCatalogRepository()
  return new InMemoryCollectionsRepository((id) => catalog.peek(id))
}

describe('Collections', () => {
  test('AC-collections-4: the editor rejects an empty name and a name over 40 characters without saving', async () => {
    const collections = repository()
    const before = (await collections.list()).map((collection) => collection.id)
    expect(parseCollectionDraft('   ', 'notes').ok).toBe(false)
    expect(parseCollectionDraft('a'.repeat(41), '').ok).toBe(false)
    const empty = await applyCollectionSave(collections, { name: '   ', description: 'kept' })
    const long = await applyCollectionSave(collections, { name: 'a'.repeat(41), description: '' })
    expect(empty.ok).toBe(false)
    if (!empty.ok) expect(empty.error).toBe(strings.collectionEditorNameRequired)
    expect(long.ok).toBe(false)
    if (!long.ok) expect(long.error).toBe(strings.collectionEditorNameTooLong)
    expect((await collections.list()).map((collection) => collection.id)).toEqual(before)
  })

  test('AC-collections-6: editing a collection saves the new name and description', async () => {
    const collections = repository()
    const saved = await applyCollectionSave(
      collections,
      { name: '  Saturday  ', description: '  Slow morning  ' },
      { collectionId: 'collection-weekend' },
    )
    expect(saved.ok).toBe(true)
    const updated = await collections.get('collection-weekend')
    expect(updated.name).toBe('Saturday')
    expect(updated.description).toBe('Slow morning')
  })

  test('AC-collections-8: removing an outfit takes it out of the collection', async () => {
    const collections = repository()
    await collections.removeOutfit('collection-weekend', 'outfit-01')
    expect(await collections.listOutfits('collection-weekend')).toEqual([])
    expect((await collections.get('collection-weekend')).outfitIds).toEqual([])
  })

  test('AC-collections-10: a failed save keeps the error and does not pretend it worked', async () => {
    const collections = repository()
    collections.create = () => Promise.reject(new ApiError(500, 'down'))
    const result = await applyCollectionSave(collections, { name: 'Night out', description: '' })
    expect(result).toEqual({ ok: false, error: strings.commonSaveFailed })
    expect((await collections.list()).some((collection) => collection.name === 'Night out')).toBe(false)
  })

  test('AC-outfit-detail-7: new collection from Save creates it and adds the outfit', async () => {
    const catalog = new InMemoryCatalogRepository()
    const collections = new InMemoryCollectionsRepository((id) => catalog.peek(id), [])
    const result = await applyCollectionSave(collections, { name: 'Night out', description: 'Late' }, { outfitId: 'outfit-05' })
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.added).toBe(true)
    expect(result.collection.outfitIds).toEqual(['outfit-05'])
    expect((await collections.list())[0]?.name).toBe('Night out')
    expect((await collections.listOutfits(result.collection.id)).map((outfit) => outfit.id)).toEqual(['outfit-05'])
  })
})
