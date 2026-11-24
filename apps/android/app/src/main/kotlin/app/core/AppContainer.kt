package app.core

import android.content.Context
import androidx.compose.runtime.staticCompositionLocalOf
import androidx.datastore.preferences.preferencesDataStore
import app.features.catalog.ApiCatalogRepository
import app.features.catalog.CatalogRepository
import app.features.catalog.FixtureData
import app.features.catalog.InMemoryCatalogRepository
import app.features.catalog.StyleFixture
import app.features.collections.ApiCollectionsRepository
import app.features.collections.CollectionsRepository
import app.features.collections.InMemoryCollectionsRepository
import app.features.settings.DataStoreSettingsRepository
import app.features.settings.InMemorySettingsRepository
import app.features.settings.SettingsRepository
import app.features.wardrobe.ApiWardrobeRepository
import app.features.wardrobe.InMemoryWardrobeRepository
import app.features.wardrobe.WardrobeRepository

private val Context.settingsDataStore by preferencesDataStore(name = "settings")

/**
 * The app's dependencies, created once at launch. Composables read it from [LocalAppContainer].
 */
class AppContainer(
    val settingsRepository: SettingsRepository,
    val catalogRepository: CatalogRepository,
    val collectionsRepository: CollectionsRepository,
    val wardrobeRepository: WardrobeRepository,
    val notices: NoticeCenter = NoticeCenter(),
) {
    companion object {
        fun live(context: Context) = AppContainer(
            settingsRepository = DataStoreSettingsRepository(context.applicationContext.settingsDataStore),
            catalogRepository = ApiCatalogRepository(),
            collectionsRepository = ApiCollectionsRepository(),
            wardrobeRepository = ApiWardrobeRepository(),
        )

        /** In-memory dependencies, for previews and tests. */
        fun preview(data: FixtureData = StyleFixture.data()) = AppContainer(
            settingsRepository = InMemorySettingsRepository(),
            catalogRepository = InMemoryCatalogRepository(data),
            collectionsRepository = InMemoryCollectionsRepository(data),
            wardrobeRepository = InMemoryWardrobeRepository(data),
        )
    }
}

val LocalAppContainer = staticCompositionLocalOf<AppContainer> { error("AppContainer not provided") }
