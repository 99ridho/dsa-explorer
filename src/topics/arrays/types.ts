// SPEC.md §10.6: snapshot shape. Values are never null: Java default-initializes to 0.
export type ArraysHighlightKind = 'read' | 'write' | 'copy' | 'error'

export interface ArraysSnapshot {
  values: number[]
  highlight?: { indices: number[]; kind: ArraysHighlightKind }
  resizing?: { values: number[]; copied: number } // the new array while a resize is in progress
}

export type ArraysState = ArraysSnapshot

export const MAX_SLOTS = 16
/** Bytes of an int[N] on a typical 64-bit JVM: 16 object overhead + 4 length + 4 padding + 4 per int. */
export const HEADER_BYTES = 24
export const INT_BYTES = 4
