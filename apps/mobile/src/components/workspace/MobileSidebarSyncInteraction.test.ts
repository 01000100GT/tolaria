// @vitest-environment jsdom
import { act, createElement, type ContextType, type CSSProperties, type ReactNode } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { MobileSidebarSettings } from './MobileSidebarSettings'
import { MobileVaultControlsContext, MobileVaultDisplayContext } from '../../workspace/MobileVaultContext'

const preferences = vi.hoisted(() => ({ open: vi.fn(), settings: { autoGit: true } }))
type Props = { children?: ReactNode; style?: CSSProperties | CSSProperties[]; testID?: string; accessibilityLabel?: string;
  disabled?: boolean; onPress?: () => void }
const style = (value: Props['style']) => Object.assign({}, ...[value].flat())
function Surface(props: Props) {
  return createElement('div', { style: style(props.style), 'data-testid': props.testID }, props.children)
}
function Control(props: Props) {
  return createElement('button', { type: 'button', style: style(props.style), 'data-testid': props.testID,
    'aria-label': props.accessibilityLabel, disabled: props.disabled, onClick: props.onPress }, props.children)
}
vi.mock('react-native', () => ({ View: Surface, ActivityIndicator: () => null, StyleSheet: { create: (value: object) => value } }))
vi.mock('react-native-safe-area-context', () => ({ useSafeAreaInsets: () => ({ bottom: 34 }) }))
vi.mock('../../settings/useMobileSettings', () => ({ useMobileSettings: () => preferences }))
vi.mock('../../ui/theme/useMobileTheme', () => ({ useMobileColors: () => ({ control: '#eee', text: '#222', textMuted: '#777', danger: '#c22' }) }))
vi.mock('../ui/button', () => ({ Button: Control }))
vi.mock('../ui/text', () => ({ Text: Surface }))
vi.mock('phosphor-react-native', () => ({ ArrowClockwise: () => null, Command: () => null, GearSix: () => null }))

type Controls = NonNullable<ContextType<typeof MobileVaultControlsContext>>
const now = Date.UTC(2026, 9, 18, 9)
const defaults: Controls = { rootUri: 'file:///owned/', git: true, busy: false, status: 'pending', historyAvailable: true,
  lastSuccessAt: now - 120_000, open: vi.fn(async () => {}), sync: vi.fn(async () => {}) }
let root: ReturnType<typeof createRoot>
let host: HTMLDivElement
beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true)
  vi.useFakeTimers()
  vi.setSystemTime(now)
  vi.clearAllMocks()
  preferences.settings.autoGit = true
  host = document.createElement('div')
  root = createRoot(host)
})
afterEach(async () => {
  await act(async () => root.unmount())
  expect(vi.getTimerCount()).toBe(0)
  vi.useRealTimers()
  vi.unstubAllGlobals()
})

it('places sync to the left of Command and Settings and invokes the existing sync callback', async () => {
  await render(defaults)
  expect([...host.querySelectorAll('button')].map(button => button.dataset.testid))
    .toEqual(['sidebar-sync-action', 'sidebar-command-palette-action', 'open-mobile-settings'])
  expect(host.textContent).toContain('GitHubChanges pending2m ago')
  await click('sidebar-sync-action')
  expect(defaults.sync).toHaveBeenCalledExactlyOnceWith()
  expect(defaults.open).not.toHaveBeenCalled()
})
it('updates pending status and relative sync time without changing the selected vault', async () => {
  await render({ ...defaults, status: 'synced' })
  expect(host.textContent).toContain('Synced2m ago')
  await act(async () => vi.advanceTimersByTime(60_000))
  expect(host.textContent).toContain('Synced3m ago')
})
it('disables duplicate sync requests while busy', async () => {
  await render({ ...defaults, busy: true })
  expect(host.querySelector<HTMLButtonElement>('[data-testid="sidebar-sync-action"]')?.disabled).toBe(true)
  await click('sidebar-sync-action')
  expect(defaults.sync).not.toHaveBeenCalled()
})
it('opens existing vault management for local-only and manual-commit workflows', async () => {
  await render({ ...defaults, git: false, status: 'local' })
  expect(host.textContent).toContain('Local onlyNot linked')
  await click('sidebar-sync-action')
  preferences.settings.autoGit = false
  await render(defaults)
  await click('sidebar-sync-action')
  expect(defaults.open).toHaveBeenCalledTimes(2)
  expect(defaults.sync).not.toHaveBeenCalled()
})
it('does not expose a live sync control for a different displayed vault', async () => {
  await render(defaults, 'file:///other/')
  expect(host.querySelector('[data-testid="sidebar-sync-action"]')).toBeNull()
  await click('open-mobile-settings')
  expect(preferences.open).toHaveBeenCalledOnce()
})

function render(controls: Controls, rootUri = defaults.rootUri) {
  return act(async () => root.render(createElement(MobileVaultControlsContext.Provider, { value: controls },
    createElement(MobileVaultDisplayContext.Provider, { value: { source: 'native', rootUri } },
      createElement(MobileSidebarSettings, { onOpenCommandPalette: vi.fn() })))) )
}
function click(id: string) {
  return act(async () => host.querySelector<HTMLButtonElement>(`[data-testid="${id}"]`)?.click())
}
