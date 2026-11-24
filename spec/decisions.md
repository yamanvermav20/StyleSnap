# Decisions

A dated log of product and technical decisions, and of assumptions made along the way. Newest first.

## 2026-11-18: StyleSnap

- **Product.** The starter became StyleSnap, a fashion and outfit discovery app (PRODUCT.md). Home was replaced by Feed (the Discover tab); Settings is kept and opens from Feed.
- **Consistency is `strict`**, as asked: every feature on every platform, no `n/a`. Navigation chrome and controls stay native (DESIGN.md, Components).
- **Navigation.** Four top-level sections: Discover, Search, Collections and Wardrobe (tabs on mobile, header links on web). Each mobile tab keeps its own back stack (spec/navigation.md).
- **Backend.** A real backend from day one: backend/ is Express 5 on Node's built-in SQLite (`node:sqlite`, Node 22.13 or later, so there's no native module to compile). It implements contracts/api.json exactly and seeds 8 categories, 30 outfits, 3 collections and 10 wardrobe items on first start (`make run-backend`, `make seed-backend` to reset, `make check-backend` to test). There's one anonymous user and no auth.
- **The apps call the API through the generated clients.** `apiBaseUrl` is set in contracts/config.json, so `make gen` emits `ApiClient.swift`, `ApiClient.kt` and the fetch helpers in `api.ts`. Each feature's repository interface (`CatalogRepository`, `CollectionsRepository`, `WardrobeRepository`) has an `Api…` implementation that wraps the generated client, used by `AppContainer.live()`, and an `InMemory…` implementation for previews and tests. Nothing is cached on the device; every screen needs the backend.
- **Port 8787, not 8080.** Another local project already listens on 8080 on this machine. Development uses `http://127.0.0.1:8787`; the Android emulator reaches it through `make android-reverse` (`adb reverse tcp:8787 tcp:8787`).
- **Schema names.** The collection model is `OutfitCollection`, because `Collection` shadows Swift's `Collection` protocol and Kotlin's `kotlin.collections.Collection`. The error body is `ErrorResponse`, because the generated clients already declare an `ApiError` type.
- **The text filter on `listOutfits` is `search`, not `query`.** A parameter named `query` collides with the local variable of the same name in the generated TypeScript and Kotlin clients (a geeknative codegen bug to report upstream).
- **Photos** are Unsplash images (https://unsplash.com/license) referenced by URL in the seed data; each was checked to load. Wardrobe photos come from a fixed photo library (`listWardrobePhotos`) instead of uploads.
- **Image loading.** iOS uses `AsyncImage` and web uses `<img loading="lazy">`, with no new dependencies. Android adds Coil 3 (`coil-compose` and `coil-network-okhttp`), as the geeknative demo apps do, because Compose has no built-in remote image loader.
- **Cleartext HTTP in development only.** The development API is plain HTTP on 127.0.0.1. iOS and Android allow cleartext to that host only; staging and production use HTTPS.
- **Test fixtures.** The in-memory repositories on every platform hold the same small fixture, taken from backend/src/seed-data.js: categories `streetwear` and `minimal`; outfits `outfit-01` (streetwear), `outfit-05` and `outfit-07` (minimal); collection `collection-weekend` containing `outfit-01`; wardrobe items `wardrobe-01` and `wardrobe-04`; and the photo library's tops and shoes. UI tests launch with `-uiTesting` (iOS) or use `testContainer` (web) or in-memory repositories (Android) so they don't need the backend.
- **Showcase.** Each app opens a named screen from the launch arguments the geeknative publish script passes (`-screenshotScreen`, `-screenshotAppearance`, plus `-screenshotCategoryId`, `-screenshotOutfitId`, `-screenshotCollectionId` and `-screenshotWardrobeItemId`; Android reads intent extras of the same names). Screenshots use the live, freshly seeded backend, so all three platforms show the same data. previews/shots.json lists every screen.

## 2026-10-30: Cross-platform consistency audit

Intentional differences between the apps, found while auditing them against each other:

- iOS Settings was a `Form` on the system grouped background, which in dark mode is pure black, not the app's `background` token. It now hides that background and uses `background` for the page and `surface` for the rows, like the other two apps. The form keeps its native layout (DESIGN.md, Components). The section titles still use the system gray, not `onSurfaceVariant`.
- On Android, Material's `surface` role is mapped to the `background` token, so `Scaffold` and `TopAppBar` use `background` while cards use `surface` (DESIGN.md, Components).
- `common.back` is used on Android only, for the explicit back button. iOS and web get back from the system and the site header (spec/features/settings.md).
- The web browser tab title is built in a route's `head` as `<screen title> · <app name>`. It is web chrome, so its separator is exempt from the no-literal-text rule (apps/web/AGENTS.md).
- Web touch targets are 48 px (the header gear and the appearance rows), above the 24 px WCAG minimum and matching Android's 48 dp.
- Android and web test the Home screen as rendered, including AC-home-3 (Home opens Settings): Android with Compose UI tests on Robolectric, web by rendering into happy-dom. All are test-only dependencies and don't ship in the apps. iOS covers AC-home-3 with an XCUITest in apps/ios/AppUITests, because SwiftUI exposes no accessibility tree to unit tests (spec/features/home.md).
- The `home` icon is defined in contracts/icons.json for all three platforms and used by none. It stays as a ready-made icon for new features.

Hand checks of the Settings behavior (spec/features/settings.md), run on 2026-10-30 on the iOS simulator, an Android emulator and headless Chrome. Not run means not checked yet, not failed.

| Check | iOS | Android | Web |
|---|---|---|---|
| With System chosen, the app follows a device appearance change while it is open | Pass | Pass | Pass |
| With Dark chosen and the device in light mode, a cold start has no flash of the light theme | Not run | Pass on Android 12 and later, splash screen included: the app registers the chosen appearance with the system (`UiModeManager.setApplicationNightMode`). Earlier versions have no API for it, so their splash follows the system. | Pass: the dark class is set when the document finishes parsing |
| Choosing Dark applies to the whole screen at once, including system bars | Not run | Pass | Pass |
| Back from Settings returns to Home with its state intact | Not run | Pass | Pass: browser back and the header home link both return to Home |
| After a restart with Dark stored, the Settings screen shows Dark as selected | Pass | Pass | Pass, after a fix (see below) |

Sheets and dialogs were not checked, because the starter has none.

Found by that check: on web, opening `/settings` directly with Dark stored showed a dark page but System as the selected choice. The server renders without localStorage, so the first client render disagreed with the server's HTML and React left the server's checked radio in place. The Settings view model now renders "system" until hydration is done, then the stored value. iOS and Android were not affected.

## 2026-10-10: Starter app

- The starter app has two screens, Home and Settings, implemented the same way on all three platforms as a reference for new features.
- The appearance setting is stored locally under `settings.appearance` as `system`, `light` or `dark`, on every platform.
- There's no backend yet. Each feature reads and writes through a repository interface with a local implementation.
- Dependencies are wired by hand in an `AppContainer` on every platform, with no DI framework.

## 2026-11-18: Cross-platform consistency

Configured as **adapted**: same flows, data, copy and brand; n/a is allowed.
