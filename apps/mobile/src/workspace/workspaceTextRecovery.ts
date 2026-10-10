import { optionalNativeWorkspaceAccessModule } from './nativeWorkspaceAccess'
import { runNativeWorkspaceMutation } from './nativeWorkspaceMutation'

type NativeTextRecovery = {
  createWorkspaceOperationId?: () => string
  saveWorkspaceText?: (root: string, path: string, content: string, identifier: string) => Promise<void>
  recoverWorkspaceText?: (root: string) => boolean
}

export function writeNativeWorkspaceText(
  root: string, path: string, content: string,
  module: NativeTextRecovery | null = optionalNativeWorkspaceAccessModule(),
): Promise<void> | null {
  if (!module) return null
  if (!module.saveWorkspaceText || !module.createWorkspaceOperationId) throw new Error('nativeTextRecoveryUnavailable')
  const key = JSON.stringify(['text', root, path, content])
  const perform = module.saveWorkspaceText
  return runNativeWorkspaceMutation(module, key, module.createWorkspaceOperationId,
    (identifier) => perform(root, path, content, identifier))
}

export function recoverNativeWorkspaceText(
  root: string,
  module: NativeTextRecovery | null = optionalNativeWorkspaceAccessModule(),
): boolean {
  if (!root.startsWith('file:')) return false
  if (!module) return false
  if (!module.recoverWorkspaceText) throw new Error('nativeTextRecoveryUnavailable')
  return module.recoverWorkspaceText(root)
}
