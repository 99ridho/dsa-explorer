// Executable form of the SPEC.md §10.6 step tables.
import { describe, expect, it } from 'vitest'
import { buildArray, runAccess, runCreate, runMemory, runResize, runSet } from './operations'

const lines = (steps: { highlightLine: number }[]) => steps.map((s) => s.highlightLine)
const SEED = [5, 3, 8, 1, 9, 2]

describe('create', () => {
  it('creates zeros then fills them', () => {
    const { steps, finalSnapshot } = runCreate(buildArray(SEED), [4, 4, 2])
    expect(lines(steps)).toEqual([2, 3])
    expect(steps[0].description).toBe('Creating an int array of length 3: every slot starts at 0.')
    expect(steps[0].snapshot.values).toEqual([0, 0, 0])
    expect(steps[1].description).toBe('Filling the slots from the list: 4, 4, 2.')
    expect(finalSnapshot.values).toEqual([4, 4, 2])
    expect(steps[1].variables).toEqual({ length: 3, bytes: 36 })
  })

  it('refuses more than 16 values', () => {
    const { steps, finalSnapshot } = runCreate(buildArray(SEED), Array.from({ length: 17 }, () => 1))
    expect(steps[0].description).toBe('This demo shows at most 16 slots, and 17 were entered, so nothing changes.')
    expect(finalSnapshot.values).toEqual(SEED)
  })
})

describe('access and set', () => {
  it('access checks the bounds then reads', () => {
    const ok = runAccess(buildArray(SEED), 2)
    expect(lines(ok.steps)).toEqual([2, 3])
    expect(ok.steps[0].description).toBe('Index 2 is inside 0 to 5, so the access is safe.')
    expect(ok.steps[1].description).toBe('a[2] holds 8.')
    const bad = runAccess(buildArray(SEED), 9)
    expect(lines(bad.steps)).toEqual([2])
    expect(bad.steps[0].description).toBe('Index 9 is outside 0 to 5, so the program stops with an out-of-bounds error.')
    expect(bad.steps[0].snapshot.highlight).toEqual({ indices: [0, 1, 2, 3, 4, 5], kind: 'error' })
  })

  it('set writes a value, and needs exactly two numbers', () => {
    const { steps, finalSnapshot } = runSet(buildArray(SEED), [2, 7])
    expect(lines(steps)).toEqual([2, 3])
    expect(steps[1].description).toBe('Writing 7 into a[2], replacing 8.')
    expect(finalSnapshot.values).toEqual([5, 3, 7, 1, 9, 2])
    const one = runSet(buildArray(SEED), [2])
    expect(lines(one.steps)).toEqual([1])
    expect(one.steps[0].description).toBe('Set needs two numbers, an index and a value, and 1 was entered, so nothing changes.')
    expect(one.finalSnapshot.values).toEqual(SEED)
  })
})

describe('resize', () => {
  it('creates the copy, copies one element per step, then swaps it in', () => {
    const { steps, finalSnapshot } = runResize(buildArray(SEED))
    expect(lines(steps)).toEqual([2, 3, 3, 3, 3, 3, 3, 4])
    expect(steps[0].snapshot.resizing).toEqual({ values: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], copied: 0 })
    expect(steps[1].description).toBe('Copying a[0] = 5 into the new array.')
    expect(steps[3].snapshot.resizing?.copied).toBe(3)
    expect(steps.at(-1)!.description).toBe('The new array replaces the old one, so a has 12 slots and the old array can be reclaimed.')
    expect(finalSnapshot.values).toEqual([5, 3, 8, 1, 9, 2, 0, 0, 0, 0, 0, 0])
    expect(finalSnapshot.resizing).toBeUndefined()
    expect(steps.at(-1)!.variables).toEqual({ length: 12, bytes: 72 })
  })

  it('refuses to grow past 16 slots', () => {
    const { steps, finalSnapshot } = runResize(buildArray(Array.from({ length: 12 }, () => 0)))
    expect(lines(steps)).toEqual([2])
    expect(steps[0].description).toBe('Doubling would need 24 slots and this demo shows at most 16, so nothing changes.')
    expect(finalSnapshot.values).toHaveLength(12)
  })
})

describe('memory', () => {
  it('reports 24 + 4N bytes', () => {
    const { steps } = runMemory(buildArray(SEED))
    expect(lines(steps)).toEqual([2, 3])
    expect(steps[1].description).toBe('The 6 ints take 4 bytes each, so int[6] costs 24 + 4 * 6 = 48 bytes.')
    expect(steps.every((s) => s.variables?.bytes === 48)).toBe(true)
  })
})
