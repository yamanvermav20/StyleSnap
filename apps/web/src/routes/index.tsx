import { createFileRoute } from '@tanstack/react-router'
import { documentTitle } from '#/core/documentTitle'
import { FeedScreen } from '#/features/feed/FeedScreen'
import { strings } from '#/generated/strings'

export const Route = createFileRoute('/')({
  head: () => ({ meta: [{ title: documentTitle(strings.feedTitle) }] }),
  component: FeedScreen,
})
