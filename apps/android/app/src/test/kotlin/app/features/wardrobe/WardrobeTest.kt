package app.features.wardrobe

import androidx.compose.ui.test.assertIsDisplayed
import androidx.compose.ui.test.onNodeWithContentDescription
import androidx.compose.ui.test.onAllNodesWithTag
import androidx.compose.ui.test.assertIsOff
import androidx.compose.ui.test.assertIsOn
import androidx.compose.ui.test.assertIsSelected
import androidx.compose.ui.test.performClick
import androidx.compose.ui.test.performTextInput
import androidx.compose.ui.test.performTextReplacement
import app.R
import app.StyleScreenTest
import app.features.catalog.FixtureData
import app.features.catalog.StyleFixture
import app.generated.WardrobeItemInput
import kotlinx.coroutines.CompletableDeferred
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

class WardrobeTest : StyleScreenTest() {
    @Test
    fun `AC-wardrobe-1 lists every item newest first with photo name brand and stars`() {
        launch()
        shown("tabs.wardrobe").performClick()
        shown("wardrobe.items").assertIsDisplayed()
        shown("wardrobeCard.wardrobe-01").assertIsDisplayed()
        shown("wardrobeCard.wardrobe-04").assertIsDisplayed()
        assertVisible("White crew tee")
        assertVisible("Field & Co")
        assertVisible("White court sneakers")
        compose.onNodeWithContentDescription(string(R.string.wardrobe_favorite)).assertIsDisplayed()
        val newer = shown("wardrobeCard.wardrobe-01").fetchSemanticsNode().boundsInRoot.top
        val older = shown("wardrobeCard.wardrobe-04").fetchSemanticsNode().boundsInRoot.top
        assertTrue(newer <= older)
    }

    @Test
    fun `AC-wardrobe-2 a type chip shows only that type and All shows every item`() {
        launch()
        shown("tabs.wardrobe").performClick()
        shown("wardrobe.filter.shoes").performClick()
        compose.waitForIdle()
        shown("wardrobeCard.wardrobe-04").assertIsDisplayed()
        compose.onAllNodesWithTag("wardrobeCard.wardrobe-01").fetchSemanticsNodes().let { assertEquals(0, it.size) }
        shown("wardrobe.filter.all").performClick()
        compose.waitForIdle()
        shown("wardrobeCard.wardrobe-01").assertIsDisplayed()
        shown("wardrobeCard.wardrobe-04").assertIsDisplayed()
    }

    @Test
    fun `AC-wardrobe-3 empty wardrobe offers add and a filtered empty state differs`() {
        val empty = FixtureData(wardrobe = mutableListOf())
        launch(container(empty).container)
        shown("tabs.wardrobe").performClick()
        shown("state.empty").assertIsDisplayed()
        assertVisible(string(R.string.wardrobe_empty_title))
        shown("state.emptyAction").assertIsDisplayed()
    }

    @Test
    fun `AC-wardrobe-3 with none of the chosen type shows the filtered empty state`() {
        launch()
        shown("tabs.wardrobe").performClick()
        shown("wardrobe.filter.dress").performClick()
        assertVisible(string(R.string.wardrobe_empty_filtered_title))
        assertEquals(0, compose.onAllNodesWithTag("state.emptyAction").fetchSemanticsNodes().size)
    }

    @Test
    fun `AC-wardrobe-4 add opens the editor with defaults and photos of the selected type`() {
        launch()
        shown("tabs.wardrobe").performClick()
        shown("wardrobe.add").performClick()
        assertVisible(string(R.string.wardrobe_editor_create_title))
        assertVisible(string(R.string.item_type_top))
        assertVisible(string(R.string.season_all_season))
        shown("wardrobeEditor.favorite").assertIsOff()
        shown("wardrobeEditor.photo.photo-whiteTee").assertIsDisplayed()
        compose.onAllNodesWithTag("wardrobeEditor.photo.photo-whiteSneaker").fetchSemanticsNodes().let { assertEquals(0, it.size) }
    }

    @OptIn(ExperimentalCoroutinesApi::class)
    @Test
    fun `AC-wardrobe-5 saving a new item with a name and photo puts it first`() = runTest {
        Dispatchers.setMain(UnconfinedTestDispatcher(testScheduler))
        try {
            val data = StyleFixture.data()
            val repository = InMemoryWardrobeRepository(data)
            val viewModel = WardrobeEditorViewModel(repository, itemId = null)
            runCurrent()
            viewModel.setName("Linen shirt")
            viewModel.selectPhoto(StyleFixture.photos.first().imageUrl)
            viewModel.save()
            val items = repository.list(null)
            assertEquals("Linen shirt", items.first().name)
            assertTrue(items.first().createdAt > items[1].createdAt)
        } finally {
            Dispatchers.resetMain()
        }
    }

    @OptIn(ExperimentalCoroutinesApi::class)
    @Test
    fun `AC-wardrobe-6 the editor rejects a missing name or photo`() = runTest {
        Dispatchers.setMain(UnconfinedTestDispatcher(testScheduler))
        try {
            val repository = InMemoryWardrobeRepository(StyleFixture.data())
            val before = repository.list(null).size
            val viewModel = WardrobeEditorViewModel(repository, null)
            runCurrent()
            viewModel.save()
            assertEquals(WardrobeEditorError.NameRequired, viewModel.uiState.value.error)
            viewModel.setName("Linen shirt")
            viewModel.save()
            assertEquals(WardrobeEditorError.PhotoRequired, viewModel.uiState.value.error)
            assertEquals(before, repository.list(null).size)
            assertFalse(viewModel.uiState.value.finished)
        } finally {
            Dispatchers.resetMain()
        }
    }

    @Test
    fun `AC-wardrobe-7 tapping an item opens it filled in and saving updates it`() {
        launch()
        shown("tabs.wardrobe").performClick()
        shown("wardrobeCard.wardrobe-01").performClick()
        assertVisible(string(R.string.wardrobe_editor_edit_title))
        assertVisible("White crew tee")
        assertVisible("Field & Co")
        shown("wardrobeEditor.favorite").assertIsOn()
        shown("wardrobeEditor.photo.photo-whiteTee").assertIsSelected()
        shown("wardrobeEditor.name").performTextReplacement("Favorite tee")
        shown("wardrobeEditor.save").performClick()
        compose.waitForIdle()
        assertVisible("Favorite tee")
    }

    @Test
    fun `AC-wardrobe-8 deleting asks for confirmation then removes the item`() {
        launch()
        shown("tabs.wardrobe").performClick()
        shown("wardrobeCard.wardrobe-04").performClick()
        shown("wardrobeEditor.delete").performClick()
        assertVisible(string(R.string.wardrobe_editor_delete_title))
        shown("wardrobeEditor.confirmDelete").performClick()
        compose.waitForIdle()
        compose.onAllNodesWithTag("wardrobeCard.wardrobe-04").fetchSemanticsNodes().let { assertEquals(0, it.size) }
        shown("wardrobeCard.wardrobe-01").assertIsDisplayed()
    }

    @Test
    fun `AC-wardrobe-9 shows loading and error and a failed save keeps the editor open`() {
        val held = container()
        val gate = CompletableDeferred<Unit>()
        held.wardrobe.blocker = gate
        launch(held.container)
        shown("tabs.wardrobe").performClick()
        shown("state.loading").assertIsDisplayed()
        held.wardrobe.failReads = true
        gate.complete(Unit)
        compose.waitForIdle()
        shown("state.error").assertIsDisplayed()
        held.wardrobe.failReads = false
        held.wardrobe.blocker = null
        shown("state.retry").performClick()
        compose.waitForIdle()
        shown("wardrobe.add").performClick()
        held.wardrobe.failWrites = true
        shown("wardrobeEditor.name").performTextInput("Linen shirt")
        shown("wardrobeEditor.photo.photo-whiteTee").performClick()
        shown("wardrobeEditor.save").performClick()
        compose.waitForIdle()
        shown("wardrobeEditor.error").assertIsDisplayed()
        assertVisible(string(R.string.common_save_failed))
        assertVisible(string(R.string.wardrobe_editor_create_title))
    }
}
