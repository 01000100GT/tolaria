import { execFileSync } from 'node:child_process'
import assert from 'node:assert/strict'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const repoRoot = fileURLToPath(new URL('../../../', import.meta.url))
const mobileRoot = path.join(repoRoot, 'apps/mobile')
const profiles = {
  alpha: { profile: 'testflight', distribution: 'testflight', release: 'alpha' },
  stable: { profile: 'production', distribution: 'store', release: 'stable' },
  'ota-validation': { profile: 'ota-validation', distribution: 'internal', release: 'alpha' },
}

export function publishMobileUpdate(environment, execute = executeCommand) {
  const options = publishingOptions(environment)
  const base = execute('git', ['rev-parse', '--verify', '--end-of-options', `${options.base}^{commit}`], options)
  const files = execute('git', ['diff', '--name-only', '-z', base.trim(), 'HEAD', '--'], options).split('\0')
  if (!files.some(mobileRuntimePath)) return { published: false, reason: 'No mobile runtime inputs changed' }
  requireCredentials(environment)
  const runtime = JSON.parse(execute('pnpm', ['exec', 'expo-updates', 'runtimeversion:resolve',
    '--platform', 'ios', '--workflow', 'managed'], { ...options, cwd: mobileRoot })).runtimeVersion
  assert.equal(runtime, environment.TOLARIA_OTA_RUNTIME, 'Expected native runtime differs; install and accept a new binary first')
  const sha = execute('git', ['rev-parse', 'HEAD'], options).trim()
  assert.match(sha, /^[a-f0-9]{40}$/, 'Invalid source commit')
  const output = `/tmp/tolaria-ota-${sha}`
  execute('pnpm', ['--filter', '@tolaria/mobile', 'exec', 'expo', 'export', '--platform', 'ios',
    '--source-maps', '--output-dir', output], options)
  execute('pnpm', ['--filter', '@tolaria/mobile', 'exec', 'sentry-cli', 'sourcemaps', 'upload',
    '--org', environment.SENTRY_ORG, '--project', environment.SENTRY_PROJECT,
    '--strict', '--validate', '--wait-for', '120', '--debug-id-reference', '--ext', 'hbc', '--ext', 'map',
    path.join(output, '_expo/static/js/ios')], options)
  execute(environment.TOLARIA_EAS_CLI || 'eas', ['update', '--channel', options.channel, '--platform', 'ios',
    '--input-dir', output, '--skip-bundler', '--message', `Tolaria mobile ${sha}`, '--non-interactive', '--json'],
  { ...options, cwd: mobileRoot })
  return { published: true, channel: options.channel, runtime, sha }
}

function publishingOptions(environment) {
  const channel = releaseChannel(environment)
  validateNativeTarget(environment)
  return { cwd: repoRoot, channel, base: environment.TOLARIA_OTA_BASE_REF || 'HEAD~1', env: {
    ...environment, TOLARIA_BUILD_PROFILE: profiles[channel].profile, TOLARIA_UPDATE_CHANNEL: channel,
    EXPO_PUBLIC_DISTRIBUTION: profiles[channel].distribution, EXPO_PUBLIC_RELEASE_CHANNEL: profiles[channel].release,
  } }
}

function releaseChannel(environment) {
  const channel = environment.TOLARIA_OTA_CHANNEL
  assert(Object.hasOwn(profiles, channel), 'Unknown mobile OTA channel')
  assert(channel === 'ota-validation' || environment.CIRCLE_BRANCH === 'main', 'Release OTA publishing requires main')
  return channel
}

function validateNativeTarget(environment) {
  assert.match(environment.TOLARIA_OTA_RUNTIME ?? '', /^[a-f0-9]{40,64}$/, 'Accepted native runtime is required')
  assert.match(environment.TOLARIA_IOS_BUILD_NUMBER ?? '', /^[1-9][0-9]{0,3}$/, 'Accepted native build number is required')
}

function mobileRuntimePath(file) {
  if (/^apps\/mobile\/(?:docs|tests|native-ui-tests|scripts)\//.test(file)) return false
  return /^(?:apps\/mobile\/|packages\/|src\/(?:lib|utils|shared)\/|src-tauri\/icons\/)/.test(file)
    || ['package.json', 'pnpm-lock.yaml', 'pnpm-workspace.yaml'].includes(file)
}

function requireCredentials(environment) {
  for (const key of ['EXPO_TOKEN', 'SENTRY_AUTH_TOKEN', 'SENTRY_ORG', 'SENTRY_PROJECT']) {
    assert(environment[key]?.trim(), `${key} is required for OTA publishing`)
  }
}

function executeCommand(command, args, options) {
  return execFileSync(command, args, { cwd: options.cwd, env: options.env, encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'inherit'], maxBuffer: 8 * 1024 * 1024 })
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  console.log(JSON.stringify(publishMobileUpdate(process.env)))
}
