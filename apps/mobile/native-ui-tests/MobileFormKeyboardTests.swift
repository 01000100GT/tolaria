import XCTest

final class MobileFormKeyboardTests: XCTestCase {
  override func tearDown() {
    XCUIApplication(bundleIdentifier: "com.tolaria.mobile.dev").terminate()
    XCUIDevice.shared.orientation = .portrait
    super.tearDown()
  }

  func testViewFormFooterStaysReachableFromPortrait() {
    verifyForm(.portrait, rotatingTo: .landscapeLeft)
  }

  func testViewFormFooterStaysReachableFromLandscape() {
    verifyForm(.landscapeLeft, rotatingTo: .portrait)
  }

  private func verifyForm(_ orientation: UIDeviceOrientation, rotatingTo other: UIDeviceOrientation) {
    continueAfterFailure = false
    XCUIDevice.shared.orientation = orientation
    let app = XCUIApplication(bundleIdentifier: "com.tolaria.mobile.dev")
    app.launchArguments = ["--tolaria-mobile-search",
      "?source=fixture&phoneState=list&actionSheet=createView&qaRun=modal-keyboard"]
    app.launch()
    XCUIDevice.shared.orientation = orientation
    let field = element(app, "workspace-create-view-name-input")
    XCTAssertTrue(field.waitForExistence(timeout: 30))
    field.tap()
    field.typeText("Keyboard proof")
    assertFooter(app)
    XCUIDevice.shared.orientation = other
    let rotated = XCTNSPredicateExpectation(predicate: NSPredicate { _, _ in
      (app.frame.width < app.frame.height) == (other == .portrait)
    }, object: nil)
    wait(for: [rotated], timeout: 10)
    assertFooter(app)
    app.buttons["Cancel"].firstMatch.tap()
    XCTAssertTrue(element(app, "workspace-action-sheet-createView").waitForNonExistence(timeout: 5))
    XCTAssertTrue(app.keyboards.firstMatch.waitForNonExistence(timeout: 5))
  }

  private func assertFooter(_ app: XCUIApplication) {
    let keyboard = app.keyboards.firstMatch
    XCTAssertTrue(keyboard.waitForExistence(timeout: 5))
    XCTAssertGreaterThan(keyboard.frame.height, 150)
    let create = app.buttons["Create"].firstMatch
    let aboveKeyboard = XCTNSPredicateExpectation(predicate: NSPredicate { _, _ in
      create.frame.maxY <= keyboard.frame.minY + 1
    }, object: nil)
    wait(for: [aboveKeyboard], timeout: 10)
    XCTAssertTrue(create.isEnabled)
    XCTAssertTrue(create.isHittable)
    let toolbar = element(app, "workspace-action-sheet-toolbar")
    let statusBar = app.statusBars.firstMatch
    if statusBar.exists {
      XCTAssertGreaterThanOrEqual(toolbar.frame.minY, statusBar.frame.maxY - 1)
    }
    // Rotated UIKit frames can differ by a few millionths of a point.
    XCTAssertGreaterThanOrEqual(create.frame.height, 43.99)
    XCTAssertGreaterThanOrEqual(create.frame.width, 43.99)
    let screenshot = XCTAttachment(screenshot: XCUIScreen.main.screenshot())
    screenshot.lifetime = .keepAlways
    add(screenshot)
  }

  private func element(_ app: XCUIApplication, _ id: String) -> XCUIElement {
    app.descendants(matching: .any).matching(identifier: id).firstMatch
  }
}
