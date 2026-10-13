export type MobileAnalyticsEvent =
  | { name: 'mobile_note_swipe_used'; action: 'favorite' | 'archive' | 'delete' }
  | { name: 'mobile_setting_changed'; setting: 'theme' | 'uiScale' | 'autoGit' }
  | { name: 'mobile_git_operation_requested'; operation: 'commit' | 'sync' | 'autoSync' }
  | { name: 'mobile_folder_sync_requested'; operation: 'sync' }
  | { name: 'mobile_editor_tool_opened'; tool: 'find' | 'replace' | 'slash' }
  | { name: 'mobile_vault_catalog_used'; action: 'add' | 'switch' | 'forget'; kind: 'local' | 'git' }

export type MobileAnalyticsBody = { event: MobileAnalyticsEvent['name']; distinct_id: string; properties: Record<string, string | boolean> }
type Dependencies = {
  configured: boolean
  createId: () => string
  platform: string
  send: (body: MobileAnalyticsBody, signal: AbortSignal) => Promise<void>
}

export function createMobileAnalytics({ configured, createId, platform, send }: Dependencies) {
  let enabled = false
  let id: string | null = null
  const requests = new Set<AbortController>()
  const setEnabled = (value: boolean) => {
    enabled = configured && value
    if (enabled) return
    id = null
    for (const request of requests) request.abort()
    requests.clear()
  }
  const capture = (event: MobileAnalyticsEvent) => {
    if (!enabled || requests.size >= 8) return
    id ??= createId()
    const request = new AbortController()
    requests.add(request)
    const timeout = setTimeout(() => request.abort(), 5_000)
    const body = { event: event.name, distinct_id: id, properties: {
      $process_person_profile: false, $geoip_disable: true,
      platform, ...eventProperties(event),
    } }
    void send(body, request.signal).catch(() => {}).finally(() => {
      clearTimeout(timeout)
      requests.delete(request)
    })
  }
  return { capture, setEnabled }
}

// Select properties explicitly: never spread caller objects into telemetry.
function eventProperties(event: MobileAnalyticsEvent): Record<string, string> {
  if (event.name === 'mobile_note_swipe_used') return { action: event.action }
  if (event.name === 'mobile_setting_changed') return { setting: event.setting }
  if (event.name === 'mobile_editor_tool_opened') return { tool: event.tool }
  if (event.name === 'mobile_vault_catalog_used') return { action: event.action, kind: event.kind }
  return { operation: event.operation }
}
