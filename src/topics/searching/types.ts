// SPEC.md §10.11: snapshot shapes for the two elementary symbol tables.
export type SearchingImpl = 'sequential' | 'binary'

export interface STNode {
  id: string
  key: number
  value: number
  next: string | null
}

export type SequentialHighlightKind = 'current' | 'found' | 'new'
export type BinaryHighlightKind = 'mid' | 'found' | 'shift' | 'new' | 'miss'

export interface SequentialSnapshot {
  impl: 'sequential'
  nodes: Record<string, STNode>
  firstId: string | null
  nextId: number
  highlight?: { ids: string[]; kind: SequentialHighlightKind }
}

export interface BinarySnapshot {
  impl: 'binary'
  keys: number[]
  vals: number[]
  highlight?: { indices: number[]; kind: BinaryHighlightKind }
  range?: { lo: number; hi: number } // the live window while RANK runs
}

export type SearchingSnapshot = SequentialSnapshot | BinarySnapshot
export type SearchingState = SearchingSnapshot

export const MAX_KEYS = 16
