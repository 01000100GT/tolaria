import XCTest

final class TabletFooterLayoutTests: XCTestCase {
  func testFooterSharesBottomInsetWithoutCoveringControls() {
    continueAfterFailure = false
    let app = XCUIApplication(bundleIdentifier: "com.tolaria.mobile.dev")
    app.launchArguments = ["--tolaria-mobile-search", "?source=fixture&qaRun=compact-footer"]
    XCUIDevice.shared.orientation = .landscapeLeft
    app.launch()
    let footer = element(app, "sync-status-bar")
    XCTAssertTrue(footer.waitForExistence(timeout: 30))
    verifyFooter(app, footer)
    XCUIDevice.shared.orientation = .portrait
    verifyFooter(app, footer)
    element(app, "open-mobile-settings").tap()
    XCTAssertTrue(element(app, "mobile-settings").waitForExistence(timeout: 5))
  }

  private func verifyFooter(_ app: XCUIApplication, _ footer: XCUIElement) {
    expectation(for: NSPredicate { _, _ in
      abs(footer.frame.maxY - app.frame.maxY) < 1 && abs(footer.frame.width - app.frame.width) < 1
    }, evaluatedWith: nil)
    waitForExpectations(timeout: 5)
    XCTAssertEqual(footer.frame.maxY, app.frame.maxY, accuracy: 1)
    XCTAssertLessThanOrEqual(footer.frame.height, 34)
    let center = CGRect(x: app.frame.width * 0.32, y: footer.frame.minY,
                        width: app.frame.width * 0.36, height: footer.frame.height)
    for control in footer.buttons.allElementsBoundByIndex {
      XCTAssertTrue(control.isHittable)
      XCTAssertFalse(center.intersects(control.frame), control.label)
    }
    let attachment = XCTAttachment(screenshot: XCUIScreen.main.screenshot())
    attachment.lifetime = .keepAlways
    add(attachment)
  }

  private func element(_ app: XCUIApplication, _ id: String) -> XCUIElement {
    app.descendants(matching: .any).matching(identifier: id).firstMatch
  }
}
