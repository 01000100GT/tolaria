import { ScrollView, StyleSheet, View } from 'react-native'
import { mobileText } from '../../i18n/mobileText'
import { Button } from '../ui/button'
import { mobileColors, mobileSpace } from '../../ui/tokens'
import { probeProps, type MobileLayoutProbe } from '../../qa/mobileLayoutProbe'
import type { MobileMarkdownFormatAction } from '../../workspace/mobileMarkdownFormatting'

import { formattingCommands } from './mobileFormattingCommands'
import { formattingToolbarTouchSize } from './mobileFormattingToolbarModel'

const nativeOnlyFormattingActions = new Set<MobileMarkdownFormatAction>([
  'tableAddColumnAfter',
  'tableAddRowAfter',
  'tableDeleteColumn',
  'tableDeleteRow',
])

const sourceMarkdownFormattingActions = formattingCommands
  .map((command) => command.action)
  .filter((action) => !nativeOnlyFormattingActions.has(action))

export function MobileMarkdownFormattingToolbar({
  actions,
  layoutProbe,
  metricId,
  onFormat,
  selected = [],
  inTable = false,
}: {
  actions?: readonly MobileMarkdownFormatAction[]
  layoutProbe?: MobileLayoutProbe
  metricId?: string
  onFormat: (action: MobileMarkdownFormatAction) => void
  selected?: readonly MobileMarkdownFormatAction[]
  inTable?: boolean
}) {
  const visibleActions = new Set((actions ?? sourceMarkdownFormattingActions)
    .filter((action) => inTable || !nativeOnlyFormattingActions.has(action)))

  return (
    <ScrollView
      accessibilityLabel={mobileText('editor.formatting.toolbar')}
      alwaysBounceHorizontal={false}
      contentContainerStyle={styles.toolbarContent}
      horizontal
      keyboardShouldPersistTaps="always"
      {...formattingProbeProps(layoutProbe, metricId)}
      showsHorizontalScrollIndicator={false}
      style={styles.toolbarViewport}
      testID="editor-formatting-toolbar"
    >
      {formattingCommands.filter((command) => visibleActions.has(command.action)).map((command) => (
        <View
          key={command.action}
          {...formattingProbeProps(layoutProbe, metricId, `action.${command.action}`)}
          style={styles.actionProbe}
        >
          <Button
            accessibilityLabel={command.label}
            accessibilityState={{ selected: selected.includes(command.action) }}
            variant="ghost"
            size="icon"
            style={[styles.actionProbe, selected.includes(command.action) && styles.selected]}
            testID={command.testID}
            onPress={() => onFormat(command.action)}
          >
            {command.icon(selected.includes(command.action) ? mobileColors.primary : mobileColors.textMuted)}
          </Button>
        </View>
      ))}
    </ScrollView>
  )
}

function formattingProbeProps(
  layoutProbe: MobileLayoutProbe | undefined,
  metricId: string | undefined,
  segment?: string,
) {
  if (!layoutProbe || !metricId) return {}
  return probeProps(layoutProbe, segment ? `${metricId}.${segment}` : metricId)
}

const styles = StyleSheet.create({
  actionProbe: {
    height: formattingToolbarTouchSize,
    width: formattingToolbarTouchSize,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 4,
  },
  selected: { backgroundColor: mobileColors.primarySoft },
  toolbarContent: {
    flexDirection: 'row',
    gap: mobileSpace.xs,
    paddingBottom: mobileSpace.xs,
  },
  toolbarViewport: {
    flexGrow: 0,
  },
})
