import { StyleSheet, View } from 'react-native'
import { Text } from '../components/ui/text'
import { Switch } from '../components/ui/switch'
import { mobileText } from '../i18n/mobileText'
import { useMobileColors } from '../ui/theme/useMobileTheme'
import { useMobileAnalytics } from '../analytics/useMobileAnalytics'
import { useMobileSettings } from './useMobileSettings'

export function MobilePrivacySettings() {
  const preferences = useMobileSettings()
  const analytics = useMobileAnalytics()
  const colors = useMobileColors()
  return <View style={styles.section}>
    <Text style={{ fontSize: 12, fontWeight: '500', color: colors.textMuted }}>{mobileText('settings.privacy.title')}</Text>
    <View style={styles.row}>
      <View style={styles.label}>
        <Text style={{ fontSize: 14, color: colors.text }}>{mobileText('settings.privacy.analytics')}</Text>
        <Text style={{ fontSize: 12, lineHeight: 18, color: colors.textMuted }}>{mobileText('settings.privacy.analyticsDescription')}</Text>
      </View>
      <Switch checked={preferences.settings.analytics} disabled={!preferences.ready || preferences.saving}
        accessibilityLabel={mobileText('settings.privacy.analytics')} testID="settings-analytics"
        onCheckedChange={(enabled) => {
          if (!enabled) analytics.setEnabled(false)
          void preferences.update({ analytics: enabled })
        }} />
    </View>
  </View>
}

const styles = StyleSheet.create({
  section: { gap: 12, paddingTop: 12 },
  row: { minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: 16 },
  label: { flex: 1, gap: 4 },
})
