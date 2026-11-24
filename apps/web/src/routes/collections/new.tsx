import { createFileRoute } from '@tanstack/react-router'
import { documentTitle } from '#/core/documentTitle'
import { CollectionEditorScreen } from '#/features/collections/CollectionEditorScreen'
import { strings } from '#/generated/strings'

export type NewCollectionSearch = { outfitId?: string }

function normalizeNewCollectionSearch(search: Record<string, unknown>): NewCollectionSearch {
  return typeof search.outfitId === 'string' && search.outfitId ? { outfitId: search.outfitId } : {}
}

export const Route = createFileRoute('/collections/new')({
  validateSearch: (search) => normalizeNewCollectionSearch(search),
  head: () => ({ meta: [{ title: documentTitle(strings.collectionEditorCreateTitle) }] }),
  component: NewCollectionRoute,
})

function NewCollectionRoute() {
  const { outfitId } = Route.useSearch()
  return <CollectionEditorScreen outfitId={outfitId} />
}
