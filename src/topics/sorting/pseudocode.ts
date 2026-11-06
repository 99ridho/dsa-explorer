// SPEC.md §10.9: pseudocode, verbatim.
export const sortingPseudocode: Record<string, string[]> = {
  load: ['LOAD(values):', '  items = values; N = length(items)'],
  'selection-sort': [
    'SELECTION_SORT(items):',
    '  for i = 0 to N - 1:',
    '    minIndex = i',
    '    for j = i + 1 to N - 1:',
    '      if LESS(items[j], items[minIndex]): minIndex = j',
    '    EXCHANGE(items, i, minIndex)',
  ],
  'insertion-sort': [
    'INSERTION_SORT(items):',
    '  for i = 1 to N - 1:',
    '    for j = i downto 1:',
    '      if LESS(items[j], items[j - 1]): EXCHANGE(items, j, j - 1)',
    '      else: break',
  ],
  shellsort: [
    'SHELLSORT(items):',
    '  gap = 1',
    '  while gap < N / 3: gap = 3 * gap + 1',
    '  while gap >= 1:',
    '    for i = gap to N - 1:',
    '      for j = i; j >= gap; j = j - gap:',
    '        if LESS(items[j], items[j - gap]): EXCHANGE(items, j, j - gap)',
    '        else: break',
    '    gap = gap / 3',
  ],
}
