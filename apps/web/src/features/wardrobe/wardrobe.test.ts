import { describe, expect, test } from 'vitest'
import { strings } from '#/generated/strings'
import { normalizeWardrobeInput, wardrobeDraftError } from './WardrobeRepository'
import { InMemoryWardrobeRepository } from './InMemoryWardrobeRepository'

const input = {
  name: 'Camel coat',
  brand: 'Wool & Wren',
  type: 'outerwear' as const,
  color: 'Camel',
  season: 'winter' as const,
  imageUrl: 'https://images.unsplash.com/photo-1544022613-e87ca75a784a',
  notes: 'Warm',
  favorite: true,
}

describe('Wardrobe', () => {
  test('AC-wardrobe-5: saving a new item with a name and a photo puts it first', async () => {
    const repository = new InMemoryWardrobeRepository()
    const created = await repository.create(input)
    const items = await repository.list()
    expect(items[0]?.id).toBe(created.id)
    expect(items[0]?.name).toBe('Camel coat')
    expect(items[0]?.favorite).toBe(true)
    expect((await repository.list('outerwear')).map((item) => item.id)).toEqual([created.id])
  })

  test('AC-wardrobe-6: the editor rejects a missing name or photo without saving', async () => {
    const repository = new InMemoryWardrobeRepository()
    const before = (await repository.list()).length
    expect(wardrobeDraftError('   ', input.imageUrl)).toBe('name')
    expect(wardrobeDraftError('Camel coat', '')).toBe('photo')
    expect(wardrobeDraftError('Camel coat', input.imageUrl)).toBeNull()
    expect(() => normalizeWardrobeInput({ ...input, name: '  ' })).toThrow()
    expect(() => normalizeWardrobeInput({ ...input, imageUrl: 'http://insecure.example/a.jpg' })).toThrow()
    expect((await repository.list()).length).toBe(before)
    expect(strings.wardrobeEditorNameRequired.length).toBeGreaterThan(0)
    expect(strings.wardrobeEditorPhotoRequired.length).toBeGreaterThan(0)
  })
})
