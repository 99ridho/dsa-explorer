// SPEC.md §10.9: operations. Each `run()` emits exactly the steps in the spec's
// step tables, in order, with the listed `highlightLine`.
import type { OperationDefinition, OperationResult, Step } from '@/types/step-engine'
import { MAX_ITEMS, MIN_ITEMS, type SortingHighlightKind, type SortingSnapshot, type SortingState } from './types'

export function cloneSnapshot(s: SortingSnapshot): SortingSnapshot {
  return { array: [...s.array], ...(s.sortedUpTo !== undefined ? { sortedUpTo: s.sortedUpTo } : {}) }
}

/** Counts compares and exchanges, the sorting cost model, and puts them on every step. */
class SortRecorder {
  readonly steps: Step<SortingSnapshot>[] = []
  compares = 0
  exchanges = 0
  h?: number

  push(base: SortingSnapshot, highlightLine: number, description: string, indices: number[] = [], kind: SortingHighlightKind = 'comparing') {
    const snapshot = cloneSnapshot(base)
    if (indices.length > 0) snapshot.highlight = { indices, kind }
    const variables: Step<SortingSnapshot>['variables'] = { compares: this.compares, exchanges: this.exchanges }
    if (this.h !== undefined) variables.gap = this.h
    this.steps.push({ id: this.steps.length, description, highlightLine, snapshot, variables })
  }
}

export const buildArray = (values: number[]): SortingSnapshot => ({ array: [...values] })

const all = (a: number[]) => a.map((_, i) => i)

function exch(a: number[], i: number, j: number) {
  const t = a[i]
  a[i] = a[j]
  a[j] = t
}

export function runLoad(state: SortingState, values: number[]): OperationResult<SortingSnapshot> {
  const steps: Step<SortingSnapshot>[] = []
  if (values.length < MIN_ITEMS || values.length > MAX_ITEMS) {
    steps.push({
      id: 0,
      description: `This demo sorts ${MIN_ITEMS} to ${MAX_ITEMS} items, and ${values.length} were entered, so nothing changes.`,
      highlightLine: 2,
      snapshot: cloneSnapshot(state),
    })
    return { steps, finalSnapshot: cloneSnapshot(state) }
  }
  const next = buildArray(values)
  steps.push({ id: 0, description: `Loading ${values.join(', ')}: ${values.length} items to sort.`, highlightLine: 2, snapshot: cloneSnapshot(next) })
  return { steps, finalSnapshot: next }
}

export function runSelectionSort(state: SortingState): OperationResult<SortingSnapshot> {
  const rec = new SortRecorder()
  const s = buildArray(state.array)
  const a = s.array
  const N = a.length

  for (let i = 0; i < N; i++) {
    let min = i
    s.sortedUpTo = i
    rec.push(s, 3, `Pass ${i}: the smallest item so far is items[${i}] = ${a[i]}.`, [i], 'marked')
    for (let j = i + 1; j < N; j++) {
      rec.compares += 1
      const head = `Comparing items[${j}] = ${a[j]} with the minimum items[${min}] = ${a[min]}`
      if (a[j] < a[min]) {
        min = j
        rec.push(s, 5, `${head}: ${a[j]} is smaller, so minIndex becomes ${j}.`, [j], 'marked')
      } else {
        rec.push(s, 5, `${head}: ${a[min]} is smaller, so minIndex stays ${min}.`, [j, min], 'comparing')
      }
    }
    rec.exchanges += 1
    if (min !== i) {
      const v = a[i]
      const m = a[min]
      exch(a, i, min)
      s.sortedUpTo = i + 1
      rec.push(s, 6, `Exchanging items[${i}] = ${v} with items[${min}] = ${m}, so ${m} is in its final position.`, [i, min], 'exchanging')
    } else {
      s.sortedUpTo = i + 1
      rec.push(s, 6, `items[${i}] = ${a[i]} is already the minimum, so exchanging it with itself changes nothing.`, [i], 'sorted')
    }
  }
  s.sortedUpTo = N
  rec.push(s, 2, `Every item is in place: ${rec.compares} compares and ${rec.exchanges} exchanges.`, all(a), 'sorted')
  return { steps: rec.steps, finalSnapshot: buildArray(a) }
}

export function runInsertionSort(state: SortingState): OperationResult<SortingSnapshot> {
  const rec = new SortRecorder()
  const s = buildArray(state.array)
  const a = s.array
  const N = a.length
  s.sortedUpTo = 1

  for (let i = 1; i < N; i++) {
    const v = a[i]
    rec.push(s, 2, `Taking items[${i}] = ${v} and inserting it among the ${i} sorted items to its left.`, [i], 'marked')
    let j = i
    for (; j >= 1; j--) {
      rec.compares += 1
      if (a[j] < a[j - 1]) {
        const x = a[j]
        const y = a[j - 1]
        exch(a, j, j - 1)
        rec.exchanges += 1
        rec.push(s, 4, `items[${j}] = ${x} is smaller than items[${j - 1}] = ${y}, so exchange them.`, [j, j - 1], 'exchanging')
      } else {
        s.sortedUpTo = i + 1
        rec.push(s, 5, `items[${j}] = ${a[j]} is not smaller than items[${j - 1}] = ${a[j - 1]}, so it stays: items[0..${i}] is sorted.`, [j, j - 1], 'comparing')
        break
      }
    }
    if (j === 0) {
      s.sortedUpTo = i + 1
      rec.push(s, 3, `${v} reached index 0, so items[0..${i}] is sorted.`)
    }
  }
  s.sortedUpTo = N
  rec.push(s, 2, `Every item is in place: ${rec.compares} compares and ${rec.exchanges} exchanges.`, all(a), 'sorted')
  return { steps: rec.steps, finalSnapshot: buildArray(a) }
}

export function runShellsort(state: SortingState): OperationResult<SortingSnapshot> {
  const rec = new SortRecorder()
  const s = buildArray(state.array)
  const a = s.array
  const N = a.length

  let h = 1
  while (h < N / 3) h = 3 * h + 1
  rec.h = h
  rec.push(s, 3, `N = ${N}, so the gap sequence starts at gap = ${h}.`)

  while (h >= 1) {
    rec.push(s, 4, `Sorting with gap = ${h}: items ${h} apart form one subsequence.`)
    for (let i = h; i < N; i++) {
      const group: number[] = []
      for (let k = i; k >= 0; k -= h) group.push(k)
      rec.push(s, 5, `Taking items[${i}] = ${a[i]} and inserting it among the items ${h} apart to its left.`, group, 'marked')
      for (let j = i; j >= h; j -= h) {
        rec.compares += 1
        if (a[j] < a[j - h]) {
          const x = a[j]
          const y = a[j - h]
          exch(a, j, j - h)
          rec.exchanges += 1
          rec.push(s, 7, `items[${j}] = ${x} is smaller than items[${j - h}] = ${y}, ${h} positions to its left, so exchange them.`, [j, j - h], 'exchanging')
        } else {
          rec.push(s, 8, `items[${j}] = ${a[j]} is not smaller than items[${j - h}] = ${a[j - h]}, so it stays.`, [j, j - h], 'comparing')
          break
        }
      }
    }
    const old = h
    h = Math.floor(h / 3)
    rec.h = h
    rec.push(s, 9, `Items ${old} apart are in order, so gap becomes ${h}.`)
  }
  rec.push(s, 4, `gap is 0, so the array is sorted: ${rec.compares} compares and ${rec.exchanges} exchanges.`, all(a), 'sorted')
  return { steps: rec.steps, finalSnapshot: buildArray(a) }
}

export const sortingOperations: OperationDefinition<SortingState, unknown, SortingSnapshot>[] = [
  { id: 'load', label: 'Load array', inputKind: 'array', placeholder: 'e.g. 7, 3, 9, 1', run: (s, v) => runLoad(s, v as number[]) },
  { id: 'selection-sort', label: 'Selection sort', inputKind: 'none', run: (s) => runSelectionSort(s) },
  { id: 'insertion-sort', label: 'Insertion sort', inputKind: 'none', run: (s) => runInsertionSort(s) },
  { id: 'shellsort', label: 'Shellsort', inputKind: 'none', run: (s) => runShellsort(s) },
]
