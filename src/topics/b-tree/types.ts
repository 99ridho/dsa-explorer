// SPEC.md §10.12: snapshot shape. Semantics follow algs4 BTree.java with M = 4.
export const BTREE_M = 4
export const MAX_KEYS = 30

export type BTreeHighlight = 'current' | 'found' | 'new' | 'split'

export interface BTreeEntry {
  key: number
  childId: string | null // null in an external node
}

export interface BTreeNode {
  id: string
  entries: BTreeEntry[]
  external: boolean
}

export type BTreeLayoutNode = BTreeNode & { x: number; y: number; highlight?: BTreeHighlight; entryIndex?: number }

export interface BTreeSnapshot {
  M: number
  nodes: Record<string, BTreeLayoutNode>
  rootId: string
  height: number // 0 while the root is external
  n: number // number of keys
  nextId: number
}

export type BTreeState = BTreeSnapshot

export const nodeId = (n: number) => `b${n}`
