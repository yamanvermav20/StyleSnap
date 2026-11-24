import { createFileRoute } from '@tanstack/react-router'
import { documentTitle } from '#/core/documentTitle'
import { CollectionsScreen } from '#/features/collections/CollectionsScreen'
import { strings } from '#/generated/strings'

export const Route = createFileRoute('/collections/')({
  head: () => ({ meta: [{ title: documentTitle(strings.collectionsTitle) }] }),
  component: CollectionsScreen,
})
