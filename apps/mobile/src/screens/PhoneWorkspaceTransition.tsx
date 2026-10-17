import { useLayoutEffect, useRef, type ReactNode } from 'react'
import { Animated as NativeAnimated, StyleSheet, useWindowDimensions, View, type ViewProps } from 'react-native'
import Reanimated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated'
import {
  phoneWorkspaceTransitionDirection,
  phoneWorkspaceTransitionDurationMs,
  type PhoneWorkspaceState,
} from './phoneWorkspaceTransitions'

type PhoneWorkspaceTransitionProps = {
  children: ReactNode
  dragX?: NativeAnimated.Value
  gestureHandoffActive?: boolean
  preview?: ReactNode
  previousState: PhoneWorkspaceState
  state: PhoneWorkspaceState
  swipeHandlers?: ViewProps
}

export function PhoneWorkspaceTransition({
  children,
  dragX,
  gestureHandoffActive = false,
  previousState,
  preview,
  state,
  swipeHandlers,
}: PhoneWorkspaceTransitionProps) {
  const dragStyle = dragX ? { transform: [{ translateX: dragX }] } : null
  const transitionStyle = usePhoneTransitionStyle({ previousState, state, gestureHandoffActive })

  return (
    <View
      {...swipeHandlers}
      style={styles.stage}
      testID="phone-transition-stage"
    >
      {preview ? <View pointerEvents="none" style={styles.previewLayer}>{preview}</View> : null}
      <NativeAnimated.View style={[styles.stage, dragStyle]}>
        <Reanimated.View
          style={[styles.stage, transitionStyle]}
        >
          {children}
        </Reanimated.View>
      </NativeAnimated.View>
    </View>
  )
}

function usePhoneTransitionStyle({ previousState, state, gestureHandoffActive }: Pick<PhoneWorkspaceTransitionProps, 'previousState' | 'state' | 'gestureHandoffActive'>) {
  const { width } = useWindowDimensions()
  const reduceMotion = useReducedMotion()
  const offset = useSharedValue(0)
  const arrivedState = useRef(state)
  const direction = phoneWorkspaceTransitionDirection(previousState, state)
  useLayoutEffect(() => {
    if (arrivedState.current === state) return
    arrivedState.current = state
    offset.set(0)
    if (gestureHandoffActive) return
    if (reduceMotion) return
    offset.set(direction === 'fromLeft' ? -width : width)
    offset.set(withTiming(0, { duration: phoneWorkspaceTransitionDurationMs }))
  }, [direction, gestureHandoffActive, offset, previousState, reduceMotion, state, width])
  return useAnimatedStyle(() => ({ transform: [{ translateX: offset.get() }] }))
}

const styles = StyleSheet.create({
  previewLayer: {
    ...StyleSheet.absoluteFillObject,
  },
  stage: {
    flex: 1,
  },
})
