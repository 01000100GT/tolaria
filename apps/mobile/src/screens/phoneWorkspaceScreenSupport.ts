import { useCallback } from 'react'
import { useWindowDimensions } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import type { MobileLayoutProbe } from '../qa/mobileLayoutProbe'
import type { RegisterMobileEditorCommands } from '../workspace/mobileEditorCommands'
import type { MobileNote } from '../workspace/mobileWorkspaceModel'
import type { MobileTableOfContentsTarget } from '../workspace/mobileTableOfContents'
import { phonePanelDragSurface } from './phonePanelDragSurface'
import type { PhoneWorkspaceState } from './phoneWorkspaceTransitions'
import type { PhoneWorkspaceEditorOptions } from './phoneWorkspaceEditorOptions'
import type { usePhoneDragPreview } from './usePhoneDragPreview'
import type { useTabletWorkspaceController } from './useTabletWorkspaceController'

export type PhoneTableOfContentsTargetRequest = MobileTableOfContentsTarget & { requestId: number }

export function usePhonePanelDragSurface(state: PhoneWorkspaceState) {
  const { width } = useWindowDimensions()
  const { top, left, right } = useSafeAreaInsets()
  return useCallback((start: { x: number; y: number }) => (
    phonePanelDragSurface(state, { x: start.x - left, y: start.y }, width - left - right, top)
  ), [state, width, top, left, right])
}

export type PhoneWorkspaceController = ReturnType<typeof useTabletWorkspaceController>
export type PhoneSwipePreview = ReturnType<typeof usePhoneDragPreview>

export type PhoneWorkspaceStateViewProps = {
  controller: PhoneWorkspaceController
  options: PhoneWorkspaceEditorOptions
  openEditor: (noteId?: string) => void
  openSourceEditor: () => void
  openCommandPalette: () => void
  openList: () => void
  openProperties: () => void
  openSidebar: () => void
  phoneLayoutProbe: MobileLayoutProbe
  phoneState: PhoneWorkspaceState
  phoneSwipePreview: PhoneSwipePreview
  onRegisterEditorCommands?: RegisterMobileEditorCommands
  sourceModeRequest: number
  suggestionNotes: MobileNote[]
  tableOfContentsTarget: PhoneTableOfContentsTargetRequest | null
}

export function phoneSwipePreviewHandlers(phoneSwipePreview: PhoneSwipePreview) {
  return phoneSwipePreview.enabled
    ? {
      onSwipeEnd: phoneSwipePreview.onSwipeEnd,
      onSwipeProgress: phoneSwipePreview.onSwipeProgress,
    }
    : {}
}
