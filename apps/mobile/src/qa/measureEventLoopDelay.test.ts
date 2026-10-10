import { afterEach, expect, it, vi } from 'vitest'
import { measureEventLoopDelay } from './measureEventLoopDelay'

afterEach(() => { vi.restoreAllMocks(); vi.useRealTimers() })

function clock() {
  vi.useFakeTimers()
  let now = 0
  vi.spyOn(performance, 'now').mockImplementation(() => now)
  return (value: number) => { now = value }
}

it('reports responsive ticks without inventing stalls', async () => {
  const setTime = clock()
  const measured = await measureEventLoopDelay(async () => {
    for (const time of [16, 32, 48]) {
      setTime(time)
      vi.advanceTimersByTime(16)
    }
    return 'done'
  })
  expect(measured).toEqual({ result: 'done', eventLoop: {
    elapsedMs: 48, sampleCount: 3, longDelayCount: 0, maxDelayMs: 0,
  } })
  expect(vi.getTimerCount()).toBe(0)
})

it('measures late callbacks and a blocked final segment', async () => {
  const setTime = clock()
  const measured = await measureEventLoopDelay(async () => {
    setTime(116)
    vi.advanceTimersByTime(16)
    setTime(216)
  })
  expect(measured.eventLoop).toEqual({ elapsedMs: 216, sampleCount: 2, longDelayCount: 2, maxDelayMs: 100 })
})

it('does not count a short final partial frame as a stalled timer', async () => {
  const setTime = clock()
  const measured = await measureEventLoopDelay(async () => { setTime(4) })
  expect(measured.eventLoop).toEqual({ elapsedMs: 4, sampleCount: 0, longDelayCount: 0, maxDelayMs: 0 })
})

it('stops sampling when the operation fails', async () => {
  clock()
  await expect(measureEventLoopDelay(async () => { throw new Error('failed') })).rejects.toThrow('failed')
  expect(vi.getTimerCount()).toBe(0)
})
