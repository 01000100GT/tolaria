import Foundation

private struct LinkedConflictJournal: Codable {
  let identifier: String
  let local: [String: String]
  let remote: [String: String]
  let merged: [String: String]
}

struct LinkedConflictPublication {
  let stateFile: URL
  private var journal: URL { stateFile.appendingPathExtension("resolution.json") }
  private var backups: URL { stateFile.deletingPathExtension().appendingPathExtension("resolutions") }
  var pending: Bool { FileManager.default.fileExists(atPath: journal.path) }

  func prepare(_ plan: LinkedConflictPlan, review: LinkedConflictReview, local: LinkedWorkspaceTree, remote: LinkedWorkspaceTree) throws {
    guard !pending else { throw LinkedWorkspaceError.invalidState }
    let identifier = UUID().uuidString
    let directory = backups.appendingPathComponent(identifier)
    let staged = LinkedWorkspaceTree(root: directory.appendingPathComponent("merged"))
    try FileManager.default.createDirectory(at: staged.root, withIntermediateDirectories: true)
    try backup(local, snapshot: review.local, to: directory.appendingPathComponent("local"))
    try backup(remote, snapshot: review.remote, to: directory.appendingPathComponent("remote"))
    for path in plan.merged.keys.sorted() {
      guard let origin = plan.origins[path] else { throw LinkedWorkspaceError.invalidState }
      let source = origin.remote ? remote : local
      let destination = try workspaceFileURL(root: staged.root, path: path)
      if plan.merged[path] == "directory" { try FileManager.default.createDirectory(at: destination, withIntermediateDirectories: false) }
      else { try FileManager.default.copyItem(at: workspaceFileURL(root: source.root, path: origin.path), to: destination) }
    }
    guard try staged.snapshot() == plan.merged else { throw LinkedWorkspaceError.conflict }
    let record = LinkedConflictJournal(identifier: identifier, local: review.local, remote: review.remote, merged: plan.merged)
    try JSONEncoder().encode(record).write(to: journal, options: .atomic)
  }

  func apply(local: LinkedWorkspaceTree, remote: LinkedWorkspaceTree) throws -> [String: String] {
    let record = try JSONDecoder().decode(LinkedConflictJournal.self, from: Data(contentsOf: journal))
    guard UUID(uuidString: record.identifier) != nil else { throw LinkedWorkspaceError.invalidState }
    let source = LinkedWorkspaceTree(root: backups.appendingPathComponent(record.identifier).appendingPathComponent("merged"))
    guard try source.snapshot() == record.merged else { throw LinkedWorkspaceError.invalidState }
    let currentLocal = try local.snapshot()
    let currentRemote = try remote.snapshot()
    try requireUnchanged(currentLocal, before: record.local, after: record.merged)
    try requireUnchanged(currentRemote, before: record.remote, after: record.merged)
    try remote.apply(record.merged, previous: currentRemote, source: source)
    try local.apply(record.merged, previous: currentLocal, source: source)
    return record.merged
  }

  func finish() throws { try FileManager.default.removeItem(at: journal) }

  func supersede() throws {
    guard pending else { return }
    let record = try JSONDecoder().decode(LinkedConflictJournal.self, from: Data(contentsOf: journal))
    guard UUID(uuidString: record.identifier) != nil else { throw LinkedWorkspaceError.invalidState }
    let archived = backups.appendingPathComponent(record.identifier).appendingPathComponent("superseded.json")
    try FileManager.default.moveItem(at: journal, to: archived)
  }

  private func backup(_ tree: LinkedWorkspaceTree, snapshot: [String: String], to: URL) throws {
    try FileManager.default.createDirectory(at: to, withIntermediateDirectories: true)
    try LinkedWorkspaceTree(root: to).apply(snapshot, previous: [:], source: tree)
  }

  private func requireUnchanged(_ current: [String: String], before: [String: String], after: [String: String]) throws {
    for path in Set(current.keys).union(before.keys).union(after.keys) {
      guard current[path] == before[path] || current[path] == after[path] else { throw LinkedWorkspaceError.conflict }
    }
  }
}
