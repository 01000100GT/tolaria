const sampleIntervalMs = 16
const longDelayMs = 50

/** Measures JavaScript scheduling delay, not native animation frame rate. */
export async function measureEventLoopDelay<T>(operation: () => Promise<T>) {
  const started = performance.now()
  let previous = started
  let sampleCount = 0
  let longDelayCount = 0
  let maxDelayMs = 0
  const sample = (now: number) => {
    const delay = Math.max(0, now - previous - sampleIntervalMs)
    previous = now
    sampleCount += 1
    if (delay >= longDelayMs) longDelayCount += 1
    maxDelayMs = Math.max(maxDelayMs, delay)
  }
  const timer = setInterval(() => sample(performance.now()), sampleIntervalMs)
  try {
    const result = await operation()
    const finished = performance.now()
    if (finished - previous >= sampleIntervalMs) sample(finished)
    return { result, eventLoop: {
      elapsedMs: Math.round(finished - started), sampleCount, longDelayCount, maxDelayMs: Math.ceil(maxDelayMs),
    } }
  } finally {
    clearInterval(timer)
  }
}
