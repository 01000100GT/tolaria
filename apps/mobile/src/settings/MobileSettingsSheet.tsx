import { Modal, ScrollView, StyleSheet, View } from 'react-native'
import { X } from 'phosphor-react-native'
import { Text } from '../components/ui/text'
import { Switch } from '../components/ui/switch'
import { MobileButton } from '../ui/MobileButton'
import { MobileIconButton } from '../ui/MobileIconButton'
import { MobilePanel, MobileToolbar, MobileToolbarSpacer, MobileToolbarTitle } from '../ui/MobilePanel'
import { mobileColors, mobileSpace } from '../ui/tokens'
import { mobileText } from '../i18n/mobileText'
import { useMobileSettings } from './useMobileSettings'

export function MobileSettingsSheet({ gitAvailable }: { gitAvailable: boolean }) {
  const preferences = useMobileSettings()
  const disabled = !preferences.ready || preferences.saving
  return <Modal visible={preferences.opened} transparent animationType="fade" onRequestClose={preferences.close}>
    <View style={styles.backdrop}>
      <MobilePanel style={styles.panel} accessibilityViewIsModal testID="mobile-settings">
        <MobileToolbar>
          <MobileToolbarTitle title={mobileText('settings.title')} />
          <MobileToolbarSpacer />
          <MobileIconButton accessibilityLabel={mobileText('settings.close')} onPress={preferences.close}><X size={18} color={mobileColors.textMuted} /></MobileIconButton>
        </MobileToolbar>
        <ScrollView contentContainerStyle={styles.content}>
          {preferences.error && <Text accessibilityRole="alert" style={styles.error}>{mobileText(preferences.error === 'load' ? 'mobile.settings.loadFailed' : 'mobile.settings.saveFailed')}</Text>}
          {preferences.error === 'load' && <MobileButton label={mobileText('pulse.retry')} onPress={() => { void preferences.retry() }} />}
          <Text style={styles.heading}>{mobileText('settings.autogit.title')}</Text>
          <View style={styles.row}>
            <Text style={styles.label}>{mobileText('settings.autogit.enable')}</Text>
            <Switch checked={preferences.settings.autoGit} disabled={disabled || !gitAvailable} accessibilityLabel={mobileText('settings.autogit.enable')} onCheckedChange={(autoGit) => { void preferences.update({ autoGit }) }} testID="settings-auto-git" />
          </View>
          <Text style={styles.detail}>{mobileText(gitAvailable ? 'mobile.settings.autoGitForeground' : 'mobile.vaults.localOnly')}</Text>
        </ScrollView>
      </MobilePanel>
    </View>
  </Modal>
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#00000040', padding: mobileSpace.lg },
  panel: { width: '100%', maxWidth: 540, maxHeight: '85%', borderRadius: 8, overflow: 'hidden' },
  content: { padding: 20, gap: 12 },
  row: { minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: 16 },
  label: { flex: 1, fontSize: 14, color: mobileColors.text },
  heading: { fontSize: 12, color: mobileColors.textMuted, fontWeight: '500' },
  detail: { fontSize: 12, lineHeight: 18, color: mobileColors.textMuted },
  error: { fontSize: 12, lineHeight: 18, color: mobileColors.danger },
})
