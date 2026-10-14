import { useState, type ReactNode } from 'react'
import { StyleSheet, View } from 'react-native'

export function PhoneScreenLayer({ active, retain = false, children }: {
  active: boolean
  retain?: boolean
  children: ReactNode
}) {
  const [visited, setVisited] = useState(active)
  if (active && !visited) setVisited(true)
  if (!active && !(retain && visited)) return null
  return (
    <View
      accessibilityElementsHidden={!active}
      importantForAccessibility={active ? 'auto' : 'no-hide-descendants'}
      pointerEvents={active ? 'auto' : 'none'}
      style={[styles.layer, !active && styles.hidden]}
    >
      {children}
    </View>
  )
}

const styles = StyleSheet.create({
  layer: { ...StyleSheet.absoluteFillObject },
  hidden: { opacity: 0 },
})
