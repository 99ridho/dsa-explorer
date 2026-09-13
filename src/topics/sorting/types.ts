// SPEC.md §10.9: snapshot shape.
export type SortingHighlightKind = 'comparing' | 'exchanging' | 'marked' | 'sorted'

export interface SortingSnapshot {
  array: number[]
  highlight?: { indices: number[]; kind: SortingHighlightKind }
  sortedUpTo?: number // a[0..sortedUpTo-1] is known sorted
}

export type SortingState = SortingSnapshot

export const MIN_ITEMS = 2
export const MAX_ITEMS = 10
