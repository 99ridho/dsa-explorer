// Classic binary-tree layout: SPEC.md §10.1 "Canvas layout".
// x = in-order index × hGap, y = depth × vGap. Shared by BST and Binary Heap:
// the caller supplies a child accessor, so heap indices (2k, 2k+1) work as well as node ids.

export interface TreePosition {
  x: number
  y: number
}

export interface TreeLayoutOptions {
  hGap?: number
  vGap?: number
}

export const TREE_H_GAP = 56
export const TREE_V_GAP = 72

export function layoutBinaryTree<Id extends string | number>(
  rootId: Id | null,
  getChildren: (id: Id) => { left: Id | null; right: Id | null },
  { hGap = TREE_H_GAP, vGap = TREE_V_GAP }: TreeLayoutOptions = {},
): Record<Id, TreePosition> {
  const positions = {} as Record<Id, TreePosition>
  let inorderIndex = 0

  const visit = (id: Id | null, depth: number) => {
    if (id === null) return
    const { left, right } = getChildren(id)
    visit(left, depth + 1)
    positions[id] = { x: inorderIndex * hGap, y: depth * vGap }
    inorderIndex += 1
    visit(right, depth + 1)
  }

  visit(rootId, 0)
  return positions
}

export interface MultiwayLayoutOptions {
  hGap?: number // space between sibling subtrees
  vGap?: number
}

/**
 * Layout for nodes of varying width (a B-tree node is a run of key boxes): a post-order pass
 * sizes each subtree, children pack left to right, and a parent centers over its children.
 * `x` is the node's center; `y = depth × vGap`. SPEC.md §10.12 "Canvas layout".
 */
export function layoutMultiwayTree<Id extends string | number>(
  rootId: Id | null,
  getChildren: (id: Id) => Id[],
  getWidth: (id: Id) => number,
  { hGap = 12, vGap = 70 }: MultiwayLayoutOptions = {},
): Record<Id, TreePosition> {
  const positions = {} as Record<Id, TreePosition>
  const subtreeWidth = {} as Record<Id, number>

  const measure = (id: Id): number => {
    const children = getChildren(id)
    const kids = children.reduce((sum, c) => sum + measure(c), 0) + Math.max(0, children.length - 1) * hGap
    subtreeWidth[id] = Math.max(getWidth(id), kids)
    return subtreeWidth[id]
  }

  const place = (id: Id, left: number, depth: number) => {
    const width = subtreeWidth[id]
    positions[id] = { x: left + width / 2, y: depth * vGap }
    const children = getChildren(id)
    const kidsWidth = children.reduce((sum, c) => sum + subtreeWidth[c], 0) + Math.max(0, children.length - 1) * hGap
    let cursor = left + (width - kidsWidth) / 2
    for (const c of children) {
      place(c, cursor, depth + 1)
      cursor += subtreeWidth[c] + hGap
    }
  }

  if (rootId !== null) {
    measure(rootId)
    place(rootId, 0, 0)
  }
  return positions
}
