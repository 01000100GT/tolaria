import { createRequire } from 'node:module'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import type { ExpoConfig } from 'expo/config'
import manifest from '../../app.json'

const require = createRequire(import.meta.url)
const configure: (context: { config: typeof manifest.expo }) => ExpoConfig = require('../../app.config.js')

beforeEach(() => {
  vi.stubEnv('TOLARIA_BUILD_PROFILE', undefined)
  vi.stubEnv('TOLARIA_IOS_BUILD_NUMBER', undefined)
  vi.stubEnv('EXPO_PUBLIC_DISTRIBUTION', 'testflight')
  vi.stubEnv('EXPO_PUBLIC_RELEASE_CHANNEL', 'alpha')
})

afterEach(() => vi.unstubAllEnvs())

function configuredApp() {
  return configure({ config: structuredClone(manifest.expo) })
}

function testFlight(build = '1') {
  vi.stubEnv('TOLARIA_BUILD_PROFILE', 'testflight')
  vi.stubEnv('TOLARIA_IOS_BUILD_NUMBER', build)
  return configuredApp()
}

it.each([undefined, 'development'])('preserves the development sandbox for profile %s', (profile) => {
  vi.stubEnv('TOLARIA_BUILD_PROFILE', profile)
  vi.stubEnv('TOLARIA_IOS_BUILD_NUMBER', '99')
  const app = configuredApp()
  expect(app.ios).toEqual(manifest.expo.ios)
  expect(app.android).toEqual(manifest.expo.android)
})

it('uses the approved production identity without losing native settings', () => {
  const app = testFlight('42')
  expect(app.ios).toEqual({
    ...manifest.expo.ios,
    bundleIdentifier: 'md.tolaria.mobile',
    appleTeamId: 'D84V3C272P',
    buildNumber: '42',
  })
  expect(app.name).toBe('Tolaria')
  expect(app.android).toEqual(manifest.expo.android)
  expect(manifest.expo.ios.bundleIdentifier).toBe('com.tolaria.mobile.dev')
})

it.each([undefined, '', '0', '-1', '01', '1.2', '1e2', ' 1 ', '10000'])('rejects invalid TestFlight build number %s', (build) => {
  vi.stubEnv('TOLARIA_BUILD_PROFILE', 'testflight')
  vi.stubEnv('TOLARIA_IOS_BUILD_NUMBER', build)
  expect(configuredApp).toThrow('TOLARIA_IOS_BUILD_NUMBER')
})

it('refuses unknown profiles instead of silently building the development app', () => {
  vi.stubEnv('TOLARIA_BUILD_PROFILE', 'testfligth')
  expect(configuredApp).toThrow('TOLARIA_BUILD_PROFILE')
})

it.each(['EXPO_PUBLIC_DISTRIBUTION', 'EXPO_PUBLIC_RELEASE_CHANNEL'])('refuses incorrect TestFlight attribution in %s', (key) => {
  vi.stubEnv(key, 'internal')
  expect(() => testFlight()).toThrow(key)
})

it('keeps signing and upload secrets out of the public application manifest', () => {
  vi.stubEnv('SENTRY_AUTH_TOKEN', 'private-upload-placeholder')
  vi.stubEnv('ASC_API_KEY', 'private-signing-placeholder')
  const serialized = JSON.stringify(testFlight())
  expect(serialized).not.toContain('private-upload-placeholder')
  expect(serialized).not.toContain('private-signing-placeholder')
})
