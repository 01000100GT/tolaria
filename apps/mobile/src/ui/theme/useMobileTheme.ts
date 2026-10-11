import { createContext, useContext, useMemo } from 'react'
import { mobilePalettes, type MobileColorMode, type MobileColors } from './mobilePalette'

export const MobileThemeContext = createContext<{ mode: MobileColorMode; colors: MobileColors }>({
  mode: 'light', colors: mobilePalettes.light,
})

export function useMobileTheme() {
  return useContext(MobileThemeContext)
}

export function useMobileColors() {
  return useMobileTheme().colors
}

export function useMobileStyles<T>(createStyles: (colors: MobileColors) => T): T {
  const colors = useMobileColors()
  return useMemo(() => createStyles(colors), [colors, createStyles])
}
