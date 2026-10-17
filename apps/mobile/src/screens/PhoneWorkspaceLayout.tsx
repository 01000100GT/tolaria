import type { ReactNode } from 'react'
import { View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { MobileSyncStatusBar } from '../components/workspace/MobileSyncStatusBar'
import type { MobileLayoutProbe } from '../qa/mobileLayoutProbe'
import { useMobileStyles } from '../ui/theme/useMobileTheme'
import type { useHorizontalSwipe } from '../ui/useHorizontalSwipe'
import type { useMobileEditorCommandRegistry } from '../workspace/mobileEditorCommands'
import type { MobileNote } from '../workspace/mobileWorkspaceModel'
import type { MobileTableOfContentsTarget } from '../workspace/mobileTableOfContents'
import type { PhoneWorkspaceNavigation } from './PhoneWorkspace'
import { createThemeStyles } from './phoneWorkspaceStyles'
import { PhoneWorkspaceScreens } from './PhoneWorkspaceScreens'
import { PhoneWorkspaceTransition } from './PhoneWorkspaceTransition'
import { WorkspaceActionSheetHost } from './TabletWorkspace'
import type { PhoneWorkspaceState } from './phoneWorkspaceTransitions'
import type { PhoneWorkspaceEditorOptions } from './phoneWorkspaceEditorOptions'
import type { PhoneWorkspaceController, PhoneSwipePreview, PhoneTableOfContentsTargetRequest } from './phoneWorkspaceScreenSupport'

type PhoneWorkspaceRootProps = {
  commandPaletteElement: ReactNode
  controller: PhoneWorkspaceController
  createRelationshipTargetAndOpenEditor: () => void
  dragPreview: PhoneSwipePreview
  editorCommandRegistry: ReturnType<typeof useMobileEditorCommandRegistry>
  navigation: PhoneWorkspaceNavigation
  openCommandPalette: () => void
  options: PhoneWorkspaceEditorOptions
  phoneLayoutProbe: MobileLayoutProbe
  phoneState: PhoneWorkspaceState
  gestureHandoffState: PhoneWorkspaceState | null
  previousPhoneState: PhoneWorkspaceState
  preview: ReactNode
  selectTableOfContentsTarget: (target: MobileTableOfContentsTarget) => void
  sourceModeRequest: number
  suggestionNotes: MobileNote[]
  tableOfContentsTarget: PhoneTableOfContentsTargetRequest | null
  transitionSwipeHandlers: ReturnType<typeof useHorizontalSwipe>
  onOpenNativeVault?: () => void
}

export function PhoneWorkspaceRoot(props: PhoneWorkspaceRootProps) {
  const { styles, mobileColors } = useMobileStyles(createThemeStyles)
  const insets = useSafeAreaInsets()
  const topColor = props.phoneState === 'sidebar' ? mobileColors.sidebar : mobileColors.card
  return (
    <View {...props.phoneLayoutProbe('phone.root')} style={styles.root}>
      <View testID="phone-top-inset" style={{ height: insets.top, backgroundColor: topColor }} />
      <PhoneWorkspaceContent {...props} />
      <View testID="phone-footer" style={{ paddingBottom: Math.max(0, insets.bottom - 12), backgroundColor: mobileColors.sidebar }}>
        <MobileSyncStatusBar compact sync={props.controller.snapshot.sync} onOpenLocalVault={props.onOpenNativeVault} retryFailedEdit={props.controller.retryFailedEdit} />
      </View>
      <PhoneWorkspaceActions {...props} />
      {props.commandPaletteElement}
    </View>
  )
}

function PhoneWorkspaceContent(props: PhoneWorkspaceRootProps) {
  return (
    <PhoneWorkspaceTransition
      dragX={props.dragPreview.dragX}
      gestureHandoffActive={props.gestureHandoffState === props.phoneState || props.dragPreview.handoffState === props.phoneState}
      preview={props.preview}
      previousState={props.previousPhoneState}
      state={props.phoneState}
      swipeHandlers={props.dragPreview.enabled ? undefined : props.transitionSwipeHandlers}
    >
      <PhoneWorkspaceScreens
        controller={props.controller}
        options={props.options}
        openEditor={props.navigation.openEditor}
        openSourceEditor={props.navigation.openSourceEditor}
        openCommandPalette={props.openCommandPalette}
        openList={props.navigation.openList}
        openProperties={props.navigation.openProperties}
        openSidebar={props.navigation.openSidebar}
        phoneLayoutProbe={props.phoneLayoutProbe}
        phoneState={props.phoneState}
        phoneSwipePreview={props.dragPreview}
        onRegisterEditorCommands={props.editorCommandRegistry.register}
        sourceModeRequest={props.sourceModeRequest}
        suggestionNotes={props.suggestionNotes}
        tableOfContentsTarget={props.tableOfContentsTarget}
      />
    </PhoneWorkspaceTransition>
  )
}

function PhoneWorkspaceActions(props: PhoneWorkspaceRootProps) {
  return (
    <WorkspaceActionSheetHost
      {...props.controller}
      editorCommands={props.editorCommandRegistry.commands}
      compactTablet
      defaultPropertiesVisible={false}
      initialEditorEditing={props.options.initialEditorEditing}
      layoutProbe={props.options.layoutProbe}
      suggestionNotes={props.suggestionNotes}
      onCreateRelationshipTarget={props.createRelationshipTargetAndOpenEditor}
      onEnterNeighborhood={props.navigation.openNeighborhoodList}
      onSelectTableOfContentsTarget={props.selectTableOfContentsTarget}
    />
  )
}
