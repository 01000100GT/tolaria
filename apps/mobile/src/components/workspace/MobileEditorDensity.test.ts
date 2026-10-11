import { describe, expect, it } from 'vitest'
import { mobileMetrics } from '../../ui/mobileMetrics'
import { mobilePalettes } from '../../ui/theme/mobilePalette'
import { mobileTentapEditorCss } from './MobileWysiwygMarkdownEditorCss'

describe('rich editor density', () => {
  it('uses the same larger text and spacing as native chrome without scaling borders or width', () => {
    const css = mobileTentapEditorCss(false, null, mobilePalettes.light, mobileMetrics[1.1])
    expect(css).toContain('font-size: 16.5px;')
    expect(css).toContain('line-height: 25.3px;')
    expect(css).toContain('padding: 22px 44px 105.6px;')
    expect(css).toContain('max-width: 820px;')
    expect(css).toContain('border-bottom: 1px solid')
  })
})
