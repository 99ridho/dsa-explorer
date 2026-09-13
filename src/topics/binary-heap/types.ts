// SPEC.md §10.2 — state & snapshot shapes.

export type HeapMode = 'max' | 'min'

export interface HeapSnapshot {
  array: number[] // 1-indexed conceptually; array[0] unused
  n: number // logical size (may be < array.length during sink/sortdown)
  highlight?: { indices: number[]; kind: 'comparing' | 'swapping' | 'sorted' }
  mode: HeapMode
}

export type HeapState = HeapSnapshot
