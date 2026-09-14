// SPEC.md §19.1: operations. Each `run()` emits exactly the steps in the step tables.
import type { OperationDefinition, OperationResult, Step } from '@/types/step-engine'
import { plural } from '@/lib/linked-nodes'
import { buildGraph } from '@/topics/graph/operations'
import type { GraphSnapshot } from '@/topics/graph/types'
import { COURSE_M, MAX_COURSES, type CourseEntry, type StudyPlanSnapshot, type StudyPlanState } from './types'

type Vars = Step<StudyPlanSnapshot>['variables']

const CODE = /^[A-Za-z0-9]{2,4}$/
const PREREQUISITE = /^\s*([A-Za-z0-9]{2,4})\s+before\s+([A-Za-z0-9]{2,4})\s*$/i

/** algs4 string hash with R = 31, reduced mod M after every character so it stays small. */
export function hashCode(code: string, M = COURSE_M): number {
  let h = 0
  for (const ch of code) h = (31 * h + ch.charCodeAt(0)) % M
  return h
}

// ---------- snapshot helpers ----------

function cloneGraph(g: GraphSnapshot): GraphSnapshot {
  return { vertices: g.vertices.map((v) => ({ ...v })), edges: g.edges.map((e) => ({ ...e })), directed: g.directed }
}

function clone(s: StudyPlanSnapshot): StudyPlanSnapshot {
  return {
    focus: s.focus,
    M: s.M,
    buckets: s.buckets.map((b) => b.map((e) => ({ ...e }))),
    codes: [...s.codes],
    graph: cloneGraph(s.graph),
    ...(s.plan ? { plan: { order: [...s.plan.order], late: [...s.plan.late] } } : {}),
    ...(s.highlight ? { highlight: { ...s.highlight } } : {}),
  }
}

/** The persistent state rests on the digraph, with no traversal colors and no plan. */
function settle(s: StudyPlanSnapshot): StudyPlanSnapshot {
  const c = clone(s)
  c.focus = 'graph'
  delete c.plan
  delete c.highlight
  for (const v of c.graph.vertices) delete v.state
  for (const e of c.graph.edges) delete e.state
  return c
}

function labeled(graph: GraphSnapshot, codes: string[]): GraphSnapshot {
  for (const v of graph.vertices) v.label = codes[Number(v.id)]
  return graph
}

function rebuildGraph(s: StudyPlanSnapshot, edges: [number, number][]) {
  s.graph = labeled(buildGraph(s.codes.length, edges, true), s.codes)
}

const edgePairs = (g: GraphSnapshot): [number, number][] => g.edges.map((e) => [Number(e.from), Number(e.to)])

class StepRecorder {
  readonly steps: Step<StudyPlanSnapshot>[] = []
  push(base: StudyPlanSnapshot, highlightLine: number, description: string, variables?: Vars) {
    this.steps.push({ id: this.steps.length, description, highlightLine, snapshot: clone(base), ...(variables ? { variables } : {}) })
  }
}

// ---------- step-free construction, shared by createInitialState and randomize ----------

export function buildPlan(codes: string[], prerequisites: [string, string][]): StudyPlanSnapshot {
  const buckets: CourseEntry[][] = Array.from({ length: COURSE_M }, () => [])
  codes.forEach((code, v) => buckets[hashCode(code)].push({ code, v }))
  const index = new Map(codes.map((c, v) => [c, v]))
  const edges = prerequisites.map(([a, b]) => [index.get(a)!, index.get(b)!] as [number, number])
  const s: StudyPlanSnapshot = {
    focus: 'graph',
    M: COURSE_M,
    buckets,
    codes: [...codes],
    graph: labeled(buildGraph(codes.length, edges, true), codes),
  }
  return s
}

// ---------- index lookups ----------

/** Hash and compare steps for one GET; returns the entry's position in its bucket or -1, and adds to `count.compares`. */
function lookup(
  rec: StepRecorder,
  s: StudyPlanSnapshot,
  code: string,
  lines: { hash: number; compare: number },
  count: { compares: number },
): { i: number; idx: number } {
  const i = hashCode(code, s.M)
  s.focus = 'index'
  s.highlight = { bucket: i }
  rec.push(s, lines.hash, `${code} hashes to bucket ${i}.`, { compares: count.compares })
  const bucket = s.buckets[i]
  for (let idx = 0; idx < bucket.length; idx++) {
    count.compares += 1
    s.highlight = { bucket: i, index: idx }
    rec.push(s, lines.compare, `Comparing ${code} with ${bucket[idx].code} in bucket ${i}.`, { compares: count.compares })
    if (bucket[idx].code === code) return { i, idx }
  }
  return { i, idx: -1 }
}

// ---------- Add course ----------

export function runAddCourse(state: StudyPlanState, input: string): OperationResult<StudyPlanSnapshot> {
  const rec = new StepRecorder()
  const s = settle(state)
  const raw = input.trim()
  if (!CODE.test(raw)) {
    rec.push(s, 1, 'A course code has 2 to 4 letters or digits, such as PR3.')
    return { steps: rec.steps, finalSnapshot: settle(s) }
  }
  const code = raw.toUpperCase()
  const count = { compares: 0 }
  const { i, idx } = lookup(rec, s, code, { hash: 2, compare: 3 }, count)
  const bucket = s.buckets[i]
  if (idx >= 0) {
    rec.push(s, 3, `${code} is already course ${bucket[idx].v}, so nothing changes.`, { compares: count.compares })
    return { steps: rec.steps, finalSnapshot: settle(s) }
  }
  if (s.codes.length >= MAX_COURSES) {
    s.focus = 'graph'
    delete s.highlight
    rec.push(s, 4, `The plan holds at most ${MAX_COURSES} courses, so ${code} is not added.`, { compares: count.compares })
    return { steps: rec.steps, finalSnapshot: settle(s) }
  }
  const v = s.codes.length
  s.codes.push(code)
  rebuildGraph(s, edgePairs(s.graph))
  s.graph.vertices[v].state = 'frontier'
  s.focus = 'graph'
  delete s.highlight
  rec.push(s, 4, `${code} becomes vertex ${v} of the digraph, with no prerequisites yet.`, { compares: count.compares })
  delete s.graph.vertices[v].state
  bucket.push({ code, v })
  s.focus = 'index'
  s.highlight = { bucket: i, index: bucket.length - 1 }
  rec.push(s, 5, `Appending ${code} to bucket ${i}: the index now holds ${plural(s.codes.length, 'course')}.`, { compares: count.compares })
  return { steps: rec.steps, finalSnapshot: settle(s) }
}

// ---------- Add prerequisite ----------

export function runAddPrerequisite(state: StudyPlanState, input: string): OperationResult<StudyPlanSnapshot> {
  const rec = new StepRecorder()
  const s = settle(state)
  const match = PREREQUISITE.exec(input)
  if (!match) {
    rec.push(s, 1, 'Type the course taken first, then before, then the next course, such as PR1 before PR2.')
    return { steps: rec.steps, finalSnapshot: settle(s) }
  }
  const before = match[1].toUpperCase()
  const after = match[2].toUpperCase()
  if (before === after) {
    rec.push(s, 4, 'A course cannot be its own prerequisite.')
    return { steps: rec.steps, finalSnapshot: settle(s) }
  }
  const count = { compares: 0 }
  const ids: number[] = []
  for (const [code, line] of [[before, 2], [after, 3]] as const) {
    const { i, idx } = lookup(rec, s, code, { hash: line, compare: line }, count)
    if (idx < 0) {
      rec.push(s, 4, `${code} is not in the index. Add it as a course first.`, { compares: count.compares })
      return { steps: rec.steps, finalSnapshot: settle(s) }
    }
    const v = s.buckets[i][idx].v
    rec.push(s, line, `${code} is course ${v}.`, { compares: count.compares })
    ids.push(v)
  }
  const [v, w] = ids
  s.focus = 'graph'
  delete s.highlight
  const exists = s.graph.edges.some((e) => e.from === String(v) && e.to === String(w))
  if (exists) {
    rec.push(s, 5, `${before} is already a prerequisite of ${after}.`, { compares: count.compares })
    return { steps: rec.steps, finalSnapshot: settle(s) }
  }
  rebuildGraph(s, [...edgePairs(s.graph), [v, w]])
  s.graph.edges.find((e) => e.from === String(v) && e.to === String(w))!.state = 'tree'
  rec.push(s, 5, `Added edge ${before} to ${after}: take ${before} first.`, { compares: count.compares })
  return { steps: rec.steps, finalSnapshot: settle(s) }
}

// ---------- Build study plan: topological ----------

const listOrEmpty = (codes: string[]) => (codes.length ? codes.join(', ') : 'empty')

export function runPlanTopological(state: StudyPlanState): OperationResult<StudyPlanSnapshot> {
  const rec = new StepRecorder()
  const s = settle(state)
  s.focus = 'graph'
  const V = s.codes.length
  const adj: number[][] = Array.from({ length: V }, () => [])
  for (const e of s.graph.edges) adj[Number(e.from)].push(Number(e.to))
  for (const list of adj) list.sort((a, b) => a - b)

  const marked = new Array<boolean>(V).fill(false)
  const onStack = new Array<boolean>(V).fill(false)
  const postorder: string[] = []
  const vars = () => ({ postorder: listOrEmpty(postorder) })
  const vertex = (v: number) => s.graph.vertices[v]
  const edge = (v: number, w: number) => s.graph.edges.find((e) => e.from === String(v) && e.to === String(w))!
  let cycle = false

  const dfs = (v: number) => {
    marked[v] = true
    onStack[v] = true
    vertex(v).state = 'visiting'
    rec.push(s, 6, `Visiting ${s.codes[v]}.`, vars())
    for (const w of adj[v]) {
      const e = edge(v, w)
      if (e.state !== 'tree') e.state = 'active'
      rec.push(s, 7, `${s.codes[w]} lists ${s.codes[v]} as a prerequisite.`, vars())
      if (onStack[w]) {
        rec.push(s, 8, `${s.codes[w]} is still on the call stack, so the prerequisites form a cycle and no study plan exists.`, vars())
        cycle = true
        return
      }
      if (marked[w]) {
        rec.push(s, 9, `${s.codes[w]} is already marked, so skip it.`, vars())
        e.state = 'default'
      } else {
        e.state = 'tree'
        rec.push(s, 9, `${s.codes[w]} is unmarked, so visit ${s.codes[w]} next.`, vars())
        dfs(w)
        if (cycle) return
      }
    }
    onStack[v] = false
    vertex(v).state = 'visited'
    postorder.push(s.codes[v])
    rec.push(s, 10, `Finished ${s.codes[v]}: it joins the postorder.`, vars())
  }

  for (let v = 0; v < V && !cycle; v++) {
    if (marked[v]) continue
    rec.push(s, 3, `${s.codes[v]} is unmarked, so start a DFS from ${s.codes[v]}.`, vars())
    dfs(v)
  }
  if (!cycle) {
    const order = [...postorder].reverse()
    s.focus = 'plan'
    s.plan = { order, late: [] }
    rec.push(s, 4, `Study plan: ${listOrEmpty(order)}.`, vars())
  }
  return { steps: rec.steps, finalSnapshot: settle(s) }
}

// ---------- Build study plan: alphabetical ----------

export function runPlanAlphabetical(state: StudyPlanState): OperationResult<StudyPlanSnapshot> {
  const rec = new StepRecorder()
  const s = settle(state)
  const order = [...s.codes].sort()
  const position = new Map(order.map((c, i) => [c, i]))
  s.focus = 'plan'
  s.plan = { order, late: [] }
  let violations = 0
  rec.push(s, 2, `Sorting the codes from A to Z gives ${listOrEmpty(order)}.`, { violations })
  for (const e of s.graph.edges) {
    const v = s.codes[Number(e.from)]
    const w = s.codes[Number(e.to)]
    if (position.get(w)! < position.get(v)!) {
      violations += 1
      e.state = 'active'
      if (!s.plan.late.includes(w)) s.plan.late.push(w)
      rec.push(s, 4, `${w} comes before its prerequisite ${v}: violation ${violations}.`, { violations })
    } else {
      e.state = 'tree'
      rec.push(s, 3, `${v} comes before ${w}, so this prerequisite holds.`, { violations })
    }
  }
  rec.push(
    s,
    5,
    violations === 0 ? 'The alphabetical plan breaks no prerequisites.' : `The alphabetical plan breaks ${plural(violations, 'prerequisite')}.`,
    { violations },
  )
  return { steps: rec.steps, finalSnapshot: settle(s) }
}

// ---------- registry ----------

export const studyPlanOperations: OperationDefinition<StudyPlanState, unknown, StudyPlanSnapshot>[] = [
  { id: 'add-course', label: 'Add course', inputKind: 'text', placeholder: 'Course code, e.g. PR3', run: (s, t) => runAddCourse(s, t as string) },
  { id: 'add-prereq', label: 'Add prerequisite', inputKind: 'text', placeholder: 'e.g. PR1 before PR2', run: (s, t) => runAddPrerequisite(s, t as string) },
  { id: 'plan-topological', label: 'Build study plan', inputKind: 'none', variants: ['topological'], run: (s) => runPlanTopological(s) },
  { id: 'plan-alphabetical', label: 'Build study plan', inputKind: 'none', variants: ['alphabetical'], run: (s) => runPlanAlphabetical(s) },
]
