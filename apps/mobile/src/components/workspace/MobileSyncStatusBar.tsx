import type { MobileMetrics } from '../../ui/mobileMetrics'
import { useMobileStyles } from '../../ui/theme/useMobileTheme'
import type { MobileColors } from '../../ui/theme/mobilePalette'
import { ArrowClockwise, FolderOpen, GearSix, GitCommit, Tray } from 'phosphor-react-native'
import { StyleSheet, View } from 'react-native'
import { Text } from '../ui/text'
import { mobileText } from '../../i18n/mobileText'
import { MobileButton } from '../../ui/MobileButton'
import { desktopStatusBarParity } from '../../ui/desktopParity'

import type { MobileSyncStatus } from '../../workspace/mobileWorkspaceModel'
import { useVaultSyncPresentation } from '../vaults/useVaultSyncPresentation'
import { useMobileSettings } from '../../settings/useMobileSettings'
import { MobileIconButton } from '../../ui/MobileIconButton'

export function MobileSyncStatusBar({
  compact = false,
  onOpenLocalVault,
  retryFailedEdit,
  sync,
}: {
  compact?: boolean
  onOpenLocalVault?: () => void
  retryFailedEdit?: () => void
  sync: MobileSyncStatus
}) {
  const themeStyles = useMobileStyles(createThemeStyles)
  const { styles, mobileColors } = themeStyles
  const vault = useVaultSyncPresentation(sync)
  const preferences = useMobileSettings()
  const action = statusBarAction(themeStyles, onOpenLocalVault)
  const presentation = statusPresentation(themeStyles, sync, vault, { readFailed: Boolean(retryFailedEdit), compact })

  return (
    <View style={styles.syncBar} testID="sync-status-bar">
      <MobileIconButton accessibilityLabel={mobileText('settings.title')} onPress={preferences.open} testID="open-mobile-settings"><GearSix size={18} color={mobileColors.textMuted} /></MobileIconButton>
      <View style={styles.syncStatusGroup}>
        <Tray color={presentation.color} size={desktopStatusBarParity.iconSize} />
        <Text numberOfLines={1} style={styles.syncStatusText} testID="sync-status-label">{presentation.label}</Text>
        {presentation.detail && <Text numberOfLines={1} style={styles.syncDetailText} testID="sync-status-detail">{presentation.detail}</Text>}
      </View>
      {retryFailedEdit && <MobileButton density="status" icon={<ArrowClockwise color={mobileColors.textMuted} size={desktopStatusBarParity.iconSize} />} label={mobileText('pulse.retry')} onPress={retryFailedEdit} testID="workspace-edit-retry" variant="ghost" />}
      <GitActions vault={vault} compact={compact} />
      <MobileButton
        testID="status-open-vaults"
        density="status"
        icon={action.icon}
        accessibilityLabel={vault ? mobileText('status.vault.manageWorkspaces') : action.label}
        label={compact && (vault || onOpenLocalVault) ? mobileText('mobile.status.open') : vault ? mobileText('status.vault.manageWorkspaces') : action.label}
        onPress={vault ? () => { void vault.open() } : action.onPress}
        variant="ghost"
      />
    </View>
  )
}

function GitActions({ vault, compact }: { vault: ReturnType<typeof useVaultSyncPresentation>; compact: boolean }) {
  const themeStyles = useMobileStyles(createThemeStyles)
  const { mobileColors } = themeStyles
  if (!vault?.sync) return null
  const sync = vault.sync
  if (compact) return <MobileButton label="" density="status" variant="ghost" accessibilityLabel={mobileText(vault.retry ? 'pulse.retry' : 'status.sync.now')} disabled={vault.busy} onPress={() => { void sync() }} testID="vault-sync-retry" icon={<ArrowClockwise color={mobileColors.textMuted} size={desktopStatusBarParity.iconSize} />} />
  return <>
    <MobileButton density="status" disabled={vault.busy} icon={<ArrowClockwise color={mobileColors.textMuted} size={desktopStatusBarParity.iconSize} />} label={mobileText(vault.retry ? 'pulse.retry' : 'status.sync.now')} onPress={() => { void sync() }} testID="vault-sync-retry" variant="ghost" />
    <MobileButton density="status" disabled={vault.busy} icon={<GitCommit color={mobileColors.textMuted} size={desktopStatusBarParity.iconSize} />} label={mobileText('status.commit.label')} onPress={() => { void vault.open() }} testID="vault-commit-open" variant="ghost" />
  </>
}

function statusPresentation(themeStyles: ReturnType<typeof createThemeStyles>, sync: MobileSyncStatus, vault: ReturnType<typeof useVaultSyncPresentation>, { readFailed, compact }: { readFailed: boolean; compact: boolean }) {
  const { mobileColors } = themeStyles
  if (readFailed) return { color: mobileColors.danger, label: mobileText('mobile.editor.readFailed'), detail: null }
  if (vault) return { color: vault.color, label: vault.label, detail: null }
  return { color: syncStatusColor(themeStyles, sync), label: syncStatusLabel(sync), detail: syncStatusDetail(sync, compact) }
}

function statusBarAction(themeStyles: ReturnType<typeof createThemeStyles>, onOpenLocalVault: (() => void) | undefined) {
  const { mobileColors } = themeStyles
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

function syncStatusColor(themeStyles: ReturnType<typeof createThemeStyles>, sync: MobileSyncStatus) {
  const { mobileColors } = themeStyles
  return {
    noVault: mobileColors.textMuted, readOnly: mobileColors.textMuted,
    conflict: mobileColors.danger, writeFailed: mobileColors.danger,
    pullRequired: mobileColors.orange, synced: mobileColors.green,
  }[sync.kind]
}

function syncStatusDetail(sync: MobileSyncStatus, compact: boolean) {
  const labels = {
    noVault: 'status.vault.openLocal', readOnly: 'status.sync.notSynced',
    conflict: 'status.sync.resolveConflicts', writeFailed: 'status.sync.failed',
    pullRequired: 'status.sync.pullAndPush', synced: null,
  } as const
  const label = labels[sync.kind]
  if (label) return mobileText(label)
  if (sync.minutesAgo) return mobileText(compact ? 'mobile.status.minutesAgo' : 'status.sync.minutesAgo').replace('{minutes}', `${sync.minutesAgo}`)

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

function createThemeStyles(mobileColors: MobileColors, metrics: MobileMetrics) {
  const { statusBar: desktopStatusBarParity } = metrics
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
  return { mobileColors, styles }
}
