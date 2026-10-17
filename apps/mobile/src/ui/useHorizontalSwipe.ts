import { useLayoutEffect, useState } from 'react'
import { PanResponder, type PanResponderGestureState } from 'react-native'

import {
  horizontalSwipeCapturesMovement,
  horizontalSwipeCommitted,
  shouldStartHorizontalSwipe,
  type HorizontalSwipeOffset,
} from './horizontalSwipePolicy'

type HorizontalSwipeProgress = {
  dx: number
  dy: number
}

type HorizontalSwipeOptions = {
  canStart?: (start: { x: number; y: number }) => boolean
  captureOnStart?: boolean
  disabled?: boolean
  onSwipeEnd?: (committed: boolean) => void
  onSwipeLeft?: () => void
  onSwipeProgress?: (progress: HorizontalSwipeProgress) => void
  onSwipeRight?: () => void
}

type NormalizedHorizontalSwipeOptions = HorizontalSwipeOptions & {
  captureOnStart: boolean
  disabled: boolean
}

export function useHorizontalSwipe({
  canStart,
  captureOnStart = false,
  disabled = false,
  onSwipeEnd,
  onSwipeLeft,
  onSwipeProgress,
  onSwipeRight,
}: HorizontalSwipeOptions) {
  const options = { canStart, captureOnStart, disabled, onSwipeEnd, onSwipeLeft, onSwipeProgress, onSwipeRight }
  // Preview updates must not replace PanResponder's in-flight gesture state.
  const [responder] = useState(() => createHorizontalSwipeResponder(options))
  useLayoutEffect(() => { responder.update(options) })
  return responder.panHandlers
}

function createHorizontalSwipeResponder(initial: NormalizedHorizontalSwipeOptions) {
  let options = initial
  return {
    panHandlers: createHorizontalSwipeHandlers(() => options),
    update: (next: NormalizedHorizontalSwipeOptions) => { options = next },
  }
}

function createHorizontalSwipeHandlers(options: () => NormalizedHorizontalSwipeOptions) {
  return PanResponder.create({
    onStartShouldSetPanResponder: () => shouldStartHorizontalSwipe(options()),
    onMoveShouldSetPanResponder: (_, gesture) => shouldCapture(gesture, options()),
    onMoveShouldSetPanResponderCapture: (_, gesture) => shouldCapture(gesture, options()),
    onPanResponderRelease: (_, gesture) => releaseHorizontalSwipe(gesture, options()),
    onPanResponderTerminationRequest: () => true,
    onPanResponderMove: (_, gesture) => options().onSwipeProgress?.({ dx: gesture.dx, dy: gesture.dy }),
    onPanResponderTerminate: () => options().onSwipeEnd?.(false),
  }).panHandlers
}

function releaseHorizontalSwipe(
  gesture: HorizontalSwipeOffset,
  options: NormalizedHorizontalSwipeOptions,
  allowCommit = true,
) {
  const committed = allowCommit && horizontalSwipeCommitted(gesture)
  if (committed) commitHorizontalSwipe(gesture, options)
  options.onSwipeEnd?.(committed)
}

function commitHorizontalSwipe(
  gesture: HorizontalSwipeOffset,
  options: Pick<HorizontalSwipeOptions, 'onSwipeLeft' | 'onSwipeRight'>,
) {
  const action = gesture.dx < 0 ? options.onSwipeLeft : options.onSwipeRight
  action?.()
}

function shouldCapture(gesture: PanResponderGestureState, options: NormalizedHorizontalSwipeOptions) {
  if (options.disabled || options.canStart?.({ x: gesture.x0, y: gesture.y0 }) === false) return false
  return horizontalSwipeCapturesMovement(gesture)
}
