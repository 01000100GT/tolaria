import XCTest

final class PhoneSafeAreaTests: XCTestCase {
  func testCompactFooterAndPanelSafeArea() {
    continueAfterFailure = false
    XCUIDevice.shared.orientation = .portrait
    let app = XCUIApplication(bundleIdentifier: "com.tolaria.mobile.dev")
    app.launchArguments = ["--tolaria-mobile-search", "?source=fixture&qaRun=phone-safe-area"]
    app.launch()
    let row = element(app, "note-row-workflow-orchestration")
    XCTAssertTrue(row.waitForExistence(timeout: 30))
    let footer = element(app, "phone-footer")
    XCTAssertTrue(footer.exists)
    XCTAssertEqual(footer.frame.maxY, app.frame.maxY, accuracy: 1)
    XCTAssertLessThanOrEqual(footer.frame.height, 55)
    XCTAssertEqual(element(app, "sync-status-detail").label, "2m ago")
    XCTAssertTrue(app.buttons["Open local folder"].isHittable)
    verifyTop(app)
    row.tap()
    XCTAssertTrue(element(app, "editor-toolbar").waitForExistence(timeout: 5))
    verifyTop(app)
    element(app, "phone-properties-action").tap()
    XCTAssertTrue(element(app, "phone-properties-screen").waitForExistence(timeout: 5))
    verifyTop(app)
    element(app, "phone-back-action").tap()
    element(app, "phone-back-action").tap()
    element(app, "phone-sidebar-action").tap()
    XCTAssertTrue(element(app, "phone-sidebar-screen").waitForExistence(timeout: 5))
    verifyTop(app)
  }

  private func verifyTop(_ app: XCUIApplication) {
    let inset = element(app, "phone-top-inset")
    XCTAssertEqual(inset.frame.minY, app.frame.minY, accuracy: 1)
    XCTAssertGreaterThan(inset.frame.height, 40)
    let attachment = XCTAttachment(screenshot: app.screenshot())
    attachment.lifetime = .keepAlways
    add(attachment)
  }

  private func element(_ app: XCUIApplication, _ id: String) -> XCUIElement {
    app.descendants(matching: .any).matching(identifier: id).firstMatch
  }
}
