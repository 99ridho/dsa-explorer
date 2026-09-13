// SPEC.md §10.8: operations. Each `run()` emits exactly the steps in the spec's
// step tables, in order, with the listed `highlightLine`.
import type { OperationDefinition, OperationResult, Step } from '@/types/step-engine'
import { nodeId, plural } from '@/lib/linked-nodes'
import {
  MAX_CAPACITY,
  MAX_TOKENS,
  type ArrayHighlightKind,
  type ArrayStackSnapshot,
  type EvalView,
  type LinkedHighlightKind,
  type LinkedStackSnapshot,
  type StackSnapshot,
  type StackState,
} from './types'

// ---------- snapshot helpers ----------

function cloneArray(s: ArrayStackSnapshot): ArrayStackSnapshot {
  return { impl: 'array', slots: [...s.slots], n: s.n }
}

function cloneLinked(s: LinkedStackSnapshot): LinkedStackSnapshot {
  const nodes: LinkedStackSnapshot['nodes'] = {}
  for (const [id, node] of Object.entries(s.nodes)) nodes[id] = { ...node }
  return { impl: 'linked', nodes, firstId: s.firstId, nextId: s.nextId }
}

export function cloneSnapshot(s: StackSnapshot): StackSnapshot {
  return s.impl === 'array' ? cloneArray(s) : cloneLinked(s)
}

class ArrayRecorder {
  readonly steps: Step<StackSnapshot>[] = []
  push(base: ArrayStackSnapshot, highlightLine: number, description: string, indices: number[] = [], kind: ArrayHighlightKind = 'write') {
    const snapshot = cloneArray(base)
    if (indices.length > 0) snapshot.highlight = { indices, kind }
    this.steps.push({ id: this.steps.length, description, highlightLine, snapshot })
  }
}

class LinkedRecorder {
  readonly steps: Step<StackSnapshot>[] = []
  push(base: LinkedStackSnapshot, highlightLine: number, description: string, ids: string[] = [], kind: LinkedHighlightKind = 'new') {
    const snapshot = cloneLinked(base)
    if (ids.length > 0) snapshot.highlight = { ids, kind }
    this.steps.push({ id: this.steps.length, description, highlightLine, snapshot })
  }
}

// ---------- builders (no steps) ----------

export function buildArrayStack(values: number[], capacity: number): ArrayStackSnapshot {
  const slots: (number | null)[] = Array.from({ length: capacity }, () => null)
  values.forEach((v, i) => {
    slots[i] = v
  })
  return { impl: 'array', slots, n: values.length }
}

/** `values` is listed bottom to top: the last value is the top of the stack. */
export function buildLinkedStack(values: number[]): LinkedStackSnapshot {
  const nodes: LinkedStackSnapshot['nodes'] = {}
  values.forEach((value, i) => {
    nodes[nodeId(i)] = { id: nodeId(i), value, next: i > 0 ? nodeId(i - 1) : null }
  })
  return { impl: 'linked', nodes, firstId: values.length ? nodeId(values.length - 1) : null, nextId: values.length }
}

const occupied = (a: ArrayStackSnapshot) => Array.from({ length: a.n }, (_, i) => i)

/** Lines 8 to 11: copies the items into a fresh array. */
function resize(rec: ArrayRecorder, a: ArrayStackSnapshot, capacity: number) {
  const copy: (number | null)[] = Array.from({ length: capacity }, () => null)
  for (let i = 0; i < a.n; i++) copy[i] = a.slots[i]
  a.slots = copy
  rec.push(a, 10, `Copying the ${plural(a.n, 'item')} into the new array of ${capacity}.`, occupied(a), 'copy')
}

// ---------- resizing array ----------

export function runArrayPush(state: ArrayStackSnapshot, item: number): OperationResult<StackSnapshot> {
  const rec = new ArrayRecorder()
  const a = cloneArray(state)
  const cap = a.slots.length

  if (a.n === cap) {
    if (cap >= MAX_CAPACITY) {
      rec.push(a, 2, `The array already has ${MAX_CAPACITY} slots, the most this demo shows, so ${item} is not added.`)
      return { steps: rec.steps, finalSnapshot: a }
    }
    rec.push(a, 2, `The array is full (${a.n} of ${cap}), so double it to ${2 * cap}.`, occupied(a), 'full')
    resize(rec, a, 2 * cap)
  } else {
    rec.push(a, 2, `The array has room (${a.n} of ${cap}), so no resize is needed.`)
  }

  const at = a.n
  a.slots[at] = item
  a.n += 1
  rec.push(a, 3, `Placing ${item} at index ${at}: the stack holds ${plural(a.n, 'item')}.`, [at], 'write')
  return { steps: rec.steps, finalSnapshot: a }
}

export function runArrayPop(state: ArrayStackSnapshot): OperationResult<StackSnapshot> {
  const rec = new ArrayRecorder()
  const a = cloneArray(state)

  if (a.n === 0) {
    rec.push(a, 5, 'The stack is empty, so there is nothing to pop.')
    return { steps: rec.steps, finalSnapshot: a }
  }

  const at = a.n - 1
  const item = a.slots[at]
  a.slots[at] = null
  a.n -= 1
  rec.push(a, 5, `Removing ${item} from index ${at}: the stack holds ${plural(a.n, 'item')}.`, [at], 'read')

  const cap = a.slots.length
  if (a.n > 0 && a.n === cap / 4) {
    rec.push(a, 6, `The array is one-quarter full (${a.n} of ${cap}), so halve it to ${cap / 2}.`, occupied(a), 'full')
    resize(rec, a, cap / 2)
  } else {
    rec.push(a, 6, `${a.n} of ${cap} slots are in use, so the array keeps its size.`)
  }
  return { steps: rec.steps, finalSnapshot: a }
}

// ---------- linked list ----------

const count = (s: LinkedStackSnapshot) => Object.keys(s.nodes).length

export function runLinkedPush(state: LinkedStackSnapshot, item: number): OperationResult<StackSnapshot> {
  const rec = new LinkedRecorder()
  const s = cloneLinked(state)

  const oldfirst = s.firstId
  const id = nodeId(s.nextId)
  s.nextId += 1
  s.nodes[id] = { id, value: item, next: null }
  s.firstId = id
  rec.push(s, 3, `Creating a node for ${item}: first now points at it.`, [id], 'new')

  if (oldfirst === null) {
    rec.push(s, 4, `There was no old first node, so ${item} is the only node: the stack holds 1 item.`, [id], 'new')
  } else {
    s.nodes[id].next = oldfirst
    rec.push(s, 4, `Linking ${item} to the old first node ${s.nodes[oldfirst].value}: the stack holds ${plural(count(s), 'item')}.`, [id, oldfirst], 'current')
  }
  return { steps: rec.steps, finalSnapshot: s }
}

export function runLinkedPop(state: LinkedStackSnapshot): OperationResult<StackSnapshot> {
  const rec = new LinkedRecorder()
  const s = cloneLinked(state)

  if (s.firstId === null) {
    rec.push(s, 7, 'The stack is empty, so there is nothing to pop.')
    return { steps: rec.steps, finalSnapshot: s }
  }

  const first = s.nodes[s.firstId]
  rec.push(s, 7, `Taking ${first.value} from first.`, [first.id], 'current')
  const nextId = first.next
  delete s.nodes[first.id]
  s.firstId = nextId
  if (nextId === null) {
    rec.push(s, 8, 'first becomes null: the stack is empty.')
  } else {
    rec.push(s, 8, `first moves to ${s.nodes[nextId].value}: the stack holds ${plural(count(s), 'item')}.`, [nextId], 'current')
  }
  return { steps: rec.steps, finalSnapshot: s }
}

// ---------- Dijkstra's two-stack evaluation ----------

const OPERATORS = new Set(['+', '-', '*', '/'])
const NUMBER = /^\d+(?:\.\d+)?$/

export function tokenize(raw: string): string[] {
  return raw.match(/\d+(?:\.\d+)?|[()+\-*/]|\S+/g) ?? []
}

const fmt = (x: number) => (Number.isInteger(x) ? String(x) : x.toFixed(2))

function apply(a: number, op: string, b: number): number {
  if (op === '+') return a + b
  if (op === '-') return a - b
  if (op === '*') return a * b
  return a / b
}

export function runEvaluate(state: StackSnapshot, raw: string): OperationResult<StackSnapshot> {
  const steps: Step<StackSnapshot>[] = []
  const tokens = tokenize(raw)
  const vals: number[] = []
  const ops: string[] = []

  const push = (cursor: number, highlightLine: number, description: string, focus?: EvalView['focus']) => {
    const snapshot = cloneSnapshot(state)
    snapshot.eval = { tokens, cursor, operands: [...vals], operators: [...ops], ...(focus ? { focus } : {}) }
    steps.push({
      id: steps.length,
      description,
      highlightLine,
      snapshot,
      variables: { operands: vals.map(fmt).join(' ') || 'empty', operators: ops.join(' ') || 'empty' },
    })
  }
  const done = () => ({ steps, finalSnapshot: cloneSnapshot(state) })

  if (tokens.length > MAX_TOKENS) {
    push(0, 2, `The expression has ${tokens.length} tokens and this demo evaluates at most ${MAX_TOKENS}, so evaluation stops.`)
    return done()
  }

  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i]
    if (t === '(') {
      push(i, 3, 'Token ( opens a group, so skip it.')
    } else if (OPERATORS.has(t)) {
      ops.push(t)
      push(i, 4, `Token ${t} is an operator, so push it onto the operator stack.`, 'operator')
    } else if (t === ')') {
      if (ops.length === 0 || vals.length < 2) {
        push(i, 6, 'A stack ran out of items at ), so the expression is not fully parenthesized.')
        return done()
      }
      const op = ops.pop()!
      const b = vals.pop()!
      const a = vals.pop()!
      push(i, 6, `Token ) closes a group, so pop ${op}, ${fmt(b)}, and ${fmt(a)}.`, 'apply')
      if (op === '/' && b === 0) {
        push(i, 7, `${fmt(a)} / 0 has no value, so evaluation stops.`)
        return done()
      }
      const r = apply(a, op, b)
      vals.push(r)
      push(i, 7, `${fmt(a)} ${op} ${fmt(b)} = ${fmt(r)}, so push ${fmt(r)} onto the operand stack.`, 'operand')
    } else if (NUMBER.test(t)) {
      vals.push(Number(t))
      push(i, 8, `Token ${t} is a number, so push it onto the operand stack.`, 'operand')
    } else {
      push(i, 2, `Token ${t} is not a number, an operator, or a parenthesis, so evaluation stops.`)
      return done()
    }
  }

  if (vals.length === 1) push(tokens.length, 9, `Every token is read, so the result is ${fmt(vals[0])}.`, 'operand')
  else if (vals.length > 1) push(tokens.length, 9, 'More than one value remains, so the expression is not fully parenthesized.')
  else push(tokens.length, 9, 'No value remains, so the expression has no result.')
  return done()
}

export const stackOperations: OperationDefinition<StackState, unknown, StackSnapshot>[] = [
  { id: 'array-push', label: 'Push', inputKind: 'key', variants: ['array'], run: (s, k) => runArrayPush(s as ArrayStackSnapshot, k as number) },
  { id: 'array-pop', label: 'Pop', inputKind: 'none', variants: ['array'], run: (s) => runArrayPop(s as ArrayStackSnapshot) },
  { id: 'linked-push', label: 'Push', inputKind: 'key', variants: ['linked'], run: (s, k) => runLinkedPush(s as LinkedStackSnapshot, k as number) },
  { id: 'linked-pop', label: 'Pop', inputKind: 'none', variants: ['linked'], run: (s) => runLinkedPop(s as LinkedStackSnapshot) },
  { id: 'evaluate', label: 'Evaluate expression', inputKind: 'text', placeholder: '( 1 + ( 2 * 3 ) )', run: (s, t) => runEvaluate(s, t as string) },
]
