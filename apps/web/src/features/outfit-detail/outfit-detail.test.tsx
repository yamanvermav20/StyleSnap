// @vitest-environment happy-dom
import { describe, expect, test } from 'vitest'
import { ApiError } from '#/generated/api'
import { strings } from '#/generated/strings'
import { formatPrice } from '#/core/formatPrice'
import { itemTypeLabel, occasionLabel, seasonLabel } from '#/core/labels'
import { fixtureOutfits } from '#/features/catalog/fixture'
import { InMemoryCatalogRepository } from '#/features/catalog/InMemoryCatalogRepository'
import { click, renderApp, settle, testContainer } from '#/testing/renderApp'

class HangCatalog extends InMemoryCatalogRepository {
  release: () => void = () => {}
  private gate = new Promise<void>((resolve) => {
    this.release = resolve
  })
  override async getOutfit(outfitId: string) {
    await this.gate
    return super.getOutfit(outfitId)
  }
}

class FlakyCatalog extends InMemoryCatalogRepository {
  fail = true
  override async getOutfit(outfitId: string) {
    if (this.fail) throw new ApiError(500, 'down')
    return super.getOutfit(outfitId)
  }
}

describe('Outfit detail', () => {
  test('AC-outfit-detail-1: photos, position, title, creator, likes, description and tags', async () => {
    const app = await renderApp('/outfits/outfit-01')
    const outfit = fixtureOutfits()[0]
    const photos = app.element.querySelector('[data-testid="outfitDetail.photos"]')
    expect(photos?.querySelectorAll('img')).toHaveLength(3)
    expect(app.element.querySelector('[data-testid="outfitDetail.photoPosition"]')?.textContent).toBe(
      strings.outfitDetailPhotoPosition({ position: 1, total: 3 }),
    )
    expect(app.element.querySelector('h1')?.textContent).toBe(outfit?.title)
    expect(app.element.textContent).toContain(strings.feedByCreator({ name: outfit?.creatorName ?? '' }))
    expect(app.element.textContent).toContain(strings.commonLikes(outfit?.likes ?? 0))
    expect(app.element.textContent).toContain(outfit?.description)
    expect(app.element.textContent).toContain('blazer')
    const next = [...app.element.querySelectorAll('button')].find(
      (button) => button.getAttribute('aria-label') === strings.outfitDetailPhotoPosition({ position: 2, total: 3 }),
    )
    await click(next ?? null)
    expect(app.element.querySelector('[data-testid="outfitDetail.photoPosition"]')?.textContent).toBe(
      strings.outfitDetailPhotoPosition({ position: 2, total: 3 }),
    )
    app.unmount()
  })

  test('AC-outfit-detail-2: style, season and occasion, and style opens the category', async () => {
    const app = await renderApp('/outfits/outfit-01')
    const outfit = fixtureOutfits()[0]
    const style = app.element.querySelector('[data-testid="outfitDetail.category"]')
    expect(style?.textContent).toContain(strings.outfitDetailCategory)
    expect(style?.textContent).toContain(outfit?.categoryName)
    expect(app.element.textContent).toContain(seasonLabel(outfit?.season ?? 'summer'))
    expect(app.element.textContent).toContain(occasionLabel(outfit?.occasion ?? 'everyday'))
    await click(style ?? null)
    expect(app.router.state.location.pathname).toBe('/categories/streetwear')
    app.unmount()
  })

  test('AC-outfit-detail-3: every item with photo, name, brand, type and price', async () => {
    const app = await renderApp('/outfits/outfit-01')
    const items = app.element.querySelector('[data-testid="outfitDetail.items"]')
    for (const item of fixtureOutfits()[0]?.items ?? []) {
      expect(items?.textContent).toContain(item.name)
      expect(items?.textContent).toContain(item.brand)
      expect(items?.textContent).toContain(itemTypeLabel(item.type))
      expect(items?.textContent).toContain(formatPrice(item.price))
    }
    expect(items?.querySelectorAll('img')).toHaveLength(3)
    app.unmount()
  })

  test('AC-outfit-detail-5: Save or Saved, and the sheet checks collections that contain the outfit', async () => {
    const saved = await renderApp('/outfits/outfit-01')
    const savedButton = saved.element.querySelector('[data-testid="outfitDetail.save"]')
    expect(savedButton?.textContent).toContain(strings.outfitDetailSaved)
    await click(savedButton ?? null)
    const row = saved.element.querySelector('[data-testid="saveToCollection.row.collection-weekend"]')
    expect(row?.querySelector('svg')).toBeTruthy()
    saved.unmount()

    const fresh = await renderApp('/outfits/outfit-05')
    expect(fresh.element.querySelector('[data-testid="outfitDetail.save"]')?.textContent).toContain(strings.outfitDetailSave)
    fresh.unmount()
  })

  test('AC-outfit-detail-6: toggling a collection updates the check, the button and a toast', async () => {
    const app = await renderApp('/outfits/outfit-05')
    await click(app.element.querySelector('[data-testid="outfitDetail.save"]'))
    await click(app.element.querySelector('[data-testid="saveToCollection.row.collection-weekend"]'))
    await settle()
    expect(app.element.querySelector('[data-testid="toast"]')?.textContent).toBe(strings.saveToCollectionAdded({ name: 'Weekend edits' }))
    expect(app.element.querySelector('[data-testid="outfitDetail.save"]')?.textContent).toContain(strings.outfitDetailSaved)
    expect(app.element.querySelector('[data-testid="saveToCollection.row.collection-weekend"] svg')).toBeTruthy()
    app.unmount()
  })

  test('AC-outfit-detail-8: loading, error, and not found', async () => {
    const hanging = new HangCatalog()
    const loading = await renderApp('/outfits/outfit-01', testContainer({ catalogRepository: hanging }))
    expect(loading.element.querySelector('[data-testid="state.loading"]')).toBeTruthy()
    hanging.release()
    await settle()
    expect(loading.element.querySelector('h1')?.textContent).toBe('Orange Wall Street Edit')
    loading.unmount()

    const flaky = new FlakyCatalog()
    const failed = await renderApp('/outfits/outfit-01', testContainer({ catalogRepository: flaky }))
    expect(failed.element.querySelector('[data-testid="state.error"]')).toBeTruthy()
    flaky.fail = false
    await click(failed.element.querySelector('[data-testid="state.retry"]'))
    expect(failed.element.querySelector('h1')?.textContent).toBe('Orange Wall Street Edit')
    failed.unmount()

    const missing = await renderApp('/outfits/missing')
    expect(missing.element.textContent).toContain(strings.outfitDetailNotFound)
    expect(missing.element.querySelector('[data-testid="state.retry"]')).toBeNull()
    missing.unmount()
  })
})
