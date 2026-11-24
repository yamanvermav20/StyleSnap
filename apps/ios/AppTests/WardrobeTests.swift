import Testing
@testable import App

@Suite("Wardrobe")
struct WardrobeTests {
    @Test("AC-wardrobe-1: lists every item, newest first, with its photo, name, brand and favorite flag")
    func listsItems() async {
        let viewModel = WardrobeViewModel(repository: InMemoryWardrobeRepository())
        await viewModel.load()
        let items = viewModel.state.value?.items ?? []
        #expect(items.map(\.id) == ["wardrobe-01", "wardrobe-04"])
        #expect(items.map(\.favorite) == [true, false])
        #expect(items.first?.brand == "Field & Co")
        #expect(items.first?.imageUrl == Fixtures.whiteTee)
    }

    @Test("AC-wardrobe-2: a type chip shows only items of that type; All shows every item")
    func typeFilter() async {
        let viewModel = WardrobeViewModel(repository: InMemoryWardrobeRepository())
        await viewModel.load()
        await viewModel.select(.shoes)
        #expect(viewModel.state.value?.items.map(\.id) == ["wardrobe-04"])
        await viewModel.select(nil)
        #expect(viewModel.state.value?.items.count == 2)
    }

    @Test("AC-wardrobe-3: with no items it's the empty state; with none of the chosen type, the filtered one")
    func emptyStates() async {
        let empty = WardrobeViewModel(repository: InMemoryWardrobeRepository(items: []))
        await empty.load()
        #expect(empty.state.value?.wardrobeIsEmpty == true)
        await empty.select(.dress)
        #expect(empty.state.value?.wardrobeIsEmpty == true)

        let filtered = WardrobeViewModel(repository: InMemoryWardrobeRepository())
        await filtered.select(.dress)
        #expect(filtered.state.value?.items.isEmpty == true)
        #expect(filtered.state.value?.wardrobeIsEmpty == false)
    }

    @Test("AC-wardrobe-4: a new item starts with the defaults and shows the photos of the selected type")
    func defaults() async {
        let editor = WardrobeEditorViewModel(itemId: nil, repository: InMemoryWardrobeRepository())
        await editor.load()
        #expect(editor.title == Strings.wardrobeEditorCreateTitle)
        #expect(editor.type == .top)
        #expect(editor.season == .allSeason)
        #expect(editor.imageUrl == nil)
        #expect(!editor.favorite)
        #expect(editor.name.isEmpty && editor.brand.isEmpty && editor.color.isEmpty && editor.notes.isEmpty)
        #expect(editor.visiblePhotos.count == 10)
        #expect(editor.visiblePhotos.allSatisfy { $0.type == "top" })

        editor.type = .shoes
        #expect(editor.visiblePhotos.count == 11)
        #expect(editor.currentPhotoUrl == nil)
    }

    @Test("AC-wardrobe-5: saving a new item with a name and a photo creates it, first in Wardrobe")
    func create() async throws {
        let repository = InMemoryWardrobeRepository()
        let editor = WardrobeEditorViewModel(itemId: nil, repository: repository)
        await editor.load()
        editor.name = "  Grey runners "
        editor.type = .shoes
        editor.imageUrl = Fixtures.greySneaker
        editor.brand = " Strada"

        #expect(await editor.save())
        let wardrobe = WardrobeViewModel(repository: repository)
        await wardrobe.load()
        let first = try #require(wardrobe.state.value?.items.first)
        #expect(first.name == "Grey runners")
        #expect(first.brand == "Strada")
        #expect(first.type == "shoes")
        #expect(first.season == "allSeason")
    }

    @Test("AC-wardrobe-6: the editor rejects a missing name or photo, without saving")
    func validation() async throws {
        let repository = InMemoryWardrobeRepository()
        let editor = WardrobeEditorViewModel(itemId: nil, repository: repository)
        await editor.load()

        #expect(await !editor.save())
        #expect(editor.error?.contains(Strings.wardrobeEditorNameRequired) == true)
        #expect(editor.error?.contains(Strings.wardrobeEditorPhotoRequired) == true)

        editor.name = "Scarf"
        #expect(await !editor.save())
        #expect(editor.error == Strings.wardrobeEditorPhotoRequired)
        #expect(try await repository.list(type: nil).count == 2)

        // Lengths are enforced as the user types.
        editor.name = String(repeating: "n", count: 70)
        editor.brand = String(repeating: "b", count: 50)
        editor.color = String(repeating: "c", count: 40)
        editor.notes = String(repeating: "x", count: 300)
        #expect([editor.name.count, editor.brand.count, editor.color.count, editor.notes.count] == [60, 40, 30, 280])
    }

    @Test("AC-wardrobe-7: editing fills in the item's values, and saving updates it")
    func edit() async throws {
        let repository = InMemoryWardrobeRepository()
        let editor = WardrobeEditorViewModel(itemId: "wardrobe-01", repository: repository)
        await editor.load()
        #expect(editor.title == Strings.wardrobeEditorEditTitle)
        #expect(editor.name == "White crew tee")
        #expect(editor.brand == "Field & Co")
        #expect(editor.type == .top)
        #expect(editor.color == "White")
        #expect(editor.season == .allSeason)
        #expect(editor.notes == "Goes with everything. Size M.")
        #expect(editor.favorite)
        #expect(editor.imageUrl == Fixtures.whiteTee)

        editor.name = "Oversized tee"
        editor.favorite = false
        #expect(await editor.save())
        let stored = try await repository.get(id: "wardrobe-01")
        #expect(stored.name == "Oversized tee")
        #expect(!stored.favorite)
    }

    @Test("AC-wardrobe-7: an item's own photo that isn't in the library is shown first, selected")
    func currentPhoto() async {
        var item = Fixtures.wardrobeItems[0]
        item.imageUrl = "https://images.unsplash.com/photo-elsewhere"
        let editor = WardrobeEditorViewModel(itemId: item.id, repository: InMemoryWardrobeRepository(items: [item]))
        await editor.load()
        #expect(editor.currentPhotoUrl == item.imageUrl)
        editor.imageUrl = Fixtures.blueTee
        #expect(editor.currentPhotoUrl == nil)
    }

    @Test("AC-wardrobe-8: deleting an item removes it from Wardrobe")
    func delete() async throws {
        let repository = InMemoryWardrobeRepository()
        let editor = WardrobeEditorViewModel(itemId: "wardrobe-04", repository: repository)
        await editor.load()
        #expect(await editor.delete())
        #expect(try await repository.list(type: nil).map(\.id) == ["wardrobe-01"])
    }

    @Test("AC-wardrobe-9: Wardrobe and the editor show the error state, and a failed save keeps the editor open")
    func errors() async {
        let faults = InMemoryFaults(failOnce: ["listWardrobeItems", "listWardrobePhotos"], failAlways: ["updateWardrobeItem", "deleteWardrobeItem"])
        let repository = InMemoryWardrobeRepository(faults: faults)

        let wardrobe = WardrobeViewModel(repository: repository)
        await wardrobe.load()
        guard case .failed = wardrobe.state else {
            Issue.record("expected the error state")
            return
        }
        await wardrobe.load()
        #expect(wardrobe.state.value?.items.count == 2)

        let editor = WardrobeEditorViewModel(itemId: "wardrobe-01", repository: repository)
        await editor.load()
        guard case .failed = editor.state else {
            Issue.record("expected the error state")
            return
        }
        await editor.load()
        #expect(editor.state.value != nil)

        #expect(await !editor.save())
        #expect(editor.error == Strings.commonSaveFailed)
        #expect(await !editor.delete())
        #expect(editor.error == Strings.commonDeleteFailed)

        let missing = WardrobeEditorViewModel(itemId: "wardrobe-99", repository: repository)
        await missing.load()
        guard case .failed(.notFound) = missing.state else {
            Issue.record("expected not found")
            return
        }
    }
}
