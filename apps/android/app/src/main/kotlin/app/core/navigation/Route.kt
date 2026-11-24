package app.core.navigation

import androidx.navigation3.runtime.NavKey
import kotlinx.serialization.Serializable

/** The four top-level sections, in tab order. */
enum class Section {
    Discover,
    Search,
    Collections,
    Wardrobe,
}

val Section.root: Route
    get() = when (this) {
        Section.Discover -> Route.Feed
        Section.Search -> Route.Search
        Section.Collections -> Route.Collections
        Section.Wardrobe -> Route.Wardrobe
    }

/** Screens on a tab's back stack. Names match spec/navigation.md. */
sealed interface Route : NavKey {
    @Serializable data object Feed : Route
    @Serializable data object Search : Route
    @Serializable data object Collections : Route
    @Serializable data object Wardrobe : Route
    @Serializable data class Category(val id: String) : Route
    @Serializable data class OutfitDetail(val id: String) : Route
    @Serializable data class CollectionDetail(val id: String) : Route
    @Serializable data class CollectionEditor(val collectionId: String = "", val addOutfitId: String = "") : Route
    @Serializable data class WardrobeEditor(val itemId: String = "") : Route
    @Serializable data object Settings : Route
}
