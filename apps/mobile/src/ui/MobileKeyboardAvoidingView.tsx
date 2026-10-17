import { useCallback, useRef, useState } from 'react'
import { KeyboardAvoidingView, Platform, StyleSheet, View, type LayoutChangeEvent, type ViewProps } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

/** Keep nested tablet surfaces in the keyboard's screen-coordinate space. */
export function MobileKeyboardAvoidingView({ children, onLayout, ...props }: ViewProps) {
  const host = useRef<View>(null)
  const [screenTop, setScreenTop] = useState(0)
  const insets = useSafeAreaInsets()
  const measureOrigin = useCallback((event: LayoutChangeEvent) => {
    host.current?.measureInWindow((_x, y) => setScreenTop(y))
    onLayout?.(event)
  }, [onLayout])

  return (
    <View {...props} ref={host} collapsable={false} onLayout={measureOrigin}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={screenTop}
        style={[styles.content, { paddingTop: Math.max(0, insets.top - screenTop) }]}
      >
        {children}
      </KeyboardAvoidingView>
    </View>
  )
}

const styles = StyleSheet.create({ content: { flex: 1, minHeight: 0 } })
