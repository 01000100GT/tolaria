import { useContext } from 'react'
import { mobileText } from '../../i18n/mobileText'
import { mobileColors } from '../../ui/tokens'
import { MobileVaultControlsContext, MobileVaultDisplayContext } from '../../workspace/MobileVaultContext'
import type { MobileSyncStatus } from '../../workspace/mobileWorkspaceModel'
import type { VaultSyncState } from '../../workspace/git/useMobileVaults'

export function useVaultSyncPresentation(sync: MobileSyncStatus) {
  const controls = useContext(MobileVaultControlsContext)
  const display = useContext(MobileVaultDisplayContext)
  if (!controls || display?.source !== 'native') return null
  const git = controls.git && display.rootUri === controls.rootUri
  const state = vaultSyncStatus(git, controls.status, sync)
  const label = controls.busy ? mobileText('status.sync.syncing') : state.label
  const color = statusColor(state.status)
  return { label, color, retry: state.retry, open: controls.open, sync: git || state.retry ? controls.sync : undefined, busy: controls.busy }
}

export function vaultSyncStatus(git: boolean, current: VaultSyncState, sync: MobileSyncStatus) {
  const status = sync.kind === 'writeFailed' ? 'saveFailed' : current
  return { status, label: statusLabel(git, status), retry: status === 'saveFailed' }
}

function statusColor(status: VaultSyncState) {
  return ['failed', 'saveFailed', 'diverged'].includes(status) ? mobileColors.danger : mobileColors.textMuted
}

function statusLabel(git: boolean, status: VaultSyncState) {
  if (status === 'saveFailed') return mobileText('mobile.vaults.saveFailed')
  if (status === 'failed') return mobileText('status.sync.failed')
  if (!git) return mobileText('mobile.vaults.localOnly')
  const labels = {
    committed: 'mobile.git.localCommit',
    local: 'mobile.vaults.localOnly', pending: 'status.sync.notSynced', synced: 'status.sync.synced',
    diverged: 'status.sync.conflict',
  } as const
  return mobileText(labels[status])
}
