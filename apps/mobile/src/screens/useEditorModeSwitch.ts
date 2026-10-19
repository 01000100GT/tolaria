import { useCallback, useContext, useLayoutEffect, useRef, useState } from 'react'
import { WorkspaceSyncEditorsContext } from '../workspace/workspaceSyncEditors'

export function useEditorModeSwitch(noteId: string | undefined, changeMode: () => void) {
  const editors = useContext(WorkspaceSyncEditorsContext)
  const generation = useRef(0)
  const busy = useRef(false)
  const [failed, setFailed] = useState(false)
  useLayoutEffect(() => {
    generation.current += 1
    setFailed(false)
    return () => { generation.current += 1 }
  }, [noteId])

  const toggle = useCallback(() => {
    if (busy.current) return
    busy.current = true
    const requested = generation.current
    void (async () => {
      try {
        const resume = await editors?.prepare()
        try {
          if (requested === generation.current) { changeMode(); setFailed(false) }
        } finally { resume?.() }
      } catch {
        if (requested === generation.current) setFailed(true)
      } finally { busy.current = false }
    })()
  }, [changeMode, editors])
  return { toggle, failed }
}
