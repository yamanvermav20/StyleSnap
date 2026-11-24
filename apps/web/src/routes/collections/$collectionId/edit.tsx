import { createFileRoute } from '@tanstack/react-router'
import { documentTitle } from '#/core/documentTitle'
import { CollectionEditorScreen } from '#/features/collections/CollectionEditorScreen'
import { strings } from '#/generated/strings'

export const Route = createFileRoute('/collections/$collectionId/edit')({
  head: () => ({ meta: [{ title: documentTitle(strings.collectionEditorEditTitle) }] }),
  component: EditCollectionRoute,
})

function EditCollectionRoute() {
  const { collectionId } = Route.useParams()
  return <CollectionEditorScreen collectionId={collectionId} />
}
