---
id: wardrobe
title: Wardrobe
status:
  ios: planned
  android: planned
  web: planned
---

# Wardrobe

## Summary

A catalog of the clothes the user owns. They add pieces with a photo from the photo library, edit them, mark favorites, filter by type and delete what they no longer have.

## User stories

- As someone planning outfits, I want to see what I own at a glance, by type.
- As my closet changes, I want to add, update and remove items.

## Screens and states

**Wardrobe** (`wardrobe.title`), the Wardrobe tab.

- An add button (`add` icon, labeled `wardrobe.add`).
- Type filter chips: `wardrobe.all`, then each item type (`itemType.top`, `itemType.bottom`, `itemType.dress`, `itemType.outerwear`, `itemType.shoes`, `itemType.accessory`). One is selected at a time; All is the default.
- `common.itemCount` with the number of items shown.
- The items, newest first, as cards in a grid: the photo (square, `lg` corners), the name, the brand (when not empty) and, for favorites, a filled `favorite` star in the `favorite` color on the photo's corner (labeled `wardrobe.favorite`).
- Tapping a card opens the editor for that item.
- **Loading**, **error** and **retry**: the shared states.
- **Empty:** with no items at all, the `wardrobe` icon, `wardrobe.emptyTitle`, `wardrobe.emptyBody` and the action `wardrobe.add`. With items but none of the selected type, `wardrobe.emptyFilteredTitle` and `wardrobe.emptyFilteredBody`.

**Wardrobe editor**: `wardrobeEditor.createTitle` or `wardrobeEditor.editTitle`.

- `wardrobeEditor.photo`: the photo library's photos of the selected type, in a grid of square thumbnails. The selected photo has a `primary` outline and a `check` badge. When editing an item whose photo isn't among them, that photo is shown first, selected.
- `wardrobeEditor.name` (placeholder `wardrobeEditor.namePlaceholder`), `wardrobeEditor.brand` (placeholder `wardrobeEditor.brandPlaceholder`), `wardrobeEditor.type` (a single choice of the six types), `wardrobeEditor.color` (placeholder `wardrobeEditor.colorPlaceholder`), `wardrobeEditor.season` (a single choice of the five seasons), `wardrobeEditor.notes` (placeholder `wardrobeEditor.notesPlaceholder`, multi-line) and `wardrobeEditor.favorite` (a switch).
- New item defaults: type `top`, season `allSeason`, no photo, favorite off, other fields empty.
- `common.cancel` closes without saving. `common.save` saves and closes.
- When editing, `wardrobeEditor.delete` asks `wardrobeEditor.deleteTitle` / `wardrobeEditor.deleteBody` with `common.delete` (destructive) and `common.cancel`. Deleting closes the editor.
- Validation after Save is tapped: an empty name shows `wardrobeEditor.nameRequired`; no photo shows `wardrobeEditor.photoRequired`. Length limits (name 60, brand 40, color 30, notes 280) are enforced as the user types.
- **Loading:** the editor loads the photo library (and, when editing, the item) before showing the form. **Error** and **retry**: the shared states; an item that no longer exists shows `wardrobeEditor.notFound`.
- While saving or deleting, Save and Delete are disabled. If it fails, the editor stays open with `common.saveFailed` or `common.deleteFailed`.

## Behavior and rules

- Everything goes through `WardrobeRepository`: `listWardrobeItems` (with `type` when a type chip is selected), `getWardrobeItem`, `createWardrobeItem`, `updateWardrobeItem`, `deleteWardrobeItem` and `listWardrobePhotos`.
- Text fields are sent trimmed. `imageUrl` is the chosen photo's URL.
- Wardrobe reloads whenever it appears, so a saved or deleted item shows up right away. The selected type chip is kept while the app runs.

## Acceptance criteria

- AC-wardrobe-1 (ui): Wardrobe lists every item, newest first, with its photo, name, brand and a star for favorites.
- AC-wardrobe-2 (ui): Choosing a type chip shows only items of that type; All shows every item.
- AC-wardrobe-3 (ui): With no items, Wardrobe shows its empty state with an Add action; with none of the chosen type, it shows the filtered empty state.
- AC-wardrobe-4 (ui): Add item opens the editor with the defaults, and the photo grid shows the photos of the selected type.
- AC-wardrobe-5: Saving a new item with a name and a photo creates it, and it appears first in Wardrobe.
- AC-wardrobe-6: The editor rejects a missing name or photo, with a message, without saving.
- AC-wardrobe-7 (ui): Tapping an item opens the editor filled in with its values; saving changes updates it.
- AC-wardrobe-8 (ui): Deleting an item asks for confirmation, then removes it from Wardrobe.
- AC-wardrobe-9 (ui): Wardrobe and the editor show the loading and error states, and a failed save keeps the editor open with the error.

## Copy

`wardrobe.*`, `wardrobeEditor.*`, `itemType.*`, `season.*`, `common.itemCount`, `common.cancel`, `common.save`, `common.delete`, `common.saveFailed`, `common.deleteFailed`.

## Platform notes

- iOS: the add button is a toolbar `+`. The type chips are a horizontal scroller of capsule buttons. The editor is a sheet with a `Form`: type and season are menu `Picker`s, favorite is a `Toggle`, delete is a destructive button at the bottom with a `.confirmationDialog`.
- Android: the add button is a `FloatingActionButton`. The type chips are `FilterChip`s in a `LazyRow`. The editor is a full-screen entry with a close button and Save in the top app bar: type and season are `ExposedDropdownMenuBox`es, favorite is a `Switch`, delete is an `OutlinedButton` in `error` with an `AlertDialog`.
- Web: the add button is a primary button beside the `h1`. The chips are `button`s with `aria-pressed`. The editor is a page (`/wardrobe/new`, `/wardrobe/$itemId`): type and season are `<select>`s, favorite is a checkbox switch, delete is a button with a native `<dialog>`.

## Test IDs

- `wardrobe.add`: the add button.
- `wardrobe.filter.<type>`: a type chip, `wardrobe.filter.all` for All.
- `wardrobe.items`: the item grid.
- `wardrobeCard.<itemId>`: an item card.
- `wardrobeEditor.photo.<photoId>`: a photo in the editor's grid (`wardrobeEditor.photo.current` for an item's own photo that isn't in the library).
- `wardrobeEditor.name`, `wardrobeEditor.brand`, `wardrobeEditor.type`, `wardrobeEditor.color`, `wardrobeEditor.season`, `wardrobeEditor.notes`, `wardrobeEditor.favorite`: the form fields.
- `wardrobeEditor.save`: the Save button.
- `wardrobeEditor.cancel`: the Cancel or close button.
- `wardrobeEditor.delete`: the Delete button.
- `wardrobeEditor.confirmDelete`: the destructive button in the confirmation.
- `wardrobeEditor.error`: the validation or save error message.

## Assumptions and open questions

- Assumption: no photo uploads in version one (PRODUCT.md, Out of scope). The photo library covers every type.
- Assumption: the favorite flag is set in the editor only; there's no star toggle on the grid.
