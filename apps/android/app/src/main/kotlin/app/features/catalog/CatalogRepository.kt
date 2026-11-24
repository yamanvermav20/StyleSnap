package app.features.catalog

import app.generated.Category
import app.generated.Outfit

/** What `listOutfits` accepts. Empty text is omitted; sort defaults to popular. */
data class OutfitFilter(
    val search: String? = null,
    val categoryId: String? = null,
    val season: String? = null,
    val occasion: String? = null,
    val sort: String = SORT_POPULAR,
) {
    companion object {
        const val SORT_POPULAR = "popular"
        const val SORT_NEWEST = "newest"
    }
}

/** Outfits and the styles they belong to. Nothing is stored on the device. */
interface CatalogRepository {
    suspend fun listCategories(): List<Category>
    suspend fun listOutfits(filter: OutfitFilter = OutfitFilter()): List<Outfit>
    suspend fun getOutfit(id: String): Outfit
}
