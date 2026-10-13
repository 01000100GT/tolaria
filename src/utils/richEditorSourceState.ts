interface SourceSnapshot {
  source: string
  rendered: string
}

const snapshots = new WeakMap<object, Map<string, SourceSnapshot>>()
const SNAPSHOT_LIMIT = 32

export function rememberRichEditorSource(editor: object, path: string, source: string, rendered: string): void {
  const states = snapshots.get(editor) ?? new Map<string, SourceSnapshot>()
  const key = `${path}\u0000${source}`
  states.delete(key)
  states.set(key, { source, rendered })
  while (states.size > SNAPSHOT_LIMIT) {
    const oldest = states.keys().next().value
    if (oldest === undefined) break
    states.delete(oldest)
  }
  snapshots.set(editor, states)
}

export function readRichEditorSource(editor: object, path: string, source: string): SourceSnapshot | undefined {
  return snapshots.get(editor)?.get(`${path}\u0000${source}`)
}
