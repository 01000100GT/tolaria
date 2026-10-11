import { useEffect, useRef, useState } from 'react'
import { AppState } from 'react-native'
import type { createWorkspaceSyncEditors } from '../workspaceSyncEditors'
import { createMobileAutoGit } from './mobileAutoGit'

export function useMobileAutoGit({ blocked, editors, enabled, rootUri, sync }: {
  blocked: boolean
  editors: ReturnType<typeof createWorkspaceSyncEditors>
  enabled: boolean
  rootUri?: string
  sync: () => Promise<unknown>
}) {
  const syncRef = useRef(sync)
  const schedulerRef = useRef<ReturnType<typeof createMobileAutoGit> | null>(null)
  const [foreground, setForeground] = useState(AppState.currentState === 'active')
  useEffect(() => { syncRef.current = sync }, [sync])
  useEffect(() => {
    const scheduler = createMobileAutoGit(() => rootUri ? syncRef.current() : Promise.resolve())
    schedulerRef.current = scheduler
    const unsubscribe = editors.subscribeDirty(scheduler.dirty)
    return () => { unsubscribe(); scheduler.dispose(); schedulerRef.current = null }
  }, [editors, rootUri])
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => setForeground(state === 'active'))
    return () => subscription.remove()
  }, [])
  useEffect(() => {
    schedulerRef.current?.update({ enabled, foreground, blocked })
  }, [blocked, enabled, foreground, editors, rootUri])
  useEffect(() => {
    const scheduler = schedulerRef.current
    if (!scheduler || !enabled || !foreground) return
    scheduler.dirty()
    const timer = setInterval(scheduler.dirty, 120_000)
    return () => clearInterval(timer)
  }, [enabled, foreground, editors, rootUri])
}
