import { AppCard } from '#/core/designsystem/AppCard'
import { Page } from '#/core/designsystem/Page'
import { StateMessage } from '#/core/designsystem/StateMessage'
import { fieldClass, primaryButtonClass, secondaryButtonClass } from '#/core/designsystem/styles'
import { strings } from '#/generated/strings'
import { COLLECTION_DESCRIPTION_MAX } from './CollectionsRepository'
import { useCollectionEditorViewModel } from './useCollectionsViewModel'

export function CollectionEditorScreen({ collectionId, outfitId }: { collectionId?: string; outfitId?: string }) {
  const viewModel = useCollectionEditorViewModel(collectionId, outfitId)

  return (
    <Page>
      <h1 className="text-headline">{viewModel.title}</h1>
      {viewModel.status === 'loading' ? <StateMessage variant="loading" /> : null}
      {viewModel.status === 'notFound' ? <StateMessage variant="error" body={strings.collectionDetailNotFound} /> : null}
      {viewModel.status === 'error' ? <StateMessage variant="error" onRetry={viewModel.retry} /> : null}
      {viewModel.status === 'ready' ? (
        <AppCard>
          <form
            className="flex flex-col gap-lg"
            onSubmit={(event) => {
              event.preventDefault()
              void viewModel.save()
            }}
          >
            <label className="flex flex-col gap-xs text-label" htmlFor="collection-name">
              {strings.collectionEditorName}
              <input
                id="collection-name"
                data-testid="collectionEditor.name"
                value={viewModel.name}
                placeholder={strings.collectionEditorNamePlaceholder}
                onChange={(event) => viewModel.setName(event.target.value)}
                className={fieldClass}
              />
            </label>
            <label className="flex flex-col gap-xs text-label" htmlFor="collection-description">
              {strings.collectionEditorDescription}
              <textarea
                id="collection-description"
                data-testid="collectionEditor.description"
                value={viewModel.description}
                placeholder={strings.collectionEditorDescriptionPlaceholder}
                rows={4}
                maxLength={COLLECTION_DESCRIPTION_MAX}
                onChange={(event) => viewModel.setDescription(event.target.value.slice(0, COLLECTION_DESCRIPTION_MAX))}
                className={fieldClass}
              />
            </label>
            {viewModel.error ? (
              <p data-testid="collectionEditor.error" className="text-caption text-error">
                {viewModel.error}
              </p>
            ) : null}
            <div className="flex flex-wrap gap-sm">
              <button type="button" data-testid="collectionEditor.cancel" onClick={viewModel.cancel} className={secondaryButtonClass}>
                {strings.commonCancel}
              </button>
              <button type="submit" data-testid="collectionEditor.save" disabled={viewModel.saving} className={primaryButtonClass}>
                {strings.commonSave}
              </button>
            </div>
          </form>
        </AppCard>
      ) : null}
    </Page>
  )
}
