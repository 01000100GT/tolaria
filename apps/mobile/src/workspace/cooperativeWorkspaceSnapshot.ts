import { localVaultWorkspaceSnapshotSteps, type LocalVaultSnapshotOptions } from './localVaultSnapshot'
import { createGitTaskRunner } from './git/gitTaskRunner'

/** Reuse the existing task budget without changing the synchronous parser's results. */
export async function buildCooperativeWorkspaceSnapshot(options: LocalVaultSnapshotOptions, signal?: AbortSignal) {
  const work = localVaultWorkspaceSnapshotSteps(options)
  const { run } = createGitTaskRunner()
  for (;;) {
    const step = await run(() => {
      requireActiveSnapshotLoad(signal)
      return work.next()
    })
    if (step.done) return step.value
  }
}

function requireActiveSnapshotLoad(signal?: AbortSignal) {
  if (signal?.aborted) throw new Error('workspaceLoadCancelled')
}
