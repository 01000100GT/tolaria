import XCTest

final class PhoneReadinessTests: XCTestCase {
  func testPropertiesReturnsToTheSameSourceEditor() {
    let app = launch("wysiwyg")
    element(app, "editor-source-action").tap()
    let input = element(app, "editor-markdown-input")
    XCTAssertTrue(input.waitForExistence(timeout: 15))
    element(app, "phone-properties-action").tap()
    XCTAssertTrue(element(app, "phone-properties-screen").waitForExistence(timeout: 5))
    element(app, "phone-back-action").tap()
    XCTAssertTrue(input.waitForExistence(timeout: 5), "Returning from Properties must retain the editor mode")
  }

  func testPropertySaveRemainsAboveTheSoftwareKeyboard() {
    let app = launch("wysiwyg")
    element(app, "phone-properties-action").tap()
    let tags = element(app, "property-tags-edit")
    XCTAssertTrue(tags.waitForExistence(timeout: 5))
    tags.tap()
    let value = element(app, "workspace-property-value-input")
    XCTAssertTrue(value.waitForExistence(timeout: 5))
    value.tap()
    XCTAssertTrue(app.keyboards.firstMatch.waitForExistence(timeout: 5))
    let save = element(app, "workspace-property-save-action")
    XCTAssertTrue(save.isHittable)
    XCTAssertLessThanOrEqual(save.frame.maxY, app.keyboards.firstMatch.frame.minY)
    element(app, "workspace-property-cancel-action").tap()
  }

  func testLandscapeKeepsCompactFormattingAndOnePropertiesHeader() {
    let app = launch("wysiwyg")
    XCUIDevice.shared.orientation = .landscapeLeft
    XCTAssertTrue(element(app, "editor-format-menu-headings").waitForExistence(timeout: 5))
    XCTAssertFalse(element(app, "editor-format-heading-6").exists)
    element(app, "phone-properties-action").tap()
    XCTAssertTrue(element(app, "phone-properties-screen").waitForExistence(timeout: 5))
    XCTAssertFalse(element(app, "properties-toolbar").exists)
    XCUIDevice.shared.orientation = .portrait
  }

  private func launch(_ mode: String) -> XCUIApplication {
    continueAfterFailure = false
    XCUIDevice.shared.orientation = .portrait
    let app = XCUIApplication(bundleIdentifier: "com.tolaria.mobile.dev")
    app.launchArguments = ["--tolaria-mobile-search",
      "?source=fixture&phoneState=editor&editorMode=\(mode)&qaRun=phone-readiness"]
    app.launch()
    XCTAssertTrue(element(app, "phone-properties-action").waitForExistence(timeout: 30))
    return app
  }

  private func element(_ app: XCUIApplication, _ id: String) -> XCUIElement {
    app.descendants(matching: .any).matching(identifier: id).firstMatch
  }
}
