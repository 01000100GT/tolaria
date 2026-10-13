import { useCallback, useEffect, useRef, useState } from 'react'
import { pickNativeWorkspaceDirectory } from '../nativeWorkspacePicker'
import { createWorkspaceSyncEditors } from '../workspaceSyncEditors'
import { activateManagedGitVault, cloneManagedGitVault, forgetManagedVault, managedGitConnection, managedGitSelection } from './managedGitStorage'
import { activateManagedLocalVault, rememberLocalVault } from './managedLocalStorage'
import type { ManagedLocalVault } from './managedLocalVaults'
import type { ManagedGitVault } from './managedGitVaults'
import { nativeGitHttp } from './nativeGitHttp'
import { runSavedVaultOperation } from './savedVaultOperation'
import { useGitHubAccount } from './useGitHubAccount'
import { useManagedVaultCatalog, type ActiveVault } from './useManagedVaultCatalog'
import type { GitSyncPhase } from './gitRemote'
import { githubFailure } from './githubFailure'
import { createGitVault, type GitAuthor } from './gitVault'
import { withSavedWorkspace } from './workspaceWriteQueue'
import { useMobileSettings } from '../../settings/useMobileSettings'
import { useMobileAutoGit } from './useMobileAutoGit'
import { useMobileAnalytics } from '../../analytics/useMobileAnalytics'
import { isWorkspaceLinked, syncLinkedWorkspace } from '../linkedWorkspace'
import { useLinkedFolderSync } from '../useLinkedFolderSync'

export type VaultSyncState = 'local' | 'pending' | 'committed' | 'synced' | 'diverged' | 'failed' | 'saveFailed'
type VaultError = ReturnType<typeof githubFailure> | 'mobile.vaults.saveFailed' | 'mobile.vaults.folderUnavailable' | 'mobile.vaults.folderConflict' | null
type VaultTask = () => Promise<ActiveVault | null | 'cancelled' | 'unchanged'>

export function useMobileVaults() {
  const catalog = useManagedVaultCatalog()
  const account = useGitHubAccount()
  const preferences = useMobileSettings()
  const analytics = useMobileAnalytics()
  const [editors] = useState(createWorkspaceSyncEditors)
  const [override, setOverride] = useState<ActiveVault | null>(null)
  const active = override ?? catalog.restored ?? { selection: null, git: null }
  const [revision, setRevision] = useState(0)
  const [opened, setOpened] = useState(false)
  const [busy, setBusy] = useState(false)
  const [phase, setPhase] = useState<GitSyncPhase | 'clone' | null>(null)
  const [status, setStatus] = useState<VaultSyncState>('pending')
  const [error, setError] = useState<VaultError>(null)
  const [lastCommitId, setLastCommitId] = useState<string | null>(null)
  const running = useRef(false)
  const restorePending = catalog.pending
  const linked = !active.git && isWorkspaceLinked(active.selection?.vaultRootUri)
  useEffect(() => editors.subscribeDirty(() => setStatus('pending')), [editors])
  useEffect(() => {
    if (!catalog.error) return
    if (catalog.pending || catalog.restored) return
    setError('mobile.vaults.requestFailed')
    setOpened(true)
  }, [catalog.error, catalog.pending, catalog.restored])

  const open = useCallback(async () => { editors.setBlocked(true); setOpened(true) }, [editors])
  const close = () => {
    if (running.current) return
    account.cancelSignIn()
    editors.setBlocked(false)
    setOpened(false)
  }

  const perform = async (task: VaultTask, present = true, operation?: 'commit' | 'sync' | 'autoSync') => {
    if (running.current || restorePending) return
    running.current = true
    if (operation && active.git) analytics.capture({ name: 'mobile_git_operation_requested', operation })
    if (operation === 'sync' && linked) analytics.capture({ name: 'mobile_folder_sync_requested', operation })
    editors.setBlocked(true)
    setBusy(true)
    if (present) setOpened(true)
    setError(null)
    let next = active
    let saved = false
    let failed = false
    try {
      await runSavedVaultOperation({
        editors, rootUri: active.selection?.vaultRootUri,
        run: async () => {
          saved = true
          return resolveVaultTask(task, active, (result) => { next = result })
        },
        refresh: (selectedNoteId) => {
          setOverride(refreshedVault(next, active, selectedNoteId))
          setRevision((value) => value + 1)
        },
      })
    } catch (failure) {
      failed = true
      const result = vaultFailure(saved, failure)
      setError(result.error)
      setStatus(result.status)
      setOpened(true)
    } finally {
      running.current = false
      setBusy(false)
      setPhase(null)
      if (!present && !failed) editors.setBlocked(false)
    }
  }

  const select = async (vault: ManagedGitVault) => {
    const selection = await managedGitSelection(vault)
    await activateManagedGitVault(vault.id)
    setStatus('pending')
    setLastCommitId(null)
    return { git: vault, selection }
  }
  const openFolder = () => perform(async () => {
    const selection = await pickNativeWorkspaceDirectory(active.selection?.vaultRootUri)
    if (!selection) return 'cancelled'
    const vault = await rememberLocalVault(selection)
    await catalog.reload()
    setStatus(isWorkspaceLinked(selection.vaultRootUri) ? 'synced' : 'local')
    analytics.capture({ name: 'mobile_vault_catalog_used', action: 'add', kind: 'local' })
    return { selection: await activateManagedLocalVault(vault), git: null }
  })
  const clone = (url: string) => perform(async () => {
    setPhase('clone')
    const session = await account.currentSession()
    const vault = await cloneManagedGitVault(url, nativeGitHttp, session?.accessToken)
    await catalog.reload()
    analytics.capture({ name: 'mobile_vault_catalog_used', action: 'add', kind: 'git' })
    return select(vault)
  })
  const selectLocal = (vault: ManagedLocalVault) => perform(async () => {
    const selection = await activateManagedLocalVault(vault)
    setStatus(isWorkspaceLinked(selection.vaultRootUri) ? 'pending' : 'local')
    setLastCommitId(null)
    analytics.capture({ name: 'mobile_vault_catalog_used', action: 'switch', kind: 'local' })
    return { selection, git: null }
  })
  const forget = (id: string) => perform(async () => {
    const kind = catalog.vaults.some(vault => vault.id === id) ? 'git' : 'local'
    const isActive = active.git?.id === id || active.selection?.vaultAlias === id
    await forgetManagedVault(id)
    await catalog.reload()
    analytics.capture({ name: 'mobile_vault_catalog_used', action: 'forget', kind })
    return isActive ? { selection: null, git: null } : 'unchanged'
  })
  const syncFolder = async (root: string) => {
    const result = await syncLinkedWorkspace(root)
    setStatus(result.conflict ? 'diverged' : 'synced')
    setError(result.conflict ? 'mobile.vaults.folderConflict' : null)
    if (result.conflict) setOpened(true)
    return result.changed ? null : 'unchanged' as const
  }
  const syncTask = async (checkpoint: boolean) => {
    if (linked && active.selection) return syncFolder(active.selection.vaultRootUri)
    if (!active.git) { setStatus('local'); return null }
    const session = await account.currentSession()
    const { syncGitVault } = await import('./gitRemote')
    const result = await syncGitVault({
      ...managedGitConnection(active.git), http: nativeGitHttp,
      checkpoint,
      token: session?.accessToken, onPhase: setPhase,
    }, mobileGitAuthor(session))
    setStatus(result.kind)
    return result.workspaceChanged ? null : 'unchanged' as const
  }
  const sync = () => perform(() => syncTask(preferences.settings.autoGit), true, 'sync')
  const commit = (message: string, push = false) => perform(async () => {
    if (!active.git) return 'cancelled'
    setPhase('checkpoint')
    const connection = managedGitConnection(active.git)
    const result = await withSavedWorkspace(connection.operationKey ?? connection.dir, () => createGitVault(connection).checkpoint(mobileGitAuthor(account.session), message))
    setLastCommitId(result.oid.slice(0, 8))
    setStatus('committed')
    return push ? syncTask(false) : 'unchanged'
  }, true, 'commit')

  useMobileAutoGit({
    blocked: busy || opened || preferences.opened || restorePending || status === 'diverged', editors,
    enabled: preferences.ready && preferences.settings.autoGit && Boolean(active.git),
    rootUri: active.selection?.vaultRootUri,
    sync: () => perform(() => syncTask(true), false, 'autoSync'),
  })

  useLinkedFolderSync({
    root: linked ? active.selection?.vaultRootUri : undefined,
    blocked: busy || opened || preferences.opened || restorePending || status === 'diverged' || status === 'failed',
    editors,
    sync: () => perform(() => syncTask(false), false),
  })

  return {
    account, active, busy, catalog, close, clone, editors, error, open, opened, linked,
    openFolder, phase, restorePending, revision, status, sync, commit, lastCommitId, selectLocal, forget,
    select: (vault: ManagedGitVault) => perform(async () => {
      const next = await select(vault)
      analytics.capture({ name: 'mobile_vault_catalog_used', action: 'switch', kind: 'git' })
      return next
    }),
  }
}

async function resolveVaultTask(task: VaultTask, active: ActiveVault, select: (next: ActiveVault) => void) {
  const result = await task()
  if (result === 'cancelled' || result === 'unchanged') return result
  select(result ?? active)
}

function vaultFailure(saved: boolean, failure: unknown): { error: VaultError; status: VaultSyncState } {
  if (!saved) return { error: 'mobile.vaults.saveFailed', status: 'saveFailed' }
  if (failure instanceof Error && failure.message === 'linkedFolderUnavailable') return { error: 'mobile.vaults.folderUnavailable', status: 'failed' }
  return { error: githubFailure(failure), status: 'failed' }
}

function mobileGitAuthor(session: { login: string; userId: number } | null): GitAuthor {
  return session
    ? { name: session.login, email: `${session.userId}+${session.login}@users.noreply.github.com` }
    : { name: 'Tolaria mobile', email: 'mobile@tolaria.app' }
}

function refreshedVault(next: ActiveVault, previous: ActiveVault, selectedNoteId?: string): ActiveVault {
  if (!next.selection) return next
  const selection = { ...next.selection, index: undefined }
  if (selection.vaultRootUri === previous.selection?.vaultRootUri) selection.selectedNoteId = selectedNoteId
  return { ...next, selection }
}
