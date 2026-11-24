import { createFileRoute } from '@tanstack/react-router'
import { documentTitle } from '#/core/documentTitle'
import { CollectionDetailScreen } from '#/features/collections/CollectionDetailScreen'
import { strings } from '#/generated/strings'

export const Route = createFileRoute('/collections/$collectionId/')({
  head: () => ({ meta: [{ title: documentTitle(strings.collectionsTitle) }] }),
  component: CollectionRoute,
})

function CollectionRoute() {
  const { collectionId } = Route.useParams()
  return <CollectionDetailScreen collectionId={collectionId} />
}
