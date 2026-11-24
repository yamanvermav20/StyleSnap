# Product

## In one sentence

StyleSnap is a fashion and outfit discovery app: browse an image-rich feed of looks by style, search and filter them, save favorites into collections, and keep a catalog of the clothes you own.

## Who it's for

People who like clothes and want inspiration: they scroll looks, save the ones they love for later, and plan outfits around what's already in their closet. One person per device; there are no accounts yet.

## Features

| Feature | Spec | Summary |
|---|---|---|
| Feed | [spec/features/feed.md](spec/features/feed.md) | Discover tab: style categories and a grid of trending outfits |
| Category | [spec/features/category.md](spec/features/category.md) | All outfits in one style |
| Outfit detail | [spec/features/outfit-detail.md](spec/features/outfit-detail.md) | Photos, details and items of one outfit; save it to collections |
| Search | [spec/features/search.md](spec/features/search.md) | Search outfits by text, filter by style, season and occasion, and sort |
| Collections | [spec/features/collections.md](spec/features/collections.md) | Create, rename and delete collections, and add or remove saved outfits |
| Wardrobe | [spec/features/wardrobe.md](spec/features/wardrobe.md) | Add, edit, favorite and delete the clothes you own |
| Settings | [spec/features/settings.md](spec/features/settings.md) | Appearance (System, Light, Dark) and app version |

## Platforms

| Platform | Built with | Minimum |
|---|---|---|
| iOS | SwiftUI | iOS 17 |
| Android | Kotlin, Jetpack Compose | Android 7.0 (API 24) |
| Web | React, TanStack Start | Safari 16.4, Chrome 111, Firefox 128 |
| Backend | Node.js 22.13+, Express 5, SQLite (`node:sqlite`) in backend/ | |

**Consistency:** `strict` in `contracts/app.json`. The same features, screens and behavior on every platform, with no `n/a`. Controls and navigation chrome stay native.

**Data:** every app reads and writes through the StyleSnap API (contracts/api.json), using the client `make gen` generates from it. The backend in backend/ serves it from SQLite with seeded data.

## Glossary

Domain terms, defined once. Code uses these exact names on every platform.

| Term | Meaning |
|---|---|
| Outfit | A complete look: a cover photo, more photos, a title, a creator, a category, a season, an occasion, tags, a like count and the items in it (`Outfit`) |
| Outfit item | One piece of clothing in an outfit, with a name, brand, type, price and photo (`OutfitItem`). Not editable |
| Category | A style that groups outfits: Streetwear, Minimal, Workwear and so on (`Category`) |
| Collection | A named, user-made list of saved outfits (`OutfitCollection` in code, because `Collection` is a built-in type in Swift and Kotlin) |
| Saved | An outfit is saved when it's in at least one collection |
| Wardrobe | The clothes the user owns |
| Wardrobe item | One piece in the wardrobe, with a name, brand, type, color, season, photo, notes and a favorite flag (`WardrobeItem`) |
| Item type | top, bottom, dress, outerwear, shoes or accessory |
| Season | spring, summer, fall, winter or allSeason. An allSeason outfit matches any season filter |
| Occasion | everyday, work, party, date, travel or sport |
| Photo library | The stock photos the wardrobe editor offers, grouped by item type (`WardrobePhoto`) |

## Out of scope

- Accounts, sign-in and syncing between people. There is one anonymous user per backend.
- Uploading your own photos from the camera or photo library. The wardrobe editor picks from the photo library.
- Buying items, prices in other currencies, and links to shops.
- Creating or editing outfits; outfits come from the catalog.
- Offline use: every screen needs the backend.
