package app.features.catalog

import app.core.formatPrice
import app.features.search.SEARCH_DEBOUNCE_MS
import app.features.search.SearchViewModel
import app.generated.Outfit
import kotlinx.coroutines.CompletableDeferred
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.test.StandardTestDispatcher
import kotlinx.coroutines.test.advanceTimeBy
import kotlinx.coroutines.test.resetMain
import kotlinx.coroutines.test.runCurrent
import kotlinx.coroutines.test.runTest
import kotlinx.coroutines.test.setMain
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test

@OptIn(ExperimentalCoroutinesApi::class)
class CatalogBehaviorTest {

    @Test
    fun `AC-outfit-detail-4 prices format as whole dollars or two decimals`() {
        assertEquals("189", formatPrice(189.0))
        assertEquals("42", formatPrice(42.0))
        assertEquals("42.50", formatPrice(42.5))
        assertEquals("42.50", formatPrice(42.499))
    }

    @Test
    fun `AC-search-3 category season occasion and sort are applied together`() = runTest {
        Dispatchers.setMain(StandardTestDispatcher(testScheduler))
        val allSeason = StyleFixture.outfits[2].copy(
            id = "outfit-all",
            title = "All Season Layer",
            season = "allSeason",
            occasion = "work",
            likes = 10,
            createdAt = "2026-11-18T12:00:00.000Z",
            categoryId = "minimal",
        )
        val data = FixtureData(outfits = StyleFixture.outfits + allSeason)
        val catalog = InMemoryCatalogRepository(data)

        val summer = catalog.listOutfits(OutfitFilter(season = "summer"))
        assertEquals(listOf("outfit-01", "outfit-07", "outfit-all"), summer.map { it.id })

        val workNewest = catalog.listOutfits(
            OutfitFilter(categoryId = "minimal", occasion = "work", sort = OutfitFilter.SORT_NEWEST),
        )
        assertEquals(listOf("outfit-all", "outfit-05"), workNewest.map { it.id })

        val linen = catalog.listOutfits(OutfitFilter(search = "LINEN"))
        assertEquals(listOf("outfit-01"), linen.map { it.id })

        val missing = catalog.listOutfits(OutfitFilter(search = "trench"))
        assertTrue(missing.isEmpty())

        val popular = catalog.listOutfits(OutfitFilter())
        assertEquals(listOf("outfit-01", "outfit-05", "outfit-07", "outfit-all"), popular.map { it.id })
        Dispatchers.resetMain()
    }

    @Test
    fun `AC-search-3 the view model sends the text and filters and shows what comes back`() = runTest {
        Dispatchers.setMain(StandardTestDispatcher(testScheduler))
        val catalog = RecordingCatalog(InMemoryCatalogRepository(StyleFixture.data()))
        val viewModel = SearchViewModel(catalog)
        runCurrent()
        viewModel.onQueryChange("ivory")
        advanceTimeBy(SEARCH_DEBOUNCE_MS)
        runCurrent()
        viewModel.setSeason("spring")
        runCurrent()
        viewModel.setCategory("minimal")
        runCurrent()
        viewModel.setOccasion("work")
        runCurrent()
        viewModel.setSort(OutfitFilter.SORT_NEWEST)
        runCurrent()

        val sent = catalog.filters.last()
        assertEquals("ivory", sent.search)
        assertEquals("minimal", sent.categoryId)
        assertEquals("spring", sent.season)
        assertEquals("work", sent.occasion)
        assertEquals(OutfitFilter.SORT_NEWEST, sent.sort)
        assertEquals(listOf("outfit-05"), viewModel.uiState.value.results.map { it.id })
        Dispatchers.resetMain()
    }

    @Test
    fun `AC-search-7 an older request never replaces a newer one`() = runTest {
        Dispatchers.setMain(StandardTestDispatcher(testScheduler))
        val inner = InMemoryCatalogRepository(StyleFixture.data())
        val catalog = GatedCatalog(inner)
        val slow = CompletableDeferred<Unit>()
        catalog.gates["linen"] = slow
        val viewModel = SearchViewModel(catalog)
        runCurrent()

        viewModel.onQueryChange("linen")
        advanceTimeBy(SEARCH_DEBOUNCE_MS)
        runCurrent()
        viewModel.onQueryChange("ivory")
        advanceTimeBy(SEARCH_DEBOUNCE_MS)
        runCurrent()
        assertEquals(listOf("outfit-05"), viewModel.uiState.value.results.map { it.id })

        slow.complete(Unit)
        runCurrent()
        assertEquals(listOf("outfit-05"), viewModel.uiState.value.results.map { it.id })
        assertFalse(viewModel.uiState.value.results.any { it.id == "outfit-01" })
        Dispatchers.resetMain()
    }

    @Test
    fun `AC-search-2 typing waits out the debounce before searching`() = runTest {
        Dispatchers.setMain(StandardTestDispatcher(testScheduler))
        val catalog = RecordingCatalog(InMemoryCatalogRepository(StyleFixture.data()))
        val viewModel = SearchViewModel(catalog)
        runCurrent()
        val before = catalog.filters.size
        viewModel.onQueryChange("tee")
        advanceTimeBy(SEARCH_DEBOUNCE_MS - 1)
        runCurrent()
        assertEquals(before, catalog.filters.size)
        assertNull(catalog.filters.last().search)
        advanceTimeBy(1)
        runCurrent()
        assertEquals("tee", catalog.filters.last().search)
        assertEquals(listOf("outfit-01", "outfit-07"), viewModel.uiState.value.results.map { it.id })
        Dispatchers.resetMain()
    }
}

private class RecordingCatalog(private val inner: CatalogRepository) : CatalogRepository {
    val filters = mutableListOf<OutfitFilter>()
    override suspend fun listCategories() = inner.listCategories()
    override suspend fun getOutfit(id: String) = inner.getOutfit(id)
    override suspend fun listOutfits(filter: OutfitFilter): List<Outfit> {
        filters += filter
        return inner.listOutfits(filter)
    }
}

private class GatedCatalog(private val inner: CatalogRepository) : CatalogRepository {
    val gates = mutableMapOf<String, CompletableDeferred<Unit>>()
    override suspend fun listCategories() = inner.listCategories()
    override suspend fun getOutfit(id: String) = inner.getOutfit(id)
    override suspend fun listOutfits(filter: OutfitFilter): List<Outfit> {
        gates[filter.search]?.await()
        return inner.listOutfits(filter)
    }
}
