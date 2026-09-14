// SPEC.md §19.3: snapshot shape. Waiting orders are real linked nodes (lib/linked-nodes); the
// served log is a resizing array whose capacity is its length.
import type { LinkedNode } from '@/lib/linked-nodes'

export const FIRST_ORDER = 101
export const MAX_WAITING = 12
export const MAX_ORDERS = 32
export const INITIAL_CAPACITY = 2

export type CounterDesign = 'queue' | 'stack'

export interface CanteenSnapshot {
  design: CounterDesign
  nodes: Record<string, LinkedNode>
  firstId: string | null // front of the queue, or top of the stack
  lastId: string | null // back of the queue; null for the stack
  nextId: number
  log: (number | null)[]
  n: number
  nextOrder: number
  skipped: number
  highlight?: { ids?: string[]; indices?: number[]; kind: 'new' | 'current' | 'found' | 'write' | 'copy' }
  range?: { lo: number; hi: number }
}

export type CanteenState = CanteenSnapshot
