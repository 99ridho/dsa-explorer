// SPEC.md §19.3: operations. Each `run()` emits exactly the steps in the step tables.
import type { OperationDefinition, OperationResult, Step } from '@/types/step-engine'
import { nodeId, plural, walk } from '@/lib/linked-nodes'
import {
  FIRST_ORDER,
  INITIAL_CAPACITY,
  MAX_ORDERS,
  MAX_WAITING,
  type CanteenSnapshot,
  type CanteenState,
  type CounterDesign,
} from './types'

type Vars = Step<CanteenSnapshot>['variables']
type Highlight = NonNullable<CanteenSnapshot['highlight']>

// ---------- snapshot helpers ----------

function clone(s: CanteenSnapshot): CanteenSnapshot {
  const nodes: CanteenSnapshot['nodes'] = {}
  for (const [id, node] of Object.entries(s.nodes)) nodes[id] = { ...node }
  return {
    design: s.design,
    nodes,
    firstId: s.firstId,
    lastId: s.lastId,
    nextId: s.nextId,
    log: [...s.log],
    n: s.n,
    nextOrder: s.nextOrder,
    skipped: s.skipped,
  }
}

class StepRecorder {
  readonly steps: Step<CanteenSnapshot>[] = []
  push(base: CanteenSnapshot, highlightLine: number, description: string, highlight?: Highlight, range?: CanteenSnapshot['range'], variables?: Vars) {
    const snapshot = clone(base)
    if (highlight) snapshot.highlight = { ...highlight, ...(highlight.ids ? { ids: [...highlight.ids] } : {}), ...(highlight.indices ? { indices: [...highlight.indices] } : {}) }
    if (range) snapshot.range = { ...range }
    this.steps.push({ id: this.steps.length, description, highlightLine, snapshot, ...(variables ? { variables } : {}) })
  }
}

const waitingCount = (s: CanteenSnapshot) => Object.keys(s.nodes).length
const orderOf = (s: CanteenSnapshot, id: string) => s.nodes[id].value

// ---------- mutations shared by the stepped runs and the step-free builder ----------

/** Links a new order at the back (queue) or on top (stack); returns its node id. */
function link(s: CanteenSnapshot, number: number): string {
  const id = nodeId(s.nextId)
  s.nextId += 1
  if (s.design === 'queue') {
    s.nodes[id] = { id, value: number, next: null }
    if (s.lastId !== null) s.nodes[s.lastId].next = id
    else s.firstId = id
    s.lastId = id
  } else {
    s.nodes[id] = { id, value: number, next: s.firstId }
    s.firstId = id
  }
  return id
}

/** Unlinks the front (queue) or top (stack); returns the order number. */
function unlink(s: CanteenSnapshot): number {
  const id = s.firstId!
  const number = s.nodes[id].value
  s.firstId = s.nodes[id].next
  delete s.nodes[id]
  if (s.design === 'queue' && s.firstId === null) s.lastId = null
  return number
}

/** Older orders still waiting after `number` was taken: the skip the stack design causes. */
const olderWaiting = (s: CanteenSnapshot, number: number) => Object.values(s.nodes).filter((node) => node.value < number).length

export function emptyCounter(design: CounterDesign): CanteenSnapshot {
  return {
    design,
    nodes: {},
    firstId: null,
    lastId: null,
    nextId: 0,
    log: Array<number | null>(INITIAL_CAPACITY).fill(null),
    n: 0,
    nextOrder: FIRST_ORDER,
    skipped: 0,
  }
}

export type CounterAction = 'place' | 'serve'

export function buildCounter(design: CounterDesign, actions: CounterAction[]): CanteenSnapshot {
  const s = emptyCounter(design)
  for (const action of actions) {
    if (action === 'place') {
      if (waitingCount(s) >= MAX_WAITING || s.nextOrder - FIRST_ORDER >= MAX_ORDERS) continue
      link(s, s.nextOrder)
      s.nextOrder += 1
    } else {
      if (s.firstId === null) continue
      const number = unlink(s)
      if (olderWaiting(s, number) > 0) s.skipped += 1
      if (s.n === s.log.length) s.log = [...s.log, ...Array<number | null>(s.log.length).fill(null)]
      s.log[s.n] = number
      s.n += 1
    }
  }
  return s
}

// ---------- Place order ----------

function runPlace(state: CanteenState): OperationResult<CanteenSnapshot> {
  const rec = new StepRecorder()
  const s = clone(state)
  if (waitingCount(s) >= MAX_WAITING) {
    rec.push(s, 3, `${MAX_WAITING} orders are already waiting, so serve one before taking another.`)
    return { steps: rec.steps, finalSnapshot: clone(s) }
  }
  if (s.nextOrder - FIRST_ORDER >= MAX_ORDERS) {
    rec.push(s, 2, `The counter has taken ${MAX_ORDERS} orders today, the most this log keeps.`)
    return { steps: rec.steps, finalSnapshot: clone(s) }
  }
  const number = s.nextOrder
  s.nextOrder += 1
  rec.push(s, 2, `The counter gives the new order number ${number}.`)
  const neighbour = s.design === 'queue' ? s.lastId : s.firstId
  const neighbourOrder = neighbour === null ? null : orderOf(s, neighbour)
  const id = link(s, number)
  const description =
    neighbourOrder === null
      ? `Nothing was waiting, so order ${number} is the only order waiting.`
      : s.design === 'queue'
        ? `Order ${number} joins the back of the queue after order ${neighbourOrder}.`
        : `Order ${number} goes on top of the stack, above order ${neighbourOrder}.`
  rec.push(s, 3, description, { ids: [id], kind: 'new' })
  return { steps: rec.steps, finalSnapshot: clone(s) }
}

// ---------- Serve next ----------

function runServe(state: CanteenState): OperationResult<CanteenSnapshot> {
  const rec = new StepRecorder()
  const s = clone(state)
  if (s.firstId === null) {
    rec.push(s, 2, 'No orders are waiting, so there is nothing to serve.')
    return { steps: rec.steps, finalSnapshot: clone(s) }
  }
  const vars = () => ({ skipped: s.skipped })
  // The first step shows the order still waiting, so stepping back reaches the state before the serve.
  const head = orderOf(s, s.firstId)
  rec.push(
    s,
    3,
    s.design === 'queue' ? `Order ${head} is at the front of the queue.` : `Order ${head} is on top of the stack.`,
    { ids: [s.firstId], kind: 'current' },
    undefined,
    vars(),
  )
  const number = unlink(s)
  if (s.design === 'queue') {
    rec.push(s, 3, `Order ${number} is first in the queue, so the kitchen serves it.`, undefined, undefined, vars())
  } else {
    const older = olderWaiting(s, number)
    if (older > 0) {
      s.skipped += 1
      rec.push(s, 3, `Order ${number} is on top of the stack, so the kitchen serves it before ${plural(older, 'older order')}.`, undefined, undefined, vars())
    } else {
      rec.push(s, 3, `Order ${number} is on top of the stack, so the kitchen serves it.`, undefined, undefined, vars())
    }
  }
  if (s.n === s.log.length) {
    const cap = s.log.length
    s.log = [...s.log, ...Array<number | null>(cap).fill(null)]
    rec.push(s, 4, `The served log is full at ${cap} slots, so it doubles to ${2 * cap}.`, { indices: s.log.map((_, i) => i), kind: 'copy' }, undefined, vars())
  }
  s.log[s.n] = number
  s.n += 1
  rec.push(s, 5, `Writing order ${number} at position ${s.n - 1} of the served log.`, { indices: [s.n - 1], kind: 'write' }, undefined, vars())
  return { steps: rec.steps, finalSnapshot: clone(s) }
}

// ---------- Find order ----------

function runFindBinary(state: CanteenState, number: number): OperationResult<CanteenSnapshot> {
  const rec = new StepRecorder()
  const s = clone(state)
  let lo = 0
  let hi = s.n - 1
  let compares = 0
  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2)
    const at = s.log[mid]!
    compares += 1
    rec.push(s, 4, `lo = ${lo}, hi = ${hi}, so mid = ${mid}: order ${at}.`, { indices: [mid], kind: 'current' }, { lo, hi }, { compares })
    if (number < at) {
      hi = mid - 1
      rec.push(s, 5, `${number} < ${at}, so search the left half.`, undefined, { lo, hi }, { compares })
    } else if (number > at) {
      lo = mid + 1
      rec.push(s, 6, `${number} > ${at}, so search the right half.`, undefined, { lo, hi }, { compares })
    } else {
      rec.push(s, 7, `Found order ${number} at position ${mid} after ${plural(compares, 'compare')}.`, { indices: [mid], kind: 'found' }, undefined, { compares })
      return { steps: rec.steps, finalSnapshot: clone(s) }
    }
  }
  rec.push(s, 8, `lo is past hi after ${plural(compares, 'compare')}: order ${number} is not in the served log.`, undefined, undefined, { compares })
  return { steps: rec.steps, finalSnapshot: clone(s) }
}

function runFindSequential(state: CanteenState, number: number): OperationResult<CanteenSnapshot> {
  const rec = new StepRecorder()
  const s = clone(state)
  let compares = 0
  for (let i = 0; i < s.n; i++) {
    compares += 1
    rec.push(s, 3, `Comparing ${number} with order ${s.log[i]} at position ${i}.`, { indices: [i], kind: 'current' }, undefined, { compares })
    if (s.log[i] === number) {
      rec.push(s, 3, `Found order ${number} at position ${i} after ${plural(compares, 'compare')}.`, { indices: [i], kind: 'found' }, undefined, { compares })
      return { steps: rec.steps, finalSnapshot: clone(s) }
    }
  }
  rec.push(s, 4, `Reached the end of the log after ${plural(compares, 'compare')}: order ${number} is not in it.`, undefined, undefined, { compares })
  return { steps: rec.steps, finalSnapshot: clone(s) }
}

/** Waiting orders from first to last (queue) or top to bottom (stack). */
export const waitingOrders = (s: CanteenSnapshot) => walk(s.nodes, s.firstId).map((id) => s.nodes[id].value)

// ---------- registry ----------

export const canteenOperations: OperationDefinition<CanteenState, unknown, CanteenSnapshot>[] = [
  { id: 'place-queue', label: 'Place order', inputKind: 'none', variants: ['queue'], run: (s) => runPlace(s) },
  { id: 'place-stack', label: 'Place order', inputKind: 'none', variants: ['stack'], run: (s) => runPlace(s) },
  { id: 'serve-queue', label: 'Serve next', inputKind: 'none', variants: ['queue'], run: (s) => runServe(s) },
  { id: 'serve-stack', label: 'Serve next', inputKind: 'none', variants: ['stack'], run: (s) => runServe(s) },
  { id: 'find-binary', label: 'Find order', inputKind: 'key', placeholder: 'Order number, e.g. 104', variants: ['queue'], run: (s, k) => runFindBinary(s, k as number) },
  { id: 'find-sequential', label: 'Find order', inputKind: 'key', placeholder: 'Order number, e.g. 104', variants: ['stack'], run: (s, k) => runFindSequential(s, k as number) },
]
