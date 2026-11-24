import { Link } from '@tanstack/react-router'
import { useRef, useState } from 'react'
import { useDocumentTitle } from '#/core/documentTitle'
import { formatPrice } from '#/core/formatPrice'
import { itemTypeLabel, occasionLabel, seasonLabel } from '#/core/labels'
import { Page } from '#/core/designsystem/Page'
import { RemotePhoto } from '#/core/designsystem/RemotePhoto'
import { StateMessage } from '#/core/designsystem/StateMessage'
import { Toast } from '#/core/designsystem/Toast'
import { AppIcons } from '#/generated/icons'
import { strings } from '#/generated/strings'
import { iconButtonClass } from '#/core/designsystem/styles'
import { SaveToCollectionSheet } from './SaveToCollectionSheet'
import { useOutfitDetailViewModel } from './useOutfitDetailViewModel'

function PhotoPager({ photos, title }: { photos: string[]; title: string }) {
  const scroller = useRef<HTMLDivElement>(null)
  const [index, setIndex] = useState(0)
  const total = photos.length

  function scrollTo(next: number) {
    const clamped = Math.max(0, Math.min(total - 1, next))
    const element = scroller.current
    setIndex(clamped)
    if (element) element.scrollTo({ left: clamped * element.clientWidth })
  }

  return (
    <div className="relative">
      <div
        ref={scroller}
        data-testid="outfitDetail.photos"
        onScroll={(event) => {
          const element = event.currentTarget
          if (!element.clientWidth) return
          setIndex(Math.round(element.scrollLeft / element.clientWidth))
        }}
        className="flex snap-x snap-mandatory overflow-x-auto rounded-xl motion-safe:scroll-smooth"
      >
        {photos.map((src, photoIndex) => (
          <RemotePhoto
            key={`${src}-${photoIndex}`}
            src={src}
            alt={title}
            className="aspect-3/4 w-full shrink-0 snap-center"
          />
        ))}
      </div>
      {total > 1 ? (
        <p
          data-testid="outfitDetail.photoPosition"
          className="absolute end-md bottom-md rounded-full bg-scrim px-md py-sm text-caption text-on-scrim"
        >
          {strings.outfitDetailPhotoPosition({ position: index + 1, total })}
        </p>
      ) : null}
      {total > 1 ? (
        <>
          <button
            type="button"
            disabled={index === 0}
            aria-label={strings.outfitDetailPhotoPosition({ position: Math.max(index, 1), total })}
            onClick={() => scrollTo(index - 1)}
            className={`absolute start-md top-1/2 hidden -translate-y-1/2 bg-scrim text-on-scrim lg:inline-flex ${iconButtonClass} disabled:opacity-40`}
          >
            <AppIcons.back className="size-icon-md" />
          </button>
          <button
            type="button"
            disabled={index === total - 1}
            aria-label={strings.outfitDetailPhotoPosition({ position: Math.min(index + 2, total), total })}
            onClick={() => scrollTo(index + 1)}
            className={`absolute end-md top-1/2 hidden -translate-y-1/2 bg-scrim text-on-scrim lg:inline-flex ${iconButtonClass} disabled:opacity-40`}
          >
            <AppIcons.chevronRight className="size-icon-md" />
          </button>
        </>
      ) : null}
    </div>
  )
}

export function OutfitDetailScreen({ outfitId }: { outfitId: string }) {
  const viewModel = useOutfitDetailViewModel(outfitId)
  const outfit = viewModel.outfit
  useDocumentTitle(outfit?.title)

  return (
    <Page width="full">
      {viewModel.status === 'loading' ? <StateMessage variant="loading" /> : null}
      {viewModel.status === 'notFound' ? <StateMessage variant="error" body={strings.outfitDetailNotFound} /> : null}
      {viewModel.status === 'error' ? <StateMessage variant="error" onRetry={viewModel.retry} /> : null}
      {viewModel.status === 'ready' && outfit ? (
        <div className="grid items-start gap-xl lg:grid-cols-2">
          <PhotoPager photos={[outfit.imageUrl, ...outfit.gallery]} title={outfit.title} />
          <div className="flex flex-col gap-lg">
            <header className="flex flex-col gap-sm">
              <h1 className="text-headline">{outfit.title}</h1>
              <p className="text-body text-on-surface-variant">{strings.feedByCreator({ name: outfit.creatorName })}</p>
              <p className="inline-flex items-center gap-xs text-caption text-on-surface-variant">
                <AppIcons.likes className="size-icon-sm" />
                {strings.commonLikes(outfit.likes)}
              </p>
              <button
                type="button"
                data-testid="outfitDetail.save"
                onClick={viewModel.openSheet}
                className={`inline-flex min-h-touch-target w-fit items-center gap-sm rounded-full px-lg text-label ${
                  viewModel.saved ? 'bg-primary-container text-on-primary-container' : 'bg-primary text-on-primary'
                }`}
              >
                {viewModel.saved ? <AppIcons.saved className="size-icon-sm text-primary" /> : <AppIcons.save className="size-icon-sm" />}
                {viewModel.saved ? strings.outfitDetailSaved : strings.outfitDetailSave}
              </button>
            </header>
            <p className="max-w-2xl text-body">{outfit.description}</p>
            {outfit.tags.length > 0 ? (
              <ul className="flex flex-wrap gap-sm">
                {outfit.tags.map((tag) => (
                  <li key={tag} className="rounded-full bg-surface-variant px-md py-xs text-caption text-on-surface-variant">
                    {tag}
                  </li>
                ))}
              </ul>
            ) : null}
            <section className="flex flex-col">
              <h2 className="text-title">{strings.outfitDetailDetailsTitle}</h2>
              <Link
                to="/categories/$categoryId"
                params={{ categoryId: outfit.categoryId }}
                data-testid="outfitDetail.category"
                className="flex min-h-touch-target items-center justify-between gap-md border-b border-outline"
              >
                <span className="text-body text-on-surface-variant">{strings.outfitDetailCategory}</span>
                <span className="inline-flex items-center gap-xs text-label">
                  {outfit.categoryName}
                  <AppIcons.chevronRight className="size-icon-sm" />
                </span>
              </Link>
              <div className="flex min-h-touch-target items-center justify-between gap-md border-b border-outline">
                <span className="text-body text-on-surface-variant">{strings.outfitDetailSeason}</span>
                <span className="text-label">{seasonLabel(outfit.season)}</span>
              </div>
              <div className="flex min-h-touch-target items-center justify-between gap-md border-b border-outline">
                <span className="text-body text-on-surface-variant">{strings.outfitDetailOccasion}</span>
                <span className="text-label">{occasionLabel(outfit.occasion)}</span>
              </div>
            </section>
            <section data-testid="outfitDetail.items" className="flex flex-col gap-md">
              <h2 className="text-title">{strings.outfitDetailItemsTitle}</h2>
              <ul className="flex flex-col gap-md">
                {outfit.items.map((item, index) => (
                  <li key={`${item.name}-${index}`} className="flex items-center gap-md">
                    <RemotePhoto src={item.imageUrl} alt={item.name} className="size-thumbnail shrink-0 rounded-md" />
                    <div className="flex min-w-0 flex-col">
                      <span className="text-label">{item.name}</span>
                      <span className="text-caption text-on-surface-variant">{item.brand}</span>
                      <span className="text-caption text-on-surface-variant">{itemTypeLabel(item.type)}</span>
                      <span className="text-label">{formatPrice(item.price)}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </div>
      ) : null}
      <SaveToCollectionSheet
        open={viewModel.sheetOpen}
        outfitId={outfitId}
        collections={viewModel.collections}
        status={viewModel.collectionsStatus}
        onToggle={(collection) => void viewModel.toggle(collection)}
        onClose={viewModel.closeSheet}
        onRetry={viewModel.retryCollections}
      />
      <Toast message={viewModel.toast} onDone={viewModel.clearToast} />
    </Page>
  )
}
