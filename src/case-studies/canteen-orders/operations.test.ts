// Executable form of the SPEC.md §19.3 step tables, on the seed counter.
import { describe, expect, it } from 'vitest'
import { buildCounter, waitingOrders } from './operations'
import { canteenSimulator } from './simulator'
import type { CanteenSnapshot } from './types'

const descs = (steps: { description: string }[]) => steps.map((s) => s.description)
const lines = (steps: { highlightLine: number }[]) => steps.map((s) => s.highlightLine)
const run = (id: string, state: CanteenSnapshot, input?: unknown) => canteenSimulator.operations.find((o) => o.id === id)!.run(state, input)
const seed = (variant: 'queue' | 'stack') => canteenSimulator.createInitialState(variant)

describe('seed', () => {
  it('runs the same actions on both designs', () => {
    const q = seed('queue')
    expect(waitingOrders(q)).toEqual([104, 105, 106])
    expect(q.log).toEqual([101, 102, 103, null])
    expect(q.skipped).toBe(0)
    const k = seed('stack')
    expect(waitingOrders(k)).toEqual([106, 105, 101])
    expect(k.log).toEqual([103, 102, 104, null])
    expect(k.skipped).toBe(3)
    expect(k.lastId).toBeNull()
  })
})

describe('place order', () => {
  it('numbers the order, then links it at the back or on top', () => {
    const q = run('place-queue', seed('queue'))
    expect(lines(q.steps)).toEqual([2, 3])
    expect(descs(q.steps)).toEqual(['The counter gives the new order number 107.', 'Order 107 joins the back of the queue after order 106.'])
    expect(waitingOrders(q.finalSnapshot)).toEqual([104, 105, 106, 107])
    const k = run('place-stack', seed('stack'))
    expect(descs(k.steps).at(-1)).toBe('Order 107 goes on top of the stack, above order 106.')
    expect(waitingOrders(k.finalSnapshot)).toEqual([107, 106, 105, 101])
  })

  it('handles an empty counter and a full one', () => {
    const empty = buildCounter('queue', [])
    expect(descs(run('place-queue', empty).steps).at(-1)).toBe('Nothing was waiting, so order 101 is the only order waiting.')
    const full = buildCounter('stack', Array(12).fill('place'))
    expect(descs(run('place-stack', full).steps)).toEqual(['12 orders are already waiting, so serve one before taking another.'])
    const day = buildCounter('queue', Array.from({ length: 64 }, (_, i) => (i % 2 === 0 ? 'place' : 'serve')))
    expect(descs(run('place-queue', day).steps)).toEqual(['The counter has taken 32 orders today, the most this log keeps.'])
  })
})

describe('serve next', () => {
  it('queue: serves the oldest order and appends it', () => {
    const { steps, finalSnapshot } = run('serve-queue', seed('queue'))
    expect(lines(steps)).toEqual([3, 3, 5])
    expect(descs(steps)).toEqual([
      'Order 104 is at the front of the queue.',
      'Order 104 is first in the queue, so the kitchen serves it.',
      'Writing order 104 at position 3 of the served log.',
    ])
    expect(waitingOrders(steps[0].snapshot)).toEqual([104, 105, 106])
    expect(finalSnapshot.log).toEqual([101, 102, 103, 104])
    expect(finalSnapshot.skipped).toBe(0)
  })

  it('stack: serves the newest order and counts the skip', () => {
    const { steps, finalSnapshot } = run('serve-stack', seed('stack'))
    expect(descs(steps)[0]).toBe('Order 106 is on top of the stack.')
    expect(steps[0].snapshot.skipped).toBe(3)
    expect(descs(steps)[1]).toBe('Order 106 is on top of the stack, so the kitchen serves it before 2 older orders.')
    expect(finalSnapshot.skipped).toBe(4)
    expect(finalSnapshot.log).toEqual([103, 102, 104, 106])
  })

  it('doubles a full log before writing', () => {
    const once = run('serve-queue', seed('queue')).finalSnapshot
    const { steps, finalSnapshot } = run('serve-queue', once)
    expect(lines(steps)).toEqual([3, 3, 4, 5])
    expect(descs(steps)[2]).toBe('The served log is full at 4 slots, so it doubles to 8.')
    expect(steps[2].snapshot.highlight).toEqual({ indices: [0, 1, 2, 3, 4, 5, 6, 7], kind: 'copy' })
    expect(finalSnapshot.log).toHaveLength(8)
    expect(descs(run('serve-queue', buildCounter('queue', [])).steps)).toEqual(['No orders are waiting, so there is nothing to serve.'])
  })
})

describe('find order', () => {
  it('binary search halves the sorted log', () => {
    const hit = run('find-binary', seed('queue'), 101)
    expect(lines(hit.steps)).toEqual([4, 5, 4, 7])
    expect(descs(hit.steps)).toEqual([
      'lo = 0, hi = 2, so mid = 1: order 102.',
      '101 < 102, so search the left half.',
      'lo = 0, hi = 0, so mid = 0: order 101.',
      'Found order 101 at position 0 after 2 compares.',
    ])
    expect(hit.steps[0].snapshot.range).toEqual({ lo: 0, hi: 2 })
    const miss = run('find-binary', seed('queue'), 117)
    expect(descs(miss.steps).at(-1)).toBe('lo is past hi after 2 compares: order 117 is not in the served log.')
    expect(miss.steps.at(-1)!.highlightLine).toBe(8)
  })

  it('sequential search reads the unsorted log from the start', () => {
    const hit = run('find-sequential', seed('stack'), 104)
    expect(lines(hit.steps)).toEqual([3, 3, 3, 3])
    expect(descs(hit.steps).at(-1)).toBe('Found order 104 at position 2 after 3 compares.')
    const miss = run('find-sequential', seed('stack'), 117)
    expect(descs(miss.steps).at(-1)).toBe('Reached the end of the log after 3 compares: order 117 is not in it.')
    expect(descs(run('find-sequential', buildCounter('stack', []), 101).steps)).toEqual([
      'Reached the end of the log after 0 compares: order 101 is not in it.',
    ])
  })
})
