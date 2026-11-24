---
id: outfit-detail
title: Outfit detail
status:
  ios: planned
  android: planned
  web: planned
---

# Outfit detail

## Summary

Everything about one outfit: its photos, who made it, when to wear it, the items in it, and a Save button that adds it to the user's collections.

## User stories

- As someone who found a look I like, I want to see every photo and the pieces in it so that I can recreate it.
- As someone who wants to come back later, I want to save the outfit into one or more collections.

## Screens and states

**Outfit detail** (`outfitDetail.title` in the navigation bar on mobile; the outfit's title as the page heading).

- **Photos:** the cover photo followed by the gallery photos, in a horizontally swipeable pager with `xl` corners. With more than one photo, a badge on a `scrim` shows `outfitDetail.photoPosition` (for example "Photo 1 of 3"). One photo shows no badge.
- The outfit title (`headline`), `feed.byCreator`, and `common.likes`.
- A **Save** button: `outfitDetail.save` with the `save` icon when the outfit is in no collection, `outfitDetail.saved` with the `saved` icon (in `primary`) when it's in at least one.
- The description, then the tags as small chips.
- Section `outfitDetail.detailsTitle`: three rows, `outfitDetail.category` (the category name; tapping it opens Category), `outfitDetail.season` (the season label, `season.*`) and `outfitDetail.occasion` (the occasion label, `occasion.*`).
- Section `outfitDetail.itemsTitle`: each item as a row with its photo (`thumbnail` size, `md` corners), name, brand, type label (`itemType.*`) and price (`common.price`).
- **Loading**, **error** and **retry**: the shared states. If the outfit doesn't exist (HTTP 404), `outfitDetail.notFound` in place of the error body, with no retry.

**Save to collection** (`saveToCollection.title`), opened by Save.

- Every collection as a row with its first cover photo (or a `surfaceVariant` placeholder), name and `common.outfitCount`, and a check mark when the outfit is in it.
- Tapping a row adds the outfit to that collection, or removes it if it was there. The check mark and the Save button update right away, and a toast says `saveToCollection.added` or `saveToCollection.removed` with the collection's name.
- `saveToCollection.newCollection` opens the collection editor (spec/features/collections.md). After it saves, the outfit is added to the new collection and the toast says `saveToCollection.added`.
- With no collections, `saveToCollection.emptyBody` above the New collection button.
- Loading and error states as elsewhere. If an add or remove fails, the check mark goes back and the toast says `common.saveFailed`.
- A Done or close control (`common.done`) dismisses it.

## Behavior and rules

- The outfit comes from `getOutfit`, through `CatalogRepository`. Collections come from `listCollections`, and saving uses `addOutfitToCollection` and `removeOutfitFromCollection`, through `CollectionsRepository`.
- Saved means the outfit's id is in some collection's `outfitIds`.
- Prices: whole dollars show no decimals ("$189"); others show two ("$42.50"). The `{price}` placeholder gets the formatted number without the dollar sign.

## Acceptance criteria

- AC-outfit-detail-1 (ui): Outfit detail shows the outfit's photos in a swipeable pager with a position badge when there is more than one, and its title, creator, likes, description and tags.
- AC-outfit-detail-2 (ui): The details section shows the style, season and occasion labels, and tapping the style opens Category.
- AC-outfit-detail-3 (ui): The items section lists every item with its photo, name, brand, type and price.
- AC-outfit-detail-4: Prices format as whole dollars without decimals and other amounts with two decimals.
- AC-outfit-detail-5 (ui): The Save button reads Saved when the outfit is in any collection and Save otherwise; tapping it opens Save to collection with a check mark on each collection that contains the outfit.
- AC-outfit-detail-6 (ui): Tapping a collection in Save to collection adds or removes the outfit, updates its check mark and the Save button, and shows a toast naming the collection.
- AC-outfit-detail-7: New collection in Save to collection creates the collection and adds the outfit to it.
- AC-outfit-detail-8 (ui): Outfit detail shows the loading and error states, and the not found message for an outfit that doesn't exist.

## Copy

`outfitDetail.*`, `saveToCollection.*`, `season.*`, `occasion.*`, `itemType.*`, `common.price`, `common.done`, `common.saveFailed`.

## Platform notes

- iOS: inline `TabView` with `.page` style for the pager. Save to collection is a sheet at the medium detent with a Done button. The toast is an overlay at the bottom.
- Android: `HorizontalPager`. Save to collection is a `ModalBottomSheet`; the toast is a `Snackbar`.
- Web: a scroll-snapping row of photos with previous and next buttons on wide windows, and the photos beside the details on wide windows (`Page width="full"`). Save to collection is a native `<dialog>`; the toast is a `role="status"` region.

## Test IDs

- `outfitDetail.photos`: the photo pager.
- `outfitDetail.photoPosition`: the position badge.
- `outfitDetail.save`: the Save button.
- `outfitDetail.category`: the style row.
- `outfitDetail.items`: the items section.
- `saveToCollection.sheet`: the Save to collection sheet or dialog.
- `saveToCollection.row.<collectionId>`: a collection row.
- `saveToCollection.new`: the New collection button.
- `saveToCollection.done`: the Done button.
- `toast`: the toast or snackbar, on every screen that shows one.

## Assumptions and open questions

- Assumption: there is no separate "like" action; saving to a collection is how users keep outfits.
- Assumption: items are informational only; there is no shop link.
