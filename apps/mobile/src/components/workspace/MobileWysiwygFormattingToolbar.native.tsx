import { useBridgeState, type EditorBridge } from '@10play/tentap-editor'
import type { ComponentProps } from 'react'
import { useWindowDimensions } from 'react-native'
import { MobileCompactFormattingToolbar } from './MobileCompactFormattingToolbar'
import { MobileMarkdownFormattingToolbar } from './MobileMarkdownFormattingToolbar'
import { formattingToolbarSelection } from './mobileFormattingToolbarModel'

type Props = Omit<ComponentProps<typeof MobileCompactFormattingToolbar>, 'selected' | 'inTable'> & { editor: EditorBridge }

export function MobileWysiwygFormattingToolbar({ editor, ...props }: Props) {
  const { width } = useWindowDimensions()
  const state = useBridgeState(editor)
  const tableState = state as typeof state & { canAddRowAfter?: boolean }
  const Toolbar = width >= 768 ? MobileMarkdownFormattingToolbar : MobileCompactFormattingToolbar
  return <Toolbar {...props} selected={formattingToolbarSelection(state)} inTable={tableState.canAddRowAfter === true} />
}
