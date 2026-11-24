import XCTest

final class OutfitDetailUITests: XCTestCase {
    override func setUp() {
        continueAfterFailure = false
    }

    @MainActor
    func testOutfitContent() {
        let app = launchApp()
        app.element("outfitCard.outfit-01").waitToAppear().tap()

        XCTContext.runActivity(named: "AC-outfit-detail-1: a swipeable pager with a position badge, and the title, creator, likes, description and tags") { _ in
            let photos = app.element("outfitDetail.photos").waitToAppear()
            let badge = app.element("outfitDetail.photoPosition").waitToAppear()
            XCTAssertEqual(badge.label, "Photo 1 of 3")
            photos.swipeLeft()
            badge.waitForLabel(containing: "Photo 2 of 3")
            app.text("Orange Wall Street Edit").waitToAppear()
            app.text("by Malik Osei").waitToAppear()
            app.text("4,821 likes").waitToAppear()
            app.text("A tailored blazer thrown over shorts and tall socks. Bright sneakers keep it playful.").waitToAppear()
            app.text("blazer").waitToAppear()
            app.text("bold").waitToAppear()
        }

        XCTContext.runActivity(named: "AC-outfit-detail-3: every item with its photo, name, brand, type and price") { _ in
            let items = app.element("outfitDetail.items")
            app.swipeUp()
            items.waitToAppear()
            let blazer = app.containing("Relaxed linen blazer").waitToAppear()
            XCTAssertTrue(blazer.label.contains("Northline"))
            XCTAssertTrue(blazer.label.contains("Outerwear"))
            XCTAssertTrue(blazer.label.contains("$189"))
            XCTAssertTrue(app.containing("Volt runner").exists)
            XCTAssertTrue(app.containing("$42").exists)
        }

        XCTContext.runActivity(named: "AC-outfit-detail-2: style, season and occasion, and the style opens Category") { _ in
            let style = app.element("outfitDetail.category").waitToAppear()
            XCTAssertTrue(style.label.contains("Streetwear"))
            XCTAssertTrue(app.containing("Summer").exists)
            XCTAssertTrue(app.containing("Everyday").exists)
            style.tap()
            app.navigationBars["Streetwear"].waitToAppear()
        }
    }

    @MainActor
    func testSaveToCollection() {
        let app = launchApp()

        XCTContext.runActivity(named: "AC-outfit-detail-5: Saved for an outfit in a collection, with its check mark in the sheet") { _ in
            app.element("outfitCard.outfit-01").waitToAppear().tap()
            let save = app.buttons["outfitDetail.save"].waitToAppear()
            XCTAssertTrue(save.label.contains("Saved"))
            save.tap()
            app.element("saveToCollection.sheet").waitToAppear()
            XCTAssertTrue(app.buttons["saveToCollection.row.collection-weekend"].waitToAppear().isSelected)
            app.buttons["saveToCollection.done"].tap()
            app.element("saveToCollection.sheet").waitToDisappear()
            app.navigationBars.buttons.element(boundBy: 0).tap()
        }

        XCTContext.runActivity(named: "AC-outfit-detail-5: Save for an outfit in no collection") { _ in
            app.element("outfitCard.outfit-05").waitToAppear().tap()
            let save = app.buttons["outfitDetail.save"].waitToAppear()
            XCTAssertFalse(save.label.contains("Saved"))
            save.tap()
            XCTAssertFalse(app.buttons["saveToCollection.row.collection-weekend"].waitToAppear().isSelected)
        }

        XCTContext.runActivity(named: "AC-outfit-detail-6: tapping a collection adds the outfit, checks it and shows a toast naming it") { _ in
            let row = app.buttons["saveToCollection.row.collection-weekend"]
            row.tap()
            app.toast(containing: "Saved to Weekend edits").waitToAppear()
            XCTAssertTrue(row.isSelected)
            app.buttons["saveToCollection.done"].tap()
            app.buttons["outfitDetail.save"].waitForLabel(containing: "Saved")
        }

        XCTContext.runActivity(named: "AC-outfit-detail-6: tapping it again removes the outfit") { _ in
            app.buttons["outfitDetail.save"].tap()
            let row = app.buttons["saveToCollection.row.collection-weekend"].waitToAppear()
            row.tap()
            app.toast(containing: "Removed from Weekend edits").waitToAppear()
            XCTAssertFalse(row.isSelected)
            app.buttons["saveToCollection.done"].tap()
            app.element("saveToCollection.sheet").waitToDisappear()
            XCTAssertFalse(app.buttons["outfitDetail.save"].label.contains("Saved"))
        }

        XCTContext.runActivity(named: "AC-outfit-detail-7: New collection creates it with the outfit in it") { _ in
            app.buttons["outfitDetail.save"].tap()
            app.buttons["saveToCollection.new"].waitToAppear().tap()
            let name = app.textFields["collectionEditor.name"].waitToAppear()
            name.tap()
            name.typeText("Office edits")
            app.buttons["collectionEditor.save"].tap()
            app.toast(containing: "Saved to Office edits").waitToAppear()
            app.buttons["saveToCollection.done"].tap()
            app.buttons["outfitDetail.save"].waitForLabel(containing: "Saved")
        }
    }

    @MainActor
    func testLoadingAndError() {
        let app = launchApp("-uiTestingDelayMs", "3000", "-uiTestingFailOnce", "getOutfit")
        XCTContext.runActivity(named: "AC-outfit-detail-8: loading, then the error state, and Try again loads the outfit") { _ in
            app.element("outfitCard.outfit-01").waitToAppear(12).tap()
            app.element("state.loading").waitToAppear(4)
            app.element("state.error").waitToAppear(12)
            app.element("state.retry").tap()
            app.element("outfitDetail.photos").waitToAppear(12)
        }
    }

    @MainActor
    func testNotFound() {
        let app = launchApp("-screenshotScreen", "outfit-detail", "-screenshotOutfitId", "outfit-99")
        XCTContext.runActivity(named: "AC-outfit-detail-8: an outfit that doesn't exist shows the not found message, with no retry") { _ in
            app.element("state.error").waitToAppear()
            app.text("This outfit is no longer available.").waitToAppear()
            XCTAssertFalse(app.element("state.retry").exists)
        }
    }
}
