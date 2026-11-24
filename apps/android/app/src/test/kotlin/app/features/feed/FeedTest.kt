package app.features.feed

import androidx.compose.ui.test.assertIsDisplayed
import androidx.compose.ui.test.performClick
import app.R
import app.StyleScreenTest
import app.features.catalog.FixtureData
import app.features.catalog.InMemoryCatalogRepository
import app.features.catalog.StyleFixture
import kotlinx.coroutines.CompletableDeferred
import org.junit.Assert.assertTrue
import org.junit.Test

class FeedTest : StyleScreenTest() {
    @Test
    fun `AC-feed-1 four sections start on Discover`() {
        launch()
        shown("tabs.discover").assertIsDisplayed()
        shown("tabs.search").assertIsDisplayed()
        shown("tabs.collections").assertIsDisplayed()
        shown("tabs.wardrobe").assertIsDisplayed()
        assertVisible(string(R.string.feed_trending_title))
        shown("tabs.search").performClick()
        assertVisible(string(R.string.search_placeholder))
        assertNotVisible(string(R.string.feed_trending_title))
    }

    @Test
    fun `AC-feed-2 shows every category tile in API order`() {
        launch()
        shown("feed.categories").assertIsDisplayed()
        shown("categoryTile.streetwear").assertIsDisplayed()
        shown("categoryTile.minimal").assertIsDisplayed()
        val street = shown("categoryTile.streetwear").fetchSemanticsNode().boundsInRoot.left
        val minimal = shown("categoryTile.minimal").fetchSemanticsNode().boundsInRoot.left
        assertTrue(street < minimal)
        assertVisible("Streetwear")
        assertVisible("Minimal")
    }

    @Test
    fun `AC-feed-3 shows every outfit most liked first with creator and likes`() {
        launch()
        shown("feed.outfits").assertIsDisplayed()
        shown("outfitCard.outfit-01").assertIsDisplayed()
        shown("outfitCard.outfit-05").assertIsDisplayed()
        shown("outfitCard.outfit-07").assertIsDisplayed()
        assertVisible("Orange Wall Street Edit")
        assertVisible("by Malik Osei")
        assertVisible("4821 likes")
        val first = shown("outfitCard.outfit-01").fetchSemanticsNode().boundsInRoot
        val second = shown("outfitCard.outfit-05").fetchSemanticsNode().boundsInRoot
        val third = shown("outfitCard.outfit-07").fetchSemanticsNode().boundsInRoot
        assertTrue(first.top <= second.top && first.left < second.left)
        assertTrue(third.top > first.top)
    }

    @Test
    fun `AC-feed-4 tapping a category opens Category`() {
        launch()
        shown("categoryTile.streetwear").performClick()
        assertVisible(StyleFixture.categories.first().description)
        shown("category.outfits").assertIsDisplayed()
    }

    @Test
    fun `AC-feed-5 tapping an outfit opens Outfit detail`() {
        launch()
        shown("outfitCard.outfit-01").performClick()
        assertVisible(string(R.string.outfit_detail_items_title))
        shown("outfitDetail.photos").assertIsDisplayed()
    }

    @Test
    fun `AC-feed-6 loading then error then try again shows the feed`() {
        val held = container()
        val gate = CompletableDeferred<Unit>()
        held.catalog.blocker = gate
        launch(held.container)
        shown("state.loading").assertIsDisplayed()
        held.catalog.failReads = true
        gate.complete(Unit)
        compose.waitForIdle()
        shown("state.error").assertIsDisplayed()
        shown("state.retry").assertIsDisplayed()
        held.catalog.failReads = false
        held.catalog.blocker = null
        shown("state.retry").performClick()
        compose.waitForIdle()
        shown("outfitCard.outfit-01").assertIsDisplayed()
    }

    @Test
    fun `AC-feed-7 with no outfits shows the empty state`() {
        val data = FixtureData(outfits = emptyList(), collections = mutableListOf())
        launch(container(data, catalog = InMemoryCatalogRepository(data)).container)
        shown("state.empty").assertIsDisplayed()
        assertVisible(string(R.string.feed_empty_title))
        assertVisible(string(R.string.feed_empty_body))
    }

    @Test
    fun `AC-feed-8 the settings entry opens Settings`() {
        launch()
        shown("feed.openSettings").performClick()
        assertVisible(string(R.string.settings_title))
        shown("settings.appearance").assertIsDisplayed()
        shown("settings.version").assertIsDisplayed()
    }
}
