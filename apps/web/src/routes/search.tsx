import { createFileRoute } from '@tanstack/react-router'
import { documentTitle } from '#/core/documentTitle'
import { SearchScreen } from '#/features/search/SearchScreen'
import { normalizeSearch } from '#/features/search/searchQuery'
import { strings } from '#/generated/strings'

export const Route = createFileRoute('/search')({
  validateSearch: (search) => normalizeSearch(search),
  head: () => ({ meta: [{ title: documentTitle(strings.searchTitle) }] }),
  component: SearchScreen,
})
