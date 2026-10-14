import { expect, it, vi } from 'vitest'
import { mobileTelemetryContext } from './mobileTelemetryContext'
import { createMobileAnalytics } from './mobileAnalytics'

it('attributes desktop-compatible events to the actual mobile build and device family', () => {
  const context = mobileTelemetryContext({ platform: 'ios', deviceFamily: 'tablet', version: '0.1.0', build: '42', channel: 'alpha', distribution: 'testflight' })
  const send = vi.fn<(_body: unknown, _signal: AbortSignal) => Promise<void>>(async () => {})
  const analytics = createMobileAnalytics({ configured: true, createId: () => 'session', platform: 'ios', context, send })
  analytics.setEnabled(true)
  analytics.capture({ name: 'note_created' })
  expect(send.mock.calls[0]?.[0]).toMatchObject({ event: 'note_created', properties: {
    app_surface: 'mobile', platform: 'ios', device_family: 'tablet', app_version: '0.1.0',
    build_number: '42', release_channel: 'alpha', distribution: 'testflight',
  } })
  analytics.setEnabled(false)
})

it('does not accept arbitrary runtime strings as device or release metadata', () => {
  const result = mobileTelemetryContext({ platform: 'private', deviceFamily: 'my phone', version: '/Users/private', build: 'token', channel: 'vault', distribution: 'secret' })
  expect(result).toEqual({ app_surface: 'mobile', platform: 'unknown', device_family: 'unknown',
    app_version: 'unknown', build_number: 'unknown', release_channel: 'alpha', distribution: 'internal' })
})

it('projects shared event properties without note content, queries or repository details', () => {
  const send = vi.fn<(_body: unknown, _signal: AbortSignal) => Promise<void>>(async () => {})
  const analytics = createMobileAnalytics({ configured: true, createId: () => 'session', platform: 'android', send })
  analytics.setEnabled(true)
  analytics.capture({ name: 'theme_mode_changed', mode: 'dark' })
  analytics.capture({ name: 'search_used' })
  expect(send.mock.calls[0]?.[0]).toMatchObject({ event: 'theme_mode_changed', properties: { mode: 'dark' } })
  expect(send.mock.calls[1]?.[0]).toMatchObject({ event: 'search_used' })
  analytics.setEnabled(false)
})
