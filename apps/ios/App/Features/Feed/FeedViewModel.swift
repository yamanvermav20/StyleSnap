import Observation

/// State and actions for Feed: every category and every outfit, most liked first.
@Observable
final class FeedViewModel {
    struct Content {
        var categories: [Category]
        var outfits: [Outfit]
    }

    private(set) var state: LoadState<Content> = .loading
    @ObservationIgnored private let repository: any CatalogRepository

    init(repository: any CatalogRepository) {
        self.repository = repository
    }

    /// Loads once; coming back from a pushed screen keeps what's loaded.
    func loadIfNeeded() async {
        guard state.value == nil else { return }
        await load()
    }

    /// Loads both lists, showing the loading state, as on retry.
    func load() async {
        state = .loading
        await fetch()
    }

    /// Pull to refresh: reloads both lists, keeping the current content up meanwhile.
    func refresh() async {
        await fetch()
    }

    private func fetch() async {
        do {
            async let categories = repository.listCategories()
            async let outfits = repository.listOutfits(OutfitFilter(sort: .popular))
            state = .loaded(Content(categories: try await categories, outfits: try await outfits))
        } catch {
            state = .failed(RepositoryError(error))
        }
    }
}
