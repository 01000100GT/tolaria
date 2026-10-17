/* global module, process, require */
const { withSentry } = require('@sentry/react-native/expo')

module.exports = ({ config }) => withSentry({
  ...config,
  ios: iosBuildConfiguration(config.ios),
  extra: {
    ...config.extra,
    // Only public ingestion credentials belong in the application manifest.
    telemetry: {
      sentryDsn: process.env.EXPO_PUBLIC_SENTRY_DSN || process.env.VITE_SENTRY_DSN || '',
      posthogKey: process.env.EXPO_PUBLIC_POSTHOG_KEY || process.env.VITE_POSTHOG_KEY || '',
      posthogHost: process.env.EXPO_PUBLIC_POSTHOG_HOST || process.env.VITE_POSTHOG_HOST || 'https://us.i.posthog.com',
    },
  },
}, { organization: process.env.SENTRY_ORG, project: process.env.SENTRY_PROJECT })

function iosBuildConfiguration(ios) {
  const profile = process.env.TOLARIA_BUILD_PROFILE
  if (profile === undefined || profile === 'development') return ios
  if (profile !== 'testflight') {
    throw new Error('TOLARIA_BUILD_PROFILE must be development or testflight')
  }
  requireEnvironmentValue('EXPO_PUBLIC_DISTRIBUTION', 'testflight')
  requireEnvironmentValue('EXPO_PUBLIC_RELEASE_CHANNEL', 'alpha')
  return {
    ...ios,
    bundleIdentifier: 'md.tolaria.mobile',
    appleTeamId: 'D84V3C272P',
    buildNumber: testFlightBuildNumber(),
  }
}

function testFlightBuildNumber() {
  const number = process.env.TOLARIA_IOS_BUILD_NUMBER || ''
  if (!/^[1-9][0-9]{0,3}$/.test(number)) {
    throw new Error('TOLARIA_IOS_BUILD_NUMBER must be an integer from 1 to 9999')
  }
  return number
}

function requireEnvironmentValue(key, expected) {
  if (process.env[key] !== expected) {
    throw new Error(`${key} must be ${expected} for the TestFlight profile`)
  }
}
