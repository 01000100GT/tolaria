import { useEffect, useRef } from 'react'
import { AppState } from 'react-native'
import { createMobileAutoGit } from './git/mobileAutoGit'
import type { createWorkspaceSyncEditors } from './workspaceSyncEditors'

export function useLinkedFolderSync({ root, blocked, editors, sync }: {
  root?: string
  blocked: boolean
  editors: ReturnType<typeof createWorkspaceSyncEditors>
  sync: () => Promise<void>
}) {
  const latest = useRef({ blocked, sync })
  useEffect(() => { latest.current = { blocked, sync } }, [blocked, sync])
  const scheduler = useRef<ReturnType<typeof createMobileAutoGit> | null>(null)
  useEffect(() => {
    if (!root) return
    const task = createMobileAutoGit(() => latest.current.sync(), 5_000)
    scheduler.current = task
    const update = () => task.update({ enabled: true, foreground: AppState.currentState === 'active', blocked: latest.current.blocked })
    const dirty = editors.subscribeDirty(task.dirty)
    const subscription = AppState.addEventListener('change', () => { update(); task.dirty() })
    const timer = setInterval(task.dirty, 60_000)
    update()
    task.dirty()
    return () => { dirty(); subscription.remove(); clearInterval(timer); task.dispose(); scheduler.current = null }
  }, [editors, root])
  useEffect(() => {
    scheduler.current?.update({ enabled: Boolean(root), foreground: AppState.currentState === 'active', blocked })
  }, [blocked, root])
}
