import { AppIcons } from '#/generated/icons'
import { strings } from '#/generated/strings'
import { occasionLabel, seasonLabel } from '#/core/labels'
import { Page } from '#/core/designsystem/Page'
import { OutfitGrid } from '#/core/designsystem/OutfitCard'
import { SelectChip } from '#/core/designsystem/SelectChip'
import { StateMessage } from '#/core/designsystem/StateMessage'
import { secondaryButtonClass } from '#/core/designsystem/styles'
import { useSearchViewModel } from './useSearchViewModel'

export function SearchScreen() {
  const viewModel = useSearchViewModel()

  return (
    <Page width="full">
      <h1 className="text-headline">{strings.searchTitle}</h1>
      <div className="flex min-h-touch-target items-center gap-sm rounded-md border border-outline bg-background px-md focus-within:outline-2 focus-within:outline-primary">
        <AppIcons.search className="size-icon-md shrink-0 text-on-surface-variant" />
        <input
          type="search"
          data-testid="search.field"
          value={viewModel.draft}
          placeholder={strings.searchPlaceholder}
          aria-label={strings.searchPlaceholder}
          onChange={(event) => viewModel.setDraft(event.target.value)}
          className="w-full bg-transparent py-sm text-body text-on-background outline-none"
        />
      </div>
      <div className="flex flex-wrap items-center gap-sm">
        <SelectChip
          testId="search.filter.category"
          label={strings.searchCategory}
          anyLabel={strings.searchAny}
          value={viewModel.query.categoryId}
          active={Boolean(viewModel.query.categoryId)}
          onChange={viewModel.setCategory}
          options={viewModel.categories.map((category) => ({ value: category.id, label: category.name }))}
        />
        <SelectChip
          testId="search.filter.season"
          label={strings.searchSeason}
          anyLabel={strings.searchAny}
          value={viewModel.query.season}
          active={Boolean(viewModel.query.season)}
          onChange={viewModel.setSeason}
          options={viewModel.seasons.map((season) => ({ value: season, label: seasonLabel(season) }))}
        />
        <SelectChip
          testId="search.filter.occasion"
          label={strings.searchOccasion}
          anyLabel={strings.searchAny}
          value={viewModel.query.occasion}
          active={Boolean(viewModel.query.occasion)}
          onChange={viewModel.setOccasion}
          options={viewModel.occasions.map((occasion) => ({ value: occasion, label: occasionLabel(occasion) }))}
        />
        <SelectChip
          testId="search.sort"
          label={strings.searchSort}
          value={viewModel.query.sort}
          active={viewModel.query.sort !== 'popular'}
          onChange={(value) => viewModel.setSort(value === 'newest' ? 'newest' : 'popular')}
          options={[
            { value: 'popular', label: strings.searchSortPopular },
            { value: 'newest', label: strings.searchSortNewest },
          ]}
        />
        {viewModel.filtersActive ? (
          <button type="button" data-testid="search.clearFilters" onClick={viewModel.clearFilters} className={secondaryButtonClass}>
            {strings.searchClearFilters}
          </button>
        ) : null}
      </div>
      {viewModel.status === 'loading' ? <StateMessage variant="loading" /> : null}
      {viewModel.status === 'error' ? <StateMessage variant="error" onRetry={viewModel.retry} /> : null}
      {viewModel.status === 'ready' && viewModel.outfits.length === 0 ? (
        <StateMessage
          variant="empty"
          icon={<AppIcons.search className="size-icon-lg" />}
          title={strings.searchEmptyTitle}
          body={strings.searchEmptyBody}
        />
      ) : null}
      {viewModel.status === 'ready' && viewModel.outfits.length > 0 ? (
        <div className="flex flex-col gap-md">
          {viewModel.fetching ? <StateMessage variant="loading" /> : null}
          <p data-testid="search.resultCount" className="text-label text-on-surface-variant">
            {strings.searchResultCount(viewModel.outfits.length)}
          </p>
          <OutfitGrid testId="search.results" outfits={viewModel.outfits} />
        </div>
      ) : null}
    </Page>
  )
}
