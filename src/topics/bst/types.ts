// SPEC.md §10.1: state & snapshot shapes.

export type BSTHighlight = 'current' | 'new' | 'found' | 'delete-target'

export interface BSTNode {
  id: string
  key: number
  left: string | null
  right: string | null
}

export type BSTLayoutNode = BSTNode & { x: number; y: number; highlight?: BSTHighlight }

export interface BSTSnapshot {
  nodes: Record<string, BSTLayoutNode>
  rootId: string | null
}

// The tree persists as-is between operations.
export type BSTState = BSTSnapshot

/** BST keys are unique, so the key doubles as a stable node id. */
export const nodeId = (key: number) => `k${key}`
