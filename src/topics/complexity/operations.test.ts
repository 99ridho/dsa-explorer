// Executable form of the SPEC.md §10.5 step tables.
import { describe, expect, it } from 'vitest'
import { accesses, buildRows, checks, runCountAccesses, runDoublingRatio } from './operations'

const lines = (steps: { highlightLine: number }[]) => steps.map((s) => s.highlightLine)

describe('counting', () => {
  it('uses the exact brute-force formulas', () => {
    expect(checks('3-sum', 8)).toBe(56)
    expect(accesses('1-sum', 16)).toBe(16)
    expect(accesses('2-sum', 16)).toBe(240)
    expect(accesses('3-sum', 8)).toBe(168)
  })

  it('seeds six rows with ratios filled in', () => {
    const s = buildRows('3-sum', 8)
    expect(s.rows.map((r) => r.n)).toEqual([8, 16, 32, 64, 128, 256])
    expect(s.rows.map((r) => r.accesses).slice(0, 3)).toEqual([168, 1680, 14880])
    expect(s.rows[0].ratio).toBeNull()
    expect(s.rows[1].ratio).toBe(10)
  })
})

describe('doubling ratio', () => {
  it('narrates a count and a ratio per round, then the order of growth', () => {
    const { steps, finalSnapshot } = runDoublingRatio(buildRows('3-sum', 8))
    expect(lines(steps)).toEqual([10, 10, 5, 10, 5, 10, 5, 10, 5, 10, 5, 3])
    expect(steps[0].description).toBe('N = 8: brute-force 3-sum checks 56 triples, so it makes 168 array accesses.')
    expect(steps[0].variables).toEqual({ N: 8, accesses: 168 })
    expect(steps[2].description).toBe('1,680 / 168 = 10.00, so doubling N multiplied the accesses by about 10.0.')
    expect(steps.at(-1)!.description).toBe('The ratio settles toward 8, so the order of growth of 3-sum is N³.')
    const last = finalSnapshot.rows.at(-1)!
    expect(last.n).toBe(256)
    expect(last.ratio!).toBeGreaterThan(8)
    expect(last.ratio!).toBeLessThan(8.5)
    expect(finalSnapshot.highlight).toBeUndefined()
  })

  it('uses the problem line and limit for 1-sum and 2-sum', () => {
    expect(lines(runDoublingRatio(buildRows('1-sum', 4)).steps)[0]).toBe(8)
    expect(runDoublingRatio(buildRows('2-sum', 4)).steps.at(-1)!.description).toBe('The ratio settles toward 4, so the order of growth of 2-sum is N².')
  })
})

describe('count accesses', () => {
  it('adds a row in order and fills its ratio when the half row exists', () => {
    const { steps, finalSnapshot } = runCountAccesses(buildRows('2-sum', 8), 16)
    expect(lines(steps)).toEqual([9, 5])
    expect(steps[0].description).toBe('N = 16: brute-force 2-sum checks 120 pairs, so it makes 240 array accesses.')
    expect(finalSnapshot.rows.map((r) => r.n)).toEqual([8, 16, 32, 64, 128, 256])
    const twelve = runCountAccesses(buildRows('2-sum', 8), 12)
    expect(lines(twelve.steps)).toEqual([9])
    expect(twelve.finalSnapshot.rows.map((r) => r.n)).toEqual([8, 12, 16, 32, 64, 128, 256])
  })

  it('refuses N below 1 and above the cap', () => {
    const zero = runCountAccesses(buildRows('3-sum', 8), 0)
    expect(lines(zero.steps)).toEqual([7])
    expect(zero.steps[0].description).toBe('N = 0 is below 1, so there is nothing to count.')
    const huge = runCountAccesses(buildRows('3-sum', 8), 5000)
    expect(huge.steps[0].description).toBe('N is capped at 4,096 in this demo, so nothing changes.')
    expect(huge.finalSnapshot.rows).toHaveLength(6)
  })
})
