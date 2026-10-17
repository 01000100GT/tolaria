import git, { type PromiseFsClient, type StatusRow } from 'isomorphic-git'
import type { GitVaultContext } from './gitVault'

const smallBatchLimit = 16
type StagedBlob = { oid: string; mode: number }
type FileStat = { isFile: () => boolean; isSymbolicLink: () => boolean; mode: number }

/** Verify actual bytes; timestamps alone cannot exclude a rapid equal-length edit. */
export async function stageVerifiedGitChanges(context: GitVaultContext) {
  const files = await changedPaths(context)
  if (!files) {
    await git.add({ ...context, filepath: '.', parallel: false })
    return
  }
  // Arrays passed to git.add run concurrently even with parallel:false.
  for (const filepath of files) await git.add({ ...context, filepath, parallel: false })
}

async function changedPaths(context: GitVaultContext): Promise<string[] | null> {
  if (!('promises' in context.fs)) return null
  const autocrlf = await git.getConfig({ ...context, path: 'core.autocrlf' })
  if (autocrlf && autocrlf !== 'false') return null
  const staged = await stagedBlobs(context)
  const rows = await git.statusMatrix({ ...context, refresh: false })
  return collectChangedPaths(context.fs.promises, context.dir, rows, staged)
}

async function collectChangedPaths(fs: PromiseFsClient['promises'], dir: string, rows: StatusRow[], staged: Map<string, StagedBlob>) {
  const files: string[] = []
  for (const [filepath, , worktree] of rows) {
    if (worktree === 0) continue
    const original = staged.get(filepath)
    const changed = original ? await differs(fs, dir, filepath, original) : true
    if (changed === null) return null
    if (changed) files.push(filepath)
    if (files.length > smallBatchLimit) return null
  }
  return files
}

async function stagedBlobs(context: GitVaultContext) {
  const blobs = new Map<string, StagedBlob>()
  await git.walk({ ...context, trees: [git.STAGE()], map: async (filepath, [entry]) => {
    if (entry && await entry.type() === 'blob') {
      blobs.set(filepath, { oid: await entry.oid(), mode: await entry.mode() })
    }
  } })
  return blobs
}

async function differs(fs: PromiseFsClient['promises'], dir: string, filepath: string, staged: StagedBlob) {
  const path = `${dir}/${filepath}`
  const stat: FileStat = await fs.lstat(path)
  if (!stat.isFile() || stat.isSymbolicLink()) return null
  const mode = (stat.mode & 0o111) ? 0o100755 : 0o100644
  const object: Uint8Array = await fs.readFile(path)
  const { oid } = await git.hashBlob({ object })
  return oid !== staged.oid || mode !== staged.mode
}
