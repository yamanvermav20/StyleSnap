import Observation

/// State and actions for Collection detail: one collection and its outfits, most recently added first.
@Observable
final class CollectionDetailViewModel {
    struct Content {
        var collection: OutfitCollection
        var outfits: [Outfit]
    }

    let collectionId: String
    private(set) var state: LoadState<Content> = .loading
    private(set) var isDeleting = false
    var toast: ToastMessage?
    @ObservationIgnored private let repository: any CollectionsRepository

    init(collectionId: String, repository: any CollectionsRepository) {
        self.collectionId = collectionId
        self.repository = repository
    }

    var title: String { state.value?.collection.name ?? "" }
    var collection: OutfitCollection? { state.value?.collection }

    func load() async {
        state = .loading
        await reload()
    }

    /// Reloads whenever the screen appears, keeping the current content up meanwhile.
    func reload() async {
        do {
            async let collection = repository.get(id: collectionId)
            async let outfits = repository.listOutfits(collectionId: collectionId)
            state = .loaded(Content(collection: try await collection, outfits: try await outfits))
        } catch {
            let error = RepositoryError(error)
            if state.value == nil || error == .notFound {
                state = .failed(error)
            }
        }
    }

    /// After the editor saves.
    func updated(_ collection: OutfitCollection) {
        guard var content = state.value else { return }
        content.collection = collection
        state = .loaded(content)
    }

    /// Takes the outfit out of the grid right away; puts it back with a toast if the request fails.
    func remove(outfitId: String) async {
        guard let before = state.value, let index = before.outfits.firstIndex(where: { $0.id == outfitId }) else { return }
        var content = before
        content.outfits.remove(at: index)
        content.collection.outfitIds.removeAll { $0 == outfitId }
        state = .loaded(content)
        do {
            updated(try await repository.removeOutfit(collectionId: collectionId, outfitId: outfitId))
        } catch {
            state = .loaded(before)
            toast = ToastMessage(text: Strings.commonDeleteFailed)
        }
    }

    /// Deletes the collection. Returns whether it worked, so the screen can go back.
    func delete() async -> Bool {
        isDeleting = true
        defer { isDeleting = false }
        do {
            try await repository.delete(id: collectionId)
            return true
        } catch {
            toast = ToastMessage(text: Strings.commonDeleteFailed)
            return false
        }
    }
}
