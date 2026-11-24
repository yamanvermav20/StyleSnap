import Testing
@testable import App

@Suite("Collections")
struct CollectionsTests {
    @Test("AC-collections-1: lists every collection, most recently updated first, with covers and counts")
    func listsCollections() async throws {
        let repository = InMemoryCollectionsRepository()
        let viewModel = CollectionsViewModel(repository: repository)
        await viewModel.load()
        let weekend = try #require(viewModel.state.value?.first)
        #expect(weekend.id == "collection-weekend")
        #expect(weekend.name == "Weekend edits")
        #expect(weekend.outfitIds == ["outfit-01"])
        #expect(weekend.coverImageUrls == [Fixtures.outfits[0].imageUrl])

        // Touching a collection moves it to the top.
        let office = try await repository.create(CollectionInput(description: "", name: "Office"))
        _ = try await repository.update(id: "collection-weekend", CollectionInput(description: "", name: "Weekend"))
        #expect(try await repository.list().map(\.id) == ["collection-weekend", office.id])
    }

    @Test("AC-collections-2: with no collections, the list is empty")
    func empty() async {
        let viewModel = CollectionsViewModel(repository: InMemoryCollectionsRepository(collections: []))
        await viewModel.load()
        #expect(viewModel.state.value?.isEmpty == true)
    }

    @Test("AC-collections-3: creating a collection with a name adds it to the top")
    func create() async throws {
        let repository = InMemoryCollectionsRepository()
        let list = CollectionsViewModel(repository: repository)
        await list.load()
        let editor = CollectionEditorViewModel(collection: nil, repository: repository)
        #expect(editor.title == Strings.collectionEditorCreateTitle)
        editor.name = "Date night"
        editor.description = "Dinner looks"

        let created = try #require(await editor.save())
        list.created(created)
        #expect(list.state.value?.first?.name == "Date night")
        await list.reload()
        #expect(list.state.value?.map(\.name) == ["Date night", "Weekend edits"])
        #expect(created.description == "Dinner looks")
    }

    @Test("AC-collections-4: the editor rejects an empty name and a name over 40 characters, without saving")
    func validation() async throws {
        let repository = InMemoryCollectionsRepository()
        let editor = CollectionEditorViewModel(collection: nil, repository: repository)

        editor.name = "   "
        #expect(await editor.save() == nil)
        #expect(editor.error == Strings.collectionEditorNameRequired)

        editor.name = String(repeating: "a", count: 41)
        #expect(await editor.save() == nil)
        #expect(editor.error == Strings.collectionEditorNameTooLong)
        #expect(try await repository.list().count == 1)

        editor.name = String(repeating: "a", count: 40)
        #expect(await editor.save() != nil)

        // The description is cut to 140 characters as the user types.
        editor.description = String(repeating: "b", count: 150)
        #expect(editor.description.count == 140)
    }

    @Test("AC-collections-5: Collection detail shows the name, description and outfits, most recently added first")
    func detail() async throws {
        let repository = InMemoryCollectionsRepository()
        _ = try await repository.addOutfit(collectionId: "collection-weekend", outfitId: "outfit-07")
        let viewModel = CollectionDetailViewModel(collectionId: "collection-weekend", repository: repository)
        await viewModel.load()
        #expect(viewModel.title == "Weekend edits")
        #expect(viewModel.collection?.description == "Easy looks for slow Saturdays.")
        #expect(viewModel.state.value?.outfits.ids == ["outfit-07", "outfit-01"])
    }

    @Test("AC-collections-6: editing a collection saves the new name and description")
    func edit() async throws {
        let repository = InMemoryCollectionsRepository()
        let collection = try await repository.get(id: "collection-weekend")
        let editor = CollectionEditorViewModel(collection: collection, repository: repository)
        #expect(editor.title == Strings.collectionEditorEditTitle)
        #expect(editor.name == "Weekend edits")
        editor.name = " Lazy Sundays "
        editor.description = "Coffee and a long walk."

        let saved = try #require(await editor.save())
        #expect(saved.name == "Lazy Sundays")
        let stored = try await repository.get(id: "collection-weekend")
        #expect(stored.name == "Lazy Sundays")
        #expect(stored.description == "Coffee and a long walk.")
    }

    @Test("AC-collections-7: deleting a collection removes it")
    func delete() async throws {
        let repository = InMemoryCollectionsRepository()
        let viewModel = CollectionDetailViewModel(collectionId: "collection-weekend", repository: repository)
        await viewModel.load()
        #expect(await viewModel.delete())
        #expect(try await repository.list().isEmpty)

        await viewModel.load()
        guard case .failed(.notFound) = viewModel.state else {
            Issue.record("expected not found, got \(viewModel.state)")
            return
        }
    }

    @Test("AC-collections-8: removing an outfit takes it out of the collection")
    func removeOutfit() async throws {
        let repository = InMemoryCollectionsRepository()
        let viewModel = CollectionDetailViewModel(collectionId: "collection-weekend", repository: repository)
        await viewModel.load()

        await viewModel.remove(outfitId: "outfit-01")
        #expect(viewModel.state.value?.outfits.isEmpty == true)
        #expect(try await repository.get(id: "collection-weekend").outfitIds.isEmpty)
    }

    @Test("AC-collections-8: if removing fails, the outfit comes back with a toast")
    func removeFails() async {
        let faults = InMemoryFaults(failAlways: ["removeOutfitFromCollection"])
        let viewModel = CollectionDetailViewModel(collectionId: "collection-weekend", repository: InMemoryCollectionsRepository(faults: faults))
        await viewModel.load()

        await viewModel.remove(outfitId: "outfit-01")
        #expect(viewModel.state.value?.outfits.ids == ["outfit-01"])
        #expect(viewModel.toast?.text == Strings.commonDeleteFailed)
    }

    @Test("AC-collections-9: Collections and Collection detail show the error state and retry")
    func errors() async {
        let faults = InMemoryFaults(failOnce: ["listCollections", "getCollection"])
        let repository = InMemoryCollectionsRepository(faults: faults)

        let list = CollectionsViewModel(repository: repository)
        await list.load()
        guard case .failed(.failed) = list.state else {
            Issue.record("expected the error state")
            return
        }
        await list.load()
        #expect(list.state.value?.count == 1)

        let detail = CollectionDetailViewModel(collectionId: "collection-weekend", repository: repository)
        await detail.load()
        guard case .failed(.failed) = detail.state else {
            Issue.record("expected the error state")
            return
        }
        await detail.load()
        #expect(detail.state.value?.outfits.count == 1)
    }

    @Test("AC-collections-10: if saving fails, the editor stays open and shows the save error")
    func saveFails() async {
        let faults = InMemoryFaults(failAlways: ["createCollection"])
        let editor = CollectionEditorViewModel(collection: nil, repository: InMemoryCollectionsRepository(faults: faults))
        editor.name = "Travel"
        #expect(await editor.save() == nil)
        #expect(editor.error == Strings.commonSaveFailed)
        #expect(!editor.isSaving)
        #expect(editor.name == "Travel")
    }
}
