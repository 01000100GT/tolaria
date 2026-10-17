import { useState, type ReactNode } from 'react'
import { StyleSheet, View } from 'react-native'

type PhoneScreenLayerProps = {
  active: boolean
  retain?: boolean
  children: ReactNode
}

const visibilityProps = {
  active: { accessibilityElementsHidden: false, importantForAccessibility: 'auto', pointerEvents: 'auto', style: { opacity: 1 } },
  hidden: { accessibilityElementsHidden: true, importantForAccessibility: 'no-hide-descendants', pointerEvents: 'none', style: { opacity: 0 } },
} as const

export function PhoneScreenLayer({ active, retain = false, children }: PhoneScreenLayerProps) {
  const [visited, setVisited] = useState(active)
  if (active && !visited) setVisited(true)
  if (!active && !(retain && visited)) return null
  const visibility = active ? visibilityProps.active : visibilityProps.hidden
  return (
    <View
      {...visibility}
      style={[styles.layer, visibility.style]}
    >
      {children}
    </View>
  )
}

const styles = StyleSheet.create({
  layer: { ...StyleSheet.absoluteFillObject },
})
