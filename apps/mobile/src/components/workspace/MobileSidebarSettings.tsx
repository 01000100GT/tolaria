import { Command, GearSix } from 'phosphor-react-native'
import { StyleSheet, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { mobileText } from '../../i18n/mobileText'
import { useMobileSettings } from '../../settings/useMobileSettings'
import { useMobileColors } from '../../ui/theme/useMobileTheme'
import { Button } from '../ui/button'

export function MobileSidebarSettings({ onOpenCommandPalette }: { onOpenCommandPalette?: () => void }) {
  const preferences = useMobileSettings()
  const colors = useMobileColors()
  const insets = useSafeAreaInsets()
  const buttonStyle = [styles.button, { backgroundColor: colors.control }]
  return <View style={[styles.footer, { paddingBottom: Math.max(8, insets.bottom) }]} testID="sidebar-settings">
    {onOpenCommandPalette && <Button accessibilityLabel={mobileText('menu.view.commandPalette')} size="icon" variant="secondary" style={buttonStyle}
      className="h-12 w-12 rounded-[24px] sm:h-12 sm:w-12"
      onPress={onOpenCommandPalette} testID="sidebar-command-palette-action">
      <Command size={22} color={colors.textMuted} />
    </Button>}
    <Button accessibilityLabel={mobileText('settings.title')} size="icon" variant="secondary" style={buttonStyle}
      className="h-12 w-12 rounded-[24px] sm:h-12 sm:w-12"
      onPress={preferences.open} testID="open-mobile-settings">
      <GearSix size={22} color={colors.textMuted} />
    </Button>
  </View>
}

const styles = StyleSheet.create({
  footer: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', gap: 12, paddingTop: 8, paddingHorizontal: 12, flexShrink: 0 },
  button: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
})
