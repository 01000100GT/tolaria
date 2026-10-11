import { mobileNoteActionMode } from './mobileNoteActionMode'
import type { MobileWorkspaceEdit } from './mobileWorkspaceEditing'
import type { MobileNote, MobileWorkspaceSnapshot } from './mobileWorkspaceModel'
import type { ReadOnlyWorkspaceRequest } from './readOnlyWorkspaceRepository'

type WorkspaceSource = ReadOnlyWorkspaceRequest['source']

export type MobileNoteReadState = {
  status: 'ready' | 'loading' | 'error'
  retry: () => void
}

export function mobileNoteNeedsRead(note: MobileNote | null, source: WorkspaceSource): boolean {
  if (!source || source === 'fixture' || !note) return false
  return note.rawContent === undefined && mobileNoteActionMode(note) !== 'binary-file'
}

export function isMobileNoteHydration(edit: MobileWorkspaceEdit): boolean {
  return edit.type === 'hydrateNoteContent' || edit.type === 'hydrateTextFileContent'
}

export function mobileEditNeedsNoteRead(edit: MobileWorkspaceEdit, snapshot: MobileWorkspaceSnapshot, source: WorkspaceSource): boolean {
  if (isMobileNoteHydration(edit) || edit.type === 'deleteNote') return false
  if (edit.type === 'bulkEdit') return edit.edits.some((child) => mobileEditNeedsNoteRead(child, snapshot, source))
  const noteId = edit.type === 'createRelationshipTarget' ? edit.sourceNoteId : noteEditId(edit)
  if (!noteId) return false
  const note = snapshot.notes.find((item) => item.id === noteId)
    ?? snapshot.allNotes?.find((item) => item.id === noteId)
  return mobileNoteNeedsRead(note ?? null, source)
}

function noteEditId(edit: MobileWorkspaceEdit): string | null {
  return 'noteId' in edit ? edit.noteId : null
}

export function startMobileNoteRead({ read, onContent, onError }: {
  read: () => Promise<string | null>
  onContent: (content: string) => void
  onError: () => void
}) {
  let cancelled = false
  const finished = (async () => {
    try {
      const content = await read()
      if (cancelled) return
      if (content === null) onError()
      else onContent(content)
    } catch {
      if (!cancelled) onError()
    }
  })()
  return { cancel: () => { cancelled = true }, finished }
}
