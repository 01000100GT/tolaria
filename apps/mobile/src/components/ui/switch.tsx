import type { ComponentProps } from 'react'
import type { StyleProp, ViewStyle } from 'react-native'
import * as SwitchPrimitive from '@rn-primitives/switch'
import { mobileColors } from '../../ui/tokens'

// RNR Root/Thumb composition with explicit native layout, matching desktop roles.
type SwitchProps = Omit<ComponentProps<typeof SwitchPrimitive.Root>, 'style'> & { style?: StyleProp<ViewStyle> }

export function Switch({ checked, disabled, style, ...props }: SwitchProps) {
  return <SwitchPrimitive.Root
    {...props} checked={checked} disabled={disabled} hitSlop={8}
    style={[{ width: 44, height: 26, borderRadius: 13, padding: 3, justifyContent: 'center',
      backgroundColor: checked ? mobileColors.primary : mobileColors.borderStrong, opacity: disabled ? 0.5 : 1 }, style]}
  >
    <SwitchPrimitive.Thumb style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: mobileColors.textInverse, transform: [{ translateX: checked ? 18 : 0 }] }} />
  </SwitchPrimitive.Root>
}
