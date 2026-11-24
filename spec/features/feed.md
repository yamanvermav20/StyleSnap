---
id: feed
title: Feed
status:
  ios: planned
  android: planned
  web: planned
---

# Feed

## Summary

The Discover tab and the app's first screen: a row of style categories and a grid of trending outfits, all photos. It's where browsing starts. This spec also defines the app shell (the four sections) and the loading, error and empty patterns every screen reuses.

## User stories

- As someone looking for inspiration, I want to scroll a feed of looks so that I find outfits I like.
- As someone with a style in mind, I want to jump into a category so that I only see that style.

## Screens and states

**App shell.** Four top-level sections, in this order: Discover (`tabs.discover`, `discover` icon), Search (`tabs.search`, `search` icon), Collections (`tabs.collections`, `collections` icon) and Wardrobe (`tabs.wardrobe`, `wardrobe` icon). The app starts on Discover. See spec/navigation.md for how each platform presents them.

**Feed** (`feed.title` as the screen title).

- A Settings entry (`settings` icon, labeled `feed.openSettings`).
- Section `feed.categoriesTitle`: every category as a tile (photo, name on a scrim), in the order the API returns, in a horizontal scroller.
- Section `feed.trendingTitle`: every outfit, most liked first (`listOutfits` with `sort=popular`), as outfit cards in a grid. A card shows the cover photo (3:4), the title, `feed.byCreator` with the creator's name, and `common.likes` with the like count.
- **Loading:** a loading indicator until both categories and outfits have loaded.
- **Error:** if either request fails, the shared error state: the `offline` icon, `common.errorTitle`, `common.errorBody` and a `common.retry` button that loads again.
- **Empty:** with no outfits, `feed.emptyTitle` and `feed.emptyBody` in place of the grid.
- Pull to refresh on iOS and Android reloads both lists.

## Behavior and rules

- Data comes from `listCategories` and `listOutfits` (contracts/api.json), through `CatalogRepository`. Nothing is stored on the device.
- The feed reloads each time it's opened from a cold start; returning from a pushed screen keeps the loaded content and scroll position.
- Like counts are display only.
- Shared state patterns, used by every screen that loads data: **loading** shows a loading indicator with the test ID `state.loading`; **error** shows the error state above with `state.error` and its retry button `state.retry`; **empty** shows a message with `state.empty` and, where the screen has one, an action button `state.emptyAction`.

## Acceptance criteria

- AC-feed-1: The app has four top-level sections, Discover, Search, Collections and Wardrobe, and starts on Discover.
- AC-feed-2 (ui): Feed shows every category as a tile with its photo and name, in API order.
- AC-feed-3 (ui): Feed shows every outfit as a card with its photo, title, creator and likes, most liked first.
- AC-feed-4 (ui): Tapping a category tile opens Category for that category.
- AC-feed-5 (ui): Tapping an outfit card opens Outfit detail for that outfit.
- AC-feed-6 (ui): While loading, Feed shows the loading state; if loading fails it shows the error state, and Try again loads again and shows the content.
- AC-feed-7 (ui): With no outfits, Feed shows its empty state.
- AC-feed-8 (ui): The Settings entry opens Settings.

## Copy

`tabs.*`, `feed.*`, `common.errorTitle`, `common.errorBody`, `common.retry`, `common.loading`, `common.likes`.

## Platform notes

- iOS: large title "Discover"; the Settings entry is a gear button in the toolbar. Pull to refresh with `.refreshable`.
- Android: top app bar "Discover" with a gear action; pull to refresh with `PullToRefreshBox`.
- Web: the site header carries the app name, the four section links and the Settings gear on every page; Feed starts with an `h1` "Discover". No pull to refresh: the browser's reload does that.

## Test IDs

- `tabs.discover`, `tabs.search`, `tabs.collections`, `tabs.wardrobe` (not on ios): the section tabs or links. iOS tab bar items are found by their label instead.
- `feed.openSettings`: the Settings entry.
- `feed.categories`: the category scroller.
- `categoryTile.<categoryId>`: a category tile.
- `feed.outfits`: the outfit grid.
- `outfitCard.<outfitId>`: an outfit card, on every screen that shows one.
- `state.loading`: the loading indicator, on every screen.
- `state.error`: the error state, on every screen.
- `state.retry`: the error state's Try again button.
- `state.empty`: an empty state, on every screen.
- `state.emptyAction`: an empty state's action button, where there is one.

## Assumptions and open questions

- Assumption: no infinite scrolling. The catalog is small (30 outfits), so one request loads it all.
- Assumption: the feed shows all categories, not a personalized selection.
