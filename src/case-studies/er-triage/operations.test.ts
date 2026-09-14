// Executable form of the SPEC.md §19.2 step tables, on the seed waiting list and archive.
import { describe, expect, it } from 'vitest'
import { buildTriage } from './operations'
import { triageSimulator } from './simulator'
import type { TriageSnapshot } from './types'

const descs = (steps: { description: string }[]) => steps.map((s) => s.description)
const lines = (steps: { highlightLine: number }[]) => steps.map((s) => s.highlightLine)
const run = (id: string, state: TriageSnapshot, input?: unknown) => triageSimulator.operations.find((o) => o.id === id)!.run(state, input)
const seed = (variant: 'priority' | 'arrival') => triageSimulator.createInitialState(variant)
const arrivals = (s: TriageSnapshot) => s.waiting.map((p) => p.arrival)

describe('seed', () => {
  it('builds the heap by severity then arrival, and the queue by arrival', () => {
    expect(arrivals(seed('priority'))).toEqual([104, 102, 103, 101, 105])
    expect(arrivals(seed('arrival'))).toEqual([101, 102, 103, 104, 105])
    for (const variant of ['priority', 'arrival'] as const) {
      const s = seed(variant)
      expect(s.archive.n).toBe(s.waiting.length)
    }
  })
})

describe('admit, priority queue', () => {
  it('opens the new record, then swims until an equally urgent earlier arrival stops it', () => {
    const { steps, finalSnapshot } = run('admit-priority', seed('priority'), [5, 50])
    expect(lines(steps)).toEqual([2, 2, 2, 2, 2, 2, 4, 6, 7, 6, 6])
    expect(steps.slice(0, 6).every((s) => s.snapshot.focus === 'archive')).toBe(true)
    expect(descs(steps).slice(4)).toEqual([
      '50 is not in this leaf: MISS.',
      'Record 50 is new, so the desk adds it to the archive.',
      'Patient #106 (severity 5, record 50) takes position 6 at the end of the heap.',
      'Comparing #106 (severity 5) with its parent #103 (severity 1).',
      '#106 is more urgent than #103, so it swims up.',
      'Comparing #106 (severity 5) with its parent #104 (severity 5).',
      'Heap order holds: #104 stays above #106.',
    ])
    expect(arrivals(finalSnapshot)).toEqual([104, 102, 106, 101, 105, 103])
    expect(finalSnapshot.archive.n).toBe(6)
    expect(finalSnapshot.focus).toBe('triage')
  })

  it('rejects a record whose patient is still waiting, and keeps records after treatment', () => {
    const dup = run('admit-priority', seed('priority'), [4, 42])
    expect(descs(dup.steps)).toEqual(['Record 42 belongs to #101, who is still waiting.'])
    expect(dup.steps[0].snapshot.highlight).toEqual({ positions: [4], kind: 'treat' })
    const treated = run('treat-priority', seed('priority')).finalSnapshot
    expect(treated.archive.n).toBe(5)
    const back = run('admit-priority', treated, [2, 63])
    expect(descs(back.steps)).toContain('63 matches this entry: HIT.')
    expect(descs(back.steps)).not.toContain('Record 63 is new, so the desk adds it to the archive.')
    expect(back.finalSnapshot.archive.n).toBe(5)
  })

  it('reaches the root when the new patient is the most urgent', () => {
    const empty = { ...seed('priority'), waiting: [] }
    expect(descs(run('admit-priority', empty, [3, 50]).steps).at(-1)).toBe('#106 reaches the root: the next patient to treat.')
  })

  it('rejects bad input and a full waiting list', () => {
    expect(descs(run('admit-priority', seed('priority'), [6, 50]).steps)).toEqual(['Enter a severity from 1 to 5 and a record number, such as 5, 50.'])
    let s = seed('priority')
    for (let i = 0; i < 10; i++) s = run('admit-priority', s, [1, 70 + i]).finalSnapshot
    expect(descs(run('admit-priority', s, [1, 99]).steps)).toEqual(['15 patients are already waiting, so treat someone first.'])
  })
})

describe('treat next, priority queue', () => {
  it('treats the root and sinks the last patient', () => {
    const { steps, finalSnapshot } = run('treat-priority', seed('priority'))
    expect(lines(steps)).toEqual([3, 3, 7, 9, 7, 8])
    expect(arrivals(steps[0].snapshot)).toEqual([104, 102, 103, 101, 105])
    expect(steps[0].snapshot.highlight).toEqual({ positions: [1], kind: 'treat' })
    expect(descs(steps)).toEqual([
      '#104 (severity 5) is at the root: the most urgent patient waiting.',
      'Treating #104 (severity 5), the most urgent patient. #105 (severity 3) moves to the root.',
      'Comparing the children #102 (severity 4) and #103 (severity 1): #102 is more urgent, since 4 > 1.',
      '#102 (severity 4) is more urgent than #105 (severity 3), so #105 sinks down.',
      '#101 (severity 2) is the only child.',
      '#105 (severity 3) is more urgent than #101 (severity 2), so heap order holds.',
    ])
    expect(arrivals(finalSnapshot)).toEqual([102, 105, 103, 101])
    expect(finalSnapshot.bypassed).toBe(0)
  })

  it('names the arrival tie-break when severities are equal', () => {
    // #101 (5) at the root over #102, #103, #104, all severity 3; #104 moves up when #101 leaves.
    const tied = buildTriage('priority', [[5, 42], [3, 17], [3, 88], [3, 63]])
    const { steps } = run('treat-priority', tied)
    expect(descs(steps).slice(2)).toEqual([
      'Comparing the children #102 (severity 3) and #103 (severity 3): both have severity 3, so #102, who arrived earlier, is more urgent.',
      '#102 and #104 both have severity 3, and #102 arrived earlier, so #104 sinks down.',
      '#104 has no children, so heap order holds.',
    ])
    expect(lines(steps)).toEqual([3, 3, 7, 9, 6])
  })

  it('never bypasses anyone, and says when nobody waits', () => {
    let s = seed('priority')
    const order: number[] = []
    for (let i = 0; i < 5; i++) {
      order.push(s.waiting[0].arrival)
      s = run('treat-priority', s).finalSnapshot
    }
    expect(order).toEqual([104, 102, 105, 101, 103])
    expect(s.bypassed).toBe(0)
    expect(descs(run('treat-priority', s).steps)).toEqual(['Nobody is waiting, so there is nobody to treat.'])
  })
})

describe('arrival queue', () => {
  it('joins at the back', () => {
    const { steps } = run('admit-arrival', seed('arrival'), [5, 50])
    expect(descs(steps).at(-1)).toBe('Patient #106 (severity 5, record 50) joins the back of the queue at position 5.')
    expect(steps.at(-1)!.highlightLine).toBe(4)
  })

  it('counts every treatment given while a more urgent patient waits', () => {
    const first = run('treat-arrival', seed('arrival'))
    expect(lines(first.steps)).toEqual([3, 3, 4])
    expect(arrivals(first.steps[0].snapshot)).toEqual([101, 102, 103, 104, 105])
    expect(descs(first.steps)).toEqual([
      '#101 (severity 2) is at the front of the queue.',
      'Treating #101 (severity 2), who arrived first.',
      '#104 (severity 5) is more urgent and still waiting: bypassed is now 1.',
    ])
    let s = first.finalSnapshot
    for (let i = 0; i < 4; i++) s = run('treat-arrival', s).finalSnapshot
    expect(s.bypassed).toBe(3)
    expect(s.treated).toBe(5)
  })
})

describe('find record', () => {
  it('maps the B-tree get onto lines 4 and 5 and counts block reads', () => {
    const hit = run('find-record', seed('priority'), 63)
    expect(lines(hit.steps)).toEqual([4, 5, 5])
    expect(descs(hit.steps).at(-1)).toBe('Record 63 found after 2 block reads.')
    expect(hit.steps.at(-1)!.variables).toEqual({ 'block reads': 2 })
    const miss = run('find-record', seed('arrival'), 60)
    expect(descs(miss.steps).at(-1)).toBe('Record 60 is not in the archive: 2 block reads.')
  })
})
