import { useDocumentTitle } from '#/core/documentTitle'
import { Page } from '#/core/designsystem/Page'
import { OutfitGrid } from '#/core/designsystem/OutfitCard'
import { StateMessage } from '#/core/designsystem/StateMessage'
import { AppIcons } from '#/generated/icons'
import { strings } from '#/generated/strings'
import { useCategoryViewModel } from './useCategoryViewModel'

export function CategoryScreen({ categoryId }: { categoryId: string }) {
  const viewModel = useCategoryViewModel(categoryId)
  useDocumentTitle(viewModel.category?.name)

  return (
    <Page width="full">
      {viewModel.status === 'loading' ? <StateMessage variant="loading" /> : null}
      {viewModel.status === 'error' ? <StateMessage variant="error" onRetry={viewModel.retry} /> : null}
      {viewModel.status === 'ready' && viewModel.category ? (
        <>
          <header className="flex flex-col gap-sm">
            <h1 className="text-headline">{viewModel.category.name}</h1>
            <p className="max-w-2xl text-body text-on-surface-variant">{viewModel.category.description}</p>
            <p className="text-label text-on-surface-variant">{strings.commonOutfitCount(viewModel.outfits.length)}</p>
          </header>
          {viewModel.outfits.length === 0 ? (
            <StateMessage
              variant="empty"
              icon={<AppIcons.categories className="size-icon-lg" />}
              title={strings.categoryEmptyTitle}
              body={strings.categoryEmptyBody}
            />
          ) : (
            <OutfitGrid testId="category.outfits" outfits={viewModel.outfits} />
          )}
        </>
      ) : null}
    </Page>
  )
}
