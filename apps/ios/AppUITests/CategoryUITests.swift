import XCTest

final class CategoryUITests: XCTestCase {
    override func setUp() {
        continueAfterFailure = false
    }

    @MainActor
    func testCategoryContent() {
        let app = launchApp()
        app.element("categoryTile.minimal").waitToAppear().tap()

        XCTContext.runActivity(named: "AC-category-1: the name as title, the description and only its outfits, most liked first") { _ in
            app.navigationBars["Minimal"].waitToAppear()
            app.text("Clean lines, quiet colors and pieces that last.").waitToAppear()
            app.text("2 outfits").waitToAppear()
            let first = app.element("outfitCard.outfit-05").waitToAppear()
            let second = app.element("outfitCard.outfit-07").waitToAppear()
            XCTAssertLessThan(first.frame.minX, second.frame.minX)
            XCTAssertFalse(app.element("outfitCard.outfit-01").exists)
        }

        XCTContext.runActivity(named: "AC-category-2: tapping an outfit card opens its Outfit detail") { _ in
            app.element("outfitCard.outfit-07").tap()
            app.element("outfitDetail.photos").waitToAppear()
            app.text("Clean White Tee").waitToAppear()
        }
    }

    @MainActor
    func testLoadingErrorAndRetry() {
        // Feed makes the first listOutfits call; Category makes the second.
        let app = launchApp("-uiTestingDelayMs", "3000", "-uiTestingFailOnce", "listOutfits@2")
        XCTContext.runActivity(named: "AC-category-3: loading, error with Try again, then the content") { _ in
            app.element("categoryTile.streetwear").waitToAppear(12).tap()
            app.element("state.loading").waitToAppear(4)
            app.element("state.error").waitToAppear(12)
            app.element("state.retry").tap()
            app.element("outfitCard.outfit-01").waitToAppear(12)
        }
    }

    @MainActor
    func testEmptyCategory() {
        let app = launchApp("-uiTestingEmpty")
        XCTContext.runActivity(named: "AC-category-3: a category with no outfits shows its empty state") { _ in
            app.element("categoryTile.streetwear").waitToAppear().tap()
            app.element("state.empty").waitToAppear()
            app.text("Nothing in this style yet").waitToAppear()
        }
    }
}
