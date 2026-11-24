import Foundation

/// The clothes the user owns, and the photo library the editor picks from.
protocol WardrobeRepository: AnyObject, Sendable {
    /// Newest first; only items of `type` when it's set.
    func list(type: ItemType?) async throws -> [WardrobeItem]
    func get(id: String) async throws -> WardrobeItem
    func create(_ input: WardrobeItemInput) async throws -> WardrobeItem
    func update(id: String, _ input: WardrobeItemInput) async throws -> WardrobeItem
    func delete(id: String) async throws
    func listPhotos() async throws -> [WardrobePhoto]
}

/// The wardrobe stored by the StyleSnap API.
final class ApiWardrobeRepository: WardrobeRepository {
    func list(type: ItemType?) async throws -> [WardrobeItem] {
        try await apiCall { try await ApiClient.listWardrobeItems(type: type?.rawValue) }
    }

    func get(id: String) async throws -> WardrobeItem {
        try await apiCall { try await ApiClient.getWardrobeItem(itemId: id) }
    }

    func create(_ input: WardrobeItemInput) async throws -> WardrobeItem {
        try await apiCall { try await ApiClient.createWardrobeItem(body: input) }
    }

    func update(id: String, _ input: WardrobeItemInput) async throws -> WardrobeItem {
        try await apiCall { try await ApiClient.updateWardrobeItem(itemId: id, body: input) }
    }

    func delete(id: String) async throws {
        try await apiCall { try await ApiClient.deleteWardrobeItem(itemId: id) }
    }

    func listPhotos() async throws -> [WardrobePhoto] {
        try await apiCall { try await ApiClient.listWardrobePhotos() }
    }
}

/// Keeps the wardrobe in memory with the API's validation and ordering, for previews and tests.
final class InMemoryWardrobeRepository: WardrobeRepository {
    private var items: [WardrobeItem]
    private let photos: [WardrobePhoto]
    private let faults: InMemoryFaults
    private let clock: InMemoryClock

    init(
        items: [WardrobeItem] = Fixtures.wardrobeItems,
        photos: [WardrobePhoto] = Fixtures.wardrobePhotos,
        faults: InMemoryFaults = InMemoryFaults(),
        clock: InMemoryClock = InMemoryClock()
    ) {
        self.items = items
        self.photos = photos
        self.faults = faults
        self.clock = clock
    }

    func list(type: ItemType?) async throws -> [WardrobeItem] {
        try await faults.check("listWardrobeItems")
        return items
            .filter { type == nil || $0.type == type?.rawValue }
            .sorted { $0.createdAt != $1.createdAt ? $0.createdAt > $1.createdAt : $0.id < $1.id }
    }

    func get(id: String) async throws -> WardrobeItem {
        try await faults.check("getWardrobeItem")
        return items[try index(id)]
    }

    func create(_ input: WardrobeItemInput) async throws -> WardrobeItem {
        try await faults.check("createWardrobeItem")
        let input = try validated(input)
        let now = clock.tick()
        let item = WardrobeItem(
            brand: input.brand, color: input.color, createdAt: now, favorite: input.favorite, id: UUID().uuidString.lowercased(),
            imageUrl: input.imageUrl, name: input.name, notes: input.notes, season: input.season, type: input.type, updatedAt: now
        )
        items.append(item)
        return item
    }

    func update(id: String, _ input: WardrobeItemInput) async throws -> WardrobeItem {
        try await faults.check("updateWardrobeItem")
        let index = try index(id)
        let input = try validated(input)
        items[index].name = input.name
        items[index].brand = input.brand
        items[index].type = input.type
        items[index].color = input.color
        items[index].season = input.season
        items[index].imageUrl = input.imageUrl
        items[index].notes = input.notes
        items[index].favorite = input.favorite
        items[index].updatedAt = clock.tick()
        return items[index]
    }

    func delete(id: String) async throws {
        try await faults.check("deleteWardrobeItem")
        items.remove(at: try index(id))
    }

    func listPhotos() async throws -> [WardrobePhoto] {
        try await faults.check("listWardrobePhotos")
        return photos
    }

    private func index(_ id: String) throws -> Int {
        guard let index = items.firstIndex(where: { $0.id == id }) else { throw RepositoryError.notFound }
        return index
    }

    /// The server trims text, checks the limits and the enums, and needs an https photo.
    private func validated(_ input: WardrobeItemInput) throws -> WardrobeItemInput {
        func trimmed(_ value: String, max: Int, required: Bool = false) throws -> String {
            let value = value.trimmingCharacters(in: .whitespacesAndNewlines)
            guard value.count <= max, !(required && value.isEmpty) else { throw RepositoryError.failed }
            return value
        }
        guard ItemType(rawValue: input.type) != nil, Season(rawValue: input.season) != nil,
              input.imageUrl.hasPrefix("https://") else { throw RepositoryError.failed }
        var result = input
        result.name = try trimmed(input.name, max: WardrobeLimits.name, required: true)
        result.brand = try trimmed(input.brand, max: WardrobeLimits.brand)
        result.color = try trimmed(input.color, max: WardrobeLimits.color)
        result.notes = try trimmed(input.notes, max: WardrobeLimits.notes)
        return result
    }
}

/// Field lengths, from contracts/api.json (spec/features/wardrobe.md).
nonisolated enum WardrobeLimits {
    static let name = 60
    static let brand = 40
    static let color = 30
    static let notes = 280
}
