import Foundation

/// The user's collections of saved outfits.
protocol CollectionsRepository: AnyObject, Sendable {
    /// Most recently updated first.
    func list() async throws -> [OutfitCollection]
    func get(id: String) async throws -> OutfitCollection
    /// The collection's outfits, most recently added first.
    func listOutfits(collectionId: String) async throws -> [Outfit]
    func create(_ input: CollectionInput) async throws -> OutfitCollection
    func update(id: String, _ input: CollectionInput) async throws -> OutfitCollection
    func delete(id: String) async throws
    func addOutfit(collectionId: String, outfitId: String) async throws -> OutfitCollection
    func removeOutfit(collectionId: String, outfitId: String) async throws -> OutfitCollection
}

/// Collections stored by the StyleSnap API.
final class ApiCollectionsRepository: CollectionsRepository {
    func list() async throws -> [OutfitCollection] {
        try await apiCall { try await ApiClient.listCollections() }
    }

    func get(id: String) async throws -> OutfitCollection {
        try await apiCall { try await ApiClient.getCollection(collectionId: id) }
    }

    func listOutfits(collectionId: String) async throws -> [Outfit] {
        try await apiCall { try await ApiClient.listCollectionOutfits(collectionId: collectionId) }
    }

    func create(_ input: CollectionInput) async throws -> OutfitCollection {
        try await apiCall { try await ApiClient.createCollection(body: input) }
    }

    func update(id: String, _ input: CollectionInput) async throws -> OutfitCollection {
        try await apiCall { try await ApiClient.updateCollection(collectionId: id, body: input) }
    }

    func delete(id: String) async throws {
        try await apiCall { try await ApiClient.deleteCollection(collectionId: id) }
    }

    func addOutfit(collectionId: String, outfitId: String) async throws -> OutfitCollection {
        try await apiCall { try await ApiClient.addOutfitToCollection(collectionId: collectionId, body: CollectionOutfitInput(outfitId: outfitId)) }
    }

    func removeOutfit(collectionId: String, outfitId: String) async throws -> OutfitCollection {
        try await apiCall { try await ApiClient.removeOutfitFromCollection(collectionId: collectionId, outfitId: outfitId) }
    }
}

/// Keeps collections in memory with the API's validation and ordering, for previews and tests.
final class InMemoryCollectionsRepository: CollectionsRepository {
    static let maxCovers = 4
    static let nameLimit = 40
    static let descriptionLimit = 140

    private var records: [Fixtures.CollectionRecord]
    private let outfits: [Outfit]
    private let faults: InMemoryFaults
    private let clock: InMemoryClock

    init(
        collections: [Fixtures.CollectionRecord] = Fixtures.collections,
        outfits: [Outfit] = Fixtures.outfits,
        faults: InMemoryFaults = InMemoryFaults(),
        clock: InMemoryClock = InMemoryClock()
    ) {
        records = collections
        self.outfits = outfits
        self.faults = faults
        self.clock = clock
    }

    func list() async throws -> [OutfitCollection] {
        try await faults.check("listCollections")
        return records
            .sorted { $0.updatedAt != $1.updatedAt ? $0.updatedAt > $1.updatedAt : $0.id < $1.id }
            .map(collection(from:))
    }

    func get(id: String) async throws -> OutfitCollection {
        try await faults.check("getCollection")
        return collection(from: try record(id))
    }

    func listOutfits(collectionId: String) async throws -> [Outfit] {
        try await faults.check("listCollectionOutfits")
        return orderedOutfitIds(try record(collectionId)).compactMap { id in outfits.first { $0.id == id } }
    }

    func create(_ input: CollectionInput) async throws -> OutfitCollection {
        try await faults.check("createCollection")
        let input = try validated(input)
        let now = clock.tick()
        let record = Fixtures.CollectionRecord(
            id: UUID().uuidString.lowercased(), name: input.name, description: input.description,
            createdAt: now, updatedAt: now, entries: []
        )
        records.append(record)
        return collection(from: record)
    }

    func update(id: String, _ input: CollectionInput) async throws -> OutfitCollection {
        try await faults.check("updateCollection")
        let index = try recordIndex(id)
        let input = try validated(input)
        records[index].name = input.name
        records[index].description = input.description
        records[index].updatedAt = clock.tick()
        return collection(from: records[index])
    }

    func delete(id: String) async throws {
        try await faults.check("deleteCollection")
        records.remove(at: try recordIndex(id))
    }

    func addOutfit(collectionId: String, outfitId: String) async throws -> OutfitCollection {
        try await faults.check("addOutfitToCollection")
        let index = try recordIndex(collectionId)
        guard outfits.contains(where: { $0.id == outfitId }) else { throw RepositoryError.notFound }
        if !records[index].entries.contains(where: { $0.outfitId == outfitId }) {
            let now = clock.tick()
            records[index].entries.append((outfitId: outfitId, addedAt: now))
            records[index].updatedAt = now
        }
        return collection(from: records[index])
    }

    func removeOutfit(collectionId: String, outfitId: String) async throws -> OutfitCollection {
        try await faults.check("removeOutfitFromCollection")
        let index = try recordIndex(collectionId)
        if records[index].entries.contains(where: { $0.outfitId == outfitId }) {
            records[index].entries.removeAll { $0.outfitId == outfitId }
            records[index].updatedAt = clock.tick()
        }
        return collection(from: records[index])
    }

    private func recordIndex(_ id: String) throws -> Int {
        guard let index = records.firstIndex(where: { $0.id == id }) else { throw RepositoryError.notFound }
        return index
    }

    private func record(_ id: String) throws -> Fixtures.CollectionRecord {
        records[try recordIndex(id)]
    }

    /// The server trims both fields and rejects an empty or too long name, or a too long description.
    private func validated(_ input: CollectionInput) throws -> CollectionInput {
        let name = input.name.trimmingCharacters(in: .whitespacesAndNewlines)
        let description = input.description.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !name.isEmpty, name.count <= Self.nameLimit, description.count <= Self.descriptionLimit else {
            throw RepositoryError.failed
        }
        return CollectionInput(description: description, name: name)
    }

    private func orderedOutfitIds(_ record: Fixtures.CollectionRecord) -> [String] {
        record.entries
            .enumerated()
            .sorted { a, b in a.element.addedAt != b.element.addedAt ? a.element.addedAt > b.element.addedAt : a.offset > b.offset }
            .map(\.element.outfitId)
    }

    private func collection(from record: Fixtures.CollectionRecord) -> OutfitCollection {
        let ids = orderedOutfitIds(record)
        let covers = ids.prefix(Self.maxCovers).compactMap { id in outfits.first { $0.id == id }?.imageUrl }
        return OutfitCollection(
            coverImageUrls: covers, createdAt: record.createdAt, description: record.description, id: record.id,
            name: record.name, outfitIds: ids, updatedAt: record.updatedAt
        )
    }
}
