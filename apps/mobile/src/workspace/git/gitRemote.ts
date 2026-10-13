import git, { type HttpClient } from 'isomorphic-git'
import { createGitVault, githubRepositoryUrl, type GitAuthor, type GitVaultContext } from './gitVault'
import { withWorkspaceOperation } from './workspaceOperationQueue'
import { withSavedWorkspace } from './workspaceWriteQueue'
import { createGitTaskRunner } from './gitTaskRunner'
import { requireActiveSync } from '../syncCancellation'

export type GitSyncPhase = 'checkpoint' | 'fetch' | 'checkout' | 'push'
export type GitRemoteOptions = GitVaultContext & {
  checkpoint?: boolean
  http: HttpClient
  token?: string
  getToken?: () => Promise<string | undefined>
  signal?: AbortSignal
  onPhase?: (phase: GitSyncPhase) => void
  operationKey?: string
}

export function cloneGitVault(options: GitRemoteOptions, repositoryUrl: string) {
  const url = githubRepositoryUrl(repositoryUrl)
  return withWorkspaceOperation(options.operationKey ?? options.dir, () => git.clone({
    ...transport(options, url),
    url,
    singleBranch: true,
    noTags: true,
    nonBlocking: true,
    batchSize: 20,
  }))
}

export function syncGitVault(options: GitRemoteOptions, author: GitAuthor) {
  return withSavedWorkspace(options.operationKey ?? options.dir, () => syncUnlocked(options, author))
}

async function syncUnlocked(options: GitRemoteOptions, author: GitAuthor) {
  const { fs, dir } = options
  const context = { fs, dir, cache: {} }
  const url = githubRepositoryUrl(String(await git.getConfig({ ...context, path: 'remote.origin.url' })))
  const ref = await git.currentBranch(context)
  if (!ref) throw new Error('detachedHead')
  const vault = createGitVault(context)
  emitPhase(options, 'checkpoint')
  const checkpoint = options.checkpoint === false ? await vault.requireClean() : await vault.checkpoint(author)
  requireActiveSync(options.signal)
  const token = options.getToken ? await options.getToken() : options.token
  const connection = transport({ ...options, token, cache: context.cache }, url)
  const result = await syncHeads(options, { ...connection, url, ref }, author)
  return { ...result, changedFiles: checkpoint.changedFiles }
}

type GitConnection = ReturnType<typeof transport> & { url: string; ref: string }

async function syncHeads(options: GitRemoteOptions, connection: GitConnection, author: GitAuthor) {
  let workspaceChanged = false
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const integrated = await fetchAndIntegrate(options, connection, author)
    workspaceChanged ||= ['updated', 'merged'].includes(integrated)
    if (integrated === 'diverged') return { kind: 'diverged' as const, workspaceChanged }
    const needsPush = ['ahead', 'merged'].includes(integrated)
    if (!needsPush || await pushCurrentHead(options, connection)) {
      return { kind: 'synced' as const, workspaceChanged }
    }
  }
  throw new Error('pushRejected')
}

async function fetchAndIntegrate(options: GitRemoteOptions, connection: GitConnection, author: GitAuthor) {
  emitPhase(options, 'fetch')
  await git.fetch({ ...connection, singleBranch: true, tags: false })
  const remoteOid = await git.resolveRef({ ...connection, ref: `refs/remotes/origin/${connection.ref}` })
  emitPhase(options, 'checkout')
  return createGitVault(connection).integrate(remoteOid, author)
}

async function pushCurrentHead(options: GitRemoteOptions, connection: GitConnection) {
  emitPhase(options, 'push')
  try {
    return (await git.push({ ...connection, force: false })).ok
  } catch (error) {
    if (error instanceof git.Errors.PushRejectedError && error.data.reason === 'not-fast-forward') return false
    throw error
  }
}

function emitPhase(options: GitRemoteOptions, phase: GitSyncPhase) {
  requireActiveSync(options.signal)
  options.onPhase?.(phase)
  requireActiveSync(options.signal)
}

function transport({ fs, dir, http, token, cache, signal }: GitRemoteOptions, repositoryUrl: string) {
  const { run } = createGitTaskRunner()
  return {
    fs,
    dir,
    http: { request: (request: Parameters<HttpClient['request']>[0]) => {
      requireActiveSync(signal)
      return http.request({ ...request, signal })
    } },
    cache,
    onProgress: () => run(() => undefined),
    onAuth: (url: string) => {
      if (githubRepositoryUrl(url) !== repositoryUrl || !token) return { cancel: true as const }
      return { username: 'x-access-token', password: token }
    },
    onAuthFailure: () => ({ cancel: true as const }),
  }
}
