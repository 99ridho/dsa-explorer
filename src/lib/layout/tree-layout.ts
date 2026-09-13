// Classic binary-tree layout — SPEC.md §10.1 "Canvas layout".
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
