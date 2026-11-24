import Foundation
import Testing
@testable import App

@Suite("Outfit detail")
struct OutfitDetailTests {
    private func makeViewModel(
        outfitId: String = "outfit-05",
        faults: InMemoryFaults = InMemoryFaults(),
        collections: InMemoryCollectionsRepository? = nil
    ) -> (OutfitDetailViewModel, InMemoryCollectionsRepository) {
        let collections = collections ?? InMemoryCollectionsRepository(faults: faults)
        let viewModel = OutfitDetailViewModel(
            outfitId: outfitId, catalog: InMemoryCatalogRepository(faults: faults), collections: collections
        )
        return (viewModel, collections)
    }

    @Test("AC-outfit-detail-1: loads the outfit's photos, title, creator, likes, description and tags")
    func loadsOutfit() async {
        let (viewModel, _) = makeViewModel(outfitId: "outfit-01")
        await viewModel.load()
        let outfit = viewModel.state.value
        #expect(outfit?.photos.count == 3)
        #expect(outfit?.photos.first == outfit?.imageUrl)
        #expect(outfit?.title == "Orange Wall Street Edit")
        #expect(outfit?.creatorName == "Malik Osei")
        #expect(outfit?.likes == 4821)
        #expect(outfit?.tags == ["blazer", "shorts", "bold"])
        #expect(Strings.outfitDetailPhotoPosition(position: 1, total: 3) != "outfitDetail.photoPosition")
    }

    @Test("AC-outfit-detail-2: the details show the style, season and occasion labels")
    func detailLabels() {
        #expect(Season.label(for: "allSeason") == Strings.seasonAllSeason)
        #expect(Season.label(for: "summer") == Strings.seasonSummer)
        #expect(Occasion.label(for: "date") == Strings.occasionDate)
        #expect(Fixtures.outfits[0].categoryName == "Streetwear")
    }

    @Test("AC-outfit-detail-3: every item has a type label")
    func itemTypeLabels() {
        #expect(ItemType.allCases.map(\.label) == [
            Strings.itemTypeTop, Strings.itemTypeBottom, Strings.itemTypeDress,
            Strings.itemTypeOuterwear, Strings.itemTypeShoes, Strings.itemTypeAccessory,
        ])
        #expect(ItemType.label(for: "outerwear") == Strings.itemTypeOuterwear)
    }

    @Test("AC-outfit-detail-4: prices format as whole dollars without decimals and others with two")
    func prices() {
        #expect(PriceFormat.string(189) == "189")
        #expect(PriceFormat.string(42.5) == "42.50")
        #expect(PriceFormat.string(9.99) == "9.99")
        #expect(PriceFormat.string(0) == "0")
        #expect(PriceFormat.label(189) == "$189")
        #expect(PriceFormat.label(42.5) == "$42.50")
    }

    @Test("AC-outfit-detail-5: Saved when the outfit is in any collection, Save otherwise")
    func savedState() async {
        let (saved, _) = makeViewModel(outfitId: "outfit-01")
        await saved.load()
        #expect(saved.isSaved)
        #expect(saved.collections.value?.first.map(saved.contains) == true)

        let (unsaved, _) = makeViewModel(outfitId: "outfit-05")
        await unsaved.load()
        #expect(!unsaved.isSaved)
    }

    @Test("AC-outfit-detail-6: tapping a collection adds or removes the outfit and shows a toast naming it")
    func toggles() async throws {
        let (viewModel, repository) = makeViewModel(outfitId: "outfit-05")
        await viewModel.load()

        await viewModel.toggle(collectionId: "collection-weekend")
        #expect(viewModel.isSaved)
        #expect(viewModel.toast?.text == Strings.saveToCollectionAdded(name: "Weekend edits"))
        #expect(try await repository.get(id: "collection-weekend").outfitIds.first == "outfit-05")

        await viewModel.toggle(collectionId: "collection-weekend")
        #expect(!viewModel.isSaved)
        #expect(viewModel.toast?.text == Strings.saveToCollectionRemoved(name: "Weekend edits"))
        #expect(try await repository.get(id: "collection-weekend").outfitIds == ["outfit-01"])
    }

    @Test("AC-outfit-detail-6: if saving fails, the check mark goes back and the toast says so")
    func toggleFails() async {
        let faults = InMemoryFaults()
        let (viewModel, _) = makeViewModel(outfitId: "outfit-05", faults: faults)
        await viewModel.load()
        faults.failAlways = ["addOutfitToCollection"]

        await viewModel.toggle(collectionId: "collection-weekend")
        #expect(!viewModel.isSaved)
        #expect(viewModel.toast?.text == Strings.commonSaveFailed)
    }

    @Test("AC-outfit-detail-7: New collection creates the collection and adds the outfit to it")
    func newCollection() async throws {
        let (viewModel, repository) = makeViewModel(outfitId: "outfit-07")
        await viewModel.load()
        let editor = CollectionEditorViewModel(collection: nil, repository: repository)
        editor.name = "  Summer whites  "

        let created = try #require(await editor.save())
        await viewModel.collectionCreated(created)

        #expect(viewModel.isSaved)
        #expect(viewModel.toast?.text == Strings.saveToCollectionAdded(name: "Summer whites"))
        let stored = try await repository.get(id: created.id)
        #expect(stored.name == "Summer whites")
        #expect(stored.outfitIds == ["outfit-07"])
        #expect(try await repository.list().first?.id == created.id)
    }

    @Test("AC-outfit-detail-8: a missing outfit is not found; other failures are errors that retry")
    func notFoundAndError() async {
        let (missing, _) = makeViewModel(outfitId: "outfit-99")
        await missing.load()
        guard case .failed(.notFound) = missing.state else {
            Issue.record("expected not found, got \(missing.state)")
            return
        }

        let (failing, _) = makeViewModel(outfitId: "outfit-01", faults: InMemoryFaults(failOnce: ["getOutfit"]))
        await failing.load()
        guard case .failed(.failed) = failing.state else {
            Issue.record("expected the error state, got \(failing.state)")
            return
        }
        await failing.load()
        #expect(failing.state.value?.id == "outfit-01")

        // The API client's 404 maps to not found, anything else to a general failure.
        #expect(RepositoryError(ApiError.httpStatus(404, Data())) == .notFound)
        #expect(RepositoryError(ApiError.httpStatus(500, Data())) == .failed)
        #expect(RepositoryError(URLError(.notConnectedToInternet)) == .failed)
    }
}
