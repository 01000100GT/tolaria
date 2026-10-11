import { StyleSheet, View } from 'react-native'
import { Text } from '../components/ui/text'
import { MobileButton } from '../ui/MobileButton'
import { mobileText } from '../i18n/mobileText'
import { useMobileColors } from '../ui/theme/useMobileTheme'
import { useMobileSettings } from './useMobileSettings'

export function MobileAppearanceSettings() {
  const preferences = useMobileSettings()
  const colors = useMobileColors()
  const disabled = !preferences.ready || preferences.saving
  return <View style={styles.section}>
    <Text style={{ fontSize: 12, fontWeight: '500', color: colors.textMuted }}>{mobileText('settings.appearance.title')}</Text>
    <View accessibilityRole="radiogroup" accessibilityLabel={mobileText('settings.theme.label')} style={[styles.options, { backgroundColor: colors.graySoft }]}>
      {(['system', 'light', 'dark'] as const).map(theme => <MobileButton
        key={theme}
        label={mobileText(`settings.theme.${theme}`)}
        accessibilityRole="radio"
        accessibilityState={{ checked: preferences.settings.theme === theme }}
        disabled={disabled}
        variant={preferences.settings.theme === theme ? 'secondary' : 'ghost'}
        style={styles.option}
        testID={`settings-theme-${theme}`}
        onPress={() => { void preferences.update({ theme }) }}
      />)}
    </View>
  </View>
}

const styles = StyleSheet.create({
  section: { gap: 12, paddingBottom: 12 },
  options: { flexDirection: 'row', gap: 4, padding: 4, borderRadius: 6 },
  option: { flex: 1, minHeight: 44 },
})
