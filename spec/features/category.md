---
id: category
title: Category
status:
  ios: planned
  android: planned
  web: planned
---

# Category

## Summary

All outfits in one style, such as Streetwear or Evening, so the user can browse just that look.

## User stories

- As someone who loves one style, I want to see every outfit in it so that I can compare them.

## Screens and states

**Category**, pushed from a category tile on Feed or the Style row on Outfit detail.

- Title: the category's name.
- The category's description, then `common.outfitCount` with the number of outfits.
- The category's outfits as outfit cards in a grid, most liked first.
- **Loading**, **error** and **retry**: the shared states (spec/features/feed.md).
- **Empty:** `category.emptyTitle` and `category.emptyBody`.

## Behavior and rules

- The category comes from `listCategories` (matched by id) and its outfits from `listOutfits` with `categoryId` and `sort=popular`, through `CatalogRepository`.
- An unknown category id shows the error state.

## Acceptance criteria

- AC-category-1 (ui): Category shows the category's name as its title, its description and only outfits in that category, most liked first.
- AC-category-2 (ui): Tapping an outfit card opens its Outfit detail.
- AC-category-3 (ui): Category shows the loading, error (with Try again) and empty states.

## Copy

`category.emptyTitle`, `category.emptyBody`, `common.outfitCount`.

## Platform notes

- iOS: large title with the category name, pushed in the current tab's stack.
- Android: top app bar with the category name and a back button (`common.back`).
- Web: `/categories/$categoryId`, with an `h1` of the category name.

## Test IDs

- `category.outfits`: the outfit grid.

## Assumptions and open questions

- Assumption: Category has no filters of its own; Search filters by category too.
