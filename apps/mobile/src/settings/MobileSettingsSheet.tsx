import type { MobileMetrics } from '../ui/mobileMetrics'
import { useMobileStyles } from '../ui/theme/useMobileTheme'
import type { MobileColors } from '../ui/theme/mobilePalette'
import { Modal, ScrollView, StyleSheet, View } from 'react-native'
import { FolderOpen, X } from 'phosphor-react-native'
import { Text } from '../components/ui/text'
import { Switch } from '../components/ui/switch'
import { MobileButton } from '../ui/MobileButton'
import { MobileIconButton } from '../ui/MobileIconButton'
import { MobilePanel, MobileToolbar, MobileToolbarSpacer, MobileToolbarTitle } from '../ui/MobilePanel'

import { mobileText } from '../i18n/mobileText'
import { useMobileSettings } from './useMobileSettings'
import { MobileAppearanceSettings } from './MobileAppearanceSettings'
import { MobilePrivacySettings } from './MobilePrivacySettings'
import { useMobileAnalytics } from '../analytics/useMobileAnalytics'
import { MobileGitHubAccount } from '../components/vaults/MobileGitHubAccount'
import type { useMobileVaults } from '../workspace/git/useMobileVaults'

export function MobileSettingsSheet({ manager }: { manager: ReturnType<typeof useMobileVaults> }) {
  const { styles, mobileColors } = useMobileStyles(createThemeStyles)
  const preferences = useMobileSettings()
  const analytics = useMobileAnalytics()
  const disabled = !preferences.ready || preferences.saving
  const gitAvailable = Boolean(manager.active.git)
  const close = () => { manager.account.cancelSignIn(); preferences.close() }
  const openVaults = () => { close(); void manager.open() }
  const clone = async (url: string) => { preferences.close(); await manager.clone(url) }
  return <Modal visible={preferences.opened} transparent animationType="fade" onRequestClose={close}>
    <View style={styles.backdrop}>
      <MobilePanel style={styles.panel} accessibilityViewIsModal testID="mobile-settings">
        <MobileToolbar>
          <MobileToolbarTitle title={mobileText('settings.title')} />
          <MobileToolbarSpacer />
          <MobileIconButton accessibilityLabel={mobileText('settings.close')} onPress={close}><X size={18} color={mobileColors.textMuted} /></MobileIconButton>
        </MobileToolbar>
        <ScrollView contentContainerStyle={styles.content}>
          {preferences.error && <Text accessibilityRole="alert" style={styles.error}>{mobileText(preferences.error === 'load' ? 'mobile.settings.loadFailed' : 'mobile.settings.saveFailed')}</Text>}
          {preferences.error === 'load' && <MobileButton label={mobileText('pulse.retry')} onPress={() => { void preferences.retry() }} />}
          <MobileAppearanceSettings />
          <Text style={styles.heading}>{mobileText('settings.autogit.title')}</Text>
          <View style={styles.row}>
            <Text style={styles.label}>{mobileText('settings.autogit.enable')}</Text>
            <Switch checked={preferences.settings.autoGit} disabled={disabled || !gitAvailable} accessibilityLabel={mobileText('settings.autogit.enable')}
              onCheckedChange={(autoGit) => { void preferences.update({ autoGit }).then(saved => {
                if (saved) analytics.capture({ name: 'mobile_setting_changed', setting: 'autoGit' })
              }) }} testID="settings-auto-git" />
          </View>
          <Text style={styles.detail}>{mobileText(gitAvailable ? 'mobile.settings.autoGitForeground' : 'mobile.vaults.localOnly')}</Text>
          <MobilePrivacySettings />
          <MobileGitHubAccount account={manager.account} disabled={manager.busy} clone={clone} />
          <MobileButton label={mobileText('status.vault.manageWorkspaces')} icon={<FolderOpen size={18} color={mobileColors.text} />} onPress={openVaults} testID="settings-manage-vaults" />
        </ScrollView>
      </MobilePanel>
    </View>
  </Modal>
}

function createThemeStyles(mobileColors: MobileColors, metrics: MobileMetrics) {
  const { space: mobileSpace } = metrics
  const styles = StyleSheet.create({
    backdrop: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: mobileColors.overlay, padding: mobileSpace.lg },
    panel: { width: '100%', maxWidth: 540, maxHeight: '85%', borderRadius: 8, overflow: 'hidden', backgroundColor: mobileColors.dialog },
    content: { padding: metrics.size(20), gap: metrics.size(12) },
    row: { minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: metrics.size(16) },
    label: { flex: 1, fontSize: metrics.size(14), color: mobileColors.text },
    heading: { fontSize: metrics.size(12), color: mobileColors.textMuted, fontWeight: '500' },
    detail: { fontSize: metrics.size(12), lineHeight: metrics.size(18), color: mobileColors.textMuted },
    error: { fontSize: metrics.size(12), lineHeight: metrics.size(18), color: mobileColors.danger },
  })
  return { mobileColors, styles }
}
