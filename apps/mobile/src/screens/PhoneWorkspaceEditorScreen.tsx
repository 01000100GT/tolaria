import { useCallback, type ReactNode } from 'react'
import { Info } from 'phosphor-react-native'
import { View } from 'react-native'
import { probeProps } from '../qa/mobileLayoutProbe'
import { mobileText } from '../i18n/mobileText'
import { MobileIconButton } from '../ui/MobileIconButton'
import { useMobileStyles } from '../ui/theme/useMobileTheme'
import { useHorizontalSwipe } from '../ui/useHorizontalSwipe'
import { mobileNoteIdForWikilinkTarget } from '../workspace/mobileWikilinks'
import type { RegisterMobileEditorCommands } from '../workspace/mobileEditorCommands'
import type { MobileNote } from '../workspace/mobileWorkspaceModel'
import { TabletEditorPanel } from './TabletEditorPanel'
import type { PhoneWorkspaceEditorOptions } from './phoneWorkspaceEditorOptions'
import { PhoneBackButton, PhoneCommandPaletteButton, PhoneTopBar } from './PhoneWorkspaceChrome'
import { createThemeStyles } from './phoneWorkspaceStyles'
import { phoneSwipePreviewHandlers, usePhonePanelDragSurface, type PhoneWorkspaceStateViewProps, type PhoneWorkspaceController, type PhoneTableOfContentsTargetRequest } from './phoneWorkspaceScreenSupport'

export function PhoneEditorScreen(props: PhoneWorkspaceStateViewProps) {
  const {
    controller,
    options,
    openList,
    openCommandPalette,
    openProperties,
    onRegisterEditorCommands,
    phoneLayoutProbe,
    phoneSwipePreview,
    sourceModeRequest,
    suggestionNotes,
    tableOfContentsTarget,
  } = props
  const { styles } = useMobileStyles(createThemeStyles)
  const commitList = useCallback(
    () => phoneSwipePreview.commit('list', openList),
    [openList, phoneSwipePreview],
  )
  const commitProperties = useCallback(
    () => phoneSwipePreview.commit('properties', openProperties),
    [openProperties, phoneSwipePreview],
  )
  const swipeHandlers = useHorizontalSwipe({
    ...phoneSwipePreviewHandlers(phoneSwipePreview),
    canStart: usePhonePanelDragSurface('editor'),
    onSwipeLeft: commitProperties,
    onSwipeRight: commitList,
  })
  const handleNavigateWikilink = usePhoneWikilinkNavigation({ controller, suggestionNotes })

  return (
    <View {...swipeHandlers} {...probeProps(phoneLayoutProbe, 'phone.editor.screen')} style={styles.screen} testID="phone-editor-screen">
      {!controller.selectedNote && <PhoneTopBar title="" onBack={openList} />}
      <PhoneEditorBody
        controller={controller}
        leading={<PhoneBackButton onBack={openList} />}
        trailing={<PhoneEditorActions onOpenCommandPalette={openCommandPalette} onOpenProperties={openProperties} />}
        notes={suggestionNotes}
        onNavigateWikilink={handleNavigateWikilink}
        onRegisterEditorCommands={onRegisterEditorCommands}
        options={options}
        sourceModeRequest={sourceModeRequest}
        tableOfContentsTarget={tableOfContentsTarget}
      />
    </View>
  )
}

type PhoneEditorActionsProps = {
  onOpenCommandPalette: () => void
  onOpenProperties: () => void
}

function PhoneEditorActions({
  onOpenCommandPalette,
  onOpenProperties,
}: PhoneEditorActionsProps) {
  const { mobileColors } = useMobileStyles(createThemeStyles)
  return (
    <>
      <MobileIconButton
        accessibilityLabel={mobileText('inspector.title.properties')}
        testID="phone-properties-action"
        onPress={onOpenProperties}
      >
        <Info color={mobileColors.textMuted} size={18} />
      </MobileIconButton>
      <PhoneCommandPaletteButton onPress={onOpenCommandPalette} />
    </>
  )
}

type PhoneEditorBodyProps = {
  controller: PhoneWorkspaceController
  leading?: ReactNode
  trailing?: ReactNode
  notes: MobileNote[]
  onNavigateWikilink: (target: string) => void
  onRegisterEditorCommands?: RegisterMobileEditorCommands
  options: PhoneWorkspaceEditorOptions
  sourceModeRequest: number
  tableOfContentsTarget: PhoneTableOfContentsTargetRequest | null
}

function PhoneEditorBody(props: PhoneEditorBodyProps) {
  const {
    controller,
    leading,
    trailing,
    notes,
    onNavigateWikilink,
    onRegisterEditorCommands,
    options,
    sourceModeRequest,
    tableOfContentsTarget,
  } = props
  const sourceModeRequested = sourceModeRequest > 0

  return (
    <TabletEditorPanel
      key={`phone-editor-${controller.selectedNote?.id ?? 'none'}-${sourceModeRequest}`}
      blocks={controller.editorBlocks}
      bullets={controller.editorBullets}
      compact
      leading={leading}
      trailing={trailing}
      initialEditing={sourceModeRequested || options.initialEditorEditing}
      initialEditingMode={sourceModeRequested ? 'source' : options.initialEditorEditingMode}
      layoutProbe={options.layoutProbe}
      note={controller.selectedNote}
      noteRead={controller.selectedNoteRead}
      notes={notes}
      onNavigateWikilink={onNavigateWikilink}
      onOpenMoreActions={controller.onOpenMoreActions}
      onRegisterEditorCommands={onRegisterEditorCommands}
      onToggleFavorite={controller.onToggleFavorite}
      onUpdateContent={controller.onUpdateNoteContent}
      sourceIdleSave={options.sourceIdleSave}
      sourceSelectionProbe={options.sourceSelectionProbe}
      tableOfContentsTarget={tableOfContentsTarget}
      typeDefinitions={controller.snapshot.typeDefinitions}
      vaultRootUri={controller.vaultRootUri}
      wysiwygAutocompleteProbe={options.wysiwygAutocompleteProbe}
      wysiwygExternalLinkProbe={options.wysiwygExternalLinkProbe}
      wysiwygFormatCommandProbe={options.wysiwygFormatCommandProbe}
      wysiwygInputTransformProbe={options.wysiwygInputTransformProbe}
      wysiwygMarkdownBlockProbe={options.wysiwygMarkdownBlockProbe}
      wysiwygMathEditProbe={options.wysiwygMathEditProbe}
      wysiwygTableCommandMutationProbe={options.wysiwygTableCommandMutationProbe}
      wysiwygWikilinkInsertProbe={options.wysiwygWikilinkInsertProbe}
      wysiwygMutationProbe={options.wysiwygMutationProbe}
    />
  )
}

type UsePhoneWikilinkNavigationProps = {
  controller: PhoneWorkspaceController
  suggestionNotes: MobileNote[]
}

function usePhoneWikilinkNavigation({
  controller,
  suggestionNotes,
}: UsePhoneWikilinkNavigationProps) {
  return useCallback((target: string) => {
    const noteId = mobileNoteIdForWikilinkTarget(suggestionNotes, target)
    if (!noteId) return

    controller.onSelectNote(noteId)
  }, [controller, suggestionNotes])
}
