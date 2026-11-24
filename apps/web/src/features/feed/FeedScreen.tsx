import { Page } from '#/core/designsystem/Page'
import { CategoryTile } from '#/core/designsystem/CategoryTile'
import { OutfitGrid } from '#/core/designsystem/OutfitCard'
import { StateMessage } from '#/core/designsystem/StateMessage'
import { AppIcons } from '#/generated/icons'
import { strings } from '#/generated/strings'
import { useFeedViewModel } from './useFeedViewModel'

export function FeedScreen() {
  const viewModel = useFeedViewModel()

  return (
    <Page width="full">
      <h1 className="text-headline">{strings.feedTitle}</h1>
      {viewModel.status === 'loading' ? <StateMessage variant="loading" /> : null}
      {viewModel.status === 'error' ? <StateMessage variant="error" onRetry={viewModel.retry} /> : null}
      {viewModel.status === 'ready' ? (
        <>
          <section className="flex flex-col gap-md">
            <h2 className="text-title">{strings.feedCategoriesTitle}</h2>
            <div data-testid="feed.categories" className="flex snap-x gap-md overflow-x-auto pb-sm">
              {viewModel.categories.map((category) => (
                <CategoryTile key={category.id} category={category} />
              ))}
            </div>
          </section>
          <section className="flex flex-col gap-md">
            <h2 className="text-title">{strings.feedTrendingTitle}</h2>
            {viewModel.outfits.length === 0 ? (
              <StateMessage
                variant="empty"
                icon={<AppIcons.discover className="size-icon-lg" />}
                title={strings.feedEmptyTitle}
                body={strings.feedEmptyBody}
              />
            ) : (
              <OutfitGrid testId="feed.outfits" outfits={viewModel.outfits} />
            )}
          </section>
        </>
      ) : null}
    </Page>
  )
}
