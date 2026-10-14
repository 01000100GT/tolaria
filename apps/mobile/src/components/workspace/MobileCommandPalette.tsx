import type { MobileMetrics } from '../../ui/mobileMetrics'
import { useMobileStyles } from '../../ui/theme/useMobileTheme'
import type { MobileColors } from '../../ui/theme/mobilePalette'
import { useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import {
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  type NativeSyntheticEvent,
  type TextInputKeyPressEventData,
} from 'react-native'
import { Text } from '../ui/text'
import { Input } from '../ui/input'
import { mobileText } from '../../i18n/mobileText'
import { MobileButton } from '../../ui/MobileButton'
import { MobileKeyboardAvoidingView } from '../../ui/MobileKeyboardAvoidingView'
import { MobilePanel, MobileToolbar, MobileToolbarSpacer, MobileToolbarTitle } from '../../ui/MobilePanel'

import {
  mobileCommandGroupLabel,
  mobileCommandPaletteResults,
  type MobileCommandPaletteCommand,
} from '../../workspace/mobileCommandPalette'
import { mobileCommandPaletteLayoutContract } from './MobileCommandPaletteLayout'
import { optionalNativeMobileKeyCommandsModule } from '../../native/mobileNativeKeyCommands'

type MobileCommandPaletteProps = {
  commands: MobileCommandPaletteCommand[]
  onClose: () => void
}

export function MobileCommandPalette({ commands, onClose }: MobileCommandPaletteProps) {
  const { surfaceStyles, mobileColors, styles } = useMobileStyles(createThemeStyles)
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const results = useMemo(() => mobileCommandPaletteResults(commands, query), [commands, query])
  const selectCommand = (command: MobileCommandPaletteCommand) => {
    onClose()
    command.execute()
  }
  const selectActiveCommand = () => {
    const command = results.flatList.at(selectedIndex)
    if (command) selectCommand(command)
  }
  const handleQueryChange = (nextQuery: string) => {
    setSelectedIndex(0)
    setQuery(nextQuery)
  }
  const handleKey = (key: string) => {
    if (key === 'ArrowDown') {
      setSelectedIndex((index) => Math.min(index + 1, Math.max(results.flatList.length - 1, 0)))
    } else if (key === 'ArrowUp') {
      setSelectedIndex((index) => Math.max(index - 1, 0))
    } else if (key === 'Enter') {
      selectActiveCommand()
    } else if (key === 'Escape') {
      onClose()
    }
  }
  useNativePaletteKeys(handleKey)
  const handleKeyPress = (event: NativeSyntheticEvent<TextInputKeyPressEventData>) => {
    // Native arrows/Escape arrive through UIKeyCommand; Return uses onSubmitEditing.
    if (!optionalNativeMobileKeyCommandsModule()) handleKey(event.nativeEvent.key)
  }

  return (
    <MobileKeyboardAvoidingView style={surfaceStyles.overlay} testID="mobile-command-palette">
      <Pressable accessibilityLabel={mobileText('common.cancel')} style={surfaceStyles.backdrop} testID="mobile-command-palette-backdrop" onPress={onClose} />
      <View style={surfaceStyles.paletteContainer} pointerEvents="box-none">
        <MobilePanel accessibilityViewIsModal style={surfaceStyles.palette} testID="mobile-command-palette-panel">
          <MobileToolbar testID="mobile-command-palette-toolbar">
            <MobileToolbarTitle title={mobileText('menu.view.commandPalette')} />
            <MobileToolbarSpacer />
            <MobileButton label={mobileText('common.cancel')} variant="ghost" onPress={onClose} />
          </MobileToolbar>
          <Input
            autoCapitalize="none"
            autoCorrect={false}
            autoFocus
            clearButtonMode="while-editing"
            placeholder={mobileText('command.palettePlaceholder')}
            placeholderTextColor={mobileColors.textFaint}
            spellCheck={false}
            style={styles.input}
            testID="mobile-command-palette-input"
            value={query}
            onChangeText={handleQueryChange}
            onKeyPress={handleKeyPress}
            onSubmitEditing={selectActiveCommand}
          />
          <CommandResults
            groups={results.groups}
            selectedIndex={selectedIndex}
            onHover={setSelectedIndex}
            onSelect={selectCommand}
          />
          <CommandFooter />
        </MobilePanel>
      </View>
    </MobileKeyboardAvoidingView>
  )
}

function useNativePaletteKeys(onKey: (key: string) => void) {
  const current = useRef(onKey)
  useLayoutEffect(() => { current.current = onKey }, [onKey])
  useEffect(() => {
    const module = optionalNativeMobileKeyCommandsModule()
    if (!module) return
    const subscription = module.addListener('onShortcut', (event) => {
      if (!event.metaKey && !event.ctrlKey && !event.altKey) current.current(event.key)
    })
    module.setCommandPaletteOpen?.(true)
    return () => {
      module.setCommandPaletteOpen?.(false)
      subscription.remove()
    }
  }, [])
}

function CommandResults({
  groups,
  selectedIndex,
  onHover,
  onSelect,
}: {
  groups: ReturnType<typeof mobileCommandPaletteResults>['groups']
  selectedIndex: number
  onHover: (index: number) => void
  onSelect: (command: MobileCommandPaletteCommand) => void
}) {
  const { styles } = useMobileStyles(createThemeStyles)
  if (groups.length === 0) {
    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyText}>{mobileText('command.noMatches')}</Text>
      </View>
    )
  }

  const indexedGroups = indexedCommandGroups(groups)
  return (
    <ScrollView
      contentContainerStyle={styles.results}
      keyboardShouldPersistTaps="handled"
      style={styles.resultsScroll}
    >
      {indexedGroups.map((group) => (
        <View key={group.group} style={styles.group}>
          <Text style={styles.groupLabel}>{mobileCommandGroupLabel(group.group)}</Text>
          {group.items.map(({ command, index }) => (
            <CommandRow
              command={command}
              key={command.id}
              selected={index === selectedIndex}
              onHover={() => onHover(index)}
              onSelect={() => onSelect(command)}
            />
          ))}
        </View>
      ))}
    </ScrollView>
  )
}

function indexedCommandGroups(groups: ReturnType<typeof mobileCommandPaletteResults>['groups']) {
  let nextIndex = 0
  return groups.map((group) => ({
    group: group.group,
    items: group.items.map((command) => {
      const index = nextIndex
      nextIndex += 1
      return { command, index }
    }),
  }))
}

function CommandRow({
  command,
  selected,
  onHover,
  onSelect,
}: {
  command: MobileCommandPaletteCommand
  selected: boolean
  onHover: () => void
  onSelect: () => void
}) {
  const { styles } = useMobileStyles(createThemeStyles)
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      style={styles.rowPressable}
      testID={`mobile-command-palette-command-${command.id}`}
      onPress={onSelect}
      onPressIn={onHover}
    >
      {({ pressed }) => (
        <View style={[styles.row, selected ? styles.rowSelected : null, pressed ? styles.rowPressed : null]}>
          <Text numberOfLines={1} style={styles.rowLabel}>{command.label}</Text>
          {command.shortcut ? <Shortcut>{command.shortcut}</Shortcut> : null}
        </View>
      )}
    </Pressable>
  )
}

function Shortcut({ children }: { children: ReactNode }) {
  const { styles } = useMobileStyles(createThemeStyles)
  return <Text numberOfLines={1} style={styles.shortcut}>{children}</Text>
}

function CommandFooter() {
  const { styles } = useMobileStyles(createThemeStyles)
  return (
    <View style={styles.footer}>
      <Text style={styles.footerText}>{mobileText('command.footerNavigate')}</Text>
      <Text style={styles.footerText}>{mobileText('command.footerSelect')}</Text>
      <Text style={styles.footerText}>{mobileText('command.footerClose')}</Text>
    </View>
  )
}

function createThemeStyles(mobileColors: MobileColors, metrics: MobileMetrics) {
  const { space: mobileSpace, type: mobileType } = metrics
  const styles = StyleSheet.create({
    emptyState: {
      minHeight: metrics.size(mobileCommandPaletteLayoutContract.emptyMinHeight),
      alignItems: 'center',
      justifyContent: 'center',
      padding: mobileSpace.lg,
    },
    emptyText: {
      color: mobileColors.textMuted,
      fontSize: mobileType.body,
    },
    groupLabel: {
      color: mobileColors.textMuted,
      fontSize: metrics.size(11),
      fontWeight: '500',
      lineHeight: metrics.size(14),
      paddingBottom: metrics.size(mobileCommandPaletteLayoutContract.groupLabelPaddingBottom),
      paddingHorizontal: metrics.size(mobileCommandPaletteLayoutContract.groupLabelPaddingHorizontal),
      paddingTop: metrics.size(mobileCommandPaletteLayoutContract.groupLabelPaddingTop),
    },
    group: {
      alignSelf: 'stretch',
      width: '100%',
    },
    input: {
      minHeight: metrics.size(mobileCommandPaletteLayoutContract.inputMinHeight),
      borderBottomColor: mobileColors.border,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderRadius: 0,
      borderWidth: 0,
      color: mobileColors.text,
      fontSize: metrics.size(mobileCommandPaletteLayoutContract.inputTextSize),
      paddingHorizontal: metrics.size(mobileCommandPaletteLayoutContract.inputPaddingHorizontal),
      paddingVertical: metrics.size(mobileCommandPaletteLayoutContract.inputPaddingVertical),
    },
    results: {
      alignItems: 'stretch',
      paddingBottom: mobileSpace.sm,
      paddingTop: mobileSpace.xs,
      width: '100%',
    },
    resultsScroll: {
      flexShrink: 1,
      minHeight: 0,
      alignSelf: 'stretch',
      width: '100%',
    },
    row: {
      alignItems: 'center',
      alignSelf: 'stretch',
      borderRadius: mobileCommandPaletteLayoutContract.rowBorderRadius,
      flexDirection: 'row',
      gap: mobileSpace.sm,
      justifyContent: 'space-between',
      minHeight: metrics.size(mobileCommandPaletteLayoutContract.rowMinHeight),
      paddingHorizontal: metrics.size(mobileCommandPaletteLayoutContract.rowPaddingHorizontal),
      paddingVertical: metrics.size(mobileCommandPaletteLayoutContract.rowPaddingVertical),
      width: '100%',
    },
    rowPressable: {
      alignSelf: 'stretch',
      marginHorizontal: metrics.size(mobileCommandPaletteLayoutContract.rowMarginHorizontal),
      width: 'auto',
    },
    rowLabel: {
      flex: 1,
      minWidth: 0,
      color: mobileColors.text,
      fontSize: metrics.size(mobileCommandPaletteLayoutContract.rowTextSize),
      lineHeight: metrics.size(18),
    },
    rowPressed: {
      opacity: 0.78,
    },
    rowSelected: {
      backgroundColor: mobileColors.control,
    },
    shortcut: {
      color: mobileColors.textMuted,
      fontSize: metrics.size(mobileCommandPaletteLayoutContract.shortcutTextSize),
      lineHeight: metrics.size(16),
    },
    footer: {
      alignItems: 'center',
      flexDirection: 'row',
      gap: mobileSpace.md,
      borderTopColor: mobileColors.border,
      borderTopWidth: StyleSheet.hairlineWidth,
      paddingHorizontal: metrics.size(mobileCommandPaletteLayoutContract.footerPaddingHorizontal),
      paddingVertical: metrics.size(mobileCommandPaletteLayoutContract.footerPaddingVertical),
    },
    footerText: {
      color: mobileColors.textMuted,
      fontSize: mobileType.micro,
    },
  })

  const surfaceStyles = StyleSheet.create({
    backdrop: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: mobileColors.overlay,
    },
    overlay: {
      ...StyleSheet.absoluteFillObject,
      zIndex: 30,
    },
    paletteContainer: {
      flex: 1,
      minHeight: 0,
      alignItems: 'center',
      justifyContent: 'flex-start',
      paddingTop: metrics.size(mobileCommandPaletteLayoutContract.overlayPaddingTop),
    },
    palette: {
      flexShrink: 1,
      minHeight: 0,
      maxHeight: mobileCommandPaletteLayoutContract.paletteMaxHeight,
      maxWidth: mobileCommandPaletteLayoutContract.paletteMaxWidth,
      width: '92%',
      backgroundColor: mobileColors.card,
      borderColor: mobileColors.borderStrong,
      borderRadius: mobileCommandPaletteLayoutContract.paletteBorderRadius,
      borderWidth: StyleSheet.hairlineWidth,
      overflow: 'hidden',
      shadowColor: '#000000',
      shadowOffset: { height: 10, width: 0 },
      shadowOpacity: 0.14,
      shadowRadius: 28,
    },
  })
  return { mobileColors, styles, surfaceStyles }
}
