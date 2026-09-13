// Executable form of the SPEC.md §10.7 step tables.
import { describe, expect, it } from 'vitest'
import {
  buildArrayQueue,
  buildLinkedQueue,
  runArrayDequeue,
  runArrayEnqueue,
  runLinkedDequeue,
  runLinkedEnqueue,
} from './operations'
import type { ArrayQueueSnapshot, LinkedQueueSnapshot } from './types'

const lines = (steps: { highlightLine: number }[]) => steps.map((s) => s.highlightLine)
const seed = () => buildArrayQueue([10, 20, 30, 40, 50], 8, 6)

describe('resizing array', () => {
  it('seed wraps around the end of the array', () => {
    const q = seed()
    expect(q.slots).toEqual([30, 40, 50, null, null, null, 10, 20])
    expect([q.first, q.last, q.n]).toEqual([6, 3, 5])
  })

  it('dequeue reads at first, advances, and keeps the size', () => {
    const { steps, finalSnapshot } = runArrayDequeue(seed())
    expect(lines(steps)).toEqual([7, 8, 10])
    expect(steps[0].description).toBe('Removing 10 from index 6: the queue holds 4 items.')
    expect(steps[0].snapshot.highlight).toEqual({ indices: [6], kind: 'read' })
    expect(steps[2].description).toBe('4 of 8 slots are in use, so the array keeps its size.')
    const q = finalSnapshot as ArrayQueueSnapshot
    expect([q.first, q.n, q.slots[6]]).toEqual([7, 4, null])
    expect(q.highlight).toBeUndefined()
  })

  it('the second dequeue wraps first to 0', () => {
    const once = runArrayDequeue(seed()).finalSnapshot as ArrayQueueSnapshot
    const { steps, finalSnapshot } = runArrayDequeue(once)
    expect(lines(steps)).toEqual([7, 8, 9, 10])
    expect(steps[2].description).toBe('first reached the end of the array, so it wraps to 0.')
    expect((finalSnapshot as ArrayQueueSnapshot).first).toBe(0)
  })

  it('enqueue with room writes at last', () => {
    const { steps, finalSnapshot } = runArrayEnqueue(seed(), 60)
    expect(lines(steps)).toEqual([2, 3])
    expect(steps[0].description).toBe('The array has room (5 of 8), so no resize is needed.')
    expect(steps[1].description).toBe('Placing 60 at index 3: the queue holds 6 items.')
    const q = finalSnapshot as ArrayQueueSnapshot
    expect([q.last, q.n, q.slots[3]]).toEqual([4, 6, 60])
  })

  it('the fourth enqueue doubles the array and realigns the items', () => {
    let q = seed()
    for (const v of [60, 70, 80]) q = runArrayEnqueue(q, v).finalSnapshot as ArrayQueueSnapshot
    expect(q.n).toBe(8)
    const { steps, finalSnapshot } = runArrayEnqueue(q, 90)
    expect(lines(steps)).toEqual([2, 14, 3])
    expect(steps[0].description).toBe('The array is full (8 of 8), so double it to 16.')
    expect(steps[0].snapshot.highlight).toEqual({ indices: [6, 7, 0, 1, 2, 3, 4, 5], kind: 'full' })
    expect(steps[1].description).toBe('Copying the 8 items into the new array in queue order, so first is 0 and last is 8.')
    const out = finalSnapshot as ArrayQueueSnapshot
    expect([out.first, out.last, out.slots.length, out.n]).toEqual([0, 9, 16, 9])
    expect(out.slots.slice(0, 9)).toEqual([10, 20, 30, 40, 50, 60, 70, 80, 90])
  })

  it('last wraps to 0 after writing the final slot', () => {
    const q = buildArrayQueue([1, 2, 3, 4, 5, 6, 7], 8, 0)
    const { steps, finalSnapshot } = runArrayEnqueue(q, 8)
    expect(lines(steps)).toEqual([2, 3, 4])
    expect((finalSnapshot as ArrayQueueSnapshot).last).toBe(0)
  })

  it('dequeue halves the array at one-quarter full', () => {
    const q = buildArrayQueue([1, 2, 3], 8, 5)
    const { steps, finalSnapshot } = runArrayDequeue(q)
    expect(lines(steps)).toEqual([7, 8, 10, 14])
    expect(steps[2].description).toBe('The array is one-quarter full (2 of 8), so halve it to 4.')
    const out = finalSnapshot as ArrayQueueSnapshot
    expect(out.slots).toEqual([2, 3, null, null])
    expect([out.first, out.last]).toEqual([0, 2])
  })

  it('dequeue on an empty queue is one step', () => {
    const { steps } = runArrayDequeue(buildArrayQueue([], 4))
    expect(lines(steps)).toEqual([7])
    expect(steps[0].description).toBe('The queue is empty, so there is nothing to dequeue.')
  })

  it('refuses to grow past the capacity cap', () => {
    const q = buildArrayQueue(Array.from({ length: 32 }, (_, i) => i + 1), 32)
    const { steps, finalSnapshot } = runArrayEnqueue(q, 99)
    expect(lines(steps)).toEqual([2])
    expect((finalSnapshot as ArrayQueueSnapshot).n).toBe(32)
  })
})

describe('linked list', () => {
  it('enqueue on the seed creates a detached node then links it', () => {
    const { steps, finalSnapshot } = runLinkedEnqueue(buildLinkedQueue([10, 20, 30]), 40)
    expect(lines(steps)).toEqual([3, 5])
    expect(steps[0].description).toBe('Creating a node for 40: last now points at it.')
    expect(steps[0].snapshot.highlight).toEqual({ ids: ['n3'], kind: 'new' })
    const s0 = steps[0].snapshot as LinkedQueueSnapshot
    expect(s0.nodes.n2.next).toBeNull()
    expect(steps[1].description).toBe('Linking the old last node 30 to 40: the queue holds 4 items.')
    const q = finalSnapshot as LinkedQueueSnapshot
    expect(q.nodes.n2.next).toBe('n3')
    expect(q.lastId).toBe('n3')
    expect(q.highlight).toBeUndefined()
  })

  it('enqueue on an empty queue sets first too', () => {
    const { steps } = runLinkedEnqueue(buildLinkedQueue([]), 7)
    expect(lines(steps)).toEqual([3, 4])
    expect(steps[1].description).toBe('The queue was empty, so first also points at 7.')
  })

  it('dequeue to empty clears last', () => {
    const one = runLinkedDequeue(buildLinkedQueue([10, 20]))
    expect(lines(one.steps)).toEqual([8, 9])
    expect(one.steps[1].description).toBe('first moves to 20: the queue holds 1 item.')
    const two = runLinkedDequeue(one.finalSnapshot as LinkedQueueSnapshot)
    expect(lines(two.steps)).toEqual([8, 9, 11])
    expect((two.finalSnapshot as LinkedQueueSnapshot).lastId).toBeNull()
    const empty = runLinkedDequeue(two.finalSnapshot as LinkedQueueSnapshot)
    expect(lines(empty.steps)).toEqual([8])
  })
})
