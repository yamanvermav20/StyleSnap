---
id: search
title: Search
status:
  ios: planned
  android: planned
  web: planned
---

# Search

## Summary

Find outfits by text, narrow them down by style, season and occasion, and sort by popularity or recency.

## User stories

- As someone with something specific in mind ("trench", "linen", a brand), I want to search for it.
- As someone dressing for an event, I want to filter by occasion and season.

## Screens and states

**Search** (`search.title`).

- A search field with `search.placeholder`.
- A row of filter controls: `search.category` (Any or one category), `search.season` (Any or one season), `search.occasion` (Any or one occasion) and `search.sort` (`search.sortPopular` or `search.sortNewest`). Each control shows its label, or the chosen value when one is chosen, and is highlighted (`primaryContainer`) when it isn't the default.
- `search.clearFilters`, shown only when a filter isn't at its default. It resets the category, season, occasion and sort; it doesn't clear the text.
- `search.resultCount` with the number of results, then the results as outfit cards in a grid.
- **Loading**, **error** and **retry**: the shared states. Previous results stay visible under a loading indicator while new results load.
- **Empty:** `search.emptyTitle` and `search.emptyBody`.

## Behavior and rules

- Results come from `listOutfits` with `search` (the trimmed text, omitted when empty), `categoryId`, `season`, `occasion` and `sort`, through `CatalogRepository`. The server matches text against the title, description, tags, creator and item names and brands, case-insensitively, and combines filters with AND. An allSeason outfit matches any season.
- With no text and default filters, Search shows every outfit, most liked first.
- Typing searches 300 ms after the last keystroke; changing a filter searches right away.
- Only the newest request's results are shown, even if an older one finishes later.
- Filters and text are kept while the app runs, and reset on a cold start. On web they're kept in the URL query (`?search=&categoryId=&season=&occasion=&sort=`), so a search can be shared and survives a reload.

## Acceptance criteria

- AC-search-1 (ui): With no text and no filters, Search shows every outfit with the result count.
- AC-search-2 (ui): Typing text shows only outfits matching it, after a short pause.
- AC-search-3: Category, season, occasion and sort are sent to the API with the text, and the results are what it returns.
- AC-search-4 (ui): Clear filters appears only when a filter is set, and resets the filters but keeps the text.
- AC-search-5 (ui): With no results, Search shows its empty state.
- AC-search-6 (ui): Tapping a result opens Outfit detail.
- AC-search-7: Results from an older request never replace newer ones.
- AC-search-8 (ui): Search shows the error state when loading fails, and Try again searches again.

## Copy

`search.*`, `season.*`, `occasion.*`.

## Platform notes

- iOS: `.searchable` in the navigation bar, always shown. The filters are `Menu`s with an inline `Picker`, styled as chips.
- Android: a Material 3 search field (`OutlinedTextField` with the `search` icon) under the top app bar; the filters are `FilterChip`s that open a `DropdownMenu`.
- Web: a `type="search"` input; the filters are native `<select>` elements styled as chips.

## Test IDs

- `search.field` (not on ios): the search field. iOS's `.searchable` field can't carry an ID; UI tests find it as the navigation bar's search field.
- `search.filter.category`, `search.filter.season`, `search.filter.occasion`: the filter controls.
- `search.sort`: the sort control.
- `search.clearFilters`: the Clear filters button.
- `search.resultCount`: the result count.
- `search.results`: the results grid.

## Assumptions and open questions

- Assumption: one value per filter (not multi-select), which keeps the API's query parameters simple.
- Assumption: no search history or suggestions in version one.
