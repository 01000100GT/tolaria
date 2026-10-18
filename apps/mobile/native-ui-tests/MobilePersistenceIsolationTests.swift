import XCTest

final class MobilePersistenceIsolationTests: XCTestCase {
  func testDisposableWorkspacePersistence() {
    let app = launchProbe("phoneState=sidebar&workspacePersistenceProbe=1")
    let inbox = app.descendants(matching: .any).matching(identifier: "sidebar-item-inbox").firstMatch
    XCTAssertTrue(inbox.waitForExistence(timeout: 30))
    XCTAssertFalse(app.descendants(matching: .any).matching(identifier: "workspace-load-failure").firstMatch.exists)
    captureScreen()
  }

  func testRichEditorPersistence() {
    let app = launchProbe("phoneState=editor&editorMode=wysiwyg&wysiwygPersistenceProbe=1&wysiwygMutationProbe=1")
    let editor = app.webViews.textViews.firstMatch
    XCTAssertTrue(editor.waitForExistence(timeout: 30))
    editor.tap()
    XCTAssertTrue(app.keyboards.firstMatch.waitForExistence(timeout: 8))
    XCTAssertFalse(app.descendants(matching: .any).matching(identifier: "workspace-load-failure").firstMatch.exists)
    captureScreen()
  }

  private func launchProbe(_ parameters: String) -> XCUIApplication {
    continueAfterFailure = false
    XCUIDevice.shared.orientation = .portrait
    let app = XCUIApplication(bundleIdentifier: "com.tolaria.mobile.dev")
    let search = "?source=fixture&tabletPanels=all&\(parameters)&qaRun=native-persistence-isolation"
    app.launchArguments = ["--tolaria-mobile-search", search]
    app.launchEnvironment["TOLARIA_MOBILE_SEARCH"] = search
    app.launch()
    return app
  }

  private func captureScreen() {
    let screenshot = XCTAttachment(screenshot: XCUIScreen.main.screenshot())
    screenshot.lifetime = .keepAlways
    add(screenshot)
  }
}
