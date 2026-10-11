import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { parseDesktopThemes } from './parseDesktopTheme'

describe('desktop theme export', () => {
  it('extracts both desktop palettes and resolves semantic aliases', () => {
    const themes = parseDesktopThemes(readFileSync('../../src/index.css', 'utf8'))
    expect(themes.light['--background']).toBe('#FFFFFF')
    expect(themes.dark['--background']).toBe('#1F1E1B')
    expect(themes.dark['--sidebar']).toBe('#191814')
    expect(themes.dark['--foreground']).toBe('#E6E1D8')
    expect(themes.dark['--primary-foreground']).toBe('#151411')
    expect(Object.keys(themes.dark).sort()).toEqual(Object.keys(themes.light).sort())
    expect(Object.values(themes.dark).some((value) => value.includes('var('))).toBe(false)
  })

  it('rejects incomplete palettes instead of silently exporting light-only tokens', () => {
    expect(() => parseDesktopThemes('[data-theme="light"] { --background: white; }')).toThrow('Missing desktop dark theme')
  })

  it('rejects missing aliases and cycles', () => {
    const sheet = (value: string) => `[data-theme="light"] { --a: ${value}; } [data-theme="dark"] { --a: black; }`
    expect(() => parseDesktopThemes(sheet('var(--missing)'))).toThrow('Missing theme variable --missing')
    expect(() => parseDesktopThemes(sheet('var(--a)'))).toThrow('Cyclic theme variable --a')
  })
})
