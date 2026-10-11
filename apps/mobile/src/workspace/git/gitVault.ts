import './gitRuntime'
import git, { type FsClient } from 'isomorphic-git'
import { checkoutGitFastForward, recoverGitCheckout } from './gitCheckoutRecovery'

export type GitAuthor = { name: string; email: string }
export type GitRelationship = 'equal' | 'ahead' | 'behind' | 'diverged'
export type GitVaultContext = { fs: FsClient; dir: string; cache?: object }

export { githubRepositoryUrl } from './githubRepositoryUrl'

export function createGitVault(options: GitVaultContext) {
  const context = { ...options, cache: options.cache ?? {} }
  return {
    checkpoint: (author: GitAuthor, message?: string) => checkpoint(context, author, message),
    requireClean: () => requireClean(context),
    integrate: (remoteOid: string) => integrate(context, remoteOid),
    relationship: (remoteOid: string) => relationship(context, remoteOid),
    recover: () => recoverGitCheckout(context),
  }
}

async function changes(context: GitVaultContext) {
  return (await git.statusMatrix(context)).filter(([, head, worktree, stage]) => head !== worktree || head !== stage)
}

async function refreshedChanges(context: GitVaultContext) {
  await recoverGitCheckout(context)
  // Do not trust second-resolution stat matches for rapid equal-length edits.
  await git.add({ ...context, filepath: '.', parallel: false })
  return changes(context)
}

async function requireClean(context: GitVaultContext) {
  if ((await refreshedChanges(context)).length) throw new Error('uncommittedChanges')
  return { changedFiles: 0, oid: await git.resolveRef({ ...context, ref: 'HEAD' }) }
}

async function checkpoint(context: GitVaultContext, author: GitAuthor, message = 'Update vault from Tolaria mobile') {
  if (!message.trim()) throw new Error('emptyCommitMessage')
  const changed = await refreshedChanges(context)
  for (const [filepath, , worktree] of changed) {
    if (worktree === 0) await git.remove({ ...context, filepath })
  }
  const oid = changed.length
    ? await git.commit({ ...context, author, message: message.trim() })
    : await git.resolveRef({ ...context, ref: 'HEAD' })
  return { changedFiles: changed.length, oid }
}

async function relationship(context: GitVaultContext, remoteOid: string): Promise<GitRelationship> {
  const head = await git.resolveRef({ ...context, ref: 'HEAD' })
  if (head === remoteOid) return 'equal'
  if (await git.isDescendent({ ...context, oid: head, ancestor: remoteOid })) return 'ahead'
  if (await git.isDescendent({ ...context, oid: remoteOid, ancestor: head })) return 'behind'
  return 'diverged'
}

async function integrate(context: GitVaultContext, remoteOid: string) {
  await recoverGitCheckout(context)
  if ((await changes(context)).length) throw new Error('dirtyWorkingCopy')
  const state = await relationship(context, remoteOid)
  if (state !== 'behind') return state
  const branch = await git.currentBranch(context)
  if (!branch) throw new Error('detachedHead')
  await checkoutGitFastForward(context, branch, remoteOid)
  return 'updated' as const
}
