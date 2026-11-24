import Testing
@testable import App

@Suite("Search")
struct SearchTests {
    @Test("AC-search-1: with no text and no filters, Search shows every outfit, most liked first")
    func everyOutfit() async {
        let repository = InMemoryCatalogRepository()
        let viewModel = SearchViewModel(repository: repository)
        await viewModel.loadIfNeeded()
        #expect(viewModel.results?.ids == ["outfit-01", "outfit-05", "outfit-07"])
        #expect(repository.requests.last == OutfitFilter(sort: .popular))
        #expect(!viewModel.hasFilters)
    }

    @Test("AC-search-2: typing searches after a short pause and shows only matching outfits")
    func typingDebounces() async {
        let repository = InMemoryCatalogRepository()
        let viewModel = SearchViewModel(repository: repository, debounce: .milliseconds(100))
        await viewModel.loadIfNeeded()
        let before = repository.requests.count

        viewModel.text = "W"
        viewModel.textChanged()
        viewModel.text = "Whi"
        viewModel.textChanged()
        viewModel.text = "White"
        viewModel.textChanged()
        #expect(repository.requests.count == before)

        #expect(await eventually { viewModel.results?.ids == ["outfit-07"] })
        // Only the last keystroke searched.
        #expect(repository.requests.count == before + 1)
        #expect(SearchViewModel.debounce == .milliseconds(300))
    }

    @Test("AC-search-3: category, season, occasion and sort are sent with the text, and the results are the API's")
    func filtersSent() async {
        let repository = InMemoryCatalogRepository()
        let viewModel = SearchViewModel(repository: repository, debounce: .zero)
        viewModel.text = "  Blazer "
        viewModel.setCategory("minimal")
        viewModel.setSeason(.spring)
        viewModel.setOccasion(.work)
        viewModel.setSort(.newest)

        #expect(await eventually { !viewModel.isLoading && viewModel.results != nil })
        #expect(repository.requests.last == OutfitFilter(search: "Blazer", categoryId: "minimal", season: .spring, occasion: .work, sort: .newest))
        #expect(viewModel.results?.ids == ["outfit-05"])
    }

    @Test("AC-search-3: the in-memory catalog filters like the API")
    func apiSemantics() {
        let outfits = Fixtures.outfits
        // Case-insensitive, over titles, tags, creators and item names and brands.
        #expect(InMemoryCatalogRepository.apply(OutfitFilter(search: "STRADA"), to: outfits).ids == ["outfit-01", "outfit-07"])
        #expect(InMemoryCatalogRepository.apply(OutfitFilter(search: "chloé"), to: outfits).ids == ["outfit-05"])
        #expect(InMemoryCatalogRepository.apply(OutfitFilter(search: "tailored"), to: outfits).ids == ["outfit-01", "outfit-05"])
        // Filters combine with AND.
        #expect(InMemoryCatalogRepository.apply(OutfitFilter(categoryId: "minimal", occasion: .everyday), to: outfits).ids == ["outfit-07"])
        // Newest first.
        #expect(InMemoryCatalogRepository.apply(OutfitFilter(sort: .newest), to: outfits).ids == ["outfit-01", "outfit-05", "outfit-07"])
        // An allSeason outfit matches any season.
        var allSeason = outfits[2]
        allSeason.season = "allSeason"
        #expect(InMemoryCatalogRepository.apply(OutfitFilter(season: .winter), to: [outfits[0], allSeason]).ids == ["outfit-07"])
    }

    @Test("AC-search-4: Clear filters shows only with a filter set, and resets the filters but keeps the text")
    func clearFilters() async {
        let viewModel = SearchViewModel(repository: InMemoryCatalogRepository(), debounce: .zero)
        viewModel.text = "blazer"
        #expect(!viewModel.hasFilters)

        viewModel.setSeason(.summer)
        #expect(viewModel.hasFilters)
        #expect(viewModel.seasonLabel == Strings.seasonSummer)

        viewModel.clearFilters()
        #expect(!viewModel.hasFilters)
        #expect(viewModel.season == nil)
        #expect(viewModel.sort == .popular)
        #expect(viewModel.text == "blazer")
        #expect(viewModel.seasonLabel == Strings.searchSeason)
        #expect(await eventually { viewModel.results?.ids == ["outfit-01", "outfit-05"] })
    }

    @Test("AC-search-5: with no results, Search has an empty result list")
    func noResults() async {
        let viewModel = SearchViewModel(repository: InMemoryCatalogRepository(), debounce: .zero)
        viewModel.text = "sequins"
        await viewModel.search()
        #expect(viewModel.results?.isEmpty == true)
        #expect(viewModel.error == nil)
    }

    @Test("AC-search-7: results from an older request never replace newer ones")
    func newestWins() async {
        let repository = ControlledCatalogRepository()
        let viewModel = SearchViewModel(repository: repository, debounce: .zero)

        viewModel.text = "old"
        let older = Task { await viewModel.search() }
        #expect(await eventually { repository.pending.count == 1 })
        viewModel.text = "new"
        let newer = Task { await viewModel.search() }
        #expect(await eventually { repository.pending.count == 2 })

        repository.answer(1, with: [Fixtures.outfits[1]])
        await newer.value
        repository.answer(0, with: [Fixtures.outfits[0]])
        await older.value

        #expect(viewModel.results?.ids == ["outfit-05"])
        #expect(!viewModel.isLoading)
    }

    @Test("AC-search-8: a failed search shows the error state, and Try again searches again")
    func errorAndRetry() async {
        let faults = InMemoryFaults(failOnce: ["listOutfits"])
        let viewModel = SearchViewModel(repository: InMemoryCatalogRepository(faults: faults))
        await viewModel.loadIfNeeded()
        #expect(viewModel.error == .failed)

        await viewModel.search()
        #expect(viewModel.error == nil)
        #expect(viewModel.results?.count == 3)
    }
}
