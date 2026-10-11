type AutoGitState = { enabled: boolean; foreground: boolean; blocked: boolean }

export function createMobileAutoGit(run: () => Promise<unknown>, idleMs = 30_000) {
  let state: AutoGitState = { enabled: false, foreground: true, blocked: false }
  let timer: ReturnType<typeof setTimeout> | undefined
  let version = 0
  let attempted = 0
  let running = false
  let disposed = false

  function cancelTimer() {
    clearTimeout(timer)
    timer = undefined
  }

  function schedule() {
    cancelTimer()
    if (disposed || running || !canSync(state)) return
    if (version > attempted) timer = setTimeout(() => { void execute() }, idleMs)
  }

  async function execute() {
    attempted = version
    running = true
    try { await run() } catch { /* The operation owner presents failures; retry only on a new trigger. */ }
    finally { running = false; schedule() }
  }

  return {
    dirty: () => { version += 1; schedule() },
    update: (next: AutoGitState) => {
      if (sameState(state, next)) return
      state = next
      schedule()
    },
    dispose: () => { disposed = true; cancelTimer() },
  }
}

function canSync(state: AutoGitState) {
  return state.enabled && state.foreground && !state.blocked
}

function sameState(previous: AutoGitState, next: AutoGitState) {
  return previous.enabled === next.enabled && previous.foreground === next.foreground && previous.blocked === next.blocked
}
