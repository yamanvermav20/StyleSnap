import XCTest

final class SearchUITests: XCTestCase {
    override func setUp() {
        continueAfterFailure = false
    }

    @MainActor
    private func openSearch(_ arguments: String...) -> XCUIApplication {
        let app = XCUIApplication()
        app.launchArguments = ["-uiTesting"] + arguments
        app.launch()
        app.tab("Search").waitToAppear().tap()
        return app
    }

    @MainActor
    private func type(_ text: String, in app: XCUIApplication) {
        let field = app.searchFields.firstMatch.waitToAppear()
        field.tap()
        field.typeText(text)
    }

    @MainActor
    private func choose(_ option: String, in filter: String, app: XCUIApplication) {
        app.tapInRow(filter)
        app.buttons[option].firstMatch.waitToAppear().tap()
    }

    @MainActor
    func testEveryOutfitAndText() {
        let app = openSearch()

        XCTContext.runActivity(named: "AC-search-1: with no text and no filters, every outfit with the result count") { _ in
            app.element("search.resultCount").waitForLabel(containing: "3 results")
            app.element("outfitCard.outfit-01").waitToAppear()
            app.element("outfitCard.outfit-05").waitToAppear()
            XCTAssertTrue(app.element("search.results").exists)
            XCTAssertFalse(app.element("search.clearFilters").exists)
        }

        XCTContext.runActivity(named: "AC-search-2: typing shows only matching outfits, after a short pause") { _ in
            type("white", in: app)
            app.element("search.resultCount").waitForLabel(containing: "1 result")
            app.element("outfitCard.outfit-07").waitToAppear()
            XCTAssertFalse(app.element("outfitCard.outfit-01").exists)
        }

        XCTContext.runActivity(named: "AC-search-6: tapping a result opens Outfit detail") { _ in
            app.element("outfitCard.outfit-07").tap()
            app.element("outfitDetail.photos").waitToAppear()
            app.text("Clean White Tee").waitToAppear()
        }
    }

    @MainActor
    func testFiltersAndClear() {
        let app = openSearch()
        type("blazer", in: app)
        app.element("search.resultCount").waitForLabel(containing: "2 results")

        XCTContext.runActivity(named: "AC-search-4: Clear filters appears with a filter set, and resets the filters but keeps the text") { _ in
            XCTAssertFalse(app.element("search.clearFilters").exists)
            choose("Summer", in: "search.filter.season", app: app)
            app.element("search.resultCount").waitForLabel(containing: "1 result")
            app.element("outfitCard.outfit-01").waitToAppear()
            XCTAssertTrue(app.buttons["search.filter.season"].firstMatch.label.contains("Summer"))

            app.tapInRow("search.clearFilters")
            app.element("search.resultCount").waitForLabel(containing: "2 results")
            app.element("search.clearFilters").waitToDisappear()
            XCTAssertEqual(app.searchFields.firstMatch.value as? String, "blazer")
        }

        XCTContext.runActivity(named: "AC-search-4: sort is a filter too") { _ in
            choose("Newest", in: "search.sort", app: app)
            app.buttons["search.clearFilters"].waitToAppear()
        }
    }

    @MainActor
    func testNoResults() {
        let app = openSearch()
        XCTContext.runActivity(named: "AC-search-5: with no results, the empty state") { _ in
            type("sequins", in: app)
            app.element("state.empty").waitToAppear()
            app.text("No outfits match").waitToAppear()
        }
    }

    @MainActor
    func testErrorAndRetry() {
        // Feed makes the first listOutfits call; Search makes the second.
        let app = openSearch("-uiTestingDelayMs", "500", "-uiTestingFailOnce", "listOutfits@2")
        XCTContext.runActivity(named: "AC-search-8: the error state when loading fails, and Try again searches again") { _ in
            app.element("state.error").waitToAppear(6)
            app.element("state.retry").tap()
            app.element("search.resultCount").waitForLabel(containing: "3 results", timeout: 6)
        }
    }
}
