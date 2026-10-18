import { useCallback, useLayoutEffect, useMemo, useRef } from 'react'
import { Platform } from 'react-native'
import { cancelAnimation, useReducedMotion, useSharedValue, withTiming } from 'react-native-reanimated'
import { createPhonePanGesture, type PhonePanSession } from './phoneNativePanGesture'
import { phoneRailBounds, phoneRailOffset, type PhoneRailGeometry } from './phonePanelRail'
import { phoneWorkspaceTransitionDurationMs, type PhoneWorkspaceState } from './phoneWorkspaceTransitions'

export function usePhonePanelRail(state: PhoneWorkspaceState, width: number, onSettle: (state: PhoneWorkspaceState) => void) {
  const reduceMotion = useReducedMotion()
  const previousWidth = useRef(width)
  const initialOffset = phoneRailOffset(state, width)
  const offset = useSharedValue(initialOffset)
  const epoch = useSharedValue(0)
  const geometry = useSharedValue<PhoneRailGeometry>({ width, reduceMotion })
  const session = useSharedValue<PhonePanSession>({ x: 0, y: 0, base: initialOffset, translation: 0,
    mode: 'fail', bounds: phoneRailBounds(initialOffset, width) })
  const acceptSettle = useCallback((next: PhoneWorkspaceState, ticket: number) => {
    if (epoch.get() === ticket) onSettle(next)
  }, [epoch, onSettle])
  const gesture = useMemo(() => createPhonePanGesture({ geometry, offset, epoch, session, onSettle: acceptSettle }),
    [acceptSettle, epoch, geometry, offset, session])

  useLayoutEffect(() => {
    const resized = previousWidth.current !== width
    previousWidth.current = width
    geometry.set({ width, reduceMotion })
    const target = phoneRailOffset(state, width)
    if (!resized && Math.abs(offset.get() - target) < 0.5) return
    epoch.set(current => current + 1)
    session.set({ ...session.get(), mode: 'fail' })
    cancelAnimation(offset)
    offset.set(resized ? target : withTiming(target, { duration: reduceMotion ? 0 : phoneWorkspaceTransitionDurationMs }))
  }, [epoch, geometry, offset, reduceMotion, session, state, width])

  useLayoutEffect(() => () => {
    epoch.set(current => current + 1)
    session.set({ ...session.get(), mode: 'fail' })
    cancelAnimation(offset)
  }, [epoch, offset, session])

  return { enabled: Platform.OS !== 'web', gesture, offset }
}
