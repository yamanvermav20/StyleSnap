import XCTest

final class WardrobeUITests: XCTestCase {
    override func setUp() {
        continueAfterFailure = false
    }

    @MainActor
    private func openWardrobe(_ arguments: String...) -> XCUIApplication {
        let app = XCUIApplication()
        app.launchArguments = ["-uiTesting"] + arguments
        app.launch()
        app.tab("Wardrobe").waitToAppear().tap()
        return app
    }

    @MainActor
    func testListAndFilter() {
        let app = openWardrobe()

        XCTContext.runActivity(named: "AC-wardrobe-1: every item, newest first, with name, brand and a star for favorites") { _ in
            let tee = app.element("wardrobeCard.wardrobe-01").waitToAppear()
            let sneakers = app.element("wardrobeCard.wardrobe-04").waitToAppear()
            XCTAssertTrue(tee.label.contains("White crew tee"))
            XCTAssertTrue(tee.label.contains("Field & Co"))
            XCTAssertTrue(tee.label.contains("Favorite"))
            XCTAssertFalse(sneakers.label.contains("Favorite"))
            XCTAssertLessThan(tee.frame.minX, sneakers.frame.minX)
            app.text("2 items").waitToAppear()
        }

        XCTContext.runActivity(named: "AC-wardrobe-2: a type chip shows only that type; All shows everything") { _ in
            app.tapInRow("wardrobe.filter.shoes")
            app.element("wardrobeCard.wardrobe-04").waitToAppear()
            app.element("wardrobeCard.wardrobe-01").waitToDisappear()
            XCTAssertTrue(app.buttons["wardrobe.filter.shoes"].isSelected)
            app.tapInRow("wardrobe.filter.all")
            app.element("wardrobeCard.wardrobe-01").waitToAppear()
            app.element("wardrobeCard.wardrobe-04").waitToAppear()
        }

        XCTContext.runActivity(named: "AC-wardrobe-3: with none of the chosen type, the filtered empty state") { _ in
            app.tapInRow("wardrobe.filter.dress")
            app.element("state.empty").waitToAppear()
            app.text("Nothing here yet").waitToAppear()
            app.tapInRow("wardrobe.filter.all")
        }
    }

    @MainActor
    func testEmptyWardrobe() {
        let app = openWardrobe("-uiTestingEmpty")
        XCTContext.runActivity(named: "AC-wardrobe-3: with no items, the empty state with an Add action") { _ in
            app.element("state.empty").waitToAppear()
            app.text("Build your wardrobe").waitToAppear()
            app.buttons["state.emptyAction"].tap()
            app.textFields["wardrobeEditor.name"].waitToAppear()
        }
    }

    @MainActor
    func testAddItem() {
        let app = openWardrobe()
        app.buttons["wardrobe.add"].waitToAppear().tap()

        XCTContext.runActivity(named: "AC-wardrobe-4: Add item opens the editor with the defaults and the photos of the selected type") { _ in
            app.navigationBars["New item"].waitToAppear()
            app.element("wardrobeEditor.photo.photo-whiteTee").waitToAppear()
            XCTAssertFalse(app.element("wardrobeEditor.photo.photo-whiteSneaker").exists)
            XCTAssertFalse(app.element("wardrobeEditor.photo.photo-whiteTee").isSelected)
            XCTAssertTrue(app.buttons["wardrobeEditor.type"].firstMatch.label.contains("Tops"))
            XCTAssertTrue(app.buttons["wardrobeEditor.season"].firstMatch.label.contains("All season"))
            XCTAssertEqual(app.switches["wardrobeEditor.favorite"].firstMatch.value as? String, "0")
        }

        XCTContext.runActivity(named: "AC-wardrobe-6: saving without a name or photo shows a message and doesn't save") { _ in
            app.buttons["wardrobeEditor.save"].tap()
            let error = app.element("wardrobeEditor.error").waitToAppear()
            XCTAssertTrue(error.label.contains("Give the item a name."))
            XCTAssertTrue(error.label.contains("Choose a photo."))
        }

        XCTContext.runActivity(named: "AC-wardrobe-5: a new item with a name and a photo appears first") { _ in
            app.element("wardrobeEditor.photo.photo-blueTee").tap()
            XCTAssertTrue(app.element("wardrobeEditor.photo.photo-blueTee").isSelected)
            let name = app.textFields["wardrobeEditor.name"]
            name.tap()
            name.typeText("Blue tee")
            app.buttons["wardrobeEditor.save"].tap()
            app.textFields["wardrobeEditor.name"].waitToDisappear()
            let created = app.buttons.matching(NSPredicate(format: "label CONTAINS 'Blue tee'")).firstMatch.waitToAppear()
            XCTAssertLessThanOrEqual(created.frame.minY, app.element("wardrobeCard.wardrobe-01").frame.minY)
            app.text("3 items").waitToAppear()
        }
    }

    @MainActor
    func testEditItem() {
        let app = openWardrobe()
        XCTContext.runActivity(named: "AC-wardrobe-7: an item opens the editor filled in, and saving updates it") { _ in
            app.element("wardrobeCard.wardrobe-01").waitToAppear().tap()
            app.navigationBars["Edit item"].waitToAppear()
            XCTAssertEqual(app.textFields["wardrobeEditor.name"].waitToAppear().value as? String, "White crew tee")
            XCTAssertEqual(app.textFields["wardrobeEditor.brand"].value as? String, "Field & Co")
            XCTAssertTrue(app.element("wardrobeEditor.photo.photo-whiteTee").isSelected)
            let favorite = app.switches["wardrobeEditor.favorite"].firstMatch
            XCTAssertEqual(favorite.value as? String, "1")
            let control = favorite.switches.firstMatch
            (control.exists ? control : favorite).tap()
            let off = XCTNSPredicateExpectation(predicate: NSPredicate(format: "value == '0'"), object: favorite)
            XCTAssertEqual(XCTWaiter.wait(for: [off], timeout: 3), .completed)
            app.buttons["wardrobeEditor.save"].tap()
            app.textFields["wardrobeEditor.name"].waitToDisappear()
            let card = app.element("wardrobeCard.wardrobe-01").waitToAppear()
            let unstarred = XCTNSPredicateExpectation(predicate: NSPredicate(format: "NOT (label CONTAINS 'Favorite')"), object: card)
            XCTAssertEqual(XCTWaiter.wait(for: [unstarred], timeout: 5), .completed)
        }
    }

    @MainActor
    func testDeleteItem() {
        let app = openWardrobe()
        XCTContext.runActivity(named: "AC-wardrobe-8: Delete asks for confirmation, then removes the item") { _ in
            app.element("wardrobeCard.wardrobe-04").waitToAppear().tap()
            app.textFields["wardrobeEditor.name"].waitToAppear()
            let delete = app.buttons["wardrobeEditor.delete"].firstMatch
            app.swipeUp()
            delete.waitToAppear().tap()
            app.buttons["wardrobeEditor.confirmDelete"].firstMatch.waitToAppear().tap()
            app.textFields["wardrobeEditor.name"].waitToDisappear()
            app.element("wardrobeCard.wardrobe-04").waitToDisappear()
            app.element("wardrobeCard.wardrobe-01").waitToAppear()
        }
    }

    @MainActor
    func testWardrobeLoadingAndError() {
        let app = openWardrobe("-uiTestingDelayMs", "3000", "-uiTestingFailOnce", "listWardrobeItems")
        XCTContext.runActivity(named: "AC-wardrobe-9: Wardrobe shows loading, then the error state, and Try again loads") { _ in
            app.element("state.loading").waitToAppear(4)
            app.element("state.error").waitToAppear(12)
            app.element("state.retry").tap()
            app.element("wardrobeCard.wardrobe-01").waitToAppear(12)
        }
    }

    @MainActor
    func testEditorErrors() {
        let app = openWardrobe("-uiTestingFailOnce", "listWardrobePhotos,updateWardrobeItem")
        XCTContext.runActivity(named: "AC-wardrobe-9: the editor shows the error state, and Try again loads the form") { _ in
            app.element("wardrobeCard.wardrobe-01").waitToAppear().tap()
            app.element("state.error").waitToAppear()
            app.element("state.retry").tap()
            app.textFields["wardrobeEditor.name"].waitToAppear()
        }

        XCTContext.runActivity(named: "AC-wardrobe-9: a failed save keeps the editor open with the error") { _ in
            app.buttons["wardrobeEditor.save"].tap()
            app.element("wardrobeEditor.error").waitForLabel(containing: "Couldn't save your changes.")
            XCTAssertTrue(app.textFields["wardrobeEditor.name"].exists)
        }
    }
}
