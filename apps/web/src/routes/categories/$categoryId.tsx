import { createFileRoute } from '@tanstack/react-router'
import { documentTitle } from '#/core/documentTitle'
import { CategoryScreen } from '#/features/category/CategoryScreen'
import { strings } from '#/generated/strings'

export const Route = createFileRoute('/categories/$categoryId')({
  head: () => ({ meta: [{ title: documentTitle(strings.feedCategoriesTitle) }] }),
  component: CategoryRoute,
})

function CategoryRoute() {
  const { categoryId } = Route.useParams()
  return <CategoryScreen categoryId={categoryId} />
}
