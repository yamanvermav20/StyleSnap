import Observation

/// State and actions for Outfit detail and its Save to collection sheet.
@Observable
final class OutfitDetailViewModel {
    let outfitId: String
    private(set) var state: LoadState<Outfit> = .loading
    /// The user's collections, which say whether the outfit is saved.
    private(set) var collections: LoadState<[OutfitCollection]> = .loading
    var toast: ToastMessage?
    /// Collections with an add or remove in flight.
    private(set) var pending: Set<String> = []

    @ObservationIgnored private let catalog: any CatalogRepository
    @ObservationIgnored private let collectionsRepository: any CollectionsRepository

    init(outfitId: String, catalog: any CatalogRepository, collections: any CollectionsRepository) {
        self.outfitId = outfitId
        self.catalog = catalog
        collectionsRepository = collections
    }

    /// Saved means the outfit is in at least one collection.
    var isSaved: Bool {
        collections.value?.contains { $0.outfitIds.contains(outfitId) } ?? false
    }

    func contains(_ collection: OutfitCollection) -> Bool {
        collection.outfitIds.contains(outfitId)
    }

    func loadIfNeeded() async {
        guard state.value == nil else { return }
        await load()
    }

    func load() async {
        state = .loading
        async let collections: Void = loadCollections()
        do {
            state = .loaded(try await catalog.getOutfit(id: outfitId))
        } catch {
            state = .failed(RepositoryError(error))
        }
        await collections
    }

    /// Loads the collections, keeping the current list up while it reloads.
    func loadCollections() async {
        if collections.value == nil {
            collections = .loading
        }
        do {
            collections = .loaded(try await collectionsRepository.list())
        } catch {
            if collections.value == nil {
                collections = .failed(RepositoryError(error))
            }
        }
    }

    /// Adds the outfit to the collection, or removes it if it's there. The check mark changes right
    /// away and goes back if the request fails.
    func toggle(collectionId: String) async {
        guard let collection = collections.value?.first(where: { $0.id == collectionId }), !pending.contains(collectionId) else { return }
        let wasIn = contains(collection)
        pending.insert(collectionId)
        defer { pending.remove(collectionId) }
        update(collectionId) { $0.outfitIds = wasIn ? $0.outfitIds.filter { $0 != outfitId } : [outfitId] + $0.outfitIds }
        do {
            let updated = wasIn
                ? try await collectionsRepository.removeOutfit(collectionId: collectionId, outfitId: outfitId)
                : try await collectionsRepository.addOutfit(collectionId: collectionId, outfitId: outfitId)
            update(collectionId) { $0 = updated }
            toast = ToastMessage(text: wasIn
                ? Strings.saveToCollectionRemoved(name: updated.name)
                : Strings.saveToCollectionAdded(name: updated.name))
        } catch {
            update(collectionId) { $0.outfitIds = collection.outfitIds }
            toast = ToastMessage(text: Strings.commonSaveFailed)
        }
    }

    /// After New collection saves: adds the outfit to the new collection.
    func collectionCreated(_ collection: OutfitCollection) async {
        var list = collections.value ?? []
        list.insert(collection, at: 0)
        collections = .loaded(list)
        await toggle(collectionId: collection.id)
    }

    private func update(_ collectionId: String, _ change: (inout OutfitCollection) -> Void) {
        guard var list = collections.value, let index = list.firstIndex(where: { $0.id == collectionId }) else { return }
        change(&list[index])
        collections = .loaded(list)
    }
}
