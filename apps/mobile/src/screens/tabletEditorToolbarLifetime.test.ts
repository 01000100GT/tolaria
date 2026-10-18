// @vitest-environment jsdom
import { act, createElement, type ReactNode } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { workspaceScenarioForId } from '../fixtures/workspaceFixtures'
import { TabletEditorPanel } from './TabletEditorPanel'
import type { MobileNote } from '../workspace/mobileWorkspaceModel'

type SurfaceProps = { children?: ReactNode; testID?: string }
function Surface({ children, testID }: SurfaceProps) {
  return createElement('div', { 'data-testid': testID }, children)
}
function Control({ children, testID, onPress }: SurfaceProps & { onPress?: () => void }) {
  return createElement('button', { type: 'button', onClick: onPress, 'data-testid': testID }, children)
}
vi.mock('react-native', () => ({ View: Surface, ScrollView: Surface,
  StyleSheet: { create: (value: object) => value, flatten: (value: object) => value, hairlineWidth: 0.5 } }))
vi.mock('../ui/theme/useMobileTheme', async () => {
  const { mobileMetrics } = await import('../ui/mobileMetrics')
  const { mobilePalettes } = await import('../ui/theme/mobilePalette')
  return { useMobileStyles: (factory: (colors: object, metrics: object) => object) => factory(mobilePalettes.light, mobileMetrics[1.2]),
    useMobileColors: () => mobilePalettes.light, useMobileMetrics: () => mobileMetrics[1.2] }
})
vi.mock('phosphor-react-native', () => ({ Check: () => null, X: () => null, Code: () => null,
  DotsThree: () => null, ListBullets: () => null, Star: () => null }))
vi.mock('../components/ui/button', () => ({ Button: Control }))
vi.mock('../components/ui/input', () => ({ Input: ({ testID }: SurfaceProps) => createElement('input', { 'data-testid': testID }) }))
vi.mock('../analytics/useMobileAnalytics', () => ({ useMobileAnalytics: () => ({ capture: vi.fn() }) }))
vi.mock('../workspace/useMobileModalDismiss', () => ({ useMobileModalDismiss: () => undefined }))
vi.mock('../components/workspace/MobileWorkspaceIcons', () => ({ MobileNoteIcon: () => null, MobileTypeIcon: () => null }))
vi.mock('../ui/MobilePanel', () => ({ MobilePanel: Surface, MobileToolbar: Surface, MobileToolbarSpacer: () => null,
  MobileToolbarTitle: ({ title, testID }: { title: string; testID?: string }) => createElement('span', { 'data-testid': testID }, title) }))
vi.mock('../ui/MobileIconButton', () => ({ MobileIconButton: Control }))
vi.mock('../ui/MobileChip', () => ({ MobileChip: () => null }))
vi.mock('../qa/mobileLayoutProbe', () => ({ useMobileLayoutProbe: () => ({ probe: () => ({}), metrics: [] }) }))
vi.mock('../workspace/mobileAttachmentImport', () => ({ useMobileAttachmentImporter: () => vi.fn() }))
vi.mock('../workspace/mobileAttachmentOpen', () => ({ useMobileAttachmentLinkOpener: () => vi.fn() }))
vi.mock('../components/workspace/MobileEditorBlocks', () => ({ MobileEditorBlocks: () => null }))
vi.mock('../components/workspace/MobileFilePreview', () => ({ MobileFilePreview: () => null }))
vi.mock('../components/workspace/MobileWysiwygMarkdownEditor', () => ({ MobileWysiwygMarkdownEditor: () => null }))
vi.mock('../components/workspace/MobileMarkdownSourceEditor', () => ({
  MobileMarkdownSourceEditor: ({ note }: { note: MobileNote }) => createElement('div', { 'data-source-note': note.id }),
}))
vi.mock('./TabletEditorPanelChrome', () => ({ EmptyEditorPanel: () => null, MobileFilePreviewFallback: () => null,
  MobileNoteReadFallback: () => null, MobileSpreadsheetFallback: () => null }))

let root: ReturnType<typeof createRoot> | undefined
beforeEach(() => vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true))
afterEach(async () => { await act(async () => root?.unmount()); vi.unstubAllGlobals() })

it('keeps the same raw-mode control through note selection and completes its press on the new note', async () => {
  const harness = createHarness()
  await harness.select(0)
  const original = harness.button('editor-source-action')
  await harness.select(1)
  const current = harness.button('editor-source-action')
  expect(current).toBe(original)
  await act(async () => current.click())
  expect(harness.host.querySelector('[data-source-note]')?.getAttribute('data-source-note')).toBe(harness.notes[1].id)
})

it('closes filename editing on note selection without resuming the abandoned edit when returning', async () => {
  const harness = createHarness()
  await harness.select(0)
  await act(async () => harness.button('editor-filename-action').click())
  expect(harness.host.querySelector('[data-testid="editor-filename-input"]')).not.toBeNull()
  await harness.select(1)
  expect(harness.host.querySelector('[data-testid="editor-filename-input"]')).toBeNull()
  await harness.select(0)
  expect(harness.host.querySelector('[data-testid="editor-filename-input"]')).toBeNull()
  expect(harness.button('editor-source-action')).toBeTruthy()
})

it('cancels filename editing and allows a fresh edit on the same note', async () => {
  const harness = createHarness()
  await harness.select(0)
  await act(async () => harness.button('editor-filename-action').click())
  await act(async () => harness.button('editor-filename-cancel').click())
  expect(harness.host.querySelector('[data-testid="editor-filename-input"]')).toBeNull()
  expect(harness.button('editor-source-action')).toBeTruthy()
  await act(async () => harness.button('editor-filename-action').click())
  expect(harness.host.querySelector('[data-testid="editor-filename-input"]')).not.toBeNull()
})

function createHarness() {
  const host = document.createElement('div')
  root = createRoot(host)
  const notes = workspaceScenarioForId('default').notes.slice(0, 2)
  return { host, notes,
    button: (testID: string) => {
      const button = host.querySelector<HTMLButtonElement>(`[data-testid="${testID}"]`)
      if (!button) throw new Error(`Missing ${testID}`)
      return button
    },
    select: (index: number) => act(async () => {
      root?.render(createElement(TabletEditorPanel, { blocks: [], bullets: [], compact: false, notes,
        note: notes[index], onUpdateContent: vi.fn(), onToggleFavorite: vi.fn(), onOpenMoreActions: vi.fn(), onNavigateWikilink: vi.fn(),
        renameFilename: { value: 'renamed.md', notes, onChange: vi.fn(), onSubmit: vi.fn() } }))
    }),
  }
}
