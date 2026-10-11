import type { createWorkspaceSyncEditors } from '../workspaceSyncEditors'
import { withSavedWorkspace } from './workspaceWriteQueue'

type SavedVaultOperation = {
  editors: ReturnType<typeof createWorkspaceSyncEditors>
  rootUri?: string
  // Return cancelled only when the operation has not changed any workspace files.
  run: () => Promise<undefined | 'cancelled'>
  refresh: (selectedNoteId?: string) => void
}

export async function runSavedVaultOperation({ editors, rootUri, run, refresh }: SavedVaultOperation) {
  const selectedNoteId = editors.selectedNoteId()
  const resume = await editors.prepare()
  let saved = false
  let cancelled = false
  let cancelReplacement = () => {}
  try {
    if (rootUri) await withSavedWorkspace(rootUri, async () => {})
    saved = true
    cancelReplacement = editors.beginReplacement()
    cancelled = await run() === 'cancelled'
  } finally {
    if (cancelled) cancelReplacement()
    // Changed or possibly changed files require fresh editors, even after failure.
    if (saved && !cancelled) refresh(selectedNoteId)
    else resume()
  }
}
