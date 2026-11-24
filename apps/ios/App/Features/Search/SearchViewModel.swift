import Foundation
import Observation

/// State and actions for Search: text, filters and sort, and the outfits the API returns for them.
@Observable
final class SearchViewModel {
    /// Typing searches this long after the last keystroke.
    static let debounce: Duration = .milliseconds(300)

    var text = ""
    private(set) var categoryId: String?
    private(set) var season: Season?
    private(set) var occasion: Occasion?
    private(set) var sort: OutfitSort = .popular

    private(set) var categories: [Category] = []
    /// The newest request's results; kept on screen while the next request loads.
    private(set) var results: [Outfit]?
    private(set) var isLoading = false
    private(set) var error: RepositoryError?

    @ObservationIgnored private let repository: any CatalogRepository
    @ObservationIgnored private let debounce: Duration
    @ObservationIgnored private var debounceTask: Task<Void, Never>?
    /// Increases with every request; a response only counts if it's the newest one's.
    @ObservationIgnored private var generation = 0
    @ObservationIgnored private var hasLoaded = false
    @ObservationIgnored private var isLoadingCategories = false

    init(repository: any CatalogRepository, debounce: Duration = SearchViewModel.debounce) {
        self.repository = repository
        self.debounce = debounce
    }

    var filter: OutfitFilter {
        let search = text.trimmingCharacters(in: .whitespacesAndNewlines)
        return OutfitFilter(search: search.isEmpty ? nil : search, categoryId: categoryId, season: season, occasion: occasion, sort: sort)
    }

    /// Whether any filter (not the text) is off its default.
    var hasFilters: Bool {
        categoryId != nil || season != nil || occasion != nil || sort != .popular
    }

    var categoryLabel: String {
        categoryId.flatMap { id in categories.first { $0.id == id }?.name } ?? Strings.searchCategory
    }

    var seasonLabel: String { season?.label ?? Strings.searchSeason }
    var occasionLabel: String { occasion?.label ?? Strings.searchOccasion }
    var sortLabel: String { sort == .popular ? Strings.searchSort : sort.label }

    func loadIfNeeded() async {
        guard !hasLoaded else { return }
        hasLoaded = true
        await search()
    }

    /// Call when the text changes: searches after a short pause.
    func textChanged() {
        debounceTask?.cancel()
        debounceTask = Task { [debounce] in
            try? await Task.sleep(for: debounce)
            guard !Task.isCancelled else { return }
            await self.search()
        }
    }

    func setCategory(_ categoryId: String?) {
        self.categoryId = categoryId
        searchNow()
    }

    func setSeason(_ season: Season?) {
        self.season = season
        searchNow()
    }

    func setOccasion(_ occasion: Occasion?) {
        self.occasion = occasion
        searchNow()
    }

    func setSort(_ sort: OutfitSort) {
        self.sort = sort
        searchNow()
    }

    /// Resets the filters and sort, keeping the text.
    func clearFilters() {
        categoryId = nil
        season = nil
        occasion = nil
        sort = .popular
        searchNow()
    }

    /// Runs the search for the current text and filters. Only the newest request's outcome is shown.
    func search() async {
        debounceTask?.cancel()
        generation += 1
        let request = generation
        isLoading = true
        if categories.isEmpty {
            Task { await loadCategories() }
        }
        do {
            let outfits = try await repository.listOutfits(filter)
            guard request == generation else { return }
            results = outfits
            error = nil
        } catch {
            guard request == generation else { return }
            self.error = RepositoryError(error)
        }
        isLoading = false
    }

    private func searchNow() {
        Task { await search() }
    }

    /// The style filter's choices. Tried again with the next search if it fails.
    private func loadCategories() async {
        guard categories.isEmpty, !isLoadingCategories else { return }
        isLoadingCategories = true
        categories = (try? await repository.listCategories()) ?? []
        isLoadingCategories = false
    }
}
