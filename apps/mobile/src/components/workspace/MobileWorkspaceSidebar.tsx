import type { MobileMetrics } from '../../ui/mobileMetrics'
import { useMobileStyles } from '../../ui/theme/useMobileTheme'
import type { ReactNode } from 'react'
import {
  CaretDown,
  Command,
  FileText,
  Eye,
  Plus,
} from 'phosphor-react-native'
import { Pressable, ScrollView, View } from 'react-native'
import { Text } from '../ui/text'
import { mobileCopy, mobileText } from '../../i18n/mobileText'
import { MobileLayoutProbeReadout } from '../../qa/MobileLayoutProbeReadout'
import { probeProps, useMobileLayoutProbe, type MobileLayoutProbe } from '../../qa/mobileLayoutProbe'
import { MobileIconButton } from '../../ui/MobileIconButton'
import { MobilePanel, MobileToolbar } from '../../ui/MobilePanel'

import type {
  MobileNote,
  MobileSidebarIcon,
  MobileSidebarItem,
  MobileSidebarSection,
} from '../../workspace/mobileWorkspaceModel'
import { MobileSidebarCountPill } from './MobileSidebarCountPill'
import { MobileSidebarSettings } from './MobileSidebarSettings'
import { createSidebarStyles as createThemeStyles } from './mobileSidebarStyles'
import { FolderTree, type MobileSidebarFolderSelection } from './MobileWorkspaceSidebarFolderTree'
import { mobilePhosphorIconElement } from './MobileWorkspaceIconResolver'
import { noteTypeColor, noteTypeSoftColor } from './mobileWorkspaceTone'

export type { MobileSidebarFolderSelection } from './MobileWorkspaceSidebarFolderTree'

export type MobileSidebarItemSelection = {
  count?: string
  id: string
  label: string
  noteId?: string
  sectionId: string
  typeName?: string
  viewId?: string
}

type SidebarDisplayLabel = string
type SidebarItemId = string
type SidebarMetricId = string
type SidebarSectionId = string
type SidebarSlug = string
type SidebarSelectionHandler = NonNullable<MobileWorkspaceSidebarProps['onSelectItem']>

type MobileWorkspaceSidebarProps = {
  activeFolderId?: string | null
  activeItemId?: string | null
  layoutProbe?: boolean
  fullWidth?: boolean
  onCreateFolder?: () => void
  onCreateType?: () => void
  onCreateView?: () => void
  onOpenFolderActions?: (selection: MobileSidebarFolderSelection) => void
  onOpenFavoriteActions?: (selection: MobileSidebarItemSelection) => void
  onOpenCommandPalette?: () => void
  onOpenPrimaryActions?: (selection: MobileSidebarItemSelection) => void
  onOpenTypeVisibility?: () => void
  onOpenTypeActions?: (selection: MobileSidebarItemSelection) => void
  onOpenViewActions?: (selection: MobileSidebarItemSelection) => void
  onSelectFolder?: (selection: MobileSidebarFolderSelection) => void
  onSelectItem?: (selection: MobileSidebarItemSelection) => void
  sections: MobileSidebarSection[]
  title?: string
}

type SidebarItemProps = {
  active?: boolean
  activeBackgroundColor?: string
  activeColor?: string
  count?: string
  icon: ReactNode
  label: SidebarDisplayLabel
  layoutProbe?: MobileLayoutProbe
  metricId: SidebarMetricId
  onLongPress?: () => void
  onPress?: () => void
  slug: SidebarSlug
}

export function MobileWorkspaceSidebar(props: MobileWorkspaceSidebarProps) {
  const { styles } = useMobileStyles(createThemeStyles)
  const layoutProbe = useMobileLayoutProbe(props.layoutProbe ?? false)
  return (
    <MobilePanel {...layoutProbe.probe('sidebar.panel')} style={[styles.panel, props.fullWidth && styles.fullWidth]} testID="workspace-sidebar-panel">
      <SidebarToolbar title={props.title} onOpenCommandPalette={props.onOpenCommandPalette} />
      <ScrollView {...layoutProbe.probe('sidebar.scroll')} style={styles.scroll} contentContainerStyle={styles.content}>
        {props.sections.map((section) => (
          <SidebarSection {...props} key={section.id} layoutProbe={layoutProbe.probe} section={section} />
        ))}
      </ScrollView>
      <MobileSidebarSettings />
      {props.layoutProbe ? <MobileLayoutProbeReadout metrics={layoutProbe.metrics} testID="sidebar-layout-metrics" /> : null}
    </MobilePanel>
  )
}

function SidebarToolbar({ title, onOpenCommandPalette }: Pick<MobileWorkspaceSidebarProps, 'title' | 'onOpenCommandPalette'>) {
  const { styles, mobileColors, metrics } = useMobileStyles(createThemeStyles)
  return (
      <MobileToolbar testID="sidebar-toolbar">
        <Text numberOfLines={1} style={styles.vaultTitle} testID="sidebar-toolbar-title">{title ?? mobileText('status.vault.default')}</Text>
        {onOpenCommandPalette ? (
          <View style={styles.toolbarActions}>
            <MobileIconButton
              accessibilityLabel={mobileText('menu.view.commandPalette')}
              testID="sidebar-command-palette-action"
              onPress={onOpenCommandPalette}
            >
              <Command color={mobileColors.textMuted} size={metrics.toolbarAction.iconSize} />
            </MobileIconButton>
          </View>
        ) : null}
      </MobileToolbar>
  )
}

type SidebarSectionProps = Omit<MobileWorkspaceSidebarProps, 'layoutProbe'> & {
  layoutProbe: MobileLayoutProbe
  section: MobileSidebarSection
}

function SidebarSection(props: SidebarSectionProps) {
  const { styles } = useMobileStyles(createThemeStyles)
  const { layoutProbe, section } = props
  return (
    <View
      {...probeProps(layoutProbe, `sidebar.section.${section.id}.container`)}
      style={[styles.section, section.id === 'primary' ? styles.primarySection : styles.groupSection]}
      testID={`sidebar-section-${section.id}`}
    >
      <SidebarSectionTitle {...props} />
      <SidebarSectionItems {...props} />
      {section.folders ? (
        <FolderTree
          activeFolderId={props.activeFolderId}
          folders={section.folders}
          layoutProbe={layoutProbe}
          onOpenFolderActions={props.onOpenFolderActions}
          onSelectFolder={props.onSelectFolder}
        />
      ) : null}
    </View>
  )
}

function SidebarSectionTitle({
  layoutProbe,
  onCreateFolder,
  onCreateType,
  onCreateView,
  onOpenTypeVisibility,
  section,
}: {
  layoutProbe: MobileLayoutProbe
  onCreateFolder?: () => void
  onCreateType?: () => void
  onCreateView?: () => void
  onOpenTypeVisibility?: () => void
  section: MobileSidebarSection
}) {
  if (!section.label) return null

  return (
    <SectionTitle
      count={section.count}
      label={sidebarSectionLabel(section.id, section.label)}
      layoutProbe={layoutProbe}
      sectionId={section.id}
      createAccessibilityLabel={sectionCreateAccessibilityLabel(section.id)}
      onCreate={sectionCreateHandler(section.id, onCreateFolder, onCreateType, onCreateView)}
      visibilityAccessibilityLabel={sectionVisibilityAccessibilityLabel(section.id)}
      onVisibility={sectionVisibilityHandler(section.id, onOpenTypeVisibility)}
    />
  )
}

function sectionVisibilityAccessibilityLabel(sectionId: SidebarSectionId) {
  if (sectionId === 'types') return mobileText('sidebar.section.showInSidebar')
  return undefined
}

function sectionVisibilityHandler(
  sectionId: SidebarSectionId,
  onOpenTypeVisibility?: () => void,
) {
  if (sectionId === 'types') return onOpenTypeVisibility
  return undefined
}

function sectionCreateAccessibilityLabel(sectionId: SidebarSectionId) {
  if (sectionId === 'folders') return mobileText('sidebar.action.createFolder')
  if (sectionId === 'types') return mobileText('sidebar.action.createType')
  if (sectionId === 'views') return mobileText('sidebar.action.createView')
  return undefined
}

function sectionCreateHandler(
  sectionId: SidebarSectionId,
  onCreateFolder?: () => void,
  onCreateType?: () => void,
  onCreateView?: () => void,
) {
  if (sectionId === 'folders') return onCreateFolder
  if (sectionId === 'types') return onCreateType
  if (sectionId === 'views') return onCreateView
  return undefined
}

function SidebarSectionItems(props: SidebarSectionProps) {
  const { activeItemId, layoutProbe, onSelectItem, section } = props
  const themeStyles = useMobileStyles(createThemeStyles)
  return section.items?.map((item) => {
    const active = activeItemId ? item.id === activeItemId : item.active
    const label = sidebarLabel(item.id, item.label)
    const selection = sidebarItemSelection(item, label, section.id)

    return (
      <SidebarItem
        active={active}
        activeBackgroundColor={sidebarActiveBackgroundColor(themeStyles, item.tone)}
        activeColor={sidebarActiveColor(themeStyles, item.tone)}
        count={item.count}
        icon={sidebarIcon(themeStyles, item.icon, active ? item.tone ?? 'primary' : item.tone)}
        key={item.id}
        label={label}
        layoutProbe={layoutProbe}
        metricId={`sidebar.item.${item.id}`}
        slug={item.id}
        onLongPress={sidebarItemLongPress({
          onOpenPrimaryActions: props.onOpenPrimaryActions,
          onOpenTypeActions: props.onOpenTypeActions,
          onOpenViewActions: props.onOpenViewActions,
          onOpenFavoriteActions: props.onOpenFavoriteActions,
          sectionId: section.id,
          selection,
        })}
        onPress={() => onSelectItem?.(selection)}
      />
    )
  }) ?? null
}

function sidebarItemLongPress({
  onOpenPrimaryActions,
  onOpenTypeActions,
  onOpenViewActions,
  onOpenFavoriteActions,
  sectionId,
  selection,
}: {
  onOpenPrimaryActions?: (selection: MobileSidebarItemSelection) => void
  onOpenTypeActions?: (selection: MobileSidebarItemSelection) => void
  onOpenViewActions?: (selection: MobileSidebarItemSelection) => void
  onOpenFavoriteActions?: (selection: MobileSidebarItemSelection) => void
  sectionId: SidebarSectionId
  selection: MobileSidebarItemSelection
}) {
  const handler = sidebarLongPressHandler({
    onOpenFavoriteActions,
    onOpenPrimaryActions,
    onOpenTypeActions,
    onOpenViewActions,
    sectionId,
    selection,
  })

  return handler ? () => handler(selection) : undefined
}

function sidebarLongPressHandler({
  onOpenFavoriteActions,
  onOpenPrimaryActions,
  onOpenTypeActions,
  onOpenViewActions,
  sectionId,
  selection,
}: {
  onOpenFavoriteActions?: SidebarSelectionHandler
  onOpenPrimaryActions?: SidebarSelectionHandler
  onOpenTypeActions?: SidebarSelectionHandler
  onOpenViewActions?: SidebarSelectionHandler
  sectionId: SidebarSectionId
  selection: MobileSidebarItemSelection
}): SidebarSelectionHandler | undefined {
  if (sectionId === 'primary') return primaryItemCanCustomizeColumns(selection.id) ? onOpenPrimaryActions : undefined

  const handlers: Partial<Record<SidebarSectionId, SidebarSelectionHandler | undefined>> = {
    favorites: onOpenFavoriteActions,
    types: onOpenTypeActions,
    views: onOpenViewActions,
  }
  return handlers[sectionId]
}

function primaryItemCanCustomizeColumns(itemId: SidebarItemId) {
  return itemId === 'all-notes' || itemId === 'inbox'
}

function sidebarItemSelection(
  item: MobileSidebarItem,
  label: SidebarDisplayLabel,
  sectionId: SidebarSectionId,
): MobileSidebarItemSelection {
  return {
    count: item.count,
    id: item.id,
    label,
    noteId: item.noteId,
    sectionId,
    typeName: item.typeName,
    viewId: item.viewId,
  }
}

function SidebarItem(props: SidebarItemProps) {
  const themeStyles = useMobileStyles(createThemeStyles)
  const { mobileColors, styles } = themeStyles
  const {
    active = false,
    activeBackgroundColor = mobileColors.primarySoft,
    activeColor = mobileColors.primary,
    count,
    icon,
    label,
    layoutProbe,
    metricId,
    onLongPress,
    onPress,
    slug,
  } = props

  return (
    <Pressable
      {...probeProps(layoutProbe, `${metricId}.row`)}
      accessibilityLabel={label}
      accessibilityRole="button"
      delayLongPress={300}
      onLongPress={onLongPress}
      onPress={onPress}
      style={[
        styles.item,
        sidebarItemPadding(themeStyles.metrics.sidebar, Boolean(count)),
        active ? { backgroundColor: activeBackgroundColor } : null,
      ]}
      testID={`sidebar-item-${slug}`}
    >
      <View
        {...probeProps(layoutProbe, `${metricId}.content`)}
        style={[styles.itemContent, sidebarItemContentHeight(themeStyles.metrics.sidebar, Boolean(count))]}
      >
        {icon}
        <Text
          {...probeProps(layoutProbe, `${metricId}.label`)}
          numberOfLines={1}
          style={[styles.itemText, themeStyles.nativeItemTextStyle, active ? { color: activeColor } : null]}
          testID={`sidebar-item-${slug}-label`}
        >
          {label}
        </Text>
        {count ? (
          <MobileSidebarCountPill
            activeColor={active ? activeColor : undefined}
            layoutProbe={layoutProbe}
            metricId={`${metricId}.count`}
            testID={`sidebar-item-${slug}-count`}
            value={count}
          />
        ) : null}
      </View>
    </Pressable>
  )
}

type SectionTitleProps = {
  count?: string
  createAccessibilityLabel?: string
  label: SidebarDisplayLabel
  layoutProbe?: MobileLayoutProbe
  onCreate?: () => void
  onVisibility?: () => void
  sectionId: SidebarSectionId
  visibilityAccessibilityLabel?: string
}

function SectionTitle(props: SectionTitleProps) {
  const { count, createAccessibilityLabel, label, layoutProbe, onCreate, onVisibility, sectionId, visibilityAccessibilityLabel } = props
  const themeStyles = useMobileStyles(createThemeStyles)
  const { styles, mobileColors } = themeStyles
  const metricId = `sidebar.section.${sectionId}`

  return (
    <View
      {...probeProps(layoutProbe, `${metricId}.row`)}
      style={[styles.sectionTitleRow, themeStyles.nativeSectionTitleRowStyle, count ? styles.sectionTitleRowWithCount : styles.sectionTitleRowRegular]}
      testID={`sidebar-section-title-${sectionId}`}
    >
      <CaretDown color={mobileColors.textMuted} size={themeStyles.metrics.size(11)} />
      <Text
        {...probeProps(layoutProbe, `${metricId}.label`)}
        style={[styles.sectionTitle, themeStyles.nativeSectionTitleTextStyle]}
        testID={`sidebar-section-title-text-${sectionId}`}
      >
        {label}
      </Text>
      {count ? (
        <MobileSidebarCountPill
          compact
          layoutProbe={layoutProbe}
          metricId={`${metricId}.count`}
          testID={`sidebar-section-count-${sectionId}`}
          value={count}
        />
      ) : null}
      {onVisibility ? (
        <MobileIconButton
          accessibilityLabel={visibilityAccessibilityLabel ?? mobileText('sidebar.section.showInSidebar')}
          testID={`sidebar-section-visibility-${sectionId}`}
          onPress={onVisibility}
        >
          <Eye color={mobileColors.textMuted} size={themeStyles.metrics.size(12)} />
        </MobileIconButton>
      ) : null}
      {onCreate ? (
        <MobileIconButton
          accessibilityLabel={createAccessibilityLabel ?? mobileText('sidebar.action.createView')}
          testID={`sidebar-section-create-${sectionId}`}
          onPress={onCreate}
        >
          <Plus color={mobileColors.textMuted} size={themeStyles.metrics.size(12)} />
        </MobileIconButton>
      ) : null}
    </View>
  )
}

function sidebarIcon(themeStyles: ReturnType<typeof createThemeStyles>, icon: MobileSidebarIcon, tone?: MobileNote['typeTone'] | 'primary') {
  const color = sidebarIconColor(themeStyles, tone)

  const size = themeStyles.metrics.size(15)
  return mobilePhosphorIconElement(icon, { color, size }) ?? <FileText color={color} size={size} />
}

function sidebarIconColor(themeStyles: ReturnType<typeof createThemeStyles>, tone?: MobileNote['typeTone'] | 'primary') {
  const { mobileColors } = themeStyles
  if (tone === 'primary') return mobileColors.primary
  if (tone) return noteTypeColor(tone, mobileColors)

  return mobileColors.textMuted
}

function sidebarActiveColor(themeStyles: ReturnType<typeof createThemeStyles>, tone?: MobileNote['typeTone']) {
  const { mobileColors } = themeStyles
  return tone ? noteTypeColor(tone, mobileColors) : mobileColors.primary
}

function sidebarActiveBackgroundColor(themeStyles: ReturnType<typeof createThemeStyles>, tone?: MobileNote['typeTone']) {
  const { mobileColors } = themeStyles
  return tone ? noteTypeSoftColor(tone, mobileColors) : mobileColors.primarySoft
}

function sidebarLabel(id: SidebarItemId, fallback: SidebarDisplayLabel) {
  if (id === 'all-notes') return mobileCopy.allNotes
  if (id === 'archive') return mobileCopy.archive
  if (id === 'inbox') return mobileCopy.inbox

  return fallback
}

function sidebarSectionLabel(id: SidebarSectionId, fallback: SidebarDisplayLabel) {
  if (id === 'folders') return mobileText('sidebar.group.folders')
  if (id === 'favorites') return mobileCopy.favorites
  if (id === 'types') return mobileCopy.types
  if (id === 'views') return mobileCopy.views

  return fallback
}

function sidebarItemPadding(desktopSidebarParity: MobileMetrics['sidebar'], hasCount: boolean) {
  const padding = hasCount ? desktopSidebarParity.itemPadding.withCount : desktopSidebarParity.itemPadding.regular
  const contentHeight = hasCount ? desktopSidebarParity.itemContentHeight.withCount : desktopSidebarParity.itemContentHeight.regular

  return {
    minHeight: contentHeight + padding.top + padding.bottom,
    paddingBottom: padding.bottom,
    paddingLeft: padding.left,
    paddingRight: padding.right,
    paddingTop: padding.top,
  }
}

function sidebarItemContentHeight(desktopSidebarParity: MobileMetrics['sidebar'], hasCount: boolean) {
  const minHeight = hasCount ? desktopSidebarParity.itemContentHeight.withCount : desktopSidebarParity.itemContentHeight.regular
  return { minHeight }
}
