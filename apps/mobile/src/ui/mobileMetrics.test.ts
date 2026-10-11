import { describe, expect, it } from 'vitest'
import { desktopEditorParity, desktopNoteItemParity, desktopPanelParity, desktopSidebarParity } from './desktopParity'
import { mobileMetrics } from './mobileMetrics'

describe('explicit mobile UI density', () => {
  it('retains canonical desktop metrics at 100 percent', () => {
    expect(mobileMetrics[1].sidebar).toEqual(desktopSidebarParity)
    expect(mobileMetrics[1].noteItem).toEqual(desktopNoteItemParity)
    expect(mobileMetrics[1].editor).toEqual(desktopEditorParity)
  })

  it('scales typography and spacing together at 110 percent', () => {
    const metrics = mobileMetrics[1.1]
    expect(metrics.sidebar.itemTextSize).toBe(14.3)
    expect(metrics.sidebar.itemLabelLineHeight).toBe(19.8)
    expect(metrics.sidebar.itemPadding.withCount.top).toBe(6.6)
    expect(metrics.sidebar.countPillHeight).toBe(22)
    expect(metrics.noteItem.padding.left).toBe(17.6)
    expect(metrics.noteItem.snippetLineHeight).toBe(19.8)
    expect(metrics.editor.bodyFontSize).toBe(16.5)
    expect(metrics.editor.bodyLineHeight).toBe(25.3)
  })

  it('keeps pane geometry, corner radii, strokes and opacity unchanged', () => {
    const metrics = mobileMetrics[1.1]
    expect(metrics.panel.sidebarWidth).toBe(desktopPanelParity.sidebarWidth)
    expect(metrics.panel.noteListWidth).toBe(desktopPanelParity.noteListWidth)
    expect(metrics.panel.inspectorWidth).toBe(desktopPanelParity.inspectorWidth)
    expect(metrics.sidebar.countPillRadius).toBe(999)
    expect(metrics.noteItem.borderLeftWidth).toBe(3)
    expect(metrics.editor.horizontalRuleThickness).toBe(1)
    expect(metrics.toolbarAction.pressedOpacity).toBe(0.7)
  })

  it('does not mutate desktop tokens and has stable shared identities', () => {
    expect(desktopSidebarParity.itemTextSize).toBe(13)
    expect(desktopNoteItemParity.padding.left).toBe(16)
    expect(mobileMetrics[1.1]).toBe(mobileMetrics[1.1])
    expect(mobileMetrics[1.1].size(44)).toBe(48.4)
  })
})
