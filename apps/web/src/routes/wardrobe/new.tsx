import { createFileRoute } from '@tanstack/react-router'
import { documentTitle } from '#/core/documentTitle'
import { WardrobeEditorScreen } from '#/features/wardrobe/WardrobeEditorScreen'
import { strings } from '#/generated/strings'

export const Route = createFileRoute('/wardrobe/new')({
  head: () => ({ meta: [{ title: documentTitle(strings.wardrobeEditorCreateTitle) }] }),
  component: () => <WardrobeEditorScreen />,
})
