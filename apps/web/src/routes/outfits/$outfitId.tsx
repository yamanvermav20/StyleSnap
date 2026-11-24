import { createFileRoute } from '@tanstack/react-router'
import { documentTitle } from '#/core/documentTitle'
import { OutfitDetailScreen } from '#/features/outfit-detail/OutfitDetailScreen'
import { strings } from '#/generated/strings'

export const Route = createFileRoute('/outfits/$outfitId')({
  head: () => ({ meta: [{ title: documentTitle(strings.outfitDetailTitle) }] }),
  component: OutfitRoute,
})

function OutfitRoute() {
  const { outfitId } = Route.useParams()
  return <OutfitDetailScreen outfitId={outfitId} />
}
