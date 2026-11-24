import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider, createMemoryHistory, createRouter } from '@tanstack/react-router'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import type { AppContainer } from '#/core/AppContainer'
import { InMemoryCatalogRepository } from '#/features/catalog/InMemoryCatalogRepository'
import { InMemoryCollectionsRepository } from '#/features/collections/InMemoryCollectionsRepository'
import { InMemorySettingsRepository } from '#/features/settings/InMemorySettingsRepository'
import { InMemoryWardrobeRepository } from '#/features/wardrobe/InMemoryWardrobeRepository'
import { routeTree } from '#/routeTree.gen'

/**
 * The app's dependencies with in-memory implementations, for tests. Add each new repository
 * here, so every test that renders the app gets a complete container.
 */
export function testContainer(overrides: Partial<AppContainer> = {}): AppContainer {
  const catalogRepository = overrides.catalogRepository ?? new InMemoryCatalogRepository()
  const outfitById = catalogRepository instanceof InMemoryCatalogRepository ? (id: string) => catalogRepository.peek(id) : () => undefined
  return {
    settingsRepository: overrides.settingsRepository ?? new InMemorySettingsRepository(),
    catalogRepository,
    collectionsRepository: overrides.collectionsRepository ?? new InMemoryCollectionsRepository(outfitById),
    wardrobeRepository: overrides.wardrobeRepository ?? new InMemoryWardrobeRepository(),
  }
}

/**
 * Renders the whole app at `path` into the test's DOM, with the real routes and the given
 * dependencies. Use it in tests that start with `// @vitest-environment happy-dom` and drive
 * the UI: covering a (ui) acceptance criterion means clicking through this, not calling a view model.
 */
export async function renderApp(path: string, container: AppContainer = testContainer()) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: Infinity } },
  })
  const router = createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: [path] }),
    context: { queryClient, container },
  })
  await router.load()
  const element = document.createElement('div')
  document.body.append(element)
  const root = createRoot(element)
  await act(async () => {
    root.render(
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>,
    )
  })
  // Query updates are scheduled on a timer, so wait for the first result before the test looks.
  await settle()
  return {
    element,
    router,
    unmount: () => {
      act(() => root.unmount())
      element.remove()
    },
  }
}

/** Clicks an element and waits for the app to settle (navigation, queries). */
export async function click(element: Element | null) {
  await act(async () => {
    ;(element as HTMLElement | null)?.click()
  })
  await settle()
}

/** Sets a controlled input's value the way a user typing would. */
export async function typeInto(element: HTMLInputElement | HTMLTextAreaElement, value: string) {
  await act(async () => {
    const prototype = Object.getPrototypeOf(element) as HTMLInputElement
    Object.getOwnPropertyDescriptor(prototype, 'value')?.set?.call(element, value)
    element.dispatchEvent(new Event('input', { bubbles: true }))
  })
}

/** Chooses an option on a native select. */
export async function choose(element: HTMLSelectElement, value: string) {
  await act(async () => {
    Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value')?.set?.call(element, value)
    element.dispatchEvent(new Event('change', { bubbles: true }))
  })
}

/** Waits for timers (search debounce) and flushes the resulting render. */
export async function settle(ms = 50) {
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, ms))
  })
}
