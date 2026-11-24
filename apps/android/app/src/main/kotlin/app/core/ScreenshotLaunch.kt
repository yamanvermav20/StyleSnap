package app.core

import android.content.Intent
import app.core.navigation.Route
import app.core.navigation.Section
import app.core.navigation.root
import app.features.settings.Appearance

/**
 * Intent extras that open a named screen for screenshot capture.
 * Screenshots use the live API (the seeded backend), not the in-memory fixture.
 *
 * - `screenshotScreen`: feed, category, outfit-detail, search, collections,
 *   collection-detail, collection-editor, wardrobe, wardrobe-editor, settings
 * - `screenshotAppearance`: `light` or `dark`, applied before the first frame
 * - `screenshotCategoryId`, `screenshotOutfitId`, `screenshotCollectionId`, `screenshotWardrobeItemId`
 */
data class ScreenshotLaunch(
    val screen: String,
    val appearance: Appearance?,
    val categoryId: String,
    val outfitId: String,
    val collectionId: String,
    val wardrobeItemId: String,
) {
    val section: Section
        get() = when (screen) {
            "search" -> Section.Search
            "collections", "collection-detail", "collection-editor" -> Section.Collections
            "wardrobe", "wardrobe-editor" -> Section.Wardrobe
            else -> Section.Discover
        }

    /** The back stack for [section], including a pushed screen when the shot needs one. */
    fun routes(section: Section): List<Route> {
        val root = section.root
        if (section != this.section) return listOf(root)
        val pushed: Route? = when (screen) {
            "category" -> Route.Category(categoryId)
            "outfit-detail" -> Route.OutfitDetail(outfitId)
            "collection-detail" -> Route.CollectionDetail(collectionId)
            "collection-editor" -> Route.CollectionEditor(collectionId = collectionId)
            "wardrobe-editor" -> Route.WardrobeEditor(itemId = wardrobeItemId)
            "settings" -> Route.Settings
            else -> null
        }
        return if (pushed == null) listOf(root) else listOf(root, pushed)
    }

    companion object {
        const val SCREEN_EXTRA = "screenshotScreen"
        const val APPEARANCE_EXTRA = "screenshotAppearance"
        const val CATEGORY_EXTRA = "screenshotCategoryId"
        const val OUTFIT_EXTRA = "screenshotOutfitId"
        const val COLLECTION_EXTRA = "screenshotCollectionId"
        const val WARDROBE_EXTRA = "screenshotWardrobeItemId"

        const val DEFAULT_CATEGORY_ID = "evening"
        const val DEFAULT_OUTFIT_ID = "outfit-17"
        const val DEFAULT_COLLECTION_ID = "collection-weekend"
        const val DEFAULT_WARDROBE_ITEM_ID = "wardrobe-03"

        fun from(intent: Intent?): ScreenshotLaunch? {
            val screen = intent?.getStringExtra(SCREEN_EXTRA)?.takeIf { it.isNotBlank() } ?: return null
            val appearance = when (intent.getStringExtra(APPEARANCE_EXTRA)) {
                "light" -> Appearance.Light
                "dark" -> Appearance.Dark
                else -> null
            }
            return ScreenshotLaunch(
                screen = screen,
                appearance = appearance,
                categoryId = intent.getStringExtra(CATEGORY_EXTRA) ?: DEFAULT_CATEGORY_ID,
                outfitId = intent.getStringExtra(OUTFIT_EXTRA) ?: DEFAULT_OUTFIT_ID,
                collectionId = intent.getStringExtra(COLLECTION_EXTRA) ?: DEFAULT_COLLECTION_ID,
                wardrobeItemId = intent.getStringExtra(WARDROBE_EXTRA) ?: DEFAULT_WARDROBE_ITEM_ID,
            )
        }
    }
}
