import type { MobileMetrics } from '../../ui/mobileMetrics'
import { useMobileStyles } from '../../ui/theme/useMobileTheme'
import type { MobileColors } from '../../ui/theme/mobilePalette'
import { type EditorBridge, RichText, TenTapStartKit, useEditorBridge } from '@10play/tentap-editor'
import { type MutableRefObject, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { MobileKeyboardAvoidingView } from '../../ui/MobileKeyboardAvoidingView'
import { type MobileLayoutProbe, probeProps } from '../../qa/mobileLayoutProbe'
import type { NativeTableOfContentsProof } from '../../qa/nativeTableOfContentsProbe'
import {
  nativeWysiwygMarkdownBlockProbePayloads,
  nativeWysiwygMarkdownBlockProbePlainTextPayload,
  nativeWysiwygMarkdownBlockProbeTableGrowthJson,
} from '../../qa/nativeWysiwygMarkdownBlockProbe'

import { isMobileImageAttachment } from '../../workspace/mobileAttachments'
import { readMobileClipboardText } from '../../workspace/mobileClipboard'
import {
  mobileDocumentBody,
  mobileNoteEditableContent,
} from '../../workspace/mobileDocumentContent'
import {
  type RegisterMobileEditorCommands,
  useRegisteredMobileEditorCommands,
} from '../../workspace/mobileEditorCommands'
import type { MobileTableOfContentsTarget } from '../../workspace/mobileTableOfContents'
import type { MobileEditorBlock, MobileNote, MobileTypeDefinitions } from '../../workspace/mobileWorkspaceModel'
import { nativeWysiwygDocumentWithInputTransforms } from '../../workspace/mobileWysiwygInputTransforms'
import { MobileWysiwygFormattingToolbar } from './MobileWysiwygFormattingToolbar.native'
import { useNativeWysiwygAutocompleteProbe } from './MobileWysiwygAutocompleteProbe.native'
import { MobileCodeBlockBridge } from './MobileWysiwygCodeBlockBridge'
import { MobileDiagramBridge } from './MobileWysiwygDiagramBridge'
import {
  activateNativeEditorChanges,
  isContentSettableEditorBridge,
  type NativeTentapEditorRefs,
  useEditableContentRef,
  useEditorBridgeRef,
  useEditorCssInjection,
  useFlushOnUnmount,
  useResetEditorChangeGate,
  useSyncInitialEditorContent,
} from './MobileWysiwygEditorLifecycle.native'
import { nativeWysiwygDocumentWithoutExternalLink } from './MobileWysiwygExternalLinkBridgeModel'
import { useNativeWysiwygExternalLinkProbe } from './MobileWysiwygExternalLinkProbe.native'
import { MobileWysiwygExternalLinkSheet } from './MobileWysiwygExternalLinkSheet'
import { nativeWysiwygInitialExternalLinkValue } from './MobileWysiwygExternalLinkSheetModel'
import { useNativeWysiwygFormatCommandProbe } from './MobileWysiwygFormatCommandProbe.native'
import {
  applyNativeWysiwygFormat,
  isNativeWysiwygMarkdownBlockAction,
  type NativeWysiwygCommandBridge,
  nativeWysiwygFormattingActions,
} from './MobileWysiwygFormatCommands'
import { useNativeWysiwygInputTransformProbe } from './MobileWysiwygInputTransformProbe.native'
import { MobileMathInlineBridge } from './MobileWysiwygMathBridge'
import { useNativeWysiwygMathEditProbe } from './MobileWysiwygMathEditProbe.native'
import { useNativeWysiwygMutationProbe } from './MobileWysiwygMutationProbe.native'
import { MobileWysiwygContentBridge } from './MobileWysiwygContentBridge'
import { createMobileEditorDocumentBridge, isJsonReadableEditorBridge } from './MobileWysiwygDocumentReads.native'
import type { NativeInitialContentSync } from './nativeInitialContentSync'
import { MobileWysiwygOutlineBridge } from './MobileWysiwygOutlineBridge'
import { MobileWysiwygSlashBridge } from './MobileWysiwygSlashBridge'
import { MobileWysiwygSlashMenu } from './MobileWysiwygSlashMenu.native'
import { MobileWysiwygFindBridge } from './MobileWysiwygFindBridge'
import { MobileWysiwygFind } from './MobileWysiwygFind.native'
import { useMobileWysiwygOutlineNavigation } from './MobileWysiwygOutlineNavigation.native'
import { useFlushEditorDocument } from './MobileWysiwygPersistence.native'
import { MobileTableBridge } from './MobileWysiwygTableBridge'
import { useNativeWysiwygTableCommandMutationProbe } from './MobileWysiwygTableCommandMutationProbe.native'
import { mobileWysiwygTentapEditorHtml } from './MobileWysiwygTentapEditorHtml'
import { mobileEditorPreviewHtml, useMobileEditorFileSource } from './mobileEditorFileSource.native'
import {
  type NativeWysiwygAttachmentPayload,
  type NativeWysiwygInlineAutocomplete,
  type NativeWysiwygInlineAutocompleteKind,
  type NativeWysiwygMarkdownBlockPayload,
  type NativeWysiwygPlainTextPayload,
  type NativeWysiwygSelection,
  type NativeWysiwygWikilinkPayload,
  nativeWysiwygDocumentWithInsertedAttachment,
  nativeWysiwygDocumentWithInsertedMarkdownBlock,
  nativeWysiwygDocumentWithInsertedPlainText,
  nativeWysiwygDocumentWithInsertedWikilink,
  nativeWysiwygInlineAutocompleteAtSelection,
} from './MobileWysiwygWikilinkBridgeModel'
import { insertNativeWysiwygWikilinkProbe } from './MobileWysiwygWikilinkInsertProbe.native'
import { MobileWysiwygWikilinkPicker } from './MobileWysiwygWikilinkPicker'

type MobileWysiwygMarkdownEditorProps = {
  blocks: MobileEditorBlock[]
  bullets: string[]
  compact: boolean
  layoutProbe?: MobileLayoutProbe
  note: MobileNote
  notes: MobileNote[]
  onImportAttachment?: () => Promise<NativeWysiwygAttachmentPayload | null>
  onRegisterEditorCommands?: RegisterMobileEditorCommands
  onTableOfContentsScrollProof?: (proof: NativeTableOfContentsProof) => void
  onUpdateContent: (noteId: string, content: string) => void
  tableOfContentsTarget?: MobileTableOfContentsTarget | null
  vaultRootUri?: string | null
  typeDefinitions: MobileTypeDefinitions | null | undefined
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

type EditorStateReadableBridge = EditorBridge & {
  getEditorState: () => {
    activeLink?: unknown
    canSetLink?: unknown
    isLinkActive?: unknown
    selection?: {
      from?: unknown
      to?: unknown
    }
  }
}
type NativeWysiwygEditorState = ReturnType<EditorStateReadableBridge['getEditorState']>
type MathBlockRenderableEditorBridge = EditorBridge & {
  getMathBlockRenderProof: () => Promise<boolean>
}

type TimerHandle = ReturnType<typeof setTimeout>
type NativeTentapEditorBridgeOptions = Omit<MobileWysiwygMarkdownEditorProps, 'notes' | 'typeDefinitions'> & {
  initialDocumentContent: string
  onInlineAutocomplete: NativeWysiwygInlineAutocompleteHandler
}
type NativeTentapEditorRuntime = ReturnType<typeof useNativeTentapEditorRuntime>
type NativeTentapEditorSurfaceProps = {
  vaultRootUri?: string | null
  previewMarkdown: string
  activateEditorChanges: () => void
  editor: EditorBridge
  externalLinkState: NativeWysiwygExternalLinkSheetState | null
  flushEditorDocument: () => void
  injectEditorCss: () => void
  insertWikilink: (payload: NativeWysiwygWikilinkPayload, selection?: NativeWysiwygSelection) => void
  insertAttachment: (payload: NativeWysiwygAttachmentPayload, selection?: NativeWysiwygSelection) => void
  insertMarkdownBlock: (payload: NativeWysiwygMarkdownBlockPayload, selection?: NativeWysiwygSelection) => void
  insertPlainText: (payload: NativeWysiwygPlainTextPayload, selection?: NativeWysiwygSelection) => void
  layoutProbe?: MobileLayoutProbe
  notes: MobileNote[]
  onCloseExternalLinkSheet: () => void
  onCloseWikilinkPicker: () => void
  onImportAttachment?: () => Promise<NativeWysiwygAttachmentPayload | null>
  onOpenExternalLinkSheet: () => void
  onOpenToolbarWikilinkPicker: () => void
  onRegisterEditorCommands?: RegisterMobileEditorCommands
  pickerState: NativeWysiwygPickerState | null
  sourceNote: MobileNote
  typeDefinitions: MobileTypeDefinitions | null | undefined
}
type NativeWysiwygExternalLinkSheetState = {
  initialUrl: string
  selection?: NativeWysiwygSelection
}
type NativeTentapEditorSurfaceActionProps = Pick<
  NativeTentapEditorSurfaceProps,
  | 'editor'
  | 'externalLinkState'
  | 'flushEditorDocument'
  | 'insertAttachment'
  | 'insertMarkdownBlock'
  | 'insertPlainText'
  | 'insertWikilink'
  | 'onCloseExternalLinkSheet'
  | 'onCloseWikilinkPicker'
  | 'onImportAttachment'
  | 'onOpenExternalLinkSheet'
  | 'onOpenToolbarWikilinkPicker'
  | 'pickerState'
>
type NativeTentapEditorSurfaceActions = {
  handleApplyExternalLink: (url: string) => void
  handleFormat: (action: Parameters<typeof applyNativeWysiwygFormat>[1]) => Promise<void>
  handleInsertEmoji: (payload: NativeWysiwygPlainTextPayload) => void
  handleInsertWikilink: (payload: NativeWysiwygWikilinkPayload) => void
  handlePastePlainText: () => void
  handleRemoveExternalLink: () => void
}
type NativeWysiwygInlineAutocompleteHandler = (match: NativeWysiwygInlineAutocomplete | null) => void
type NativeWysiwygPickerState = {
  kind: NativeWysiwygInlineAutocompleteKind
  query: string
  replacementRange?: NativeWysiwygSelection
  source: 'inline' | 'toolbar'
}
type NativeWysiwygDocumentBuilder<Payload> = (request: {
  json: unknown
  payload: Payload
  selection?: NativeWysiwygSelection
}) => unknown | null
type NativeWysiwygEditorMutation<Payload> = (
  editor: EditorBridge | null,
  payload: Payload,
  selection?: NativeWysiwygSelection,
) => Promise<boolean>

type SelectionSettableEditorBridge = EditorBridge & {
  setSelection: (from: number, to: number) => void
}

const mobileTenTapBridgeExtensions = [
  ...TenTapStartKit,
  MobileCodeBlockBridge,
  MobileDiagramBridge,
  MobileMathInlineBridge,
  MobileWysiwygContentBridge,
  MobileWysiwygOutlineBridge,
  MobileWysiwygSlashBridge,
  MobileWysiwygFindBridge,
  MobileTableBridge.configureExtension({ renderWrapper: true }),
]

export function MobileWysiwygMarkdownEditor(props: MobileWysiwygMarkdownEditorProps) {
  const {
    blocks,
    bullets,
    layoutProbe,
    note,
    notes,
    onImportAttachment,
    onRegisterEditorCommands,
    typeDefinitions,
    vaultRootUri = null,
  } = props
  const [pickerState, setPickerState] = useState<NativeWysiwygPickerState | null>(null)
  const [externalLinkState, setExternalLinkState] = useState<NativeWysiwygExternalLinkSheetState | null>(null)
  const handleInlineAutocomplete = useCallback((match: NativeWysiwygInlineAutocomplete | null) => {
    setPickerState((current) => inlineAutocompletePickerState(current, match))
  }, [])
  const handleOpenToolbarWikilinkPicker = useCallback(() => {
    setPickerState({
      kind: 'wikilink',
      query: '',
      source: 'toolbar',
    })
  }, [])
  const handleCloseWikilinkPicker = useCallback(() => {
    setPickerState(null)
  }, [])
  const bridge = useNativeTentapEditorBridge({
    ...props,
    initialDocumentContent: initialNativeEditorContent(props),
    onInlineAutocomplete: handleInlineAutocomplete,
  })
  const handleOpenExternalLinkSheet = useCallback(() => {
    setExternalLinkState({
      initialUrl: nativeWysiwygInitialExternalLinkValue(nativeWysiwygEditorState(bridge.editor)),
      selection: nativeWysiwygEditorSelection(bridge.editor),
    })
  }, [bridge.editor])
  const handleCloseExternalLinkSheet = useCallback(() => {
    setExternalLinkState(null)
  }, [])

  return (
    <NativeTentapEditorSurface
      {...bridge}
      vaultRootUri={vaultRootUri}
      previewMarkdown={mobileDocumentBody(initialNativeEditorContent({ blocks, bullets, note }))}
      layoutProbe={layoutProbe}
      notes={notes}
      onImportAttachment={onImportAttachment}
      onRegisterEditorCommands={onRegisterEditorCommands}
      pickerState={pickerState}
      sourceNote={note}
      typeDefinitions={typeDefinitions}
      externalLinkState={externalLinkState}
      onCloseExternalLinkSheet={handleCloseExternalLinkSheet}
      onCloseWikilinkPicker={handleCloseWikilinkPicker}
      onOpenExternalLinkSheet={handleOpenExternalLinkSheet}
      onOpenToolbarWikilinkPicker={handleOpenToolbarWikilinkPicker}
    />
  )
}

function NativeTentapEditorSurface(props: NativeTentapEditorSurfaceProps) {
  const { nativeEditorStyles } = useMobileStyles(createThemeStyles)
  const fileSource = useMobileEditorFileSource(props.vaultRootUri, props.previewMarkdown)
  const {
    activateEditorChanges,
    editor,
    externalLinkState,
    flushEditorDocument,
    injectEditorCss,
    insertAttachment,
    insertMarkdownBlock,
    insertPlainText,
    insertWikilink,
    layoutProbe,
    notes,
    onCloseExternalLinkSheet,
    onCloseWikilinkPicker,
    onImportAttachment,
    onOpenExternalLinkSheet,
    onOpenToolbarWikilinkPicker,
    onRegisterEditorCommands,
    pickerState,
    sourceNote,
    typeDefinitions,
  } = props
  const actions = useNativeTentapEditorSurfaceActions({
    editor,
    externalLinkState,
    flushEditorDocument,
    insertAttachment,
    insertMarkdownBlock,
    insertPlainText,
    insertWikilink,
    onCloseExternalLinkSheet,
    onCloseWikilinkPicker,
    onImportAttachment: async () => {
      const attachment = await onImportAttachment?.()
      if (attachment && isMobileImageAttachment(attachment)) await fileSource.prepareAttachment?.(attachment.path)
      return attachment ?? null
    },
    onOpenExternalLinkSheet,
    onOpenToolbarWikilinkPicker,
    pickerState,
  })
  useRegisteredMobileEditorCommands(onRegisterEditorCommands, {
    blur: () => editor.blur(),
    pastePlainText: actions.handlePastePlainText,
    save: flushEditorDocument,
  })

  return (
    <MobileKeyboardAvoidingView
      {...probeProps(layoutProbe, 'editor.wysiwyg.form')}
      style={nativeEditorStyles.container}
      testID="editor-wysiwyg-form"
      onTouchStart={activateEditorChanges}
    >
      <MobileWysiwygFind editor={editor} register={onRegisterEditorCommands} onBeforeReplace={activateEditorChanges} />
      {fileSource.ready && (
        <RichText
          editor={editor}
          {...fileSource.webViewProps}
          {...probeProps(layoutProbe, 'editor.wysiwyg.richText')}
          style={nativeEditorStyles.richText}
          testID="editor-wysiwyg-input"
          onLoadEnd={injectEditorCss}
        />
      )}
      <MobileWysiwygSlashMenu editor={editor} />
      <View
        {...probeProps(layoutProbe, 'editor.wysiwyg.toolbarHost')}
        style={nativeEditorStyles.toolbarHost}
      >
        <MobileWysiwygFormattingToolbar
          editor={editor}
          actions={nativeWysiwygFormattingActions}
          layoutProbe={layoutProbe}
          metricId="editor.wysiwyg.toolbar"
          onFormat={actions.handleFormat}
        />
      </View>
      <NativeWysiwygPickerOverlay
        actions={actions}
        notes={notes}
        pickerState={pickerState}
        sourceNote={sourceNote}
        typeDefinitions={typeDefinitions}
        onClose={onCloseWikilinkPicker}
      />
      <NativeWysiwygExternalLinkOverlay
        actions={actions}
        externalLinkState={externalLinkState}
        onClose={onCloseExternalLinkSheet}
      />
    </MobileKeyboardAvoidingView>
  )
}

function useNativeTentapEditorSurfaceActions(props: NativeTentapEditorSurfaceActionProps): NativeTentapEditorSurfaceActions {
  const {
    editor, externalLinkState, flushEditorDocument, insertAttachment,
    insertMarkdownBlock, insertPlainText, insertWikilink,
    onCloseExternalLinkSheet, onCloseWikilinkPicker, onImportAttachment,
    onOpenExternalLinkSheet, onOpenToolbarWikilinkPicker, pickerState,
  } = props
  const handleFormat = useNativeWysiwygToolbarHandler({
    editor,
    insertAttachment,
    insertMarkdownBlock,
    insertPlainText,
    onImportAttachment,
    onOpenExternalLinkSheet,
    onOpenToolbarWikilinkPicker,
  })
  const handlePastePlainText = useCallback(() => {
    void handleFormat('pastePlainText')
  }, [handleFormat])
  const replacementRange = pickerState?.replacementRange
  const handleInsertWikilink = useCallback(
    (payload: NativeWysiwygWikilinkPayload) => {
      insertWikilink(payload, replacementRange)
      onCloseWikilinkPicker()
    },
    [insertWikilink, onCloseWikilinkPicker, replacementRange],
  )
  const handleInsertEmoji = useCallback(
    (payload: NativeWysiwygPlainTextPayload) => {
      insertPlainText(payload, replacementRange)
      onCloseWikilinkPicker()
    },
    [insertPlainText, onCloseWikilinkPicker, replacementRange],
  )
  const externalLinkSelection = externalLinkState?.selection
  const handleApplyExternalLink = useCallback(
    (url: string) => {
      applyNativeWysiwygExternalLink(editor, url, flushEditorDocument, externalLinkSelection)
      onCloseExternalLinkSheet()
    },
    [editor, externalLinkSelection, flushEditorDocument, onCloseExternalLinkSheet],
  )
  const handleRemoveExternalLink = useCallback(() => {
    applyNativeWysiwygExternalLink(editor, null, flushEditorDocument, externalLinkSelection)
    onCloseExternalLinkSheet()
  }, [editor, externalLinkSelection, flushEditorDocument, onCloseExternalLinkSheet])

  return {
    handleApplyExternalLink,
    handleFormat,
    handleInsertEmoji,
    handleInsertWikilink,
    handlePastePlainText,
    handleRemoveExternalLink,
  }
}

function NativeWysiwygPickerOverlay({
  actions,
  notes,
  pickerState,
  sourceNote,
  typeDefinitions,
  onClose,
}: {
  actions: NativeTentapEditorSurfaceActions
  notes: MobileNote[]
  pickerState: NativeWysiwygPickerState | null
  sourceNote: MobileNote
  typeDefinitions: MobileTypeDefinitions | null | undefined
  onClose: () => void
}) {
  if (!pickerState) return null

  return (
    <MobileWysiwygWikilinkPicker
      initialQuery={pickerState.query}
      key={wikilinkPickerKey(pickerState)}
      kind={pickerState.kind}
      notes={notes}
      sourceNote={sourceNote}
      typeDefinitions={typeDefinitions}
      onClose={onClose}
      onSelect={actions.handleInsertWikilink}
      onSelectEmoji={actions.handleInsertEmoji}
    />
  )
}

function NativeWysiwygExternalLinkOverlay({
  actions,
  externalLinkState,
  onClose,
}: {
  actions: NativeTentapEditorSurfaceActions
  externalLinkState: NativeWysiwygExternalLinkSheetState | null
  onClose: () => void
}) {
  if (!externalLinkState) return null

  return (
    <MobileWysiwygExternalLinkSheet
      initialUrl={externalLinkState.initialUrl}
      onApply={actions.handleApplyExternalLink}
      onClose={onClose}
      onRemove={actions.handleRemoveExternalLink}
    />
  )
}

function useNativeWysiwygToolbarHandler({
  editor,
  insertAttachment,
  insertMarkdownBlock,
  insertPlainText,
  onImportAttachment,
  onOpenExternalLinkSheet,
  onOpenToolbarWikilinkPicker,
}: Pick<
  NativeTentapEditorSurfaceProps,
  | 'editor'
  | 'insertAttachment'
  | 'insertMarkdownBlock'
  | 'insertPlainText'
  | 'onImportAttachment'
  | 'onOpenExternalLinkSheet'
  | 'onOpenToolbarWikilinkPicker'
>) {
  return useCallback(
    async (action: Parameters<typeof applyNativeWysiwygFormat>[1]) => {
      if (action === 'attachment') return insertImportedAttachment(onImportAttachment, insertAttachment)
      if (action === 'link') return onOpenExternalLinkSheet()
      if (action === 'pastePlainText') return insertClipboardPlainText(insertPlainText)
      if (action === 'wikilink') return onOpenToolbarWikilinkPicker()
      if (isNativeWysiwygMarkdownBlockAction(action)) return insertMarkdownBlock({ action })

      applyNativeWysiwygFormat(editor as NativeWysiwygCommandBridge, action)
    },
    [
      editor,
      insertAttachment,
      insertMarkdownBlock,
      insertPlainText,
      onImportAttachment,
      onOpenExternalLinkSheet,
      onOpenToolbarWikilinkPicker,
    ],
  )
}

async function insertImportedAttachment(
  onImportAttachment: NativeTentapEditorSurfaceProps['onImportAttachment'],
  insertAttachment: NativeTentapEditorSurfaceProps['insertAttachment'],
) {
  const attachment = await onImportAttachment?.()
  if (attachment) insertAttachment(attachment)
}

async function insertClipboardPlainText(insertPlainText: NativeTentapEditorSurfaceProps['insertPlainText']) {
  const text = await readMobileClipboardText()
  if (text) insertPlainText({ text })
}

function initialNativeEditorContent(
  props: Pick<MobileWysiwygMarkdownEditorProps, 'blocks' | 'bullets' | 'note'>,
): string {
  const { blocks, bullets, note } = props
  return mobileNoteEditableContent({
    ...note,
    editorBlocks: note.editorBlocks ?? blocks,
    editorBullets: bullets,
  })
}

function useNativeTentapEditorBridge(options: NativeTentapEditorBridgeOptions) {
  const runtime = useNativeTentapEditorRuntime(options)
  const { refs, flushEditorDocument, initialContent, injectEditorCss, scheduleEditorChange } = runtime
  const insertions = useNativeWysiwygInsertions(runtime)
  const editor = useEditorBridge({
    // The native viewport shrinks above the keyboard; do not inset the document twice.
    avoidIosKeyboard: false,
    bridgeExtensions: refs.documentReads.extensions,
    customSource: mobileWysiwygTentapEditorHtml,
    initialContent,
    onChange: scheduleEditorChange,
  })
  useNativeTentapEditorLifecycle(options, runtime, editor)
  useNativeWysiwygAutocompleteProbe({
    detectAutocomplete: detectNativeWysiwygInlineAutocomplete,
    enabled: options.wysiwygAutocompleteProbe === true,
    refs,
  })
  useMobileWysiwygOutlineNavigation({
    documentTitle: options.note.title,
    onProof: options.onTableOfContentsScrollProof,
    refs,
    target: options.tableOfContentsTarget,
  })
  useNativeWysiwygTextProbes(options, runtime)
  useNativeWysiwygBlockProbes(options, runtime)
  useFlushOnUnmount(refs, flushEditorDocument)
  return {
    ...insertions,
    activateEditorChanges: () => activateNativeEditorChanges(refs),
    editor,
    flushEditorDocument,
    injectEditorCss,
  }
}

function useNativeTentapEditorRuntime(options: NativeTentapEditorBridgeOptions) {
  const {
    compact,
    initialDocumentContent,
    note,
    onInlineAutocomplete,
    onUpdateContent,
    vaultRootUri = null,
  } = options
  const initialBody = mobileDocumentBody(initialDocumentContent)
  const initialBodyHasContent = initialBody.trim().length > 0
  const initialContent = useMemo(
    () => mobileEditorPreviewHtml(initialBody, vaultRootUri),
    [initialBody, vaultRootUri],
  )
  const refs = useNativeTentapEditorRefs(initialDocumentContent)

  const flushEditorDocument = useFlushEditorDocument({
    externalLinkProbeEnabled: options.wysiwygExternalLinkProbe === true,
    initialBodyHasContent,
    markdownBlockProbeEnabled: options.wysiwygMarkdownBlockProbe === true,
    mutationProbeEnabled: options.wysiwygMutationProbe === true,
    noteId: note.id,
    onUpdateContent,
    refs,
    tableCommandMutationProbeEnabled: options.wysiwygTableCommandMutationProbe === true,
    vaultRootUri,
    wikilinkInsertProbeEnabled: options.wysiwygWikilinkInsertProbe === true,
  })
  const scheduleEditorChange = useScheduleEditorChange(refs, flushEditorDocument, onInlineAutocomplete)
  const injectEditorCss = useEditorCssInjection({
    compact,
    initialContent,
    noteWidth: note.noteWidth,
    refs,
  })
  return { refs, initialContent, flushEditorDocument, scheduleEditorChange, injectEditorCss }
}

function useNativeWysiwygInsertions({ refs, flushEditorDocument }: NativeTentapEditorRuntime) {
  const insertWikilink = useNativeWysiwygInserter({
    flushEditorDocument,
    insertIntoEditor: insertWikilinkIntoNativeEditor,
    refs,
    warning: '[mobile-editor] Failed to insert native WYSIWYG wikilink:',
  })
  const insertAttachment = useNativeWysiwygInserter({
    flushEditorDocument,
    insertIntoEditor: insertAttachmentIntoNativeEditor,
    refs,
    warning: '[mobile-editor] Failed to insert native WYSIWYG attachment:',
  })
  const insertMarkdownBlock = useNativeWysiwygInserter({
    flushEditorDocument,
    insertIntoEditor: insertMarkdownBlockIntoNativeEditor,
    refs,
    warning: '[mobile-editor] Failed to insert native WYSIWYG markdown block:',
  })
  const insertPlainText = useNativeWysiwygInserter({
    flushEditorDocument,
    insertIntoEditor: insertPlainTextIntoNativeEditor,
    refs,
    warning: '[mobile-editor] Failed to insert native WYSIWYG plain text:',
  })
  return { insertWikilink, insertAttachment, insertMarkdownBlock, insertPlainText }
}

function useNativeTentapEditorLifecycle(
  options: NativeTentapEditorBridgeOptions, { refs, initialContent }: NativeTentapEditorRuntime, editor: EditorBridge,
) {
  const { blocks, bullets, note } = options
  useEditorBridgeRef(refs.editorRef, editor)
  useEditableContentRef({ blocks, bullets, note, refs })
  useResetEditorChangeGate({ noteId: note.id, refs })
  useSyncInitialEditorContent({ initialContent, noteId: note.id, refs })
}

function useNativeWysiwygTextProbes(options: NativeTentapEditorBridgeOptions, { refs, flushEditorDocument }: NativeTentapEditorRuntime) {
  useNativeWysiwygExternalLinkProbe({
    enabled: options.wysiwygExternalLinkProbe === true,
    flushEditorDocument,
    refs,
  })
  useNativeWysiwygInputTransformProbe({
    enabled: options.wysiwygInputTransformProbe === true,
    refs,
  })
  useNativeWysiwygFormatCommandProbe({
    enabled: options.wysiwygFormatCommandProbe === true,
    refs,
  })
  useNativeWysiwygMathEditProbe({
    enabled: options.wysiwygMathEditProbe === true,
    refs,
    vaultRootUri: options.vaultRootUri,
  })
}

function useNativeWysiwygBlockProbes(options: NativeTentapEditorBridgeOptions, { refs, flushEditorDocument }: NativeTentapEditorRuntime) {
  useNativeWysiwygDeferredInsertionProbe({
    enabled: options.wysiwygMarkdownBlockProbe === true,
    flushEditorDocument,
    insertIntoEditor: (candidateEditor) => insertNativeWysiwygMarkdownBlockProbe(candidateEditor, refs),
    refs,
    warning: '[mobile-editor] Failed to run native WYSIWYG markdown block probe:',
  })
  useNativeWysiwygDeferredInsertionProbe({
    enabled: options.wysiwygWikilinkInsertProbe === true,
    flushEditorDocument,
    insertIntoEditor: insertNativeWysiwygWikilinkProbe,
    refs,
    warning: '[mobile-editor] Failed to run native WYSIWYG wikilink insert probe:',
  })
  useNativeWysiwygTableCommandMutationProbe({
    enabled: options.wysiwygTableCommandMutationProbe === true,
    flushEditorDocument,
    refs,
  })
  useNativeWysiwygMutationProbe({
    enabled: options.wysiwygMutationProbe === true,
    flushEditorDocument,
    refs,
    vaultRootUri: options.vaultRootUri,
  })
}

function useNativeTentapEditorRefs(initialDocumentContent: string): NativeTentapEditorRefs {
  const acceptsEditorChangesRef = useRef(false)
  const contentRef = useRef(initialDocumentContent)
  const editorRef = useRef<EditorBridge | null>(null)
  const firstEditorSerializationRef = useRef(true)
  const hasAcceptedEditorChangeRef = useRef(false)
  const initialContentSyncRef = useRef<NativeInitialContentSync | null>(null)
  const inlineAutocompleteTimerRef = useRef<TimerHandle | null>(null)
  const markdownBlockProofReadyRef = useRef(false)
  const markdownBlockRenderProofRef = useRef(false)
  const saveTimerRef = useRef<TimerHandle | null>(null)
  const tableCommandMutationProofReadyRef = useRef(false)
  const webViewLoadedRef = useRef(false)

  return useMemo(
    () => ({
      documentReads: createMobileEditorDocumentBridge(mobileTenTapBridgeExtensions),
      acceptsEditorChangesRef,
      contentRef,
      editorRef,
      firstEditorSerializationRef,
      hasAcceptedEditorChangeRef,
      initialContentSyncRef,
      inlineAutocompleteTimerRef,
      markdownBlockProofReadyRef,
      markdownBlockRenderProofRef,
      saveTimerRef,
      tableCommandMutationProofReadyRef,
      webViewLoadedRef,
    }),
    [],
  )
}

async function nativeWysiwygBlockMathRenderProof(editor: EditorBridge): Promise<boolean> {
  if (!isMathBlockRenderableEditorBridge(editor)) return false
  await settleNativeWysiwygEditorContent()
  return editor.getMathBlockRenderProof()
}

function settleNativeWysiwygEditorContent(): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, 60)
  })
}

function useNativeWysiwygInserter<Payload>({
  flushEditorDocument,
  insertIntoEditor,
  refs,
  warning,
}: {
  flushEditorDocument: () => void
  insertIntoEditor: NativeWysiwygEditorMutation<Payload>
  refs: NativeTentapEditorRefs
  warning: string
}) {
  const { editorRef, hasAcceptedEditorChangeRef, saveTimerRef } = refs

  return useCallback(
    (payload: Payload, selection?: NativeWysiwygSelection) => {
      void insertIntoEditor(editorRef.current, payload, selection)
        .then((inserted) => {
          if (!inserted) return

          hasAcceptedEditorChangeRef.current = true
          if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
          saveTimerRef.current = setTimeout(flushEditorDocument, 250)
        })
        .catch((error: unknown) => {
          console.warn(warning, error)
        })
    },
    [editorRef, flushEditorDocument, hasAcceptedEditorChangeRef, insertIntoEditor, saveTimerRef, warning],
  )
}

async function insertWikilinkIntoNativeEditor(
  editor: EditorBridge | null,
  payload: NativeWysiwygWikilinkPayload,
  selection?: NativeWysiwygSelection,
): Promise<boolean> {
  return insertPayloadIntoNativeEditor(editor, payload, selection, nativeWysiwygDocumentWithInsertedWikilink)
}

async function insertAttachmentIntoNativeEditor(
  editor: EditorBridge | null,
  payload: NativeWysiwygAttachmentPayload,
  selection?: NativeWysiwygSelection,
): Promise<boolean> {
  return insertPayloadIntoNativeEditor(editor, payload, selection, nativeWysiwygDocumentWithInsertedAttachment)
}

async function insertMarkdownBlockIntoNativeEditor(
  editor: EditorBridge | null,
  payload: NativeWysiwygMarkdownBlockPayload,
  selection?: NativeWysiwygSelection,
): Promise<boolean> {
  return insertPayloadIntoNativeEditor(editor, payload, selection, nativeWysiwygDocumentWithInsertedMarkdownBlock)
}

async function insertPlainTextIntoNativeEditor(
  editor: EditorBridge | null,
  payload: NativeWysiwygPlainTextPayload,
  selection?: NativeWysiwygSelection,
): Promise<boolean> {
  return insertPayloadIntoNativeEditor(editor, payload, selection, nativeWysiwygDocumentWithInsertedPlainText)
}

async function insertMarkdownBlocksIntoNativeEditor(
  editor: EditorBridge | null,
  payloads: NativeWysiwygMarkdownBlockPayload[],
  refs: NativeTentapEditorRefs,
): Promise<boolean> {
  if (!isJsonReadableEditorBridge(editor) || !isContentSettableEditorBridge(editor)) return false

  let nextJson: unknown = await editor.getJSON()
  const plainTextJson = nativeWysiwygDocumentWithInsertedPlainText({
    json: nextJson,
    payload: nativeWysiwygMarkdownBlockProbePlainTextPayload(),
  })
  if (!plainTextJson) return false

  nextJson = plainTextJson
  for (const payload of payloads) {
    const insertedJson = nativeWysiwygDocumentWithInsertedMarkdownBlock({
      json: nextJson,
      payload,
    })
    if (!insertedJson) return false
    nextJson = insertedJson
  }
  nextJson = nativeWysiwygMarkdownBlockProbeTableGrowthJson(nextJson)
  editor.setContent(nextJson)
  refs.markdownBlockRenderProofRef.current = await nativeWysiwygBlockMathRenderProof(editor)
  refs.markdownBlockProofReadyRef.current = true
  return true
}

function insertNativeWysiwygMarkdownBlockProbe(
  editor: EditorBridge | null,
  refs: NativeTentapEditorRefs,
): Promise<boolean> {
  return insertMarkdownBlocksIntoNativeEditor(editor, nativeWysiwygMarkdownBlockProbePayloads(), refs)
}

async function insertPayloadIntoNativeEditor<Payload>(
  editor: EditorBridge | null,
  payload: Payload,
  selection: NativeWysiwygSelection | undefined,
  buildDocument: NativeWysiwygDocumentBuilder<Payload>,
): Promise<boolean> {
  if (!isJsonReadableEditorBridge(editor) || !isContentSettableEditorBridge(editor)) return false

  const json = await editor.getJSON()
  const nextJson = buildDocument({
    json,
    payload,
    selection: selection ?? nativeWysiwygEditorSelection(editor),
  })
  if (!nextJson) return false

  editor.setContent(nextJson)
  return true
}

function nativeWysiwygEditorSelection(editor: EditorBridge): NativeWysiwygSelection | undefined {
  const selection = nativeWysiwygEditorState(editor)?.selection
  if (typeof selection?.from !== 'number' || typeof selection.to !== 'number') return undefined

  return {
    from: selection.from,
    to: selection.to,
  }
}

const nativeWysiwygEditorState = (editor: EditorBridge | null): NativeWysiwygEditorState | null =>
  isEditorStateReadableBridge(editor) ? editor.getEditorState() : null

function applyNativeWysiwygExternalLink(
  editor: EditorBridge,
  url: string | null,
  flushEditorDocument: () => void,
  selection?: NativeWysiwygSelection,
): void {
  if (selection && isSelectionSettableEditorBridge(editor)) {
    editor.setSelection(selection.from, selection.to)
  }
  if (url === null) {
    void removeNativeWysiwygExternalLink(editor, selection, flushEditorDocument)
    return
  }

  const commandBridge = editor as NativeWysiwygCommandBridge
  if (typeof commandBridge.setLink !== 'function') return

  commandBridge.setLink(url)
  setTimeout(flushEditorDocument, 250)
}

async function removeNativeWysiwygExternalLink(
  editor: EditorBridge,
  selection: NativeWysiwygSelection | undefined,
  flushEditorDocument: () => void,
): Promise<void> {
  if (!isJsonReadableEditorBridge(editor) || !isContentSettableEditorBridge(editor)) return

  const nextJson = nativeWysiwygDocumentWithoutExternalLink({
    json: await editor.getJSON(),
    selection,
  })
  if (!nextJson) return

  editor.setContent(nextJson)
  setTimeout(flushEditorDocument, 250)
}

function useNativeWysiwygDeferredInsertionProbe({
  enabled,
  flushEditorDocument,
  insertIntoEditor,
  refs,
  warning,
}: {
  enabled: boolean
  flushEditorDocument: () => void
  insertIntoEditor: (editor: EditorBridge | null) => Promise<boolean>
  refs: NativeTentapEditorRefs
  warning: string
}) {
  const hasInsertedRef = useRef(false)

  useEffect(() => {
    if (!enabled) {
      hasInsertedRef.current = false
      return undefined
    }
    if (hasInsertedRef.current) return undefined

    let insertTimer: TimerHandle | null = null
    let disposed = false
    const scheduleRetry = () => {
      if (disposed) return
      insertTimer = setTimeout(insertWhenReady, 250)
    }
    const insertWhenReady = () => {
      if (!refs.acceptsEditorChangesRef.current) {
        scheduleRetry()
        return
      }

      const editor = refs.editorRef.current
      hasInsertedRef.current = true
      void insertIntoEditor(editor)
        .then((inserted) => {
          if (!inserted) {
            hasInsertedRef.current = false
            scheduleRetry()
            return
          }

          refs.hasAcceptedEditorChangeRef.current = true
          if (refs.saveTimerRef.current) clearTimeout(refs.saveTimerRef.current)
          flushEditorDocument()
          refs.saveTimerRef.current = setTimeout(flushEditorDocument, 250)
        })
        .catch((error: unknown) => {
          hasInsertedRef.current = false
          console.warn(warning, error)
          scheduleRetry()
        })
    }

    scheduleRetry()

    return () => {
      disposed = true
      if (insertTimer) clearTimeout(insertTimer)
      if (refs.saveTimerRef.current) clearTimeout(refs.saveTimerRef.current)
    }
  }, [enabled, flushEditorDocument, insertIntoEditor, refs, warning])
}

function inlineAutocompletePickerState(
  current: NativeWysiwygPickerState | null,
  match: NativeWysiwygInlineAutocomplete | null,
): NativeWysiwygPickerState | null {
  if (current?.source === 'toolbar') return current
  if (!match) return current?.source === 'inline' ? null : current

  return {
    kind: match.kind,
    query: match.query,
    replacementRange: match.range,
    source: 'inline',
  }
}

function wikilinkPickerKey(state: NativeWysiwygPickerState): string {
  return [
    state.source,
    state.kind,
    state.query,
    state.replacementRange?.from ?? 'selection',
    state.replacementRange?.to ?? 'selection',
  ].join(':')
}

function useScheduleEditorChange(
  refs: NativeTentapEditorRefs,
  flushEditorDocument: () => void,
  onInlineAutocomplete: NativeWysiwygInlineAutocompleteHandler,
) {
  const { acceptsEditorChangesRef, editorRef, hasAcceptedEditorChangeRef, inlineAutocompleteTimerRef, saveTimerRef } =
    refs

  return useCallback(() => {
    if (!acceptsEditorChangesRef.current) return
    hasAcceptedEditorChangeRef.current = true
    scheduleNativeWysiwygSave({ flushEditorDocument, saveTimerRef })
    if (inlineAutocompleteTimerRef.current) clearTimeout(inlineAutocompleteTimerRef.current)
    inlineAutocompleteTimerRef.current = setTimeout(() => {
      void applyNativeWysiwygInputTransforms(editorRef.current)
        .then((transformed) => {
          if (transformed) scheduleNativeWysiwygSave({ flushEditorDocument, saveTimerRef })
          return detectNativeWysiwygInlineAutocomplete(editorRef.current)
        })
        .then(onInlineAutocomplete)
        .catch((error: unknown) => {
          console.warn('[mobile-editor] Failed to run native WYSIWYG change handlers:', error)
        })
    }, 80)
  }, [
    acceptsEditorChangesRef,
    editorRef,
    flushEditorDocument,
    hasAcceptedEditorChangeRef,
    inlineAutocompleteTimerRef,
    onInlineAutocomplete,
    saveTimerRef,
  ])
}

function scheduleNativeWysiwygSave({
  flushEditorDocument,
  saveTimerRef,
}: {
  flushEditorDocument: () => void
  saveTimerRef: MutableRefObject<TimerHandle | null>
}) {
  if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
  saveTimerRef.current = setTimeout(flushEditorDocument, 250)
}

async function applyNativeWysiwygInputTransforms(editor: EditorBridge | null): Promise<boolean> {
  if (!isJsonReadableEditorBridge(editor) || !isContentSettableEditorBridge(editor)) return false

  const nextJson = nativeWysiwygDocumentWithInputTransforms({
    json: await editor.getJSON(),
    selection: nativeWysiwygEditorSelection(editor),
  })
  if (!nextJson) return false

  editor.setContent(nextJson)
  return true
}

async function detectNativeWysiwygInlineAutocomplete(
  editor: EditorBridge | null,
): Promise<NativeWysiwygInlineAutocomplete | null> {
  if (!isJsonReadableEditorBridge(editor)) return null

  return nativeWysiwygInlineAutocompleteAtSelection({
    json: await editor.getJSON(),
    selection: nativeWysiwygEditorSelection(editor),
  })
}

function isEditorStateReadableBridge(editor: EditorBridge | null): editor is EditorStateReadableBridge {
  return typeof (editor as Partial<EditorStateReadableBridge> | null)?.getEditorState === 'function'
}

function isMathBlockRenderableEditorBridge(editor: EditorBridge | null): editor is MathBlockRenderableEditorBridge {
  return typeof (editor as Partial<MathBlockRenderableEditorBridge> | null)?.getMathBlockRenderProof === 'function'
}

function isSelectionSettableEditorBridge(editor: EditorBridge | null): editor is SelectionSettableEditorBridge {
  return typeof (editor as Partial<SelectionSettableEditorBridge> | null)?.setSelection === 'function'
}

function createThemeStyles(mobileColors: MobileColors, metrics: MobileMetrics) {
  const { space: mobileSpace } = metrics
  const nativeEditorStyles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: mobileColors.editor,
    },
    richText: {
      flex: 1,
      backgroundColor: mobileColors.editor,
    },
    toolbarHost: {
      backgroundColor: mobileColors.editor,
      borderTopColor: mobileColors.border,
      borderTopWidth: StyleSheet.hairlineWidth,
      paddingHorizontal: mobileSpace.md,
      paddingTop: mobileSpace.xs,
    },
  })
  return { mobileColors, nativeEditorStyles }
}
