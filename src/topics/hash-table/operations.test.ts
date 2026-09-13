// Executable form of the SPEC.md §10.3 step tables. M = 11 throughout.
import { describe, expect, it } from 'vitest'
import {
  buildChaining,
  buildProbing,
  runChainDelete,
  runChainInsert,
  runChainSearch,
  runProbeDelete,
  runProbeInsert,
  runProbeSearch,
} from './operations'
import type { ChainingSnapshot, ProbingSnapshot } from './types'

const lines = (steps: { highlightLine: number }[]) => steps.map((s) => s.highlightLine)
const descs = (steps: { description: string }[]) => steps.map((s) => s.description)
const SEED = [12, 23, 34, 45, 5, 16]

describe('chaining', () => {
  it('hashes at line 2 and appends after scanning the chain', () => {
    const { steps, finalSnapshot } = runChainInsert(buildChaining(SEED), 56)
    expect(lines(steps)).toEqual([2, 3, 3, 3, 3, 3])
    expect(descs(steps)[0]).toBe('56 mod 11 = 1, so use bucket 1.')
    expect(descs(steps)[1]).toBe('Comparing 56 with 12 in bucket 1.')
    expect(descs(steps).at(-1)).toBe('Appending 56 to bucket 1.')
    expect((finalSnapshot as ChainingSnapshot).buckets[1]).toEqual([12, 23, 34, 45, 56])
    expect(steps.at(-1)!.snapshot.highlight).toEqual({ bucket: 1, index: 4 })
  })

  it('reports a duplicate without changing the bucket', () => {
    const { steps, finalSnapshot } = runChainInsert(buildChaining(SEED), 34)
    expect(descs(steps).at(-1)).toBe('34 is already in bucket 1, so nothing changes.')
    expect((finalSnapshot as ChainingSnapshot).buckets[1]).toEqual([12, 23, 34, 45])
  })

  it('search hits at line 6 and misses at the end of the chain', () => {
    const hit = runChainSearch(buildChaining(SEED), 45)
    expect(lines(hit.steps)).toEqual([5, 6, 6, 6, 6, 6])
    expect(descs(hit.steps).at(-1)).toBe('Found 45 in bucket 1.')
    const miss = runChainSearch(buildChaining(SEED), 67)
    expect(descs(miss.steps).at(-1)).toBe('Reached the end of bucket 1. 67 is not in the table.')
  })

  it('deletes a middle element and keeps the order of the rest', () => {
    const { steps, finalSnapshot } = runChainDelete(buildChaining(SEED), 23)
    expect(lines(steps)).toEqual([8, 9, 9, 9])
    expect(descs(steps).at(-1)).toBe('Removing 23 from bucket 1.')
    expect((finalSnapshot as ChainingSnapshot).buckets[1]).toEqual([12, 34, 45])
  })
})

describe('linear probing', () => {
  const slots = (s: { slots: (number | null)[] }) => s.slots

  it('probes past occupied slots and places the key at the first empty one', () => {
    // 12, 23, 34, 45 all hash to 1 and occupy 1, 2, 3, 4; 5 sits at 5; 16 sits at 6.
    const { steps, finalSnapshot } = runProbeInsert(buildProbing(SEED), 56)
    expect(lines(steps)).toEqual([2, 3, 3, 3, 3, 3, 3, 5])
    expect(descs(steps)[1]).toBe('Slot 1 is occupied by 12. Probe the next slot.')
    expect(descs(steps).at(-1)).toBe('Slot 7 is empty. Placing 56 here.')
    expect(slots(finalSnapshot as ProbingSnapshot)[7]).toBe(56)
  })

  it('wraps around past the last slot', () => {
    const t = buildProbing([10, 21]) // 10 at slot 10, 21 wraps to slot 0
    const { steps, finalSnapshot } = runProbeInsert(t, 32)
    expect(descs(steps)).toEqual([
      '32 mod 11 = 10, so start at slot 10.',
      'Slot 10 is occupied by 10. Probe the next slot.',
      'Slot 0 is occupied by 21. Probe the next slot.',
      'Slot 1 is empty. Placing 32 here.',
    ])
    expect(slots(finalSnapshot as ProbingSnapshot)[1]).toBe(32)
  })

  it('search hits at line 9 and misses at line 11', () => {
    const hit = runProbeSearch(buildProbing(SEED), 45)
    expect(lines(hit.steps)).toEqual([7, 8, 8, 8, 9])
    expect(descs(hit.steps).at(-1)).toBe('Slot 4 holds 45: HIT.')
    const miss = runProbeSearch(buildProbing(SEED), 67)
    expect(descs(miss.steps).at(-1)).toBe('Slot 7 is empty: MISS. 67 is not in the table.')
    expect(miss.steps.at(-1)!.snapshot.highlight).toEqual({ index: 7, kind: 'empty' })
  })

  it('delete rehashes the rest of the cluster so a later search still hits', () => {
    const t = buildProbing(SEED)
    const del = runProbeDelete(t, 23)
    expect(descs(del.steps)).toContain('Removing 23 from slot 2.')
    expect(descs(del.steps)).toContain('Reinserting 34 from slot 3 so later searches still find it.')
    const after = del.finalSnapshot as ProbingSnapshot
    expect(after.slots.filter((v) => v !== null).sort((a, b) => a! - b!)).toEqual([5, 12, 16, 34, 45])
    expect(descs(runProbeSearch(after, 45).steps).at(-1)).toMatch(/holds 45: HIT/)
    expect(descs(runProbeSearch(after, 16).steps).at(-1)).toMatch(/holds 16: HIT/)
  })

  it('refuses to insert into a full table', () => {
    const full = buildProbing([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
    const { steps, finalSnapshot } = runProbeInsert(full, 99)
    expect(descs(steps)).toEqual(['Every slot is occupied, so 99 cannot be inserted.'])
    expect((finalSnapshot as ProbingSnapshot).slots.includes(99)).toBe(false)
  })
})
