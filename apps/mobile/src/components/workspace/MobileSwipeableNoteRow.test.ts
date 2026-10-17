// @vitest-environment jsdom
import { createElement, type ReactNode } from 'react'
import { createRoot } from 'react-dom/client'
import { flushSync } from 'react-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { fixtureNotes } from '../../fixtures/workspaceFixtures'
import { MobileSwipeableNoteRow } from './MobileSwipeableNoteRow'

const nativeSwipe = vi.hoisted(() => vi.fn<(props: Record<string, unknown>) => null>(() => null))
vi.mock('react-native-gesture-handler/ReanimatedSwipeable', () => ({ default: nativeSwipe }))
vi.mock('react-native', () => ({ View: ({ children }: { children: ReactNode }) => children }))
vi.mock('react-native-gesture-handler', () => ({
  GestureDetector: ({ children }: { children: ReactNode }) => children,
  Gesture: { Pan: () => {
    const pan = {
      activeOffsetX: () => pan,
      failOffsetY: () => pan,
      onEnd: () => pan,
    }
    return pan
  } },
}))
vi.mock('react-native-reanimated', () => ({
  useSharedValue: (value: number) => ({ value }),
  runOnJS: (callback: unknown) => callback,
}))
vi.mock('../../ui/theme/useMobileTheme', () => ({ useMobileColors: () => ({ card: '#fff' }) }))
vi.mock('../../analytics/useMobileAnalytics', () => ({ useMobileAnalytics: () => ({ capture: vi.fn() }) }))
vi.mock('./MobileNoteSwipeActions', () => ({ MobileNoteSwipeActions: () => null }))

afterEach(() => nativeSwipe.mockClear())

describe('note row input ownership', () => {
  it('leaves two-finger trackpad scrolling to the note list', () => {
    const props = renderRow()
    expect(props.enableTrackpadTwoFingerGesture).toBe(false)
    expect(props.renderLeftActions).toEqual(expect.any(Function))
    expect(props.renderRightActions).toEqual(expect.any(Function))
  })

  it('does not install swipe actions on a disabled row', () => {
    renderRow(true)
    expect(nativeSwipe).not.toHaveBeenCalled()
  })
})

function renderRow(disabled = false) {
  const root = createRoot(document.createElement('div'))
  try {
    flushSync(() => root.render(createElement(MobileSwipeableNoteRow, {
      note: fixtureNotes[0],
      disabled,
      children: 'Note',
      actions: { onArchive: vi.fn(), onDelete: vi.fn(), onToggleFavorite: vi.fn() },
    })))
    return nativeSwipe.mock.calls.at(-1)?.[0] as {
      enableTrackpadTwoFingerGesture?: boolean
      renderLeftActions?: unknown
      renderRightActions?: unknown
    }
  } finally { root.unmount() }
}
