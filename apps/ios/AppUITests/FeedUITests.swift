import XCTest

final class FeedUITests: XCTestCase {
    override func setUp() {
        continueAfterFailure = false
    }

    @MainActor
    func testSectionsAndFeedContent() {
        let app = launchApp()

        XCTContext.runActivity(named: "AC-feed-1: four sections, starting on Discover") { _ in
            for label in ["Discover", "Search", "Collections", "Wardrobe"] {
                app.tab(label).waitToAppear()
            }
            XCTAssertTrue(app.tab("Discover").isSelected)
            app.navigationBars["Discover"].waitToAppear()
        }

        XCTContext.runActivity(named: "AC-feed-2: every category as a tile, in API order") { _ in
            let streetwear = app.element("categoryTile.streetwear").waitToAppear()
            let minimal = app.element("categoryTile.minimal").waitToAppear()
            XCTAssertTrue(streetwear.label.contains("Streetwear"))
            XCTAssertTrue(minimal.label.contains("Minimal"))
            XCTAssertLessThan(streetwear.frame.minX, minimal.frame.minX)
            XCTAssertTrue(app.element("feed.categories").exists)
        }

        XCTContext.runActivity(named: "AC-feed-3: every outfit as a card with title, creator and likes, most liked first") { _ in
            let first = app.element("outfitCard.outfit-01").waitToAppear()
            let second = app.element("outfitCard.outfit-05").waitToAppear()
            XCTAssertTrue(first.label.contains("Orange Wall Street Edit"))
            XCTAssertTrue(first.label.contains("Malik Osei"))
            XCTAssertTrue(first.label.contains("4,821 likes"))
            XCTAssertEqual(first.frame.minY, second.frame.minY, accuracy: 1)
            XCTAssertLessThan(first.frame.minX, second.frame.minX)
            app.element("feed.outfits").swipeUp()
            let third = app.element("outfitCard.outfit-07").waitToAppear()
            XCTAssertGreaterThan(third.frame.minY, second.frame.minY)
        }
    }

    @MainActor
    func testCategoryTileOpensCategory() {
        let app = launchApp()
        XCTContext.runActivity(named: "AC-feed-4: tapping a category tile opens Category") { _ in
            app.element("categoryTile.minimal").waitToAppear().tap()
            app.navigationBars["Minimal"].waitToAppear()
            app.element("category.outfits").waitToAppear()
        }
    }

    @MainActor
    func testOutfitCardOpensOutfitDetail() {
        let app = launchApp()
        XCTContext.runActivity(named: "AC-feed-5: tapping an outfit card opens Outfit detail") { _ in
            app.element("outfitCard.outfit-05").waitToAppear().tap()
            app.element("outfitDetail.photos").waitToAppear()
            app.text("Ivory Blazer Set").waitToAppear()
        }

        XCTContext.runActivity(named: "AC-feed-1: choosing the current tab again pops it to its root") { _ in
            app.tab("Discover").tap()
            app.element("categoryTile.streetwear").waitToAppear()
            XCTAssertFalse(app.element("outfitDetail.photos").exists)
        }
    }

    @MainActor
    func testLoadingErrorAndRetry() {
        let app = launchApp("-uiTestingDelayMs", "3000", "-uiTestingFailOnce", "listOutfits")
        XCTContext.runActivity(named: "AC-feed-6: loading, then the error state, and Try again shows the content") { _ in
            app.element("state.loading").waitToAppear(4)
            app.element("state.error").waitToAppear(12)
            app.element("state.retry").tap()
            app.element("state.loading").waitToAppear(4)
            app.element("outfitCard.outfit-01").waitToAppear(12)
            XCTAssertFalse(app.element("state.error").exists)
        }
    }

    @MainActor
    func testEmptyFeed() {
        let app = launchApp("-uiTestingEmpty")
        XCTContext.runActivity(named: "AC-feed-7: with no outfits, Feed shows its empty state") { _ in
            app.element("state.empty").waitToAppear()
            app.text("No looks yet").waitToAppear()
            XCTAssertFalse(app.element("feed.outfits").exists)
        }
    }

    @MainActor
    func testSettingsEntryOpensSettings() {
        let app = launchApp()
        XCTContext.runActivity(named: "AC-feed-8: the Settings entry opens Settings") { _ in
            app.buttons["feed.openSettings"].waitToAppear().tap()
            app.element("settings.appearance").waitToAppear()
        }

        XCTContext.runActivity(named: "AC-settings-4: Settings shows the app version and build number") { _ in
            let version = app.element("settings.version").waitToAppear()
            XCTAssertTrue(version.label.contains("1.0.0"))
        }

        XCTContext.runActivity(named: "AC-settings-2: choosing an appearance applies it and stays selected") { _ in
            let dark = app.buttons["Dark"].firstMatch
            dark.waitToAppear().tap()
            XCTAssertTrue(dark.isSelected)
            app.buttons["System"].firstMatch.tap()
        }

        // Back returns to Feed, with its content kept.
        app.navigationBars.buttons.element(boundBy: 0).tap()
        app.element("outfitCard.outfit-01").waitToAppear()
    }
}
