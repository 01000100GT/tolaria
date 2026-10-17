import { useMobileStyles } from '../../ui/theme/useMobileTheme'
import { useEffect, useRef, type ReactNode } from 'react'
import { useMobileModalDismiss } from '../../workspace/useMobileModalDismiss'
import { Keyboard, Platform, Pressable, ScrollView, StyleSheet, TextInput, View, useWindowDimensions, type LayoutChangeEvent, type NativeScrollEvent, type NativeSyntheticEvent } from 'react-native'
import { ArrowSquareOut, CheckCircle, ClipboardText, FilePlus, FolderOpen, Trash } from 'phosphor-react-native'
import { Text } from '../ui/text'
import { mobileText } from '../../i18n/mobileText'
import { MobileButton } from '../../ui/MobileButton'
import { MobileChip } from '../../ui/MobileChip'
import { MobilePanel, MobileToolbar, MobileToolbarSpacer, MobileToolbarTitle } from '../../ui/MobilePanel'
import { MobileTextInput } from '../../ui/MobileTextInput'
import { MobileKeyboardAvoidingView } from '../../ui/MobileKeyboardAvoidingView'
import { useMobileDeviceLayout } from '../../ui/useMobileDeviceLayout'
import { desktopToolbarActionParity } from '../../ui/desktopParity'
import type { MobileEditorBlock, MobileNote, MobileSidebarIcon, MobileTone, MobileTypeDefinitions, MobileViewFilterGroup } from '../../workspace/mobileWorkspaceModel'
import type {
  MobileTypeSchemaProperty,
  MobileTypeSchemaRelationship,
} from '../../workspace/mobileTypeDefinitionSchema'
import {
  canSubmitMobilePropertyValue,
  isMobileListPropertyKey,
  mobilePropertyValueKindForKey,
  type MobilePropertyValueKind,
} from '../../workspace/mobilePropertyValues'
import {
  validateMobileMoveNoteFolderPath,
  validateMobileRenameNoteFilePath,
  type MobileNotePathValidationStatus,
} from '../../workspace/mobileNotePaths'
import { mobileWikilinkTargetForNote } from '../../workspace/mobileWikilinks'
import {
  mobilePropertyKeySuggestions,
  mobilePropertyValueSuggestions,
  mobileFolderSuggestions,
  mobileRelationshipKeySuggestions,
  mobileRelationshipTargetSuggestions,
  mobileTypeSuggestions,
  shouldShowMobileRelationshipCreateTarget,
} from '../../workspace/mobileWorkspaceSuggestions'
import { MobileTypeIcon } from './MobileWorkspaceIcons'
import { MobileMetadataPicker } from './MobileMetadataPicker'
import { MobileSortPicker } from './MobileSortPicker'
import { MobilePropertyValueEditor } from './MobilePropertyValueEditor'
import { MobileTypeSectionEditor } from './MobileTypeSectionEditor'
import { MobileTypeVisibilityEditor } from './MobileTypeVisibilityEditor'
import { MobileViewDisplayPropertiesPicker } from './MobileViewDisplayPropertiesPicker'
import { MobileViewFilterBuilder } from './MobileViewFilterBuilder'
import { MobileEditorFindSheet } from './MobileEditorFindSheet'
import { MobileTableOfContentsSheet } from './MobileTableOfContentsSheet'
import type { MobileTableOfContentsTarget } from '../../workspace/mobileTableOfContents'
import { MoreActionsContent } from './MobileWorkspaceMoreActionsContent'
import { MobileFavoriteActions, MobileSavedViewActions, MobileTypeSectionActions } from './MobileWorkspaceMoveActions'
import { MobileWorkspaceSuggestionList } from './MobileWorkspaceSuggestionList'
import type { MobileWorkspaceSuggestionItem } from './MobileWorkspaceSuggestionListModel'
import { MobileQuickOpenSheet } from './MobileQuickOpenSheet'
import { chipTone } from './mobileWorkspaceTone'
import { createMobileWorkspaceSheetStyles as createThemeStyles } from './mobileWorkspaceActionSheetStyles'
import {
  mobileActionSheetLongFormHeight,
  mobileActionSheetUsesCompactForm,
  mobileFormScrollOffset,
  mobilePropertyDeleteActionVisible,
  mobileSingleTextFieldSubmitDisabled,
  mobileWorkspacePropertyActionTestIds,
  mobileWorkspaceRelationshipActionTestIds,
  mobileWorkspaceRelationshipTargetMaxSuggestions,
  mobileWorkspaceFormSheetAutoFocus,
  mobileWorkspaceFormSheetMaxSuggestions,
} from './MobileWorkspaceActionSheetModel'

export type MobileWorkspaceAction =
  | 'addProperty'
  | 'addRelationship'
  | 'changeNoteType'
  | 'createFolder'
  | 'createType'
  | 'createView'
  | 'editFolder'
  | 'editFavorite'
  | 'editProperty'
  | 'editPrimaryListProperties'
  | 'editTypeSection'
  | 'editTypeVisibility'
  | 'editView'
  | 'findInNote'
  | 'moreActions'
  | 'moveNoteToFolder'
  | 'renameNoteFile'
  | 'replaceInNote'
  | 'search'
  | 'setNoteIcon'
  | 'tableOfContents'

export type MobileWorkspaceActionSheetProps = {
  action: MobileWorkspaceAction
  allNotesShowImages: boolean
  allNotesShowPdfs: boolean
  allNotesShowUnsupported: boolean
  canMoveFavoriteDown: boolean
  canMoveFavoriteUp: boolean
  canMoveTypeDown: boolean
  canMoveTypeUp: boolean
  canMoveViewDown: boolean
  canMoveViewUp: boolean
  canRedoWorkspaceEdit: boolean
  canUndoWorkspaceEdit: boolean
  canDeleteType: boolean
  createTitle: string
  editorBlocks: MobileEditorBlock[]
  editorBullets: string[]
  filenameStem: string
  folderPaths?: string[]
  folderName: string
  folderPath: string
  notes: MobileNote[]
  noteIcon: string
  noteType: string
  primaryDisplayProperties: string[]
  primaryItemId: string
  primaryPropertyOptions: string[]
  primaryPropertyQuery: string
  onChangeNoteType: () => void
  onChangeNoteTypeInputChange: (value: string) => void
  onClose: () => void
  onCopyFolderPath: () => void
  onCreateFolder: () => void
  onCreateNote: (titleOverride?: string) => void
  onCreateRelationshipTarget: () => void
  onCreateTitleChange: (value: string) => void
  onCopyDeepLink: () => void
  onCopyFilePath: () => void
  onCreateType: () => void
  onCreateView: () => void
  onDeleteFolder: () => void
  onDeleteNote: () => void
  onDeleteProperty: (noteId: string, key: string) => void
  onEnterNeighborhood: (noteId: string) => void
  onExportNoteAsPdf: () => void
  onDeleteType: () => void
  onDeleteView: () => void
  onFilenameStemChange: (value: string) => void
  onFolderNameChange: (value: string) => void
  onFolderPathChange: (value: string) => void
  onMoveFavoriteDown: () => void
  onMoveFavoriteUp: () => void
  onMoveNoteToFolder: () => void
  onMoveTypeDown: () => void
  onMoveTypeUp: () => void
  onMoveViewDown: () => void
  onMoveViewUp: () => void
  onNoteIconChange: (value: string) => void
  onOpenChangeNoteType: () => void
  onOpenCreateChildFolder: () => void
  onOpenCreateNoteInFolder: () => void
  onOpenFileInDefaultApp: () => void
  onOpenFindInNote: () => void
  onOpenMoveNoteToFolder: () => void
  onOpenReplaceInNote: () => void
  onOpenRenameNoteFile: () => void
  onOpenSetNoteIcon: () => void
  onOpenTableOfContents: () => void
  onSelectTableOfContentsTarget?: (target: MobileTableOfContentsTarget) => void
  onPrimaryAllNotesShowImagesChange: (value: boolean) => void
  onPrimaryAllNotesShowPdfsChange: (value: boolean) => void
  onPrimaryAllNotesShowUnsupportedChange: (value: boolean) => void
  onPrimaryDisplayPropertiesChange: (value: string[]) => void
  onPrimaryPropertyQueryChange: (value: string) => void
  onPropertyNameChange: (value: string) => void
  onPropertyValueChange: (value: string) => void
  onPropertyValueKindChange: (value: MobilePropertyValueKind) => void
  onRelationshipNameChange: (value: string) => void
  onRelationshipNoteSelect: (title: string, ref: string) => void
  onRelationshipNoteTitleChange: (value: string) => void
  onSaveProperty: () => void
  onSavePrimaryNoteListProperties: () => void
  onSaveRelationship: () => void
  onSaveTypeDefinition: () => void
  onRenameFolder: () => void
  onRevealFolder: () => void
  onRevealFile: () => void
  onRenameNoteFile: () => void
  onRenameNoteFileToTitle: () => void
  onRedoWorkspaceEdit: () => void
  onRemoveNoteIcon: () => void
  onSaveView: () => void
  onSearchQueryChange: (value: string) => void
  onSelectNote: (noteId: string) => void
  onSetArchived: (archived: boolean) => void
  onSetNoteIcon: () => void
  onSetOrganized: (organized: boolean) => void
  onToggleFavorite: () => void
  onToggleNoteWidth: () => void
  onToggleTypeVisibility: (typeName: string) => void
  onUndoWorkspaceEdit: () => void
  onUpdateNoteContent: (noteId: string, content: string) => void
  onViewIconChange: (value: MobileSidebarIcon) => void
  onViewDisplayPropertiesChange: (value: string[]) => void
  onViewFiltersChange: (value: MobileViewFilterGroup) => void
  onViewNameChange: (value: string) => void
  onViewPropertyQueryChange: (value: string) => void
  onViewSortChange: (value: string) => void
  onViewToneChange: (value: MobileTone) => void
  propertyName: string
  propertyValue: string
  propertyValueKind: MobilePropertyValueKind
  relationshipName: string
  relationshipNoteTitle: string
  searchQuery: string
  selectedNote: MobileNote | null
  typeDisplayProperties: string[]
  typeDefinitions?: MobileTypeDefinitions
  typeName: string
  typePropertyOptions: string[]
  typePropertyQuery: string
  typeSortPropertyOptions: string[]
  typeRelationshipTargetOptions: MobileWorkspaceSuggestionItem[]
  typeSchemaProperties: MobileTypeSchemaProperty[]
  typeSchemaPropertyName: string
  typeSchemaPropertyNameOptions: string[]
  typeSchemaPropertyValue: string
  typeSchemaRelationships: MobileTypeSchemaRelationship[]
  typeSchemaRelationshipName: string
  typeSchemaRelationshipNameOptions: string[]
  typeSchemaRelationshipTarget: string
  typeSectionLabel: string
  typeRenameName: string
  typeSort: string
  typeTemplate: string
  typeIcon: string
  typeTone: string
  typeVisible: boolean
  viewDisplayProperties: string[]
  viewFilters: MobileViewFilterGroup
  viewIcon: string
  viewName: string
  viewPropertyOptions: string[]
  viewPropertyQuery: string
  viewSortPropertyOptions: string[]
  viewSort: string
  viewTone: string | null
  onTypeDisplayPropertiesChange: (value: string[]) => void
  onTypeNameChange: (value: string) => void
  onTypePropertyQueryChange: (value: string) => void
  onTypeSchemaPropertyAdd: () => void
  onTypeSchemaPropertyNameChange: (value: string) => void
  onTypeSchemaPropertyRemove: (index: number) => void
  onTypeSchemaPropertyValueChange: (value: string) => void
  onTypeSchemaRelationshipAdd: () => void
  onTypeSchemaRelationshipNameChange: (value: string) => void
  onTypeSchemaRelationshipRemove: (index: number) => void
  onTypeSchemaRelationshipTargetSelect: (title: string, ref: string) => void
  onTypeSchemaRelationshipTargetChange: (value: string) => void
  onTypeSectionLabelChange: (value: string) => void
  onTypeRenameNameChange: (value: string) => void
  onTypeSortChange: (value: string) => void
  onTypeTemplateChange: (value: string) => void
  onTypeIconChange: (value: MobileSidebarIcon) => void
  onTypeToneChange: (value: MobileTone) => void
  onTypeVisibleChange: (value: boolean) => void
}

type SingleTextFieldConfig = {
  allowEmptyInput?: boolean
  extraContent?: ReactNode
  inputLabel: string
  inputPlaceholder: string
  inputTestId: string
  inputValue: string
  onCancel: () => void
  onChangeText: (value: string) => void
  onSubmit: () => void
  submitLabel: string
  secondaryAction?: ReactNode
  submitDisabled?: boolean
}

type SuggestionInputActionConfig = {
  inputLabel: string
  inputPlaceholder: string
  inputTestId: string
  inputValue: string
  onCancel: () => void
  onChangeText: (value: string) => void
  onSubmit: () => void
  submitLabel: string
  submitDisabled?: boolean
  suggestionTestId: string
  suggestionTestIdPrefix: string
  suggestions: string[]
}
type RetargetNoteAction = 'changeType' | 'moveFolder'

export function MobileWorkspaceActionSheet(props: MobileWorkspaceActionSheetProps) {
  useMobileModalDismiss(props.onClose)
  const { styles, sheetStyles } = useMobileStyles(createThemeStyles)
  const phone = useMobileDeviceLayout() === 'phone'
  useEffect(() => {
    if (props.action !== 'search') Keyboard.dismiss()
  }, [props.action])
  const { height: windowHeight, width: windowWidth } = useWindowDimensions()
  const compactForm = mobileActionSheetUsesCompactForm({
    action: props.action, phone, width: windowWidth, height: windowHeight,
  })
  const longFormSheetHeight = mobileActionSheetLongFormHeight(windowHeight)
  const longFormSheetStyle = usesLongFormSheet(props.action) || compactForm
    ? { height: longFormSheetHeight, maxHeight: longFormSheetHeight }
    : null

  return (
    <MobileKeyboardAvoidingView style={styles.overlay} testID="workspace-action-sheet">
      <Pressable accessibilityLabel={mobileText('common.cancel')} style={styles.backdrop} testID="workspace-action-sheet-backdrop" onPress={props.onClose} />
      <View style={[styles.sheetContainer, phone && phoneSheetStyles.container]} pointerEvents="box-none">
        <MobilePanel
          accessibilityViewIsModal
          style={[sheetStyles.sheet, longFormSheetStyle, phone && phoneSheetStyles.sheet]}
          testID={`workspace-action-sheet-${props.action}`}
        >
          <WorkspaceSheetHeader {...props} compactForm={compactForm} />
          <ActionContent {...props} compactForm={compactForm} />
        </MobilePanel>
      </View>
    </MobileKeyboardAvoidingView>
  )
}

type ActionContentProps = MobileWorkspaceActionSheetProps & { compactForm: boolean }

function WorkspaceSheetHeader(props: ActionContentProps) {
  if (props.compactForm) return null
  return (
    <MobileToolbar testID="workspace-action-sheet-toolbar">
      <MobileToolbarTitle title={actionTitle(props.action, props.propertyName)} />
      <MobileToolbarSpacer />
      <MobileButton label={mobileText('common.cancel')} variant="ghost" onPress={props.onClose} />
    </MobileToolbar>
  )
}

function ActionContent(props: ActionContentProps) {
  const Content = Object.hasOwn(actionContentByAction, props.action) ? actionContentByAction[props.action] : null
  return Content ? <Content {...props} /> : null
}

function usesLongFormSheet(action: MobileWorkspaceAction) {
  return action === 'createView'
    || action === 'editView'
    || action === 'editTypeSection'
    || action === 'editPrimaryListProperties'
}

const actionContentByAction: Record<MobileWorkspaceAction, (props: ActionContentProps) => ReactNode> = {
  addProperty: (props) => <AddPropertyContent {...props} />,
  addRelationship: (props) => <AddRelationshipContent {...props} />,
  changeNoteType: (props) => <RetargetNoteContent {...props} retargetAction="changeType" />,
  createFolder: (props) => <SingleTextFieldContent config={singleTextFieldConfig(props)} />,
  createType: (props) => <SingleTextFieldContent config={singleTextFieldConfig(props)} />,
  createView: (props) => <ViewFormContent {...props} />,
  editFolder: (props) => <FolderActionsContent {...props} />,
  editFavorite: (props) => <FavoriteActionsContent {...props} />,
  editProperty: (props) => <AddPropertyContent {...props} />,
  editPrimaryListProperties: (props) => <PrimaryListPropertiesContent {...props} />,
  editTypeSection: (props) => <TypeSectionContent {...props} />,
  editTypeVisibility: (props) => <MobileTypeVisibilityEditor typeDefinitions={props.typeDefinitions} onToggleTypeVisibility={props.onToggleTypeVisibility} />,
  editView: (props) => <ViewFormContent {...props} />,
  findInNote: (props) => <MobileEditorFindSheet editorBlocks={props.editorBlocks} editorBullets={props.editorBullets} note={props.selectedNote} replace={false} onClose={props.onClose} onUpdateContent={props.onUpdateNoteContent} />,
  moreActions: (props) => <MoreActionsContent {...props} />,
  moveNoteToFolder: (props) => <RetargetNoteContent {...props} retargetAction="moveFolder" />,
  renameNoteFile: (props) => <SingleTextFieldContent config={singleTextFieldConfig(props)} />,
  replaceInNote: (props) => <MobileEditorFindSheet editorBlocks={props.editorBlocks} editorBullets={props.editorBullets} note={props.selectedNote} replace onClose={props.onClose} onUpdateContent={props.onUpdateNoteContent} />,
  search: (props) => <SearchContent {...props} />,
  setNoteIcon: (props) => <SingleTextFieldContent config={singleTextFieldConfig(props)} />,
  tableOfContents: (props) => (
    <MobileTableOfContentsSheet
      blocks={props.editorBlocks}
      bullets={props.editorBullets}
      note={props.selectedNote}
      onClose={props.onClose}
      onSelectTarget={props.onSelectTableOfContentsTarget}
    />
  ),
}

function SearchContent(props: MobileWorkspaceActionSheetProps) {
  return (
    <MobileQuickOpenSheet
      notes={props.notes}
      typeDefinitions={props.typeDefinitions}
      onClearWorkspaceSearch={() => props.onSearchQueryChange('')}
      onClose={props.onClose}
      onCreateNote={props.onCreateNote}
      onSelectNote={props.onSelectNote}
    />
  )
}

function ViewFormContent(props: ActionContentProps) {
  return <SingleTextFieldContent
    compactTitle={props.compactForm ? actionTitle(props.action, props.propertyName) : undefined}
    config={singleTextFieldConfig(props)}
  />
}

function SingleTextFieldContent({ config, compactTitle }: { config: SingleTextFieldConfig; compactTitle?: string }) {
  const { styles } = useMobileStyles(createThemeStyles)
  const secondaryInContent = useMobileDeviceLayout() === 'phone'
  return (
    <View style={[styles.formBody, compactTitle && phoneSheetStyles.compactBody]}>
      <SingleTextFieldHeader config={config} title={compactTitle} />
      <ScrollView contentContainerStyle={[styles.content, compactTitle && phoneSheetStyles.compactContent]} keyboardShouldPersistTaps="handled" style={styles.scrollArea} testID="workspace-single-field-scroll">
        <MobileTextInput
          autoFocus={mobileWorkspaceFormSheetAutoFocus}
          label={config.inputLabel}
          placeholder={config.inputPlaceholder}
          testID={config.inputTestId}
          value={config.inputValue}
          onChangeText={config.onChangeText}
        />
        {config.extraContent}
        {secondaryInContent ? config.secondaryAction : null}
      </ScrollView>
      {!compactTitle ? <SheetFooter pinned><SingleTextFieldActions config={config} primaryOnly={secondaryInContent} /></SheetFooter> : null}
    </View>
  )
}

function SingleTextFieldHeader({ config, title }: { config: SingleTextFieldConfig; title?: string }) {
  if (!title) return null
  return (
    <MobileToolbar testID="workspace-action-sheet-toolbar">
      <MobileToolbarTitle title={title} />
      <MobileToolbarSpacer />
      <SingleTextFieldActions config={config} primaryOnly />
    </MobileToolbar>
  )
}

function SingleTextFieldActions({ config, primaryOnly = false }: { config: SingleTextFieldConfig; primaryOnly?: boolean }) {
  return <>
    {!primaryOnly ? config.secondaryAction : null}
    <MobileButton label={mobileText('common.cancel')} variant="ghost" onPress={config.onCancel} />
    <MobileButton
      disabled={mobileSingleTextFieldSubmitDisabled(config)}
      label={config.submitLabel}
      variant="primary"
      onPress={config.onSubmit}
    />
  </>
}

function singleTextFieldConfig(props: MobileWorkspaceActionSheetProps) {
  const simpleConfig = simpleTextFieldConfig(props)
  if (simpleConfig) return simpleConfig

  const viewConfig = viewTextFieldConfig(props)
  if (viewConfig) return viewConfig

  throw new Error(`Unsupported single-text action: ${props.action}`)
}

function simpleTextFieldConfig(props: MobileWorkspaceActionSheetProps): SingleTextFieldConfig | null {
  if (props.action === 'createFolder') {
    return {
      inputLabel: mobileText('sidebar.folder.name'),
      inputPlaceholder: mobileText('sidebar.folder.name'),
      inputTestId: 'workspace-create-folder-name-input',
      inputValue: props.folderName,
      onCancel: props.onClose,
      onChangeText: props.onFolderNameChange,
      onSubmit: props.onCreateFolder,
      submitLabel: mobileText('common.create'),
    }
  }

  if (props.action === 'createType') {
    return {
      inputLabel: mobileText('sidebar.action.createType'),
      inputPlaceholder: mobileText('sidebar.action.createType'),
      inputTestId: 'workspace-create-type-name-input',
      inputValue: props.typeName,
      onCancel: props.onClose,
      onChangeText: props.onTypeNameChange,
      onSubmit: props.onCreateType,
      submitLabel: mobileText('common.create'),
    }
  }

  return noteTextFieldConfig(props)
}

function noteTextFieldConfig(props: MobileWorkspaceActionSheetProps): SingleTextFieldConfig | null {
  if (props.action === 'renameNoteFile') {
    return {
      inputLabel: mobileText('editor.filename.rename'),
      inputPlaceholder: mobileText('editor.filename.rename'),
      inputTestId: 'workspace-rename-file-input',
      inputValue: props.filenameStem,
      onCancel: props.onClose,
      onChangeText: props.onFilenameStemChange,
      onSubmit: props.onRenameNoteFile,
      submitDisabled: notePathValidationBlocksSubmit(renameNoteFileValidation(props)),
      submitLabel: mobileText('common.save'),
    }
  }

  if (props.action === 'setNoteIcon') {
    return {
      inputLabel: mobileText('command.note.setIcon'),
      inputPlaceholder: mobileText('command.note.setIcon'),
      inputTestId: 'workspace-note-icon-input',
      inputValue: props.noteIcon,
      onCancel: props.onClose,
      onChangeText: props.onNoteIconChange,
      onSubmit: props.onSetNoteIcon,
      secondaryAction: props.selectedNote?.icon ? (
        <MobileButton label={mobileText('command.note.removeIcon')} variant="ghost" onPress={props.onRemoveNoteIcon} />
      ) : undefined,
      submitLabel: mobileText('common.save'),
    }
  }

  return null
}

function viewTextFieldConfig(props: MobileWorkspaceActionSheetProps): SingleTextFieldConfig | null {
  if (props.action === 'editView') {
    return {
      extraContent: editViewContent(props),
      inputLabel: mobileText('viewDialog.nameLabel'),
      inputPlaceholder: mobileText('viewDialog.namePlaceholder'),
      inputTestId: 'workspace-edit-view-name-input',
      inputValue: props.viewName,
      onCancel: props.onClose,
      onChangeText: props.onViewNameChange,
      onSubmit: props.onSaveView,
      secondaryAction: (
        <MobileSavedViewActions
          canMoveDown={props.canMoveViewDown}
          canMoveUp={props.canMoveViewUp}
          onDelete={props.onDeleteView}
          onMoveDown={props.onMoveViewDown}
          onMoveUp={props.onMoveViewUp}
        />
      ),
      submitLabel: mobileText('common.save'),
    }
  }

  if (props.action === 'createView') {
    return {
      extraContent: editViewContent(props),
      inputLabel: mobileText('viewDialog.nameLabel'),
      inputPlaceholder: mobileText('viewDialog.namePlaceholder'),
      inputTestId: 'workspace-create-view-name-input',
      inputValue: props.viewName,
      onCancel: props.onClose,
      onChangeText: props.onViewNameChange,
      onSubmit: props.onCreateView,
      submitLabel: mobileText('common.create'),
    }
  }

  return null
}

function viewFilterBuilder(props: MobileWorkspaceActionSheetProps) {
  return (
    <>
      <MobileMetadataPicker
        selectedIcon={props.viewIcon}
        selectedTone={props.viewTone}
        testIDPrefix="workspace-view"
        onIconSelect={props.onViewIconChange}
        onToneSelect={props.onViewToneChange}
      />
      <MobileSortPicker
        customPropertyOptions={props.viewSortPropertyOptions}
        selectedSort={props.viewSort}
        testID="workspace-view-sort-picker"
        testIDPrefix="workspace-view-sort"
        onSelect={props.onViewSortChange}
      />
      <MobileViewFilterBuilder
        group={props.viewFilters}
        notes={props.notes}
        typeDefinitions={props.typeDefinitions}
        onChange={props.onViewFiltersChange}
      />
    </>
  )
}

function editViewContent(props: MobileWorkspaceActionSheetProps) {
  return (
    <>
      {viewFilterBuilder(props)}
      <ViewDisplayPropertiesPicker {...props} />
    </>
  )
}

function FolderActionsContent(props: MobileWorkspaceActionSheetProps) {
  const { styles, mobileColors } = useMobileStyles(createThemeStyles)
  return (
    <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" style={styles.scrollArea}>
      <MobileTextInput
        autoFocus={mobileWorkspaceFormSheetAutoFocus}
        label={mobileText('sidebar.folder.newName')}
        placeholder={mobileText('sidebar.folder.newName')}
        testID="workspace-rename-folder-input"
        value={props.folderName}
        onChangeText={props.onFolderNameChange}
      />
      <ActionRow
        icon={<FilePlus color={mobileColors.textMuted} size={desktopToolbarActionParity.iconSize} />}
        label={mobileText('sidebar.action.createNodeInFolderMenu')}
        testID="workspace-action-create-note-in-folder"
        onPress={props.onOpenCreateNoteInFolder}
      />
      <ActionRow
        icon={<FolderOpen color={mobileColors.textMuted} size={desktopToolbarActionParity.iconSize} />}
        label={mobileText('sidebar.action.createFolder')}
        testID="workspace-action-create-child-folder"
        onPress={props.onOpenCreateChildFolder}
      />
      <ActionRow
        icon={<ClipboardText color={mobileColors.textMuted} size={desktopToolbarActionParity.iconSize} />}
        label={mobileText('sidebar.action.copyFolderPathMenu')}
        testID="workspace-action-copy-folder-path"
        onPress={props.onCopyFolderPath}
      />
      <ActionRow
        icon={<ArrowSquareOut color={mobileColors.textMuted} size={desktopToolbarActionParity.iconSize} />}
        label={mobileText('sidebar.action.revealFolderMenu')}
        testID="workspace-action-reveal-folder"
        onPress={props.onRevealFolder}
      />
      <ActionRow
        destructive
        icon={<Trash color={mobileColors.red} size={desktopToolbarActionParity.iconSize} />}
        label={mobileText('sidebar.action.deleteFolder')}
        testID="workspace-action-delete-folder"
        onPress={props.onDeleteFolder}
      />
      <SheetFooter>
        <MobileButton label={mobileText('common.cancel')} variant="ghost" onPress={props.onClose} />
        <MobileButton disabled={props.folderName.trim().length === 0} label={mobileText('common.save')} variant="primary" onPress={props.onRenameFolder} />
      </SheetFooter>
    </ScrollView>
  )
}

function FavoriteActionsContent(props: MobileWorkspaceActionSheetProps) {
  const { styles } = useMobileStyles(createThemeStyles)
  return (
    <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" style={styles.scrollArea}>
      <MobileFavoriteActions
        canMoveDown={props.canMoveFavoriteDown}
        canMoveUp={props.canMoveFavoriteUp}
        onMoveDown={props.onMoveFavoriteDown}
        onMoveUp={props.onMoveFavoriteUp}
      />
      <SheetFooter>
        <MobileButton label={mobileText('common.cancel')} variant="ghost" onPress={props.onClose} />
      </SheetFooter>
    </ScrollView>
  )
}

function TypeSectionContent(props: MobileWorkspaceActionSheetProps) {
  const { styles } = useMobileStyles(createThemeStyles)
  return (
    <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" style={styles.scrollArea}>
      <MobileTypeSectionActions
        canDelete={props.canDeleteType}
        canMoveDown={props.canMoveTypeDown}
        canMoveUp={props.canMoveTypeUp}
        onDelete={props.onDeleteType}
        onMoveDown={props.onMoveTypeDown}
        onMoveUp={props.onMoveTypeUp}
      />
      <TypeSectionEditorContent {...props} />
      <SheetFooter>
        <MobileButton label={mobileText('common.cancel')} variant="ghost" onPress={props.onClose} />
        <MobileButton disabled={props.typeRenameName.trim().length === 0} label={mobileText('common.save')} variant="primary" onPress={props.onSaveTypeDefinition} />
      </SheetFooter>
    </ScrollView>
  )
}

function TypeSectionEditorContent(props: MobileWorkspaceActionSheetProps) {
  return (
    <MobileTypeSectionEditor
        displayProperties={props.typeDisplayProperties}
        notes={props.notes}
        propertyOptions={props.typePropertyOptions}
        propertyQuery={props.typePropertyQuery}
        relationshipTargetOptions={props.typeRelationshipTargetOptions}
        schemaProperties={props.typeSchemaProperties}
        schemaPropertyName={props.typeSchemaPropertyName}
        schemaPropertyNameOptions={props.typeSchemaPropertyNameOptions}
        schemaPropertyValue={props.typeSchemaPropertyValue}
        schemaRelationships={props.typeSchemaRelationships}
        schemaRelationshipName={props.typeSchemaRelationshipName}
        schemaRelationshipNameOptions={props.typeSchemaRelationshipNameOptions}
        schemaRelationshipTarget={props.typeSchemaRelationshipTarget}
        sectionLabel={props.typeSectionLabel}
        sort={props.typeSort}
        sortPropertyOptions={props.typeSortPropertyOptions}
        template={props.typeTemplate}
        typeIcon={props.typeIcon}
        tone={props.typeTone}
        typeName={props.typeName}
        typeRenameName={props.typeRenameName}
        visible={props.typeVisible}
        onDisplayPropertiesChange={props.onTypeDisplayPropertiesChange}
        onPropertyQueryChange={props.onTypePropertyQueryChange}
        onSchemaPropertyAdd={props.onTypeSchemaPropertyAdd}
        onSchemaPropertyNameChange={props.onTypeSchemaPropertyNameChange}
        onSchemaPropertyRemove={props.onTypeSchemaPropertyRemove}
        onSchemaPropertyValueChange={props.onTypeSchemaPropertyValueChange}
        onSchemaRelationshipAdd={props.onTypeSchemaRelationshipAdd}
        onSchemaRelationshipNameChange={props.onTypeSchemaRelationshipNameChange}
        onSchemaRelationshipRemove={props.onTypeSchemaRelationshipRemove}
        onSchemaRelationshipTargetSelect={props.onTypeSchemaRelationshipTargetSelect}
        onSchemaRelationshipTargetChange={props.onTypeSchemaRelationshipTargetChange}
        onSectionLabelChange={props.onTypeSectionLabelChange}
        onSortChange={props.onTypeSortChange}
        onTemplateChange={props.onTypeTemplateChange}
        onTypeIconChange={props.onTypeIconChange}
        onTypeRenameNameChange={props.onTypeRenameNameChange}
        onToneChange={props.onTypeToneChange}
        onVisibleChange={props.onTypeVisibleChange}
      />
  )
}

function ViewDisplayPropertiesPicker({
  onViewDisplayPropertiesChange,
  onViewPropertyQueryChange,
  viewDisplayProperties,
  viewPropertyOptions,
  viewPropertyQuery,
}: MobileWorkspaceActionSheetProps) {
  return (
    <MobileViewDisplayPropertiesPicker
      options={viewPropertyOptions}
      query={viewPropertyQuery}
      selectedProperties={viewDisplayProperties}
      onQueryChange={onViewPropertyQueryChange}
      onSelectedPropertiesChange={onViewDisplayPropertiesChange}
    />
  )
}

function PrimaryListPropertiesContent(props: MobileWorkspaceActionSheetProps) {
  const { styles } = useMobileStyles(createThemeStyles)
  return (
    <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" style={styles.scrollArea}>
      <MobileViewDisplayPropertiesPicker
        options={props.primaryPropertyOptions}
        query={props.primaryPropertyQuery}
        selectedProperties={props.primaryDisplayProperties}
        testIDPrefix="workspace-primary-property"
        onQueryChange={props.onPrimaryPropertyQueryChange}
        onSelectedPropertiesChange={props.onPrimaryDisplayPropertiesChange}
      />
      {props.primaryItemId === 'all-notes' ? <AllNotesFileVisibilityContent {...props} /> : null}
      <SheetFooter>
        <MobileButton label={mobileText('common.cancel')} variant="ghost" onPress={props.onClose} />
        <MobileButton label={mobileText('common.save')} variant="primary" onPress={props.onSavePrimaryNoteListProperties} />
      </SheetFooter>
    </ScrollView>
  )
}

function AllNotesFileVisibilityContent({
  allNotesShowImages,
  allNotesShowPdfs,
  allNotesShowUnsupported,
  onPrimaryAllNotesShowImagesChange,
  onPrimaryAllNotesShowPdfsChange,
  onPrimaryAllNotesShowUnsupportedChange,
}: MobileWorkspaceActionSheetProps) {
  const { styles } = useMobileStyles(createThemeStyles)
  return (
    <View style={styles.visibilitySection} testID="workspace-all-notes-file-visibility">
      <View style={styles.visibilityHeader}>
        <Text style={styles.visibilityTitle}>{mobileText('settings.allNotesVisibility.title')}</Text>
        <Text style={styles.visibilityDescription}>{mobileText('settings.allNotesVisibility.description')}</Text>
      </View>
      <VisibilitySwitchRow
        active={allNotesShowPdfs}
        description={mobileText('settings.allNotesVisibility.pdfsDescription')}
        label={mobileText('settings.allNotesVisibility.pdfs')}
        testID="workspace-all-notes-show-pdfs"
        onChange={onPrimaryAllNotesShowPdfsChange}
      />
      <VisibilitySwitchRow
        active={allNotesShowImages}
        description={mobileText('settings.allNotesVisibility.imagesDescription')}
        label={mobileText('settings.allNotesVisibility.images')}
        testID="workspace-all-notes-show-images"
        onChange={onPrimaryAllNotesShowImagesChange}
      />
      <VisibilitySwitchRow
        active={allNotesShowUnsupported}
        description={mobileText('settings.allNotesVisibility.unsupportedDescription')}
        label={mobileText('settings.allNotesVisibility.unsupported')}
        testID="workspace-all-notes-show-unsupported"
        onChange={onPrimaryAllNotesShowUnsupportedChange}
      />
    </View>
  )
}

function VisibilitySwitchRow({
  active,
  description,
  label,
  onChange,
  testID,
}: {
  active: boolean
  description: string
  label: string
  onChange: (value: boolean) => void
  testID: string
}) {
  const { styles, mobileColors } = useMobileStyles(createThemeStyles)
  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="switch"
      accessibilityState={{ checked: active }}
      aria-checked={active}
      style={({ pressed }) => [styles.visibilityRow, pressed ? styles.visibilityRowPressed : null]}
      testID={testID}
      onPress={() => onChange(!active)}
    >
      <CheckCircle color={active ? mobileColors.primary : mobileColors.textFaint} size={16} weight={active ? 'fill' : 'regular'} />
      <View style={styles.visibilityText}>
        <Text style={styles.visibilityLabel}>{label}</Text>
        <Text style={styles.visibilityDescription}>{description}</Text>
      </View>
    </Pressable>
  )
}

function AddPropertyContent(props: ActionContentProps) {
  const { styles } = useMobileStyles(createThemeStyles)
  const { compactForm } = props
  const focusedScroll = useFocusedFormScroll()
  return (
    <View style={[styles.formBody, compactForm && phoneSheetStyles.compactBody]}>
      <PropertyFormHeader form={props} />
      <ScrollView {...focusedScroll} contentContainerStyle={[styles.content, compactForm && phoneSheetStyles.compactContent]} keyboardShouldPersistTaps="handled" style={styles.scrollArea} testID="workspace-property-form-scroll">
        <PropertyFormFields form={props} />
        {compactForm ? <PropertyDeleteAction form={props} /> : null}
      </ScrollView>
      <PropertyFormFooter form={props} />
    </View>
  )
}

type WorkspaceFormProps = { form: ActionContentProps }

function PropertyFormHeader({ form: props }: WorkspaceFormProps) {
  if (!props.compactForm) return null
  return (<MobileToolbar testID="workspace-action-sheet-toolbar">
    <MobileToolbarTitle title={actionTitle(props.action, props.propertyName)} />
    <MobileToolbarSpacer />
    <PropertyFormActions form={props} />
  </MobileToolbar>)
}

function PropertyFormFooter({ form: props }: WorkspaceFormProps) {
  if (props.compactForm) return null
  return (<SheetFooter pinned>
    <PropertyDeleteAction form={props} />
    <PropertyFormActions form={props} />
  </SheetFooter>)
}

function PropertyFormFields({ form: props }: WorkspaceFormProps) {
  const phone = useMobileDeviceLayout() === 'phone'
  const editingProperty = props.action === 'editProperty'
  const lockedListKind = isMobileListPropertyKey(props.propertyName)
  const kind = mobilePropertyValueKindForKey(props.propertyName, props.propertyValueKind)
  const keys = editingProperty ? [] : mobilePropertyKeySuggestions(props.notes, props.selectedNote, props.propertyName, props.typeDefinitions)
  const values = mobilePropertyValueSuggestions(props.notes, props.propertyName, props.propertyValue, kind, {
    selectedNote: props.selectedNote, typeDefinitions: props.typeDefinitions,
  })
  return (
    <>
      {!(phone && editingProperty) ? <MobileTextInput
        autoFocus={mobileWorkspaceFormSheetAutoFocus}
        label={mobileText('inspector.properties.propertyName')}
        placeholder={mobileText('inspector.properties.propertyName')}
        testID="workspace-property-name-input"
        value={props.propertyName}
        editable={!editingProperty}
        onChangeText={props.onPropertyNameChange}
      /> : null}
      {keys.length > 0 ? (
        <MobileWorkspaceSuggestionList
          labels={keys}
          maxVisibleItems={mobileWorkspaceFormSheetMaxSuggestions}
          testID="workspace-property-key-suggestions"
          testIDPrefix="workspace-property-key-suggestion"
          onSelect={props.onPropertyNameChange}
        />
      ) : null}
      <MobilePropertyValueEditor
        kind={kind}
        lockedListKind={lockedListKind}
        showKindPicker={!(phone && lockedListKind)}
        propertyName={props.propertyName}
        suggestions={values}
        value={props.propertyValue}
        onKindChange={props.onPropertyValueKindChange}
        onValueChange={props.onPropertyValueChange}
      />
    </>
  )
}

function PropertyFormActions({ form: props }: WorkspaceFormProps) {
  const canSave = canSubmitMobilePropertyValue({ key: props.propertyName, kind: props.propertyValueKind, valueText: props.propertyValue })
  return (<>
    <MobileButton label={mobileText('common.cancel')} testID={mobileWorkspacePropertyActionTestIds.cancel} variant="ghost" onPress={props.onClose} />
    <MobileButton disabled={!canSave} label={mobileText('common.save')} testID={mobileWorkspacePropertyActionTestIds.save} variant="primary" onPress={props.onSaveProperty} />
  </>)
}

function PropertyDeleteAction({ form: props }: WorkspaceFormProps) {
  const note = props.selectedNote
  if (!mobilePropertyDeleteActionVisible({ editingProperty: props.action === 'editProperty', hasSelectedNote: note !== null }) || !note) return null
  return (<MobileButton
    label={mobileText('inspector.properties.deleteProperty')}
    testID={mobileWorkspacePropertyActionTestIds.delete}
    tone="danger"
    variant="ghost"
    onPress={() => props.onDeleteProperty(note.id, props.propertyName)}
  />)
}

function AddRelationshipContent(props: ActionContentProps) {
  const { styles } = useMobileStyles(createThemeStyles)
  const focusedScroll = useFocusedFormScroll()
  const phone = useMobileDeviceLayout() === 'phone'
  const { compactForm } = props
  return (
    <View style={[styles.formBody, compactForm && phoneSheetStyles.compactBody]}>
      <RelationshipFormHeader form={props} />
      <ScrollView {...focusedScroll} contentContainerStyle={[styles.content, compactForm && phoneSheetStyles.compactContent]} keyboardShouldPersistTaps="handled" style={styles.scrollArea} testID="workspace-relationship-form-scroll">
        <RelationshipFormFields form={props} />
        <RelationshipFormFooter form={props} visible={!phone} />
      </ScrollView>
      <RelationshipFormFooter form={props} visible={phone && !compactForm} pinned />
    </View>
  )
}

function RelationshipFormHeader({ form: props }: WorkspaceFormProps) {
  if (!props.compactForm) return null
  return (<MobileToolbar testID="workspace-action-sheet-toolbar">
    <MobileToolbarTitle title={actionTitle(props.action, props.propertyName)} />
    <MobileToolbarSpacer />
    <RelationshipFormActions form={props} />
  </MobileToolbar>)
}

function RelationshipFormFooter({ form, visible, pinned = false }: WorkspaceFormProps & { visible: boolean; pinned?: boolean }) {
  if (!visible) return null
  return (<SheetFooter pinned={pinned}>
    <RelationshipFormActions form={form} />
  </SheetFooter>)
}

function RelationshipFormActions({ form: props }: WorkspaceFormProps) {
  const disabled = props.relationshipName.trim().length === 0 || props.relationshipNoteTitle.trim().length === 0
  return (<>
    <MobileButton label={mobileText('common.cancel')} testID={mobileWorkspaceRelationshipActionTestIds.cancel} variant="ghost" onPress={props.onClose} />
    <MobileButton disabled={disabled} label={mobileText('inspector.relationship.add')} testID={mobileWorkspaceRelationshipActionTestIds.save} variant="primary" onPress={props.onSaveRelationship} />
  </>)
}

function RelationshipFormFields({ form: props }: WorkspaceFormProps) {
  const keySuggestions = mobileRelationshipKeySuggestions(props.notes, props.relationshipName, props.selectedNote, props.typeDefinitions)
  return (<>
    <MobileTextInput
      autoFocus={mobileWorkspaceFormSheetAutoFocus}
      label={mobileText('inspector.relationship.name')}
      placeholder={mobileText('inspector.relationship.name')}
      testID="workspace-relationship-name-input"
      value={props.relationshipName}
      onChangeText={props.onRelationshipNameChange}
    />
    <MobileWorkspaceSuggestionList
      labels={keySuggestions}
      maxVisibleItems={mobileWorkspaceFormSheetMaxSuggestions}
      testID="workspace-relationship-key-suggestions"
      testIDPrefix="workspace-relationship-key-suggestion"
      onSelect={props.onRelationshipNameChange}
    />
    <MobileTextInput
      label={mobileText('inspector.relationship.noteTitle')}
      placeholder={mobileText('inspector.relationship.noteTitle')}
      testID="workspace-relationship-note-title-input"
      value={props.relationshipNoteTitle}
      onChangeText={props.onRelationshipNoteTitleChange}
    />
    <RelationshipTargetOptions form={props} />
  </>)
}

function RelationshipTargetOptions({ form: props }: WorkspaceFormProps) {
  const { styles } = useMobileStyles(createThemeStyles)
  const suggestions = mobileRelationshipTargetSuggestions(props.notes, props.relationshipNoteTitle, {
    relationshipKey: props.relationshipName,
    selectedNote: props.selectedNote,
  })
  const createTargetTitle = props.relationshipNoteTitle.trim()
  const showCreateTarget = shouldShowMobileRelationshipCreateTarget(props.notes, createTargetTitle)

  return (
    <>
      {suggestions.length > 0 ? (
        <View style={styles.suggestionList} testID="workspace-relationship-note-suggestions">
          {suggestions.slice(0, mobileWorkspaceRelationshipTargetMaxSuggestions).map((note) => (
            <Pressable
              accessibilityLabel={note.title}
              accessibilityRole="button"
              key={note.id}
              style={styles.suggestionPressable}
              testID={`workspace-relationship-note-suggestion-${note.id}`}
              onPress={() => props.onRelationshipNoteSelect(note.title, `[[${mobileWikilinkTargetForNote(note, props.selectedNote)}]]`)}
            >
              {({ pressed }) => (
                <View style={[styles.suggestionRow, pressed ? styles.suggestionRowPressed : null]}>
                  <MobileTypeIcon
                    size={16}
                    tone={note.typeTone}
                    type={note.type}
                    typeDefinitions={props.typeDefinitions}
                  />
                  <Text numberOfLines={1} style={styles.suggestionTitle}>{note.title}</Text>
                  <MobileChip label={note.type} tone={chipTone(note.typeTone)} />
                </View>
              )}
            </Pressable>
          ))}
        </View>
      ) : null}
      {showCreateTarget ? (
        <CreateRelationshipTargetRow title={createTargetTitle} onPress={props.onCreateRelationshipTarget} />
      ) : null}
    </>
  )
}

function useFocusedFormScroll() {
  const scroll = useRef<ScrollView>(null)
  const viewportHeight = useRef(0)
  const offset = useRef(0)
  const reveal = () => {
    if (Platform.OS === 'web') return
    const field = TextInput.State.currentlyFocusedInput()
    const host = scroll.current?.getNativeScrollRef()
    if (!field || !host) return
    field.measureLayout(host, (_x, fieldTop, _width, fieldHeight) => {
      const next = mobileFormScrollOffset({ offset: offset.current, fieldTop, fieldHeight, viewportHeight: viewportHeight.current })
      if (next !== offset.current) scroll.current?.scrollTo({ y: next, animated: false })
    }, () => {})
  }
  return {
    ref: scroll,
    onLayout: (event: LayoutChangeEvent) => {
      viewportHeight.current = event.nativeEvent.layout.height
      reveal()
    },
    onContentSizeChange: reveal,
    onScroll: (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      offset.current = event.nativeEvent.contentOffset.y
    },
  }
}

function CreateRelationshipTargetRow({
  onPress,
  title,
}: {
  onPress: () => void
  title: string
}) {
  const { styles, mobileColors } = useMobileStyles(createThemeStyles)
  return (
    <Pressable
      accessibilityLabel={`${mobileText('inspector.relationship.createAndOpen')} ${title}`}
      accessibilityRole="button"
      style={styles.suggestionPressable}
      testID={mobileWorkspaceRelationshipActionTestIds.createTarget}
      onPress={onPress}
    >
      {({ pressed }) => (
        <View style={[styles.suggestionRow, pressed ? styles.suggestionRowPressed : null]}>
          <FilePlus color={mobileColors.textMuted} size={16} />
          <Text numberOfLines={1} style={styles.suggestionTitle}>
            {mobileText('inspector.relationship.createAndOpen')} {title}
          </Text>
        </View>
      )}
    </Pressable>
  )
}

function RetargetNoteContent(props: MobileWorkspaceActionSheetProps & { retargetAction: RetargetNoteAction }) {
  return (
    <SuggestionInputActionContent config={retargetNoteInputConfig(props)} />
  )
}

function retargetNoteInputConfig(props: MobileWorkspaceActionSheetProps & { retargetAction: RetargetNoteAction }): SuggestionInputActionConfig {
  if (props.retargetAction === 'changeType') {
    return {
      inputLabel: mobileText('command.note.changeType'),
      inputPlaceholder: mobileText('inspector.properties.searchTypes'),
      inputTestId: 'workspace-change-type-input',
      inputValue: props.noteType,
      onCancel: props.onClose,
      onChangeText: props.onChangeNoteTypeInputChange,
      onSubmit: props.onChangeNoteType,
      submitLabel: mobileText('common.save'),
      suggestionTestId: 'workspace-change-type-suggestions',
      suggestionTestIdPrefix: 'workspace-change-type-suggestion',
      suggestions: mobileTypeSuggestions(props.notes, props.selectedNote, props.noteType),
    }
  }

  return {
    inputLabel: mobileText('command.note.moveToFolder'),
    inputPlaceholder: mobileText('sidebar.folder.name'),
    inputTestId: 'workspace-move-folder-input',
    inputValue: props.folderPath,
    onCancel: props.onClose,
    onChangeText: props.onFolderPathChange,
    onSubmit: props.onMoveNoteToFolder,
    submitLabel: mobileText('common.save'),
    submitDisabled: notePathValidationBlocksSubmit(moveNoteToFolderValidation(props)),
    suggestionTestId: 'workspace-move-folder-suggestions',
    suggestionTestIdPrefix: 'workspace-move-folder-suggestion',
    suggestions: mobileFolderSuggestions(props.notes, props.selectedNote, props.folderPath, props.folderPaths),
  }
}

function SuggestionInputActionContent({ config }: { config: SuggestionInputActionConfig }) {
  const { styles } = useMobileStyles(createThemeStyles)
  return (
    <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" style={styles.scrollArea}>
      <MobileTextInput
        autoFocus={mobileWorkspaceFormSheetAutoFocus}
        label={config.inputLabel}
        placeholder={config.inputPlaceholder}
        testID={config.inputTestId}
        value={config.inputValue}
        onChangeText={config.onChangeText}
      />
      <MobileWorkspaceSuggestionList
        labels={config.suggestions}
        maxVisibleItems={mobileWorkspaceFormSheetMaxSuggestions}
        testID={config.suggestionTestId}
        testIDPrefix={config.suggestionTestIdPrefix}
        onSelect={config.onChangeText}
      />
      <SheetFooter>
        <MobileButton label={mobileText('common.cancel')} variant="ghost" onPress={config.onCancel} />
        <MobileButton disabled={config.submitDisabled || config.inputValue.trim().length === 0} label={config.submitLabel} variant="primary" onPress={config.onSubmit} />
      </SheetFooter>
    </ScrollView>
  )
}

function renameNoteFileValidation(props: MobileWorkspaceActionSheetProps): MobileNotePathValidationStatus {
  return validateMobileRenameNoteFilePath({
    filenameStem: props.filenameStem,
    note: props.selectedNote,
    notes: props.notes,
  })
}

function moveNoteToFolderValidation(props: MobileWorkspaceActionSheetProps): MobileNotePathValidationStatus {
  return validateMobileMoveNoteFolderPath({
    folderPath: props.folderPath,
    folderPaths: props.folderPaths,
    note: props.selectedNote,
    notes: props.notes,
  })
}

function notePathValidationBlocksSubmit(status: MobileNotePathValidationStatus) {
  return status !== 'ok'
}

function ActionRow({
  icon,
  destructive = false,
  label,
  onPress,
  testID,
}: {
  destructive?: boolean
  icon: ReactNode
  label: string
  onPress: () => void
  testID?: string
}) {
  const { actionStyles } = useMobileStyles(createThemeStyles)
  return (
    <Pressable accessibilityLabel={label} accessibilityRole="button" style={({ pressed }) => [actionStyles.actionRow, pressed ? actionStyles.actionRowPressed : null]} testID={testID} onPress={onPress}>
      <View style={actionStyles.actionRowContent}>
        <View style={actionStyles.actionIcon}>{icon}</View>
        <Text numberOfLines={1} style={[actionStyles.actionText, destructive ? actionStyles.actionTextDestructive : null]}>{label}</Text>
      </View>
    </Pressable>
  )
}

function SheetFooter({ children, pinned = false }: { children: ReactNode; pinned?: boolean }) {
  const { styles } = useMobileStyles(createThemeStyles)
  return <View style={[styles.footer, pinned ? styles.pinnedFooter : null]}>{children}</View>
}

function actionTitle(action: MobileWorkspaceAction, propertyName: string) {
  if (action === 'editProperty' && propertyName.trim()) return propertyName.trim()
  if (!Object.hasOwn(actionTitleByAction, action)) return ''
  const title = mobileText(actionTitleByAction[action])
  return action === 'addRelationship' ? title.replace(/^\+\s*/, '') : title
}

const actionTitleByAction: Record<MobileWorkspaceAction, Parameters<typeof mobileText>[0]> = {
  addProperty: 'inspector.properties.addProperty',
  addRelationship: 'inspector.relationship.addRelationship',
  changeNoteType: 'command.note.changeType',
  createFolder: 'sidebar.action.createFolder',
  createType: 'sidebar.action.createType',
  createView: 'viewDialog.title.create',
  editFolder: 'sidebar.action.renameFolder',
  editFavorite: 'sidebar.group.favorites',
  editProperty: 'inspector.title.properties',
  editPrimaryListProperties: 'noteList.properties.customizeColumns',
  editTypeSection: 'sidebar.section.name',
  editTypeVisibility: 'sidebar.section.showInSidebar',
  editView: 'viewDialog.title.edit',
  findInNote: 'command.note.findInNote',
  moreActions: 'editor.toolbar.moreActions',
  moveNoteToFolder: 'command.note.moveToFolder',
  renameNoteFile: 'editor.filename.rename',
  replaceInNote: 'command.note.replaceInNote',
  search: 'noteList.searchAction',
  setNoteIcon: 'command.note.setIcon',
  tableOfContents: 'tableOfContents.title',
}

const phoneSheetStyles = StyleSheet.create({
  container: { paddingHorizontal: 8, paddingVertical: 8 },
  sheet: { maxHeight: '100%' },
  compactBody: { flex: 1 },
  compactContent: { padding: 8 },
})
