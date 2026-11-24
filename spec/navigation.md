# Navigation

The app's screens, their route names, and how each platform presents them. Route names are the same in every app: `Route.outfitDetail(id)` on iOS, `Route.OutfitDetail(id)` on Android and `/outfits/$outfitId` on web.

The app has four top-level sections, Discover, Search, Collections and Wardrobe, shown as tabs on mobile and as links in the web site header. Settings opens from Discover.

| Screen | Route | Web path | Reached from |
|---|---|---|---|
| Feed (Discover tab) | `feed` | `/` | App start; the Discover tab |
| Search | `search` | `/search` | The Search tab |
| Collections | `collections` | `/collections` | The Collections tab |
| Wardrobe | `wardrobe` | `/wardrobe` | The Wardrobe tab |
| Category | `category(id)` | `/categories/$categoryId` | A category tile on Feed; the Style row on Outfit detail |
| Outfit detail | `outfitDetail(id)` | `/outfits/$outfitId` | An outfit card on Feed, Category, Search or Collection detail |
| Collection detail | `collectionDetail(id)` | `/collections/$collectionId` | A collection card on Collections |
| Collection editor | `collectionEditor(id?)` | `/collections/new`, `/collections/$collectionId/edit` | New collection on Collections or the Save sheet; Edit on Collection detail |
| Wardrobe editor | `wardrobeEditor(id?)` | `/wardrobe/new`, `/wardrobe/$itemId` | Add item on Wardrobe; an item card on Wardrobe |
| Save to collection | (sheet) | (dialog) | Save on Outfit detail |
| Settings | `settings` | `/settings` | The Settings gear on Feed (web: in the header on every page) |

## Per platform

- **iOS:** a `TabView` with four tabs. Each tab has its own `NavigationStack` and pushes screens by appending a `Route` (apps/ios/App/Core/Navigation/Route.swift). The collection editor, wardrobe editor and Save to collection are sheets.
- **Android:** a `NavigationBar` with four tabs. Each tab keeps its own Navigation 3 back stack; screens are pushed with `backStack.add(...)`. The editors are full-screen entries; Save to collection is a `ModalBottomSheet`. The bottom bar hides on editor screens.
- **Web:** TanStack Router file routes in apps/web/src/routes. Every screen, editors included, has a URL. Save to collection is a native `<dialog>` on the outfit page.

Opening a pushed screen from a tab keeps you in that tab. Choosing the current tab again on mobile pops it back to its root.
