import { useCallback, useEffect, useState } from 'react'
import { managedGitSelection, readManagedGitCatalog } from './managedGitStorage'
import { initializeLocalVaultCatalog, managedLocalSelection } from './managedLocalStorage'
import type { ManagedLocalVault } from './managedLocalVaults'
import type { ManagedGitVault, ManagedGitVaultCatalog } from './managedGitVaults'
import type { NativeWorkspaceSelection } from '../nativeWorkspacePicker'
import { preloadNativeWorkspace } from '../preloadNativeWorkspace'

export type ActiveVault = { selection: NativeWorkspaceSelection | null; git: ManagedGitVault | null }

export function useManagedVaultCatalog() {
  const [vaults, setVaults] = useState<ManagedGitVault[]>([])
  const [localVaults, setLocalVaults] = useState<ManagedLocalVault[]>([])
  const [restored, setRestored] = useState<ActiveVault | null>(null)
  const [pending, setPending] = useState(true)
  const [error, setError] = useState<'catalog' | 'selection' | null>(null)
  const [attempt, setAttempt] = useState(0)
  useEffect(() => {
    let active = true
    let stage: 'catalog' | 'selection' = 'catalog'
    void initializeLocalVaultCatalog().then(async (catalog) => {
      if (!active) return
      setVaults(catalog.vaults)
      setLocalVaults(catalog.localVaults ?? [])
      stage = 'selection'
      const restored = await restoreCatalogSelection(catalog)
      const selection = await preloadNativeWorkspace(restored.selection)
      if (active) setRestored({ ...restored, selection })
    }).catch(() => { if (active) setError(stage) })
      .finally(() => { if (active) setPending(false) })
    return () => { active = false }
  }, [attempt])
  const reload = useCallback(async () => {
    const catalog = await readManagedGitCatalog()
    setVaults(catalog.vaults)
    setLocalVaults(catalog.localVaults ?? [])
    setError(previous => previous === 'catalog' ? null : previous)
  }, [])
  const retry = useCallback(() => {
    setPending(true)
    setError(null)
    setAttempt(value => value + 1)
  }, [])
  return { vaults, localVaults, restored, pending, error, reload, retry }
}

async function restoreCatalogSelection(catalog: ManagedGitVaultCatalog): Promise<ActiveVault> {
  const git = catalog.vaults.find(vault => vault.id === catalog.activeId)
  if (git) return { git, selection: await managedGitSelection(git) }
  const local = catalog.localVaults?.find(vault => vault.id === catalog.activeLocalId)
  return { git: null, selection: local ? await managedLocalSelection(local) : null }
}
