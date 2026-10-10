import { optionalNativeWorkspaceAccessModule } from './nativeWorkspaceAccess'

type EntryChange = { path: string; toPath?: string; directory: boolean }
type NativeEntryRecovery = {
  createWorkspaceOperationId?: () => string
  changeWorkspaceEntry?: (root: string, path: string, toPath: string | null, directory: boolean, identifier: string) => Promise<void>
}
const pendingOperations = new WeakMap<NativeEntryRecovery, Map<string, string>>()

export function changeNativeWorkspaceEntry(
  root: string, change: EntryChange,
  module: NativeEntryRecovery | null = optionalNativeWorkspaceAccessModule(),
): Promise<void> | null {
  if (!module) return null
  if (!module.changeWorkspaceEntry || !module.createWorkspaceOperationId) throw new Error('nativeEntryRecoveryUnavailable')
  const pending = pendingFor(module)
  const key = JSON.stringify([root, change.path, change.toPath ?? null, change.directory])
  const identifier = pending.get(key) ?? module.createWorkspaceOperationId()
  pending.set(key, identifier)
  return module.changeWorkspaceEntry(root, change.path, change.toPath ?? null, change.directory, identifier).then(() => {
    if (pending.get(key) === identifier) pending.delete(key)
  })
}

function pendingFor(module: NativeEntryRecovery) {
  let pending = pendingOperations.get(module)
  if (!pending) {
    pending = new Map<string, string>()
    pendingOperations.set(module, pending)
  }
  return pending
}
