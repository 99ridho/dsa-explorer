// SPEC.md §10.1 — operations. Each `run()` emits exactly the steps in the spec's
// step tables, in order, with the listed `highlightLine`.
import type { OperationDefinition, OperationResult, Step } from '@/types/step-engine'
import { layoutBinaryTree } from '@/lib/layout/tree-layout'
import { nodeId, type BSTHighlight, type BSTSnapshot, type BSTState } from './types'

// ---------- snapshot helpers ----------

/** Deep-clones the node map and drops every highlight. */
function cloneSnapshot(snapshot: BSTSnapshot): BSTSnapshot {
  const nodes: BSTSnapshot['nodes'] = {}
  for (const [id, node] of Object.entries(snapshot.nodes)) {
    const { highlight: _ignored, ...rest } = node
    nodes[id] = { ...rest }
  }
  return { nodes, rootId: snapshot.rootId }
}

/** Recomputes x/y for every node from the current links. */
export function withLayout(snapshot: BSTSnapshot): BSTSnapshot {
  const positions = layoutBinaryTree(snapshot.rootId, (id) => ({
    left: snapshot.nodes[id].left,
    right: snapshot.nodes[id].right,
  }))
  const nodes: BSTSnapshot['nodes'] = {}
  for (const [id, node] of Object.entries(snapshot.nodes)) {
    const pos = positions[id]
    nodes[id] = { ...node, x: pos?.x ?? 0, y: pos?.y ?? 0 }
  }
  return { nodes, rootId: snapshot.rootId }
}

type Highlights = Record<string, BSTHighlight>

function snapshotWith(base: BSTSnapshot, highlights: Highlights): BSTSnapshot {
  const snap = withLayout(cloneSnapshot(base))
  for (const [id, highlight] of Object.entries(highlights)) {
    if (snap.nodes[id]) snap.nodes[id].highlight = highlight
  }
  return snap
}

class StepRecorder {
  readonly steps: Step<BSTSnapshot>[] = []

  push(
    base: BSTSnapshot,
    highlightLine: number,
    description: string,
    highlights: Highlights = {},
    variables?: Step<BSTSnapshot>['variables'],
  ) {
    this.steps.push({
      id: this.steps.length,
      description,
      highlightLine,
      snapshot: snapshotWith(base, highlights),
      ...(variables ? { variables } : {}),
    })
  }
}

/** Walks from the root toward `key`, emitting one descend step per node passed. */
function descend(
  rec: StepRecorder,
  tree: BSTSnapshot,
  key: number,
  lines: { less: number; greater: number },
): { parentId: string | null; foundId: string | null; wentLeft: boolean } {
  let currentId = tree.rootId
  let parentId: string | null = null
  let wentLeft = false

  while (currentId !== null) {
    const node = tree.nodes[currentId]
    if (key === node.key) {
      return { parentId, foundId: currentId, wentLeft }
    }
    if (key < node.key) {
      rec.push(tree, lines.less, `${key} < ${node.key} → go left`, { [currentId]: 'current' })
      parentId = currentId
      currentId = node.left
      wentLeft = true
    } else {
      rec.push(tree, lines.greater, `${key} > ${node.key} → go right`, { [currentId]: 'current' })
      parentId = currentId
      currentId = node.right
      wentLeft = false
    }
  }
  return { parentId, foundId: null, wentLeft }
}

// ---------- pure (step-free) mutations, reused by randomize/createInitialState ----------

export function insertKey(tree: BSTSnapshot, key: number): BSTSnapshot {
  const next = cloneSnapshot(tree)
  const id = nodeId(key)
  if (next.nodes[id]) return withLayout(next)

  next.nodes[id] = { id, key, left: null, right: null, x: 0, y: 0 }
  if (next.rootId === null) {
    next.rootId = id
    return withLayout(next)
  }
  let currentId = next.rootId
  for (;;) {
    const node = next.nodes[currentId]
    const side: 'left' | 'right' = key < node.key ? 'left' : 'right'
    const child = node[side]
    if (child === null) {
      node[side] = id
      break
    }
    currentId = child
  }
  return withLayout(next)
}

export function emptyTree(): BSTSnapshot {
  return { nodes: {}, rootId: null }
}

export function buildTree(keys: number[]): BSTSnapshot {
  return keys.reduce(insertKey, emptyTree())
}

// ---------- Insert ----------

export function runInsert(state: BSTState, key: number): OperationResult<BSTSnapshot> {
  const rec = new StepRecorder()
  const tree = cloneSnapshot(state)

  const { parentId, foundId, wentLeft } = descend(rec, tree, key, { less: 4, greater: 6 })

  if (foundId !== null) {
    rec.push(tree, 4, `${key} already exists — a BST does not store duplicate keys.`, {
      [foundId]: 'found',
    })
    return { steps: rec.steps, finalSnapshot: withLayout(tree) }
  }

  const id = nodeId(key)
  tree.nodes[id] = { id, key, left: null, right: null, x: 0, y: 0 }
  if (parentId === null) {
    tree.rootId = id
  } else {
    tree.nodes[parentId][wentLeft ? 'left' : 'right'] = id
  }
  rec.push(tree, 3, `Empty spot found — inserting ${key} here.`, { [id]: 'new' })

  return { steps: rec.steps, finalSnapshot: withLayout(tree) }
}

// ---------- Search ----------

export function runSearch(state: BSTState, key: number): OperationResult<BSTSnapshot> {
  const rec = new StepRecorder()
  const tree = cloneSnapshot(state)

  const { foundId } = descend(rec, tree, key, { less: 4, greater: 5 })

  if (foundId !== null) {
    rec.push(tree, 3, `${key} == ${key} → HIT. Key found.`, { [foundId]: 'found' })
  } else {
    rec.push(tree, 2, `Reached an empty link → MISS. ${key} is not in the tree.`)
  }
  return { steps: rec.steps, finalSnapshot: withLayout(tree) }
}

// ---------- Delete (Hibbard) ----------

function minId(tree: BSTSnapshot, startId: string): string {
  let id = startId
  while (tree.nodes[id].left !== null) id = tree.nodes[id].left as string
  return id
}

/** Re-links `parentId`'s child slot (or the root) to `replacementId`. */
function relink(tree: BSTSnapshot, parentId: string | null, wentLeft: boolean, replacementId: string | null) {
  if (parentId === null) {
    tree.rootId = replacementId
  } else {
    tree.nodes[parentId][wentLeft ? 'left' : 'right'] = replacementId
  }
}

export function runDelete(state: BSTState, key: number): OperationResult<BSTSnapshot> {
  const rec = new StepRecorder()
  const tree = cloneSnapshot(state)

  const { parentId, foundId, wentLeft } = descend(rec, tree, key, { less: 3, greater: 4 })

  if (foundId === null) {
    rec.push(tree, 2, `Reached an empty link — ${key} is not in the tree, nothing to delete.`)
    return { steps: rec.steps, finalSnapshot: withLayout(tree) }
  }

  const target = tree.nodes[foundId]
  const childCount = (target.left ? 1 : 0) + (target.right ? 1 : 0)
  rec.push(tree, 5, `Found ${key} — this node has ${childCount} children.`, { [foundId]: 'delete-target' })

  if (target.right === null) {
    relink(tree, parentId, wentLeft, target.left)
    delete tree.nodes[foundId]
    rec.push(tree, 6, 'Node has at most one child — splice it out directly.')
    return { steps: rec.steps, finalSnapshot: withLayout(tree) }
  }
  if (target.left === null) {
    relink(tree, parentId, wentLeft, target.right)
    delete tree.nodes[foundId]
    rec.push(tree, 7, 'Node has at most one child — splice it out directly.')
    return { steps: rec.steps, finalSnapshot: withLayout(tree) }
  }

  // Two children: successor = MIN(root.right)
  const successorId = minId(tree, target.right)
  const successor = tree.nodes[successorId]
  rec.push(
    tree,
    8,
    `Two children: replacing ${key} with its in-order successor ${successor.key}.`,
    { [foundId]: 'delete-target', [successorId]: 'found' },
  )

  // successor.right = DELETE_MIN(root.right)
  if (successorId === target.right) {
    // successor is the direct right child; its right subtree stays in place
  } else {
    // detach successor from its parent (it has no left child by construction)
    let succParentId = target.right
    while (tree.nodes[succParentId].left !== successorId) {
      succParentId = tree.nodes[succParentId].left as string
    }
    tree.nodes[succParentId].left = successor.right
    successor.right = target.right
  }
  // successor.left = root.left; root = successor
  successor.left = target.left
  relink(tree, parentId, wentLeft, successorId)
  delete tree.nodes[foundId]
  rec.push(tree, 11, `${successor.key} now takes the place of ${key}.`, { [successorId]: 'found' })

  return { steps: rec.steps, finalSnapshot: withLayout(tree) }
}

// ---------- Inorder traversal ----------

export function runInorder(state: BSTState): OperationResult<BSTSnapshot> {
  const rec = new StepRecorder()
  const tree = cloneSnapshot(state)
  const visited: number[] = []

  const walk = (id: string | null) => {
    if (id === null) return
    const node = tree.nodes[id]
    walk(node.left)
    visited.push(node.key)
    rec.push(tree, 4, `VISIT ${node.key} — visited so far: ${visited.join(', ')}`, { [id]: 'current' }, {
      visited: visited.join(', '),
    })
    walk(node.right)
  }

  if (tree.rootId === null) {
    rec.push(tree, 2, 'Tree is empty — nothing to visit.')
  } else {
    walk(tree.rootId)
  }
  return { steps: rec.steps, finalSnapshot: withLayout(tree) }
}

// ---------- registry ----------

export const bstOperations: OperationDefinition<BSTState, unknown, BSTSnapshot>[] = [
  { id: 'insert', label: 'Insert', inputKind: 'key', run: (s, k) => runInsert(s, k as number) },
  { id: 'search', label: 'Search', inputKind: 'key', run: (s, k) => runSearch(s, k as number) },
  { id: 'delete', label: 'Delete', inputKind: 'key', run: (s, k) => runDelete(s, k as number) },
  { id: 'inorder', label: 'Inorder Traversal', inputKind: 'none', run: (s) => runInorder(s) },
]
