import { describe, expect, it } from 'vitest'
import { patchMarkdownSource } from './markdownSourcePatch'

describe('source-preserving rich edits', () => {
  it('applies a single character edit without rewriting invisible HTML, entities or tables', () => {
    const source = 'Inline code: `loadData([["y"]])` and `[[x]]`.\r\nPlaceholder: <term>\r\n<!-- comment -->\r\nEntity: &lt;term&gt;\r\n| id | left | right |\r\n| :--- | :--- | ---: |\r\n| a | b | c |\r\n'
    const baseline = 'Inline code: `loadData([["y"]])` and `[[x]]`.\nPlaceholder: \nEntity: <term>\n| id | left | right |\n| --- | --- | --- |\n| a | b | c |\n'
    expect(patchMarkdownSource(source, baseline, baseline.replace('Inline code:', 'Inline codes:')))
      .toBe(source.replace('Inline code:', 'Inline codes:'))
  })

  it('preserves source bytes when the rich document has no changes', () => {
    expect(patchMarkdownSource('A &amp; B\r\n', 'A & B\n', 'A & B\n')).toBe('A &amp; B\r\n')
  })

  it('keeps source spellings across separate edits and real wikilink changes', () => {
    const source = 'One &amp; two.\n\n[[Old]] and snake_case.\n'
    const baseline = 'One & two.\n\n[[Old]] and snake_case.\n'
    const next = 'Ones & two.\n\n[[New]] and snake_case!\n'
    expect(patchMarkdownSource(source, baseline, next))
      .toBe('Ones &amp; two.\n\n[[New]] and snake_case!\n')
  })

  it('allows deleting visible content adjacent to an invisible HTML placeholder', () => {
    expect(patchMarkdownSource('ABC <term>\n', 'ABC \n', 'AB \n')).toBe('AB <term>\n')
  })

  it('edits entity text without modifying a matching invisible placeholder', () => {
    const source = 'Placeholder: <term>\nEntity: &lt;term&gt;\n'
    const baseline = 'Placeholder: \nEntity: <term>\n'
    expect(patchMarkdownSource(source, baseline, baseline.replace('<term>', '<terms>')))
      .toBe(source.replace('&lt;term&gt;', '&lt;terms&gt;'))
  })

  it('replaces a displayed entity without retaining its source suffix', () => {
    expect(patchMarkdownSource('A &amp; B\n', 'A & B\n', 'A plus B\n')).toBe('A plus B\n')
  })
  it('deletes a rich line break without leaving an orphan carriage return', () => {
    expect(patchMarkdownSource('A\r\nB\r\n', 'A\nB\n', 'AB\n')).toBe('AB\r\n')
  })

  it('uses the original line ending when inserting a rich line break', () => {
    expect(patchMarkdownSource('AB\r\n', 'AB\n', 'A\nB\n')).toBe('A\r\nB\r\n')
  })

})
