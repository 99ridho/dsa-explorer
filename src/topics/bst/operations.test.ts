// Executable form of the SPEC.md §10.1 step tables.
import { describe, expect, it } from 'vitest'
import { buildTree, runDelete, runInorder, runInsert, runSearch } from './operations'
import type { BSTSnapshot } from './types'

const SEED = [50, 30, 70, 20, 40, 60, 80]
const tree = () => buildTree(SEED)

const lines = (steps: { highlightLine: number }[]) => steps.map((s) => s.highlightLine)
const highlighted = (snap: BSTSnapshot, kind: string) =>
  Object.values(snap.nodes)
    .filter((n) => n.highlight === kind)
    .map((n) => n.key)
const inorderKeys = (snap: BSTSnapshot): number[] => {
  const out: number[] = []
  const walk = (id: string | null) => {
    if (!id) return
    const n = snap.nodes[id]
    walk(n.left)
    out.push(n.key)
    walk(n.right)
  }
  walk(snap.rootId)
  return out
}

describe('buildTree / layout', () => {
  it('assigns in-order x positions and depth-based y', () => {
    const t = tree()
    expect(inorderKeys(t)).toEqual([20, 30, 40, 50, 60, 70, 80])
    const xs = inorderKeys(t).map((k) => t.nodes[`k${k}`].x)
    expect(xs).toEqual([...xs].sort((a, b) => a - b))
    expect(t.nodes.k50.y).toBe(0)
    expect(t.nodes.k30.y).toBeGreaterThan(0)
    expect(t.nodes.k20.y).toBeGreaterThan(t.nodes.k30.y)
  })
})

describe('insert', () => {
  it('descends with lines 4/6 and inserts at line 3 with a "new" highlight', () => {
    const { steps, finalSnapshot } = runInsert(tree(), 45)
    expect(lines(steps)).toEqual([4, 6, 6, 3])
    expect(steps[0].description).toBe('45 < 50, so go left.')
    expect(steps[1].description).toBe('45 > 30, so go right.')
    expect(highlighted(steps[0].snapshot, 'current')).toEqual([50])
    expect(highlighted(steps.at(-1)!.snapshot, 'new')).toEqual([45])
    expect(inorderKeys(finalSnapshot)).toEqual([20, 30, 40, 45, 50, 60, 70, 80])
    expect(finalSnapshot.nodes.k40.right).toBe('k45')
  })

  it('stops on a duplicate key with a "found" highlight and no structural change', () => {
    const { steps, finalSnapshot } = runInsert(tree(), 40)
    expect(lines(steps)).toEqual([4, 6, 4])
    expect(steps.at(-1)!.description).toContain('already exists')
    expect(highlighted(steps.at(-1)!.snapshot, 'found')).toEqual([40])
    expect(inorderKeys(finalSnapshot)).toEqual([20, 30, 40, 50, 60, 70, 80])
  })

  it('inserts into an empty tree at the root', () => {
    const { steps, finalSnapshot } = runInsert(buildTree([]), 7)
    expect(lines(steps)).toEqual([3])
    expect(finalSnapshot.rootId).toBe('k7')
  })

  it('never carries highlights into the final snapshot', () => {
    const { finalSnapshot } = runInsert(tree(), 45)
    expect(Object.values(finalSnapshot.nodes).every((n) => n.highlight === undefined)).toBe(true)
  })
})

describe('search', () => {
  it('hits at line 3 with a "found" highlight', () => {
    const { steps } = runSearch(tree(), 60)
    expect(lines(steps)).toEqual([5, 4, 3])
    expect(highlighted(steps.at(-1)!.snapshot, 'found')).toEqual([60])
  })

  it('misses at line 2', () => {
    const { steps } = runSearch(tree(), 99)
    expect(lines(steps)).toEqual([5, 5, 5, 2])
    expect(steps.at(-1)!.description).toContain('MISS')
  })
})

describe('delete (Hibbard)', () => {
  it('splices out a leaf via line 6', () => {
    const { steps, finalSnapshot } = runDelete(tree(), 20)
    expect(lines(steps)).toEqual([3, 3, 5, 6])
    expect(steps[2].description).toBe('Found 20. This node has 0 children.')
    expect(highlighted(steps[2].snapshot, 'delete-target')).toEqual([20])
    expect(inorderKeys(finalSnapshot)).toEqual([30, 40, 50, 60, 70, 80])
    expect(finalSnapshot.nodes.k30.left).toBeNull()
  })

  it('splices out a node with only a right child via line 7', () => {
    const t = buildTree([50, 30, 35])
    const { steps, finalSnapshot } = runDelete(t, 30)
    expect(lines(steps)).toEqual([3, 5, 7])
    expect(finalSnapshot.nodes.k50.left).toBe('k35')
  })

  it('replaces a two-child node with its in-order successor (lines 5, 8, 11)', () => {
    const { steps, finalSnapshot } = runDelete(tree(), 30)
    expect(lines(steps)).toEqual([3, 5, 8, 11])
    expect(steps[2].description).toBe('Two children: replacing 30 with its in-order successor 40.')
    expect(highlighted(steps[2].snapshot, 'found')).toEqual([40])
    expect(finalSnapshot.nodes.k50.left).toBe('k40')
    expect(finalSnapshot.nodes.k40.left).toBe('k20')
    expect(finalSnapshot.nodes.k40.right).toBeNull()
    expect(inorderKeys(finalSnapshot)).toEqual([20, 40, 50, 60, 70, 80])
  })

  it('handles a successor deeper in the right subtree', () => {
    const t = buildTree([50, 30, 70, 60, 80, 55, 65])
    const { finalSnapshot } = runDelete(t, 50)
    expect(finalSnapshot.rootId).toBe('k55')
    expect(finalSnapshot.nodes.k55.left).toBe('k30')
    expect(finalSnapshot.nodes.k55.right).toBe('k70')
    expect(finalSnapshot.nodes.k60.left).toBeNull()
    expect(inorderKeys(finalSnapshot)).toEqual([30, 55, 60, 65, 70, 80])
  })

  it('reports a miss at line 2 when the key is absent', () => {
    const { steps, finalSnapshot } = runDelete(tree(), 99)
    expect(lines(steps).at(-1)).toBe(2)
    expect(inorderKeys(finalSnapshot)).toEqual([20, 30, 40, 50, 60, 70, 80])
  })
})

describe('inorder', () => {
  it('emits one VISIT step per node at line 4, in sorted order', () => {
    const { steps } = runInorder(tree())
    expect(lines(steps)).toEqual([4, 4, 4, 4, 4, 4, 4])
    expect(steps.map((s) => highlighted(s.snapshot, 'current')[0])).toEqual([20, 30, 40, 50, 60, 70, 80])
    expect(steps.at(-1)!.variables).toEqual({ visited: '20, 30, 40, 50, 60, 70, 80' })
  })

  it('handles an empty tree', () => {
    const { steps } = runInorder(buildTree([]))
    expect(lines(steps)).toEqual([2])
  })
})
