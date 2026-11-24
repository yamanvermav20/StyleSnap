import { Link } from '@tanstack/react-router'
import { useDocumentTitle } from '#/core/documentTitle'
import { ConfirmDialog } from '#/core/designsystem/ConfirmDialog'
import { Page } from '#/core/designsystem/Page'
import { OutfitGrid } from '#/core/designsystem/OutfitCard'
import { StateMessage } from '#/core/designsystem/StateMessage'
import { Toast } from '#/core/designsystem/Toast'
import { destructiveButtonClass, secondaryButtonClass } from '#/core/designsystem/styles'
import { AppIcons } from '#/generated/icons'
import { strings } from '#/generated/strings'
import { useCollectionDetailViewModel } from './useCollectionsViewModel'

export function CollectionDetailScreen({ collectionId }: { collectionId: string }) {
  const viewModel = useCollectionDetailViewModel(collectionId)
  const collection = viewModel.collection
  useDocumentTitle(collection?.name)

  return (
    <Page width="full">
      {viewModel.status === 'loading' ? <StateMessage variant="loading" /> : null}
      {viewModel.status === 'notFound' ? <StateMessage variant="error" body={strings.collectionDetailNotFound} /> : null}
      {viewModel.status === 'error' ? <StateMessage variant="error" onRetry={viewModel.retry} /> : null}
      {viewModel.status === 'ready' && collection ? (
        <>
          <div className="flex flex-wrap items-start justify-between gap-md">
            <header className="flex flex-col gap-sm">
              <h1 className="text-headline">{collection.name}</h1>
              {collection.description ? <p className="max-w-2xl text-body text-on-surface-variant">{collection.description}</p> : null}
              <p className="text-label text-on-surface-variant">{strings.commonOutfitCount(viewModel.outfits.length)}</p>
            </header>
            <div className="flex flex-wrap gap-sm">
              <Link
                to="/collections/$collectionId/edit"
                params={{ collectionId }}
                data-testid="collectionDetail.edit"
                className={secondaryButtonClass}
              >
                <AppIcons.edit className="size-icon-sm" />
                {strings.commonEdit}
              </Link>
              <button type="button" data-testid="collectionDetail.delete" onClick={viewModel.askDelete} className={destructiveButtonClass}>
                <AppIcons.trash className="size-icon-sm" />
                {strings.commonDelete}
              </button>
            </div>
          </div>
          {viewModel.outfits.length === 0 ? (
            <StateMessage
              variant="empty"
              icon={<AppIcons.collections className="size-icon-lg" />}
              title={strings.collectionDetailEmptyTitle}
              body={strings.collectionDetailEmptyBody}
            />
          ) : (
            <OutfitGrid testId="collectionDetail.outfits" outfits={viewModel.outfits} onRemove={(outfitId) => void viewModel.remove(outfitId)} />
          )}
        </>
      ) : null}
      <ConfirmDialog
        open={viewModel.confirming}
        title={strings.collectionDetailDeleteTitle}
        titleId="delete-collection-title"
        body={strings.collectionDetailDeleteBody}
        confirmLabel={strings.commonDelete}
        confirmTestId="collectionDetail.confirmDelete"
        pending={viewModel.deleting}
        onConfirm={() => void viewModel.confirmDelete()}
        onClose={viewModel.cancelDelete}
      />
      <Toast message={viewModel.toast} onDone={viewModel.clearToast} />
    </Page>
  )
}
