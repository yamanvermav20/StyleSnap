import { Link, useNavigate } from '@tanstack/react-router'
import type { OutfitCollection } from '#/generated/api'
import { AppIcons } from '#/generated/icons'
import { strings } from '#/generated/strings'
import { Page } from '#/core/designsystem/Page'
import { RemotePhoto } from '#/core/designsystem/RemotePhoto'
import { StateMessage } from '#/core/designsystem/StateMessage'
import { primaryButtonClass } from '#/core/designsystem/styles'
import { useCollectionsViewModel } from './useCollectionsViewModel'

function CoverCollage({ collection }: { collection: OutfitCollection }) {
  const covers = collection.coverImageUrls.slice(0, 4)
  if (covers.length === 0) {
    return (
      <div className="flex aspect-square items-center justify-center rounded-lg bg-surface-variant text-on-surface-variant">
        <AppIcons.collections className="size-icon-lg" />
      </div>
    )
  }
  return (
    <div className="grid aspect-square grid-cols-2 grid-rows-2 gap-xs overflow-hidden rounded-lg">
      {Array.from({ length: 4 }, (_, index) =>
        covers[index] ? (
          <RemotePhoto key={covers[index]} src={covers[index]} alt="" className="h-full min-h-0" />
        ) : (
          <div key={index} className="bg-surface-variant" />
        ),
      )}
    </div>
  )
}

export function CollectionsScreen() {
  const viewModel = useCollectionsViewModel()
  const navigate = useNavigate()

  return (
    <Page width="full">
      <div className="flex flex-wrap items-center justify-between gap-md">
        <h1 className="text-headline">{strings.collectionsTitle}</h1>
        <Link to="/collections/new" data-testid="collections.add" className={primaryButtonClass}>
          <AppIcons.add className="size-icon-sm" />
          {strings.collectionsAdd}
        </Link>
      </div>
      {viewModel.status === 'loading' ? <StateMessage variant="loading" /> : null}
      {viewModel.status === 'error' ? <StateMessage variant="error" onRetry={viewModel.retry} /> : null}
      {viewModel.status === 'ready' && viewModel.collections.length === 0 ? (
        <StateMessage
          variant="empty"
          icon={<AppIcons.collections className="size-icon-lg" />}
          title={strings.collectionsEmptyTitle}
          body={strings.collectionsEmptyBody}
          action={{ label: strings.collectionsEmptyAction, onClick: () => void navigate({ to: '/collections/new' }) }}
        />
      ) : null}
      {viewModel.status === 'ready' && viewModel.collections.length > 0 ? (
        <ul data-testid="collections.list" className="grid grid-cols-2 gap-lg md:grid-cols-3 xl:grid-cols-4">
          {viewModel.collections.map((collection) => (
            <li key={collection.id}>
              <Link
                to="/collections/$collectionId"
                params={{ collectionId: collection.id }}
                data-testid={`collectionCard.${collection.id}`}
                className="flex flex-col gap-sm rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                <CoverCollage collection={collection} />
                <span className="text-label">{collection.name}</span>
                <span className="text-caption text-on-surface-variant">{strings.commonOutfitCount(collection.outfitIds.length)}</span>
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
    </Page>
  )
}
