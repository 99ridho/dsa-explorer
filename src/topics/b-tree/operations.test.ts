// Executable form of the SPEC.md §10.12 step tables. M = 4 throughout.
import { describe, expect, it } from 'vitest'
import { buildTree, emptyTree, nodeWidth, runGet, runPut } from './operations'
import type { BTreeSnapshot } from './types'

const lines = (steps: { highlightLine: number }[]) => steps.map((s) => s.highlightLine)
const SEED = [50, 20, 70, 30, 60]
const keysOf = (t: BTreeSnapshot, id: string) => t.nodes[id].entries.map((e) => e.key)
const children = (t: BTreeSnapshot, id: string) => t.nodes[id].entries.map((e) => keysOf(t, e.childId!))

describe('seed', () => {
  it('has a root of two guide keys over two leaves', () => {
    const t = buildTree(SEED)
    expect(t.height).toBe(1)
    expect(keysOf(t, t.rootId)).toEqual([20, 50])
    expect(children(t, t.rootId)).toEqual([
      [20, 30],
      [50, 60, 70],
    ])
    expect(t.n).toBe(5)
  })
})

describe('get', () => {
  it('descends by guide key and hits in the leaf', () => {
    const { steps } = runGet(buildTree(SEED), 60)
    expect(lines(steps)).toEqual([7, 4, 4])
    expect(steps[0].description).toBe('60 >= 50, the last guide key, so descend into child 1.')
    expect(steps[0].snapshot.nodes[steps[0].snapshot.rootId].entryIndex).toBe(1)
    expect(steps[1].description).toBe('Comparing 60 with 50 in this leaf.')
    expect(steps[2].description).toBe('60 matches this entry: HIT.')
    expect(steps[2].variables).toEqual({ probes: 2 })
  })

  it('descends left by the next guide key and misses', () => {
    const { steps } = runGet(buildTree(SEED), 25)
    expect(steps[0].description).toBe('25 < 50, so descend into child 0.')
    expect(lines(steps)).toEqual([7, 4, 4, 8])
    expect(steps.at(-1)!.description).toBe('25 is not in this leaf: MISS.')
  })
})

describe('put', () => {
  it('places a key in a leaf with room', () => {
    const { steps, finalSnapshot } = runPut(buildTree(SEED), 40)
    expect(lines(steps)).toEqual([9, 14])
    expect(steps[1].description).toBe('Placing 40 at position 2 in the leaf: it now holds 3 entries.')
    expect(children(finalSnapshot, finalSnapshot.rootId)[0]).toEqual([20, 30, 40])
    expect(Object.values(finalSnapshot.nodes).every((n) => n.highlight === undefined)).toBe(true)
  })

  it('splits a full leaf and adds a guide key to the parent', () => {
    const { steps, finalSnapshot } = runPut(buildTree(SEED), 80)
    expect(lines(steps)).toEqual([9, 14, 18, 14])
    expect(steps[2].description).toBe('The node holds 4 entries, so split it: 50 and 60 stay, 70 and 80 move to a new node.')
    expect(steps[3].description).toBe('Adding guide key 70 for the new node to the parent at position 2: it now holds 3 entries.')
    expect(keysOf(finalSnapshot, finalSnapshot.rootId)).toEqual([20, 50, 70])
    expect(children(finalSnapshot, finalSnapshot.rootId)).toEqual([
      [20, 30],
      [50, 60],
      [70, 80],
    ])
    expect(finalSnapshot.height).toBe(1)
  })

  it('updates the guide key for a new minimum, then splits the root when the parent overflows', () => {
    const t = [80, 10].reduce((tree, k) => runPut(tree, k).finalSnapshot, buildTree(SEED))
    expect(keysOf(t, t.rootId)).toEqual([10, 50, 70])
    const ten = runPut(runPut(buildTree(SEED), 80).finalSnapshot, 10)
    expect(lines(ten.steps)).toEqual([9, 10, 14])
    expect(ten.steps[1].description).toBe('10 is smaller than the guide key 20, so the guide key becomes 10.')
    const { steps, finalSnapshot } = runPut(t, 5)
    expect(lines(steps)).toEqual([9, 10, 14, 18, 14, 18, 4])
    expect(steps.at(-1)!.description).toBe('The root split into two nodes, so a new root above them adds a level: height is now 2.')
    expect(finalSnapshot.height).toBe(2)
    expect(keysOf(finalSnapshot, finalSnapshot.rootId)).toEqual([5, 50])
    expect(children(finalSnapshot, finalSnapshot.rootId)).toEqual([
      [5, 20],
      [50, 70],
    ])
  })

  it('stops on a duplicate key', () => {
    const { steps, finalSnapshot } = runPut(buildTree(SEED), 50)
    expect(lines(steps)).toEqual([9, 7])
    expect(steps[1].description).toBe('50 is already in this leaf, so nothing changes.')
    expect(finalSnapshot.n).toBe(5)
  })

  it('grows from an empty root and refuses the 31st key', () => {
    const one = runPut(emptyTree(), 5)
    expect(lines(one.steps)).toEqual([14])
    expect(one.finalSnapshot.height).toBe(0)
    const full = buildTree(Array.from({ length: 30 }, (_, i) => i + 1))
    expect(full.n).toBe(30)
    const { steps, finalSnapshot } = runPut(full, 99)
    expect(lines(steps)).toEqual([2])
    expect(finalSnapshot.n).toBe(30)
  })

  it('every guide key equals the smallest key of its subtree', () => {
    const t = buildTree([50, 20, 70, 30, 60, 80, 10, 5, 90, 1, 65, 15])
    const smallest = (id: string): number => {
      const node = t.nodes[id]
      return node.external ? node.entries[0].key : smallest(node.entries[0].childId!)
    }
    for (const node of Object.values(t.nodes)) {
      if (node.external) continue
      for (const e of node.entries) expect(e.key).toBe(smallest(e.childId!))
    }
  })
})

describe('layout', () => {
  it('keeps sibling leaves apart and centers the root', () => {
    const t = buildTree(SEED)
    const kids = t.nodes[t.rootId].entries.map((e) => t.nodes[e.childId!])
    for (let i = 1; i < kids.length; i++) {
      const prevRight = kids[i - 1].x + nodeWidth(kids[i - 1].entries.length) / 2
      const left = kids[i].x - nodeWidth(kids[i].entries.length) / 2
      expect(prevRight).toBeLessThan(left)
    }
    const span = (kids[0].x - nodeWidth(2) / 2 + kids[1].x + nodeWidth(3) / 2) / 2
    expect(t.nodes[t.rootId].x).toBeCloseTo(span)
    expect(kids.every((k) => k.y > t.nodes[t.rootId].y)).toBe(true)
  })
})
