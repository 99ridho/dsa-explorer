// SPEC.md §10.5: operations. Counts are exact for the brute-force loops, never measured.
import type { OperationDefinition, OperationResult, Step } from '@/types/step-engine'
import { MAX_N, ROUNDS, type ComplexitySnapshot, type ComplexityState, type CountRow, type Problem } from './types'

export const PROBLEM: Record<Problem, { line: number; unit: string; units: string; expected: number; growth: string }> = {
  '1-sum': { line: 8, unit: 'item', units: 'items', expected: 2, growth: 'N' },
  '2-sum': { line: 9, unit: 'pair', units: 'pairs', expected: 4, growth: 'N²' },
  '3-sum': { line: 10, unit: 'triple', units: 'triples', expected: 8, growth: 'N³' },
}

/** How many items, pairs, or triples the brute-force loop examines. */
export function checks(problem: Problem, n: number): number {
  if (problem === '1-sum') return n
  if (problem === '2-sum') return (n * (n - 1)) / 2
  return (n * (n - 1) * (n - 2)) / 6
}

/** Array accesses: one per item, two per pair, three per triple. */
export function accesses(problem: Problem, n: number): number {
  const per = problem === '1-sum' ? 1 : problem === '2-sum' ? 2 : 3
  return checks(problem, n) * per
}

const fmt = (x: number) => x.toLocaleString('en-US')

export function cloneSnapshot(s: ComplexitySnapshot): ComplexitySnapshot {
  return { problem: s.problem, startN: s.startN, rows: s.rows.map((r) => ({ ...r })) }
}

/** Rows for six doublings from `startN`, ratios filled in: the silent seed and Randomize state. */
export function buildRows(problem: Problem, startN: number): ComplexitySnapshot {
  const rows: CountRow[] = []
  let prev = 0
  for (let r = 0, n = startN; r < ROUNDS; r++, n *= 2) {
    const a = accesses(problem, n)
    rows.push({ n, accesses: a, ratio: prev ? a / prev : null })
    prev = a
  }
  return { problem, startN, rows }
}

class StepRecorder {
  readonly steps: Step<ComplexitySnapshot>[] = []
  push(base: ComplexitySnapshot, highlightLine: number, description: string, highlight?: number, variables?: Step<ComplexitySnapshot>['variables']) {
    const snapshot = cloneSnapshot(base)
    if (highlight !== undefined) snapshot.highlight = highlight
    this.steps.push({ id: this.steps.length, description, highlightLine, snapshot, ...(variables ? { variables } : {}) })
  }
}

function countStep(rec: StepRecorder, s: ComplexitySnapshot, row: number) {
  const { n, accesses: a } = s.rows[row]
  const p = PROBLEM[s.problem]
  const c = checks(s.problem, n)
  rec.push(s, p.line, `N = ${fmt(n)}: brute-force ${s.problem} checks ${fmt(c)} ${c === 1 ? p.unit : p.units}, so it makes ${fmt(a)} array accesses.`, row, { N: n, accesses: a })
}

function ratioStep(rec: StepRecorder, s: ComplexitySnapshot, row: number, prev: number) {
  const { accesses: a, ratio } = s.rows[row]
  rec.push(s, 5, `${fmt(a)} / ${fmt(prev)} = ${ratio!.toFixed(2)}, so doubling N multiplied the accesses by about ${ratio!.toFixed(1)}.`, row, { ratio: ratio!.toFixed(2) })
}

export function runDoublingRatio(state: ComplexityState): OperationResult<ComplexitySnapshot> {
  const rec = new StepRecorder()
  const s: ComplexitySnapshot = { problem: state.problem, startN: state.startN, rows: [] }
  let prev = 0
  for (let r = 0, n = s.startN; r < ROUNDS; r++, n *= 2) {
    const a = accesses(s.problem, n)
    s.rows.push({ n, accesses: a, ratio: prev ? a / prev : null })
    countStep(rec, s, r)
    if (prev) ratioStep(rec, s, r, prev)
    prev = a
  }
  const p = PROBLEM[s.problem]
  rec.push(s, 3, `The ratio settles toward ${p.expected}, so the order of growth of ${s.problem} is ${p.growth}.`)
  return { steps: rec.steps, finalSnapshot: cloneSnapshot(s) }
}

export function runCountAccesses(state: ComplexityState, n: number): OperationResult<ComplexitySnapshot> {
  const rec = new StepRecorder()
  const s = cloneSnapshot(state)
  if (n < 1) {
    rec.push(s, 7, `N = ${n} is below 1, so there is nothing to count.`)
    return { steps: rec.steps, finalSnapshot: s }
  }
  if (n > MAX_N) {
    rec.push(s, 7, `N is capped at ${fmt(MAX_N)} in this demo, so nothing changes.`)
    return { steps: rec.steps, finalSnapshot: s }
  }
  const half = s.rows.find((r) => r.n * 2 === n)
  const a = accesses(s.problem, n)
  const row: CountRow = { n, accesses: a, ratio: half ? a / half.accesses : null }
  s.rows = [...s.rows.filter((r) => r.n !== n), row].sort((x, y) => x.n - y.n)
  const index = s.rows.findIndex((r) => r.n === n)
  countStep(rec, s, index)
  if (half) ratioStep(rec, s, index, half.accesses)
  return { steps: rec.steps, finalSnapshot: cloneSnapshot(s) }
}

export const complexityOperations: OperationDefinition<ComplexityState, unknown, ComplexitySnapshot>[] = [
  { id: 'doubling-ratio', label: 'Doubling ratio test', inputKind: 'none', run: (s) => runDoublingRatio(s) },
  { id: 'count-accesses', label: 'Count accesses for N', inputKind: 'key', placeholder: 'N, e.g. 16', run: (s, n) => runCountAccesses(s, n as number) },
]
