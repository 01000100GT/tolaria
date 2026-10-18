import type { LocalVaultSnapshotOptions } from './localVaultSnapshot'
import type { MobileNote, MobileWorkspaceSnapshot } from './mobileWorkspaceModel'
import { absoluteDate, relativeDate } from './localVaultPresentation'
import { serializeMobileVaultConfig } from './mobileVaultConfig'

export type SnapshotCacheStorage = {
  revision?: string
  digest: (text: string) => Promise<string>
  read: (key: string) => Promise<string | null>
  write: (key: string, value: string) => Promise<void>
}

// Bump when snapshot parsing semantics change; never reuse a previous parser schema.
const version = 2
const maxPayloadCharacters = 8 * 1024 * 1024
type CacheSession = { snapshot: MobileWorkspaceSnapshot | null; save: (snapshot: MobileWorkspaceSnapshot) => Promise<void> }
const uncached: CacheSession = { snapshot: null, save: async () => {} }
type CacheRecord = { version: number; input: string; payload: string; checksum: string }

export async function openWorkspaceSnapshotCache(options: LocalVaultSnapshotOptions, storage: SnapshotCacheStorage | null) {
  if (!storage || options.files.length < 128 || !options.files.every(file => /^[a-f0-9]{64}$/u.test(file.contentDigest ?? ''))) return uncached
  let key: string, input: string
  try {
    key = await storage.digest(options.vaultPath)
    input = await storage.digest(snapshotInput(options, storage.revision))
  } catch { return uncached }
  const snapshot = await readCachedSnapshot(storage, key, input, options).catch(() => null)
  return { snapshot, save: (next: MobileWorkspaceSnapshot) => saveCachedSnapshot(storage, key, input, next) }
}

function snapshotInput(options: LocalVaultSnapshotOptions, revision?: string) {
  const files = options.files.map(file => [file.relativePath, file.fileKind, file.contentDigest,
    file.createdAt, file.modifiedAt, file.size])
  return JSON.stringify([version, revision, options.vaultPath, options.vaultLabel, options.vaultAlias,
    options.maxNotes, serializeMobileVaultConfig(options.vaultConfig ?? {}), options.folderPaths ?? [], files])
}

async function readCachedSnapshot(storage: SnapshotCacheStorage, key: string, input: string, options: LocalVaultSnapshotOptions) {
  const text = await storage.read(key)
  if (!text || text.length > maxPayloadCharacters * 2 + 1024) return null
  const record: CacheRecord = JSON.parse(text)
  if (!validRecord(record, input) || await storage.digest(record.payload) !== record.checksum) return null
  const snapshot: MobileWorkspaceSnapshot = JSON.parse(record.payload)
  if (!validSnapshot(snapshot, options)) return null
  return { ...snapshot, notes: snapshot.notes.map(refreshDates), allNotes: snapshot.allNotes?.map(refreshDates) }
}

function validRecord(record: CacheRecord | null, input: string): record is CacheRecord {
  if (!record || record.version !== version || record.input !== input) return false
  return validPayload(record.payload) && validDigest(record.checksum)
}

function validPayload(payload: unknown): payload is string {
  return typeof payload === 'string' && payload.length <= maxPayloadCharacters
}

function validDigest(digest: unknown) { return typeof digest === 'string' && /^[a-f0-9]{64}$/u.test(digest) }

function snapshotShape(snapshot: MobileWorkspaceSnapshot | null, root: string): snapshot is MobileWorkspaceSnapshot {
  if (snapshot?.source?.kind !== 'localVault' || snapshot.source.vaultPath !== root) return false
  const arrays = ['notes', 'allNotes', 'views', 'sidebarSections'] as const
  return arrays.every(key => Array.isArray(snapshot[key])) && Boolean(snapshot.typeDefinitions) && Boolean(snapshot.vaultConfig)
}

function validSnapshot(snapshot: MobileWorkspaceSnapshot | null, options: LocalVaultSnapshotOptions) {
  if (!snapshotShape(snapshot, options.vaultPath)) return false
  const files = new Map(options.files.map(file => [file.relativePath, file]))
  const notes = [...snapshot.notes, ...snapshot.allNotes ?? []]
  if (!notes.every(note => validNote(note) && sameEditableText(note, files))) return false
  if (!snapshot.notes.every(note => typeof note.rawContent === 'string')) return false
  return Object.values(snapshot.typeDefinitions ?? {}).every(type => sameTypeSource(type, files))
}

function sameTypeSource(type: { path?: string; rawContent?: string }, files: Map<string, { content: string }>) {
  return typeof type.path === 'string' && typeof type.rawContent === 'string' && files.get(type.path)?.content === type.rawContent
}

function sameEditableText(note: MobileNote, files: Map<string, { content: string }>) {
  return note.rawContent === undefined || files.get(note.path ?? note.id)?.content === note.rawContent
}

function validNote(note: MobileNote | null) {
  if (!note) return false
  const strings = ['id', 'title', 'type'] as const
  const arrays = ['relationships', 'tags'] as const
  return strings.every(key => typeof note[key] === 'string') && arrays.every(key => Array.isArray(note[key]))
}

function refreshDates(note: MobileNote): MobileNote {
  return { ...note, created: relativeDate(note.createdAt), modified: relativeDate(note.modifiedAt), date: absoluteDate(note.modifiedAt) }
}

async function saveCachedSnapshot(storage: SnapshotCacheStorage, key: string, input: string, snapshot: MobileWorkspaceSnapshot) {
  try {
    const payload = JSON.stringify(snapshot, (_key, value: unknown) => {
      if (typeof value === 'number' && !Number.isFinite(value)) throw new Error('unsupportedSnapshotCacheValue')
      return value
    })
    if (payload.length > maxPayloadCharacters) return
    const record: CacheRecord = { version, input, payload, checksum: await storage.digest(payload) }
    await storage.write(key, JSON.stringify(record))
  } catch { /* Disposable cache failure must not fail authoritative workspace preparation. */ }
}
