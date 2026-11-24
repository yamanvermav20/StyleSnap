import { Link, useNavigate } from '@tanstack/react-router'
import { ITEM_TYPES, itemTypeLabel } from '#/core/labels'
import { FilterChip } from '#/core/designsystem/FilterChip'
import { Page } from '#/core/designsystem/Page'
import { RemotePhoto } from '#/core/designsystem/RemotePhoto'
import { StateMessage } from '#/core/designsystem/StateMessage'
import { primaryButtonClass } from '#/core/designsystem/styles'
import { AppIcons } from '#/generated/icons'
import { strings } from '#/generated/strings'
import { useWardrobeViewModel } from './useWardrobeViewModel'

export function WardrobeScreen() {
  const viewModel = useWardrobeViewModel()
  const navigate = useNavigate()
  const filteredEmpty = viewModel.status === 'ready' && viewModel.items.length === 0 && viewModel.total > 0
  const empty = viewModel.status === 'ready' && viewModel.total === 0

  return (
    <Page width="full">
      <div className="flex flex-wrap items-center justify-between gap-md">
        <h1 className="text-headline">{strings.wardrobeTitle}</h1>
        <Link to="/wardrobe/new" data-testid="wardrobe.add" className={primaryButtonClass}>
          <AppIcons.add className="size-icon-sm" />
          {strings.wardrobeAdd}
        </Link>
      </div>
      <div className="flex gap-sm overflow-x-auto pb-sm">
        <FilterChip testId="wardrobe.filter.all" label={strings.wardrobeAll} pressed={viewModel.filter === 'all'} onClick={() => viewModel.setFilter('all')} />
        {ITEM_TYPES.map((type) => (
          <FilterChip
            key={type}
            testId={`wardrobe.filter.${type}`}
            label={itemTypeLabel(type)}
            pressed={viewModel.filter === type}
            onClick={() => viewModel.setFilter(type)}
          />
        ))}
      </div>
      {viewModel.status === 'loading' ? <StateMessage variant="loading" /> : null}
      {viewModel.status === 'error' ? <StateMessage variant="error" onRetry={viewModel.retry} /> : null}
      {viewModel.status === 'ready' && viewModel.items.length > 0 ? (
        <p className="text-label text-on-surface-variant">{strings.commonItemCount(viewModel.items.length)}</p>
      ) : null}
      {empty ? (
        <StateMessage
          variant="empty"
          icon={<AppIcons.wardrobe className="size-icon-lg" />}
          title={strings.wardrobeEmptyTitle}
          body={strings.wardrobeEmptyBody}
          action={{ label: strings.wardrobeAdd, onClick: () => void navigate({ to: '/wardrobe/new' }) }}
        />
      ) : null}
      {filteredEmpty ? (
        <StateMessage
          variant="empty"
          icon={<AppIcons.wardrobe className="size-icon-lg" />}
          title={strings.wardrobeEmptyFilteredTitle}
          body={strings.wardrobeEmptyFilteredBody}
        />
      ) : null}
      {viewModel.status === 'ready' && viewModel.items.length > 0 ? (
        <ul data-testid="wardrobe.items" className="grid grid-cols-2 gap-lg md:grid-cols-3 xl:grid-cols-4">
          {viewModel.items.map((item) => (
            <li key={item.id}>
              <Link
                to="/wardrobe/$itemId"
                params={{ itemId: item.id }}
                data-testid={`wardrobeCard.${item.id}`}
                className="flex flex-col gap-sm rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                <span className="relative">
                  <RemotePhoto src={item.imageUrl} alt={item.name} className="aspect-square w-full rounded-lg" />
                  {item.favorite ? (
                    <span role="img" aria-label={strings.wardrobeFavorite} className="absolute end-sm top-sm text-favorite">
                      <AppIcons.favorite className="size-icon-md" fill="currentColor" />
                    </span>
                  ) : null}
                </span>
                <span className="text-label">{item.name}</span>
                {item.brand ? <span className="text-caption text-on-surface-variant">{item.brand}</span> : null}
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
    </Page>
  )
}
