import postcss from 'postcss'

type Variables = Record<string, string>

// Build/test only. The native runtime imports the generated JSON, never CSS parsers.
export function parseDesktopThemes(css: string) {
  const root = postcss.parse(css)
  const light = readTheme(root, 'light')
  const dark = new Map([...light, ...readTheme(root, 'dark')])
  return {
    light: resolveTheme(light),
    dark: resolveTheme(dark),
  }
}

function readTheme(root: postcss.Root, mode: 'light' | 'dark') {
  const variables = new Map<string, string>()
  root.walkRules((rule) => {
    if (!rule.selectors.includes(`[data-theme="${mode}"]`)) return
    rule.walkDecls((declaration) => {
      if (declaration.prop.startsWith('--')) variables.set(declaration.prop, declaration.value)
    })
  })
  if (variables.size === 0) throw new Error(`Missing desktop ${mode} theme`)
  return variables
}

function resolveTheme(variables: Map<string, string>): Variables {
  return Object.fromEntries([...variables.keys()].sort().map((key) => [key, resolveVariable(key, variables)]))
}

function resolveVariable(key: string, variables: Map<string, string>): string {
  const visited = new Set<string>()
  let current = key
  while (!visited.has(current)) {
    visited.add(current)
    const value = variables.get(current)
    if (value === undefined) throw new Error(`Missing theme variable ${current}`)
    if (!value.startsWith('var(')) return value
    current = value.slice(4, -1).trim()
  }
  throw new Error(`Cyclic theme variable ${current}`)
}
