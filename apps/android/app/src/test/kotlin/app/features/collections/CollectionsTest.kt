package app.features.collections

import androidx.compose.ui.semantics.SemanticsProperties
import androidx.compose.ui.semantics.getOrNull
import androidx.compose.ui.test.assertIsDisplayed
import androidx.compose.ui.test.onNodeWithText
import androidx.compose.ui.test.performClick
import androidx.compose.ui.test.performTextInput
import app.R
import app.StyleScreenTest
import app.core.Notice
import app.core.NoticeCenter
import app.features.catalog.FixtureData
import app.features.catalog.StyleFixture
import app.generated.CollectionInput
import kotlinx.coroutines.CompletableDeferred
import kotlinx.coroutines.runBlocking
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.test.UnconfinedTestDispatcher
import kotlinx.coroutines.test.resetMain
import kotlinx.coroutines.test.runCurrent
import kotlinx.coroutines.test.runTest
import kotlinx.coroutines.test.setMain
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

class CollectionsTest : StyleScreenTest() {
    @Test
    fun `AC-collections-1 lists every collection most recently updated first`() {
        launch()
        shown("tabs.collections").performClick()
        shown("collections.list").assertIsDisplayed()
        shown("collectionCard.collection-weekend").assertIsDisplayed()
        assertVisible("Weekend edits")
        assertVisible("1 outfit")
    }

    @Test
    fun `AC-collections-2 empty state action opens the editor`() {
        val data = FixtureData(collections = mutableListOf())
        launch(container(data).container)
        shown("tabs.collections").performClick()
        shown("state.empty").assertIsDisplayed()
        shown("state.emptyAction").performClick()
        assertVisible(string(R.string.collection_editor_create_title))
        shown("collectionEditor.name").assertIsDisplayed()
    }

    @Test
    fun `AC-collections-3 creating a collection adds it to the top`() {
        launch()
        shown("tabs.collections").performClick()
        shown("collections.add").performClick()
        shown("collectionEditor.name").performTextInput("Night out")
        shown("collectionEditor.save").performClick()
        compose.waitForIdle()
        assertVisible("Night out")
        val nightTag = cards("collectionCard.").mapNotNull { it.config.getOrNull(SemanticsProperties.TestTag) }
            .first { it != "collectionCard.collection-weekend" }
        assertBefore(shown(nightTag), shown("collectionCard.collection-weekend"))
    }

    @OptIn(ExperimentalCoroutinesApi::class)
    @Test
    fun `AC-collections-4 the editor rejects an empty name and a name over 40 characters`() = runTest {
        Dispatchers.setMain(UnconfinedTestDispatcher(testScheduler))
        try {
            val collections = InMemoryCollectionsRepository(StyleFixture.data())
            val viewModel = CollectionEditorViewModel(collections, null, null, NoticeCenter())
            val before = collections.listCollections().size
            viewModel.save()
            assertEquals(CollectionEditorError.NameRequired, viewModel.uiState.value.error)
            assertEquals(before, collections.listCollections().size)
            viewModel.setName("n".repeat(41))
            viewModel.save()
            assertEquals(CollectionEditorError.NameTooLong, viewModel.uiState.value.error)
            assertEquals(before, collections.listCollections().size)
            assertFalse(viewModel.uiState.value.finished)
        } finally {
            Dispatchers.resetMain()
        }
    }

    @Test
    fun `AC-collections-5 tapping a collection opens its detail`() {
        launch()
        shown("tabs.collections").performClick()
        shown("collectionCard.collection-weekend").performClick()
        assertVisible("Weekend edits")
        assertVisible("Easy looks for slow Saturdays.")
        shown("outfitCard.outfit-01").assertIsDisplayed()
        shown("collectionDetail.outfits").assertIsDisplayed()
    }

    @OptIn(ExperimentalCoroutinesApi::class)
    @Test
    fun `AC-collections-6 editing saves the new name and description`() = runTest {
        Dispatchers.setMain(UnconfinedTestDispatcher(testScheduler))
        try {
            val collections = InMemoryCollectionsRepository(StyleFixture.data())
            val viewModel = CollectionEditorViewModel(collections, "collection-weekend", null, NoticeCenter())
            runCurrent()
            viewModel.setName("Saturday")
            viewModel.setDescription("Slow mornings")
            viewModel.save()
            val saved = collections.getCollection("collection-weekend")
            assertEquals("Saturday", saved.name)
            assertEquals("Slow mornings", saved.description)
            assertTrue(viewModel.uiState.value.finished)
        } finally {
            Dispatchers.resetMain()
        }
    }

    @Test
    fun `AC-collections-7 delete asks for confirmation then removes the collection`() {
        launch()
        shown("tabs.collections").performClick()
        shown("collectionCard.collection-weekend").performClick()
        shown("collectionDetail.delete").performClick()
        assertVisible(string(R.string.collection_detail_delete_title))
        shown("collectionDetail.confirmDelete").performClick()
        compose.waitForIdle()
        assertVisible(string(R.string.collections_empty_title))
    }

    @OptIn(ExperimentalCoroutinesApi::class)
    @Test
    fun `AC-collections-8 removing an outfit takes it out of the collection`() = runTest {
        Dispatchers.setMain(UnconfinedTestDispatcher(testScheduler))
        try {
            val data = StyleFixture.data()
            val collections = InMemoryCollectionsRepository(data)
            collections.addOutfit("collection-weekend", "outfit-07")
            collections.addOutfit("collection-weekend", "outfit-05")
            assertEquals(listOf("outfit-05", "outfit-07", "outfit-01"), collections.listOutfits("collection-weekend").map { it.id })
            val notices = NoticeCenter()
            val viewModel = CollectionDetailViewModel("collection-weekend", collections, notices)
            runCurrent()
            viewModel.remove("outfit-05")
            assertFalse(viewModel.uiState.value.outfits.any { it.id == "outfit-05" })
            assertFalse(collections.getCollection("collection-weekend").outfitIds.contains("outfit-05"))
        } finally {
            Dispatchers.resetMain()
        }
    }

    @Test
    fun `AC-collections-9 shows loading error and an empty collection`() {
        val held = container()
        val gate = CompletableDeferred<Unit>()
        held.collections.blocker = gate
        launch(held.container)
        shown("tabs.collections").performClick()
        shown("state.loading").assertIsDisplayed()
        held.collections.failReads = true
        gate.complete(Unit)
        compose.waitForIdle()
        shown("state.error").assertIsDisplayed()
        held.collections.failReads = false
        held.collections.blocker = null
        shown("state.retry").performClick()
        compose.waitForIdle()
        shown("collectionCard.collection-weekend").assertIsDisplayed()
    }

    @Test
    fun `AC-collections-9 an empty collection shows its empty state`() {
        val data = StyleFixture.data()
        val collections = InMemoryCollectionsRepository(data)
        runBlocking { collections.createCollection(CollectionInput(name = "Empty", description = "")) }
        launch(container(data, collections = collections).container)
        shown("tabs.collections").performClick()
        compose.onNodeWithText("Empty").performClick()
        shown("state.empty").assertIsDisplayed()
        assertVisible(string(R.string.collection_detail_empty_title))
    }

    @OptIn(ExperimentalCoroutinesApi::class)
    @Test
    fun `AC-collections-10 a failed save keeps the editor open with the error`() = runTest {
        Dispatchers.setMain(UnconfinedTestDispatcher(testScheduler))
        try {
            val collections = InMemoryCollectionsRepository(StyleFixture.data())
            collections.failWrites = true
            val viewModel = CollectionEditorViewModel(collections, null, null, NoticeCenter())
            viewModel.setName("Night out")
            viewModel.save()
            assertEquals(CollectionEditorError.SaveFailed, viewModel.uiState.value.error)
            assertFalse(viewModel.uiState.value.finished)
            assertTrue(collections.listCollections().none { it.name == "Night out" })
        } finally {
            Dispatchers.resetMain()
        }
    }
}
