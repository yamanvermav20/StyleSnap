import Foundation
@testable import App

/// Waits until `condition` holds, polling, or until `timeout` passes.
@MainActor
func eventually(timeout: Duration = .seconds(2), _ condition: () -> Bool) async -> Bool {
    let clock = ContinuousClock()
    let deadline = clock.now + timeout
    while !condition() {
        if clock.now > deadline { return false }
        try? await Task.sleep(for: .milliseconds(10))
    }
    return true
}

/// A catalog whose `listOutfits` calls stay pending until the test answers them, in any order.
final class ControlledCatalogRepository: CatalogRepository {
    private(set) var pending: [(filter: OutfitFilter, continuation: CheckedContinuation<[Outfit], any Error>)] = []

    func listCategories() async throws -> [App.Category] { Fixtures.categories }

    func listOutfits(_ filter: OutfitFilter) async throws -> [Outfit] {
        try await withCheckedThrowingContinuation { continuation in
            pending.append((filter, continuation))
        }
    }

    func getOutfit(id: String) async throws -> Outfit {
        throw RepositoryError.notFound
    }

    func answer(_ index: Int, with outfits: [Outfit]) {
        pending[index].continuation.resume(returning: outfits)
    }
}

extension Array where Element == Outfit {
    var ids: [String] { map(\.id) }
}
