package app.features.outfitdetail

import androidx.compose.ui.test.assertIsDisplayed
import androidx.compose.ui.test.onAllNodesWithTag
import androidx.compose.ui.test.assertIsNotSelected
import androidx.compose.ui.test.assertIsSelected
import androidx.compose.ui.test.performClick
import app.R
import app.StyleScreenTest
import app.core.Notice
import app.core.NoticeCenter
import app.features.catalog.InMemoryCatalogRepository
import app.features.catalog.StyleFixture
import app.features.collections.CollectionEditorViewModel
import app.features.collections.InMemoryCollectionsRepository
import app.generated.CollectionInput
import kotlinx.coroutines.CompletableDeferred
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.test.UnconfinedTestDispatcher
import kotlinx.coroutines.test.resetMain
import kotlinx.coroutines.test.runTest
import kotlinx.coroutines.test.setMain
import org.junit.After
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

class OutfitDetailTest : StyleScreenTest() {
    @Test
    fun `AC-outfit-detail-1 shows photos title creator likes description and tags`() {
        launch()
        shown("outfitCard.outfit-01").performClick()
        shown("outfitDetail.photos").assertIsDisplayed()
        shown("outfitDetail.photoPosition").assertIsDisplayed()
        assertVisible("Photo 1 of 3")
        assertVisible("Orange Wall Street Edit")
        assertVisible("by Malik Osei")
        assertVisible("4821 likes")
        assertVisible(StyleFixture.outfits.first().description)
        assertVisible("blazer")
        assertVisible("shorts")
        assertVisible("bold")
    }

    @Test
    fun `AC-outfit-detail-2 details show style season and occasion and style opens Category`() {
        launch()
        shown("outfitCard.outfit-01").performClick()
        shown("outfitDetail.category").assertIsDisplayed()
        assertVisible("Streetwear")
        assertVisible(string(R.string.season_summer))
        assertVisible(string(R.string.occasion_everyday))
        shown("outfitDetail.category").performClick()
        assertVisible(StyleFixture.categories.first().description)
    }

    @Test
    fun `AC-outfit-detail-3 lists every item with name brand type and price`() {
        launch()
        shown("outfitCard.outfit-01").performClick()
        shown("outfitDetail.items").assertIsDisplayed()
        assertVisible("Relaxed linen blazer")
        assertVisible("Northline")
        assertVisible(string(R.string.item_type_outerwear))
        assertVisible("$189")
        assertVisible("Graphic cotton tee")
        assertVisible("$42")
        assertVisible("Volt runner")
    }

    @Test
    fun `AC-outfit-detail-5 Save reads Saved and the sheet checks collections that contain it`() {
        launch()
        shown("outfitCard.outfit-01").performClick()
        assertVisible(string(R.string.outfit_detail_saved))
        shown("outfitDetail.save").performClick()
        shown("saveToCollection.sheet").assertIsDisplayed()
        shown("saveToCollection.row.collection-weekend").assertIsSelected()
    }

    @Test
    fun `AC-outfit-detail-6 toggling a collection updates the check the button and shows a toast`() {
        launch()
        shown("outfitCard.outfit-01").performClick()
        shown("outfitDetail.save").performClick()
        shown("saveToCollection.row.collection-weekend").performClick()
        compose.waitForIdle()
        shown("saveToCollection.row.collection-weekend").assertIsNotSelected()
        assertVisible(string(R.string.outfit_detail_save))
        shown("toast").assertIsDisplayed()
        assertVisible("Removed from Weekend edits")
        shown("saveToCollection.row.collection-weekend").performClick()
        compose.waitForIdle()
        shown("saveToCollection.row.collection-weekend").assertIsSelected()
        assertVisible("Saved to Weekend edits")
    }

    @OptIn(ExperimentalCoroutinesApi::class)
    @Test
    fun `AC-outfit-detail-7 new collection from save creates it and adds the outfit`() = runTest {
        Dispatchers.setMain(UnconfinedTestDispatcher(testScheduler))
        try {
            val data = StyleFixture.data()
            val collections = InMemoryCollectionsRepository(data)
            val notices = NoticeCenter()
            val viewModel = CollectionEditorViewModel(collections, collectionId = null, addOutfitId = "outfit-01", notices = notices)
            viewModel.setName("Night out")
            viewModel.save()
            val created = collections.listCollections().first()
            assertEquals("Night out", created.name)
            assertEquals(listOf("outfit-01"), created.outfitIds)
            assertTrue(notices.current.value is Notice.Added)
            assertEquals(true, viewModel.uiState.value.finished)
        } finally {
            Dispatchers.resetMain()
        }
    }

    @Test
    fun `AC-outfit-detail-8 shows loading error and try again`() {
        val data = StyleFixture.data()
        val catalog = InMemoryCatalogRepository(data)
        val gate = CompletableDeferred<Unit>()
        catalog.blocker = gate
        val viewModel = OutfitDetailViewModel("outfit-01", catalog, InMemoryCollectionsRepository(data), NoticeCenter())
        compose.setContent {
            androidx.compose.runtime.CompositionLocalProvider(app.core.LocalAppContainer provides app.core.AppContainer.preview(data)) {
                app.core.designsystem.AppTheme(darkTheme = false) {
                    OutfitDetailScreen(viewModel, onBack = {}, onOpenCategory = {}, onNewCollection = {})
                }
            }
        }
        shown("state.loading").assertIsDisplayed()
        catalog.failReads = true
        gate.complete(Unit)
        pump()
        shown("state.error").assertIsDisplayed()
        catalog.failReads = false
        catalog.blocker = null
        shown("state.retry").performClick()
        assertVisible("Orange Wall Street Edit")
    }

    @Test
    fun `AC-outfit-detail-8 shows not found without retry`() {
        val data = StyleFixture.data()
        val viewModel = OutfitDetailViewModel(
            "missing",
            InMemoryCatalogRepository(data),
            InMemoryCollectionsRepository(data),
            NoticeCenter(),
        )
        compose.setContent {
            androidx.compose.runtime.CompositionLocalProvider(app.core.LocalAppContainer provides app.core.AppContainer.preview(data)) {
                app.core.designsystem.AppTheme(darkTheme = false) {
                    OutfitDetailScreen(viewModel, onBack = {}, onOpenCategory = {}, onNewCollection = {})
                }
            }
        }
        assertVisible(string(R.string.outfit_detail_not_found))
        org.junit.Assert.assertEquals(0, compose.onAllNodesWithTag("state.retry").fetchSemanticsNodes().size)
    }
}
