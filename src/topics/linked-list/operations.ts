// SPEC.md §10.10: operations. Each `run()` emits exactly the steps in the spec's
// step tables, in order, with the listed `highlightLine`.
import type { OperationDefinition, OperationResult, Step } from '@/types/step-engine'
import { nodeId, walk } from '@/lib/linked-nodes'
import { MAX_NODES, type LinkedListHighlightKind, type LinkedListSnapshot, type LinkedListState } from './types'

export function cloneSnapshot(s: LinkedListSnapshot): LinkedListSnapshot {
  const nodes: LinkedListSnapshot['nodes'] = {}
  for (const [id, node] of Object.entries(s.nodes)) nodes[id] = { ...node }
  return { nodes, firstId: s.firstId, lastId: s.lastId, nextId: s.nextId }
}

class StepRecorder {
  readonly steps: Step<LinkedListSnapshot>[] = []
  push(
    base: LinkedListSnapshot,
    highlightLine: number,
    description: string,
    highlight: Record<string, LinkedListHighlightKind> = {},
    variables?: Step<LinkedListSnapshot>['variables'],
  ) {
    const snapshot = cloneSnapshot(base)
    if (Object.keys(highlight).length > 0) snapshot.highlight = highlight
    this.steps.push({ id: this.steps.length, description, highlightLine, snapshot, ...(variables ? { variables } : {}) })
  }
}

export function buildList(values: number[]): LinkedListSnapshot {
  const nodes: LinkedListSnapshot['nodes'] = {}
  values.forEach((value, i) => {
    nodes[nodeId(i)] = { id: nodeId(i), value, next: i + 1 < values.length ? nodeId(i + 1) : null }
  })
  return {
    nodes,
    firstId: values.length ? nodeId(0) : null,
    lastId: values.length ? nodeId(values.length - 1) : null,
    nextId: values.length,
  }
}

const count = (s: LinkedListSnapshot) => Object.keys(s.nodes).length

function atCap(rec: StepRecorder, s: LinkedListSnapshot, item: number): boolean {
  if (count(s) < MAX_NODES) return false
  rec.push(s, 3, `The list holds ${MAX_NODES} nodes, the most this demo shows, so ${item} is not added.`)
  return true
}

export function runInsertFirst(state: LinkedListState, item: number): OperationResult<LinkedListSnapshot> {
  const rec = new StepRecorder()
  const s = cloneSnapshot(state)
  if (atCap(rec, s, item)) return { steps: rec.steps, finalSnapshot: s }

  const oldfirst = s.firstId
  const id = nodeId(s.nextId)
  s.nextId += 1
  s.nodes[id] = { id, value: item, next: null }
  s.firstId = id
  rec.push(s, 3, `Creating a node for ${item}: first now points at it.`, { [id]: 'new' })
  if (oldfirst === null) {
    s.lastId = id
    rec.push(s, 5, `The list was empty, so last also points at ${item}.`, { [id]: 'new' })
  } else {
    s.nodes[id].next = oldfirst
    rec.push(s, 4, `Pointing its next at the old first node ${s.nodes[oldfirst].value}, so the list starts at ${item}.`, { [id]: 'new' })
  }
  return { steps: rec.steps, finalSnapshot: s }
}

export function runInsertLast(state: LinkedListState, item: number): OperationResult<LinkedListSnapshot> {
  const rec = new StepRecorder()
  const s = cloneSnapshot(state)
  if (atCap(rec, s, item)) return { steps: rec.steps, finalSnapshot: s }

  const oldlast = s.lastId
  const id = nodeId(s.nextId)
  s.nextId += 1
  s.nodes[id] = { id, value: item, next: null }
  s.lastId = id
  rec.push(s, 3, `Creating a node for ${item}: last now points at it.`, { [id]: 'new' })
  if (oldlast === null) {
    s.firstId = id
    rec.push(s, 4, `The list was empty, so first also points at ${item}.`, { [id]: 'new' })
  } else {
    s.nodes[oldlast].next = id
    rec.push(s, 5, `Pointing the old last node ${s.nodes[oldlast].value} at ${item}, so the list ends at ${item}.`, { [oldlast]: 'current', [id]: 'current' })
  }
  return { steps: rec.steps, finalSnapshot: s }
}

export function runRemoveFirst(state: LinkedListState): OperationResult<LinkedListSnapshot> {
  const rec = new StepRecorder()
  const s = cloneSnapshot(state)
  if (s.firstId === null) {
    rec.push(s, 2, 'The list is empty, so there is nothing to remove.')
    return { steps: rec.steps, finalSnapshot: s }
  }

  const first = s.nodes[s.firstId]
  rec.push(s, 3, `Taking ${first.value} from the first node.`, { [first.id]: 'current' })
  const nextId = first.next
  delete s.nodes[first.id]
  s.firstId = nextId
  rec.push(s, 4, `first moves to ${nextId === null ? 'null' : s.nodes[nextId].value}, so the old node is unreachable.`, nextId ? { [nextId]: 'current' } : {})
  if (nextId === null) {
    s.lastId = null
    rec.push(s, 5, 'first is null, so last is null too: the list is empty.')
  }
  return { steps: rec.steps, finalSnapshot: s }
}

export function runTraverse(state: LinkedListState): OperationResult<LinkedListSnapshot> {
  const rec = new StepRecorder()
  const s = cloneSnapshot(state)
  const order = walk(s.nodes, s.firstId)
  if (order.length === 0) {
    rec.push(s, 2, 'The list is empty, so there is nothing to visit.')
    return { steps: rec.steps, finalSnapshot: s }
  }
  const visited: number[] = []
  order.forEach((id, i) => {
    visited.push(s.nodes[id].value)
    const highlight: Record<string, LinkedListHighlightKind> = {}
    for (const earlier of order.slice(0, i)) highlight[earlier] = 'visited'
    highlight[id] = 'current'
    rec.push(s, 3, `Visit ${s.nodes[id].value}. Visited so far: ${visited.join(', ')}.`, highlight, { visited: visited.join(', ') })
  })
  const all: Record<string, LinkedListHighlightKind> = {}
  for (const id of order) all[id] = 'visited'
  rec.push(s, 2, `x is null, so the traversal ends after ${order.length} nodes.`, all, { visited: visited.join(', ') })
  return { steps: rec.steps, finalSnapshot: s }
}

export const linkedListOperations: OperationDefinition<LinkedListState, unknown, LinkedListSnapshot>[] = [
  { id: 'insert-first', label: 'Insert at the beginning', inputKind: 'key', run: (s, k) => runInsertFirst(s, k as number) },
  { id: 'insert-last', label: 'Insert at the end', inputKind: 'key', run: (s, k) => runInsertLast(s, k as number) },
  { id: 'remove-first', label: 'Remove from the beginning', inputKind: 'none', run: (s) => runRemoveFirst(s) },
  { id: 'traverse', label: 'Traverse', inputKind: 'none', run: (s) => runTraverse(s) },
]
