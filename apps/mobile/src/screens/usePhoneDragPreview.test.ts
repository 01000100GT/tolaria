// @vitest-environment jsdom
import { act, createElement, useLayoutEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { usePhoneDragPreview } from './usePhoneDragPreview'

const animation = vi.hoisted(() => {
  type Completion = (result: { finished: boolean }) => void
  class Value {
    completion?: Completion
    constructor(public value: number) {}
    setValue(value: number) { this.value = value }
    stopAnimation() {
      const completion = this.completion
      this.completion = undefined
      completion?.({ finished: false })
    }
  }
  let current: Value | undefined
  return {
    Value,
    timing: vi.fn((value: Value) => ({ start: (completion: Completion) => {
      current = value
      value.completion = completion
    } })),
    finish: () => {
      const completion = current?.completion
      if (current) current.completion = undefined
      completion?.({ finished: true })
    },
  }
})
vi.mock('react-native', () => ({ Platform: { OS: 'ios' }, Animated: animation }))

const roots: ReturnType<typeof createRoot>[] = []
beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true)
  vi.stubGlobal('requestAnimationFrame', vi.fn())
  animation.timing.mockClear()
})
afterEach(async () => {
  for (const root of roots.splice(0)) await act(async () => root.unmount())
  vi.unstubAllGlobals()
})

it('lets a committed drag finish settling before changing the current panel', async () => {
  const drag = await mountPreview()
  const navigate = vi.fn()
  await act(async () => {
    drag.current.onSwipeProgress({ dx: 120 })
    drag.current.commit('sidebar', navigate)
    drag.current.onSwipeEnd(true)
  })
  expect(navigate).not.toHaveBeenCalled()
  await act(async () => animation.finish())
  expect(navigate).toHaveBeenCalledOnce()
  expect(drag.current.dragX).toMatchObject({ value: 0 })
  expect(drag.current.previewState).toBeNull()
  expect(drag.current.handoffState).toBe('sidebar')
  const nextFrame = vi.mocked(requestAnimationFrame).mock.calls.at(-1)?.[0]
  expect(nextFrame).toBeDefined()
  await act(async () => nextFrame?.(0))
  expect(drag.current.handoffState).toBeNull()
  expect(drag.clearHandoff).toHaveBeenCalledOnce()
})

it('does not navigate when a new gesture interrupts the previous settling animation', async () => {
  const drag = await mountPreview()
  const navigate = vi.fn()
  await act(async () => drag.current.commit('sidebar', navigate))
  await act(async () => drag.current.onSwipeProgress({ dx: 15 }))
  expect(navigate).not.toHaveBeenCalled()
})

it('returns an uncommitted drag to its original panel without navigation', async () => {
  const drag = await mountPreview()
  await act(async () => drag.current.onSwipeProgress({ dx: 25 }))
  expect(drag.current.previewState).toBe('sidebar')
  await act(async () => drag.current.onSwipeEnd(false))
  await act(async () => animation.finish())
  expect(drag.current.previewState).toBeNull()
})

async function mountPreview() {
  const root = createRoot(document.createElement('div'))
  roots.push(root)
  let current: ReturnType<typeof usePhoneDragPreview>
  const clearHandoff = vi.fn()
  function Probe() {
    const preview = usePhoneDragPreview('list', 390, clearHandoff)
    useLayoutEffect(() => { current = preview }, [preview])
    return null
  }
  await act(async () => root.render(createElement(Probe)))
  return { get current() { return current }, clearHandoff }
}
