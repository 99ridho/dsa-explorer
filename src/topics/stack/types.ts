// SPEC.md §10.8: snapshot shapes for both stack implementations, plus the evaluate view.
import type { LinkedNode } from '@/lib/linked-nodes'

export type StackImpl = 'array' | 'linked'

export type ArrayHighlightKind = 'write' | 'read' | 'copy' | 'full'
export type LinkedHighlightKind = 'new' | 'current'

/** Present only on the steps of `evaluate`; the student's stack underneath is untouched. */
export interface EvalView {
  tokens: string[]
  cursor: number
  operands: number[]
  operators: string[]
  focus?: 'operand' | 'operator' | 'apply'
}

export interface ArrayStackSnapshot {
  impl: 'array'
  slots: (number | null)[]
  n: number
  highlight?: { indices: number[]; kind: ArrayHighlightKind }
  eval?: EvalView
}

export interface LinkedStackSnapshot {
  impl: 'linked'
  nodes: Record<string, LinkedNode>
  firstId: string | null
  nextId: number
  highlight?: { ids: string[]; kind: LinkedHighlightKind }
  eval?: EvalView
}

export type StackSnapshot = ArrayStackSnapshot | LinkedStackSnapshot
export type StackState = StackSnapshot

export const MAX_CAPACITY = 32
export const MAX_TOKENS = 40
