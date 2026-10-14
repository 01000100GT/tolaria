/* global module, process, require */
const { withSentry } = require('@sentry/react-native/expo')

module.exports = ({ config }) => withSentry({
  ...config,
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
