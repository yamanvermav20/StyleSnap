package app

import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.ui.semantics.SemanticsProperties
import androidx.compose.ui.semantics.getOrNull
import androidx.compose.ui.test.SemanticsMatcher
import androidx.compose.ui.test.SemanticsNodeInteraction
import androidx.compose.ui.test.junit4.v2.createComposeRule
import androidx.compose.ui.test.onAllNodesWithText
import androidx.compose.ui.test.onNodeWithTag
import androidx.compose.ui.test.performScrollTo
import androidx.test.core.app.ApplicationProvider
import android.content.Context
import app.core.AppContainer
import app.core.LocalAppContainer
import app.core.designsystem.AppTheme
import app.core.navigation.AppNavigation
import app.features.catalog.FixtureData
import app.features.catalog.InMemoryCatalogRepository
import app.features.catalog.StyleFixture
import app.features.collections.InMemoryCollectionsRepository
import app.features.settings.InMemorySettingsRepository
import app.features.wardrobe.InMemoryWardrobeRepository
import org.junit.Assert.assertTrue
import org.junit.Rule
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner
import org.robolectric.annotation.Config

@RunWith(RobolectricTestRunner::class)
@Config(sdk = [35], qualifiers = "w480dp-h2400dp")
abstract class StyleScreenTest {
    @get:Rule
    val compose = createComposeRule()

    protected fun string(id: Int, vararg args: Any): String =
        ApplicationProvider.getApplicationContext<Context>().resources.let { resources ->
            if (args.isEmpty()) resources.getString(id) else resources.getString(id, *args)
        }

    protected fun launch(container: AppContainer = AppContainer.preview()) {
        compose.setContent {
            CompositionLocalProvider(LocalAppContainer provides container) {
                AppTheme(darkTheme = false) {
                    AppNavigation(loadRemotePhotos = false, autoDismissToasts = false)
                }
            }
        }
        pump()
    }

    /** The Compose rule drives the main looper; give view models a turn, then lay out. */
    protected fun pump() {
        repeat(8) {
            org.robolectric.shadows.ShadowLooper.idleMainLooper()
            compose.waitForIdle()
        }
    }

    protected fun elapse(millis: Long) {
        org.robolectric.shadows.ShadowLooper.idleMainLooper(millis, java.util.concurrent.TimeUnit.MILLISECONDS)
        compose.waitForIdle()
    }

    protected fun shown(id: String): SemanticsNodeInteraction {
        pump()
        val node = compose.onNodeWithTag(id)
        // Lists are taller than a phone; bring the node into the viewport when it scrolls.
        runCatching { node.performScrollTo() }
        return node
    }

    protected fun container(
        data: FixtureData = StyleFixture.data(),
        catalog: InMemoryCatalogRepository = InMemoryCatalogRepository(data),
        collections: InMemoryCollectionsRepository = InMemoryCollectionsRepository(data),
        wardrobe: InMemoryWardrobeRepository = InMemoryWardrobeRepository(data),
    ) = Held(catalog, collections, wardrobe, AppContainer(
        settingsRepository = InMemorySettingsRepository(),
        catalogRepository = catalog,
        collectionsRepository = collections,
        wardrobeRepository = wardrobe,
    ))

    protected fun assertVisible(text: String) {
        pump()
        assertTrue("Expected to see \"$text\"", visible(text).isNotEmpty())
    }

    protected fun assertNotVisible(text: String) {
        assertTrue("Did not expect to see \"$text\"", visible(text).isEmpty())
    }

    /** Reading order: higher on the screen, then further left. */
    protected fun assertBefore(first: SemanticsNodeInteraction, second: SemanticsNodeInteraction) {
        val a = first.fetchSemanticsNode().boundsInRoot
        val b = second.fetchSemanticsNode().boundsInRoot
        assertTrue(
            "Expected ${a.top},${a.left} before ${b.top},${b.left}",
            a.top < b.top - 1f || (kotlin.math.abs(a.top - b.top) < 1f && a.left < b.left),
        )
    }

    protected fun cards(prefix: String) =
        compose.onAllNodes(SemanticsMatcher("tag $prefix") {
            it.config.getOrNull(SemanticsProperties.TestTag)?.startsWith(prefix) == true
        }).fetchSemanticsNodes()

    private fun visible(text: String) =
        compose.onAllNodesWithText(text).fetchSemanticsNodes() +
            compose.onAllNodesWithText(text, useUnmergedTree = true).fetchSemanticsNodes()
}

class Held(
    val catalog: InMemoryCatalogRepository,
    val collections: InMemoryCollectionsRepository,
    val wardrobe: InMemoryWardrobeRepository,
    val container: AppContainer,
)

