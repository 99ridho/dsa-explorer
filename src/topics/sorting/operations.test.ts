// Executable form of the SPEC.md §10.9 step tables.
import { describe, expect, it } from 'vitest'
import { buildArray, runInsertionSort, runLoad, runSelectionSort, runShellsort } from './operations'

const lines = (steps: { highlightLine: number }[]) => steps.map((s) => s.highlightLine)
const sorted = (a: number[]) => [...a].sort((x, y) => x - y)
const SEED = [7, 10, 5, 3, 8, 4, 2, 9, 6]

describe('load', () => {
  it('replaces the array in one step', () => {
    const { steps, finalSnapshot } = runLoad(buildArray(SEED), [5, 3, 8])
    expect(lines(steps)).toEqual([2])
    expect(steps[0].description).toBe('Loading 5, 3, 8: 3 items to sort.')
    expect(finalSnapshot.array).toEqual([5, 3, 8])
  })

  it('refuses fewer than 2 or more than 10 items', () => {
    const eleven = runLoad(buildArray(SEED), Array.from({ length: 11 }, (_, i) => i))
    expect(eleven.steps[0].description).toBe('This demo sorts 2 to 10 items, and 11 were entered, so nothing changes.')
    expect(eleven.finalSnapshot.array).toEqual(SEED)
    expect(runLoad(buildArray(SEED), [1]).finalSnapshot.array).toEqual(SEED)
  })
})

describe('selection sort', () => {
  it('emits one step per compare and per exchange', () => {
    const { steps, finalSnapshot } = runSelectionSort(buildArray([3, 1, 2]))
    expect(lines(steps)).toEqual([3, 5, 5, 6, 3, 5, 6, 3, 6, 2])
    expect(steps[0].description).toBe('Pass 0: the smallest item so far is a[0] = 3.')
    expect(steps[1].description).toBe('Comparing a[1] = 1 with the minimum a[0] = 3: 1 is smaller, so min becomes 1.')
    expect(steps[2].description).toBe('Comparing a[2] = 2 with the minimum a[1] = 1: 1 is smaller, so min stays 1.')
    expect(steps[3].description).toBe('Exchanging a[0] = 3 with a[1] = 1, so 1 is in its final position.')
    expect(steps[3].snapshot.highlight).toEqual({ indices: [0, 1], kind: 'exchanging' })
    expect(steps[8].description).toBe('a[2] = 3 is already the minimum, so exchanging it with itself changes nothing.')
    expect(steps.at(-1)!.description).toBe('Every item is in place: 3 compares and 3 exchanges.')
    expect(steps.at(-1)!.variables).toEqual({ compares: 3, exchanges: 3 })
    expect(finalSnapshot).toEqual({ array: [1, 2, 3] })
  })

  it('sorts the seed with exactly N exchanges', () => {
    const { steps, finalSnapshot } = runSelectionSort(buildArray(SEED))
    expect(finalSnapshot.array).toEqual(sorted(SEED))
    expect(steps.at(-1)!.variables?.exchanges).toBe(SEED.length)
  })
})

describe('insertion sort', () => {
  it('merges compare and exchange into one step', () => {
    const { steps, finalSnapshot } = runInsertionSort(buildArray([3, 1, 2]))
    expect(lines(steps)).toEqual([2, 4, 3, 2, 4, 5, 2])
    expect(steps[0].description).toBe('Taking a[1] = 1 and inserting it among the 1 sorted items to its left.')
    expect(steps[1].description).toBe('a[1] = 1 is smaller than a[0] = 3, so exchange them.')
    expect(steps[1].snapshot.array).toEqual([1, 3, 2])
    expect(steps[2].description).toBe('1 reached index 0, so a[0..1] is sorted.')
    expect(steps[5].description).toBe('a[1] = 2 is not smaller than a[0] = 1, so it stays: a[0..2] is sorted.')
    expect(steps.at(-1)!.variables).toEqual({ compares: 3, exchanges: 2 })
    expect(finalSnapshot.array).toEqual([1, 2, 3])
  })

  it('does no exchanges on sorted input', () => {
    const { steps } = runInsertionSort(buildArray([1, 2, 3, 4]))
    expect(steps.at(-1)!.variables?.exchanges).toBe(0)
  })
})

describe('shellsort', () => {
  it('starts at h = 4 for nine items, visits line 9 twice, and ends sorted', () => {
    const { steps, finalSnapshot } = runShellsort(buildArray(SEED))
    expect(steps[0].highlightLine).toBe(3)
    expect(steps[0].description).toBe('N = 9, so the increment sequence starts at h = 4.')
    expect(steps[0].variables?.h).toBe(4)
    expect(steps[1].description).toBe('h-sorting the array with h = 4: every h-th item forms one subsequence.')
    expect(steps[2].snapshot.highlight).toEqual({ indices: [4, 0], kind: 'marked' })
    expect(lines(steps).filter((l) => l === 9)).toHaveLength(2)
    expect(steps.at(-1)!.highlightLine).toBe(4)
    expect(steps.at(-1)!.description).toMatch(/^h is 0, so the array is sorted: \d+ compares and \d+ exchanges\.$/)
    expect(finalSnapshot.array).toEqual(sorted(SEED))
    expect(finalSnapshot.highlight).toBeUndefined()
  })
})
