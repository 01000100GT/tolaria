import { GearSix } from 'phosphor-react-native'
import { StyleSheet, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { mobileText } from '../../i18n/mobileText'
import { useMobileSettings } from '../../settings/useMobileSettings'
import { useMobileColors } from '../../ui/theme/useMobileTheme'
import { Button } from '../ui/button'

export function MobileSidebarSettings() {
  const preferences = useMobileSettings()
  const colors = useMobileColors()
  const insets = useSafeAreaInsets()
  return <View style={[styles.footer, { paddingBottom: Math.max(8, insets.bottom) }]} testID="sidebar-settings">
    <Button accessibilityLabel={mobileText('settings.title')} size="icon" variant="ghost" style={styles.button}
      onPress={preferences.open} testID="open-mobile-settings">
      <GearSix size={22} color={colors.textMuted} />
    </Button>
  </View>
}

const styles = StyleSheet.create({
  footer: { alignItems: 'flex-end', paddingTop: 8, paddingHorizontal: 12, flexShrink: 0 },
  button: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
})
