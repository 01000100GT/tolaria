import { useEffect } from 'react'
import { Linking } from 'react-native'
import { requireOptionalNativeModule } from 'expo'
import { nativeStorageQaEnabled } from './nativeStorageQaCapability'

export function useNativeGitProbe() {
  useEffect(() => {
    if (!storageProbeAvailable()) return
    const run = async (url: string | null) => {
      if (!url) return
      try {
        const endpoint = new URL(url).searchParams.get('gitProbe')
        if (!endpoint || !isLoopbackEndpoint(endpoint)) return
        const recoveryPhase = new URL(url).searchParams.get('writeRecoveryProbe')
        if (recoveryPhase) {
          const { runNativeWriteRecoveryProbe } = await import('./nativeWriteRecoveryProbe')
          await runNativeWriteRecoveryProbe(endpoint, recoveryPhase)
          return
        }
        const { runNativeGitProbe } = await import('./runNativeGitProbe')
        await runNativeGitProbe(endpoint)
      } catch (error) {
        console.warn('[native-git-probe] Unable to run probe', error)
      }
    }
    const subscription = Linking.addEventListener('url', ({ url }) => { void run(url) })
    void Linking.getInitialURL().then(run).catch(() => undefined)
    return () => subscription.remove()
  }, [])
}

function storageProbeAvailable() {
  const module = requireOptionalNativeModule<{ nativeStorageQAEnabled?: boolean }>('TolariaWorkspaceAccess')
  return nativeStorageQaEnabled(__DEV__, module?.nativeStorageQAEnabled)
}

function isLoopbackEndpoint(endpoint: string) {
  const url = new URL(endpoint)
  return url.protocol === 'http:' && url.hostname === '127.0.0.1' && url.pathname === '/'
}
