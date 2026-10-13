import fs from 'node:fs'
import { execFileSync } from 'node:child_process'
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import git from 'isomorphic-git'
import { afterEach, expect, it } from 'vitest'
import { cloneGitVault, syncGitVault } from './gitRemote'
import { createGitVault } from './gitVault'
import { gitTestEnvironment, startGitTestServer } from './gitTestServer'

const author = { name: 'Tablet QA', email: 'qa@example.invalid' }
const cleanup: (() => Promise<void>)[] = []
const gitProcessOptions = { env: gitTestEnvironment(), stdio: 'pipe' as const }
afterEach(async () => { for (const action of cleanup.splice(0).reverse()) await action() })

async function fixture() {
  const root = await mkdtemp(join(tmpdir(), 'tolaria-sync-'))
  cleanup.push(() => rm(root, { recursive: true, force: true }))
  const remote = join(root, 'team', 'vault.git')
  await mkdir(remote, { recursive: true })
  execFileSync('git', ['init', '--bare', '--initial-branch=main', remote], gitProcessOptions)
  const seed = join(root, 'seed')
  await mkdir(seed)
  await git.init({ fs, dir: seed, defaultBranch: 'main' })
  await writeFile(join(seed, 'note.md'), '---\nstatus: draft\n---\n# Initial\n')
  await createGitVault({ fs, dir: seed }).checkpoint(author)
  execFileSync('git', ['-C', seed, 'push', remote, 'main'], gitProcessOptions)
  const server = await startGitTestServer(root)
  cleanup.push(server.close)
  const first = { fs, http: server.http, dir: join(root, 'first') }
  const second = { fs, http: server.http, dir: join(root, 'second') }
  await cloneGitVault(first, 'https://github.com/team/vault')
  await cloneGitVault(second, 'https://github.com/team/vault')
  return { first, second, remote }
}

it('clones, checkpoints, pushes, and pulls real Git objects through HTTP', { timeout: 20_000 }, async () => {
  const { first, second } = await fixture()
  const content = '---\nstatus: draft\ncustom: unchanged\n---\n# Tablet change\n'
  await writeFile(join(first.dir, 'note.md'), content)
  expect(await syncGitVault(first, author)).toMatchObject({ kind: 'synced', changedFiles: 1 })
  expect(await syncGitVault(second, author)).toMatchObject({ kind: 'synced', changedFiles: 0 })
  expect(await readFile(join(second.dir, 'note.md'), 'utf8')).toBe(content)
})

it('stops on divergence while preserving both copies and commits', { timeout: 20_000 }, async () => {
  const { first, second } = await fixture()
  await writeFile(join(first.dir, 'note.md'), '# First device\n')
  await writeFile(join(second.dir, 'note.md'), '# Second device\n')
  await syncGitVault(first, author)
  expect(await syncGitVault(second, author)).toMatchObject({ kind: 'diverged' })
  expect(await readFile(join(second.dir, 'note.md'), 'utf8')).toBe('# Second device\n')
  expect(await readFile(join(first.dir, 'note.md'), 'utf8')).toBe('# First device\n')
  expect(await git.log(second)).toHaveLength(2)
})

it('keeps a rejected push as a recoverable local commit and retries without duplicating it', { timeout: 20_000 }, async () => {
  const { first, second, remote } = await fixture()
  execFileSync('git', ['--git-dir', remote, 'config', 'http.receivepack', 'false'], gitProcessOptions)
  await writeFile(join(first.dir, 'note.md'), '# Offline-safe\n')
  await expect(syncGitVault(first, author)).rejects.toThrow()
  expect(await git.log(first)).toHaveLength(2)
  execFileSync('git', ['--git-dir', remote, 'config', 'http.receivepack', 'true'], gitProcessOptions)
  expect(await syncGitVault(first, author)).toMatchObject({ kind: 'synced', changedFiles: 0 })
  await syncGitVault(second, author)
  expect(await readFile(join(second.dir, 'note.md'), 'utf8')).toBe('# Offline-safe\n')
  expect(await git.log(first)).toHaveLength(2)
})

it('merges independent edits, preserves both parents, and publishes the combined history', async () => {
  const { first, second, remote } = await fixture()
  await writeFile(join(first.dir, 'desktop.md'), '# Desktop\n')
  await writeFile(join(second.dir, 'tablet.md'), '# Tablet\n')
  await syncGitVault(first, author)
  const remoteParent = await git.resolveRef({ ...first, ref: 'HEAD' })
  const localParent = (await createGitVault(second).checkpoint(author)).oid
  expect(await syncGitVault(second, author)).toMatchObject({ kind: 'synced', workspaceChanged: true })
  const oid = await git.resolveRef({ ...second, ref: 'HEAD' })
  expect((await git.readCommit({ ...second, oid })).commit.parent).toEqual([localParent, remoteParent])
  expect(execFileSync('git', ['--git-dir', remote, 'rev-parse', 'main'], gitProcessOptions).toString().trim()).toBe(oid)
  expect(await readFile(join(second.dir, 'desktop.md'), 'utf8')).toBe('# Desktop\n')
  expect(await readFile(join(second.dir, 'tablet.md'), 'utf8')).toBe('# Tablet\n')
  expect(await syncGitVault(second, author)).toMatchObject({ kind: 'synced', workspaceChanged: false })
  expect(await git.resolveRef({ ...second, ref: 'HEAD' })).toBe(oid)
})

it('fetches and merges again if the remote advances immediately before push', async () => {
  const { first, second } = await fixture()
  await writeFile(join(first.dir, 'desktop.md'), '# Desktop\n')
  await writeFile(join(second.dir, 'tablet.md'), '# Tablet\n')
  let advanced = false
  const http = { request: async (request: Parameters<typeof first.http.request>[0]) => {
    if (!advanced && request.url.includes('git-receive-pack')) {
      advanced = true
      await syncGitVault(first, author)
    }
    return second.http.request(request)
  } }
  expect(await syncGitVault({ ...second, http }, author)).toMatchObject({ kind: 'synced', workspaceChanged: true })
  expect(advanced).toBe(true)
  await syncGitVault(first, author)
  expect(await readFile(join(first.dir, 'tablet.md'), 'utf8')).toBe('# Tablet\n')
  expect(await readFile(join(second.dir, 'desktop.md'), 'utf8')).toBe('# Desktop\n')
})

it('bounds retries when a remote keeps moving and retains the combined local history', async () => {
  const { first, second } = await fixture()
  await writeFile(join(second.dir, 'tablet.md'), '# Tablet\n')
  let attempts = 0
  const http = { request: async (request: Parameters<typeof first.http.request>[0]) => {
    if (request.url.includes('info/refs?service=git-receive-pack')) {
      attempts += 1
      await writeFile(join(first.dir, `desktop-${attempts}.md`), '# Desktop\n')
      await syncGitVault(first, author)
    }
    return second.http.request(request)
  } }
  await expect(syncGitVault({ ...second, http }, author)).rejects.toThrow('pushRejected')
  expect(attempts).toBe(3)
  expect(await readFile(join(second.dir, 'tablet.md'), 'utf8')).toBe('# Tablet\n')
  expect(await syncGitVault(second, author)).toMatchObject({ kind: 'synced' })
  await syncGitVault(first, author)
  expect(await readFile(join(first.dir, 'tablet.md'), 'utf8')).toBe('# Tablet\n')
})
