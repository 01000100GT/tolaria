// @vitest-environment jsdom
import { act, createElement, useRef, type ReactNode } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { PhoneWorkspaceTransition } from './PhoneWorkspaceTransition'
import type { PhoneWorkspaceState } from './phoneWorkspaceTransitions'

const animation = vi.hoisted(() => ({ timing: vi.fn(() => 0), width: 390 }))
vi.mock('react-native', () => ({
  Animated: { View: 'div' }, View: ({ children }: { children: ReactNode }) => createElement('div', null, children),
  StyleSheet: { create: (styles: unknown) => styles, absoluteFillObject: {} },
  useWindowDimensions: () => ({ width: animation.width }),
}))
vi.mock('react-native-reanimated', () => ({
  default: { View: 'div' },
  useReducedMotion: () => false,
  useSharedValue: (value: number) => useRef({ value }).current,
  useAnimatedStyle: () => ({}),
  withTiming: animation.timing,
}))

const roots: ReturnType<typeof createRoot>[] = []
beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true)
  animation.timing.mockClear()
  animation.width = 390
})
afterEach(async () => {
  for (const root of roots.splice(0)) await act(async () => root.unmount())
  vi.unstubAllGlobals()
})

it('does not replay an entrance animation after a completed gesture handoff', async () => {
  const render = createTransition()
  await render('list', 'list')
  await render('list', 'sidebar', true)
  await render('list', 'sidebar', false)
  expect(animation.timing).not.toHaveBeenCalled()
})

it('animates a subsequent button navigation once after a gesture', async () => {
  const render = createTransition()
  await render('list', 'list')
  await render('list', 'sidebar', true)
  await render('list', 'sidebar', false)
  await render('sidebar', 'list')
  expect(animation.timing).toHaveBeenCalledTimes(1)
})

it('does not replay navigation when the phone rotates after reaching its destination', async () => {
  const render = createTransition()
  await render('list', 'list')
  await render('list', 'editor')
  animation.width = 844
  await render('list', 'editor')
  expect(animation.timing).toHaveBeenCalledTimes(1)
})

function createTransition() {
  const root = createRoot(document.createElement('div'))
  roots.push(root)
  return async (previousState: PhoneWorkspaceState, state: PhoneWorkspaceState, gestureHandoffActive = false) => {
    await act(async () => root.render(createElement(PhoneWorkspaceTransition, {
      children: null, previousState, state, gestureHandoffActive,
    })))
  }
}
