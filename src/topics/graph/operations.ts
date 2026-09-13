// SPEC.md §10.4: operations. Each `run()` emits exactly the steps in the spec's step tables.
// Positions come from lib/layout/graph-layout and change only when the vertex/edge set does.
import type { EdgeInput, OperationDefinition, OperationResult, Step } from '@/types/step-engine'
import { layoutGraph } from '@/lib/layout/graph-layout'
import { LAYOUT_HEIGHT, LAYOUT_WIDTH, MAX_VERTICES, type GraphEdge, type GraphSnapshot, type GraphState, type GraphVertex } from './types'

type Vars = Step<GraphSnapshot>['variables']

// ---------- construction, shared by createInitialState and randomize ----------

/** Canonical edge key: undirected edges are stored once with from < to. */
function edgeKey(from: string, to: string, directed: boolean) {
  if (directed || Number(from) <= Number(to)) return { from, to }
  return { from: to, to: from }
}

export function buildGraph(vertexCount: number, edges: [number, number][], directed: boolean): GraphSnapshot {
  const ids = Array.from({ length: vertexCount }, (_, i) => String(i))
  const seen = new Set<string>()
  const edgeList: GraphEdge[] = []
  for (const [a, b] of edges) {
    const { from, to } = edgeKey(String(a), String(b), directed)
    const k = `${from}-${to}`
    if (from === to || seen.has(k)) continue
    seen.add(k)
    edgeList.push({ from, to })
  }
  const positions = layoutGraph(ids, edgeList, { width: LAYOUT_WIDTH, height: LAYOUT_HEIGHT })
  const vertices: GraphVertex[] = ids.map((id) => ({ id, label: id, x: positions[id].x, y: positions[id].y }))
  return { vertices, edges: edgeList, directed }
}

// ---------- snapshot helpers ----------

function clone(s: GraphSnapshot): GraphSnapshot {
  return {
    vertices: s.vertices.map((v) => ({ ...v })),
    edges: s.edges.map((e) => ({ ...e })),
    directed: s.directed,
    ...(s.phase ? { phase: s.phase } : {}),
  }
}

/** Fresh working copy with all algorithm state cleared. */
function reset(s: GraphSnapshot): GraphSnapshot {
  const c = clone(s)
  delete c.phase
  for (const v of c.vertices) {
    delete v.state
    delete v.component
  }
  for (const e of c.edges) delete e.state
  return c
}

function adjacency(s: GraphSnapshot): Map<string, string[]> {
  const adj = new Map<string, string[]>(s.vertices.map((v) => [v.id, []]))
  for (const e of s.edges) {
    adj.get(e.from)!.push(e.to)
    if (!s.directed) adj.get(e.to)!.push(e.from)
  }
  for (const list of adj.values()) list.sort((a, b) => Number(a) - Number(b))
  return adj
}

function reversed(s: GraphSnapshot): GraphSnapshot {
  const c = clone(s)
  c.edges = c.edges.map((e) => ({ from: e.to, to: e.from }))
  c.phase = 'reversed'
  return c
}

const vertex = (s: GraphSnapshot, id: string) => s.vertices.find((v) => v.id === id)!
function edgeBetween(s: GraphSnapshot, a: string, b: string) {
  return s.edges.find((e) => (e.from === a && e.to === b) || (!s.directed && e.from === b && e.to === a))
}

class StepRecorder {
  readonly steps: Step<GraphSnapshot>[] = []
  push(base: GraphSnapshot, highlightLine: number, description: string, variables?: Vars) {
    this.steps.push({ id: this.steps.length, description, highlightLine, snapshot: clone(base), ...(variables ? { variables } : {}) })
  }
}

const list = (ids: string[]) => (ids.length ? ids.join(', ') : 'empty')

// ---------- Add edge ----------

export function runAddEdge(state: GraphState, input: EdgeInput): OperationResult<GraphSnapshot> {
  const rec = new StepRecorder()
  const s = reset(state)
  const a = String(Number(input.from))
  const b = String(Number(input.to))
  if (!/^\d+$/.test(input.from) || !/^\d+$/.test(input.to)) {
    rec.push(s, 1, 'Vertices are numbered 0 to 9. Enter an edge such as 2-5.')
    return { steps: rec.steps, finalSnapshot: s }
  }
  if (a === b) {
    rec.push(s, 3, 'Self-loops are not used in this course.')
    return { steps: rec.steps, finalSnapshot: s }
  }
  const needed = Math.max(Number(a), Number(b)) + 1
  if (needed > MAX_VERTICES) {
    rec.push(s, 2, `This visualizer holds at most ${MAX_VERTICES} vertices, numbered 0 to ${MAX_VERTICES - 1}.`)
    return { steps: rec.steps, finalSnapshot: s }
  }
  if (edgeBetween(s, a, b)) {
    rec.push(s, 3, `Edge ${a}-${b} already exists.`)
    return { steps: rec.steps, finalSnapshot: s }
  }
  const count = Math.max(s.vertices.length, needed)
  const edges: [number, number][] = [...s.edges.map((e) => [Number(e.from), Number(e.to)] as [number, number]), [Number(a), Number(b)]]
  const next = buildGraph(count, edges, s.directed)
  rec.push(next, 3, s.directed ? `Added edge ${a} to ${b}.` : `Added edge between ${a} and ${b}.`)
  return { steps: rec.steps, finalSnapshot: next }
}

// ---------- BFS ----------

export function runBfs(state: GraphState, source: number): OperationResult<GraphSnapshot> {
  const rec = new StepRecorder()
  const s = reset(state)
  const src = String(source)
  if (!s.vertices.some((v) => v.id === src)) {
    rec.push(s, 1, `Vertex ${src} does not exist.`)
    return { steps: rec.steps, finalSnapshot: s }
  }
  const adj = adjacency(s)
  const visited = new Set<string>([src])
  const queue: string[] = [src]
  vertex(s, src).state = 'frontier'
  rec.push(s, 2, `Starting BFS from ${src}.`, { queue: list(queue) })

  let current: string | null = null
  while (queue.length > 0) {
    if (current) vertex(s, current).state = 'visited'
    current = queue.shift()!
    vertex(s, current).state = 'visiting'
    rec.push(s, 4, `Processing ${current}.`, { queue: list(queue) })
    for (const w of adj.get(current)!) {
      const e = edgeBetween(s, current, w)!
      if (e.state !== 'tree') e.state = 'active'
      rec.push(s, 5, `Checking neighbor ${w} of ${current}.`, { queue: list(queue) })
      if (visited.has(w)) {
        rec.push(s, 6, `${w} is already visited.`, { queue: list(queue) })
      } else {
        visited.add(w)
        queue.push(w)
        e.state = 'tree'
        vertex(s, w).state = 'frontier'
        rec.push(s, 7, `${w} is new. Mark it visited and enqueue it.`, { queue: list(queue) })
      }
      if (e.state === 'active') e.state = 'default'
    }
  }
  if (current) vertex(s, current).state = 'visited'
  rec.push(s, 3, `The queue is empty. BFS from ${src} reached ${visited.size} of ${s.vertices.length} vertices.`, { queue: 'empty' })
  return { steps: rec.steps, finalSnapshot: s }
}

// ---------- DFS (shared by DFS, CC, topological sort, Kosaraju) ----------

interface DfsOptions {
  lines: { enter: number; check: number; seen: number; recurse: number; finish: number }
  vars: () => Vars
  component?: number
  onFinish?: (v: string) => void
  /** Return true from onBackEdge to abort (topological sort on a cycle). */
  onBackEdge?: (v: string, w: string) => boolean
}

function dfsWithSteps(rec: StepRecorder, s: GraphSnapshot, adj: Map<string, string[]>, visited: Set<string>, start: string, opts: DfsOptions): boolean {
  const stack: string[] = []
  const vars = () => ({ ...(opts.vars() ?? {}), stack: list(stack) })
  let aborted = false

  const visit = (v: string) => {
    visited.add(v)
    stack.push(v)
    const vx = vertex(s, v)
    vx.state = 'visiting'
    if (opts.component !== undefined) vx.component = opts.component
    rec.push(s, opts.lines.enter, `Visiting ${v}.`, vars())
    for (const w of adj.get(v)!) {
      if (aborted) return
      const e = edgeBetween(s, v, w)!
      if (e.state !== 'tree') e.state = 'active'
      rec.push(s, opts.lines.check, `Checking neighbor ${w} of ${v}.`, vars())
      if (visited.has(w)) {
        if (stack.includes(w) && opts.onBackEdge?.(v, w)) {
          rec.push(s, opts.lines.check, `Edge ${v} to ${w} closes a cycle, so this digraph has no topological order.`, vars())
          aborted = true
          return
        }
        rec.push(s, opts.lines.seen, `${w} is already visited.`, vars())
      } else {
        e.state = 'tree'
        rec.push(s, opts.lines.recurse, `${w} is unvisited. Recursing into ${w}.`, vars())
        visit(w)
        if (aborted) return
      }
      if (e.state === 'active') e.state = 'default'
    }
    stack.pop()
    vx.state = 'visited'
    opts.onFinish?.(v)
    rec.push(s, opts.lines.finish, opts.onFinish ? `Finished ${v}. Pushing it onto the postorder stack.` : `Finished ${v}.`, vars())
  }

  visit(start)
  return !aborted
}

export function runDfs(state: GraphState, source: number): OperationResult<GraphSnapshot> {
  const rec = new StepRecorder()
  const s = reset(state)
  const src = String(source)
  if (!s.vertices.some((v) => v.id === src)) {
    rec.push(s, 1, `Vertex ${src} does not exist.`)
    return { steps: rec.steps, finalSnapshot: s }
  }
  const visited = new Set<string>()
  dfsWithSteps(rec, s, adjacency(s), visited, src, {
    lines: { enter: 2, check: 3, seen: 4, recurse: 6, finish: 3 },
    vars: () => ({}),
  })
  return { steps: rec.steps, finalSnapshot: s }
}

// ---------- Connected components (undirected) ----------

export function runConnectedComponents(state: GraphState): OperationResult<GraphSnapshot> {
  const rec = new StepRecorder()
  const s = reset(state)
  const adj = adjacency(s)
  const visited = new Set<string>()
  let count = 0
  for (const v of s.vertices) {
    if (visited.has(v.id)) continue
    count += 1
    rec.push(s, 4, `${v.id} is unvisited, so it starts component ${count}.`, { count })
    dfsWithSteps(rec, s, adj, visited, v.id, {
      lines: { enter: 6, check: 6, seen: 6, recurse: 6, finish: 6 },
      vars: () => ({ count }),
      component: count,
    })
  }
  rec.push(s, 3, `Found ${count} connected components.`, { count })
  return { steps: rec.steps, finalSnapshot: s }
}

// ---------- Topological sort (directed) ----------

/** DFS postorder over every vertex; returns null when a cycle is found. */
function postorderWithSteps(
  rec: StepRecorder,
  s: GraphSnapshot,
  adj: Map<string, string[]>,
  lines: DfsOptions['lines'],
  startLine: number,
  extra: () => Vars,
  abortOnCycle: boolean,
) {
  const visited = new Set<string>()
  const postorder: string[] = []
  for (const v of s.vertices) {
    if (visited.has(v.id)) continue
    rec.push(s, startLine, `${v.id} is unvisited. Starting a DFS from ${v.id}.`, { ...extra(), postorder: list(postorder) })
    const ok = dfsWithSteps(rec, s, adj, visited, v.id, {
      lines,
      vars: () => ({ ...extra(), postorder: list(postorder) }),
      onFinish: (id) => postorder.push(id),
      onBackEdge: () => abortOnCycle,
    })
    if (!ok) return null
  }
  return postorder
}

export function runTopologicalSort(state: GraphState): OperationResult<GraphSnapshot> {
  const rec = new StepRecorder()
  const s = reset(state)
  const postorder = postorderWithSteps(rec, s, adjacency(s), { enter: 4, check: 4, seen: 4, recurse: 4, finish: 4 }, 3, () => ({}), true)
  if (postorder) {
    const order = [...postorder].reverse()
    rec.push(s, 5, `Reverse postorder is a valid topological order: ${list(order)}.`, { postorder: list(postorder), order: list(order) })
  }
  return { steps: rec.steps, finalSnapshot: s }
}

// ---------- Strong components, Kosaraju-Sharir (directed) ----------

export function runStrongComponents(state: GraphState): OperationResult<GraphSnapshot> {
  const rec = new StepRecorder()
  // Phase 1: reverse postorder of the reversed graph, drawn reversed and dimmed by the canvas.
  const r = reversed(reset(state))
  const phase = { phase: 'reversed graph' }
  const postorder = postorderWithSteps(rec, r, adjacency(r), { enter: 2, check: 2, seen: 2, recurse: 2, finish: 2 }, 2, () => phase, false)!
  const order = [...postorder].reverse()
  rec.push(r, 2, `Reverse postorder of the reversed graph: ${list(order)}.`, { ...phase, order: list(order) })

  // Phase 2: DFS on the original graph in that order, one component per start.
  const s = reset(state)
  const adj = adjacency(s)
  const visited = new Set<string>()
  let count = 0
  for (const v of order) {
    if (visited.has(v)) continue
    count += 1
    rec.push(s, 5, `${v} starts strong component ${count}.`, { order: list(order), count })
    dfsWithSteps(rec, s, adj, visited, v, {
      lines: { enter: 5, check: 5, seen: 5, recurse: 5, finish: 5 },
      vars: () => ({ order: list(order), count }),
      component: count,
    })
  }
  rec.push(s, 3, `Found ${count} strong components.`, { order: list(order), count })
  return { steps: rec.steps, finalSnapshot: s }
}

// ---------- registry ----------

export const graphOperations: OperationDefinition<GraphState, unknown, GraphSnapshot>[] = [
  { id: 'add-edge', label: 'Add edge', inputKind: 'edge', run: (s, e) => runAddEdge(s, e as EdgeInput) },
  { id: 'bfs', label: 'Breadth-first search', inputKind: 'key', run: (s, v) => runBfs(s, v as number) },
  { id: 'dfs', label: 'Depth-first search', inputKind: 'key', run: (s, v) => runDfs(s, v as number) },
  { id: 'connected-components', label: 'Connected components', inputKind: 'none', variants: ['undirected'], run: (s) => runConnectedComponents(s) },
  { id: 'topological-sort', label: 'Topological sort', inputKind: 'none', variants: ['directed'], run: (s) => runTopologicalSort(s) },
  { id: 'strong-components', label: 'Strong components', inputKind: 'none', variants: ['directed'], run: (s) => runStrongComponents(s) },
]
