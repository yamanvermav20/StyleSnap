import Testing
@testable import App

@Suite("Feed")
struct FeedTests {
    @Test("AC-feed-1: the app has four sections, Discover, Search, Collections and Wardrobe, and starts on Discover")
    func fourSections() {
        #expect(AppTab.allCases == [.discover, .search, .collections, .wardrobe])
        #expect(AppTab.allCases.map(\.title) == [Strings.tabsDiscover, Strings.tabsSearch, Strings.tabsCollections, Strings.tabsWardrobe])
        let options = LaunchOptions(arguments: [])
        #expect(options.initialTab == .discover)
        #expect(options.initialPath.isEmpty)
    }

    @Test("AC-feed-2: shows every category in API order")
    func categoriesInOrder() async {
        let viewModel = FeedViewModel(repository: InMemoryCatalogRepository())
        await viewModel.load()
        #expect(viewModel.state.value?.categories.map(\.id) == ["streetwear", "minimal"])
    }

    @Test("AC-feed-3: shows every outfit, most liked first")
    func outfitsMostLikedFirst() async {
        let viewModel = FeedViewModel(repository: InMemoryCatalogRepository())
        await viewModel.load()
        #expect(viewModel.state.value?.outfits.ids == ["outfit-01", "outfit-05", "outfit-07"])
    }

    @Test("AC-feed-6: a failed load shows the error state, and Try again loads the content")
    func errorAndRetry() async {
        let faults = InMemoryFaults(failOnce: ["listCategories"])
        let viewModel = FeedViewModel(repository: InMemoryCatalogRepository(faults: faults))
        #expect(viewModel.state.value == nil)

        await viewModel.loadIfNeeded()
        guard case .failed(.failed) = viewModel.state else {
            Issue.record("expected the error state, got \(viewModel.state)")
            return
        }

        await viewModel.load()
        #expect(viewModel.state.value?.outfits.count == 3)
    }

    @Test("AC-feed-6: returning to Feed keeps what's loaded")
    func keepsContent() async {
        let repository = InMemoryCatalogRepository()
        let viewModel = FeedViewModel(repository: repository)
        await viewModel.loadIfNeeded()
        await viewModel.loadIfNeeded()
        #expect(repository.requests.count == 1)
    }

    @Test("AC-feed-7: with no outfits, Feed has an empty outfit list but still its categories")
    func empty() async {
        let viewModel = FeedViewModel(repository: InMemoryCatalogRepository(outfits: []))
        await viewModel.load()
        #expect(viewModel.state.value?.outfits.isEmpty == true)
        #expect(viewModel.state.value?.categories.count == 2)
    }
}
