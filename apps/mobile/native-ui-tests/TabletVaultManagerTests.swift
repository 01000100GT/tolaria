import XCTest

final class TabletVaultManagerTests: XCTestCase {
  func testCancellingFolderPickerReturnsToManager() {
    continueAfterFailure = false
    XCUIDevice.shared.orientation = .landscapeLeft
    let app = XCUIApplication(bundleIdentifier: "com.tolaria.mobile.dev")
    app.launchArguments = ["--tolaria-mobile-search", "?source=native-vault&editorMode=wysiwyg"]
    app.launch()
    let manage = app.buttons["Manage vaults"].firstMatch
    XCTAssertTrue(manage.waitForExistence(timeout: 60))
    manage.tap()
    cancelFolderSelection(app)
    cancelFolderSelection(app)
    app.buttons["Close"].firstMatch.tap()
    XCTAssertTrue(manage.waitForExistence(timeout: 5))
  }

  func testVaultManagerRestoresCredentialAccessAndRejectsInvalidRepository() {
    continueAfterFailure = false
    XCUIDevice.shared.orientation = .landscapeLeft
    let app = XCUIApplication(bundleIdentifier: "com.tolaria.mobile.dev")
    app.launchArguments = ["--tolaria-mobile-search", "?source=native-vault&editorMode=wysiwyg"]
    app.launch()
    let manage = app.buttons["Manage vaults"].firstMatch
    XCTAssertTrue(manage.waitForExistence(timeout: 60))
    manage.tap()
    let manager = element(app, "vault-manager")
    XCTAssertTrue(manager.waitForExistence(timeout: 10))
    XCTAssertFalse(app.staticTexts["Could not read or update your saved GitHub sign-in. Please retry."].exists)
    let input = app.textFields.matching(identifier: "git-repository-url").firstMatch
    XCTAssertTrue(input.waitForExistence(timeout: 5))
    input.tap()
    input.typeText("not a repository")
    XCTAssertFalse(app.buttons.matching(identifier: "clone-git-vault").firstMatch.isEnabled)
    let screenshot = XCTAttachment(screenshot: app.screenshot())
    screenshot.lifetime = .keepAlways
    add(screenshot)
    app.buttons["Close"].firstMatch.tap()
    expectation(for: NSPredicate { _, _ in !manager.exists }, evaluatedWith: nil)
    waitForExpectations(timeout: 5)
    XCTAssertTrue(manage.exists)
  }

  private func element(_ app: XCUIApplication, _ identifier: String) -> XCUIElement {
    app.descendants(matching: .any).matching(identifier: identifier).firstMatch
  }

  private func cancelFolderSelection(_ app: XCUIApplication) {
    let open = app.buttons["Open local folder"].firstMatch
    XCTAssertTrue(open.waitForExistence(timeout: 10))
    open.tap()
    let cancel = app.buttons["Cancel"].firstMatch
    XCTAssertTrue(cancel.waitForExistence(timeout: 10))
    cancel.tap()
    expectation(for: NSPredicate { _, _ in open.exists && open.isEnabled }, evaluatedWith: nil)
    waitForExpectations(timeout: 10)
    XCTAssertTrue(app.buttons["Close"].firstMatch.exists)
  }
}
