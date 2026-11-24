import Testing
@testable import App

@Suite("Launch options")
struct LaunchOptionsTests {
    @Test("Screenshot screens open in their tab, with the requested records")
    func screenshotScreens() {
        func options(_ arguments: String...) -> LaunchOptions { LaunchOptions(arguments: arguments) }

        #expect(options("-screenshotScreen", "category").initialPath == [.category("evening")])
        #expect(options("-screenshotScreen", "outfit-detail").initialPath == [.outfitDetail("outfit-17")])
        #expect(options("-screenshotScreen", "outfit-detail", "-screenshotOutfitId", "outfit-02").initialPath == [.outfitDetail("outfit-02")])
        #expect(options("-screenshotScreen", "search").initialTab == .search)
        #expect(options("-screenshotScreen", "collection-detail").initialTab == .collections)
        #expect(options("-screenshotScreen", "collection-detail").initialPath == [.collectionDetail("collection-weekend")])
        #expect(options("-screenshotScreen", "collection-editor").presentsCollectionEditor(for: "collection-weekend"))
        #expect(options("-screenshotScreen", "wardrobe-editor").initialTab == .wardrobe)
        #expect(options("-screenshotScreen", "wardrobe-editor").initialWardrobeEditorItemId == "wardrobe-03")
        #expect(options("-screenshotScreen", "settings").initialPath == [.settings])
        #expect(options("-screenshotAppearance", "dark").appearance == .dark)
        #expect(!options("-screenshotScreen", "feed").isUITesting)
    }

    @Test("UI testing uses in-memory repositories, with optional faults and an empty fixture")
    func uiTesting() async throws {
        let options = LaunchOptions(arguments: ["-uiTesting", "-uiTestingEmpty", "-uiTestingFailOnce", "listOutfits@2,getOutfit"])
        #expect(options.isUITesting && options.isEmpty)
        #expect(options.failOnce == ["listOutfits@2", "getOutfit"])

        let container = AppContainer.forLaunch(options)
        #expect(container.catalogRepository is InMemoryCatalogRepository)
        #expect(try await container.catalogRepository.listOutfits(OutfitFilter()).isEmpty)
        await #expect(throws: RepositoryError.failed) { try await container.catalogRepository.listOutfits(OutfitFilter()) }
        #expect(try await container.catalogRepository.listOutfits(OutfitFilter()).isEmpty)

        #expect(AppContainer.forLaunch(LaunchOptions(arguments: [])).catalogRepository is ApiCatalogRepository)
    }
}
