// SPEC.md §10.11: operations. Each `run()` emits exactly the steps in the spec's
// step tables, in order, with the listed `highlightLine`.
import type { OperationDefinition, OperationResult, Step } from '@/types/step-engine'
import { nodeId, plural, walk } from '@/lib/linked-nodes'
import {
  MAX_KEYS,
  type BinaryHighlightKind,
  type BinarySnapshot,
  type SearchingSnapshot,
  type SearchingState,
  type SequentialHighlightKind,
  type SequentialSnapshot,
} from './types'

// ---------- snapshot helpers ----------

function cloneSequential(s: SequentialSnapshot): SequentialSnapshot {
  const nodes: SequentialSnapshot['nodes'] = {}
  for (const [id, node] of Object.entries(s.nodes)) nodes[id] = { ...node }
  return { impl: 'sequential', nodes, firstId: s.firstId, nextId: s.nextId }
}

function cloneBinary(s: BinarySnapshot): BinarySnapshot {
  return { impl: 'binary', keys: [...s.keys], vals: [...s.vals] }
}

export function cloneSnapshot(s: SearchingSnapshot): SearchingSnapshot {
  return s.impl === 'sequential' ? cloneSequential(s) : cloneBinary(s)
}

class SequentialRecorder {
  readonly steps: Step<SearchingSnapshot>[] = []
  compares = 0
  push(base: SequentialSnapshot, highlightLine: number, description: string, ids: string[] = [], kind: SequentialHighlightKind = 'current') {
    const snapshot = cloneSequential(base)
    if (ids.length > 0) snapshot.highlight = { ids, kind }
    this.steps.push({ id: this.steps.length, description, highlightLine, snapshot, variables: { compares: this.compares } })
  }
}

class BinaryRecorder {
  readonly steps: Step<SearchingSnapshot>[] = []
  compares = 0
  range?: { lo: number; hi: number }
  push(base: BinarySnapshot, highlightLine: number, description: string, indices: number[] = [], kind: BinaryHighlightKind = 'mid', extra: Record<string, number> = {}) {
    const snapshot = cloneBinary(base)
    if (indices.length > 0) snapshot.highlight = { indices, kind }
    if (this.range) snapshot.range = { ...this.range }
    this.steps.push({ id: this.steps.length, description, highlightLine, snapshot, variables: { ...extra, compares: this.compares } })
  }
}

// ---------- builders (no steps) ----------

/** `pairs` run from first to last. */
export function buildSequential(pairs: [number, number][]): SequentialSnapshot {
  const nodes: SequentialSnapshot['nodes'] = {}
  pairs.forEach(([key, value], i) => {
    nodes[nodeId(i)] = { id: nodeId(i), key, value, next: i + 1 < pairs.length ? nodeId(i + 1) : null }
  })
  return { impl: 'sequential', nodes, firstId: pairs.length ? nodeId(0) : null, nextId: pairs.length }
}

export function buildBinary(pairs: [number, number][]): BinarySnapshot {
  const sorted = [...pairs].sort((a, b) => a[0] - b[0])
  return { impl: 'binary', keys: sorted.map((p) => p[0]), vals: sorted.map((p) => p[1]) }
}

// ---------- sequential search ----------

export function runSeqGet(state: SequentialSnapshot, key: number): OperationResult<SearchingSnapshot> {
  const rec = new SequentialRecorder()
  const s = cloneSequential(state)
  for (const id of walk(s.nodes, s.firstId)) {
    const x = s.nodes[id]
    rec.compares += 1
    if (x.key === key) {
      rec.push(s, 3, `${key} matches this node: HIT, its value is ${x.value}.`, [id], 'found')
      return { steps: rec.steps, finalSnapshot: s }
    }
    rec.push(s, 3, `Comparing ${key} with ${x.key}.`, [id], 'current')
  }
  rec.push(s, 4, `Reached the end of the list: MISS. ${key} is not in the table.`)
  return { steps: rec.steps, finalSnapshot: s }
}

export function runSeqPut(state: SequentialSnapshot, key: number): OperationResult<SearchingSnapshot> {
  const rec = new SequentialRecorder()
  const s = cloneSequential(state)
  for (const id of walk(s.nodes, s.firstId)) {
    const x = s.nodes[id]
    rec.compares += 1
    if (x.key === key) {
      x.value += 1
      rec.push(s, 7, `${key} is already in the table, so its value becomes ${x.value}.`, [id], 'found')
      return { steps: rec.steps, finalSnapshot: s }
    }
    rec.push(s, 7, `Comparing ${key} with ${x.key}.`, [id], 'current')
  }
  const id = nodeId(s.nextId)
  s.nextId += 1
  s.nodes[id] = { id, key, value: 1, next: s.firstId }
  s.firstId = id
  rec.push(s, 8, `Reached the end of the list, so insert ${key} at the front with value 1.`, [id], 'new')
  return { steps: rec.steps, finalSnapshot: s }
}

// ---------- binary search ----------

/** Lines 10 to 17. Returns the rank and whether keys[rank] is the key. */
function rank(rec: BinaryRecorder, s: BinarySnapshot, key: number): { i: number; hit: boolean } {
  const n = s.keys.length
  let lo = 0
  let hi = n - 1
  rec.range = { lo, hi }
  rec.push(s, 11, `lo = 0 and hi = ${hi}: ${key} can only be in this range.`, [], 'mid', { lo, hi })
  while (lo <= hi) {
    const mid = lo + Math.floor((hi - lo) / 2)
    rec.compares += 1
    rec.push(s, 13, `mid = ${mid}: comparing ${key} with keys[${mid}] = ${s.keys[mid]}.`, [mid], 'mid', { lo, mid, hi })
    if (key < s.keys[mid]) {
      hi = mid - 1
      rec.range = { lo, hi }
      rec.push(s, 14, `${key} < ${s.keys[mid]}, so hi becomes ${hi}.`, [], 'mid', { lo, mid, hi })
    } else if (key > s.keys[mid]) {
      lo = mid + 1
      rec.range = { lo, hi }
      rec.push(s, 15, `${key} > ${s.keys[mid]}, so lo becomes ${lo}.`, [], 'mid', { lo, mid, hi })
    } else {
      rec.range = undefined
      rec.push(s, 16, `${key} equals keys[${mid}], so rank is ${mid}.`, [mid], 'found', { lo, mid, hi })
      return { i: mid, hit: true }
    }
  }
  rec.range = undefined
  rec.push(s, 17, `lo passed hi, so rank is ${lo}: ${plural(lo, 'key')} ${lo === 1 ? 'is' : 'are'} smaller than ${key}.`, [], 'mid', { lo, hi })
  return { i: lo, hit: false }
}

export function runBinGet(state: BinarySnapshot, key: number): OperationResult<SearchingSnapshot> {
  const rec = new BinaryRecorder()
  const s = cloneBinary(state)
  const { i, hit } = rank(rec, s, key)
  if (hit) rec.push(s, 3, `keys[${i}] is ${key}: HIT, its value is ${s.vals[i]}.`, [i], 'found')
  else if (i < s.keys.length) rec.push(s, 4, `keys[${i}] is ${s.keys[i]}, not ${key}: MISS.`, [i], 'miss')
  else rec.push(s, 4, `Rank ${i} is past the last key: MISS.`)
  return { steps: rec.steps, finalSnapshot: s }
}

export function runBinPut(state: BinarySnapshot, key: number): OperationResult<SearchingSnapshot> {
  const rec = new BinaryRecorder()
  const s = cloneBinary(state)
  const { i, hit } = rank(rec, s, key)
  if (hit) {
    s.vals[i] += 1
    rec.push(s, 7, `keys[${i}] is ${key}, so its value becomes ${s.vals[i]}.`, [i], 'found')
    return { steps: rec.steps, finalSnapshot: s }
  }
  const n = s.keys.length
  if (n >= MAX_KEYS) {
    rec.push(s, 9, `The table holds ${MAX_KEYS} keys, the most this demo shows, so ${key} is not added.`)
    return { steps: rec.steps, finalSnapshot: s }
  }
  for (let j = n; j > i; j--) {
    s.keys[j] = s.keys[j - 1]
    s.vals[j] = s.vals[j - 1]
    rec.push(s, 8, `Moving keys[${j - 1}] = ${s.keys[j]} right to index ${j} to make room.`, [j], 'shift')
  }
  s.keys[i] = key
  s.vals[i] = 1
  rec.push(s, 9, `Placing ${key} at index ${i} with value 1: the table holds ${plural(n + 1, 'key')}.`, [i], 'new')
  return { steps: rec.steps, finalSnapshot: s }
}

export const searchingOperations: OperationDefinition<SearchingState, unknown, SearchingSnapshot>[] = [
  { id: 'seq-get', label: 'Get', inputKind: 'key', variants: ['sequential'], run: (s, k) => runSeqGet(s as SequentialSnapshot, k as number) },
  { id: 'seq-put', label: 'Put', inputKind: 'key', variants: ['sequential'], run: (s, k) => runSeqPut(s as SequentialSnapshot, k as number) },
  { id: 'bin-get', label: 'Get', inputKind: 'key', variants: ['binary'], run: (s, k) => runBinGet(s as BinarySnapshot, k as number) },
  { id: 'bin-put', label: 'Put', inputKind: 'key', variants: ['binary'], run: (s, k) => runBinPut(s as BinarySnapshot, k as number) },
]
