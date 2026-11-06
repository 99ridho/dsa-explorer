// SPEC.md §10.10: pseudocode, verbatim.
export const linkedListPseudocode: Record<string, string[]> = {
  'insert-first': [
    'INSERT_FIRST(item):',
    '  oldFirst = first',
    '  first = NODE(item)',
    '  first.next = oldFirst',
    '  if oldFirst is null: last = first',
  ],
  'insert-last': [
    'INSERT_LAST(item):',
    '  oldLast = last',
    '  last = NODE(item)',
    '  if oldLast is null: first = last',
    '  else: oldLast.next = last',
  ],
  'remove-first': [
    'REMOVE_FIRST():',
    '  if first is null: return null',
    '  item = first.item',
    '  first = first.next',
    '  if first is null: last = null',
    '  return item',
  ],
  traverse: ['TRAVERSE():', '  for node = first; node is not null; node = node.next:', '    VISIT(node.item)'],
}
