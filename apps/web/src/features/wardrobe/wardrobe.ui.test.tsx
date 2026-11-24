// @vitest-environment happy-dom
import { describe, expect, test } from 'vitest'
import { ApiError, type WardrobeItem, type WardrobeItemInput } from '#/generated/api'
import { strings } from '#/generated/strings'
import { choose, click, renderApp, settle, testContainer, typeInto } from '#/testing/renderApp'
import { InMemoryWardrobeRepository } from './InMemoryWardrobeRepository'

class HangWardrobe extends InMemoryWardrobeRepository {
  release: () => void = () => {}
  private gate = new Promise<void>((resolve) => {
    this.release = resolve
  })
  override async list(type?: Parameters<InMemoryWardrobeRepository['list']>[0]) {
    await this.gate
    return super.list(type)
  }
  override async listPhotos() {
    await this.gate
    return super.listPhotos()
  }
}

class FlakyWardrobe extends InMemoryWardrobeRepository {
  fail = true
  override async list(type?: Parameters<InMemoryWardrobeRepository['list']>[0]) {
    if (this.fail) throw new ApiError(500, 'down')
    return super.list(type)
  }
}

class RejectCreate extends InMemoryWardrobeRepository {
  override async create(input: WardrobeItemInput): Promise<WardrobeItem> {
    throw new ApiError(500, input.name)
  }
}

describe('Wardrobe screens', () => {
  test('AC-wardrobe-1: every item, newest first, with photo, name, brand and a star for favorites', async () => {
    const app = await renderApp('/wardrobe')
    const cards = [...app.element.querySelectorAll('[data-testid^="wardrobeCard."]')]
    expect(cards.map((card) => card.getAttribute('data-testid'))).toEqual(['wardrobeCard.wardrobe-01', 'wardrobeCard.wardrobe-04'])
    expect(cards[0]?.textContent).toContain('White crew tee')
    expect(cards[0]?.textContent).toContain('Field & Co')
    expect(cards[0]?.querySelector('img')).toBeTruthy()
    expect(cards[0]?.querySelector('[aria-label="' + strings.wardrobeFavorite + '"]')).toBeTruthy()
    expect(cards[1]?.querySelector('[aria-label="' + strings.wardrobeFavorite + '"]')).toBeNull()
    expect(app.element.textContent).toContain(strings.commonItemCount(2))
    app.unmount()
  })

  test('AC-wardrobe-2: a type chip shows only that type, and All shows every item', async () => {
    const app = await renderApp('/wardrobe')
    await click(app.element.querySelector('[data-testid="wardrobe.filter.shoes"]'))
    await settle()
    const shoes = [...app.element.querySelectorAll('[data-testid^="wardrobeCard."]')]
    expect(shoes.map((card) => card.getAttribute('data-testid'))).toEqual(['wardrobeCard.wardrobe-04'])
    await click(app.element.querySelector('[data-testid="wardrobe.filter.all"]'))
    await settle()
    expect(app.element.querySelectorAll('[data-testid^="wardrobeCard."]')).toHaveLength(2)
    app.unmount()
  })

  test('AC-wardrobe-3: no items shows Add; a type with none shows the filtered empty state', async () => {
    const empty = await renderApp('/wardrobe', testContainer({ wardrobeRepository: new InMemoryWardrobeRepository([]) }))
    expect(empty.element.querySelector('[data-testid="state.empty"]')?.textContent).toContain(strings.wardrobeEmptyTitle)
    expect(empty.element.textContent).toContain(strings.wardrobeEmptyBody)
    await click(empty.element.querySelector('[data-testid="state.emptyAction"]'))
    expect(empty.router.state.location.pathname).toBe('/wardrobe/new')
    empty.unmount()

    const app = await renderApp('/wardrobe')
    await click(app.element.querySelector('[data-testid="wardrobe.filter.dress"]'))
    await settle()
    expect(app.element.querySelector('[data-testid="state.empty"]')?.textContent).toContain(strings.wardrobeEmptyFilteredTitle)
    expect(app.element.textContent).toContain(strings.wardrobeEmptyFilteredBody)
    app.unmount()
  })

  test('AC-wardrobe-4: Add opens the editor with defaults and photos of the selected type', async () => {
    const app = await renderApp('/wardrobe')
    await click(app.element.querySelector('[data-testid="wardrobe.add"]'))
    expect(app.element.querySelector('h1')?.textContent).toBe(strings.wardrobeEditorCreateTitle)
    const name = app.element.querySelector<HTMLInputElement>('[data-testid="wardrobeEditor.name"]')
    const type = app.element.querySelector<HTMLSelectElement>('[data-testid="wardrobeEditor.type"]')
    const season = app.element.querySelector<HTMLSelectElement>('[data-testid="wardrobeEditor.season"]')
    const favorite = app.element.querySelector<HTMLInputElement>('[data-testid="wardrobeEditor.favorite"]')
    expect(name?.value).toBe('')
    expect(type?.value).toBe('top')
    expect(season?.value).toBe('allSeason')
    expect(favorite?.checked).toBe(false)
    expect(app.element.querySelector('[data-testid="wardrobeEditor.photo.photo-whiteTee"]')).toBeTruthy()
    expect(app.element.querySelector('[data-testid="wardrobeEditor.photo.photo-whiteSneaker"]')).toBeNull()
    await choose(type as HTMLSelectElement, 'shoes')
    expect(app.element.querySelector('[data-testid="wardrobeEditor.photo.photo-whiteSneaker"]')).toBeTruthy()
    expect(app.element.querySelector('[data-testid="wardrobeEditor.photo.photo-whiteTee"]')).toBeNull()
    app.unmount()
  })

  test('AC-wardrobe-7: tapping an item opens it filled in, and saving updates it', async () => {
    const app = await renderApp('/wardrobe')
    await click(app.element.querySelector('[data-testid="wardrobeCard.wardrobe-01"]'))
    const name = app.element.querySelector<HTMLInputElement>('[data-testid="wardrobeEditor.name"]')
    expect(name?.value).toBe('White crew tee')
    expect(app.element.querySelector<HTMLInputElement>('[data-testid="wardrobeEditor.brand"]')?.value).toBe('Field & Co')
    expect(app.element.querySelector<HTMLInputElement>('[data-testid="wardrobeEditor.favorite"]')?.checked).toBe(true)
    await typeInto(name as HTMLInputElement, 'Updated tee')
    await click(app.element.querySelector('[data-testid="wardrobeEditor.save"]'))
    await settle()
    expect(app.router.state.location.pathname).toBe('/wardrobe')
    expect(app.element.querySelector('[data-testid="wardrobeCard.wardrobe-01"]')?.textContent).toContain('Updated tee')
    app.unmount()
  })

  test('AC-wardrobe-8: deleting asks, then removes the item', async () => {
    const app = await renderApp('/wardrobe/wardrobe-04')
    await click(app.element.querySelector('[data-testid="wardrobeEditor.delete"]'))
    expect(app.element.textContent).toContain(strings.wardrobeEditorDeleteTitle)
    await click(app.element.querySelector('[data-testid="wardrobeEditor.confirmDelete"]'))
    await settle()
    expect(app.router.state.location.pathname).toBe('/wardrobe')
    expect(app.element.querySelector('[data-testid="wardrobeCard.wardrobe-04"]')).toBeNull()
    expect(app.element.querySelector('[data-testid="wardrobeCard.wardrobe-01"]')).toBeTruthy()
    app.unmount()
  })

  test('AC-wardrobe-9: loading, error, and a failed save keeps the editor open', async () => {
    const hanging = new HangWardrobe()
    const loading = await renderApp('/wardrobe', testContainer({ wardrobeRepository: hanging }))
    expect(loading.element.querySelector('[data-testid="state.loading"]')).toBeTruthy()
    hanging.release()
    await settle()
    expect(loading.element.querySelector('[data-testid="wardrobeCard.wardrobe-01"]')).toBeTruthy()
    loading.unmount()

    const flaky = new FlakyWardrobe()
    const failed = await renderApp('/wardrobe', testContainer({ wardrobeRepository: flaky }))
    expect(failed.element.querySelector('[data-testid="state.error"]')).toBeTruthy()
    flaky.fail = false
    await click(failed.element.querySelector('[data-testid="state.retry"]'))
    expect(failed.element.querySelector('[data-testid="wardrobeCard.wardrobe-01"]')).toBeTruthy()
    failed.unmount()

    const missing = await renderApp('/wardrobe/missing')
    expect(missing.element.textContent).toContain(strings.wardrobeEditorNotFound)
    missing.unmount()

    const rejecting = new RejectCreate()
    const editor = await renderApp('/wardrobe/new', testContainer({ wardrobeRepository: rejecting }))
    await settle()
    const name = editor.element.querySelector<HTMLInputElement>('[data-testid="wardrobeEditor.name"]')
    await typeInto(name as HTMLInputElement, 'Camel coat')
    await click(editor.element.querySelector('[data-testid="wardrobeEditor.photo.photo-whiteTee"]'))
    await click(editor.element.querySelector('[data-testid="wardrobeEditor.save"]'))
    await settle()
    expect(editor.router.state.location.pathname).toBe('/wardrobe/new')
    expect(editor.element.querySelector('[data-testid="wardrobeEditor.error"]')?.textContent).toBe(strings.commonSaveFailed)
    editor.unmount()
  })
})
