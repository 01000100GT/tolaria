import XCTest

final class TabletVaultManagerTests: XCTestCase {
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
}
