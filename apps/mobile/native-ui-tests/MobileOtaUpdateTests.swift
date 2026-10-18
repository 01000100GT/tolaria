import XCTest

final class MobileOtaUpdateTests: XCTestCase {
  func testOwnedVaultSourceSurvivesNativeUpdateLaunch() {
    let app = openOwnedNote(mode: "source")
    let source = element(app, "editor-markdown-input")
    XCTAssertTrue(source.waitForExistence(timeout: 15))
    XCTAssertTrue((source.value as? String ?? "").contains("Additive owned OTA fixture."))
    XCTAssertTrue((source.value as? String ?? "").contains("type: Note"))
    capture()
  }

  func testSourceBackedRichEditorHydratesOwnedVaultContent() {
    let app = openOwnedNote(mode: "wysiwyg")
    let editor = app.webViews.textViews.firstMatch
    XCTAssertTrue(editor.waitForExistence(timeout: 15))
    XCTAssertTrue((editor.value as? String ?? "").contains("Additive owned OTA fixture."))
    element(app, "editor-source-action").tap()
    let source = element(app, "editor-markdown-input")
    XCTAssertTrue(source.waitForExistence(timeout: 10))
    XCTAssertTrue((source.value as? String ?? "").contains("Additive owned OTA fixture."))
    capture()
  }

  private func openOwnedNote(mode: String) -> XCUIApplication {
    continueAfterFailure = false
    let tablet = ProcessInfo.processInfo.environment["TOLARIA_OTA_TABLET"] == "1"
    XCUIDevice.shared.orientation = tablet ? .landscapeLeft : .portrait
    let app = XCUIApplication(bundleIdentifier: "md.tolaria.mobile.ota-validation")
    let search = "?source=native-vault&phoneState=list&editorMode=\(mode)&qaRun=owned-ota"
    app.launchArguments = ["--tolaria-mobile-search", search]
    app.launchEnvironment["TOLARIA_MOBILE_SEARCH"] = search
    app.launch()
    let note = app.buttons.matching(NSPredicate(format: "label BEGINSWITH %@", "OTA retained content")).firstMatch
    XCTAssertTrue(note.waitForExistence(timeout: 30))
    note.tap()
    addTeardownBlock { app.terminate() }
    return app
  }

  private func capture() {
    let image = XCTAttachment(screenshot: XCUIScreen.main.screenshot())
    image.lifetime = .keepAlways
    add(image)
  }

  private func element(_ app: XCUIApplication, _ identifier: String) -> XCUIElement {
    app.descendants(matching: .any).matching(identifier: identifier).firstMatch
  }
}
