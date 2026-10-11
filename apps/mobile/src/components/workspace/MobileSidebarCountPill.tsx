import type { MobileMetrics } from '../../ui/mobileMetrics'
import { useMobileStyles } from '../../ui/theme/useMobileTheme'
import type { MobileColors } from '../../ui/theme/mobilePalette'
import { Platform, StyleSheet, View } from 'react-native'
import { Text } from '../ui/text'
import { probeProps, type MobileLayoutProbe } from '../../qa/mobileLayoutProbe'


type MobileSidebarCountPillProps = {
  activeColor?: string
  compact?: boolean
  layoutProbe?: MobileLayoutProbe
  metricId?: string
  testID: string
  value: string
}

function NativeCountPill({
  activeColor,
  compact = false,
  layoutProbe,
  metricId,
  testID,
  value,
}: MobileSidebarCountPillProps) {
  const { nativeStyles } = useMobileStyles(createThemeStyles)
  return (
    <View
      {...countPillProbeProps(layoutProbe, metricId, 'container')}
      style={[compact ? nativeStyles.compact : nativeStyles.count, activeColor ? { backgroundColor: activeColor } : null]}
      testID={testID}
    >
      <Text
        {...countPillProbeProps(layoutProbe, metricId, 'text')}
        style={[nativeStyles.text, activeColor ? nativeStyles.activeText : null]}
      >
        {value}
      </Text>
    </View>
  )
}

function countPillProbeProps(
  layoutProbe: MobileLayoutProbe | undefined,
  metricId: string | undefined,
  segment: 'container' | 'text',
) {
  if (!layoutProbe || !metricId) return {}

  return probeProps(layoutProbe, `${metricId}.${segment}`)
}

function WebCountPill({
  activeColor,
  compact = false,
  testID,
  value,
}: MobileSidebarCountPillProps) {
  const { webStyles, mobileColors } = useMobileStyles(createThemeStyles)
  return (
    <Text
      style={[compact ? webStyles.sectionCount : webStyles.count, activeColor ? { backgroundColor: activeColor, color: mobileColors.textInverse } : null]}
      testID={testID}
    >
      {value}
    </Text>
  )
}

export function MobileSidebarCountPill(props: MobileSidebarCountPillProps) {
  return Platform.OS === 'web' ? <WebCountPill {...props} /> : <NativeCountPill {...props} />
}

function createThemeStyles(mobileColors: MobileColors, metrics: MobileMetrics) {
  const { sidebar: desktopSidebarParity } = metrics
  const nativeStyles = StyleSheet.create({
    activeText: { color: mobileColors.textInverse },
    compact: {
      alignItems: 'center',
      justifyContent: 'center',
      minWidth: desktopSidebarParity.countPillCompactMinWidth,
      height: desktopSidebarParity.countPillCompactHeight,
      overflow: 'hidden',
      borderRadius: desktopSidebarParity.countPillRadius,
      backgroundColor: mobileColors.graySoft,
      paddingHorizontal: desktopSidebarParity.countPillPaddingHorizontal,
    },
    count: {
      alignItems: 'center',
      justifyContent: 'center',
      minWidth: desktopSidebarParity.countPillMinWidth,
      height: desktopSidebarParity.countPillHeight,
      overflow: 'hidden',
      borderRadius: desktopSidebarParity.countPillRadius,
      backgroundColor: mobileColors.graySoft,
      paddingHorizontal: desktopSidebarParity.countPillPaddingHorizontal,
    },
    text: {
      color: mobileColors.textMuted,
      fontSize: desktopSidebarParity.countPillTextSize,
      fontWeight: '400',
      lineHeight: metrics.size(12),
      textAlign: 'center',
    },
  })

  const webStyles = {
    count: {
      minWidth: desktopSidebarParity.countPillMinWidth,
      height: desktopSidebarParity.countPillHeight,
      overflow: 'hidden' as const,
      borderRadius: desktopSidebarParity.countPillRadius,
      backgroundColor: mobileColors.graySoft,
      color: mobileColors.textMuted,
      fontSize: desktopSidebarParity.countPillTextSize,
      fontWeight: '400' as const,
      paddingHorizontal: desktopSidebarParity.countPillPaddingHorizontal,
      textAlign: 'center' as const,
    },
    sectionCount: {
      minWidth: desktopSidebarParity.countPillCompactMinWidth,
      height: desktopSidebarParity.countPillCompactHeight,
      overflow: 'hidden' as const,
      borderRadius: desktopSidebarParity.countPillRadius,
      backgroundColor: mobileColors.graySoft,
      color: mobileColors.textMuted,
      fontSize: desktopSidebarParity.countPillTextSize,
      fontWeight: '400' as const,
      paddingHorizontal: desktopSidebarParity.countPillPaddingHorizontal,
      textAlign: 'center' as const,
    },
  }
  return { mobileColors, nativeStyles, webStyles }
}
