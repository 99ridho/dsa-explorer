// SPEC.md §10.6: operations. Every step carries the array's length and byte cost as badges.
import type { OperationDefinition, OperationResult, Step } from '@/types/step-engine'
import { HEADER_BYTES, INT_BYTES, MAX_SLOTS, type ArraysHighlightKind, type ArraysSnapshot, type ArraysState } from './types'

export const bytesOf = (n: number) => HEADER_BYTES + INT_BYTES * n

export function cloneSnapshot(s: ArraysSnapshot): ArraysSnapshot {
  return { values: [...s.values], ...(s.resizing ? { resizing: { values: [...s.resizing.values], copied: s.resizing.copied } } : {}) }
}

class StepRecorder {
  readonly steps: Step<ArraysSnapshot>[] = []
  push(base: ArraysSnapshot, highlightLine: number, description: string, indices: number[] = [], kind: ArraysHighlightKind = 'read') {
    const snapshot = cloneSnapshot(base)
    if (indices.length > 0) snapshot.highlight = { indices, kind }
    this.steps.push({
      id: this.steps.length,
      description,
      highlightLine,
      snapshot,
      variables: { length: base.values.length, bytes: bytesOf(base.values.length) },
    })
  }
}

export const buildArray = (values: number[]): ArraysSnapshot => ({ values: [...values] })
const all = (a: number[]) => a.map((_, i) => i)

export function runCreate(state: ArraysState, values: number[]): OperationResult<ArraysSnapshot> {
  const rec = new StepRecorder()
  const N = values.length
  if (N > MAX_SLOTS) {
    const s = cloneSnapshot(state)
    rec.push(s, 2, `This demo shows at most ${MAX_SLOTS} slots, and ${N} were entered, so nothing changes.`)
    return { steps: rec.steps, finalSnapshot: s }
  }
  const s = buildArray(values.map(() => 0))
  rec.push(s, 2, `Creating an int array of length ${N}: every slot starts at 0.`)
  s.values = [...values]
  rec.push(s, 3, `Filling the slots from the list: ${values.join(', ')}.`, all(s.values), 'write')
  return { steps: rec.steps, finalSnapshot: cloneSnapshot(s) }
}

/** Line 2 of ACCESS and SET: the bounds check. Returns false when the program would stop. */
function checkBounds(rec: StepRecorder, s: ArraysSnapshot, i: number): boolean {
  const N = s.values.length
  if (i < 0 || i >= N) {
    rec.push(s, 2, `Index ${i} is outside 0 to ${N - 1}, so the program stops with an out-of-bounds error.`, all(s.values), 'error')
    return false
  }
  rec.push(s, 2, `Index ${i} is inside 0 to ${N - 1}, so the access is safe.`, [i], 'read')
  return true
}

export function runAccess(state: ArraysState, i: number): OperationResult<ArraysSnapshot> {
  const rec = new StepRecorder()
  const s = cloneSnapshot(state)
  if (checkBounds(rec, s, i)) rec.push(s, 3, `a[${i}] holds ${s.values[i]}.`, [i], 'read')
  return { steps: rec.steps, finalSnapshot: s }
}

export function runSet(state: ArraysState, input: number[]): OperationResult<ArraysSnapshot> {
  const rec = new StepRecorder()
  const s = cloneSnapshot(state)
  if (input.length !== 2) {
    rec.push(s, 1, `Set needs two numbers, an index and a value, and ${input.length} ${input.length === 1 ? 'was' : 'were'} entered, so nothing changes.`)
    return { steps: rec.steps, finalSnapshot: s }
  }
  const [i, v] = input
  if (checkBounds(rec, s, i)) {
    const old = s.values[i]
    s.values[i] = v
    rec.push(s, 3, `Writing ${v} into a[${i}], replacing ${old}.`, [i], 'write')
  }
  return { steps: rec.steps, finalSnapshot: s }
}

export function runResize(state: ArraysState): OperationResult<ArraysSnapshot> {
  const rec = new StepRecorder()
  const s = cloneSnapshot(state)
  const N = s.values.length
  if (2 * N > MAX_SLOTS) {
    rec.push(s, 2, `Doubling would need ${2 * N} slots and this demo shows at most ${MAX_SLOTS}, so nothing changes.`)
    return { steps: rec.steps, finalSnapshot: s }
  }
  s.resizing = { values: Array.from({ length: 2 * N }, () => 0), copied: 0 }
  rec.push(s, 2, `Creating a new array of length ${2 * N}: every slot starts at 0.`)
  for (let i = 0; i < N; i++) {
    s.resizing.values[i] = s.values[i]
    s.resizing.copied = i + 1
    rec.push(s, 3, `Copying a[${i}] = ${s.values[i]} into the new array.`, [i], 'copy')
  }
  s.values = s.resizing.values
  delete s.resizing
  rec.push(s, 4, `The new array replaces the old one, so a has ${2 * N} slots and the old array can be reclaimed.`)
  return { steps: rec.steps, finalSnapshot: s }
}

export function runMemory(state: ArraysState): OperationResult<ArraysSnapshot> {
  const rec = new StepRecorder()
  const s = cloneSnapshot(state)
  const N = s.values.length
  rec.push(s, 2, 'An int array carries a 24-byte header: 16 bytes of object overhead, 4 bytes for the length, and 4 bytes of padding.')
  rec.push(s, 3, `The ${N} ints take 4 bytes each, so int[${N}] costs 24 + 4 * ${N} = ${bytesOf(N)} bytes.`, all(s.values), 'read')
  return { steps: rec.steps, finalSnapshot: s }
}

export const arraysOperations: OperationDefinition<ArraysState, unknown, ArraysSnapshot>[] = [
  { id: 'create', label: 'Create from list', inputKind: 'array', placeholder: 'e.g. 5, 3, 8, 1', run: (s, v) => runCreate(s, v as number[]) },
  { id: 'access', label: 'Access a[i]', inputKind: 'key', placeholder: 'Index, e.g. 2', run: (s, i) => runAccess(s, i as number) },
  { id: 'set', label: 'Set a[i] = v', inputKind: 'array', placeholder: 'index, value, e.g. 2, 7', run: (s, v) => runSet(s, v as number[]) },
  { id: 'resize', label: 'Resize to double', inputKind: 'none', run: (s) => runResize(s) },
  { id: 'memory', label: 'Memory cost', inputKind: 'none', run: (s) => runMemory(s) },
]
