import { ArrowClockwise, FolderOpen, GearSix, GitCommit, Tray } from 'phosphor-react-native'
import { StyleSheet, View } from 'react-native'
import { Text } from '../ui/text'
import { mobileText } from '../../i18n/mobileText'
import { MobileButton } from '../../ui/MobileButton'
import { desktopStatusBarParity } from '../../ui/desktopParity'
import { mobileColors } from '../../ui/tokens'
import type { MobileSyncStatus } from '../../workspace/mobileWorkspaceModel'
import { useVaultSyncPresentation } from '../vaults/useVaultSyncPresentation'
import { useMobileSettings } from '../../settings/useMobileSettings'
import { MobileIconButton } from '../../ui/MobileIconButton'

export function MobileSyncStatusBar({
  onOpenLocalVault,
  retryFailedEdit,
  sync,
}: {
  onOpenLocalVault?: () => void
  retryFailedEdit?: () => void
  sync: MobileSyncStatus
}) {
  const vault = useVaultSyncPresentation(sync)
  const preferences = useMobileSettings()
  const action = statusBarAction(onOpenLocalVault)
  const presentation = statusPresentation(sync, vault, Boolean(retryFailedEdit))

  return (
    <View style={styles.syncBar} testID="sync-status-bar">
      <MobileIconButton accessibilityLabel={mobileText('settings.title')} onPress={preferences.open} testID="open-mobile-settings"><GearSix size={18} color={mobileColors.textMuted} /></MobileIconButton>
      <View style={styles.syncStatusGroup}>
        <Tray color={presentation.color} size={desktopStatusBarParity.iconSize} />
        <Text numberOfLines={1} style={styles.syncStatusText} testID="sync-status-label">{presentation.label}</Text>
        {presentation.detail && <Text numberOfLines={1} style={styles.syncDetailText} testID="sync-status-detail">{presentation.detail}</Text>}
      </View>
      {retryFailedEdit && <MobileButton density="status" icon={<ArrowClockwise color={mobileColors.textMuted} size={desktopStatusBarParity.iconSize} />} label={mobileText('pulse.retry')} onPress={retryFailedEdit} testID="workspace-edit-retry" variant="ghost" />}
      <GitActions vault={vault} />
      <MobileButton
        density="status"
        icon={action.icon}
        label={vault ? mobileText('status.vault.manageWorkspaces') : action.label}
        onPress={vault ? () => { void vault.open() } : action.onPress}
        variant="ghost"
      />
    </View>
  )
}

function GitActions({ vault }: { vault: ReturnType<typeof useVaultSyncPresentation> }) {
  if (!vault?.sync) return null
  const sync = vault.sync
  return <>
    <MobileButton density="status" disabled={vault.busy} icon={<ArrowClockwise color={mobileColors.textMuted} size={desktopStatusBarParity.iconSize} />} label={mobileText(vault.retry ? 'pulse.retry' : 'status.sync.now')} onPress={() => { void sync() }} testID="vault-sync-retry" variant="ghost" />
    <MobileButton density="status" disabled={vault.busy} icon={<GitCommit color={mobileColors.textMuted} size={desktopStatusBarParity.iconSize} />} label={mobileText('status.commit.label')} onPress={() => { void vault.open() }} testID="vault-commit-open" variant="ghost" />
  </>
}

function statusPresentation(sync: MobileSyncStatus, vault: ReturnType<typeof useVaultSyncPresentation>, readFailed: boolean) {
  if (readFailed) return { color: mobileColors.danger, label: mobileText('mobile.editor.readFailed'), detail: null }
  if (vault) return { color: vault.color, label: vault.label, detail: null }
  return { color: syncStatusColor(sync), label: syncStatusLabel(sync), detail: syncStatusDetail(sync) }
}

function statusBarAction(onOpenLocalVault: (() => void) | undefined) {
  if (!onOpenLocalVault) {
    return {
      icon: <Tray color={mobileColors.textMuted} size={desktopStatusBarParity.iconSize} />,
      label: mobileText('status.sync.now'),
      onPress: undefined,
    }
  }

  return {
    icon: <FolderOpen color={mobileColors.textMuted} size={desktopStatusBarParity.iconSize} />,
    label: mobileText('status.vault.openLocal'),
    onPress: onOpenLocalVault,
  }
}

function syncStatusColor(sync: MobileSyncStatus) {
  return {
    noVault: mobileColors.textMuted, readOnly: mobileColors.textMuted,
    conflict: mobileColors.danger, writeFailed: mobileColors.danger,
    pullRequired: mobileColors.orange, synced: mobileColors.green,
  }[sync.kind]
}

function syncStatusDetail(sync: MobileSyncStatus) {
  const labels = {
    noVault: 'status.vault.openLocal', readOnly: 'status.sync.notSynced',
    conflict: 'status.sync.resolveConflicts', writeFailed: 'status.sync.failed',
    pullRequired: 'status.sync.pullAndPush', synced: null,
  } as const
  const label = labels[sync.kind]
  if (label) return mobileText(label)
  if (sync.minutesAgo) return mobileText('status.sync.minutesAgo').replace('{minutes}', `${sync.minutesAgo}`)

  return mobileText('status.sync.justNow')
}

function syncStatusLabel(sync: MobileSyncStatus) {
  const labels = {
    noVault: 'status.vault.default', readOnly: 'status.vault.default',
    conflict: 'status.sync.conflict', writeFailed: 'status.sync.notSynced',
    pullRequired: 'status.sync.pullRequired', synced: 'status.sync.synced',
  } as const
  return mobileText(labels[sync.kind])
}

const styles = StyleSheet.create({
  syncBar: {
    alignItems: 'center',
    backgroundColor: mobileColors.sidebar,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: mobileColors.border,
    flexDirection: 'row',
    gap: desktopStatusBarParity.primaryGap,
    height: desktopStatusBarParity.height,
    justifyContent: 'space-between',
    minHeight: desktopStatusBarParity.height,
    paddingHorizontal: desktopStatusBarParity.paddingHorizontal,
  },
  syncDetailText: {
    color: mobileColors.textMuted,
    fontSize: desktopStatusBarParity.fontSize,
  },
  syncStatusGroup: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    gap: desktopStatusBarParity.sectionGap,
    minWidth: 0,
  },
  syncStatusText: {
    color: mobileColors.textMuted,
    flexShrink: 1,
    fontSize: desktopStatusBarParity.fontSize,
    fontWeight: '500',
  },
})
