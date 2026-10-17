// @vitest-environment jsdom
import { act, createElement } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, expect, it, vi } from 'vitest'
import { useMobileModalDismiss } from './useMobileModalDismiss'

const native = vi.hoisted(() => ({ setModalOpen: vi.fn(async () => {}) }))
const shortcut = vi.hoisted(() => ({
  listen: vi.fn<(listener: (event: { key: string }) => void) => () => void>(),
  unsubscribe: vi.fn(),
}))
vi.mock('../native/mobileNativeKeyCommands', () => ({ optionalNativeMobileKeyCommandsModule: () => native }))
vi.mock('./mobileWorkspaceKeyboardShortcuts', () => ({
  installMobileWorkspaceKeyboardShortcuts: shortcut.listen,
}))

const cleanups: (() => Promise<void>)[] = []
afterEach(async () => {
  for (const cleanup of cleanups.splice(0)) await cleanup()
  vi.clearAllMocks()
})

it('registers only a visible modal and uses the latest cancel callback without changing its position', async () => {
  const probe = harness()
  const previous = vi.fn()
  const current = vi.fn()
  await probe.render(previous, false)
  expect(shortcut.listen).not.toHaveBeenCalled()
  await probe.render(previous, true)
  await probe.render(current, true)
  expect(shortcut.listen).toHaveBeenCalledOnce()
  await probe.escape()
  expect(previous).not.toHaveBeenCalled()
  expect(current).toHaveBeenCalledOnce()
  expect(native.setModalOpen.mock.calls).toEqual([[true]])
  await probe.render(current, false)
  expect(native.setModalOpen.mock.calls).toEqual([[true], [false]])
  expect(shortcut.unsubscribe).toHaveBeenCalledOnce()
})

it('keeps the native Escape command enabled until the last open modal unmounts', async () => {
  const parent = harness()
  const child = harness()
  const closeParent = vi.fn()
  const closeChild = vi.fn()
  await parent.render(closeParent, true)
  await child.render(closeChild, true)
  await parent.render(closeParent, true)
  await parent.escape()
  expect(closeChild).toHaveBeenCalledOnce()
  expect(closeParent).not.toHaveBeenCalled()
  await child.unmount()
  expect(native.setModalOpen.mock.calls).toEqual([[true]])
  await parent.escape()
  expect(closeParent).toHaveBeenCalledOnce()
  await parent.unmount()
  expect(native.setModalOpen.mock.calls).toEqual([[true], [false]])
  expect(shortcut.unsubscribe).toHaveBeenCalledOnce()
})

function harness() {
  shortcut.listen.mockImplementation(() => shortcut.unsubscribe)
  const root = createRoot(document.createElement('div'))
  let mounted = true
  function Probe({ close, active }: { close: () => void; active: boolean }) {
    useMobileModalDismiss(close, active)
    return null
  }
  const unmount = async () => {
    if (mounted) { mounted = false; await act(async () => root.unmount()) }
  }
  cleanups.push(unmount)
  return {
    unmount,
    render: (close: () => void, active: boolean) => act(async () => root.render(createElement(Probe, { close, active }))),
    escape: () => act(async () => shortcut.listen.mock.calls.at(-1)?.[0]({ key: 'Escape' })),
  }
}
