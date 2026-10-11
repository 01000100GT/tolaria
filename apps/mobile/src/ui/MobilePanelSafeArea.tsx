import type { ReactNode } from 'react'
import { StyleSheet, View } from 'react-native'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { mobileColors } from './tokens'

export function MobilePanelSafeArea({ children, sidebar = false, divider = 'right' }: {
  children: ReactNode
  sidebar?: boolean
  divider?: 'left' | 'right' | 'none'
}) {
  const { top } = useSafeAreaInsets()
  return <SafeAreaView edges={['top']} style={[styles.panel, sidebar && styles.sidebar]}>
    {divider !== 'none' && <View pointerEvents="none" style={[styles.divider, { height: top }, divider === 'left' ? styles.left : styles.right]} />}
    {children}
  </SafeAreaView>
}

const styles = StyleSheet.create({
  panel: { flex: 1, minWidth: 0, backgroundColor: mobileColors.card },
  sidebar: { backgroundColor: mobileColors.sidebar },
  divider: { position: 'absolute', top: 0, width: StyleSheet.hairlineWidth, backgroundColor: mobileColors.border },
  left: { left: 0 },
  right: { right: 0 },
})
