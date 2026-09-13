// Executable form of the SPEC.md §10.10 step tables.
import { describe, expect, it } from 'vitest'
import { walk } from '@/lib/linked-nodes'
import { buildList, runInsertFirst, runInsertLast, runRemoveFirst, runTraverse } from './operations'

const lines = (steps: { highlightLine: number }[]) => steps.map((s) => s.highlightLine)
const SEED = [4, 8, 15, 16]
const values = (s: ReturnType<typeof buildList>) => walk(s.nodes, s.firstId).map((id) => s.nodes[id].value)

describe('insert', () => {
  it('insert-first creates a detached node, then links it to the old first', () => {
    const { steps, finalSnapshot } = runInsertFirst(buildList(SEED), 3)
    expect(lines(steps)).toEqual([3, 4])
    expect(steps[0].description).toBe('Creating a node for 3: first now points at it.')
    expect(steps[0].snapshot.nodes.n4.next).toBeNull()
    expect(steps[0].snapshot.highlight).toEqual({ n4: 'new' })
    expect(steps[1].description).toBe('Pointing its next at the old first node 4, so the list starts at 3.')
    expect(values(finalSnapshot)).toEqual([3, 4, 8, 15, 16])
    expect(finalSnapshot.highlight).toBeUndefined()
  })

  it('insert-first on an empty list also sets last', () => {
    const { steps, finalSnapshot } = runInsertFirst(buildList([]), 3)
    expect(lines(steps)).toEqual([3, 5])
    expect(steps[1].description).toBe('The list was empty, so last also points at 3.')
    expect(finalSnapshot.lastId).toBe('n0')
  })

  it('insert-last links the old last node to the new one', () => {
    const { steps, finalSnapshot } = runInsertLast(buildList(SEED), 23)
    expect(lines(steps)).toEqual([3, 5])
    expect(steps[1].description).toBe('Pointing the old last node 16 at 23, so the list ends at 23.')
    expect(steps[1].snapshot.highlight).toEqual({ n3: 'current', n4: 'current' })
    expect(values(finalSnapshot)).toEqual([4, 8, 15, 16, 23])
    expect(lines(runInsertLast(buildList([]), 23).steps)).toEqual([3, 4])
  })

  it('refuses a 13th node', () => {
    const full = buildList(Array.from({ length: 12 }, (_, i) => i))
    const { steps, finalSnapshot } = runInsertFirst(full, 99)
    expect(lines(steps)).toEqual([3])
    expect(steps[0].description).toBe('The list holds 12 nodes, the most this demo shows, so 99 is not added.')
    expect(Object.keys(finalSnapshot.nodes)).toHaveLength(12)
  })
})

describe('remove-first', () => {
  it('takes the first item and advances first', () => {
    const { steps, finalSnapshot } = runRemoveFirst(buildList(SEED))
    expect(lines(steps)).toEqual([3, 4])
    expect(steps[0].description).toBe('Taking 4 from the first node.')
    expect(steps[1].description).toBe('first moves to 8, so the old node is unreachable.')
    expect(values(finalSnapshot)).toEqual([8, 15, 16])
    expect(finalSnapshot.nodes.n0).toBeUndefined()
  })

  it('clears last when the list becomes empty, then reports empty', () => {
    const { steps, finalSnapshot } = runRemoveFirst(buildList([4]))
    expect(lines(steps)).toEqual([3, 4, 5])
    expect(finalSnapshot.lastId).toBeNull()
    const empty = runRemoveFirst(finalSnapshot)
    expect(lines(empty.steps)).toEqual([2])
    expect(empty.steps[0].description).toBe('The list is empty, so there is nothing to remove.')
  })
})

describe('traverse', () => {
  it('visits every node in order, marking the current node and the visited prefix', () => {
    const { steps, finalSnapshot } = runTraverse(buildList(SEED))
    expect(lines(steps)).toEqual([3, 3, 3, 3, 2])
    expect(steps[0].description).toBe('Visit 4. Visited so far: 4.')
    expect(steps[2].snapshot.highlight).toEqual({ n0: 'visited', n1: 'visited', n2: 'current' })
    expect(steps[2].variables).toEqual({ visited: '4, 8, 15' })
    expect(steps[4].description).toBe('x is null, so the traversal ends after 4 nodes.')
    expect(values(finalSnapshot)).toEqual(SEED)
  })

  it('on an empty list emits one step', () => {
    const { steps } = runTraverse(buildList([]))
    expect(lines(steps)).toEqual([2])
    expect(steps[0].description).toBe('The list is empty, so there is nothing to visit.')
  })
})
