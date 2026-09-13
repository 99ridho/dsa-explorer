// SPEC.md §10.7: snapshot shapes for both queue implementations.
import type { LinkedNode } from '@/lib/linked-nodes'

export type QueueImpl = 'array' | 'linked'

export type ArrayHighlightKind = 'write' | 'read' | 'copy' | 'full'
export type LinkedHighlightKind = 'new' | 'current'

export interface ArrayQueueSnapshot {
  impl: 'array'
  slots: (number | null)[]
  first: number
  last: number
  n: number
  highlight?: { indices: number[]; kind: ArrayHighlightKind }
}

export interface LinkedQueueSnapshot {
  impl: 'linked'
  nodes: Record<string, LinkedNode>
  firstId: string | null
  lastId: string | null
  nextId: number
  highlight?: { ids: string[]; kind: LinkedHighlightKind }
}

export type QueueSnapshot = ArrayQueueSnapshot | LinkedQueueSnapshot
export type QueueState = QueueSnapshot

/** Largest capacity the demo grows to; past it an enqueue narrates a single refusal step. */
export const MAX_CAPACITY = 32
