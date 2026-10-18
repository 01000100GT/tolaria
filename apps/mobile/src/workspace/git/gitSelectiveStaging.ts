import git, { type WalkerEntry, type WalkerIterate } from 'isomorphic-git'
import type { GitVaultContext } from './gitVault'

const smallBatchLimit = 16
type Scan = {
  context: GitVaultContext
  files: string[]
  fallback: boolean
  read: (filepath: string) => Promise<Uint8Array>
}
type Entry = { filepath: string; worktree: WalkerEntry | null; stage: WalkerEntry | null }

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
  const fs = context.fs.promises
  const scan: Scan = { context, files: [], fallback: false, read: async (filepath) => fs.readFile(`${context.dir}/${filepath}`) }
  await git.walk({
    ...context,
    trees: [git.WORKDIR({ refresh: false }), git.STAGE()],
    iterate: serially(scan),
    map: mapEntry.bind(null, scan),
  })
  return scan.fallback ? null : scan.files
}

function mapEntry(scan: Scan, filepath: string, entries: (WalkerEntry | null)[]) {
  return inspectEntry(scan, { filepath, worktree: entries[0], stage: entries[1] })
}

async function inspectEntry(scan: Scan, entry: Entry) {
  const { filepath, worktree, stage } = entry
  if (scan.fallback || !worktree) return null
  if (await ignoredUntrackedEntry(scan.context, entry)) return null
  if (await worktree.type() === 'tree') {
    scan.fallback = await incompatibleDirectory(stage)
    return
  }
  recordChange(scan, filepath, await blobDiffers(scan, entry))
}

async function ignoredUntrackedEntry(context: GitVaultContext, { filepath, stage }: Entry) {
  return !stage && await git.isIgnored({ ...context, filepath })
}

async function incompatibleDirectory(stage: WalkerEntry | null) {
  return stage ? await stage.type() !== 'tree' : false
}

function recordChange(scan: Scan, filepath: string, changed: boolean | null) {
  if (changed) scan.files.push(filepath)
  scan.fallback = changed === null || scan.files.length > smallBatchLimit
}

async function blobDiffers(scan: Scan, { filepath, worktree, stage }: Entry) {
  if (!worktree) return false
  const mode = await worktree.mode()
  if (mode !== 0o100644 && mode !== 0o100755) return null
  if (!stage) return true
  if (await stage.type() !== 'blob') return null
  // Read directly so filesystem errors propagate instead of becoming a library null.
  const { oid } = await git.hashBlob({ object: await scan.read(filepath) })
  return oid !== await stage.oid() || mode !== await stage.mode()
}

const serially = (scan: Scan): WalkerIterate => async (walk, children) => {
  const results: unknown[] = []
  for (const child of children) {
    if (scan.fallback) break
    results.push(await walk(child))
  }
  return results
}
