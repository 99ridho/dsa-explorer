// SPEC.md §10.1: pseudocode, verbatim. Line numbers are the contract for `highlightLine`.

export const bstPseudocode: Record<string, string[]> = {
  insert: [
    'INSERT(node, key):',
    '  if node is EMPTY:',
    '    return NEW_NODE(key)',
    '  if key < node.key:',
    '    node.left = INSERT(node.left, key)',
    '  else if key > node.key:',
    '    node.right = INSERT(node.right, key)',
    '  return node',
  ],
  search: [
    'SEARCH(node, key):',
    '  if node is EMPTY: return MISS',
    '  if key == node.key: return HIT',
    '  if key < node.key: return SEARCH(node.left, key)',
    '  else: return SEARCH(node.right, key)',
  ],
  delete: [
    'DELETE(node, key):',
    '  if node is EMPTY: return EMPTY',
    '  if key < node.key: node.left = DELETE(node.left, key)',
    '  else if key > node.key: node.right = DELETE(node.right, key)',
    '  else:',
    '    if node.right is EMPTY: return node.left',
    '    if node.left is EMPTY: return node.right',
    '    successor = MIN(node.right)',
    '    successor.right = DELETE_MIN(node.right)',
    '    successor.left = node.left',
    '    node = successor',
    '  return node',
  ],
  inorder: [
    'INORDER(node):',
    '  if node is EMPTY: return',
    '  INORDER(node.left)',
    '  VISIT(node)',
    '  INORDER(node.right)',
  ],
}
