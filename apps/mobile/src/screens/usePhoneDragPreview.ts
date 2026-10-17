import { useCallback, useEffect, useState } from 'react'
import { Animated as NativeAnimated, Platform } from 'react-native'
import {
  phoneWorkspaceDragCommitOffset,
  phoneWorkspaceDragOffset,
  phoneWorkspaceSwipeDestination,
  phoneWorkspaceTransitionDurationMs,
  type PhoneWorkspaceState,
} from './phoneWorkspaceTransitions'

export function usePhoneDragPreview(
  phoneState: PhoneWorkspaceState,
  screenWidth: number,
  clearGestureHandoff: () => void,
) {
  const enabled = Platform.OS !== 'web'
  const [dragX] = useState(() => new NativeAnimated.Value(0))
  const [previewState, setPreviewState] = useState<PhoneWorkspaceState | null>(null)
  const [handoffState, setHandoffState] = useState<PhoneWorkspaceState | null>(null)
  const commit = usePhoneDragCommit({ clearGestureHandoff, dragX, enabled, phoneState, screenWidth, setPreviewState, setHandoffState })
  const onSwipeProgress = useCallback(({ dx }: { dx: number }) => {
    if (!enabled) return

    const offset = phoneWorkspaceDragOffset(phoneState, dx, screenWidth)
    dragX.stopAnimation()
    if (offset === 0) {
      dragX.setValue(0)
      setPreviewState(null)
      return
    }

    dragX.setValue(offset)
    setPreviewState(phoneWorkspaceSwipeDestination(phoneState, offset < 0 ? 'left' : 'right'))
  }, [dragX, enabled, phoneState, screenWidth])
  const onSwipeEnd = useCallback((committed: boolean) => {
    if (!enabled || committed) return

    dragX.stopAnimation()

    NativeAnimated.timing(dragX, {
      duration: 120,
      toValue: 0,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) setPreviewState(null)
    })
  }, [dragX, enabled])

  useEffect(() => () => {
    dragX.stopAnimation()
  }, [dragX])

  return { commit, dragX, enabled, handoffState, onSwipeEnd, onSwipeProgress, previewState }
}

function usePhoneDragCommit({ clearGestureHandoff, dragX, enabled, phoneState, screenWidth, setPreviewState, setHandoffState }: {
  clearGestureHandoff: () => void
  dragX: NativeAnimated.Value
  enabled: boolean
  phoneState: PhoneWorkspaceState
  screenWidth: number
  setPreviewState: (state: PhoneWorkspaceState | null) => void
  setHandoffState: (state: PhoneWorkspaceState | null) => void
}) {
  return useCallback((nextState: PhoneWorkspaceState, action: () => void) => {
    if (!enabled) {
      action()
      return
    }
    dragX.stopAnimation()
    const commitOffset = phoneWorkspaceDragCommitOffset(phoneState, nextState, screenWidth)
    if (commitOffset === 0) {
      dragX.setValue(0)
      setPreviewState(null)
      action()
      return
    }
    setPreviewState(nextState)
    NativeAnimated.timing(dragX, {
      duration: phoneWorkspaceTransitionDurationMs,
      toValue: commitOffset,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (!finished) return
      setHandoffState(nextState)
      dragX.setValue(0)
      setPreviewState(null)
      action()
      requestAnimationFrame(() => {
        setHandoffState(null)
        clearGestureHandoff()
      })
    })
  }, [clearGestureHandoff, dragX, enabled, phoneState, screenWidth, setPreviewState, setHandoffState])
}
