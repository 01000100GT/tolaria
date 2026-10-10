import CryptoKit
import Foundation

enum WorkspaceTextWriteStage { case prepared, published, replaced }
enum WorkspaceTextRecoveryError: Error { case invalidRecord, checkoutPending, missingRoot }

private struct PendingWorkspaceText: Codable {
  let version: Int
  let path: String
  let before: String?
  let content: Data
  let identifier: String?
}

private struct CompletedWorkspaceText: Codable {
  let version: Int
  let identifier: String
  let path: String
  let digest: String
}

struct WorkspaceTextRecovery {
  let root: URL
  let journal: URL
  var afterStage: (WorkspaceTextWriteStage) throws -> Void = { _ in }
  var receipt: URL { journal.appendingPathExtension("completed") }

  func write(_ path: String, content: String, identifier: String = UUID().uuidString) throws {
    workspaceMutationLock.lock()
    defer { workspaceMutationLock.unlock() }
    _ = try recover()
    try requireWorkspaceMutationRoot(root)
    if try completed(path, content: content, identifier: identifier) { return }
    try withDestination(path) { destination in
      let pending = PendingWorkspaceText(
        version: 1, path: path, before: try existingDigest(destination), content: Data(content.utf8), identifier: identifier
      )
      try afterStage(.prepared)
      try FileManager.default.createDirectory(at: journal.deletingLastPathComponent(), withIntermediateDirectories: true)
      try JSONEncoder().encode(pending).write(to: journal, options: .atomic)
      try afterStage(.published)
      try replace(pending, destination: destination)
      try afterStage(.replaced)
      try recordCompletion(pending)
    }
  }

  @discardableResult
  func recover() throws -> Bool {
    workspaceMutationLock.lock()
    defer { workspaceMutationLock.unlock() }
    let recoveredEntry = try entryRecovery.recover()
    guard let data = try existingData(journal) else { return recoveredEntry }
    let pending = try JSONDecoder().decode(PendingWorkspaceText.self, from: data)
    guard pending.version == 1 else { throw WorkspaceTextRecoveryError.invalidRecord }
    try requireWorkspaceMutationRoot(root)
    try withDestination(pending.path) { destination in
      try replace(pending, destination: destination)
      try recordCompletion(pending)
    }
    return true
  }

  private func completed(_ path: String, content: String, identifier: String) throws -> Bool {
    guard let data = try existingData(receipt) else { return false }
    let completed = try JSONDecoder().decode(CompletedWorkspaceText.self, from: data)
    guard completed.version == 1 else { throw WorkspaceTextRecoveryError.invalidRecord }
    guard completed.identifier == identifier else { return false }
    guard completed.path == path, completed.digest == textRecoveryDigest(Data(content.utf8)) else {
      throw WorkspaceTextRecoveryError.invalidRecord
    }
    return true
  }

  private func recordCompletion(_ pending: PendingWorkspaceText) throws {
    if let identifier = pending.identifier {
      let completed = CompletedWorkspaceText(
        version: 1, identifier: identifier, path: pending.path, digest: textRecoveryDigest(pending.content)
      )
      try JSONEncoder().encode(completed).write(to: receipt, options: .atomic)
    }
    try FileManager.default.removeItem(at: journal)
  }

  private func replace(_ pending: PendingWorkspaceText, destination: URL) throws {
    let current = try existingDigest(destination)
    if current == textRecoveryDigest(pending.content) { return }
    guard current == pending.before else { throw WorkspaceFileError.externalChange }
    try FileManager.default.createDirectory(at: destination.deletingLastPathComponent(), withIntermediateDirectories: true)
    _ = try workspaceFileURL(root: root, path: pending.path)
    try pending.content.write(to: destination, options: .atomic)
  }

  var entryRecovery: WorkspaceEntryRecovery {
    WorkspaceEntryRecovery(root: root, journal: journal.appendingPathExtension("entry"))
  }

  func changeEntry(_ change: WorkspaceEntryChange) throws {
    workspaceMutationLock.lock()
    defer { workspaceMutationLock.unlock() }
    _ = try recover()
    try entryRecovery.perform(change)
  }

  private func withDestination(_ path: String, action: @escaping (URL) throws -> Void) throws {
    let destination = try workspaceFileURL(root: root, path: path)
    var coordinationError: NSError?
    var result: Result<Void, Error>?
    NSFileCoordinator().coordinate(writingItemAt: destination, options: .forReplacing, error: &coordinationError) { url in
      result = Result {
        _ = try workspaceFileURL(root: root, path: path)
        try action(url)
      }
    }
    if let coordinationError { throw coordinationError }
    guard let result else { throw WorkspaceFileError.coordinationFailed }
    try result.get()
  }
}

func textRecoveryDigest(_ data: Data) -> String {
  SHA256.hash(data: data).map { String(format: "%02x", $0) }.joined()
}

private func existingDigest(_ url: URL) throws -> String? {
  try existingData(url).map(textRecoveryDigest)
}

private func existingData(_ url: URL) throws -> Data? {
  do { return try Data(contentsOf: url) }
  catch let error as NSError where error.domain == NSCocoaErrorDomain && error.code == NSFileReadNoSuchFileError {
    return nil
  }
}
