import { useCallback, useContext, useLayoutEffect, useRef, useState } from 'react'
import { WorkspaceSyncEditorsContext } from '../workspace/workspaceSyncEditors'

export function useEditorModeSwitch(noteId: string | undefined, changeMode: () => void) {
  const editors = useContext(WorkspaceSyncEditorsContext)
  const generation = useRef<symbol | null>(null)
  const busy = useRef(false)
  const [failed, setFailed] = useState(false)
  useLayoutEffect(() => {
    generation.current = Symbol(noteId)
    setFailed(false)
    return () => { generation.current = null }
  }, [noteId])

  const toggle = useCallback(() => {
    if (busy.current) return
    busy.current = true
    const requested = generation.current
    void (async () => {
      try {
        const resume = await editors?.prepare()
        try {
          if (requested !== null && requested === generation.current) { changeMode(); setFailed(false) }
        } finally { resume?.() }
      } catch {
        if (requested !== null && requested === generation.current) setFailed(true)
      } finally { busy.current = false }
    })()
  }, [changeMode, editors])
  return { toggle, failed }
}
