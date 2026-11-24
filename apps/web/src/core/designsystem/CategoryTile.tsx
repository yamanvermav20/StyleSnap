import { Link } from '@tanstack/react-router'
import type { Category } from '#/generated/api'
import { RemotePhoto } from './RemotePhoto'

/** A style tile: portrait photo with the name on a scrim. */
export function CategoryTile({ category }: { category: Category }) {
  return (
    <Link
      to="/categories/$categoryId"
      params={{ categoryId: category.id }}
      data-testid={`categoryTile.${category.id}`}
      className="relative block w-category-tile shrink-0 snap-start overflow-hidden rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
    >
      <RemotePhoto src={category.imageUrl} alt="" className="aspect-4/5 w-full" />
      <span className="absolute inset-x-0 bottom-0 bg-linear-to-t from-scrim to-transparent px-sm pt-xl pb-sm text-label text-on-scrim">
        {category.name}
      </span>
    </Link>
  )
}
