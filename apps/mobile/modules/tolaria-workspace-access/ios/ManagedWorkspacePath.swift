import Foundation

func managedWorkspaceRelativePath(_ uri: String, home: URL) throws -> String {
  guard let url = URL(string: uri), url.isFileURL,
    url.host == nil || url.host == "" || url.host == "localhost",
    url.query == nil, url.fragment == nil else { throw WorkspaceFileError.invalidPath }
  let prefix = home.standardizedFileURL.path + "/"
  let path = url.standardizedFileURL.path
  guard path.hasPrefix(prefix), !path.contains("\0"), !path.contains("\\") else {
    throw WorkspaceFileError.invalidPath
  }
  let relative = String(path.dropFirst(prefix.count))
  guard relative.hasPrefix("Documents/") || relative.hasPrefix("Library/Caches/") || relative.hasPrefix("tmp/") else {
    throw WorkspaceFileError.invalidPath
  }
  return relative
}
