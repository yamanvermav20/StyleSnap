import { createFileRoute } from '@tanstack/react-router'
import { documentTitle } from '#/core/documentTitle'
import { WardrobeEditorScreen } from '#/features/wardrobe/WardrobeEditorScreen'
import { strings } from '#/generated/strings'

export const Route = createFileRoute('/wardrobe/$itemId')({
  head: () => ({ meta: [{ title: documentTitle(strings.wardrobeEditorEditTitle) }] }),
  component: WardrobeItemRoute,
})

function WardrobeItemRoute() {
  const { itemId } = Route.useParams()
  return <WardrobeEditorScreen itemId={itemId} />
}
