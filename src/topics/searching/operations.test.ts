// Executable form of the SPEC.md §10.11 step tables.
import { describe, expect, it } from 'vitest'
import { walk } from '@/lib/linked-nodes'
import { buildBinary, buildSequential, runBinGet, runBinPut, runSeqGet, runSeqPut } from './operations'
import type { BinarySnapshot, SequentialSnapshot } from './types'

const lines = (steps: { highlightLine: number }[]) => steps.map((s) => s.highlightLine)
const SEQ: [number, number][] = [
  [21, 1],
  [30, 1],
  [5, 2],
  [12, 1],
]
const BIN: [number, number][] = [...SEQ, [44, 1]]
const listKeys = (s: SequentialSnapshot) => walk(s.nodes, s.firstId).map((id) => s.nodes[id].key)

describe('sequential search', () => {
  it('get scans until the hit', () => {
    const { steps } = runSeqGet(buildSequential(SEQ), 5)
    expect(lines(steps)).toEqual([3, 3, 3])
    expect(steps[0].description).toBe('Comparing 5 with 21.')
    expect(steps[2].description).toBe('5 matches this node: HIT, its value is 2.')
    expect(steps[2].snapshot.highlight).toEqual({ ids: ['n2'], kind: 'found' })
    expect(steps[2].variables).toEqual({ compares: 3 })
  })

  it('get misses at the end of the list', () => {
    const { steps } = runSeqGet(buildSequential(SEQ), 99)
    expect(lines(steps)).toEqual([3, 3, 3, 3, 4])
    expect(steps.at(-1)!.description).toBe('Reached the end of the list: MISS. 99 is not in the table.')
  })

  it('put raises the value of a present key and adds an absent key at the front', () => {
    const update = runSeqPut(buildSequential(SEQ), 5)
    expect(lines(update.steps)).toEqual([7, 7, 7])
    expect(update.steps.at(-1)!.description).toBe('5 is already in the table, so its value becomes 3.')
    expect(Object.keys((update.finalSnapshot as SequentialSnapshot).nodes)).toHaveLength(4)
    const insert = runSeqPut(buildSequential(SEQ), 99)
    expect(lines(insert.steps)).toEqual([7, 7, 7, 7, 8])
    expect(insert.steps.at(-1)!.description).toBe('Reached the end of the list, so insert 99 at the front with value 1.')
    expect(listKeys(insert.finalSnapshot as SequentialSnapshot)).toEqual([99, 21, 30, 5, 12])
  })
})

describe('binary search', () => {
  it('seed is sorted by key', () => {
    expect(buildBinary(BIN).keys).toEqual([5, 12, 21, 30, 44])
  })

  it('get hits at the middle on the first probe', () => {
    const { steps } = runBinGet(buildBinary(BIN), 21)
    expect(lines(steps)).toEqual([11, 13, 16, 3])
    expect(steps[0].description).toBe('lo = 0 and hi = 4: 21 can only be in this range.')
    expect(steps[0].snapshot.range).toEqual({ lo: 0, hi: 4 })
    expect(steps[1].description).toBe('mid = 2: comparing 21 with keys[2] = 21.')
    expect(steps[1].variables).toEqual({ lo: 0, mid: 2, hi: 4, compares: 1 })
    expect(steps[3].description).toBe('keys[2] is 21: HIT, its value is 1.')
  })

  it('get narrows the window and misses', () => {
    const { steps } = runBinGet(buildBinary(BIN), 22)
    expect(lines(steps)).toEqual([11, 13, 15, 13, 14, 17, 4])
    expect(steps[2].description).toBe('22 > 21, so lo becomes 3.')
    expect(steps[2].snapshot.range).toEqual({ lo: 3, hi: 4 })
    expect(steps[5].description).toBe('lo passed hi, so rank is 3: 3 keys are smaller than 22.')
    expect(steps[5].snapshot.range).toBeUndefined()
    expect(steps[6].description).toBe('keys[3] is 30, not 22: MISS.')
    expect(lines(runBinGet(buildBinary(BIN), 99).steps).at(-1)).toBe(4)
    expect(runBinGet(buildBinary(BIN), 99).steps.at(-1)!.description).toBe('Rank 5 is past the last key: MISS.')
  })

  it('put shifts larger keys right one step each, then places the key', () => {
    const { steps, finalSnapshot } = runBinPut(buildBinary(BIN), 22)
    expect(lines(steps).slice(-3)).toEqual([8, 8, 9])
    expect(steps.at(-3)!.description).toBe('Moving keys[4] = 44 right to index 5 to make room.')
    expect(steps.at(-2)!.description).toBe('Moving keys[3] = 30 right to index 4 to make room.')
    expect(steps.at(-1)!.description).toBe('Placing 22 at index 3 with value 1: the table holds 6 keys.')
    const b = finalSnapshot as BinarySnapshot
    expect(b.keys).toEqual([5, 12, 21, 22, 30, 44])
    expect(b.vals).toEqual([2, 1, 1, 1, 1, 1])
    expect(b.highlight).toBeUndefined()
  })

  it('put on a present key raises its value; put on an empty table places at 0', () => {
    const update = runBinPut(buildBinary(BIN), 5)
    expect(update.steps.at(-1)!.description).toBe('keys[0] is 5, so its value becomes 3.')
    const empty = runBinPut(buildBinary([]), 7)
    expect(lines(empty.steps)).toEqual([11, 17, 9])
    expect((empty.finalSnapshot as BinarySnapshot).keys).toEqual([7])
  })

  it('refuses a 17th key', () => {
    const full = buildBinary(Array.from({ length: 16 }, (_, i) => [i * 2, 1]))
    const { steps, finalSnapshot } = runBinPut(full, 99)
    expect(lines(steps).at(-1)).toBe(9)
    expect((finalSnapshot as BinarySnapshot).keys).toHaveLength(16)
  })
})
