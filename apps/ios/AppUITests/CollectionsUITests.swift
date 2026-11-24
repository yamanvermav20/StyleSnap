import XCTest

final class CollectionsUITests: XCTestCase {
    override func setUp() {
        continueAfterFailure = false
    }

    @MainActor
    private func openCollections(_ arguments: String...) -> XCUIApplication {
        let app = XCUIApplication()
        app.launchArguments = ["-uiTesting"] + arguments
        app.launch()
        app.tab("Collections").waitToAppear().tap()
        return app
    }

    /// The Edit and Delete actions sit in the toolbar menu, labeled Edit.
    @MainActor
    private func openActions(_ app: XCUIApplication) {
        app.navigationBars.buttons["Edit"].firstMatch.waitToAppear().tap()
    }

    @MainActor
    func testListAndDetail() {
        let app = openCollections()

        XCTContext.runActivity(named: "AC-collections-1: every collection with its collage, name and outfit count") { _ in
            let card = app.element("collectionCard.collection-weekend").waitToAppear()
            XCTAssertTrue(card.label.contains("Weekend edits"))
            XCTAssertTrue(card.label.contains("1 outfit"))
            XCTAssertTrue(app.element("collections.list").exists)
        }

        XCTContext.runActivity(named: "AC-collections-5: a collection opens with its name, description and outfits") { _ in
            app.element("collectionCard.collection-weekend").tap()
            app.navigationBars["Weekend edits"].waitToAppear()
            app.text("Easy looks for slow Saturdays.").waitToAppear()
            app.element("collectionDetail.outfits").waitToAppear()
            app.element("outfitCard.outfit-01").waitToAppear()
        }

        XCTContext.runActivity(named: "AC-collections-6: Edit opens the editor filled in, and saving renames the collection") { _ in
            openActions(app)
            app.buttons["collectionDetail.edit"].firstMatch.waitToAppear().tap()
            let name = app.textFields["collectionEditor.name"].waitToAppear()
            XCTAssertEqual(name.value as? String, "Weekend edits")
            name.tap()
            name.typeText(" v2")
            app.buttons["collectionEditor.save"].tap()
            app.navigationBars["Weekend edits v2"].waitToAppear()
        }
    }

    @MainActor
    func testCreate() {
        let app = openCollections()
        app.element("collectionCard.collection-weekend").waitToAppear()

        XCTContext.runActivity(named: "AC-collections-4: an empty name shows a message and doesn't save") { _ in
            app.buttons["collections.add"].tap()
            app.buttons["collectionEditor.save"].waitToAppear().tap()
            app.element("collectionEditor.error").waitForLabel(containing: "Give your collection a name.")
            XCTAssertTrue(app.buttons["collectionEditor.cancel"].exists)
        }

        XCTContext.runActivity(named: "AC-collections-3: creating a collection with a name adds it to the top") { _ in
            let name = app.textFields["collectionEditor.name"]
            name.tap()
            name.typeText("Date night")
            app.buttons["collectionEditor.save"].tap()
            app.element("collectionEditor.name").waitToDisappear()
            let created = app.buttons.matching(NSPredicate(format: "label CONTAINS 'Date night'")).firstMatch.waitToAppear()
            let weekend = app.element("collectionCard.collection-weekend")
            XCTAssertLessThan(created.frame.minX, weekend.frame.minX)
        }
    }

    @MainActor
    func testEmptyCollections() {
        let app = openCollections("-uiTestingEmpty")
        XCTContext.runActivity(named: "AC-collections-2: with no collections, the empty state, and its action opens the editor") { _ in
            app.element("state.empty").waitToAppear()
            app.text("Save looks you love").waitToAppear()
            app.buttons["state.emptyAction"].tap()
            app.textFields["collectionEditor.name"].waitToAppear()
            app.buttons["collectionEditor.cancel"].tap()
            app.element("state.empty").waitToAppear()
        }
    }

    @MainActor
    func testDelete() {
        let app = openCollections()
        XCTContext.runActivity(named: "AC-collections-7: Delete asks for confirmation, removes the collection and returns to Collections") { _ in
            app.element("collectionCard.collection-weekend").waitToAppear().tap()
            app.navigationBars["Weekend edits"].waitToAppear()
            openActions(app)
            app.buttons["collectionDetail.delete"].firstMatch.waitToAppear().tap()
            app.buttons["collectionDetail.confirmDelete"].firstMatch.waitToAppear().tap()
            app.navigationBars["Collections"].waitToAppear()
            app.element("state.empty").waitToAppear()
            XCTAssertFalse(app.element("collectionCard.collection-weekend").exists)
        }
    }

    @MainActor
    func testRemoveOutfitAndEmptyCollection() {
        let app = openCollections()
        app.element("collectionCard.collection-weekend").waitToAppear().tap()

        XCTContext.runActivity(named: "AC-collections-9: an empty collection shows its empty state (after AC-collections-8: removing its outfit)") { _ in
            app.element("outfitCard.outfit-01").waitToAppear().press(forDuration: 1.2)
            let remove = app.buttons["collectionDetail.remove.outfit-01"].firstMatch
            if remove.waitForExistence(timeout: 3) {
                remove.tap()
            } else {
                app.buttons["Remove from collection"].firstMatch.waitToAppear().tap()
            }
            app.element("state.empty").waitToAppear()
            app.text("No outfits saved yet").waitToAppear()
            XCTAssertFalse(app.element("outfitCard.outfit-01").exists)
        }
    }

    @MainActor
    func testLoadingAndErrors() {
        let app = openCollections("-uiTestingDelayMs", "3000", "-uiTestingFailOnce", "listCollections,getCollection")
        XCTContext.runActivity(named: "AC-collections-9: Collections shows loading, then the error state, and Try again loads") { _ in
            app.element("state.loading").waitToAppear(4)
            app.element("state.error").waitToAppear(12)
            app.element("state.retry").tap()
            app.element("collectionCard.collection-weekend").waitToAppear(12)
        }

        XCTContext.runActivity(named: "AC-collections-9: Collection detail shows the error state, and Try again loads") { _ in
            app.element("collectionCard.collection-weekend").tap()
            app.element("state.error").waitToAppear(12)
            app.element("state.retry").tap()
            app.element("outfitCard.outfit-01").waitToAppear(12)
        }
    }
}
