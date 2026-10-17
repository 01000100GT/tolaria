import { useEffect, useRef, useState } from 'react'
import type { GitProgressEvent } from 'isomorphic-git'

export type GitCloneControl = {
  signal: AbortSignal
  onProgress: (progress: GitProgressEvent) => void
}

export function useGitCloneProgress() {
  const active = useRef<AbortController | null>(null)
  const [progress, setProgress] = useState<GitProgressEvent | null>(null)
  const [running, setRunning] = useState(false)
  const [cancelling, setCancelling] = useState(false)
  useEffect(() => () => { active.current?.abort(); active.current = null }, [])

  const run = async <T>(task: (control: GitCloneControl) => Promise<T>): Promise<T> => {
    if (active.current) throw new Error('cloneInProgress')
    const controller = new AbortController()
    active.current = controller
    setRunning(true)
    setProgress(null)
    const publish = throttledProgress(setProgress)
    try {
      return await task({ signal: controller.signal, onProgress: event => {
        if (active.current === controller && !controller.signal.aborted) publish(event)
      } })
    } finally {
      if (active.current === controller) {
        active.current = null
        setProgress(null)
        setRunning(false)
        setCancelling(false)
      }
    }
  }
  const cancel = () => {
    if (!active.current) return
    active.current.abort()
    setCancelling(true)
  }
  return { run, cancel, running, cancelling, progress }
}

function throttledProgress(publish: (progress: GitProgressEvent) => void) {
  let previousPhase: string | null = null
  let publishedAt = -Infinity
  return (event: GitProgressEvent) => {
    const now = performance.now()
    const complete = event.total !== undefined && event.loaded === event.total
    if (event.phase === previousPhase && !complete && now - publishedAt < 100) return
    previousPhase = event.phase
    publishedAt = now
    publish(event)
  }
}
