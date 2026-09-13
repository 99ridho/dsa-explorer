// SPEC.md §10.2: operations. Each `run()` emits exactly the steps in the spec's step tables.
// Written for a max-heap; `mode: "min"` flips every comparison and every narration word.
import type { OperationDefinition, OperationResult, Step } from '@/types/step-engine'
import type { HeapMode, HeapSnapshot, HeapState } from './types'

type Highlight = NonNullable<HeapSnapshot['highlight']>

// ---------- helpers ----------

function clone(s: HeapSnapshot): HeapSnapshot {
  return { array: [...s.array], n: s.n, mode: s.mode }
}

/** True when `a` should sit above `b` in this heap (max: a > b, min: a < b). */
const above = (a: number, b: number, mode: HeapMode) => (mode === 'max' ? a > b : a < b)

const words = (mode: HeapMode) =>
  mode === 'max'
    ? { swimCmp: 'larger', sinkCmp: 'smaller', pick: 'larger' }
    : { swimCmp: 'smaller', sinkCmp: 'larger', pick: 'smaller' }

function swap(a: number[], i: number, j: number) {
  const t = a[i]
  a[i] = a[j]
  a[j] = t
}

class StepRecorder {
  readonly steps: Step<HeapSnapshot>[] = []
  push(base: HeapSnapshot, highlightLine: number, description: string, highlight?: Highlight, variables?: Step<HeapSnapshot>['variables']) {
    const snapshot = clone(base)
    if (highlight) snapshot.highlight = { indices: [...highlight.indices], kind: highlight.kind }
    this.steps.push({ id: this.steps.length, description, highlightLine, snapshot, ...(variables ? { variables } : {}) })
  }
}

/** Step-free heap construction, shared by createInitialState and randomize. */
export function buildHeap(values: number[], mode: HeapMode): HeapSnapshot {
  const array = [0, ...values]
  const n = values.length
  for (let k = Math.floor(n / 2); k >= 1; k--) sinkSilently(array, n, k, mode)
  return { array, n, mode }
}

function sinkSilently(a: number[], n: number, k: number, mode: HeapMode) {
  while (2 * k <= n) {
    let j = 2 * k
    if (j < n && above(a[j + 1], a[j], mode)) j++
    if (!above(a[j], a[k], mode)) break
    swap(a, k, j)
    k = j
  }
}

// ---------- swim / sink with steps ----------

/** Lines are passed in because the same SINK appears at different offsets in each listing. */
interface SinkLines {
  compare: number
  swap: number
  stop: number
}

function swimWithSteps(rec: StepRecorder, s: HeapSnapshot, k: number, lines: { compare: number; swap: number }) {
  const w = words(s.mode)
  while (k > 1) {
    const parent = Math.floor(k / 2)
    rec.push(s, lines.compare, `Comparing ${s.array[k]} with its parent ${s.array[parent]}.`, { indices: [k, parent], kind: 'comparing' })
    if (!above(s.array[k], s.array[parent], s.mode)) break
    swap(s.array, k, parent)
    rec.push(s, lines.swap, `${s.array[parent]} is ${w.swimCmp} than its parent, so it swims up.`, { indices: [k, parent], kind: 'swapping' })
    k = parent
  }
  rec.push(s, lines.compare, 'Heap order restored.')
}

function sinkWithSteps(rec: StepRecorder, s: HeapSnapshot, k: number, lines: SinkLines) {
  const w = words(s.mode)
  const a = s.array
  while (2 * k <= s.n) {
    let j = 2 * k
    if (j < s.n) {
      rec.push(s, lines.compare, `Comparing the children at ${j} and ${j + 1}.`, { indices: [j, j + 1], kind: 'comparing' })
      if (above(a[j + 1], a[j], s.mode)) j++
    } else {
      rec.push(s, lines.compare, `Only one child, at ${j}.`, { indices: [j], kind: 'comparing' })
    }
    if (!above(a[j], a[k], s.mode)) break
    const moving = a[k]
    swap(a, k, j)
    rec.push(s, lines.swap, `${moving} is ${w.sinkCmp} than its child ${a[k]}, so it sinks down.`, { indices: [k, j], kind: 'swapping' })
    k = j
  }
  rec.push(s, lines.stop, 'Heap order restored.')
}

// ---------- Insert ----------

export function runInsert(state: HeapState, value: number): OperationResult<HeapSnapshot> {
  const rec = new StepRecorder()
  const s = clone(state)
  s.array.length = s.n + 1 // drop anything left outside the heap by an earlier removal
  s.n += 1
  s.array[s.n] = value
  rec.push(s, 3, `Placing ${value} at the end of the heap (index ${s.n}).`, { indices: [s.n], kind: 'comparing' })
  swimWithSteps(rec, s, s.n, { compare: 6, swap: 7 })
  return { steps: rec.steps, finalSnapshot: clone(s) }
}

// ---------- Remove max / min ----------

export function runRemoveExtreme(state: HeapState): OperationResult<HeapSnapshot> {
  const rec = new StepRecorder()
  const s = clone(state)
  if (s.n === 0) {
    rec.push(s, 2, 'The heap is empty, so there is nothing to remove.')
    return { steps: rec.steps, finalSnapshot: clone(s) }
  }
  const extreme = s.array[1]
  const last = s.array[s.n]
  swap(s.array, 1, s.n)
  s.n -= 1
  rec.push(s, 2, `Removing ${extreme} from the root. Moving the last element ${last} to the top.`, { indices: [1, s.n + 1], kind: 'swapping' })
  sinkWithSteps(rec, s, 1, { compare: 10, swap: 12, stop: 11 })
  s.array.length = s.n + 1
  return { steps: rec.steps, finalSnapshot: clone(s) }
}

// ---------- Build heap ----------

export function runBuildHeap(state: HeapState, values: number[]): OperationResult<HeapSnapshot> {
  const rec = new StepRecorder()
  const s: HeapSnapshot = { array: [0, ...values], n: values.length, mode: state.mode }
  rec.push(s, 2, `Building a heap from ${values.join(', ')}.`)
  for (let k = Math.floor(s.n / 2); k >= 1; k--) {
    rec.push(s, 4, `Sinking index ${k}.`, { indices: [k], kind: 'comparing' })
    sinkWithSteps(rec, s, k, { compare: 8, swap: 10, stop: 9 })
  }
  return { steps: rec.steps, finalSnapshot: clone(s) }
}

// ---------- Heapsort ----------

export function runHeapsort(state: HeapState): OperationResult<HeapSnapshot> {
  const rec = new StepRecorder()
  const values = state.array.slice(1, state.n + 1)
  const s: HeapSnapshot = { array: [0, ...values], n: values.length, mode: state.mode }
  if (s.n === 0) {
    rec.push(s, 2, 'The heap is empty, so there is nothing to sort.')
    return { steps: rec.steps, finalSnapshot: clone(s) }
  }
  // Build phase: the same sweep as Build-heap, all highlighted on line 2.
  rec.push(s, 2, `Building a heap from ${values.join(', ')}.`)
  for (let k = Math.floor(s.n / 2); k >= 1; k--) {
    rec.push(s, 2, `Sinking index ${k}.`, { indices: [k], kind: 'comparing' })
    sinkWithSteps(rec, s, k, { compare: 2, swap: 2, stop: 2 })
  }
  while (s.n > 1) {
    const root = s.array[1]
    swap(s.array, 1, s.n)
    rec.push(s, 4, `Swapping the root ${root} with index ${s.n}.`, { indices: [1, s.n], kind: 'swapping' })
    rec.push(s, 5, `${s.array[s.n]} is in its final position.`, { indices: [s.n], kind: 'sorted' })
    s.n -= 1
    sinkWithSteps(rec, s, 1, { compare: 10, swap: 12, stop: 11 })
  }
  s.n = 0
  rec.push(s, 3, 'Every element is in place. The array is sorted.')
  return { steps: rec.steps, finalSnapshot: clone(s) }
}

// ---------- registry ----------

export const heapOperations: OperationDefinition<HeapState, unknown, HeapSnapshot>[] = [
  { id: 'insert', label: 'Insert', inputKind: 'key', run: (s, v) => runInsert(s, v as number) },
  { id: 'remove-max', label: 'Remove max', inputKind: 'none', variants: ['max'], run: (s) => runRemoveExtreme(s) },
  { id: 'remove-min', label: 'Remove min', inputKind: 'none', variants: ['min'], run: (s) => runRemoveExtreme(s) },
  { id: 'build-heap', label: 'Build heap', inputKind: 'array', run: (s, a) => runBuildHeap(s, a as number[]) },
  { id: 'heapsort', label: 'Heapsort', inputKind: 'none', run: (s) => runHeapsort(s) },
]
