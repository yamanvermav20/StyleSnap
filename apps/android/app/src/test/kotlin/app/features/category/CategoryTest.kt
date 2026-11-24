package app.features.category

import androidx.compose.ui.test.assertIsDisplayed
import androidx.compose.ui.test.onAllNodesWithTag
import androidx.compose.ui.test.performClick
import app.R
import app.StyleScreenTest
import app.features.catalog.InMemoryCatalogRepository
import app.features.catalog.StyleFixture
import kotlinx.coroutines.CompletableDeferred
import org.junit.Test

class CategoryTest : StyleScreenTest() {
    @Test
    fun `AC-category-1 shows the name description and only that style most liked first`() {
        launch()
        shown("categoryTile.minimal").performClick()
        assertVisible("Minimal")
        assertVisible(StyleFixture.categories[1].description)
        shown("outfitCard.outfit-05").assertIsDisplayed()
        shown("outfitCard.outfit-07").assertIsDisplayed()
        org.junit.Assert.assertEquals(0, compose.onAllNodesWithTag("outfitCard.outfit-01").fetchSemanticsNodes().size)
        assertBefore(shown("outfitCard.outfit-05"), shown("outfitCard.outfit-07"))
    }

    @Test
    fun `AC-category-2 tapping an outfit opens its detail`() {
        launch()
        shown("categoryTile.streetwear").performClick()
        shown("outfitCard.outfit-01").performClick()
        assertVisible(string(R.string.outfit_detail_details_title))
    }

    @Test
    fun `AC-category-3 shows loading error and empty states`() {
        val held = container()
        val gate = CompletableDeferred<Unit>()
        held.catalog.blocker = gate
        launch(held.container)
        org.junit.Assert.assertEquals(0, compose.onAllNodesWithTag("categoryTile.streetwear").fetchSemanticsNodes().size)
        gate.complete(Unit)
        pump()
        shown("categoryTile.minimal").performClick()
        shown("category.outfits").assertIsDisplayed()
    }

    @Test
    fun `AC-category-3 the error state offers try again`() {
        val held = container()
        launch(held.container)
        held.catalog.failReads = true
        shown("categoryTile.minimal").performClick()
        shown("state.error").assertIsDisplayed()
        shown("state.retry").assertIsDisplayed()
        held.catalog.failReads = false
        shown("state.retry").performClick()
        shown("category.outfits").assertIsDisplayed()
    }

    @Test
    fun `AC-category-3 an empty style shows the empty state`() {
        val empty = app.features.catalog.FixtureData(outfits = emptyList(), collections = mutableListOf())
        launch(container(empty, catalog = InMemoryCatalogRepository(empty)).container)
        shown("categoryTile.minimal").performClick()
        shown("state.empty").assertIsDisplayed()
        assertVisible(string(R.string.category_empty_title))
    }
}
