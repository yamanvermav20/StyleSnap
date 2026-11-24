# Design

<!--
How the app looks and feels on every platform. Your coding agent updates this when you ask for
design changes. Token values live in contracts/tokens.json; this file explains how they're used.
-->

## Direction

**Editorial and image-first.** StyleSnap reads like a fashion magazine: big portrait photos, generous white space, and quiet chrome that gets out of the way of the clothes.

- **Photos lead.** Outfit photos are portrait 3:4 and fill their card edge to edge, with `lg` corners. Text sits below a photo, or on a `scrim` gradient at its bottom edge when it overlays one (category tiles, the outfit hero).
- **Warm neutrals and one accent.** Backgrounds are white (light) and near-black (dark), cards a warm off-white `surface`. A deep rose `primary` marks the one thing that matters on a screen: Save, a selected chip, the active tab. `primaryContainer` fills selected filter chips.
- **Soft, rounded shapes.** `lg` (20) for cards and photos, `xl` (28) for sheets and the hero photo, `full` for chips and pill buttons.
- **Inter throughout**, with `headline` for screen and section titles and `caption` for meta (creator, likes).

## Consistency

`contracts/app.json` `"consistency"` is `strict` or `adapted` (default `adapted`). See AGENTS.md, Consistency, for what the agent does under each tier.

- **strict:** the same features, screens and behavior on every platform, with no `n/a`. Controls and navigation chrome stay native.
- **adapted:** same flows, data, copy and brand. `n/a` and shipping one platform first are allowed when the spec says so.

## Same everywhere, native where it counts

| Same on every platform | Native to each platform |
|---|---|
| Features, flows and data | Navigation chrome (navigation bar, top app bar, site header) |
| Copy (contracts/strings) | Controls: pickers, switches, radio lists, segmented controls |
| Colors, spacing, radii, icon sizes and type scale (contracts/tokens.json) | Gestures, haptics and transitions |
| The typeface (contracts/tokens.json `font`, files in contracts/fonts), including navigation bar titles | Back buttons, tab bars and other system controls |
| Icons: the same drawing from one family (contracts/icons.json) | The system back chevron on iOS and other chrome icons |
| Screen structure and content order, including title alignment (leading on every platform) | Sheets, dialogs and menus |
| Accessibility labels and test IDs | |

## Tokens

Defined in contracts/tokens.json and compiled into each app by `make gen`.

| Token | iOS | Android | Web (Tailwind) |
|---|---|---|---|
| Color `primary` | `AppColors.primary` | `AppTheme.colors.primary` | `bg-primary`, `text-primary` |
| Color `onPrimary` | `AppColors.onPrimary` | `AppTheme.colors.onPrimary` | `text-on-primary` |
| Spacing `md` | `AppSpacing.md` | `AppSpacing.md` | `p-md`, `gap-md` |
| Radius `lg` | `AppRadius.lg` | `AppRadius.lg` | `rounded-lg` |
| Icon size `md` | `AppIconSize.md` | `AppIconSize.md` | `size-icon-md` |
| Size `touchTarget` | `AppSize.touchTarget` | `AppSize.touchTarget` | `size-touch-target`, `min-h-touch-target` |
| Type `title` | `AppTypography.title` | `AppTypography.title` | `text-title` |
| Motion `snappy` (a spring) | `AppMotion.snappy` | `AppMotion.snappy()` | `ease-snappy duration-snappy` |
| Motion `standard` curve, `fast` duration | `AppMotion.standard(AppMotion.fast)` | `AppMotion.standard(AppMotion.fast)` | `ease-standard duration-fast` |
| Elevation `low` | `.shadow(AppElevation.low)` | `Modifier.shadow(AppElevation.low, shape)` | `shadow-low` |

**Color roles.** Every color has a light and a dark value. Add new colors by role (what they're for), not by hue.

- `background` / `onBackground`: screens.
- `surface` / `onSurface`: cards and grouped content on a screen.
- `surfaceVariant` / `onSurfaceVariant`: subtle fills and secondary text.
- `primary` / `onPrimary`: the brand color, for primary actions and selection.
- `primaryContainer` / `onPrimaryContainer`: selected chips and soft highlights.
- `outline`: borders and dividers.
- `scrim` / `onScrim`: a translucent dark layer over photos so overlaid text stays readable (category tiles, hero captions, the photo position badge). `onScrim` is white in both modes.
- `favorite`: the filled star on favorite wardrobe items.
- `error` / `onError`: errors and destructive actions.

**Sizes.** `thumbnail` (72) for item rows, `categoryTile` (132) for the width of a category tile, `cardImage` (240) as the minimum width of an outfit card in a grid, `heroImage` (480) as the hero photo's maximum height on wide windows.

**Type roles.** `display`, `headline`, `title`, `body`, `label`, `caption`. Each has a size, line height and weight that every app uses. On iOS each role also names the Dynamic Type style it scales with; on Android sizes are sp and on web rem, so text follows the user's text size setting everywhere. Line height applies on Android and web (SwiftUI text takes its line spacing from the font).

**Motion.** Durations, easing curves and springs live in contracts/tokens.json `motion`, so an animation takes the same time and feels the same on every platform. Use a spring for things the user moves or toggles, `standard` for things that change on their own, `decelerate` for things that enter and `accelerate` for things that leave. Every animation respects the system's reduce-motion setting: iOS passes it through `AppMotion.reduced(_:_:)`, Android follows the system animation scale, and web wraps motion in `motion-safe:`. Which transitions a screen uses (push, sheet, fade) stays native.

**Elevation.** Shadows live in contracts/tokens.json `elevation`. Use them only for things that float above the content (a bottom bar, a floating button, a dragged card). A shadow can be tinted with a color token (`"color": "primary"`), so it follows dark mode.

**Typeface.** One font family for all three apps: `font.family` in contracts/tokens.json, with one file per weight in contracts/fonts. The starter uses Inter. To switch, run `make font FAMILY="Open Sans"` (any Google Fonts family) or `make font FAMILY=system` for each platform's own font; for a font that isn't on Google Fonts, put its .ttf files in contracts/fonts and list them under `font.files`. Every weight the type scale uses must have a file. Navigation bar titles use that typeface. Back buttons, tab bars and other system controls keep the platform font. With `system`, iOS text sizes come from Dynamic Type, so each role's size must match its iOS style (`make gen` says so if not).

**Icons.** One family, Lucide, drawn identically on every platform from the same shape data: pick a name at https://lucide.dev/icons and add it to contracts/icons.json (`"settings": "settings"`). For artwork Lucide doesn't have, put a simple single-color SVG in contracts/icons and point at it (`"logo": { "svg": "logo.svg" }`). Mark directional icons `"mirrored": true` so they flip in right-to-left layouts. Icons in content use the icon size tokens; icons in navigation chrome take the platform's default size. Icons take the current text color.

## Components

How each platform builds the shared patterns. Add a row whenever a new pattern appears.

| Pattern | iOS | Android | Web |
|---|---|---|---|
| Screen | Screen in a `NavigationStack`, with a large navigation title | `Scaffold` with a `TopAppBar`, both on the `background` token (Material's `surface` role is mapped to `background`; only cards use `surface`) | Page in the app shell: the header and page span the window with `px-lg` (`md:px-xl`) side padding, and the screen's content is a `Page`: a centered readable column (`width="readable"`, the default) for forms, settings, lists and detail screens, or the full width (`width="full"`) for content that uses it, like grids and side-by-side panes |
| Screen title | Leading-aligned large title (the default; don't use `.navigationBarTitleDisplayMode(.inline)`) | `TopAppBar`, which is leading-aligned (not `CenterAlignedTopAppBar`) | `h1` at the start of the page, left-aligned |
| Settings or form | `Form` with sections, on `background` with `surface` rows (`scrollContentBackground(.hidden)`) | Column with section headers | Sections in cards |
| Single choice | Inline `Picker` (checkmarks) | Radio buttons | Radio group |
| Card | `AppColors.surface` fill, `AppRadius.lg` corners | `Surface` in `AppTheme.colors.surface`, `AppRadius.lg` corners | `bg-surface rounded-lg` |
| Primary action | `.buttonStyle(.primary)` (Core/DesignSystem/PrimaryButtonStyle.swift): `onPrimary` on `primary`. Not plain `.borderedProminent`, whose white text is unreadable on a light dark-mode `primary` | `Button` | `button` with `bg-primary text-on-primary` |
| Icon | `Image(AppIcon.settings)` (a template image) | `Icon(AppIcons.settings, contentDescription = ...)` | `<AppIcons.settings className="size-icon-md" />` |
| Top-level sections | `TabView` with four tabs (Discover, Search, Collections, Wardrobe), each its own `NavigationStack` | `NavigationBar` with the same four tabs, each tab keeping its own back stack | Site header with the four sections as links (the current one marked with `aria-current`) and the Settings gear |
| Remote photo | `RemotePhoto` (Core/DesignSystem): `AsyncImage` with a `surfaceVariant` placeholder while loading and a `noImage` icon on failure | `RemotePhoto` (core/designsystem): Coil `AsyncImage` with the same placeholder and failure icon | `RemotePhoto` (core/designsystem): `<img loading="lazy">` on a `bg-surface-variant` box, with the `noImage` icon on error |
| Outfit card | Photo 3:4 with `lg` corners, then the title (`label`) and creator plus likes (`caption`, `onSurfaceVariant`) | Same | Same |
| Outfit grid | `LazyVGrid` with adaptive columns of at least `cardImage` / 1.5 wide (two columns on phones) | `LazyVerticalGrid(GridCells.Adaptive)` with the same minimum | CSS grid, two columns on narrow windows, more as the window grows |
| Category tile | Photo with `lg` corners, `categoryTile` wide and 4:5, the name on a `scrim` at the bottom in `onScrim`. In a horizontal scroller on Discover | Same, in a `LazyRow` | Same, in a horizontally scrolling row |
| Filter chip | Capsule: `surfaceVariant` fill when off, `primaryContainer` fill with a `check` icon when on; at least `touchTarget` tall to tap | `FilterChip` with the same colors | `button` with `aria-pressed`, same colors |
| Loading | A centered `ProgressView` for a whole screen; photo placeholders in `surfaceVariant` | `CircularProgressIndicator` | A spinner with `role="status"` and `common.loading` for screen readers |
| Error | `StateMessage` (Core/DesignSystem): the `offline` icon, `common.errorTitle`, `common.errorBody` and a Retry button (`common.retry`) | `StateMessage`, same content | `StateMessage`, same content |
| Empty | `StateMessage` with the screen's icon, an empty title and body, and an optional action | Same | Same |
| Confirmation (delete) | `.confirmationDialog` with a destructive button | `AlertDialog` | Native `<dialog>` |
| Editor (collection, wardrobe item) | A sheet with a `NavigationStack`, Cancel and Save in the toolbar, and a `Form` | A full-screen route with a top app bar (close and Save) | A route with a form in a card; Cancel and Save buttons at the bottom |
| Save to collection | A sheet (medium detent) listing collections with checkmarks | `ModalBottomSheet` | Native `<dialog>` |
| Transient message (saved, removed) | An overlay toast at the bottom that fades after a few seconds | `Snackbar` | A `role="status"` toast at the bottom |

## Accessibility

- Support Dynamic Type (iOS), font scaling (Android) and browser zoom (web).
- Every icon-only button has a label from contracts/strings.
- Touch targets are at least `touchTarget` (48) on every platform: above 44 pt on iOS and 44 px on web, and exactly 48 dp on Android. Use the token instead of a number. On web, aim for 44 px or more (WCAG 2.5.8 requires 24 px at least), as the header link and the radio rows do.
- Text meets WCAG AA contrast (4.5:1 for body text) in light and dark mode.
