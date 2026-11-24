import XCTest

/// UI tests launch the built app with `-uiTesting` (in-memory repositories holding the shared
/// fixture) and drive it the way a user does, by accessibility identifier. They cover acceptance
/// criteria marked (ui): each criterion's ID is in an activity name.
extension XCTestCase {
    @MainActor
    func launchApp(_ arguments: String...) -> XCUIApplication {
        let app = XCUIApplication()
        app.launchArguments = ["-uiTesting"] + arguments
        app.launch()
        return app
    }
}

extension XCUIApplication {
    /// The first element with this identifier, whatever its type.
    @MainActor
    func element(_ identifier: String) -> XCUIElement {
        descendants(matching: .any)[identifier].firstMatch
    }

    /// A tab bar item, found by its label: iOS tab items can't carry identifiers.
    @MainActor
    func tab(_ label: String) -> XCUIElement {
        tabBars.buttons[label].firstMatch
    }

    @MainActor
    func text(_ label: String) -> XCUIElement {
        staticTexts[label].firstMatch
    }

    /// Any element whose label contains `text`.
    @MainActor
    func containing(_ text: String) -> XCUIElement {
        descendants(matching: .any).matching(NSPredicate(format: "label CONTAINS %@", text)).firstMatch
    }

    /// The toast showing `text`, matched in one query: a toast only stays up a few seconds.
    @MainActor
    func toast(containing text: String) -> XCUIElement {
        descendants(matching: .any)
            .matching(NSPredicate(format: "identifier == 'toast' AND label CONTAINS %@", text)).firstMatch
    }

    /// Taps the button `identifier` in a horizontal scroller, scrolling the scroller until it's on screen.
    @MainActor
    func tapInRow(_ identifier: String, file: StaticString = #filePath, line: UInt = #line) {
        let button = buttons[identifier].firstMatch
        button.waitToAppear(file: file, line: line)
        let ancestors = scrollViews.containing(.any, identifier: identifier).allElementsBoundByIndex
        let row = ancestors.last ?? scrollViews.firstMatch
        for _ in 0..<4 {
            if button.frame.maxX > frame.maxX {
                row.swipeLeft()
            } else if button.frame.minX < frame.minX {
                row.swipeRight()
            } else {
                break
            }
        }
        button.tap()
    }

    /// Taps outside a popover or menu to dismiss it.
    @MainActor
    func tapOutside() {
        coordinate(withNormalizedOffset: CGVector(dx: 0.5, dy: 0.1)).tap()
    }
}

extension XCUIElement {
    @MainActor
    @discardableResult
    func waitToAppear(_ timeout: TimeInterval = 5, file: StaticString = #filePath, line: UInt = #line) -> XCUIElement {
        XCTAssertTrue(waitForExistence(timeout: timeout), "\(self) didn't appear", file: file, line: line)
        return self
    }

    @MainActor
    func waitToDisappear(_ timeout: TimeInterval = 5, file: StaticString = #filePath, line: UInt = #line) {
        let gone = XCTNSPredicateExpectation(predicate: NSPredicate(format: "exists == false"), object: self)
        XCTAssertEqual(XCTWaiter.wait(for: [gone], timeout: timeout), .completed, "\(self) didn't disappear", file: file, line: line)
    }

    /// Waits until the element's label contains `text`.
    @MainActor
    func waitForLabel(containing text: String, timeout: TimeInterval = 5, file: StaticString = #filePath, line: UInt = #line) {
        let match = XCTNSPredicateExpectation(predicate: NSPredicate(format: "label CONTAINS %@", text), object: self)
        XCTAssertEqual(XCTWaiter.wait(for: [match], timeout: timeout), .completed, "\(self) never read \(text)", file: file, line: line)
    }
}
