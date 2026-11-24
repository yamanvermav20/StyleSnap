// @vitest-environment happy-dom
import { describe, expect, test } from 'vitest'
import { ApiError, type Outfit } from '#/generated/api'
import type { OutfitFilter } from '#/features/catalog/CatalogRepository'
import { strings } from '#/generated/strings'
import { fixtureOutfits } from '#/features/catalog/fixture'
import { InMemoryCatalogRepository } from '#/features/catalog/InMemoryCatalogRepository'
import { choose, click, renderApp, settle, testContainer, typeInto } from '#/testing/renderApp'
import { SEARCH_DEBOUNCE_MS } from './searchQuery'

class FlakyCatalog extends InMemoryCatalogRepository {
  fail = true
  override async listOutfits(filter: OutfitFilter = {}) {
    if (this.fail) throw new ApiError(500, 'down')
    return super.listOutfits(filter)
  }
}

class GateCatalog extends InMemoryCatalogRepository {
  pending = new Map<string, (outfits: Outfit[]) => void>()
  override async listOutfits(filter: OutfitFilter = {}) {
    const search = filter.search ?? ''
    if (search === 'first' || search === 'second') {
      return new Promise<Outfit[]>((resolve) => {
        this.pending.set(search, resolve)
      })
    }
    return super.listOutfits(filter)
  }
}

const named = (title: string): Outfit => ({ ...(fixtureOutfits()[0] as Outfit), id: title, title })

describe('Search', () => {
  test('AC-search-1: with no text and no filters, Search shows every outfit and the count', async () => {
    const app = await renderApp('/search')
    expect(app.element.querySelector('[data-testid="search.resultCount"]')?.textContent).toBe(strings.searchResultCount(3))
    expect(app.element.querySelectorAll('[data-testid^="outfitCard."]')).toHaveLength(3)
    app.unmount()
  })

  test('AC-search-2: typing shows matches after a short pause', async () => {
    const app = await renderApp('/search')
    const field = app.element.querySelector<HTMLInputElement>('[data-testid="search.field"]')
    expect(field).toBeTruthy()
    await typeInto(field as HTMLInputElement, 'ivory')
    await settle(SEARCH_DEBOUNCE_MS / 3)
    expect(app.element.querySelectorAll('[data-testid^="outfitCard."]')).toHaveLength(3)
    await settle(SEARCH_DEBOUNCE_MS)
    expect(app.element.querySelectorAll('[data-testid^="outfitCard."]')).toHaveLength(1)
    expect(app.element.textContent).toContain('Ivory Blazer Set')
    app.unmount()
  })

  test('AC-search-4: Clear filters appears when a filter is set, resets filters and keeps the text', async () => {
    const app = await renderApp('/search')
    const field = app.element.querySelector<HTMLInputElement>('[data-testid="search.field"]')
    await typeInto(field as HTMLInputElement, 'blazer')
    await settle(SEARCH_DEBOUNCE_MS)
    expect(app.element.querySelector('[data-testid="search.clearFilters"]')).toBeNull()
    const season = app.element.querySelector<HTMLSelectElement>('[data-testid="search.filter.season"]')
    await choose(season as HTMLSelectElement, 'summer')
    expect(app.element.querySelector('[data-testid="search.clearFilters"]')).toBeTruthy()
    await click(app.element.querySelector('[data-testid="search.clearFilters"]'))
    expect(app.element.querySelector('[data-testid="search.clearFilters"]')).toBeNull()
    expect(season?.value).toBe('')
    expect(field?.value).toBe('blazer')
    app.unmount()
  })

  test('AC-search-5: with no results, Search shows its empty state', async () => {
    const app = await renderApp('/search')
    const field = app.element.querySelector<HTMLInputElement>('[data-testid="search.field"]')
    await typeInto(field as HTMLInputElement, 'zzzz-no-match')
    await settle(SEARCH_DEBOUNCE_MS)
    expect(app.element.querySelector('[data-testid="state.empty"]')?.textContent).toContain(strings.searchEmptyTitle)
    expect(app.element.textContent).toContain(strings.searchEmptyBody)
    app.unmount()
  })

  test('AC-search-6: tapping a result opens Outfit detail', async () => {
    const app = await renderApp('/search')
    await click(app.element.querySelector('[data-testid="outfitCard.outfit-07"] a'))
    expect(app.router.state.location.pathname).toBe('/outfits/outfit-07')
    app.unmount()
  })

  test('AC-search-7: an older request never replaces a newer one', async () => {
    const catalog = new GateCatalog()
    const app = await renderApp('/search', testContainer({ catalogRepository: catalog }))
    const field = app.element.querySelector<HTMLInputElement>('[data-testid="search.field"]')
    await typeInto(field as HTMLInputElement, 'first')
    await settle(SEARCH_DEBOUNCE_MS)
    await typeInto(field as HTMLInputElement, 'second')
    await settle(SEARCH_DEBOUNCE_MS)
    catalog.pending.get('first')?.([named('Stale Result')])
    await settle()
    expect(app.element.textContent).not.toContain('Stale Result')
    catalog.pending.get('second')?.([named('Fresh Result')])
    await settle()
    expect(app.element.textContent).toContain('Fresh Result')
    expect(app.element.textContent).not.toContain('Stale Result')
    app.unmount()
  })

  test('AC-search-8: the error state, and Try again searches again', async () => {
    const flaky = new FlakyCatalog()
    const app = await renderApp('/search', testContainer({ catalogRepository: flaky }))
    expect(app.element.querySelector('[data-testid="state.error"]')).toBeTruthy()
    flaky.fail = false
    await click(app.element.querySelector('[data-testid="state.retry"]'))
    expect(app.element.querySelector('[data-testid="search.resultCount"]')?.textContent).toBe(strings.searchResultCount(3))
    app.unmount()
  })
})
