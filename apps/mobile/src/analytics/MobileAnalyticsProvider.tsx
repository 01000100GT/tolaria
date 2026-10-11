import { useEffect, useState, type ReactNode } from 'react'
import { Platform } from 'react-native'
import { randomUUID } from 'expo-crypto'
import { useMobileSettings } from '../settings/useMobileSettings'
import { createMobileAnalytics } from './mobileAnalytics'
import { mobileAnalyticsEndpoint, posthogSender } from './posthogTransport'
import { AnalyticsContext } from './useMobileAnalytics'

function nativeAnalytics() {
  const key = process.env.EXPO_PUBLIC_POSTHOG_KEY ?? ''
  const endpoint = mobileAnalyticsEndpoint(key, process.env.EXPO_PUBLIC_POSTHOG_HOST)
  return createMobileAnalytics({
    configured: endpoint !== null,
    createId: randomUUID,
    platform: Platform.OS,
    send: endpoint ? posthogSender(endpoint, key) : async () => {},
  })
}

export function MobileAnalyticsProvider({ children }: { children: ReactNode }) {
  const [analytics] = useState(nativeAnalytics)
  const { ready, settings } = useMobileSettings()
  useEffect(() => {
    analytics.setEnabled(ready && settings.analytics)
    return () => analytics.setEnabled(false)
  }, [analytics, ready, settings.analytics])
  return <AnalyticsContext.Provider value={analytics}>{children}</AnalyticsContext.Provider>
}
