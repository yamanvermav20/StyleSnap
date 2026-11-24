import Foundation

/// The parameters of `listOutfits`. `nil` leaves a filter out.
nonisolated struct OutfitFilter: Equatable {
    var search: String?
    var categoryId: String?
    var season: Season?
    var occasion: Occasion?
    var sort: OutfitSort = .popular
}

/// The outfit catalog: categories and outfits (read-only).
protocol CatalogRepository: AnyObject, Sendable {
    func listCategories() async throws -> [Category]
    func listOutfits(_ filter: OutfitFilter) async throws -> [Outfit]
    func getOutfit(id: String) async throws -> Outfit
}

/// Reads the catalog from the StyleSnap API.
final class ApiCatalogRepository: CatalogRepository {
    func listCategories() async throws -> [Category] {
        try await apiCall { try await ApiClient.listCategories() }
    }

    func listOutfits(_ filter: OutfitFilter) async throws -> [Outfit] {
        let search = filter.search?.trimmingCharacters(in: .whitespacesAndNewlines)
        return try await apiCall {
            try await ApiClient.listOutfits(
                search: search?.isEmpty == false ? search : nil,
                categoryId: filter.categoryId,
                season: filter.season?.rawValue,
                occasion: filter.occasion?.rawValue,
                sort: filter.sort.rawValue
            )
        }
    }

    func getOutfit(id: String) async throws -> Outfit {
        try await apiCall { try await ApiClient.getOutfit(outfitId: id) }
    }
}

/// Holds the catalog in memory, with the API's filtering and ordering, for previews and tests.
final class InMemoryCatalogRepository: CatalogRepository {
    private let categories: [Category]
    private let outfits: [Outfit]
    private let faults: InMemoryFaults
    /// Every filter the repository was asked for, oldest first.
    private(set) var requests: [OutfitFilter] = []

    init(categories: [Category] = Fixtures.categories, outfits: [Outfit] = Fixtures.outfits, faults: InMemoryFaults = InMemoryFaults()) {
        self.outfits = outfits
        self.faults = faults
        // Like the server, a category's count is the number of outfits in it.
        self.categories = categories.map { category in
            var category = category
            category.outfitCount = outfits.count { $0.categoryId == category.id }
            return category
        }
    }

    func listCategories() async throws -> [Category] {
        try await faults.check("listCategories")
        return categories
    }

    func listOutfits(_ filter: OutfitFilter) async throws -> [Outfit] {
        requests.append(filter)
        try await faults.check("listOutfits")
        return Self.apply(filter, to: outfits)
    }

    func getOutfit(id: String) async throws -> Outfit {
        try await faults.check("getOutfit")
        guard let outfit = outfits.first(where: { $0.id == id }) else { throw RepositoryError.notFound }
        return outfit
    }

    /// The server's rules: text matches title, description, tags, creator and item names and brands,
    /// case-insensitively; filters combine with AND; an allSeason outfit matches any season.
    nonisolated static func apply(_ filter: OutfitFilter, to outfits: [Outfit]) -> [Outfit] {
        let text = filter.search?.trimmingCharacters(in: .whitespacesAndNewlines).lowercased() ?? ""
        let matching = outfits.filter { outfit in
            if !text.isEmpty, !searchText(of: outfit).contains(text) { return false }
            if let categoryId = filter.categoryId, outfit.categoryId != categoryId { return false }
            if let season = filter.season, outfit.season != season.rawValue, outfit.season != Season.allSeason.rawValue { return false }
            if let occasion = filter.occasion, outfit.occasion != occasion.rawValue { return false }
            return true
        }
        return matching.sorted { a, b in
            switch filter.sort {
            case .popular: a.likes != b.likes ? a.likes > b.likes : a.id < b.id
            case .newest: a.createdAt != b.createdAt ? a.createdAt > b.createdAt : a.id < b.id
            }
        }
    }

    nonisolated private static func searchText(of outfit: Outfit) -> String {
        ([outfit.title, outfit.description, outfit.creatorName] + outfit.tags + outfit.items.flatMap { [$0.name, $0.brand] })
            .joined(separator: " ")
            .lowercased()
    }
}
