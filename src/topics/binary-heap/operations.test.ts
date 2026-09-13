// Executable form of the SPEC.md §10.2 step tables.
import { describe, expect, it } from 'vitest'
import { buildHeap, runBuildHeap, runHeapsort, runInsert, runRemoveExtreme } from './operations'
import type { HeapSnapshot } from './types'

const lines = (steps: { highlightLine: number }[]) => steps.map((s) => s.highlightLine)
const heapOf = (snap: HeapSnapshot) => snap.array.slice(1, snap.n + 1)
const isMaxHeap = (a: number[], n: number) => {
  for (let k = 2; k <= n; k++) if (a[Math.floor(k / 2)] < a[k]) return false
  return true
}

const seed = () => buildHeap([90, 70, 80, 30, 50, 60, 20], 'max')

describe('buildHeap (silent)', () => {
  it('produces a valid max-heap and keeps array[0] unused', () => {
    const h = buildHeap([5, 3, 8, 1, 9], 'max')
    expect(h.array[0]).toBe(0)
    expect(h.n).toBe(5)
    expect(isMaxHeap(h.array, h.n)).toBe(true)
    expect(h.array[1]).toBe(9)
  })
})

describe('insert', () => {
  it('appends at line 3 and swims with compare (6) / swap (7) steps', () => {
    const { steps, finalSnapshot } = runInsert(seed(), 85)
    // 85 goes to index 8 (parent 30 at 4), swaps, parent 70 at 2, swaps, parent 90 at 1, stops.
    expect(lines(steps)).toEqual([3, 6, 7, 6, 7, 6, 6])
    expect(steps[0].description).toBe('Placing 85 at the end of the heap (index 8).')
    expect(steps[1].description).toBe('Comparing 85 with its parent 30.')
    expect(steps[2].description).toBe('85 is larger than its parent, so it swims up.')
    expect(steps[2].snapshot.highlight).toEqual({ indices: [8, 4], kind: 'swapping' })
    expect(steps.at(-1)!.description).toBe('Heap order restored.')
    expect(heapOf(finalSnapshot)).toEqual([90, 85, 80, 70, 50, 60, 20, 30])
    expect(finalSnapshot.highlight).toBeUndefined()
  })

  it('uses min-heap wording in min mode', () => {
    const { steps } = runInsert(buildHeap([10, 30, 20], 'min'), 5)
    expect(steps.map((s) => s.description)).toContain('5 is smaller than its parent, so it swims up.')
  })
})

describe('remove max', () => {
  it('moves the last element to the root (line 2) and sinks it (10, 12, 11)', () => {
    const { steps, finalSnapshot } = runRemoveExtreme(seed())
    expect(steps[0].highlightLine).toBe(2)
    expect(steps[0].description).toBe('Removing 90 from the root. Moving the last element 20 to the top.')
    expect(steps[0].snapshot.n).toBe(6)
    expect(steps[0].snapshot.array[7]).toBe(90) // still in the array, outside the heap
    expect(lines(steps)).toEqual([2, 10, 12, 10, 12, 11])
    expect(steps[3].description).toBe('Only one child, at 6.')
    expect(steps[1].description).toBe('Comparing the children at 2 and 3.')
    expect(steps[2].description).toBe('20 is smaller than its child 80, so it sinks down.')
    expect(heapOf(finalSnapshot)).toEqual([80, 70, 60, 30, 50, 20])
    expect(finalSnapshot.array.length).toBe(7) // truncated to n + 1
  })

  it('narrates an empty heap', () => {
    const { steps } = runRemoveExtreme({ array: [0], n: 0, mode: 'max' })
    expect(steps.map((s) => s.description)).toEqual(['The heap is empty, so there is nothing to remove.'])
  })
})

describe('build heap', () => {
  it('sweeps k from n/2 down to 1 with SINK steps on lines 8/10/9', () => {
    const { steps, finalSnapshot } = runBuildHeap({ array: [0], n: 0, mode: 'max' }, [5, 3, 8, 1, 9])
    expect(steps[0].description).toBe('Building a heap from 5, 3, 8, 1, 9.')
    const starts = steps.filter((s) => s.highlightLine === 4).map((s) => s.description)
    expect(starts).toEqual(['Sinking index 2.', 'Sinking index 1.'])
    expect(new Set(lines(steps))).toEqual(new Set([2, 4, 8, 9, 10]))
    expect(heapOf(finalSnapshot)).toEqual([9, 5, 8, 1, 3])
  })
})

describe('heapsort', () => {
  it('ends with the array sorted ascending and every index outside the heap', () => {
    const { steps, finalSnapshot } = runHeapsort(seed())
    expect(finalSnapshot.array.slice(1)).toEqual([20, 30, 50, 60, 70, 80, 90])
    expect(finalSnapshot.n).toBe(0)
    expect(steps.at(-1)!.description).toBe('Every element is in place. The array is sorted.')
    const sorted = steps.filter((s) => s.snapshot.highlight?.kind === 'sorted')
    expect(sorted.map((s) => s.description)).toEqual([
      '90 is in its final position.',
      '80 is in its final position.',
      '70 is in its final position.',
      '60 is in its final position.',
      '50 is in its final position.',
      '30 is in its final position.',
    ])
    expect(steps.filter((s) => s.highlightLine === 4).length).toBe(6)
    expect(Math.max(...lines(steps))).toBeLessThanOrEqual(13)
  })
})
