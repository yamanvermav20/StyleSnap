import Observation

/// State and actions for Wardrobe: the user's items, newest first, filtered by type.
@Observable
final class WardrobeViewModel {
    struct Content {
        var items: [WardrobeItem]
        /// Whether the wardrobe has no items at all, as opposed to none of the selected type.
        var wardrobeIsEmpty: Bool
    }

    /// nil is All. Kept while the app runs.
    private(set) var selectedType: ItemType?
    private(set) var state: LoadState<Content> = .loading
    @ObservationIgnored private let repository: any WardrobeRepository
    @ObservationIgnored private var generation = 0

    init(repository: any WardrobeRepository) {
        self.repository = repository
    }

    func select(_ type: ItemType?) async {
        guard type != selectedType else { return }
        selectedType = type
        await load()
    }

    func load() async {
        state = .loading
        await reload()
    }

    /// Reloads whenever the screen appears or an editor saves, keeping the current items up meanwhile.
    func reload() async {
        generation += 1
        let request = generation
        let type = selectedType
        do {
            let items = try await repository.list(type: type)
            // With a type chip on and nothing of that type, check whether there's anything at all.
            var wardrobeIsEmpty = items.isEmpty
            if wardrobeIsEmpty, type != nil {
                wardrobeIsEmpty = try await repository.list(type: nil).isEmpty
            }
            guard request == generation else { return }
            state = .loaded(Content(items: items, wardrobeIsEmpty: wardrobeIsEmpty))
        } catch {
            guard request == generation else { return }
            if state.value == nil {
                state = .failed(RepositoryError(error))
            }
        }
    }
}
