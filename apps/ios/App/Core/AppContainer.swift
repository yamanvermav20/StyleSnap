import Foundation
import Observation

/// The app's dependencies, created once at launch. Screens read it from the environment.
/// Swap an implementation here (for example, a backend-backed repository) without touching screens.
@Observable
final class AppContainer {
    let settingsRepository: any SettingsRepository
    let catalogRepository: any CatalogRepository
    let collectionsRepository: any CollectionsRepository
    let wardrobeRepository: any WardrobeRepository

    init(
        settingsRepository: any SettingsRepository,
        catalogRepository: any CatalogRepository,
        collectionsRepository: any CollectionsRepository,
        wardrobeRepository: any WardrobeRepository
    ) {
        self.settingsRepository = settingsRepository
        self.catalogRepository = catalogRepository
        self.collectionsRepository = collectionsRepository
        self.wardrobeRepository = wardrobeRepository
    }

    /// The StyleSnap API, with settings in UserDefaults unless another settings store is given.
    static func live(settingsRepository: (any SettingsRepository)? = nil) -> AppContainer {
        AppContainer(
            settingsRepository: settingsRepository ?? UserDefaultsSettingsRepository(defaults: .standard),
            catalogRepository: ApiCatalogRepository(),
            collectionsRepository: ApiCollectionsRepository(),
            wardrobeRepository: ApiWardrobeRepository()
        )
    }

    /// In-memory dependencies holding the shared fixture, for previews and tests. `empty` leaves out
    /// the outfits, collections and wardrobe items (categories and the photo library stay).
    static func preview(appearance: Appearance = .system, faults: InMemoryFaults = InMemoryFaults(), empty: Bool = false) -> AppContainer {
        let clock = InMemoryClock()
        let outfits = empty ? [] : Fixtures.outfits
        return AppContainer(
            settingsRepository: InMemorySettingsRepository(appearance: appearance),
            catalogRepository: InMemoryCatalogRepository(outfits: outfits, faults: faults),
            collectionsRepository: InMemoryCollectionsRepository(
                collections: empty ? [] : Fixtures.collections, outfits: outfits, faults: faults, clock: clock
            ),
            wardrobeRepository: InMemoryWardrobeRepository(items: empty ? [] : Fixtures.wardrobeItems, faults: faults, clock: clock)
        )
    }
}
