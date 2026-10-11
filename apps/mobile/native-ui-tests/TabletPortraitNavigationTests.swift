import XCTest

final class TabletPortraitNavigationTests: XCTestCase {
  func testToolbarSidebarPreservesEditorAndReturnsToFullList() throws {
    let app = launchPortrait()
    defer { XCUIDevice.shared.orientation = .landscapeLeft }
    app.buttons.matching(identifier: "tablet-note-list-sidebar-action").firstMatch.tap()
    assertSidebarDrawer(app)
    app.buttons.matching(identifier: "sidebar-item-all-notes").firstMatch.tap()
    waitUntil { !self.element(app, "workspace-sidebar-panel").exists }
    XCTAssertEqual(element(app, "note-list-panel").frame.minX, 0, accuracy: 1)
    XCTAssertEqual(element(app, "note-list-panel").frame.width, 340, accuracy: 1)
    XCTAssertEqual(app.staticTexts.matching(identifier: "note-list-toolbar-title").firstMatch.label, "All Notes")
    app.buttons.matching(identifier: "tablet-note-list-sidebar-action").firstMatch.tap()
    assertSidebarDrawer(app)
    app.buttons.matching(identifier: "sidebar-collapse-action").firstMatch.tap()
    waitUntil { !self.element(app, "workspace-sidebar-panel").exists }
    app.buttons.matching(identifier: "editor-properties-action").firstMatch.tap()
    waitUntil { self.element(app, "properties-panel").exists }
    XCTAssertGreaterThanOrEqual(element(app, "editor-panel").frame.width, 520)
  }

  func testDragSidebarUsesSamePortraitGeometry() throws {
    let app = launchPortrait()
    defer { XCUIDevice.shared.orientation = .landscapeLeft }
    drag(element(app, "note-list-panel"), dx: 240)
    assertSidebarDrawer(app)
    drag(element(app, "workspace-sidebar-panel"), dx: -240)
    waitUntil { !self.element(app, "workspace-sidebar-panel").exists }
    XCTAssertEqual(element(app, "editor-panel").frame.minX, 340, accuracy: 1)
    let screenshot = XCTAttachment(screenshot: app.screenshot())
    screenshot.lifetime = .keepAlways
    add(screenshot)
  }

  private func launchPortrait() -> XCUIApplication {
    continueAfterFailure = false
    XCUIDevice.shared.orientation = .portrait
    let app = XCUIApplication(bundleIdentifier: "com.tolaria.mobile.dev")
    app.launchArguments = ["--tolaria-mobile-search", "?source=fixture&editorMode=wysiwyg&qaRun=portrait-navigation"]
    app.launch()
    XCTAssertTrue(element(app, "note-list-panel").waitForExistence(timeout: 60))
    waitUntil { app.frame.width < app.frame.height }
    return app
  }

  private func assertSidebarDrawer(_ app: XCUIApplication) {
    let sidebar = element(app, "workspace-sidebar-panel")
    waitUntil { sidebar.exists && abs(sidebar.frame.minX) < 1 }
    XCTAssertEqual(sidebar.frame.width, 260, accuracy: 1)
    let editor = element(app, "editor-panel")
    XCTAssertGreaterThanOrEqual(editor.frame.width, 520)
    XCTAssertEqual(editor.frame.minX, 340, accuracy: 1)
    XCTAssertEqual(editor.frame.maxX, app.frame.width, accuracy: 1)
    XCTAssertTrue(app.buttons.matching(identifier: "sidebar-item-all-notes").firstMatch.isHittable)
  }

  private func element(_ app: XCUIApplication, _ identifier: String) -> XCUIElement {
    app.descendants(matching: .any).matching(identifier: identifier).firstMatch
  }

  private func waitUntil(_ predicate: @escaping () -> Bool) {
    expectation(for: NSPredicate { _, _ in predicate() }, evaluatedWith: nil)
    waitForExpectations(timeout: 10)
  }

  private func drag(_ element: XCUIElement, dx: Double) {
    let startX = dx < 0 ? 0.95 : 0.3
    let start = element.coordinate(withNormalizedOffset: CGVector(dx: startX, dy: 0.6))
    start.press(forDuration: 0.05, thenDragTo: start.withOffset(CGVector(dx: dx, dy: 0)), withVelocity: XCUIGestureVelocity(rawValue: 250), thenHoldForDuration: 0)
  }
}
