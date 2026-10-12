import XCTest

final class PhoneEditorHeaderTests: XCTestCase {
  func testEditorHasOneHeaderWithNavigationAndNoteActions() {
    continueAfterFailure = false
    XCUIDevice.shared.orientation = .portrait
    let app = XCUIApplication(bundleIdentifier: "com.tolaria.mobile.dev")
    app.launchArguments = ["--tolaria-mobile-search", "?source=fixture&editorMode=wysiwyg&qaRun=phone-header"]
    app.launch()
    let row = element(app, "note-row-workflow-orchestration")
    XCTAssertTrue(row.waitForExistence(timeout: 30))
    row.tap()
    let header = element(app, "editor-toolbar")
    XCTAssertTrue(header.waitForExistence(timeout: 10))
    XCTAssertFalse(element(app, "phone-top-bar").exists)
    XCTAssertEqual(app.descendants(matching: .any).matching(identifier: "editor-toolbar-title").count, 1)
    for id in ["phone-back-action", "phone-properties-action", "phone-command-palette-action",
               "editor-favorite-action", "editor-source-action", "editor-more-action"] {
      let button = element(app, id)
      XCTAssertTrue(button.isHittable, id)
      XCTAssertTrue(header.frame.contains(button.frame), id)
    }
    element(app, "editor-source-action").tap()
    XCTAssertTrue(element(app, "editor-markdown-input").waitForExistence(timeout: 5))
    element(app, "phone-properties-action").tap()
    XCTAssertTrue(element(app, "phone-properties-screen").waitForExistence(timeout: 5))
    element(app, "phone-back-action").tap()
    XCTAssertTrue(header.waitForExistence(timeout: 5))
    let attachment = XCTAttachment(screenshot: XCUIScreen.main.screenshot())
    attachment.lifetime = .keepAlways
    add(attachment)
    element(app, "phone-back-action").tap()
    XCTAssertTrue(row.waitForExistence(timeout: 5))
  }

  private func element(_ app: XCUIApplication, _ id: String) -> XCUIElement {
    app.descendants(matching: .any).matching(identifier: id).firstMatch
  }
}
