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
  const [error, setError] = useState(false)
  useEffect(() => {
    let active = true
    void initializeLocalVaultCatalog().then(async (catalog) => {
      if (!active) return
      setVaults(catalog.vaults)
      setLocalVaults(catalog.localVaults ?? [])
      const restored = await restoreCatalogSelection(catalog)
      const selection = await preloadNativeWorkspace(restored.selection)
      if (active) setRestored({ ...restored, selection })
    }).catch(() => { if (active) setError(true) })
      .finally(() => { if (active) setPending(false) })
    return () => { active = false }
  }, [])
  const reload = useCallback(async () => {
    const catalog = await readManagedGitCatalog()
    setVaults(catalog.vaults)
    setLocalVaults(catalog.localVaults ?? [])
    setError(false)
  }, [])
  return { vaults, localVaults, restored, pending, error, reload }
}

async function restoreCatalogSelection(catalog: ManagedGitVaultCatalog): Promise<ActiveVault> {
  const git = catalog.vaults.find(vault => vault.id === catalog.activeId)
  if (git) return { git, selection: await managedGitSelection(git) }
  const local = catalog.localVaults?.find(vault => vault.id === catalog.activeLocalId)
  return { git: null, selection: local ? await managedLocalSelection(local) : null }
}
