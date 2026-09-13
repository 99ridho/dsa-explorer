// Executable form of the SPEC.md §10.4 step tables.
import { describe, expect, it } from 'vitest'
import { buildGraph, runAddEdge, runBfs, runConnectedComponents, runDfs, runStrongComponents, runTopologicalSort } from './operations'

const descs = (steps: { description: string }[]) => steps.map((s) => s.description)
const lines = (steps: { highlightLine: number }[]) => steps.map((s) => s.highlightLine)

const undirectedSeed = () => buildGraph(7, [[0, 1], [0, 2], [1, 3], [2, 3], [3, 4], [5, 6]], false)
const directedSeed = () => buildGraph(8, [[0, 1], [1, 2], [2, 0], [2, 3], [3, 4], [4, 5], [5, 3], [6, 7]], true)

describe('buildGraph', () => {
  it('stores undirected edges once with from < to, drops duplicates and self-loops, and lays out every vertex', () => {
    const g = buildGraph(3, [[2, 1], [1, 2], [0, 0], [0, 1]], false)
    expect(g.edges).toEqual([{ from: '1', to: '2' }, { from: '0', to: '1' }])
    expect(g.vertices.every((v) => Number.isFinite(v.x) && Number.isFinite(v.y))).toBe(true)
  })
})

describe('add edge', () => {
  it('adds an edge and creates missing vertices', () => {
    const { steps, finalSnapshot } = runAddEdge(undirectedSeed(), { from: '4', to: '8' })
    expect(descs(steps)).toEqual(['Added edge between 4 and 8.'])
    expect(finalSnapshot.vertices.length).toBe(9)
    expect(finalSnapshot.edges).toContainEqual({ from: '4', to: '8' })
  })
  it('rejects duplicates, self-loops, and vertices past the cap', () => {
    expect(descs(runAddEdge(undirectedSeed(), { from: '3', to: '1' }).steps)).toEqual(['Edge 3-1 already exists.'])
    expect(descs(runAddEdge(undirectedSeed(), { from: '2', to: '2' }).steps)).toEqual(['Self-loops are not used in this course.'])
    expect(descs(runAddEdge(undirectedSeed(), { from: '0', to: '10' }).steps)[0]).toMatch(/at most 10 vertices/)
  })
})

describe('BFS', () => {
  it('follows the §10.4 table from source 0 on the seed', () => {
    const { steps, finalSnapshot } = runBfs(undirectedSeed(), 0)
    expect(steps[0]).toMatchObject({ highlightLine: 2, description: 'Starting BFS from 0.', variables: { queue: '0' } })
    expect(descs(steps).slice(1, 6)).toEqual([
      'Processing 0.',
      'Checking neighbor 1 of 0.',
      '1 is new. Mark it visited and enqueue it.',
      'Checking neighbor 2 of 0.',
      '2 is new. Mark it visited and enqueue it.',
    ])
    expect(lines(steps).slice(1, 6)).toEqual([4, 5, 7, 5, 7])
    expect(descs(steps)).toContain('0 is already visited.')
    const tree = finalSnapshot.edges.filter((e) => e.state === 'tree').map((e) => `${e.from}-${e.to}`)
    expect(tree).toEqual(['0-1', '0-2', '1-3', '3-4'])
    expect(descs(steps).at(-1)).toBe('The queue is empty. BFS from 0 reached 5 of 7 vertices.')
    expect(finalSnapshot.vertices.find((v) => v.id === '5')!.state).toBeUndefined()
  })
  it('narrates a missing source', () => {
    expect(descs(runBfs(undirectedSeed(), 9).steps)).toEqual(['Vertex 9 does not exist.'])
  })
})

describe('DFS', () => {
  it('recurses depth first with enter/check/recurse/finish steps and a call stack', () => {
    const { steps } = runDfs(undirectedSeed(), 0)
    expect(descs(steps).slice(0, 5)).toEqual([
      'Visiting 0.',
      'Checking neighbor 1 of 0.',
      '1 is unvisited. Recursing into 1.',
      'Visiting 1.',
      'Checking neighbor 0 of 1.',
    ])
    expect(lines(steps).slice(0, 5)).toEqual([2, 3, 6, 2, 3])
    expect(steps[3].variables).toEqual({ stack: '0, 1' })
    expect(descs(steps)).toContain('0 is already visited.')
    expect(descs(steps).at(-1)).toBe('Finished 0.')
  })
})

describe('connected components', () => {
  it('finds two components on the seed and tags every vertex', () => {
    const { steps, finalSnapshot } = runConnectedComponents(undirectedSeed())
    expect(descs(steps)[0]).toBe('0 is unvisited, so it starts component 1.')
    expect(descs(steps)).toContain('5 is unvisited, so it starts component 2.')
    expect(descs(steps).at(-1)).toBe('Found 2 connected components.')
    const comp = Object.fromEntries(finalSnapshot.vertices.map((v) => [v.id, v.component]))
    expect(comp).toEqual({ 0: 1, 1: 1, 2: 1, 3: 1, 4: 1, 5: 2, 6: 2 })
  })
})

describe('topological sort', () => {
  it('returns a valid linearization of a DAG', () => {
    const dag = buildGraph(4, [[0, 1], [0, 2], [1, 3], [2, 3]], true)
    const { steps } = runTopologicalSort(dag)
    const last = steps.at(-1)!
    expect(last.highlightLine).toBe(5)
    expect(last.description).toBe('Reverse postorder is a valid topological order: 0, 2, 1, 3.')
    expect(descs(steps)).toContain('Finished 3. Pushing it onto the postorder stack.')
  })
  it('stops at the back edge on a cyclic digraph', () => {
    const { steps } = runTopologicalSort(directedSeed())
    expect(descs(steps).at(-1)).toBe('Edge 2 to 0 closes a cycle, so this digraph has no topological order.')
  })
})

describe('strong components (Kosaraju-Sharir)', () => {
  it('runs phase 1 on the reversed graph, then groups {0,1,2} and {3,4,5}', () => {
    const { steps, finalSnapshot } = runStrongComponents(directedSeed())
    const phase1 = steps.filter((s) => s.snapshot.phase === 'reversed')
    expect(phase1.length).toBeGreaterThan(0)
    expect(phase1.every((s) => s.highlightLine === 2)).toBe(true)
    expect(phase1.at(-1)!.description).toMatch(/^Reverse postorder of the reversed graph: /)
    expect(descs(steps).at(-1)).toBe('Found 4 strong components.')
    const comp = Object.fromEntries(finalSnapshot.vertices.map((v) => [v.id, v.component]))
    expect(comp[0]).toBe(comp[1])
    expect(comp[1]).toBe(comp[2])
    expect(comp[3]).toBe(comp[4])
    expect(comp[4]).toBe(comp[5])
    expect(comp[0]).not.toBe(comp[3])
    expect(comp[6]).not.toBe(comp[7])
    expect(finalSnapshot.phase).toBeUndefined()
  })
})
