import { createFileRoute } from '@tanstack/react-router'
import { documentTitle } from '#/core/documentTitle'
import { WardrobeScreen } from '#/features/wardrobe/WardrobeScreen'
import { strings } from '#/generated/strings'

export const Route = createFileRoute('/wardrobe/')({
  head: () => ({ meta: [{ title: documentTitle(strings.wardrobeTitle) }] }),
  component: WardrobeScreen,
})
