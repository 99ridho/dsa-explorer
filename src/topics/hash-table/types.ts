// SPEC.md §10.3: state & snapshot shapes. M is fixed at 11 (decision, §17).

export const HASH_TABLE_M = 11

export type HashStrategy = 'chaining' | 'probing'

export interface ChainingSnapshot {
  strategy: 'chaining'
  buckets: number[][]
  M: number
  highlight?: { bucket: number; index?: number }
}

export interface ProbingSnapshot {
  strategy: 'probing'
  slots: (number | null)[]
  M: number
  highlight?: { index: number; kind: 'probing' | 'found' | 'empty' }
}

export type HashTableSnapshot = ChainingSnapshot | ProbingSnapshot
export type HashTableState = HashTableSnapshot
