import { expect, it } from 'vitest'
import { defaultMobileSettings, parseMobileSettings } from './mobileSettings'

it('keeps automatic Git and telemetry opt-in on a fresh installation', () => {
  expect(parseMobileSettings(null)).toEqual(defaultMobileSettings)
  expect(defaultMobileSettings.autoGit).toBe(false)
  expect(defaultMobileSettings.analytics).toBe(false)
})

it('round-trips explicit choices without accepting malformed booleans or theme values', () => {
  const settings = { ...defaultMobileSettings, autoGit: true, theme: 'dark', uiScale: 1.1 }
  expect(parseMobileSettings(JSON.stringify(settings))).toEqual(settings)
  expect(() => parseMobileSettings('{"autoGit":"false"}')).toThrow()
  expect(() => parseMobileSettings('{"theme":"invalid"}')).toThrow()
  expect(() => parseMobileSettings('{"uiScale":20}')).toThrow()
  expect(() => parseMobileSettings('{')).toThrow()
})
