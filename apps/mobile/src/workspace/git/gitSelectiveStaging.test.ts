import fs from 'node:fs'
import { execFileSync } from 'node:child_process'
import { chmod, mkdtemp, readFile, rm, symlink, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import git from 'isomorphic-git'
import { afterEach, expect, it } from 'vitest'
import { createGitVault } from './gitVault'
import { gitTestEnvironment } from './gitTestServer'
import { stageVerifiedGitChanges } from './gitSelectiveStaging'

const author = { name: 'Test', email: 'qa@example.invalid' }
const roots: string[] = []
afterEach(async () => {
  for (const root of roots.splice(0)) await rm(root, { recursive: true, force: true })
})

async function packedRepository() {
  const dir = await mkdtemp(join(tmpdir(), 'tolaria-git-staging-'))
  roots.push(dir)
  await git.init({ fs, dir, defaultBranch: 'main' })
  await writeFile(join(dir, 'note.md'), '---\ncustom: original\n---\n# Original\n')
  await writeFile(join(dir, 'unchanged.md'), '# Packed and unchanged\n')
  await git.add({ fs, dir, filepath: '.' })
  await git.commit({ fs, dir, author, message: 'Fixture' })
  execFileSync('git', ['-C', dir, 'repack', '-ad'], { env: gitTestEnvironment() })
  return { fs, dir }
}

function looseObjectCount({ dir }: { dir: string }) {
  const report = execFileSync('git', ['-C', dir, 'count-objects', '-v'], { env: gitTestEnvironment(), encoding: 'utf8' })
  const count = /^count: (\d+)$/mu.exec(report)
  if (!count) throw new Error('Missing loose object count')
  return Number(count[1])
}

it('does not inflate packed, unchanged blobs into loose objects during a checkpoint', async () => {
  const context = await packedRepository()
  expect(looseObjectCount(context)).toBe(0)
  expect((await createGitVault(context).checkpoint(author)).changedFiles).toBe(0)
  expect(looseObjectCount(context)).toBe(0)
})

it('stages an edit and binary addition without rewriting unrelated packed blobs', async () => {
  const context = await packedRepository()
  const content = '---\ncustom: preserved\n---\n# Edited\n'
  const binary = Buffer.from([0, 255, 128, 10])
  await writeFile(join(context.dir, 'note.md'), content)
  await writeFile(join(context.dir, 'image.bin'), binary)
  const result = await createGitVault(context).checkpoint(author)
  expect(result.changedFiles).toBe(2)
  const note = await git.readBlob({ ...context, oid: result.oid, filepath: 'note.md' })
  expect(Buffer.from(note.blob).toString()).toBe(content)
  const image = await git.readBlob({ ...context, oid: result.oid, filepath: 'image.bin' })
  expect(Buffer.from(image.blob)).toEqual(binary)
  // Two changed blobs, one tree and one commit; no unrelated packed blob.
  expect(looseObjectCount(context)).toBe(4)
})

it('checkpoints a deletion without rewriting remaining packed files', async () => {
  const context = await packedRepository()
  await rm(join(context.dir, 'note.md'))
  const result = await createGitVault(context).checkpoint(author)
  expect(result.changedFiles).toBe(1)
  expect(await git.listFiles(context)).toEqual(['unchanged.md'])
  expect(looseObjectCount(context)).toBe(2)
})

it('retains configured line-ending normalization rather than hashing raw bytes as staged content', async () => {
  const context = await packedRepository()
  await git.setConfig({ ...context, path: 'core.autocrlf', value: 'true' })
  await writeFile(join(context.dir, 'note.md'), '# Windows\r\nSecond line\r\n')
  const result = await createGitVault(context).checkpoint(author)
  const note = await git.readBlob({ ...context, oid: result.oid, filepath: 'note.md' })
  expect(Buffer.from(note.blob).toString()).toBe('# Windows\nSecond line\n')
})

it('retains an executable mode change when checkpointing another content edit', async () => {
  const context = await packedRepository()
  await chmod(join(context.dir, 'note.md'), 0o755)
  await writeFile(join(context.dir, 'unchanged.md'), '# Edited alongside a mode change\n')
  const result = await createGitVault(context).checkpoint(author)
  const { commit } = await git.readCommit({ ...context, oid: result.oid })
  const { tree } = await git.readTree({ ...context, oid: commit.tree })
  expect(tree.find((entry) => entry.path === 'note.md')?.mode).toBe('100755')
})

it('commits all additions when a change exceeds the small-batch staging limit', async () => {
  const context = await packedRepository()
  for (let index = 0; index < 20; index++) await writeFile(join(context.dir, `${index}.md`), `# Added ${index}\n`)
  expect((await createGitVault(context).checkpoint(author)).changedFiles).toBe(20)
  expect(await git.listFiles(context)).toHaveLength(22)
})

it('uses library staging for tracked symlinks instead of reading their targets', async () => {
  const context = await packedRepository()
  await rm(join(context.dir, 'note.md'))
  await symlink('unchanged.md', join(context.dir, 'note.md'))
  const result = await createGitVault(context).checkpoint(author)
  const note = await git.readBlob({ ...context, oid: result.oid, filepath: 'note.md' })
  expect(Buffer.from(note.blob).toString()).toBe('unchanged.md')
})

it('fails without advancing HEAD or deleting content when verification cannot read a file', async () => {
  const context = await packedRepository()
  const head = await git.resolveRef({ ...context, ref: 'HEAD' })
  const failingFs = { promises: { ...fs.promises, readFile: async (path: fs.PathLike, options?: Parameters<typeof readFile>[1]) => {
    if (String(path) === join(context.dir, 'note.md')) throw new Error('verificationReadFailed')
    return fs.promises.readFile(path, options)
  } } }
  await expect(createGitVault({ ...context, fs: failingFs }).checkpoint(author)).rejects.toThrow('verificationReadFailed')
  expect(await git.resolveRef({ ...context, ref: 'HEAD' })).toBe(head)
  expect(await readFile(join(context.dir, 'note.md'), 'utf8')).toContain('# Original')
})

it('keeps callback-only filesystem adapters compatible with library staging', async () => {
  const context = await packedRepository()
  await writeFile(join(context.dir, 'note.md'), '# Callback adapter edit\n')
  const callbacks = { ...fs }
  Reflect.deleteProperty(callbacks, 'promises')
  const callbackContext = { dir: context.dir, fs: callbacks }
  await stageVerifiedGitChanges(callbackContext)
  expect(await git.status({ ...callbackContext, filepath: 'note.md' })).toBe('modified')
})
