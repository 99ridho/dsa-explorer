// SPEC.md §10.10: pseudocode, verbatim.
export const linkedListPseudocode: Record<string, string[]> = {
  'insert-first': [
    'INSERT_FIRST(item):',
    '  oldfirst = first',
    '  first = NODE(item)',
    '  first.next = oldfirst',
    '  if oldfirst is null: last = first',
  ],
  'insert-last': [
    'INSERT_LAST(item):',
    '  oldlast = last',
    '  last = NODE(item)',
    '  if oldlast is null: first = last',
    '  else: oldlast.next = last',
  ],
  'remove-first': [
    'REMOVE_FIRST():',
    '  if first is null: return null',
    '  item = first.item',
    '  first = first.next',
    '  if first is null: last = null',
    '  return item',
  ],
  traverse: ['TRAVERSE():', '  for x = first; x is not null; x = x.next:', '    VISIT(x.item)'],
}
