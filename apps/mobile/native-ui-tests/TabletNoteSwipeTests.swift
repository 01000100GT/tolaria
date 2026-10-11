import XCTest

final class TabletNoteSwipeTests: XCTestCase {
  override func setUp() {
    continueAfterFailure = false
    XCUIDevice.shared.orientation = .landscapeLeft
  }

  func testPartialSwipeRevealsActionsWithoutMovingPanels() {
    let app = launchFixture()
    let row = element(app, "note-row-workflow-orchestration")
    XCTAssertTrue(row.waitForExistence(timeout: 30))
    let before = row.frame
    drag(row, from: 0.75, to: 0.40)
    let archive = element(app, "note-swipe-archive-workflow-orchestration")
    XCTAssertTrue(archive.waitForExistence(timeout: 5))
    XCTAssertTrue(archive.isHittable)
    XCTAssertTrue(element(app, "note-swipe-delete-workflow-orchestration").isHittable)
    XCTAssertEqual(element(app, "note-list-panel").frame.minX, before.minX, accuracy: 1)
    XCTAssertTrue(element(app, "sidebar-item-all-notes").isHittable)
    archive.tap()
    waitUntil { !row.exists }
    element(app, "sidebar-item-archive").tap()
    XCTAssertTrue(row.waitForExistence(timeout: 5))
  }

  func testFullSwipeArchivesAndFavoriteTogglesWithoutDeleting() {
    let app = launchFixture()
    let row = element(app, "note-row-workflow-orchestration")
    XCTAssertTrue(row.waitForExistence(timeout: 30))
    let favorite = element(app, "editor-favorite-action")
    let initialLabel = favorite.label
    drag(row, from: 0.08, to: 0.92)
    waitUntil { favorite.label != initialLabel }
    drag(row, from: 0.92, to: 0.08)
    waitUntil { !row.exists }
    element(app, "sidebar-item-archive").tap()
    XCTAssertTrue(row.waitForExistence(timeout: 5))
    let image = XCTAttachment(screenshot: app.screenshot())
    image.lifetime = .keepAlways
    add(image)
  }

  private func launchFixture() -> XCUIApplication {
    let app = XCUIApplication(bundleIdentifier: "com.tolaria.mobile.dev")
    app.launchArguments = ["--tolaria-mobile-search", "?source=fixture&editorMode=wysiwyg&qaRun=row-swipe"]
    app.launch()
    return app
  }

  private func drag(_ row: XCUIElement, from: Double, to: Double) {
    row.coordinate(withNormalizedOffset: CGVector(dx: from, dy: 0.5))
      .press(forDuration: 0.05, thenDragTo: row.coordinate(withNormalizedOffset: CGVector(dx: to, dy: 0.5)))
  }

  private func element(_ app: XCUIApplication, _ identifier: String) -> XCUIElement {
    app.descendants(matching: .any).matching(identifier: identifier).firstMatch
  }

  private func waitUntil(_ predicate: @escaping () -> Bool) {
    expectation(for: NSPredicate { _, _ in predicate() }, evaluatedWith: nil)
    waitForExpectations(timeout: 8)
  }
}
