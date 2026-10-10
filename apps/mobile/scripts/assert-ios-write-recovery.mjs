/* global console, process, setTimeout, clearTimeout */
import { execFileSync } from 'node:child_process'
import { Buffer } from 'node:buffer'
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { startGitTestServer } from '../src/workspace/git/gitTestServer.ts'

const root = await mkdtemp(join(tmpdir(), 'tolaria-write-recovery-'))
const device = process.argv.slice(2).find((argument) => !argument.startsWith('--')) ?? 'booted'
const bundleId = 'com.tolaria.mobile.dev'
let awaitingProof
let timer

async function collectProof(request, response) {
  const chunks = []
  for await (const chunk of request) chunks.push(chunk)
  response.end('ok')
  awaitingProof?.(JSON.parse(Buffer.concat(chunks).toString()))
}

const server = await startGitTestServer(root, (request, response) => {
  if (request.url !== '/proof') return false
  void collectProof(request, response).catch((error) => awaitingProof?.({ passed: false, error: error.message }))
  return true
})

async function runPhase(phase) {
  const proof = new Promise((resolve, reject) => {
    awaitingProof = resolve
    timer = setTimeout(() => reject(new Error(`Native recovery phase timed out: ${phase}`)), 120_000)
  })
  try {
    execFileSync('xcrun', ['simctl', 'terminate', device, bundleId], { stdio: 'pipe' })
  } catch { /* A first launch has no running process to terminate. */ }
  const query = new URLSearchParams({ source: 'fixture', gitProbe: server.url, writeRecoveryProbe: phase, qaRun: phase })
  execFileSync('xcrun', ['simctl', 'openurl', device, `tolaria:///?${query}`])
  const result = await proof
  clearTimeout(timer)
  if (result.phase !== phase || !result.passed) throw new Error(JSON.stringify(result))
  console.log(JSON.stringify(result))
}

function recoveryPhases() {
  if (process.argv.includes('--batch')) return ['batch-prepare', 'batch-recover', 'batch-prepare-conflict', 'batch-conflict']
  if (process.argv.includes('--entries')) {
    return ['entry-prepare-move', 'entry-move', 'entry-prepare-delete', 'entry-delete', 'entry-prepare-conflict', 'entry-conflict']
  }
  return ['prepare', 'recover', 'prepare-conflict', 'conflict', 'cleanup']
}

try {
  for (const phase of recoveryPhases()) await runPhase(phase)
} finally {
  clearTimeout(timer)
  awaitingProof = undefined
  await server.close()
  await rm(root, { recursive: true, force: true })
}
