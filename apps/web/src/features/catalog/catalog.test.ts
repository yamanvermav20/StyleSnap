import { describe, expect, test } from 'vitest'
import { ApiError } from '#/generated/api'
import { strings } from '#/generated/strings'
import { formatPrice, formatPriceAmount } from '#/core/formatPrice'
import { ApiCatalogRepository } from './ApiCatalogRepository'
import { InMemoryCatalogRepository } from './InMemoryCatalogRepository'
import { filterOutfits } from './filterOutfits'
import { fixtureOutfits } from './fixture'

describe('Catalog', () => {
  test('AC-outfit-detail-4: prices format as whole dollars or two decimals', () => {
    expect(formatPriceAmount(189)).toBe('189')
    expect(formatPriceAmount(42)).toBe('42')
    expect(formatPriceAmount(42.5)).toBe('42.50')
    expect(formatPrice(189)).toBe(strings.commonPrice({ price: '189' }))
    expect(formatPrice(42.5)).toBe(strings.commonPrice({ price: '42.50' }))
  })

  test('AC-search-3: category, season, occasion and sort are sent with the text', async () => {
    const calls: string[] = []
    const original = globalThis.fetch
    globalThis.fetch = async (input) => {
      calls.push(String(input))
      return new Response(JSON.stringify([]), { status: 200 })
    }
    try {
      await new ApiCatalogRepository().listOutfits({
        search: 'linen',
        categoryId: 'minimal',
        season: 'spring',
        occasion: 'work',
        sort: 'newest',
      })
    } finally {
      globalThis.fetch = original
    }
    const url = calls[0] ?? ''
    expect(url).toContain('search=linen')
    expect(url).toContain('categoryId=minimal')
    expect(url).toContain('season=spring')
    expect(url).toContain('occasion=work')
    expect(url).toContain('sort=newest')

    const memory = new InMemoryCatalogRepository()
    const found = await memory.listOutfits({
      search: 'ivory',
      categoryId: 'minimal',
      season: 'spring',
      occasion: 'work',
      sort: 'newest',
    })
    expect(found.map((outfit) => outfit.id)).toEqual(['outfit-05'])

    const allSeason = fixtureOutfits()[0]
    allSeason.season = 'allSeason'
    allSeason.id = 'outfit-all'
    const seasonal = filterOutfits([allSeason, fixtureOutfits()[2]], { season: 'winter' })
    expect(seasonal.map((outfit) => outfit.id)).toEqual(['outfit-all'])
    await expect(new InMemoryCatalogRepository().getOutfit('missing')).rejects.toBeInstanceOf(ApiError)
  })

  test('orders popular by likes and newest by date, and matches brands case-insensitively', async () => {
    const repository = new InMemoryCatalogRepository()
    expect((await repository.listOutfits({ sort: 'popular' })).map((outfit) => outfit.id)).toEqual(['outfit-01', 'outfit-05', 'outfit-07'])
    expect((await repository.listOutfits({ sort: 'newest' })).map((outfit) => outfit.id)).toEqual(['outfit-01', 'outfit-05', 'outfit-07'])
    expect((await repository.listOutfits({ search: 'NORTHLINE' })).map((outfit) => outfit.id).sort()).toEqual(['outfit-01', 'outfit-05'])
  })
})
