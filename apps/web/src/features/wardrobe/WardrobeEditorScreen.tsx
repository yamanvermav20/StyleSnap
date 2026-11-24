import { AppCard } from '#/core/designsystem/AppCard'
import { ConfirmDialog } from '#/core/designsystem/ConfirmDialog'
import { Page } from '#/core/designsystem/Page'
import { RemotePhoto } from '#/core/designsystem/RemotePhoto'
import { StateMessage } from '#/core/designsystem/StateMessage'
import { destructiveButtonClass, fieldClass, primaryButtonClass, secondaryButtonClass } from '#/core/designsystem/styles'
import { ITEM_TYPES, SEASONS, isItemType, isSeason, itemTypeLabel, seasonLabel } from '#/core/labels'
import { AppIcons } from '#/generated/icons'
import { strings } from '#/generated/strings'
import { WARDROBE_LIMITS } from './WardrobeRepository'
import { useWardrobeEditorViewModel } from './useWardrobeViewModel'

export function WardrobeEditorScreen({ itemId }: { itemId?: string }) {
  const viewModel = useWardrobeEditorViewModel(itemId)
  const draft = viewModel.draft

  return (
    <Page>
      <h1 className="text-headline">{viewModel.title}</h1>
      {viewModel.status === 'loading' ? <StateMessage variant="loading" /> : null}
      {viewModel.status === 'notFound' ? <StateMessage variant="error" body={strings.wardrobeEditorNotFound} /> : null}
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
            <fieldset className="flex flex-col gap-sm">
              <legend className="text-label">{strings.wardrobeEditorPhoto}</legend>
              <div className="grid grid-cols-3 gap-sm sm:grid-cols-4 md:grid-cols-5">
                {viewModel.photos.map((photo) => {
                  const selected = draft.imageUrl === photo.imageUrl
                  const testId = photo.id === 'current' ? 'wardrobeEditor.photo.current' : `wardrobeEditor.photo.${photo.id}`
                  return (
                    <button
                      key={photo.id}
                      type="button"
                      data-testid={testId}
                      aria-pressed={selected}
                      aria-label={strings.wardrobeEditorPhoto}
                      onClick={() => viewModel.setPhoto(photo.imageUrl)}
                      className={`relative aspect-square overflow-hidden rounded-md ${selected ? 'outline-2 outline-offset-2 outline-primary' : ''}`}
                    >
                      <RemotePhoto src={photo.imageUrl} alt="" className="size-full" />
                      {selected ? (
                        <span className="absolute end-xs top-xs flex size-icon-md items-center justify-center rounded-full bg-primary text-on-primary">
                          <AppIcons.check className="size-icon-sm" />
                        </span>
                      ) : null}
                    </button>
                  )
                })}
              </div>
            </fieldset>
            <label className="flex flex-col gap-xs text-label" htmlFor="wardrobe-name">
              {strings.wardrobeEditorName}
              <input
                id="wardrobe-name"
                data-testid="wardrobeEditor.name"
                value={draft.name}
                placeholder={strings.wardrobeEditorNamePlaceholder}
                maxLength={WARDROBE_LIMITS.name}
                onChange={(event) => viewModel.setName(event.target.value)}
                className={fieldClass}
              />
            </label>
            <label className="flex flex-col gap-xs text-label" htmlFor="wardrobe-brand">
              {strings.wardrobeEditorBrand}
              <input
                id="wardrobe-brand"
                data-testid="wardrobeEditor.brand"
                value={draft.brand}
                placeholder={strings.wardrobeEditorBrandPlaceholder}
                maxLength={WARDROBE_LIMITS.brand}
                onChange={(event) => viewModel.setBrand(event.target.value)}
                className={fieldClass}
              />
            </label>
            <label className="flex flex-col gap-xs text-label" htmlFor="wardrobe-type">
              {strings.wardrobeEditorType}
              <select
                id="wardrobe-type"
                data-testid="wardrobeEditor.type"
                value={draft.type}
                onChange={(event) => {
                  if (isItemType(event.target.value)) viewModel.setType(event.target.value)
                }}
                className={fieldClass}
              >
                {ITEM_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {itemTypeLabel(type)}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-xs text-label" htmlFor="wardrobe-color">
              {strings.wardrobeEditorColor}
              <input
                id="wardrobe-color"
                data-testid="wardrobeEditor.color"
                value={draft.color}
                placeholder={strings.wardrobeEditorColorPlaceholder}
                maxLength={WARDROBE_LIMITS.color}
                onChange={(event) => viewModel.setColor(event.target.value)}
                className={fieldClass}
              />
            </label>
            <label className="flex flex-col gap-xs text-label" htmlFor="wardrobe-season">
              {strings.wardrobeEditorSeason}
              <select
                id="wardrobe-season"
                data-testid="wardrobeEditor.season"
                value={draft.season}
                onChange={(event) => {
                  if (isSeason(event.target.value)) viewModel.setSeason(event.target.value)
                }}
                className={fieldClass}
              >
                {SEASONS.map((season) => (
                  <option key={season} value={season}>
                    {seasonLabel(season)}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-xs text-label" htmlFor="wardrobe-notes">
              {strings.wardrobeEditorNotes}
              <textarea
                id="wardrobe-notes"
                data-testid="wardrobeEditor.notes"
                value={draft.notes}
                placeholder={strings.wardrobeEditorNotesPlaceholder}
                rows={4}
                maxLength={WARDROBE_LIMITS.notes}
                onChange={(event) => viewModel.setNotes(event.target.value)}
                className={fieldClass}
              />
            </label>
            <label className="flex min-h-touch-target items-center justify-between gap-md text-label">
              {strings.wardrobeEditorFavorite}
              <input
                type="checkbox"
                role="switch"
                data-testid="wardrobeEditor.favorite"
                checked={draft.favorite}
                onChange={(event) => viewModel.setFavorite(event.target.checked)}
                className="size-icon-md accent-primary"
              />
            </label>
            {viewModel.error ? (
              <p data-testid="wardrobeEditor.error" className="text-caption text-error">
                {viewModel.error}
              </p>
            ) : null}
            <div className="flex flex-wrap gap-sm">
              <button type="button" data-testid="wardrobeEditor.cancel" onClick={viewModel.cancel} className={secondaryButtonClass}>
                {strings.commonCancel}
              </button>
              <button type="submit" data-testid="wardrobeEditor.save" disabled={viewModel.pending} className={primaryButtonClass}>
                {strings.commonSave}
              </button>
            </div>
            {viewModel.editing ? (
              <button type="button" data-testid="wardrobeEditor.delete" onClick={viewModel.askDelete} disabled={viewModel.pending} className={destructiveButtonClass}>
                {strings.wardrobeEditorDelete}
              </button>
            ) : null}
          </form>
        </AppCard>
      ) : null}
      <ConfirmDialog
        open={viewModel.confirming}
        title={strings.wardrobeEditorDeleteTitle}
        titleId="delete-wardrobe-item-title"
        body={strings.wardrobeEditorDeleteBody}
        confirmLabel={strings.commonDelete}
        confirmTestId="wardrobeEditor.confirmDelete"
        pending={viewModel.pending}
        onConfirm={() => void viewModel.confirmDelete()}
        onClose={viewModel.cancelDelete}
      />
    </Page>
  )
}
