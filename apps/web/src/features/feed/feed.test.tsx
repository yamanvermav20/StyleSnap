// @vitest-environment happy-dom
import { describe, expect, test } from 'vitest'
import { ApiError } from '#/generated/api'
import type { OutfitFilter } from '#/features/catalog/CatalogRepository'
import { strings } from '#/generated/strings'
import { fixtureCategories, fixtureOutfits } from '#/features/catalog/fixture'
import { InMemoryCatalogRepository } from '#/features/catalog/InMemoryCatalogRepository'
import { click, renderApp, settle } from '#/testing/renderApp'
import { testContainer } from '#/testing/renderApp'

class FlakyCatalog extends InMemoryCatalogRepository {
  fail = true
  override async listCategories() {
    if (this.fail) throw new ApiError(500, 'down')
    return super.listCategories()
  }
  override async listOutfits(filter: OutfitFilter = {}) {
    if (this.fail) throw new ApiError(500, 'down')
    return super.listOutfits(filter)
  }
}

class HangCatalog extends InMemoryCatalogRepository {
  release: () => void = () => {}
  private gate = new Promise<void>((resolve) => {
    this.release = resolve
  })
  override async listCategories() {
    await this.gate
    return super.listCategories()
  }
  override async listOutfits(filter: OutfitFilter = {}) {
    await this.gate
    return super.listOutfits(filter)
  }
}

describe('Feed', () => {
  test('AC-feed-1: four sections, starting on Discover', async () => {
    const app = await renderApp('/')
    expect(app.router.state.location.pathname).toBe('/')
    expect(app.element.querySelector('h1')?.textContent).toBe(strings.feedTitle)
    for (const id of ['tabs.discover', 'tabs.search', 'tabs.collections', 'tabs.wardrobe']) {
      expect(app.element.querySelector(`[data-testid="${id}"]`)).toBeTruthy()
    }
    expect(app.element.querySelector('[data-testid="tabs.discover"]')?.getAttribute('aria-current')).toBe('page')
    expect(app.element.querySelector('[data-testid="tabs.search"]')?.getAttribute('aria-current')).toBeNull()
    app.unmount()
  })

  test('AC-feed-2: every category tile, photo and name, in API order', async () => {
    const app = await renderApp('/')
    const tiles = [...app.element.querySelectorAll('[data-testid^="categoryTile."]')]
    expect(tiles.map((tile) => tile.getAttribute('data-testid'))).toEqual(['categoryTile.streetwear', 'categoryTile.minimal'])
    expect(tiles[0]?.textContent).toContain('Streetwear')
    expect(tiles[1]?.textContent).toContain('Minimal')
    expect(tiles[0]?.querySelector('img')?.getAttribute('src')).toBe(fixtureCategories()[0]?.imageUrl)
    app.unmount()
  })

  test('AC-feed-3: every outfit card, most liked first', async () => {
    const app = await renderApp('/')
    const cards = [...app.element.querySelectorAll('[data-testid^="outfitCard."]')]
    expect(cards.map((card) => card.getAttribute('data-testid'))).toEqual([
      'outfitCard.outfit-01',
      'outfitCard.outfit-05',
      'outfitCard.outfit-07',
    ])
    const first = fixtureOutfits()[0]
    expect(cards[0]?.textContent).toContain(first?.title)
    expect(cards[0]?.textContent).toContain(strings.feedByCreator({ name: first?.creatorName ?? '' }))
    expect(cards[0]?.textContent).toContain(strings.commonLikes(first?.likes ?? 0))
    expect(cards[0]?.querySelector('img')?.getAttribute('src')).toBe(first?.imageUrl)
    app.unmount()
  })

  test('AC-feed-4: a category tile opens that category', async () => {
    const app = await renderApp('/')
    await click(app.element.querySelector('[data-testid="categoryTile.minimal"]'))
    expect(app.router.state.location.pathname).toBe('/categories/minimal')
    expect(app.element.querySelector('h1')?.textContent).toBe('Minimal')
    app.unmount()
  })

  test('AC-feed-5: an outfit card opens that outfit', async () => {
    const app = await renderApp('/')
    await click(app.element.querySelector('[data-testid="outfitCard.outfit-05"] a'))
    expect(app.router.state.location.pathname).toBe('/outfits/outfit-05')
    expect(app.element.querySelector('h1')?.textContent).toBe('Ivory Blazer Set')
    app.unmount()
  })

  test('AC-feed-6: loading, then the error state, and Try again loads the content', async () => {
    const hanging = new HangCatalog()
    const loading = await renderApp('/', testContainer({ catalogRepository: hanging }))
    expect(loading.element.querySelector('[data-testid="state.loading"]')).toBeTruthy()
    await settle()
    hanging.release()
    await settle()
    expect(loading.element.querySelector('[data-testid="feed.outfits"]')).toBeTruthy()
    loading.unmount()

    const flaky = new FlakyCatalog()
    const app = await renderApp('/', testContainer({ catalogRepository: flaky }))
    expect(app.element.querySelector('[data-testid="state.error"]')?.textContent).toContain(strings.commonErrorTitle)
    expect(app.element.querySelector('[data-testid="state.error"]')?.textContent).toContain(strings.commonErrorBody)
    flaky.fail = false
    await click(app.element.querySelector('[data-testid="state.retry"]'))
    expect(app.element.querySelector('[data-testid="outfitCard.outfit-01"]')).toBeTruthy()
    app.unmount()
  })

  test('AC-feed-7: with no outfits, Feed shows its empty state', async () => {
    const app = await renderApp('/', testContainer({ catalogRepository: new InMemoryCatalogRepository([], fixtureCategories()) }))
    expect(app.element.querySelector('[data-testid="state.empty"]')?.textContent).toContain(strings.feedEmptyTitle)
    expect(app.element.textContent).toContain(strings.feedEmptyBody)
    expect(app.element.querySelector('[data-testid="feed.outfits"]')).toBeNull()
    app.unmount()
  })

  test('AC-feed-8: the Settings entry opens Settings', async () => {
    const app = await renderApp('/')
    const entry = app.element.querySelector('[data-testid="feed.openSettings"]')
    expect(entry?.getAttribute('aria-label')).toBe(strings.feedOpenSettings)
    await click(entry)
    expect(app.router.state.location.pathname).toBe('/settings')
    expect(app.element.textContent).toContain(strings.settingsTitle)
    app.unmount()
  })
})
