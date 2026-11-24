import { Link } from '@tanstack/react-router'
import type { Outfit } from '#/generated/api'
import { AppIcons } from '#/generated/icons'
import { strings } from '#/generated/strings'
import { iconButtonClass } from './styles'
import { RemotePhoto } from './RemotePhoto'

/** An outfit photo, title, creator and likes. Optional remove control for a collection. */
export function OutfitCard({ outfit, onRemove }: { outfit: Outfit; onRemove?: () => void }) {
  return (
    <article className="relative flex flex-col gap-sm" data-testid={`outfitCard.${outfit.id}`}>
      <Link
        to="/outfits/$outfitId"
        params={{ outfitId: outfit.id }}
        className="flex flex-col gap-sm rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        <RemotePhoto src={outfit.imageUrl} alt={outfit.title} className="aspect-3/4 w-full rounded-lg" />
        <span className="text-label text-on-surface">{outfit.title}</span>
        <span className="flex flex-col text-caption text-on-surface-variant">
          <span>{strings.feedByCreator({ name: outfit.creatorName })}</span>
          <span className="inline-flex items-center gap-xs">
            <AppIcons.likes className="size-icon-sm" />
            {strings.commonLikes(outfit.likes)}
          </span>
        </span>
      </Link>
      {onRemove ? (
        <button
          type="button"
          data-testid={`collectionDetail.remove.${outfit.id}`}
          aria-label={strings.collectionDetailRemoveOutfit}
          onClick={onRemove}
          className={`absolute end-sm top-sm bg-scrim text-on-scrim ${iconButtonClass}`}
        >
          <AppIcons.trash className="size-icon-sm" />
        </button>
      ) : null}
    </article>
  )
}

export function OutfitGrid({ testId, outfits, onRemove }: { testId: string; outfits: Outfit[]; onRemove?: (outfitId: string) => void }) {
  return (
    <ul data-testid={testId} className="grid grid-cols-2 gap-lg md:grid-cols-3 xl:grid-cols-4">
      {outfits.map((outfit) => (
        <li key={outfit.id}>
          <OutfitCard outfit={outfit} onRemove={onRemove ? () => onRemove(outfit.id) : undefined} />
        </li>
      ))}
    </ul>
  )
}
