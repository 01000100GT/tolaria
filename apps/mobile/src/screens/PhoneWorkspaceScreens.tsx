import { useCallback, type ReactNode } from 'react'
import { List } from 'phosphor-react-native'
import { useWindowDimensions, View } from 'react-native'
import { MobileNoteListPanel } from '../components/workspace/MobileNoteListPanel'
import { MobilePropertiesPanel } from '../components/workspace/MobilePropertiesPanel'
import { MobileWorkspaceSidebar } from '../components/workspace/MobileWorkspaceSidebar'
import { mobileText } from '../i18n/mobileText'
import { probeProps, type MobileLayoutProbe } from '../qa/mobileLayoutProbe'
import { MobileIconButton } from '../ui/MobileIconButton'
import { useMobileStyles } from '../ui/theme/useMobileTheme'
import { useHorizontalSwipe } from '../ui/useHorizontalSwipe'
import type { MobileNote } from '../workspace/mobileWorkspaceModel'
import { mobileWorkspaceHasNoVault } from '../workspace/mobileWorkspaceEmptyState'
import { PhoneScreenLayer } from './PhoneScreenLayer'
import { PhoneEditorScreen } from './PhoneWorkspaceEditorScreen'
import { PhoneCommandPaletteButton, PhoneTopBar } from './PhoneWorkspaceChrome'
import { createThemeStyles } from './phoneWorkspaceStyles'
import { phoneSwipePreviewHandlers, usePhonePanelDragSurface, type PhoneWorkspaceStateViewProps, type PhoneWorkspaceController, type PhoneSwipePreview } from './phoneWorkspaceScreenSupport'
import { phoneWorkspaceSidebarDrawerWidth } from './phoneWorkspaceTransitions'
import type { PhoneWorkspaceEditorOptions } from './phoneWorkspaceEditorOptions'
import { useMobileInspectorReferenceGroups } from './useMobileInspectorReferenceGroups'

type PhoneWorkspaceDragPreviewProps = {
  controller: PhoneWorkspaceController
  dragPreview: PhoneSwipePreview
  options: PhoneWorkspaceEditorOptions
  openEditor: (noteId?: string) => void
  openSourceEditor: () => void
  openCommandPalette: () => void
  openList: () => void
  openProperties: () => void
  openSidebar: () => void
  suggestionNotes: MobileNote[]
  sourceModeRequest: number
}

export function PhoneWorkspaceDragPreview(props: PhoneWorkspaceDragPreviewProps): ReactNode {
  const {
    controller,
    dragPreview,
    options,
    openEditor,
    openSourceEditor,
    openCommandPalette,
    openList,
    openProperties,
    openSidebar,
    suggestionNotes,
    sourceModeRequest,
  } = props
  if (!dragPreview.previewState) return null

  return (
    <PhoneWorkspaceStateView
      controller={controller}
      options={phoneWorkspacePreviewOptions(options)}
      openEditor={openEditor}
      openSourceEditor={openSourceEditor}
      openCommandPalette={openCommandPalette}
      openList={openList}
      openProperties={openProperties}
      openSidebar={openSidebar}
      phoneLayoutProbe={disabledPhoneLayoutProbe}
      phoneState={dragPreview.previewState}
      phoneSwipePreview={dragPreview}
      sourceModeRequest={sourceModeRequest}
      suggestionNotes={suggestionNotes}
      tableOfContentsTarget={null}
    />
  )
}

function phoneWorkspacePreviewOptions(options: PhoneWorkspaceEditorOptions): PhoneWorkspaceEditorOptions {
  return {
    ...options,
    layoutProbe: false,
    sourceSelectionProbe: false,
    wysiwygAutocompleteProbe: false,
    wysiwygExternalLinkProbe: false,
    wysiwygFormatCommandProbe: false,
    wysiwygInputTransformProbe: false,
    wysiwygMarkdownBlockProbe: false,
    wysiwygMathEditProbe: false,
    wysiwygMutationProbe: false,
    wysiwygTableCommandMutationProbe: false,
    wysiwygWikilinkInsertProbe: false,
  }
}

const disabledPhoneLayoutProbe: MobileLayoutProbe = () => ({})

export function PhoneWorkspaceScreens(props: PhoneWorkspaceStateViewProps) {
  return (
    <>
      <PhoneScreenLayer active={props.phoneState === 'list'} retain>
        <PhoneNoteListScreen {...props} />
      </PhoneScreenLayer>
      <PhoneScreenLayer active={props.phoneState === 'editor'} retain>
        <PhoneEditorScreen {...props} />
      </PhoneScreenLayer>
      <PhoneScreenLayer active={props.phoneState === 'sidebar'}>
        <PhoneSidebarDrawer {...props} />
      </PhoneScreenLayer>
      <PhoneScreenLayer active={props.phoneState === 'properties'}>
        <PhonePropertiesScreen {...props} />
      </PhoneScreenLayer>
    </>
  )
}

function PhoneWorkspaceStateView(props: PhoneWorkspaceStateViewProps) {
  if (props.phoneState === 'sidebar') return <PhoneSidebarDrawer {...props} />
  if (props.phoneState === 'properties') return <PhonePropertiesScreen {...props} />
  if (props.phoneState === 'editor' && props.controller.selectedNote) return <PhoneEditorScreen {...props} />
  return <PhoneNoteListScreen {...props} />
}

function PhoneNoteListScreen({
  controller,
  options,
  openCommandPalette,
  openEditor,
  openSidebar,
  phoneLayoutProbe,
  phoneSwipePreview,
}: PhoneWorkspaceStateViewProps) {
  const { styles, mobileColors } = useMobileStyles(createThemeStyles)
  const commitSidebar = useCallback(
    () => phoneSwipePreview.commit('sidebar', openSidebar),
    [openSidebar, phoneSwipePreview],
  )
  const swipeHandlers = useHorizontalSwipe({
    ...phoneSwipePreviewHandlers(phoneSwipePreview),
    canStart: usePhonePanelDragSurface('list'),
    onSwipeRight: commitSidebar,
  })

  return (
    <View {...swipeHandlers} {...probeProps(phoneLayoutProbe, 'phone.list.screen')} style={styles.screen} testID="phone-note-list-screen">
      <MobileNoteListPanel
        compact
        onToggleNoteFavorite={controller.onToggleNoteFavorite}
        bulkActions={{
          onArchive: controller.onBulkArchiveNotes,
          onDelete: controller.onBulkDeleteNotes,
          onOrganize: controller.onBulkOrganizeNotes,
        }}
        displayPropertyKeys={controller.noteListProperties}
        emptyVault={mobileWorkspaceHasNoVault(controller.snapshot)}
        fullWidth
        layoutProbe={options.layoutProbe}
        leading={(
          <View style={styles.leadingActions}>
            <MobileIconButton accessibilityLabel={mobileText('sidebar.action.expand')} testID="phone-sidebar-action" onPress={openSidebar}>
              <List color={mobileColors.textMuted} size={18} />
            </MobileIconButton>
            <PhoneCommandPaletteButton onPress={openCommandPalette} />
          </View>
        )}
        neighborhood={controller.noteListNeighborhood}
        noteListFilter={controller.noteListFilter}
        noteListFilterCounts={controller.noteListFilterCounts}
        noteListFilterVisible={controller.noteListFilterVisible}
        notes={controller.notes}
        propertyDisplayModes={controller.snapshot.vaultConfig?.propertyDisplayModes}
        searchQuery={controller.searchQuery || undefined}
        selectedNoteId={controller.selectedNoteId}
        subtitle={controller.noteListSubtitle}
        title={controller.noteListTitle}
        typeDefinitions={controller.snapshot.typeDefinitions}
        onOpenCreateNote={controller.onOpenCreateNote}
        onOpenSearch={controller.onOpenSearch}
        onOpenVault={controller.onOpenCreateNote}
        onNoteListFilterChange={controller.onNoteListFilterChange}
        onSelectNote={openEditor}
      />
    </View>
  )
}

function PhoneSidebarDrawer({
  controller,
  options,
  openCommandPalette,
  openEditor,
  openList,
  phoneLayoutProbe,
  phoneSwipePreview,
}: PhoneWorkspaceStateViewProps) {
  const { styles } = useMobileStyles(createThemeStyles)
  const { width } = useWindowDimensions()
  const drawerWidth = phoneWorkspaceSidebarDrawerWidth(width)
  const commitList = useCallback(
    () => phoneSwipePreview.commit('list', openList),
    [openList, phoneSwipePreview],
  )
  const swipeHandlers = useHorizontalSwipe({
    ...phoneSwipePreviewHandlers(phoneSwipePreview),
    onSwipeLeft: commitList,
  })
  const selectFolder = useSelectAndOpenList(controller.onSelectFolder, openList)
  const selectItem = useSelectAndOpenList(controller.onSelectSidebarItem, openList)

  return (
    <View {...swipeHandlers} {...probeProps(phoneLayoutProbe, 'phone.sidebar.screen')} style={styles.drawerRoot} testID="phone-sidebar-screen">
      <View
        {...probeProps(phoneLayoutProbe, 'phone.sidebar.preview')}
        pointerEvents="none"
        style={[styles.drawerPreview, { left: drawerWidth, width }]}
      >
        <MobileNoteListPanel
          compact
          displayPropertyKeys={controller.noteListProperties}
          fullWidth
          layoutProbe={options.layoutProbe}
          neighborhood={controller.noteListNeighborhood}
          notes={controller.notes}
          propertyDisplayModes={controller.snapshot.vaultConfig?.propertyDisplayModes}
          selectedNoteId={controller.selectedNoteId}
          subtitle={controller.noteListSubtitle}
          title={controller.noteListTitle}
          typeDefinitions={controller.snapshot.typeDefinitions}
          onOpenCreateNote={controller.onOpenCreateNote}
          onOpenSearch={controller.onOpenSearch}
          onSelectNote={openEditor}
        />
      </View>
      <View {...probeProps(phoneLayoutProbe, 'phone.sidebar.drawer')} style={[styles.drawerPanel, { width: drawerWidth }]}>
        <MobileWorkspaceSidebar
          fullWidth
          activeFolderId={controller.activeFolderId}
          activeItemId={controller.activeItemId}
          layoutProbe={options.layoutProbe}
          sections={controller.snapshot.sidebarSections}
          title={controller.snapshot.source?.label}
          onCreateFolder={controller.onOpenCreateFolder}
          onCreateType={controller.onOpenCreateType}
          onCreateView={controller.onOpenCreateView}
          onOpenFolderActions={controller.onOpenFolderActions}
          onOpenFavoriteActions={controller.onOpenFavoriteActions}
          onOpenPrimaryActions={controller.onOpenPrimaryActions}
          onOpenTypeActions={controller.onOpenTypeActions}
          onOpenTypeVisibility={controller.onOpenTypeVisibility}
          onOpenViewActions={controller.onOpenViewActions}
          onSelectFolder={selectFolder}
          onSelectItem={selectItem}
          onOpenCommandPalette={openCommandPalette}
        />
      </View>
    </View>
  )
}

function PhonePropertiesScreen({
  controller,
  options,
  openEditor,
  openSourceEditor,
  openCommandPalette,
  openList,
  phoneLayoutProbe,
  phoneSwipePreview,
}: PhoneWorkspaceStateViewProps) {
  const { styles } = useMobileStyles(createThemeStyles)
  const returnToEditor = useCallback(() => openEditor(), [openEditor])
  const commitEditor = useCallback(
    () => phoneSwipePreview.commit('editor', returnToEditor),
    [phoneSwipePreview, returnToEditor],
  )
  const enterNeighborhood = useCallback((noteId: string) => {
    controller.onEnterNeighborhood(noteId)
    openList()
  }, [controller, openList])
  const referenceGroups = useMobileInspectorReferenceGroups(controller.selectedNote, controller.snapshot)
  const swipeHandlers = useHorizontalSwipe({
    ...phoneSwipePreviewHandlers(phoneSwipePreview),
    onSwipeRight: commitEditor,
  })

  return (
    <View {...swipeHandlers} {...probeProps(phoneLayoutProbe, 'phone.properties.screen')} style={styles.screen} testID="phone-properties-screen">
      <PhoneTopBar title={mobileText('inspector.title.properties')} onBack={returnToEditor}>
        <PhoneCommandPaletteButton onPress={openCommandPalette} />
      </PhoneTopBar>
      <MobilePropertiesPanel
        compact
        fullWidth
        showToolbar={false}
        layoutProbe={options.layoutProbe}
        note={controller.selectedNote}
        typeDefinitions={controller.snapshot.typeDefinitions}
        onAddProperty={controller.onAddProperty}
        onAddRelationship={controller.onAddRelationship}
        onDeleteProperty={controller.onDeleteProperty}
        onEditProperty={controller.onEditProperty}
        onEnterNeighborhood={enterNeighborhood}
        onFixInvalidFrontmatter={openSourceEditor}
        onInitializeProperties={controller.onInitializeProperties}
        onCreateMissingType={controller.onOpenCreateTypeWithName}
        onOpenChangeNoteType={controller.onOpenChangeNoteType}
        onRemoveRelationship={controller.onRemoveRelationship}
        propertyDisplayModes={controller.snapshot.vaultConfig?.propertyDisplayModes}
        referenceGroups={referenceGroups}
        onSelectNote={openEditor}
      />
    </View>
  )
}

function useSelectAndOpenList<Selection>(
  select: (selection: Selection) => void,
  openList: () => void,
) {
  return useCallback((selection: Selection) => {
    select(selection)
    openList()
  }, [select, openList])
}
