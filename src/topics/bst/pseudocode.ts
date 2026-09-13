// SPEC.md §10.1: pseudocode, verbatim. Line numbers are the contract for `highlightLine`.

export const bstPseudocode: Record<string, string[]> = {
  insert: [
    'INSERT(root, key):',
    '  if root is EMPTY:',
    '    return NEW_NODE(key)',
    '  if key < root.key:',
    '    root.left = INSERT(root.left, key)',
    '  else if key > root.key:',
    '    root.right = INSERT(root.right, key)',
    '  return root',
  ],
  search: [
    'SEARCH(root, key):',
    '  if root is EMPTY: return MISS',
    '  if key == root.key: return HIT',
    '  if key < root.key: return SEARCH(root.left, key)',
    '  else: return SEARCH(root.right, key)',
  ],
  delete: [
    'DELETE(root, key):',
    '  if root is EMPTY: return EMPTY',
    '  if key < root.key: root.left = DELETE(root.left, key)',
    '  else if key > root.key: root.right = DELETE(root.right, key)',
    '  else:',
    '    if root.right is EMPTY: return root.left',
    '    if root.left is EMPTY: return root.right',
    '    successor = MIN(root.right)',
    '    successor.right = DELETE_MIN(root.right)',
    '    successor.left = root.left',
    '    root = successor',
    '  return root',
  ],
  inorder: [
    'INORDER(node):',
    '  if node is EMPTY: return',
    '  INORDER(node.left)',
    '  VISIT(node)',
    '  INORDER(node.right)',
  ],
}
