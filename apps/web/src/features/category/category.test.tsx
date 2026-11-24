// @vitest-environment happy-dom
import { describe, expect, test } from 'vitest'
import { ApiError, type Category } from '#/generated/api'
import type { OutfitFilter } from '#/features/catalog/CatalogRepository'
import { strings } from '#/generated/strings'
import { fixtureCategories, fixtureOutfits } from '#/features/catalog/fixture'
import { InMemoryCatalogRepository } from '#/features/catalog/InMemoryCatalogRepository'
import { click, renderApp, settle, testContainer } from '#/testing/renderApp'

class FlakyCatalog extends InMemoryCatalogRepository {
  fail = true
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

describe('Category', () => {
  test('AC-category-1: name, description and only that style, most liked first', async () => {
    const app = await renderApp('/categories/minimal')
    expect(app.element.querySelector('h1')?.textContent).toBe('Minimal')
    expect(app.element.textContent).toContain(fixtureCategories()[1]?.description)
    expect(app.element.textContent).toContain(strings.commonOutfitCount(2))
    const cards = [...app.element.querySelectorAll('[data-testid^="outfitCard."]')]
    expect(cards.map((card) => card.getAttribute('data-testid'))).toEqual(['outfitCard.outfit-05', 'outfitCard.outfit-07'])
    app.unmount()
  })

  test('AC-category-2: an outfit card opens its outfit', async () => {
    const app = await renderApp('/categories/streetwear')
    await click(app.element.querySelector('[data-testid="outfitCard.outfit-01"] a'))
    expect(app.router.state.location.pathname).toBe('/outfits/outfit-01')
    app.unmount()
  })

  test('AC-category-3: loading, error with Try again, and the empty state', async () => {
    const hanging = new HangCatalog()
    const loading = await renderApp('/categories/minimal', testContainer({ catalogRepository: hanging }))
    expect(loading.element.querySelector('[data-testid="state.loading"]')).toBeTruthy()
    hanging.release()
    await settle()
    expect(loading.element.querySelector('h1')?.textContent).toBe('Minimal')
    loading.unmount()

    const flaky = new FlakyCatalog()
    const failed = await renderApp('/categories/minimal', testContainer({ catalogRepository: flaky }))
    expect(failed.element.querySelector('[data-testid="state.error"]')).toBeTruthy()
    flaky.fail = false
    await click(failed.element.querySelector('[data-testid="state.retry"]'))
    expect(failed.element.querySelector('[data-testid="outfitCard.outfit-05"]')).toBeTruthy()
    failed.unmount()

    const quiet: Category = {
      id: 'quiet',
      name: 'Quiet',
      description: 'Nothing here.',
      imageUrl: fixtureCategories()[0]?.imageUrl ?? '',
      outfitCount: 0,
    }
    const empty = await renderApp(
      '/categories/quiet',
      testContainer({ catalogRepository: new InMemoryCatalogRepository(fixtureOutfits(), [...fixtureCategories(), quiet]) }),
    )
    expect(empty.element.querySelector('[data-testid="state.empty"]')?.textContent).toContain(strings.categoryEmptyTitle)
    expect(empty.element.textContent).toContain(strings.categoryEmptyBody)
    empty.unmount()

    const missing = await renderApp('/categories/missing')
    expect(missing.element.querySelector('[data-testid="state.error"]')).toBeTruthy()
    missing.unmount()
  })
})
