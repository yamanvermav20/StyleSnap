package app.features.search

import androidx.compose.ui.test.assertIsDisplayed
import androidx.compose.ui.test.onAllNodesWithTag
import androidx.compose.ui.test.onNodeWithText
import androidx.compose.ui.test.performClick
import androidx.compose.ui.test.performTextInput
import app.R
import app.StyleScreenTest
import app.features.catalog.InMemoryCatalogRepository
import kotlinx.coroutines.CompletableDeferred
import org.junit.Test

class SearchScreenTest : StyleScreenTest() {
    @Test
    fun `AC-search-1 with no text shows every outfit and the result count`() {
        launch()
        shown("tabs.search").performClick()
        shown("search.results").assertIsDisplayed()
        shown("outfitCard.outfit-01").assertIsDisplayed()
        shown("outfitCard.outfit-05").assertIsDisplayed()
        shown("outfitCard.outfit-07").assertIsDisplayed()
        assertVisible("3 results")
    }

    @Test
    fun `AC-search-2 typing shows only matching outfits after a short pause`() {
        launch()
        shown("tabs.search").performClick()
        shown("search.field").performTextInput("ivory")
        shown("outfitCard.outfit-01").assertIsDisplayed()
        elapse(SEARCH_DEBOUNCE_MS)
        shown("outfitCard.outfit-05").assertIsDisplayed()
        org.junit.Assert.assertEquals(0, compose.onAllNodesWithTag("outfitCard.outfit-01").fetchSemanticsNodes().size)
    }

    @Test
    fun `AC-search-4 clear filters appears only when a filter is set and keeps the text`() {
        launch()
        shown("tabs.search").performClick()
        org.junit.Assert.assertEquals(0, compose.onAllNodesWithTag("search.clearFilters").fetchSemanticsNodes().size)
        shown("search.sort").performClick()
        compose.onNodeWithText(string(R.string.search_sort_newest)).performClick()
        shown("search.clearFilters").assertIsDisplayed()
        shown("search.field").performTextInput("tee")
        elapse(SEARCH_DEBOUNCE_MS)
        shown("search.clearFilters").performClick()
        compose.waitForIdle()
        org.junit.Assert.assertEquals(0, compose.onAllNodesWithTag("search.clearFilters").fetchSemanticsNodes().size)
        assertVisible("tee")
    }

    @Test
    fun `AC-search-5 with no results shows the empty state`() {
        launch()
        shown("tabs.search").performClick()
        shown("search.field").performTextInput("trench")
        elapse(SEARCH_DEBOUNCE_MS)
        shown("state.empty").assertIsDisplayed()
        assertVisible(string(R.string.search_empty_title))
    }

    @Test
    fun `AC-search-6 tapping a result opens Outfit detail`() {
        launch()
        shown("tabs.search").performClick()
        shown("outfitCard.outfit-07").performClick()
        assertVisible("Clean White Tee")
        shown("outfitDetail.save").assertIsDisplayed()
    }

    @Test
    fun `AC-search-8 shows the error state and try again searches again`() {
        val held = container()
        val gate = CompletableDeferred<Unit>()
        held.catalog.blocker = gate
        held.catalog.failReads = true
        launch(held.container)
        shown("tabs.search").performClick()
        gate.complete(Unit)
        compose.waitForIdle()
        shown("state.error").assertIsDisplayed()
        held.catalog.failReads = false
        held.catalog.blocker = null
        shown("state.retry").performClick()
        compose.waitForIdle()
        shown("outfitCard.outfit-01").assertIsDisplayed()
    }
}
