import { useCallback, useEffect, useMemo, useState, type Dispatch, type SetStateAction } from 'react'
import { useWindowDimensions } from 'react-native'
import { useMobileLayoutProbe } from '../qa/mobileLayoutProbe'
import { useHorizontalSwipe } from '../ui/useHorizontalSwipe'
import { useMobileEditorCommandRegistry, useMobileEditorOverlayFocus } from '../workspace/mobileEditorCommands'
import { useMobileWorkspaceKeyboardShortcuts } from '../workspace/mobileWorkspaceKeyboardShortcuts'
import type { MobileNote, MobileWorkspaceSnapshot } from '../workspace/mobileWorkspaceModel'
import type { MobileTableOfContentsTarget } from '../workspace/mobileTableOfContents'
import { fixtureReadOnlyWorkspaceRepository, type ReadOnlyWorkspaceRepository, type ReadOnlyWorkspaceRequest } from '../workspace/readOnlyWorkspaceRepository'
import { MobileCommandPalette } from '../components/workspace/MobileCommandPalette'
import { buildMobileCommandPaletteCommands } from '../workspace/mobileCommandPalette'
import { logNativeMobileCommandPaletteProof } from '../qa/nativeMobileCommandPaletteProbe'
import { logNativeMobileKeyboardShortcutActionProof, logNativeMobileKeyboardShortcutBridgeProof } from '../qa/nativeMobileKeyboardShortcutProof'
import type { EditorEditingMode } from './TabletEditorPanel'
import { PhoneWorkspaceRoot } from './PhoneWorkspaceLayout'
import { PhoneWorkspaceDragPreview } from './PhoneWorkspaceScreens'
import { usePhoneDragPreview } from './usePhoneDragPreview'
import { phoneWorkspaceEditorOptions } from './phoneWorkspaceEditorOptions'
import { usePhonePanelDragSurface, type PhoneWorkspaceController, type PhoneSwipePreview, type PhoneTableOfContentsTargetRequest } from './phoneWorkspaceScreenSupport'
import { useTabletWorkspaceController } from './useTabletWorkspaceController'
import { useInitialActionSheetQaTarget } from './useInitialActionSheetQaTarget'
import type { MobileActionSheetQaTarget } from './tabletWorkspaceTypes'
import type { PhoneWorkspaceState } from './phoneWorkspaceTransitions'

export type { PhoneWorkspaceState } from './phoneWorkspaceTransitions'

type PhoneWorkspaceProps = {
  initialCommandPaletteOpen?: boolean
  initialEditorEditing?: boolean
  initialEditorEditingMode?: EditorEditingMode
  initialActionSheet?: MobileActionSheetQaTarget
  commandPaletteProbe?: boolean
  keyboardShortcutProbe?: boolean
  initialState?: PhoneWorkspaceState
  layoutProbe?: boolean
  onOpenNativeVault?: () => void
  repository?: ReadOnlyWorkspaceRepository
  repositoryRequest?: ReadOnlyWorkspaceRequest
  sourceIdleSave?: boolean
  sourceSelectionProbe?: boolean
  snapshot: MobileWorkspaceSnapshot
  wysiwygAutocompleteProbe?: boolean
  wysiwygExternalLinkProbe?: boolean
  wysiwygFormatCommandProbe?: boolean
  wysiwygInputTransformProbe?: boolean
  wysiwygMarkdownBlockProbe?: boolean
  wysiwygMathEditProbe?: boolean
  wysiwygTableCommandMutationProbe?: boolean
  wysiwygWikilinkInsertProbe?: boolean
  wysiwygMutationProbe?: boolean
}

type PhoneWorkspaceChromeProps = PhoneWorkspaceProps & {
  controller: PhoneWorkspaceController
}

type PhoneStateTransitionOptions = {
  gestureHandoff?: boolean
}

const phoneGestureHandoffOptions = { gestureHandoff: true } satisfies PhoneStateTransitionOptions

export function PhoneWorkspace(props: PhoneWorkspaceProps) {
  const { repository = fixtureReadOnlyWorkspaceRepository, repositoryRequest, snapshot } = props
  const controller = useTabletWorkspaceController({ repository, repositoryRequest, snapshot })
  const onOpenCreateNote = controller.snapshot.sync.kind === 'noVault' || controller.snapshot.sync.kind === 'readOnly'
    ? props.onOpenNativeVault ?? controller.onOpenCreateNote
    : controller.onOpenCreateNote
  useInitialActionSheetQaTarget(controller.onOpenActionSheetQaTarget, props.initialActionSheet)
  return <PhoneWorkspaceChrome {...props} controller={{ ...controller, onOpenCreateNote }} />
}

function PhoneWorkspaceChrome(props: PhoneWorkspaceChromeProps) {
  const {
    commandPaletteProbe = false,
    controller: baseController,
    initialState = 'list',
    keyboardShortcutProbe = false,
    onOpenNativeVault,
  } = props
  const options = phoneWorkspaceEditorOptions(props)
  const { clearGestureHandoff, gestureHandoffState, phoneState, previousPhoneState, setPhoneState } = usePhoneState(initialState)
  const createAndOpenNote = useCallback(() => {
    baseController.onOpenCreateNote()
    if (baseController.snapshot.sync.kind !== 'noVault' && baseController.snapshot.sync.kind !== 'readOnly') {
      setPhoneState('editor')
    }
  }, [baseController, setPhoneState])
  const controller = useMemo(
    () => ({ ...baseController, onOpenCreateNote: createAndOpenNote }),
    [baseController, createAndOpenNote],
  )
  const [sourceModeRequest, setSourceModeRequest] = useState(0)
  const { width } = useWindowDimensions()
  const dragPreview = usePhoneDragPreview(phoneState, width, clearGestureHandoff)
  const editorCommandRegistry = useMobileEditorCommandRegistry()
  const tableOfContents = usePhoneTableOfContentsTarget(setPhoneState)
  const phoneLayoutProbe = useMobileLayoutProbe(options.layoutProbe)
  const navigation = usePhoneWorkspaceNavigation({ controller, setPhoneState, setSourceModeRequest })
  const selectNextNote = useCallback(() => selectAdjacentVisiblePhoneNote(controller.notes, controller.selectedNoteId, controller.onSelectNote, 1), [controller])
  const selectPreviousNote = useCallback(() => selectAdjacentVisiblePhoneNote(controller.notes, controller.selectedNoteId, controller.onSelectNote, -1), [controller])
  const commandPalette = usePhoneCommandPalette({
    controller,
    initialOpen: props.initialCommandPaletteOpen,
    onOpenNativeVault,
    onPastePlainText: editorCommandRegistry.commands.pastePlainText,
    onSaveActiveEditor: editorCommandRegistry.commands.save,
    onToggleRawEditor: editorCommandRegistry.commands.toggleRawEditor,
    openEditor: navigation.openEditor,
    openList: navigation.openList,
    openNeighborhoodList: navigation.openNeighborhoodList,
    openProperties: navigation.openProperties,
    openSidebar: navigation.openSidebar,
    phoneState,
  })
  useMobileEditorOverlayFocus(phoneState !== 'editor' || Boolean(controller.openAction) || commandPalette.visible, editorCommandRegistry.commands)
  useMobileWorkspaceKeyboardShortcuts({
    nativeNoteNavigationEnabled: phoneState === 'list' && !commandPalette.visible && !controller.openAction,
    onCreateNote: controller.onOpenCreateNote,
    onOpenFindInNote: controller.onOpenFindInNote,
    onOpenCommandPalette: commandPalette.open,
    onOpenSearch: controller.onOpenSearch,
    onSelectNextNote: selectNextNote,
    onSelectPreviousNote: selectPreviousNote,
    onShortcutAction: keyboardShortcutProbe ? logNativeMobileKeyboardShortcutActionProof : undefined,
    onToggleRawEditor: editorCommandRegistry.commands.toggleRawEditor,
  })
  usePhoneCommandPaletteProof(commandPalette.commands, commandPaletteProbe)
  usePhoneKeyboardShortcutBridgeProof(keyboardShortcutProbe)
  const createRelationshipTargetAndOpenEditor = useCreateRelationshipTargetAndOpenEditor(controller, setPhoneState)
  const transitionSwipeHandlers = usePhoneSwipeHandlers({
    openEditor: navigation.openEditor,
    openList: navigation.openList,
    openProperties: navigation.openProperties,
    openSidebar: navigation.openSidebar,
    phoneState,
    phoneSwipePreview: dragPreview,
  })
  const suggestionNotes = controller.snapshot.allNotes ?? controller.snapshot.notes
  const preview = <PhoneWorkspaceDragPreview {...{
    controller,
    dragPreview,
    options,
    openEditor: navigation.openEditor,
    openSourceEditor: navigation.openSourceEditor,
    openCommandPalette: commandPalette.open,
    openList: navigation.openList,
    openProperties: navigation.openProperties,
    openSidebar: navigation.openSidebar,
    suggestionNotes,
    sourceModeRequest,
  }} />

  return (
    <PhoneWorkspaceRoot
      commandPaletteElement={commandPalette.element}
      controller={controller}
      createRelationshipTargetAndOpenEditor={createRelationshipTargetAndOpenEditor}
      dragPreview={dragPreview}
      editorCommandRegistry={editorCommandRegistry}
      navigation={navigation}
      openCommandPalette={commandPalette.open}
      options={options}
      phoneLayoutProbe={phoneLayoutProbe.probe}
      phoneState={phoneState}
      gestureHandoffState={gestureHandoffState}
      previousPhoneState={previousPhoneState}
      preview={preview}
      selectTableOfContentsTarget={tableOfContents.select}
      sourceModeRequest={sourceModeRequest}
      suggestionNotes={suggestionNotes}
      tableOfContentsTarget={tableOfContents.target}
      transitionSwipeHandlers={transitionSwipeHandlers}
      onOpenNativeVault={onOpenNativeVault}
    />
  )
}

export type PhoneWorkspaceNavigation = ReturnType<typeof usePhoneWorkspaceNavigation>

function selectAdjacentVisiblePhoneNote(
  notes: MobileNote[],
  selectedNoteId: string | null,
  onSelectNote: (noteId: string) => void,
  direction: -1 | 1,
) {
  if (notes.length === 0) return
  const currentIndex = Math.max(0, notes.findIndex((note) => note.id === selectedNoteId))
  const nextIndex = Math.max(0, Math.min(notes.length - 1, currentIndex + direction))
  const noteId = notes[nextIndex]?.id
  if (noteId) onSelectNote(noteId)
}

type UsePhoneWorkspaceNavigationProps = {
  controller: PhoneWorkspaceController
  setPhoneState: (nextState: PhoneWorkspaceState, options?: PhoneStateTransitionOptions) => void
  setSourceModeRequest: Dispatch<SetStateAction<number>>
}

function usePhoneWorkspaceNavigation({
  controller,
  setPhoneState,
  setSourceModeRequest,
}: UsePhoneWorkspaceNavigationProps) {
  const openList = useCallback((options?: PhoneStateTransitionOptions) => setPhoneState('list', options), [setPhoneState])
  const openSidebar = useCallback((options?: PhoneStateTransitionOptions) => setPhoneState('sidebar', options), [setPhoneState])
  const openProperties = useCallback((options?: PhoneStateTransitionOptions) => setPhoneState('properties', options), [setPhoneState])
  const openEditor = useCallback((noteIdOrOptions?: string | PhoneStateTransitionOptions, options?: PhoneStateTransitionOptions) => {
    if (typeof noteIdOrOptions === 'string') {
      controller.onSelectNote(noteIdOrOptions)
      setPhoneState('editor', options)
      return
    }

    setPhoneState('editor', noteIdOrOptions)
  }, [controller, setPhoneState])
  const openSourceEditor = useCallback(() => {
    setSourceModeRequest((current) => current + 1)
    setPhoneState('editor')
  }, [setPhoneState, setSourceModeRequest])
  const openNeighborhoodList = useCallback((noteId: string) => {
    controller.onEnterNeighborhood(noteId)
    setPhoneState('list')
  }, [controller, setPhoneState])

  return {
    openEditor,
    openList,
    openNeighborhoodList,
    openProperties,
    openSidebar,
    openSourceEditor,
  }
}

function usePhoneCommandPaletteProof(commands: ReturnType<typeof buildMobileCommandPaletteCommands>, enabled: boolean) {
  useEffect(() => {
    if (enabled) logNativeMobileCommandPaletteProof(commands)
  }, [commands, enabled])
}

function usePhoneKeyboardShortcutBridgeProof(enabled: boolean) {
  useEffect(() => {
    if (enabled) logNativeMobileKeyboardShortcutBridgeProof()
  }, [enabled])
}

function useCreateRelationshipTargetAndOpenEditor(
  controller: PhoneWorkspaceController,
  setPhoneState: (nextState: PhoneWorkspaceState, options?: PhoneStateTransitionOptions) => void,
) {
  return useCallback(() => {
    controller.onCreateRelationshipTarget()
    setPhoneState('editor')
  }, [controller, setPhoneState])
}

function usePhoneTableOfContentsTarget(setPhoneState: (nextState: PhoneWorkspaceState, options?: PhoneStateTransitionOptions) => void) {
  const [target, setTarget] = useState<PhoneTableOfContentsTargetRequest | null>(null)
  const select = useCallback((nextTarget: MobileTableOfContentsTarget) => {
    setTarget((current) => ({
      ...nextTarget,
      requestId: (current?.requestId ?? 0) + 1,
    }))
    setPhoneState('editor')
  }, [setPhoneState])

  return { select, target }
}

type UsePhoneCommandPaletteProps = {
  controller: PhoneWorkspaceController
  initialOpen?: boolean
  onOpenNativeVault?: () => void
  onPastePlainText?: () => void
  onSaveActiveEditor?: () => void
  onToggleRawEditor?: () => void
  openEditor: (noteId?: string) => void
  openList: () => void
  openNeighborhoodList: (noteId: string) => void
  openProperties: () => void
  openSidebar: () => void
  phoneState: PhoneWorkspaceState
}

function usePhoneCommandPalette(props: UsePhoneCommandPaletteProps) {
  const {
    controller,
    initialOpen = false,
    onOpenNativeVault,
    onPastePlainText,
    onSaveActiveEditor,
    onToggleRawEditor,
    openEditor,
    openList,
    openNeighborhoodList,
    openProperties,
    openSidebar,
    phoneState,
  } = props
  const [visible, setVisible] = useState(initialOpen)
  const open = useCallback(() => setVisible(true), [])
  const close = useCallback(() => setVisible(false), [])
  const toggleProperties = useCallback(() => {
    if (phoneState === 'properties') openEditor()
    else openProperties()
  }, [openEditor, openProperties, phoneState])
  const commands = useMemo(() => buildMobileCommandPaletteCommands({
    ...controller,
    onOpenCommandPalette: open,
    onOpenBacklinks: openProperties,
    onOpenNativeVault,
    onEnterNeighborhood: openNeighborhoodList,
    onPastePlainText,
    onSaveActiveEditor,
    onToggleRawEditor,
    onToggleProperties: toggleProperties,
    onViewAll: openSidebar,
    onViewEditorList: openList,
    onViewEditorOnly: openEditor,
  }), [
    controller,
    onOpenNativeVault,
    open,
    onPastePlainText,
    onSaveActiveEditor,
    onToggleRawEditor,
    openEditor,
    openList,
    openNeighborhoodList,
    openProperties,
    openSidebar,
    toggleProperties,
  ])

  return {
    commands,
    element: visible ? <MobileCommandPalette commands={commands} onClose={close} /> : null,
    open,
    visible,
  }
}

function usePhoneState(initialState: PhoneWorkspaceState) {
  const [state, setState] = useState({
    current: initialState,
    gestureHandoff: null as PhoneWorkspaceState | null,
    previous: initialState,
  })
  const setPhoneState = useCallback((nextState: PhoneWorkspaceState, options?: PhoneStateTransitionOptions) => {
    setState((currentState) => {
      const gestureHandoff = options?.gestureHandoff ? nextState : null
      if (currentState.current === nextState) {
        if (currentState.gestureHandoff === gestureHandoff) return currentState
        return { ...currentState, gestureHandoff }
      }

      return { current: nextState, gestureHandoff, previous: currentState.current }
    })
  }, [])
  const clearGestureHandoff = useCallback(() => {
    setState((currentState) => {
      if (!currentState.gestureHandoff) return currentState
      return { ...currentState, gestureHandoff: null }
    })
  }, [])

  return {
    clearGestureHandoff,
    gestureHandoffState: state.gestureHandoff,
    phoneState: state.current,
    previousPhoneState: state.previous,
    setPhoneState,
  }
}

type UsePhoneSwipeHandlersProps = {
  openEditor: (options?: PhoneStateTransitionOptions) => void
  openList: (options?: PhoneStateTransitionOptions) => void
  openProperties: (options?: PhoneStateTransitionOptions) => void
  openSidebar: (options?: PhoneStateTransitionOptions) => void
  phoneState: PhoneWorkspaceState
  phoneSwipePreview: PhoneSwipePreview
}

function usePhoneSwipeHandlers({
  openEditor,
  openList,
  openProperties,
  openSidebar,
  phoneState,
  phoneSwipePreview,
}: UsePhoneSwipeHandlersProps) {
  const canStart = usePhonePanelDragSurface(phoneState)
  const commitEditor = useCallback(() => phoneSwipePreview.commit('editor', () => openEditor(phoneGestureHandoffOptions)), [openEditor, phoneSwipePreview])
  const commitList = useCallback(() => phoneSwipePreview.commit('list', () => openList(phoneGestureHandoffOptions)), [openList, phoneSwipePreview])
  const commitProperties = useCallback(() => phoneSwipePreview.commit('properties', () => openProperties(phoneGestureHandoffOptions)), [openProperties, phoneSwipePreview])
  const commitSidebar = useCallback(() => phoneSwipePreview.commit('sidebar', () => openSidebar(phoneGestureHandoffOptions)), [openSidebar, phoneSwipePreview])
  const editorSwipe = useHorizontalSwipe({ canStart, onSwipeLeft: commitProperties, onSwipeRight: commitList })
  const listSwipe = useHorizontalSwipe({ canStart, onSwipeRight: commitSidebar })
  const propertiesSwipe = useHorizontalSwipe({ onSwipeRight: commitEditor })
  const sidebarSwipe = useHorizontalSwipe({ onSwipeLeft: commitList })

  if (phoneState === 'editor') return editorSwipe
  if (phoneState === 'properties') return propertiesSwipe
  if (phoneState === 'sidebar') return sidebarSwipe
  return listSwipe
}
