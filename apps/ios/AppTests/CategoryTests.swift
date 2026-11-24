import Testing
@testable import App

@Suite("Category")
struct CategoryTests {
    @Test("AC-category-1: shows the category's name, description and only its outfits, most liked first")
    func showsCategory() async {
        let viewModel = CategoryViewModel(categoryId: "minimal", repository: InMemoryCatalogRepository())
        await viewModel.load()
        #expect(viewModel.title == "Minimal")
        #expect(viewModel.state.value?.category.description == "Clean lines, quiet colors and pieces that last.")
        #expect(viewModel.state.value?.outfits.ids == ["outfit-05", "outfit-07"])
    }

    @Test("AC-category-3: shows the error state, retries, and has an empty state for a category with no outfits")
    func states() async {
        let faults = InMemoryFaults(failOnce: ["listOutfits"])
        let viewModel = CategoryViewModel(categoryId: "streetwear", repository: InMemoryCatalogRepository(faults: faults))
        await viewModel.loadIfNeeded()
        guard case .failed = viewModel.state else {
            Issue.record("expected the error state")
            return
        }
        await viewModel.load()
        #expect(viewModel.state.value?.outfits.ids == ["outfit-01"])

        let empty = CategoryViewModel(categoryId: "minimal", repository: InMemoryCatalogRepository(outfits: []))
        await empty.load()
        #expect(empty.state.value?.outfits.isEmpty == true)
    }

    @Test("AC-category-3: an unknown category id shows the error state")
    func unknownCategory() async {
        let viewModel = CategoryViewModel(categoryId: "nope", repository: InMemoryCatalogRepository())
        await viewModel.load()
        guard case .failed(.failed) = viewModel.state else {
            Issue.record("expected the error state")
            return
        }
    }
}
