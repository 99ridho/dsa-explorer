// SPEC.md §10.3: operations. Each `run()` emits exactly the steps in the spec's step tables.
import type { OperationDefinition, OperationResult, Step } from '@/types/step-engine'
import { HASH_TABLE_M, type ChainingSnapshot, type HashTableSnapshot, type HashTableState, type ProbingSnapshot } from './types'

export const hash = (key: number, M: number) => ((key % M) + M) % M

// ---------- snapshot helpers ----------

function cloneChaining(s: ChainingSnapshot): ChainingSnapshot {
  return { strategy: 'chaining', buckets: s.buckets.map((b) => [...b]), M: s.M }
}
function cloneProbing(s: ProbingSnapshot): ProbingSnapshot {
  return { strategy: 'probing', slots: [...s.slots], M: s.M }
}

class ChainRecorder {
  readonly steps: Step<HashTableSnapshot>[] = []
  push(base: ChainingSnapshot, highlightLine: number, description: string, highlight?: ChainingSnapshot['highlight']) {
    const snapshot = cloneChaining(base)
    if (highlight) snapshot.highlight = { ...highlight }
    this.steps.push({ id: this.steps.length, description, highlightLine, snapshot })
  }
}
class ProbeRecorder {
  readonly steps: Step<HashTableSnapshot>[] = []
  push(base: ProbingSnapshot, highlightLine: number, description: string, highlight?: ProbingSnapshot['highlight']) {
    const snapshot = cloneProbing(base)
    if (highlight) snapshot.highlight = { ...highlight }
    this.steps.push({ id: this.steps.length, description, highlightLine, snapshot })
  }
}

// ---------- step-free construction, shared by createInitialState and randomize ----------

export function emptyChaining(M = HASH_TABLE_M): ChainingSnapshot {
  return { strategy: 'chaining', buckets: Array.from({ length: M }, () => []), M }
}
export function emptyProbing(M = HASH_TABLE_M): ProbingSnapshot {
  return { strategy: 'probing', slots: Array<number | null>(M).fill(null), M }
}
export function buildChaining(keys: number[], M = HASH_TABLE_M): ChainingSnapshot {
  const s = emptyChaining(M)
  for (const k of keys) {
    const b = s.buckets[hash(k, M)]
    if (!b.includes(k)) b.push(k)
  }
  return s
}
export function buildProbing(keys: number[], M = HASH_TABLE_M): ProbingSnapshot {
  const s = emptyProbing(M)
  for (const k of keys) probeSilently(s, k)
  return s
}
function probeSilently(s: ProbingSnapshot, key: number) {
  let i = hash(key, s.M)
  let tries = 0
  while (s.slots[i] !== null && s.slots[i] !== key && tries < s.M) {
    i = (i + 1) % s.M
    tries++
  }
  if (s.slots[i] === null || s.slots[i] === key) s.slots[i] = key
}

// ---------- chaining ----------

const asChaining = (state: HashTableState): ChainingSnapshot =>
  state.strategy === 'chaining' ? cloneChaining(state) : emptyChaining(state.M)

/** Hash step plus one compare step per node; returns the index of `key` in the bucket or -1. */
function chainScan(rec: ChainRecorder, s: ChainingSnapshot, key: number, lines: { hash: number; compare: number }) {
  const i = hash(key, s.M)
  rec.push(s, lines.hash, `${key} mod ${s.M} = ${i}, so use bucket ${i}.`, { bucket: i })
  const bucket = s.buckets[i]
  for (let idx = 0; idx < bucket.length; idx++) {
    rec.push(s, lines.compare, `Comparing ${key} with ${bucket[idx]} in bucket ${i}.`, { bucket: i, index: idx })
    if (bucket[idx] === key) return { i, idx }
  }
  return { i, idx: -1 }
}

export function runChainInsert(state: HashTableState, key: number): OperationResult<HashTableSnapshot> {
  const rec = new ChainRecorder()
  const s = asChaining(state)
  const { i, idx } = chainScan(rec, s, key, { hash: 2, compare: 3 })
  if (idx >= 0) {
    rec.push(s, 3, `${key} is already in bucket ${i}, so nothing changes.`, { bucket: i, index: idx })
  } else {
    s.buckets[i].push(key)
    rec.push(s, 3, `Appending ${key} to bucket ${i}.`, { bucket: i, index: s.buckets[i].length - 1 })
  }
  return { steps: rec.steps, finalSnapshot: cloneChaining(s) }
}

export function runChainSearch(state: HashTableState, key: number): OperationResult<HashTableSnapshot> {
  const rec = new ChainRecorder()
  const s = asChaining(state)
  const { i, idx } = chainScan(rec, s, key, { hash: 5, compare: 6 })
  if (idx >= 0) rec.push(s, 6, `Found ${key} in bucket ${i}.`, { bucket: i, index: idx })
  else rec.push(s, 6, `Reached the end of bucket ${i}. ${key} is not in the table.`, { bucket: i })
  return { steps: rec.steps, finalSnapshot: cloneChaining(s) }
}

export function runChainDelete(state: HashTableState, key: number): OperationResult<HashTableSnapshot> {
  const rec = new ChainRecorder()
  const s = asChaining(state)
  const { i, idx } = chainScan(rec, s, key, { hash: 8, compare: 9 })
  if (idx >= 0) {
    s.buckets[i].splice(idx, 1)
    rec.push(s, 9, `Removing ${key} from bucket ${i}.`, { bucket: i })
  } else {
    rec.push(s, 9, `Reached the end of bucket ${i}. ${key} is not in the table.`, { bucket: i })
  }
  return { steps: rec.steps, finalSnapshot: cloneChaining(s) }
}

// ---------- linear probing ----------

const asProbing = (state: HashTableState): ProbingSnapshot =>
  state.strategy === 'probing' ? cloneProbing(state) : emptyProbing(state.M)

const occupied = (s: ProbingSnapshot) => s.slots.filter((v) => v !== null).length

/** Emits the probe steps for `key` and returns the slot where the probe stopped (key or empty), or -1 when the table is full. */
function probeScan(rec: ProbeRecorder, s: ProbingSnapshot, key: number, lines: { hash: number; probe: number }, start?: string) {
  let i = hash(key, s.M)
  rec.push(s, lines.hash, start ?? `${key} mod ${s.M} = ${i}, so start at slot ${i}.`, { index: i, kind: 'probing' })
  let tries = 0
  while (s.slots[i] !== null && s.slots[i] !== key) {
    if (tries >= s.M) return -1
    rec.push(s, lines.probe, `Slot ${i} is occupied by ${s.slots[i]}. Probe the next slot.`, { index: i, kind: 'probing' })
    i = (i + 1) % s.M
    tries++
  }
  return i
}

export function runProbeInsert(state: HashTableState, key: number): OperationResult<HashTableSnapshot> {
  const rec = new ProbeRecorder()
  const s = asProbing(state)
  if (occupied(s) >= s.M && !s.slots.includes(key)) {
    rec.push(s, 3, `Every slot is occupied, so ${key} cannot be inserted.`)
    return { steps: rec.steps, finalSnapshot: cloneProbing(s) }
  }
  const i = probeScan(rec, s, key, { hash: 2, probe: 3 })
  if (s.slots[i] === key) {
    rec.push(s, 3, `${key} is already in slot ${i}.`, { index: i, kind: 'found' })
  } else {
    s.slots[i] = key
    rec.push(s, 5, `Slot ${i} is empty. Placing ${key} here.`, { index: i, kind: 'found' })
  }
  return { steps: rec.steps, finalSnapshot: cloneProbing(s) }
}

export function runProbeSearch(state: HashTableState, key: number): OperationResult<HashTableSnapshot> {
  const rec = new ProbeRecorder()
  const s = asProbing(state)
  const i = probeScan(rec, s, key, { hash: 7, probe: 8 })
  if (i >= 0 && s.slots[i] === key) {
    rec.push(s, 9, `Slot ${i} holds ${key}: HIT.`, { index: i, kind: 'found' })
  } else if (i >= 0) {
    rec.push(s, 11, `Slot ${i} is empty: MISS. ${key} is not in the table.`, { index: i, kind: 'empty' })
  } else {
    rec.push(s, 11, `Every slot was probed without finding ${key}: MISS.`)
  }
  return { steps: rec.steps, finalSnapshot: cloneProbing(s) }
}

export function runProbeDelete(state: HashTableState, key: number): OperationResult<HashTableSnapshot> {
  const rec = new ProbeRecorder()
  const s = asProbing(state)
  const i = probeScan(rec, s, key, { hash: 13, probe: 13 })
  if (i < 0 || s.slots[i] !== key) {
    const at = i < 0 ? hash(key, s.M) : i
    rec.push(s, 14, `Slot ${at} is empty: MISS. ${key} is not in the table.`, { index: at, kind: 'empty' })
    return { steps: rec.steps, finalSnapshot: cloneProbing(s) }
  }
  s.slots[i] = null
  rec.push(s, 15, `Removing ${key} from slot ${i}.`, { index: i, kind: 'empty' })

  // Rehash the rest of the cluster so later searches do not stop early at the hole.
  let j = (i + 1) % s.M
  while (s.slots[j] !== null) {
    const v = s.slots[j] as number
    s.slots[j] = null
    rec.push(s, 16, `Reinserting ${v} from slot ${j} so later searches still find it.`, { index: j, kind: 'probing' })
    const target = probeScan(rec, s, v, { hash: 13, probe: 13 }, `${v} mod ${s.M} = ${hash(v, s.M)}, so start at slot ${hash(v, s.M)}.`)
    s.slots[target] = v
    rec.push(s, 5, `Slot ${target} is empty. Placing ${v} here.`, { index: target, kind: 'found' })
    j = (j + 1) % s.M
  }
  return { steps: rec.steps, finalSnapshot: cloneProbing(s) }
}

// ---------- registry ----------

export const hashTableOperations: OperationDefinition<HashTableState, unknown, HashTableSnapshot>[] = [
  { id: 'chain-insert', label: 'Insert', inputKind: 'key', variants: ['chaining'], run: (s, k) => runChainInsert(s, k as number) },
  { id: 'chain-search', label: 'Search', inputKind: 'key', variants: ['chaining'], run: (s, k) => runChainSearch(s, k as number) },
  { id: 'chain-delete', label: 'Delete', inputKind: 'key', variants: ['chaining'], run: (s, k) => runChainDelete(s, k as number) },
  { id: 'probe-insert', label: 'Insert', inputKind: 'key', variants: ['probing'], run: (s, k) => runProbeInsert(s, k as number) },
  { id: 'probe-search', label: 'Search', inputKind: 'key', variants: ['probing'], run: (s, k) => runProbeSearch(s, k as number) },
  { id: 'probe-delete', label: 'Delete', inputKind: 'key', variants: ['probing'], run: (s, k) => runProbeDelete(s, k as number) },
]
