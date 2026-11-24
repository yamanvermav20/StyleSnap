import Observation

/// State and actions for Collections: every collection, most recently updated first.
@Observable
final class CollectionsViewModel {
    private(set) var state: LoadState<[OutfitCollection]> = .loading
    @ObservationIgnored private let repository: any CollectionsRepository

    init(repository: any CollectionsRepository) {
        self.repository = repository
    }

    /// Loads, showing the loading state, as on first appearance and retry.
    func load() async {
        state = .loading
        await reload()
    }

    /// Reloads whenever the screen appears, so changes made elsewhere show up. Keeps the current
    /// list up meanwhile, and if the reload fails.
    func reload() async {
        do {
            state = .loaded(try await repository.list())
        } catch {
            if state.value == nil {
                state = .failed(RepositoryError(error))
            }
        }
    }

    /// After the editor creates one: it goes to the top.
    func created(_ collection: OutfitCollection) {
        state = .loaded([collection] + (state.value ?? []).filter { $0.id != collection.id })
    }
}
