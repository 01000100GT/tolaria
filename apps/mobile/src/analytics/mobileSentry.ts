import { createMobileCrashReporting } from './mobileCrashReporting'
import { mobileRuntimeContext, mobileTelemetryConfig } from './mobileTelemetryRuntime'
import { createMobileSentryDriver } from './mobileSentryDriver'
import { registerMobileCrashReporter } from './mobileCrashChannel'

const dsn = mobileTelemetryConfig().sentryDsn
const driver = createMobileSentryDriver({ metadata: mobileRuntimeContext(), dsn }, () => import('@sentry/react-native'))
export const mobileCrashReporting = createMobileCrashReporting({ configured: validDsn(dsn), driver })
registerMobileCrashReporter(mobileCrashReporting.capture)

function validDsn(value: string) {
  try {
    const url = new URL(value)
    return url.protocol === 'https:' && Boolean(url.username) && !url.password && /^\/\d+$/.test(url.pathname)
      && !url.search && !url.hash
  } catch { return false }
}
