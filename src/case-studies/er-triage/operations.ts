// SPEC.md §19.2: operations. Each `run()` emits exactly the steps in the step tables. Archive
// lookups reuse the B-tree topic's get and put, so their narration is the §10.12 narration.
import type { OperationDefinition, OperationResult, Step } from '@/types/step-engine'
import { plural } from '@/lib/linked-nodes'
import { buildTree, runGet, runPut } from '@/topics/b-tree/operations'
import type { BTreeSnapshot } from '@/topics/b-tree/types'
import { FIRST_ARRIVAL, MAX_WAITING, type Patient, type TriageMode, type TriageSnapshot, type TriageState } from './types'

type Vars = Step<TriageSnapshot>['variables']
type Highlight = NonNullable<TriageSnapshot['highlight']>

/** Higher severity first; on a tie, the earlier arrival. */
export const moreUrgent = (a: Patient, b: Patient) => a.severity > b.severity || (a.severity === b.severity && a.arrival < b.arrival)

const tag = (p: Patient) => `#${p.arrival}`
const tagSev = (p: Patient) => `#${p.arrival} (severity ${p.severity})`
const tagFull = (p: Patient) => `#${p.arrival} (severity ${p.severity}, record ${p.record})`

/** "A outranks B" as a sentence, naming the key that decided it: severity, or arrival on a tie. */
function outranks(a: Patient, b: Patient, consequence: string): string {
  return a.severity !== b.severity
    ? `${tagSev(a)} is more urgent than ${tagSev(b)}, so ${consequence}.`
    : `${tag(a)} and ${tag(b)} both have severity ${a.severity}, and ${tag(a)} arrived earlier, so ${consequence}.`
}

// ---------- snapshot helpers ----------

function clone(s: TriageSnapshot): TriageSnapshot {
  return {
    mode: s.mode,
    focus: s.focus,
    waiting: s.waiting.map((p) => ({ ...p })),
    archive: s.archive, // B-tree snapshots are never mutated in place; get and put return fresh ones
    nextArrival: s.nextArrival,
    treated: s.treated,
    bypassed: s.bypassed,
    ...(s.highlight ? { highlight: { positions: [...s.highlight.positions], kind: s.highlight.kind } } : {}),
  }
}

function settle(s: TriageSnapshot): TriageSnapshot {
  const c = clone(s)
  c.focus = 'triage'
  delete c.highlight
  return c
}

class StepRecorder {
  readonly steps: Step<TriageSnapshot>[] = []
  push(base: TriageSnapshot, highlightLine: number, description: string, highlight?: Highlight, variables?: Vars) {
    const snapshot = clone(base)
    if (highlight) snapshot.highlight = { positions: [...highlight.positions], kind: highlight.kind }
    else delete snapshot.highlight
    this.steps.push({ id: this.steps.length, description, highlightLine, snapshot, ...(variables ? { variables } : {}) })
  }
  /** Replays B-tree steps inside the triage snapshot, on the given line. */
  lift(base: TriageSnapshot, steps: Step<BTreeSnapshot>[], line: (btreeLine: number) => number) {
    for (const step of steps) {
      const snapshot = clone(base)
      snapshot.focus = 'archive'
      snapshot.archive = step.snapshot
      delete snapshot.highlight
      this.steps.push({
        id: this.steps.length,
        description: step.description,
        highlightLine: line(step.highlightLine),
        snapshot,
        variables: { 'block reads': step.variables?.probes ?? 0 },
      })
    }
  }
}

// ---------- heap helpers (1-indexed positions over a 0-indexed array) ----------

const at = (s: TriageSnapshot, k: number) => s.waiting[k - 1]
function exchange(s: TriageSnapshot, i: number, j: number) {
  const t = s.waiting[i - 1]
  s.waiting[i - 1] = s.waiting[j - 1]
  s.waiting[j - 1] = t
}

function insertSilently(waiting: Patient[], p: Patient) {
  waiting.push(p)
  let k = waiting.length
  while (k > 1 && moreUrgent(waiting[k - 1], waiting[Math.floor(k / 2) - 1])) {
    const parent = Math.floor(k / 2)
    ;[waiting[k - 1], waiting[parent - 1]] = [waiting[parent - 1], waiting[k - 1]]
    k = parent
  }
}

// ---------- step-free construction, shared by createInitialState and randomize ----------

/** Every key lives in a leaf (algs4 BTree keeps copies as guide keys above), so scanning the leaves is enough. */
export const hasRecord = (archive: BTreeSnapshot, record: number) =>
  Object.values(archive.nodes).some((node) => node.external && node.entries.some((e) => e.key === record))

/** The archive holds exactly the records of the patients admitted, so the seed's records match its waiting list. */
export function buildTriage(mode: TriageMode, admissions: [number, number][]): TriageSnapshot {
  let archive = buildTree([])
  const waiting: Patient[] = []
  let arrival = FIRST_ARRIVAL
  for (const [severity, record] of admissions) {
    if (!hasRecord(archive, record)) archive = runPut(archive, record).finalSnapshot
    const p = { arrival: arrival++, severity, record }
    if (mode === 'priority') insertSilently(waiting, p)
    else waiting.push(p)
  }
  return { mode, focus: 'triage', waiting, archive, nextArrival: arrival, treated: 0, bypassed: 0 }
}

// ---------- Admit ----------

function runAdmit(state: TriageState, input: number[], mode: TriageMode): OperationResult<TriageSnapshot> {
  const rec = new StepRecorder()
  const s = settle(state)
  s.mode = mode
  const [severity, record] = input
  if (input.length !== 2 || severity < 1 || severity > 5 || record < 1 || record > 999) {
    rec.push(s, 1, 'Enter a severity from 1 to 5 and a record number, such as 5, 50.')
    return { steps: rec.steps, finalSnapshot: settle(s) }
  }
  if (s.waiting.length >= MAX_WAITING) {
    rec.push(s, 1, `${MAX_WAITING} patients are already waiting, so treat someone first.`)
    return { steps: rec.steps, finalSnapshot: settle(s) }
  }
  const holder = s.waiting.find((w) => w.record === record)
  if (holder) {
    rec.push(s, 1, `Record ${record} belongs to ${tag(holder)}, who is still waiting.`, {
      positions: [mode === 'priority' ? s.waiting.indexOf(holder) + 1 : s.waiting.indexOf(holder)],
      kind: 'treat',
    })
    return { steps: rec.steps, finalSnapshot: settle(s) }
  }

  rec.lift(s, runGet(s.archive, record).steps, () => 2)
  if (!hasRecord(s.archive, record)) {
    s.archive = runPut(s.archive, record).finalSnapshot
    s.focus = 'archive'
    rec.push(s, 2, `Record ${record} is new, so the desk adds it to the archive.`)
  }
  s.focus = 'triage'

  const p: Patient = { arrival: s.nextArrival, severity, record }
  s.nextArrival += 1
  s.waiting.push(p)
  let k = s.waiting.length

  if (mode === 'arrival') {
    rec.push(s, 4, `Patient ${tagFull(p)} joins the back of the queue at position ${k - 1}.`, { positions: [k - 1], kind: 'new' })
    return { steps: rec.steps, finalSnapshot: settle(s) }
  }

  rec.push(s, 4, `Patient ${tagFull(p)} takes position ${k} at the end of the heap.`, { positions: [k], kind: 'new' })
  while (k > 1) {
    const parent = Math.floor(k / 2)
    rec.push(s, 6, `Comparing ${tagSev(at(s, k))} with its parent ${tagSev(at(s, parent))}.`, { positions: [k, parent], kind: 'compare' })
    if (!moreUrgent(at(s, k), at(s, parent))) {
      rec.push(s, 6, `Heap order holds: ${tag(at(s, parent))} stays above ${tag(at(s, k))}.`)
      return { steps: rec.steps, finalSnapshot: settle(s) }
    }
    const above = at(s, parent)
    exchange(s, k, parent)
    rec.push(s, 7, `${tag(at(s, parent))} is more urgent than ${tag(above)}, so it swims up.`, { positions: [parent, k], kind: 'swap' })
    k = parent
  }
  rec.push(s, 6, `${tag(at(s, 1))} reaches the root: the next patient to treat.`, { positions: [1], kind: 'new' })
  return { steps: rec.steps, finalSnapshot: settle(s) }
}

// ---------- Treat next ----------

function runTreatPriority(state: TriageState): OperationResult<TriageSnapshot> {
  const rec = new StepRecorder()
  const s = settle(state)
  if (s.waiting.length === 0) {
    rec.push(s, 2, 'Nobody is waiting, so there is nobody to treat.')
    return { steps: rec.steps, finalSnapshot: settle(s) }
  }
  const root = at(s, 1)
  const vars = () => ({ bypassed: s.bypassed })
  // The first step shows the heap before anyone leaves, so stepping back reaches it.
  rec.push(s, 3, `${tagSev(root)} is at the root: the most urgent patient waiting.`, { positions: [1], kind: 'treat' }, vars())
  const last = s.waiting.pop()!
  s.treated += 1
  if (s.waiting.length === 0) {
    rec.push(s, 3, `Treating ${tagSev(root)}. Nobody else is waiting.`, undefined, vars())
    return { steps: rec.steps, finalSnapshot: settle(s) }
  }
  s.waiting[0] = last
  rec.push(s, 3, `Treating ${tagSev(root)}, the most urgent patient. ${tagSev(last)} moves to the root.`, { positions: [1], kind: 'new' }, vars())

  let k = 1
  const n = s.waiting.length
  while (2 * k <= n) {
    let j = 2 * k
    if (j < n) {
      const [left, right] = [at(s, j), at(s, j + 1)]
      const winner = moreUrgent(right, left) ? right : left
      const loser = winner === left ? right : left
      const why =
        left.severity !== right.severity
          ? `${tag(winner)} is more urgent, since ${winner.severity} > ${loser.severity}`
          : `both have severity ${left.severity}, so ${tag(winner)}, who arrived earlier, is more urgent`
      rec.push(s, 7, `Comparing the children ${tagSev(left)} and ${tagSev(right)}: ${why}.`, { positions: [j, j + 1], kind: 'compare' }, vars())
      if (winner === right) j += 1
    } else {
      rec.push(s, 7, `${tagSev(at(s, j))} is the only child.`, { positions: [j], kind: 'compare' }, vars())
    }
    if (!moreUrgent(at(s, j), at(s, k))) {
      rec.push(s, 8, outranks(at(s, k), at(s, j), 'heap order holds'), { positions: [k, j], kind: 'compare' }, vars())
      return { steps: rec.steps, finalSnapshot: settle(s) }
    }
    const sinking = at(s, k)
    exchange(s, k, j)
    rec.push(s, 9, outranks(at(s, k), sinking, `${tag(sinking)} sinks down`), { positions: [k, j], kind: 'swap' }, vars())
    k = j
  }
  rec.push(s, 6, `${tag(at(s, k))} has no children, so heap order holds.`, { positions: [k], kind: 'compare' }, vars())
  return { steps: rec.steps, finalSnapshot: settle(s) }
}

function runTreatArrival(state: TriageState): OperationResult<TriageSnapshot> {
  const rec = new StepRecorder()
  const s = settle(state)
  if (s.waiting.length === 0) {
    rec.push(s, 2, 'Nobody is waiting, so there is nobody to treat.')
    return { steps: rec.steps, finalSnapshot: settle(s) }
  }
  rec.push(s, 3, `${tagSev(s.waiting[0])} is at the front of the queue.`, { positions: [0], kind: 'treat' }, { bypassed: s.bypassed })
  const p = s.waiting.shift()!
  s.treated += 1
  rec.push(s, 3, `Treating ${tagSev(p)}, who arrived first.`, undefined, { bypassed: s.bypassed })
  let urgent = -1
  s.waiting.forEach((w, i) => {
    if (moreUrgent(w, p) && (urgent < 0 || moreUrgent(w, s.waiting[urgent]))) urgent = i
  })
  if (urgent < 0) {
    rec.push(s, 4, `Nobody still waiting is more urgent than ${tag(p)}.`, undefined, { bypassed: s.bypassed })
  } else {
    s.bypassed += 1
    const u = s.waiting[urgent]
    rec.push(s, 4, `${tagSev(u)} is more urgent and still waiting: bypassed is now ${s.bypassed}.`, { positions: [urgent], kind: 'treat' }, { bypassed: s.bypassed })
  }
  return { steps: rec.steps, finalSnapshot: settle(s) }
}

// ---------- Find record ----------

/** B-tree get lines: 7 descends a level, 4 compares in the leaf, 8 misses. */
const FIND_LINE: Record<number, number> = { 7: 4, 4: 5, 8: 5 }

function runFindRecord(state: TriageState, record: number): OperationResult<TriageSnapshot> {
  const rec = new StepRecorder()
  const s = settle(state)
  const get = runGet(s.archive, record)
  rec.lift(s, get.steps, (line) => FIND_LINE[line] ?? 5)
  const reads = get.steps.at(-1)!.variables?.probes as number
  const hit = hasRecord(s.archive, record)
  s.focus = 'archive'
  s.archive = get.steps.at(-1)!.snapshot
  rec.push(
    s,
    5,
    hit ? `Record ${record} found after ${plural(reads, 'block read')}.` : `Record ${record} is not in the archive: ${plural(reads, 'block read')}.`,
    undefined,
    { 'block reads': reads },
  )
  return { steps: rec.steps, finalSnapshot: settle({ ...s, archive: get.finalSnapshot }) }
}

// ---------- registry ----------

export const triageOperations: OperationDefinition<TriageState, unknown, TriageSnapshot>[] = [
  {
    id: 'admit-priority',
    label: 'Admit patient',
    inputKind: 'array',
    placeholder: 'Severity, record: e.g. 5, 50',
    variants: ['priority'],
    run: (s, v) => runAdmit(s, v as number[], 'priority'),
  },
  {
    id: 'admit-arrival',
    label: 'Admit patient',
    inputKind: 'array',
    placeholder: 'Severity, record: e.g. 5, 50',
    variants: ['arrival'],
    run: (s, v) => runAdmit(s, v as number[], 'arrival'),
  },
  { id: 'treat-priority', label: 'Treat next', inputKind: 'none', variants: ['priority'], run: (s) => runTreatPriority(s) },
  { id: 'treat-arrival', label: 'Treat next', inputKind: 'none', variants: ['arrival'], run: (s) => runTreatArrival(s) },
  { id: 'find-record', label: 'Find record', inputKind: 'key', placeholder: 'Record number, e.g. 63', run: (s, k) => runFindRecord(s, k as number) },
]
