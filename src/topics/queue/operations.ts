// SPEC.md §10.7: operations. Each `run()` emits exactly the steps in the spec's
// step tables, in order, with the listed `highlightLine`.
import type { OperationDefinition, OperationResult, Step } from '@/types/step-engine'
import { nodeId, plural } from '@/lib/linked-nodes'
import {
  MAX_CAPACITY,
  type ArrayHighlightKind,
  type ArrayQueueSnapshot,
  type LinkedHighlightKind,
  type LinkedQueueSnapshot,
  type QueueSnapshot,
  type QueueState,
} from './types'

// ---------- snapshot helpers ----------

function cloneArray(s: ArrayQueueSnapshot): ArrayQueueSnapshot {
  return { impl: 'array', slots: [...s.slots], first: s.first, last: s.last, n: s.n }
}

function cloneLinked(s: LinkedQueueSnapshot): LinkedQueueSnapshot {
  const nodes: LinkedQueueSnapshot['nodes'] = {}
  for (const [id, node] of Object.entries(s.nodes)) nodes[id] = { ...node }
  return { impl: 'linked', nodes, firstId: s.firstId, lastId: s.lastId, nextId: s.nextId }
}

export function cloneSnapshot(s: QueueSnapshot): QueueSnapshot {
  return s.impl === 'array' ? cloneArray(s) : cloneLinked(s)
}

class ArrayRecorder {
  readonly steps: Step<QueueSnapshot>[] = []
  push(base: ArrayQueueSnapshot, highlightLine: number, description: string, indices: number[] = [], kind: ArrayHighlightKind = 'write') {
    const snapshot = cloneArray(base)
    if (indices.length > 0) snapshot.highlight = { indices, kind }
    this.steps.push({ id: this.steps.length, description, highlightLine, snapshot })
  }
}

class LinkedRecorder {
  readonly steps: Step<QueueSnapshot>[] = []
  push(base: LinkedQueueSnapshot, highlightLine: number, description: string, ids: string[] = [], kind: LinkedHighlightKind = 'new') {
    const snapshot = cloneLinked(base)
    if (ids.length > 0) snapshot.highlight = { ids, kind }
    this.steps.push({ id: this.steps.length, description, highlightLine, snapshot })
  }
}

// ---------- builders (no steps) ----------

export function buildArrayQueue(values: number[], capacity: number, first = 0): ArrayQueueSnapshot {
  const slots: (number | null)[] = Array.from({ length: capacity }, () => null)
  values.forEach((v, i) => {
    slots[(first + i) % capacity] = v
  })
  return { impl: 'array', slots, first, last: (first + values.length) % capacity, n: values.length }
}

export function buildLinkedQueue(values: number[]): LinkedQueueSnapshot {
  const nodes: LinkedQueueSnapshot['nodes'] = {}
  values.forEach((value, i) => {
    nodes[nodeId(i)] = { id: nodeId(i), value, next: i + 1 < values.length ? nodeId(i + 1) : null }
  })
  return {
    impl: 'linked',
    nodes,
    firstId: values.length ? nodeId(0) : null,
    lastId: values.length ? nodeId(values.length - 1) : null,
    nextId: values.length,
  }
}

/** Slot indices in queue order, the ones the `full` highlight marks. */
function occupied(q: ArrayQueueSnapshot): number[] {
  return Array.from({ length: q.n }, (_, i) => (q.first + i) % q.slots.length)
}

/** Lines 12 to 15: copies the items into a fresh array in queue order. */
function resize(rec: ArrayRecorder, q: ArrayQueueSnapshot, capacity: number) {
  const copy: (number | null)[] = Array.from({ length: capacity }, () => null)
  for (let i = 0; i < q.n; i++) copy[i] = q.slots[(q.first + i) % q.slots.length]
  q.slots = copy
  q.first = 0
  q.last = q.n
  rec.push(q, 14, `Copying the ${plural(q.n, 'item')} into the new array in queue order, so first is 0 and last is ${q.n}.`, occupied(q), 'copy')
}

// ---------- resizing array ----------

export function runArrayEnqueue(state: ArrayQueueSnapshot, item: number): OperationResult<QueueSnapshot> {
  const rec = new ArrayRecorder()
  const q = cloneArray(state)
  const cap = q.slots.length

  if (q.n === cap) {
    if (cap >= MAX_CAPACITY) {
      rec.push(q, 2, `The array already has ${MAX_CAPACITY} slots, the most this demo shows, so ${item} is not added.`)
      return { steps: rec.steps, finalSnapshot: q }
    }
    rec.push(q, 2, `The array is full (${q.n} of ${cap}), so double it to ${2 * cap}.`, occupied(q), 'full')
    resize(rec, q, 2 * cap)
  } else {
    rec.push(q, 2, `The array has room (${q.n} of ${cap}), so no resize is needed.`)
  }

  const at = q.last
  q.slots[at] = item
  q.last += 1
  q.n += 1
  rec.push(q, 3, `Placing ${item} at index ${at}: the queue holds ${plural(q.n, 'item')}.`, [at], 'write')
  if (q.last === q.slots.length) {
    q.last = 0
    rec.push(q, 4, 'last reached the end of the array, so it wraps to 0.')
  }
  return { steps: rec.steps, finalSnapshot: q }
}

export function runArrayDequeue(state: ArrayQueueSnapshot): OperationResult<QueueSnapshot> {
  const rec = new ArrayRecorder()
  const q = cloneArray(state)

  if (q.n === 0) {
    rec.push(q, 7, 'The queue is empty, so there is nothing to dequeue.')
    return { steps: rec.steps, finalSnapshot: q }
  }

  const at = q.first
  const item = q.slots[at]
  q.slots[at] = null
  q.n -= 1
  rec.push(q, 7, `Removing ${item} from index ${at}: the queue holds ${plural(q.n, 'item')}.`, [at], 'read')
  q.first += 1
  rec.push(q, 8, `first moves to ${q.first}.`, [q.first], 'read')
  if (q.first === q.slots.length) {
    q.first = 0
    rec.push(q, 9, 'first reached the end of the array, so it wraps to 0.', [0], 'read')
  }

  const cap = q.slots.length
  if (q.n > 0 && q.n === cap / 4) {
    rec.push(q, 10, `The array is one-quarter full (${q.n} of ${cap}), so halve it to ${cap / 2}.`, occupied(q), 'full')
    resize(rec, q, cap / 2)
  } else {
    rec.push(q, 10, `${q.n} of ${cap} slots are in use, so the array keeps its size.`)
  }
  return { steps: rec.steps, finalSnapshot: q }
}

// ---------- linked list ----------

const count = (q: LinkedQueueSnapshot) => Object.keys(q.nodes).length

export function runLinkedEnqueue(state: LinkedQueueSnapshot, item: number): OperationResult<QueueSnapshot> {
  const rec = new LinkedRecorder()
  const q = cloneLinked(state)

  const oldlast = q.lastId
  const id = nodeId(q.nextId)
  q.nextId += 1
  q.nodes[id] = { id, value: item, next: null }
  q.lastId = id
  rec.push(q, 3, `Creating a node for ${item}: last now points at it.`, [id], 'new')

  if (oldlast === null) {
    q.firstId = id
    rec.push(q, 4, `The queue was empty, so first also points at ${item}.`, [id], 'new')
  } else {
    q.nodes[oldlast].next = id
    rec.push(q, 5, `Linking the old last node ${q.nodes[oldlast].value} to ${item}: the queue holds ${plural(count(q), 'item')}.`, [oldlast, id], 'current')
  }
  return { steps: rec.steps, finalSnapshot: q }
}

export function runLinkedDequeue(state: LinkedQueueSnapshot): OperationResult<QueueSnapshot> {
  const rec = new LinkedRecorder()
  const q = cloneLinked(state)

  if (q.firstId === null) {
    rec.push(q, 8, 'The queue is empty, so there is nothing to dequeue.')
    return { steps: rec.steps, finalSnapshot: q }
  }

  const first = q.nodes[q.firstId]
  rec.push(q, 8, `Taking ${first.value} from first.`, [first.id], 'current')
  const nextId = first.next
  delete q.nodes[first.id]
  q.firstId = nextId
  const nextLabel = nextId === null ? 'null' : String(q.nodes[nextId].value)
  rec.push(q, 9, `first moves to ${nextLabel}: the queue holds ${plural(count(q), 'item')}.`, nextId ? [nextId] : [], 'current')
  if (q.firstId === null) {
    q.lastId = null
    rec.push(q, 11, 'The queue is now empty, so last is null too.')
  }
  return { steps: rec.steps, finalSnapshot: q }
}

export const queueOperations: OperationDefinition<QueueState, unknown, QueueSnapshot>[] = [
  { id: 'array-enqueue', label: 'Enqueue', inputKind: 'key', variants: ['array'], run: (s, k) => runArrayEnqueue(s as ArrayQueueSnapshot, k as number) },
  { id: 'array-dequeue', label: 'Dequeue', inputKind: 'none', variants: ['array'], run: (s) => runArrayDequeue(s as ArrayQueueSnapshot) },
  { id: 'linked-enqueue', label: 'Enqueue', inputKind: 'key', variants: ['linked'], run: (s, k) => runLinkedEnqueue(s as LinkedQueueSnapshot, k as number) },
  { id: 'linked-dequeue', label: 'Dequeue', inputKind: 'none', variants: ['linked'], run: (s) => runLinkedDequeue(s as LinkedQueueSnapshot) },
]
