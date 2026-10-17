import { Directory, File, Paths } from 'expo-file-system'
import { requireOptionalNativeModule } from 'expo'
import { nativeGitHttp } from '../workspace/git/nativeGitHttp'
import git, { type HttpClient } from 'isomorphic-git'
import { cloneGitVault, syncGitVault } from '../workspace/git/gitRemote'
import { createExpoGitFileSystem } from '../workspace/git/expoGitFileSystem'
import { gitVirtualRoot } from '../workspace/git/gitFileSystemPaths'
import { assertNativeWorkspaceWriteErrors } from './nativeWorkspaceWriteErrors'
import { nativeVaultReadBenchmark } from './nativeVaultReadBenchmark'
import { assertNativeGitRecovery } from './nativeGitRecoveryProbe'
import { measureEventLoopDelay } from './measureEventLoopDelay'
import { postNativeQaEvent, setNativeQaSinkUrl } from './nativeQaSink'

let running = false

/** Disposable device-local working copies; never opens a user-selected vault. */
export async function runNativeGitProbe(endpoint: string) {
  if (running) return
  running = true
  const root = new Directory(Paths.cache, `tolaria-git-qa-${Date.now()}`)
  const started = Date.now()
  try {
    root.create()
    await assertNativeWorkspaceWriteErrors(root)
    const nativeDigestVerified = await verifyNativeDigest()
    const nativeFiles = await nativeFileAccessProof()
    const checkoutRecovery = await assertNativeGitRecovery(root)
    const { result: proof, eventLoop } = await measureEventLoopDelay(() => roundTrip(root, endpoint))
    const elapsedMs = Date.now() - started
    const restoredVault = nativeFiles ? await nativeVaultReadBenchmark() : null
    publishProof(endpoint, { ...proof, eventLoop, nativeFiles, nativeDigestVerified, checkoutRecovery, restoredVault, elapsedMs })
  } catch (error) {
    publishProof(endpoint, { error: error instanceof Error ? error.message : 'unknown', stack: error instanceof Error ? error.stack : null, passed: false })
  } finally {
    if (root.exists) root.delete()
    running = false
  }
}

async function verifyNativeDigest() {
  const { oid } = await git.hashBlob({ object: new Uint8Array() })
  if (oid !== 'e69de29bb2d1d6434b8b29ae775ad8c2e48c5391') throw new Error('nativeDigestVerificationFailed')
  return true
}

async function nativeFileAccessProof() {
  const module = requireOptionalNativeModule<{ runFileAccessProbe?: () => Promise<Record<string, boolean>> }>('TolariaWorkspaceAccess')
  if (!module?.runFileAccessProbe) return null
  const checks = await module.runFileAccessProbe()
  if (!Object.values(checks).every(Boolean)) throw new Error('nativeFileAccessProofFailed')
  return checks
}

async function roundTrip(root: Directory, endpoint: string) {
  const first = new Directory(root, 'first')
  const second = new Directory(root, 'second')
  first.create()
  second.create()
  const http: HttpClient = {
    request: (request) => {
      const url = new URL(request.url)
      return nativeGitHttp.request({ ...request, url: `${endpoint}${url.pathname}${url.search}` })
    },
  }
  const connection = (directory: Directory) => ({ fs: createExpoGitFileSystem(directory.uri), dir: gitVirtualRoot, http })
  const repositoryUrl = 'https://github.com/team/vault'
  const started = Date.now()
  await cloneGitVault(connection(first), repositoryUrl)
  const firstCloned = Date.now()
  await cloneGitVault(connection(second), repositoryUrl)
  const secondCloned = Date.now()
  const content = '---\ncustom: preserved\ntags: [native]\n---\n# Native Git round trip\n'
  new File(first, 'note.md').write(content)
  const attachment = new Uint8Array([0, 255, 1, 128, 10, 0, 250])
  new Directory(first, 'attachments').create()
  new File(first, 'attachments', 'bytes.bin').write(attachment)
  new File(first, 'deleted.md').delete()
  const author = { name: 'Native QA', email: 'qa@example.invalid' }
  const pushed = await syncGitVault(connection(first), author)
  const firstSynced = Date.now()
  const pulled = await syncGitVault(connection(second), author)
  const secondSynced = Date.now()
  const unchanged = await syncGitVault(connection(second), author)
  const unchangedSynced = Date.now()
  const unchangedSync = unchanged.kind === 'synced' && unchanged.changedFiles === 0 && !unchanged.workspaceChanged
  const preserved = await verifyRoundTrip(second, content, attachment)
  const passed = preserved.binaryPreserved && preserved.deletionPreserved && preserved.contentPreserved
    && pushed.kind === 'synced' && pulled.kind === 'synced' && unchangedSync
  const timings = {
    firstCloneMs: firstCloned - started,
    secondCloneMs: secondCloned - firstCloned,
    pushMs: firstSynced - secondCloned,
    pullMs: secondSynced - firstSynced,
    unchangedSyncMs: unchangedSynced - secondSynced,
  }
  return { passed, ...preserved, unchangedSync, pushed: pushed.kind, pulled: pulled.kind, timings }
}

async function verifyRoundTrip(second: Directory, content: string, attachment: Uint8Array) {
  const saved = await new File(second, 'note.md').text()
  const binary = await new File(second, 'attachments', 'bytes.bin').bytes()
  const binaryPreserved = binary.length === attachment.length && binary.every((byte, index) => byte === attachment[index])
  const deletionPreserved = !new File(second, 'deleted.md').exists
  return { binaryPreserved, deletionPreserved, contentPreserved: saved === content }
}

function publishProof(endpoint: string, proof: Record<string, unknown>) {
  console.info('TOLARIA_NATIVE_GIT_PROOF', JSON.stringify(proof))
  setNativeQaSinkUrl(new URL('/proof', endpoint).toString())
  postNativeQaEvent(proof)
}
