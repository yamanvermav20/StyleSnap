import { Link } from '@tanstack/react-router'
import type { OutfitCollection } from '#/generated/api'
import { AppIcons } from '#/generated/icons'
import { strings } from '#/generated/strings'
import { RemotePhoto } from '#/core/designsystem/RemotePhoto'
import { StateMessage } from '#/core/designsystem/StateMessage'
import { ModalDialog } from '#/core/designsystem/ModalDialog'
import { secondaryButtonClass } from '#/core/designsystem/styles'

export function SaveToCollectionSheet({
  open,
  outfitId,
  collections,
  status,
  onToggle,
  onClose,
  onRetry,
}: {
  open: boolean
  outfitId: string
  collections: OutfitCollection[]
  status: 'loading' | 'error' | 'ready'
  onToggle: (collection: OutfitCollection) => void
  onClose: () => void
  onRetry: () => void
}) {
  if (!open) return null
  return (
    <ModalDialog testId="saveToCollection.sheet" labelledBy="save-to-collection-title" onClose={onClose}>
      <div className="flex items-start justify-between gap-md">
        <h2 id="save-to-collection-title" className="text-title">
          {strings.saveToCollectionTitle}
        </h2>
        <button type="button" data-testid="saveToCollection.done" onClick={onClose} className={secondaryButtonClass}>
          {strings.commonDone}
        </button>
      </div>
      {status === 'loading' ? <StateMessage variant="loading" /> : null}
      {status === 'error' ? <StateMessage variant="error" onRetry={onRetry} /> : null}
      {status === 'ready' && collections.length === 0 ? (
        <p className="mt-md text-body text-on-surface-variant">{strings.saveToCollectionEmptyBody}</p>
      ) : null}
      {status === 'ready' && collections.length > 0 ? (
        <ul className="mt-md flex max-h-hero-image flex-col gap-sm overflow-y-auto">
          {collections.map((collection) => {
            const contains = collection.outfitIds.includes(outfitId)
            const cover = collection.coverImageUrls[0]
            return (
              <li key={collection.id}>
                <button
                  type="button"
                  data-testid={`saveToCollection.row.${collection.id}`}
                  onClick={() => onToggle(collection)}
                  className="flex min-h-touch-target w-full items-center gap-md rounded-lg px-sm py-sm text-start hover:bg-surface-variant"
                >
                  {cover ? (
                    <RemotePhoto src={cover} alt="" className="size-thumbnail shrink-0 rounded-md" />
                  ) : (
                    <span className="flex size-thumbnail shrink-0 items-center justify-center rounded-md bg-surface-variant text-on-surface-variant">
                      <AppIcons.collections className="size-icon-md" />
                    </span>
                  )}
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="text-label">{collection.name}</span>
                    <span className="text-caption text-on-surface-variant">{strings.commonOutfitCount(collection.outfitIds.length)}</span>
                  </span>
                  {contains ? <AppIcons.check className="size-icon-md text-primary" /> : null}
                </button>
              </li>
            )
          })}
        </ul>
      ) : null}
      <Link
        to="/collections/new"
        search={{ outfitId }}
        data-testid="saveToCollection.new"
        className={`${secondaryButtonClass} mt-lg w-full`}
      >
        <AppIcons.add className="size-icon-sm" />
        {strings.saveToCollectionNewCollection}
      </Link>
    </ModalDialog>
  )
}
