import { useMobileColors, useMobileStyles } from '../../ui/theme/useMobileTheme'
import { useState } from 'react'
import { ActivityIndicator, KeyboardAvoidingView, Modal, Platform, ScrollView, View } from 'react-native'
import { CloudArrowDown, FolderOpen, X } from 'phosphor-react-native'
import { Text } from '../ui/text'
import { mobileText } from '../../i18n/mobileText'
import { MobileButton } from '../../ui/MobileButton'
import { MobileIconButton } from '../../ui/MobileIconButton'
import { MobilePanel, MobileToolbar, MobileToolbarTitle, MobileToolbarSpacer } from '../../ui/MobilePanel'
import { MobileTextInput } from '../../ui/MobileTextInput'

import type { useMobileVaults } from '../../workspace/git/useMobileVaults'
import { githubRepositoryUrl } from '../../workspace/git/githubRepositoryUrl'
import { MobileGitHubAccount } from './MobileGitHubAccount'
import { MobileGitControls } from './MobileGitControls'
import { createVaultManagerStyles } from './vaultManagerStyles'
import { MobileSavedVaults } from './MobileSavedVaults'
import { optionalNativeWorkspaceAccessModule } from '../../workspace/nativeWorkspaceAccess'

type VaultManager = ReturnType<typeof useMobileVaults>

export function MobileVaultManager({ manager }: { manager: VaultManager }) {
  const styles = useMobileStyles(createVaultManagerStyles)
  const mobileColors = useMobileColors()
  return <Modal visible={manager.opened} transparent animationType="fade" onRequestClose={manager.close}>
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.backdrop}>
      <MobilePanel style={styles.panel} accessibilityViewIsModal testID="vault-manager">
        <MobileToolbar>
          <MobileToolbarTitle title={mobileText('status.vault.manageWorkspaces')} />
          <MobileToolbarSpacer />
          {!manager.busy && <MobileIconButton accessibilityLabel={mobileText('window.close')} onPress={manager.close}><X size={18} color={mobileColors.textMuted} /></MobileIconButton>}
        </MobileToolbar>
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content}>
          <VaultOperationStatus manager={manager} />
          <VaultSyncHistory manager={manager} />
          <MobileGitControls manager={manager} />
          {manager.linked && <View style={styles.section}>
            <Text style={styles.detail}>{mobileText('mobile.vaults.folderLinked')}</Text>
            <MobileButton disabled={manager.busy} label={mobileText('status.sync.now')} onPress={() => { void manager.sync() }} testID="linked-folder-sync" />
          </View>}
          <View style={styles.section}>
            <MobileButton disabled={manager.busy} label={mobileText('status.vault.openLocal')} icon={<FolderOpen size={16} color={mobileColors.text} />} onPress={() => { void manager.openFolder() }} />
            <Text style={styles.detail}>{mobileText(optionalNativeWorkspaceAccessModule()?.syncLinkedWorkspace ? 'mobile.vaults.folderOpenHint' : 'mobile.vaults.localCopy')}</Text>
          </View>
          <MobileSavedVaults manager={manager} />
          <MobileGitHubAccount account={manager.account} disabled={manager.busy} clone={manager.clone} />
          <CloneRepository manager={manager} />
        </ScrollView>
      </MobilePanel>
    </KeyboardAvoidingView>
  </Modal>
}

function VaultSyncHistory({ manager }: { manager: VaultManager }) {
  const styles = useMobileStyles(createVaultManagerStyles)
  const { record, failed } = manager.syncHistory
  return <View style={styles.section} testID="vault-sync-history">
    {record.status === 'pending' && (manager.active.git || manager.linked) && <Text style={styles.detail}>{mobileText('mobile.sync.pending')}</Text>}
    {record.lastSuccessAt !== null && <Text style={styles.detail} testID="vault-last-sync">{mobileText('mobile.sync.lastSuccess').replace('{time}', new Date(record.lastSuccessAt).toLocaleString())}</Text>}
    {record.lastCommitId && <Text style={styles.detail}>{mobileText('mobile.sync.lastCommit').replace('{commit}', record.lastCommitId)}</Text>}
    {record.error && <Text style={styles.detail}>{mobileText(`mobile.sync.${record.error}`)}</Text>}
    {failed && <Text style={styles.error}>{mobileText('mobile.sync.historyFailed')}</Text>}
  </View>
}

function CloneRepository({ manager }: { manager: VaultManager }) {
  const styles = useMobileStyles(createVaultManagerStyles)
  const mobileColors = useMobileColors()
  const [url, setUrl] = useState('')
  return <View style={styles.section}>
    <MobileTextInput label={mobileText('mobile.vaults.repositoryUrl')} value={url} onChangeText={setUrl} editable={!manager.busy} autoCorrect={false} keyboardType="url" testID="git-repository-url" />
    <MobileButton label={mobileText('mobile.vaults.clone')} disabled={manager.busy || !validRepository(url)} icon={<CloudArrowDown size={16} color={mobileColors.textInverse} />} variant="primary" onPress={() => { void manager.clone(url.trim()) }} testID="clone-git-vault" />
  </View>
}

function validRepository(url: string) {
  try { githubRepositoryUrl(url.trim()); return true } catch { return false }
}

function VaultOperationStatus({ manager }: { manager: VaultManager }) {
  const styles = useMobileStyles(createVaultManagerStyles)
  const mobileColors = useMobileColors()
  return <View style={styles.section} accessibilityLiveRegion="polite">
    {manager.busy && <View style={styles.progress}><ActivityIndicator color={mobileColors.primary} /><Text style={styles.detail}>{progressLabel(manager.phase)}</Text></View>}
    {manager.error && <Text accessibilityRole="alert" style={styles.error}>{mobileText(manager.error)}</Text>}
    {manager.catalog.error && <Text style={styles.error}>{mobileText('mobile.vaults.catalogFailed')}</Text>}
    {manager.status === 'diverged' && manager.active.git && <Text style={styles.error}>{mobileText('mobile.vaults.diverged')}</Text>}
    {manager.status === 'saveFailed' && <MobileButton disabled={manager.busy} label={mobileText('pulse.retry')} onPress={() => { void manager.sync() }} testID="vault-manager-retry" />}
  </View>
}

function progressLabel(phase: VaultManager['phase']) {
  if (!phase) return mobileText('mobile.vaults.saving')
  if (phase === 'clone') return mobileText('mobile.vaults.cloning')
  return mobileText(`mobile.vaults.${phase}`)
}
