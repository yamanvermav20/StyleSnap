---
id: collections
title: Collections
status:
  ios: planned
  android: planned
  web: planned
---

# Collections

## Summary

Named lists of saved outfits ("Weekend edits", "Office ready"). Users create, rename and delete collections, and add or remove outfits.

## User stories

- As someone who saves a lot of looks, I want to group them so that I can find them by purpose.
- As my taste changes, I want to rename, prune or delete collections.

## Screens and states

**Collections** (`collections.title`), the Collections tab.

- An add button (`add` icon, labeled `collections.add`).
- Every collection, most recently updated first, as a card: a 2 × 2 collage of its cover photos (`coverImageUrls`; empty cells are `surfaceVariant`, and a collection with no outfits shows the `collections` icon on `surfaceVariant`), the name, and `common.outfitCount`. Cards are in a grid.
- **Loading**, **error** and **retry**: the shared states.
- **Empty:** the `collections` icon, `collections.emptyTitle`, `collections.emptyBody` and the action `collections.emptyAction`, which opens the editor.

**Collection detail**, pushed from a card.

- Title: the collection's name. Under it the description (when not empty) and `common.outfitCount`.
- Actions: Edit (`common.edit`) opens the editor; Delete (`common.delete`) asks `collectionDetail.deleteTitle` / `collectionDetail.deleteBody` with `common.delete` (destructive) and `common.cancel`. Deleting returns to Collections.
- The collection's outfits, most recently added first, as outfit cards in a grid. Each card can be removed with `collectionDetail.removeOutfit`. Tapping a card opens Outfit detail.
- **Loading**, **error** and **retry**: the shared states. If the collection no longer exists (HTTP 404), `collectionDetail.notFound`.
- **Empty:** `collectionDetail.emptyTitle` and `collectionDetail.emptyBody`.

**Collection editor**: `collectionEditor.createTitle` or `collectionEditor.editTitle`.

- `collectionEditor.name` (placeholder `collectionEditor.namePlaceholder`) and `collectionEditor.description` (placeholder `collectionEditor.descriptionPlaceholder`, multi-line).
- `common.cancel` closes without saving. `common.save` saves and closes.
- Validation, shown under the name field after Save is tapped: an empty name (after trimming) shows `collectionEditor.nameRequired`; more than 40 characters shows `collectionEditor.nameTooLong`. The description is limited to 140 characters as the user types.
- While saving, Save is disabled. If saving fails, the editor stays open with `common.saveFailed`.

## Behavior and rules

- Everything goes through `CollectionsRepository`: `listCollections`, `getCollection`, `listCollectionOutfits`, `createCollection`, `updateCollection`, `deleteCollection` and `removeOutfitFromCollection`.
- The server trims the name and description and orders lists. Adding or removing an outfit, or editing, moves the collection to the top.
- Collections and Collection detail reload whenever they appear, so changes made elsewhere (Save on Outfit detail) show up.
- Removing an outfit takes it out of the grid right away; if the request fails it comes back and a toast says `common.deleteFailed`.

## Acceptance criteria

- AC-collections-1 (ui): Collections lists every collection, most recently updated first, with its cover collage, name and outfit count.
- AC-collections-2 (ui): With no collections, Collections shows its empty state, and its action opens the editor.
- AC-collections-3 (ui): Creating a collection with a name adds it to the top of Collections.
- AC-collections-4: The editor rejects an empty name and a name over 40 characters, with a message, without saving.
- AC-collections-5 (ui): Tapping a collection opens Collection detail with its name, description and outfits, most recently added first.
- AC-collections-6: Editing a collection saves the new name and description.
- AC-collections-7 (ui): Deleting a collection asks for confirmation, then removes it and returns to Collections.
- AC-collections-8: Removing an outfit from a collection takes it out of the collection.
- AC-collections-9 (ui): Collections and Collection detail show the loading and error states, and an empty collection shows its empty state.
- AC-collections-10: If saving fails, the editor stays open and shows the save error.

## Copy

`collections.*`, `collectionEditor.*`, `collectionDetail.*`, `common.outfitCount`, `common.edit`, `common.delete`, `common.cancel`, `common.save`, `common.saveFailed`, `common.deleteFailed`.

## Platform notes

- iOS: the add button is a toolbar `+`. Edit and Delete are in a toolbar `Menu`. Removing an outfit is a context menu (long press) on its card. The editor is a sheet with a `Form`; delete confirmation is a `.confirmationDialog`.
- Android: the add button is a `FloatingActionButton`. Edit and Delete are top app bar actions (Delete under the overflow menu). Removing an outfit is a long press that opens a `DropdownMenu`. The editor is a full-screen entry with a close button; delete confirmation is an `AlertDialog`.
- Web: the add button is a primary button beside the `h1`. Edit and Delete are buttons beside the heading. Each card in Collection detail has a visible remove button (`trash` icon, labeled `collectionDetail.removeOutfit`). The editor is a page; delete confirmation is a native `<dialog>`.

## Test IDs

- `collections.add`: the add button.
- `collections.list`: the collection grid.
- `collectionCard.<collectionId>`: a collection card.
- `collectionDetail.edit`: the Edit action.
- `collectionDetail.delete`: the Delete action.
- `collectionDetail.confirmDelete`: the destructive button in the confirmation.
- `collectionDetail.outfits`: the outfit grid.
- `collectionDetail.remove.<outfitId>`: the remove action for an outfit.
- `collectionEditor.name`: the name field.
- `collectionEditor.description`: the description field.
- `collectionEditor.save`: the Save button.
- `collectionEditor.cancel`: the Cancel or close button.
- `collectionEditor.error`: the validation or save error message.

## Assumptions and open questions

- Assumption: collections can't be reordered by hand; most recently updated comes first.
- Assumption: the same outfit can be in any number of collections.
