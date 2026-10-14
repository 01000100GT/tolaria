import { Platform } from 'react-native'
import Constants from 'expo-constants'
import { nativeApplicationVersion, nativeBuildVersion } from 'expo-application'
import { DeviceType, deviceType } from 'expo-device'
import { mobileTelemetryContext } from './mobileTelemetryContext'

export function mobileRuntimeContext() {
  return mobileTelemetryContext({
    platform: Platform.OS,
    deviceFamily: deviceType === DeviceType.TABLET ? 'tablet' : deviceFamily(),
    version: nativeApplicationVersion ?? Constants.expoConfig?.version,
    build: nativeBuildVersion,
    channel: process.env.EXPO_PUBLIC_RELEASE_CHANNEL,
    distribution: process.env.EXPO_PUBLIC_DISTRIBUTION,
  })
}

function deviceFamily() {
  if (deviceType === DeviceType.PHONE) return 'phone'
  if (deviceType === DeviceType.DESKTOP) return 'desktop'
  return 'unknown'
}

export function mobileTelemetryConfig() {
  const config: unknown = Constants.expoConfig?.extra?.telemetry
  const shared = config && typeof config === 'object' ? config : {}
  return {
    posthogKey: process.env.EXPO_PUBLIC_POSTHOG_KEY ?? publicValue(shared, 'posthogKey'),
    posthogHost: process.env.EXPO_PUBLIC_POSTHOG_HOST ?? publicValue(shared, 'posthogHost'),
    sentryDsn: process.env.EXPO_PUBLIC_SENTRY_DSN ?? publicValue(shared, 'sentryDsn'),
  }
}

function publicValue(config: object, key: string): string {
  const value: unknown = Reflect.get(config, key)
  return typeof value === 'string' ? value : ''
}
