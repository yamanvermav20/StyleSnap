import Observation

/// State and actions for Category: one category and its outfits, most liked first.
@Observable
final class CategoryViewModel {
    struct Content {
        var category: Category
        var outfits: [Outfit]
    }

    let categoryId: String
    private(set) var state: LoadState<Content> = .loading
    @ObservationIgnored private let repository: any CatalogRepository

    init(categoryId: String, repository: any CatalogRepository) {
        self.categoryId = categoryId
        self.repository = repository
    }

    var title: String { state.value?.category.name ?? "" }

    func loadIfNeeded() async {
        guard state.value == nil else { return }
        await load()
    }

    func load() async {
        state = .loading
        do {
            async let categories = repository.listCategories()
            async let outfits = repository.listOutfits(OutfitFilter(categoryId: categoryId, sort: .popular))
            // An unknown category id shows the error state.
            guard let category = (try await categories).first(where: { $0.id == categoryId }) else {
                throw RepositoryError.failed
            }
            state = .loaded(Content(category: category, outfits: try await outfits))
        } catch {
            state = .failed(.failed)
        }
    }
}
