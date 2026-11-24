package app.features.catalog

import app.core.NotFoundException
import app.generated.Category
import app.generated.Outfit

/** The fixture catalog for previews and tests. Filtering matches the API. */
class InMemoryCatalogRepository(private val data: FixtureData = StyleFixture.data()) : CatalogRepository {
    /** When set, the next reads wait, so a test can show the loading state. */
    var blocker: kotlinx.coroutines.CompletableDeferred<Unit>? = null

    /** When true, reads fail the way a downed server would. */
    var failReads: Boolean = false

    override suspend fun listCategories(): List<Category> {
        block()
        return data.categories.map { category ->
            category.copy(outfitCount = data.outfits.count { it.categoryId == category.id }.toLong())
        }
    }

    override suspend fun listOutfits(filter: OutfitFilter): List<Outfit> {
        block()
        val query = filter.search?.trim()?.lowercase()?.takeIf { it.isNotEmpty() }
        return data.outfits.filter { outfit ->
            (query == null || outfit.searchText().contains(query)) &&
                (filter.categoryId == null || outfit.categoryId == filter.categoryId) &&
                (filter.season == null || outfit.season == filter.season || outfit.season == "allSeason") &&
                (filter.occasion == null || outfit.occasion == filter.occasion)
        }.sortedWith(outfitOrder(filter.sort))
    }

    override suspend fun getOutfit(id: String): Outfit {
        block()
        return data.outfits.find { it.id == id } ?: throw NotFoundException()
    }

    private suspend fun block() {
        blocker?.await()
        if (failReads) throw IllegalStateException("offline")
    }
}

internal fun outfitOrder(sort: String): Comparator<Outfit> = when (sort) {
    OutfitFilter.SORT_NEWEST -> compareByDescending<Outfit> { it.createdAt }.thenBy { it.id }
    else -> compareByDescending<Outfit> { it.likes }.thenBy { it.id }
}

internal fun Outfit.searchText(): String = buildList {
    add(title)
    add(description)
    add(creatorName)
    addAll(tags)
    items.forEach {
        add(it.name)
        add(it.brand)
    }
}.joinToString(" ").lowercase()
