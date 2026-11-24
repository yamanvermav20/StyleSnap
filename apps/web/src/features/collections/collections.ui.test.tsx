// @vitest-environment happy-dom
import { describe, expect, test } from 'vitest'
import { ApiError, type OutfitCollection } from '#/generated/api'
import { strings } from '#/generated/strings'
import { InMemoryCatalogRepository } from '#/features/catalog/InMemoryCatalogRepository'
import { click, renderApp, settle, testContainer, typeInto } from '#/testing/renderApp'
import { InMemoryCollectionsRepository } from './InMemoryCollectionsRepository'

class HangCollections extends InMemoryCollectionsRepository {
  release: () => void = () => {}
  private gate = new Promise<void>((resolve) => {
    this.release = resolve
  })
  override async list() {
    await this.gate
    return super.list()
  }
  override async get(collectionId: string) {
    await this.gate
    return super.get(collectionId)
  }
  override async listOutfits(collectionId: string) {
    await this.gate
    return super.listOutfits(collectionId)
  }
}

class FlakyCollections extends InMemoryCollectionsRepository {
  fail = true
  override async list() {
    if (this.fail) throw new ApiError(500, 'down')
    return super.list()
  }
  override async get(collectionId: string) {
    if (this.fail) throw new ApiError(500, 'down')
    return super.get(collectionId)
  }
  override async listOutfits(collectionId: string) {
    if (this.fail) throw new ApiError(500, 'down')
    return super.listOutfits(collectionId)
  }
}

function emptyCollection(): OutfitCollection {
  return {
    id: 'collection-empty',
    name: 'Empty box',
    description: '',
    outfitIds: [],
    coverImageUrls: [],
    createdAt: '2020-01-01T00:00:00.000Z',
    updatedAt: '2020-01-01T00:00:00.000Z',
  }
}

describe('Collections screens', () => {
  test('AC-collections-1: every collection, most recently updated, with collage, name and count', async () => {
    const app = await renderApp('/collections')
    const cards = [...app.element.querySelectorAll('[data-testid^="collectionCard."]')]
    expect(cards.map((card) => card.getAttribute('data-testid'))).toEqual(['collectionCard.collection-weekend'])
    expect(cards[0]?.textContent).toContain('Weekend edits')
    expect(cards[0]?.textContent).toContain(strings.commonOutfitCount(1))
    expect(cards[0]?.querySelector('img')).toBeTruthy()
    app.unmount()
  })

  test('AC-collections-2: an empty list offers an action that opens the editor', async () => {
    const catalog = new InMemoryCatalogRepository()
    const app = await renderApp(
      '/collections',
      testContainer({ collectionsRepository: new InMemoryCollectionsRepository((id) => catalog.peek(id), []) }),
    )
    expect(app.element.querySelector('[data-testid="state.empty"]')?.textContent).toContain(strings.collectionsEmptyTitle)
    expect(app.element.textContent).toContain(strings.collectionsEmptyBody)
    await click(app.element.querySelector('[data-testid="state.emptyAction"]'))
    expect(app.router.state.location.pathname).toBe('/collections/new')
    app.unmount()
  })

  test('AC-collections-3: creating a collection adds it to the top', async () => {
    const app = await renderApp('/collections')
    await click(app.element.querySelector('[data-testid="collections.add"]'))
    const name = app.element.querySelector<HTMLInputElement>('[data-testid="collectionEditor.name"]')
    await typeInto(name as HTMLInputElement, 'Night out')
    await click(app.element.querySelector('[data-testid="collectionEditor.save"]'))
    await settle()
    const cards = [...app.element.querySelectorAll('[data-testid^="collectionCard."]')]
    expect(cards[0]?.textContent).toContain('Night out')
    expect(app.router.state.location.pathname).toBe('/collections')
    app.unmount()
  })

  test('AC-collections-5: a collection opens with its name, description and outfits, newest first', async () => {
    const app = await renderApp('/collections')
    await click(app.element.querySelector('[data-testid="collectionCard.collection-weekend"]'))
    expect(app.router.state.location.pathname).toBe('/collections/collection-weekend')
    expect(app.element.querySelector('h1')?.textContent).toBe('Weekend edits')
    expect(app.element.textContent).toContain('Easy looks for slow Saturdays.')
    const cards = [...app.element.querySelectorAll('[data-testid^="outfitCard."]')]
    expect(cards.map((card) => card.getAttribute('data-testid'))).toEqual(['outfitCard.outfit-01'])
    app.unmount()
  })

  test('AC-collections-7: deleting asks, then removes the collection and returns to the list', async () => {
    const app = await renderApp('/collections/collection-weekend')
    await click(app.element.querySelector('[data-testid="collectionDetail.delete"]'))
    expect(app.element.textContent).toContain(strings.collectionDetailDeleteTitle)
    await click(app.element.querySelector('[data-testid="collectionDetail.confirmDelete"]'))
    await settle()
    expect(app.router.state.location.pathname).toBe('/collections')
    expect(app.element.querySelector('[data-testid="collectionCard.collection-weekend"]')).toBeNull()
    app.unmount()
  })

  test('AC-collections-9: loading, error, and an empty collection', async () => {
    const catalog = new InMemoryCatalogRepository()
    const hanging = new HangCollections((id) => catalog.peek(id))
    const loading = await renderApp('/collections', testContainer({ collectionsRepository: hanging }))
    expect(loading.element.querySelector('[data-testid="state.loading"]')).toBeTruthy()
    hanging.release()
    await settle()
    expect(loading.element.querySelector('[data-testid="collectionCard.collection-weekend"]')).toBeTruthy()
    loading.unmount()

    const flaky = new FlakyCollections((id) => catalog.peek(id))
    const failed = await renderApp('/collections/collection-weekend', testContainer({ collectionsRepository: flaky }))
    expect(failed.element.querySelector('[data-testid="state.error"]')).toBeTruthy()
    flaky.fail = false
    await click(failed.element.querySelector('[data-testid="state.retry"]'))
    expect(failed.element.querySelector('h1')?.textContent).toBe('Weekend edits')
    failed.unmount()

    const emptyRepo = new InMemoryCollectionsRepository((id) => catalog.peek(id), [emptyCollection()])
    const empty = await renderApp('/collections/collection-empty', testContainer({ collectionsRepository: emptyRepo }))
    expect(empty.element.querySelector('[data-testid="state.empty"]')?.textContent).toContain(strings.collectionDetailEmptyTitle)
    expect(empty.element.textContent).toContain(strings.collectionDetailEmptyBody)
    empty.unmount()
  })
})
