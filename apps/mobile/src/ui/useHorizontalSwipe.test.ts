// @vitest-environment jsdom
import { createElement } from 'react'
import { createRoot } from 'react-dom/client'
import { flushSync } from 'react-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { useHorizontalSwipe } from './useHorizontalSwipe'

const responder = vi.hoisted(() => vi.fn((callbacks: object) => ({ panHandlers: callbacks })))
vi.mock('react-native', () => ({ PanResponder: { create: responder } }))

type Options = Parameters<typeof useHorizontalSwipe>[0]
type Callbacks = {
  onPanResponderRelease: (event: null, gesture: { dx: number; dy: number }) => void
  onPanResponderMove: (event: null, gesture: { dx: number; dy: number }) => void
  onPanResponderTerminate: () => void
}

function Surface(props: Options) {
  useHorizontalSwipe(props)
  return null
}

afterEach(() => responder.mockClear())

describe('native horizontal gesture continuity', () => {
  it('keeps the same responder during preview rerenders and uses the latest actions', () => {
    const root = createRoot(document.createElement('div'))
    const oldRight = vi.fn()
    const right = vi.fn()
    const end = vi.fn()
    try {
      flushSync(() => root.render(createElement(Surface, { onSwipeRight: oldRight })))
      flushSync(() => root.render(createElement(Surface, { onSwipeRight: right, onSwipeEnd: end })))
      expect(responder).toHaveBeenCalledOnce()
      const callbacks = responder.mock.calls[0][0] as Callbacks
      callbacks.onPanResponderRelease(null, { dx: 160, dy: 2 })
      expect(right).toHaveBeenCalledOnce()
      expect(oldRight).not.toHaveBeenCalled()
      expect(end).toHaveBeenCalledWith(true)
    } finally { root.unmount() }
  })

  it('forwards progress and interruption to callbacks added after mounting', () => {
    const root = createRoot(document.createElement('div'))
    const progress = vi.fn()
    const end = vi.fn()
    try {
      flushSync(() => root.render(createElement(Surface)))
      flushSync(() => root.render(createElement(Surface, { onSwipeProgress: progress, onSwipeEnd: end })))
      expect(responder).toHaveBeenCalledOnce()
      const callbacks = responder.mock.calls[0][0] as Callbacks
      callbacks.onPanResponderMove(null, { dx: 38, dy: 1 })
      callbacks.onPanResponderTerminate()
      expect(progress).toHaveBeenCalledWith({ dx: 38, dy: 1 })
      expect(end).toHaveBeenCalledWith(false)
    } finally { root.unmount() }
  })
})
