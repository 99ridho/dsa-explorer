// SPEC.md §10.10: snapshot shape.
import type { LinkedNode } from '@/lib/linked-nodes'

export type LinkedListHighlightKind = 'new' | 'current' | 'visited'

export interface LinkedListSnapshot {
  nodes: Record<string, LinkedNode>
  firstId: string | null
  lastId: string | null
  nextId: number
  highlight?: Record<string, LinkedListHighlightKind> // node id to kind, so a step can mark a current node and a visited prefix
}

export type LinkedListState = LinkedListSnapshot

export const MAX_NODES = 12
