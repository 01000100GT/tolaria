import XCTest

final class TabletDensityTests: XCTestCase {
  override func setUp() {
    continueAfterFailure = false
    XCUIDevice.shared.orientation = .landscapeLeft
  }

  func testDensityPreservesDocumentAndScalesNativeSidebarGeometry() {
    let app = XCUIApplication(bundleIdentifier: "com.tolaria.mobile.dev")
    app.launchArguments = ["--tolaria-mobile-search", "?source=fixture&editorMode=wysiwyg&layoutProbe=1&qaRun=density"]
    app.launch()
    let title = element(app, "editor-toolbar-title")
    XCTAssertTrue(title.waitForExistence(timeout: 30))
    let originalTitle = title.label
    selectScale(app, "1")
    assertSidebar(app, rowHeight: 32)
    assertMeasuredInsets(app, scale: 1)
    let standardWidth = element(app, "sidebar-item-inbox").frame.width
    selectScale(app, "1.1")
    assertSidebar(app, rowHeight: 35.2)
    assertMeasuredInsets(app, scale: 1.1)
    XCTAssertEqual(element(app, "sidebar-item-inbox").frame.width, standardWidth, accuracy: 2)
    XCTAssertEqual(title.label, originalTitle)
    record("tablet-larger-density")
    app.terminate()
    app.launch()
    XCTAssertTrue(title.waitForExistence(timeout: 30))
    assertSidebar(app, rowHeight: 35.2)
    XCUIDevice.shared.orientation = .portrait
    XCTAssertTrue(title.waitForExistence(timeout: 10))
    record("tablet-larger-density-portrait")
    XCUIDevice.shared.orientation = .landscapeLeft
  }

  private func selectScale(_ app: XCUIApplication, _ scale: String) {
    element(app, "open-mobile-settings").tap()
    let option = element(app, "settings-scale-\(scale)")
    XCTAssertTrue(option.waitForExistence(timeout: 5))
    XCTAssertGreaterThanOrEqual(option.frame.height, 44)
    option.tap()
    app.buttons["Close settings"].tap()
  }

  private func assertSidebar(_ app: XCUIApplication, rowHeight: CGFloat) {
    let row = element(app, "sidebar-item-inbox")
    XCTAssertTrue(row.waitForExistence(timeout: 5))
    let expectation = XCTNSPredicateExpectation(predicate: NSPredicate { _, _ in
      abs(row.frame.height - rowHeight) <= 1
    }, object: nil)
    XCTAssertEqual(XCTWaiter.wait(for: [expectation], timeout: 5), .completed)
  }

  private func record(_ name: String) {
    let attachment = XCTAttachment(screenshot: XCUIScreen.main.screenshot())
    attachment.name = name
    attachment.lifetime = .keepAlways
    add(attachment)
  }

  private func assertMeasuredInsets(_ app: XCUIApplication, scale: Double) {
    let sidebar = NativeDensityMetrics(readout: element(app, "sidebar-layout-metrics").label)
    print("DENSITY_NATIVE_METRICS scale=\(scale) \(sidebar.readout)")
    for item in ["inbox", "all-notes", "archive", "personal-journal", "essays"] {
      let prefix = "sidebar.item.\(item)"
      let content = sidebar.frame("\(prefix).content")
      XCTAssertEqual(content.minX, 12 * scale, accuracy: 0.6)
      XCTAssertEqual(content.minY, 6 * scale, accuracy: 0.6)
      // CoreText rounds ascent/descent independently; allow one point for the line box only.
      XCTAssertEqual(sidebar.frame("\(prefix).label").height, 18 * scale, accuracy: 1)
    }
    let pill = sidebar.frame("sidebar.item.inbox.count.container")
    let count = sidebar.frame("sidebar.item.inbox.count.text")
    XCTAssertEqual(pill.height, 20 * scale, accuracy: 0.6)
    XCTAssertEqual(count.midY, pill.height / 2, accuracy: 0.6)
    let folder = sidebar.frame("sidebar.folder.writing.row")
    let folderContent = sidebar.frame("sidebar.folder.writing.content")
    XCTAssertEqual(folder.height, 30 * scale, accuracy: 0.6)
    XCTAssertEqual(folderContent.minX, 12 * scale, accuracy: 0.6)
    XCTAssertEqual(folderContent.minY, 6 * scale, accuracy: 0.6)
  }

  private func element(_ app: XCUIApplication, _ identifier: String) -> XCUIElement {
    app.descendants(matching: .any).matching(identifier: identifier).firstMatch
  }
}

private struct NativeDensityMetrics {
  let readout: String

  func frame(_ identifier: String, file: StaticString = #filePath, line: UInt = #line) -> CGRect {
    let prefix = identifier + ":"
    guard let row = readout.split(separator: "|").first(where: { $0.hasPrefix(prefix) }) else {
      XCTFail("Missing native layout metric: \(identifier)", file: file, line: line)
      return .null
    }
    let values = row.dropFirst(prefix.count).split(separator: ",").compactMap { Double($0) }
    guard values.count == 4 else {
      XCTFail("Invalid native layout metric: \(identifier)", file: file, line: line)
      return .null
    }
    return CGRect(x: values[0], y: values[1], width: values[2], height: values[3])
  }
}
