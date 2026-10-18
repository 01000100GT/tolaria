import type { EditorBridge } from '@10play/tentap-editor'
import { type MutableRefObject, useCallback, useContext, useEffect, useRef } from 'react'
import { mobileNoteEditableContent } from '../../workspace/mobileDocumentContent'
import type { MobileEditorBlock, MobileNote } from '../../workspace/mobileWorkspaceModel'
import { injectMobileEditorAppearance, useEditorAppearance } from './useEditorAppearance'
import { WorkspaceSyncEditorsContext } from '../../workspace/workspaceSyncEditors'
import { scheduleCreatedEditorFocus } from '../../workspace/mobileEditorFocus'
import type { createMobileEditorDocumentBridge } from './MobileWysiwygDocumentReads.native'

type TimerHandle = ReturnType<typeof setTimeout>

export type NativeTentapEditorRefs = {
  documentReads: ReturnType<typeof createMobileEditorDocumentBridge>
  acceptsEditorChangesRef: MutableRefObject<boolean>
  contentRef: MutableRefObject<string>
  editorReadyTimerRef: MutableRefObject<TimerHandle | null>
  editorRef: MutableRefObject<EditorBridge | null>
  firstEditorSerializationRef: MutableRefObject<boolean>
  hasAcceptedEditorChangeRef: MutableRefObject<boolean>
  initialContentRetryTimerRefs: MutableRefObject<TimerHandle[]>
  inlineAutocompleteTimerRef: MutableRefObject<TimerHandle | null>
  markdownBlockProofReadyRef: MutableRefObject<boolean>
  markdownBlockRenderProofRef: MutableRefObject<boolean>
  saveTimerRef: MutableRefObject<TimerHandle | null>
  tableCommandMutationProofReadyRef: MutableRefObject<boolean>
}

type ContentSettableEditorBridge = EditorBridge & {
  setContent: (content: unknown) => void
}

type SilentContentSettableEditorBridge = EditorBridge & {
  setContentSilently: (content: string) => void
}

const nativeInitialContentRetryDelaysMs = [80, 240, 520, 1_100] as const
const nativeInitialContentReadyDelayMs = 1_250

export function useEditorCssInjection({
  compact,
  initialContent,
  noteWidth,
  refs,
}: {
  compact: boolean
  initialContent: string
  noteWidth: MobileNote['noteWidth']
  refs: NativeTentapEditorRefs
}) {
  const { editorRef } = refs
  const css = useEditorAppearance({ compact, noteWidth, editorRef })

  return useCallback(() => {
    injectMobileEditorAppearance(editorRef.current, css)
    syncNativeInitialEditorContent({ initialContent, readyDelayMs: nativeInitialContentReadyDelayMs, refs })
  }, [css, editorRef, initialContent, refs])
}

export function useEditorBridgeRef(editorRef: MutableRefObject<EditorBridge | null>, editor: EditorBridge) {
  useEffect(() => {
    editorRef.current = editor
  }, [editor, editorRef])
}

export function useEditableContentRef({
  blocks,
  bullets,
  note,
  refs,
}: {
  blocks: MobileEditorBlock[]
  bullets: string[]
  note: MobileNote
  refs: NativeTentapEditorRefs
}) {
  const { contentRef } = refs

  useEffect(() => {
    contentRef.current = mobileNoteEditableContent({
      ...note,
      editorBlocks: note.editorBlocks ?? blocks,
      editorBullets: bullets,
    })
  }, [blocks, bullets, contentRef, note])
}

export function useResetEditorChangeGate({ noteId, refs }: { noteId: string; refs: NativeTentapEditorRefs }) {
  useEffect(() => resetEditorChangeGate(noteId, refs), [noteId, refs])
}

export function useSyncInitialEditorContent({
  initialContent,
  noteId,
  refs,
}: {
  initialContent: string
  noteId: string
  refs: NativeTentapEditorRefs
}) {
  const syncedContentRef = useRef<{ content: string; noteId: string } | null>(null)
  const editors = useContext(WorkspaceSyncEditorsContext)

  useEffect(() => {
    syncInitialEditorContent({
      initialContent,
      noteId,
      refs,
      syncedContentRef,
    })
  }, [initialContent, noteId, refs])
  useEffect(() => {
    if (!editors) return
    return scheduleCreatedEditorFocus({
      requests: editors.focus,
      noteId,
      isReady: () => !editors.isBlocked() && nativeInitialContentReady(refs),
      focus: () => { activateNativeEditorChanges(refs); refs.editorRef.current?.focus('start') },
    })
  }, [editors, noteId, refs])
}

function nativeInitialContentReady(refs: NativeTentapEditorRefs) {
  return refs.editorRef.current?.getEditorState().isReady === true
    && refs.editorReadyTimerRef.current !== null
    && refs.initialContentRetryTimerRefs.current.length === 0
}

export function useFlushOnUnmount(refs: NativeTentapEditorRefs, flushEditorDocument: () => void) {
  useEffect(() => {
    refs.documentReads.requests.activate()
    return () => {
      clearNativeInitialEditorContentTimers(refs)
      clearTimer(refs.inlineAutocompleteTimerRef.current)
      clearTimer(refs.saveTimerRef.current)
      if (refs.hasAcceptedEditorChangeRef.current) flushEditorDocument()
      refs.documentReads.requests.retire()
    }
  }, [flushEditorDocument, refs])
}

export function isContentSettableEditorBridge(editor: EditorBridge | null): editor is ContentSettableEditorBridge {
  return typeof (editor as Partial<ContentSettableEditorBridge> | null)?.setContent === 'function'
}

function syncNativeInitialEditorContent({
  initialContent,
  readyDelayMs,
  refs,
}: {
  initialContent: string
  readyDelayMs: number
  refs: NativeTentapEditorRefs
}) {
  if (refs.hasAcceptedEditorChangeRef.current) return

  clearNativeInitialEditorContentTimers(refs)
  refs.acceptsEditorChangesRef.current = false
  setNativeInitialEditorContent(initialContent, refs)
  refs.initialContentRetryTimerRefs.current.push(...scheduleInitialContentRetries({
    initialContent,
    setContent: (content) => setNativeInitialEditorContent(content, refs),
    shouldRetry: () => !refs.hasAcceptedEditorChangeRef.current,
  }))
  refs.editorReadyTimerRef.current = setTimeout(() => finishInitialContentSync(refs), readyDelayMs)
}

export function scheduleInitialContentRetries({
  initialContent,
  setContent,
  shouldRetry,
}: {
  initialContent: string
  setContent: (content: string) => void
  shouldRetry: () => boolean
}): TimerHandle[] {
  return nativeInitialContentRetryDelaysMs.map((delayMs) => setTimeout(() => {
    if (shouldRetry()) setContent(initialContent)
  }, delayMs))
}

function finishInitialContentSync(refs: NativeTentapEditorRefs) {
  const editor = refs.editorRef.current
  if (!isSilentContentSettableEditorBridge(editor)) {
    refs.editorReadyTimerRef.current = setTimeout(() => finishInitialContentSync(refs), 250)
    return
  }
  clearNativeInitialContentRetryTimers(refs)
}

function setNativeInitialEditorContent(initialContent: string, refs: NativeTentapEditorRefs) {
  setNativeEditorContentSilently(refs.editorRef.current, initialContent)
}

export function setNativeEditorContentSilently(editor: EditorBridge | null, content: string): boolean {
  if (!isSilentContentSettableEditorBridge(editor)) return false
  editor.setContentSilently(content)
  return true
}

export function activateNativeEditorChanges(refs: NativeTentapEditorRefs) {
  refs.acceptsEditorChangesRef.current = true
}

function clearNativeInitialEditorContentTimers(refs: NativeTentapEditorRefs) {
  clearTimer(refs.editorReadyTimerRef.current)
  refs.editorReadyTimerRef.current = null
  clearNativeInitialContentRetryTimers(refs)
}

function clearNativeInitialContentRetryTimers(refs: NativeTentapEditorRefs) {
  for (const timer of refs.initialContentRetryTimerRefs.current) clearTimeout(timer)
  refs.initialContentRetryTimerRefs.current = []
}

function clearTimer(timer: TimerHandle | null) {
  if (timer) clearTimeout(timer)
}

function resetEditorChangeGate(_noteId: string, refs: NativeTentapEditorRefs) {
  refs.acceptsEditorChangesRef.current = false
  refs.firstEditorSerializationRef.current = true
  refs.hasAcceptedEditorChangeRef.current = false
  refs.markdownBlockProofReadyRef.current = false
  refs.markdownBlockRenderProofRef.current = false
  refs.tableCommandMutationProofReadyRef.current = false
}

function syncInitialEditorContent({
  initialContent,
  noteId,
  refs,
  syncedContentRef,
}: {
  initialContent: string
  noteId: string
  refs: NativeTentapEditorRefs
  syncedContentRef: MutableRefObject<{
    content: string
    noteId: string
  } | null>
}) {
  if (!shouldSyncInitialContent(initialContent, noteId, refs, syncedContentRef.current)) return

  clearTimer(refs.saveTimerRef.current)
  refs.firstEditorSerializationRef.current = true
  syncNativeInitialEditorContent({ initialContent, readyDelayMs: nativeInitialContentReadyDelayMs, refs })
  syncedContentRef.current = { content: initialContent, noteId }
}

function shouldSyncInitialContent(
  initialContent: string,
  noteId: string,
  refs: NativeTentapEditorRefs,
  syncedContent: { content: string; noteId: string } | null,
) {
  if (!isContentSettableEditorBridge(refs.editorRef.current)) return false
  if (syncedContent?.noteId === noteId && syncedContent.content === initialContent) return false
  return !refs.hasAcceptedEditorChangeRef.current
}

function isSilentContentSettableEditorBridge(
  editor: EditorBridge | null,
): editor is SilentContentSettableEditorBridge {
  return editor !== null
    && 'setContentSilently' in editor
    && typeof editor.setContentSilently === 'function'
}
