// SPEC.md §10.9: pseudocode, verbatim.
export const sortingPseudocode: Record<string, string[]> = {
  load: ['LOAD(values):', '  a = values; N = length(a)'],
  'selection-sort': [
    'SELECTION_SORT(a):',
    '  for i = 0 to N - 1:',
    '    min = i',
    '    for j = i + 1 to N - 1:',
    '      if LESS(a[j], a[min]): min = j',
    '    EXCH(a, i, min)',
  ],
  'insertion-sort': [
    'INSERTION_SORT(a):',
    '  for i = 1 to N - 1:',
    '    for j = i downto 1:',
    '      if LESS(a[j], a[j-1]): EXCH(a, j, j-1)',
    '      else: break',
  ],
  shellsort: [
    'SHELLSORT(a):',
    '  h = 1',
    '  while h < N / 3: h = 3 * h + 1',
    '  while h >= 1:',
    '    for i = h to N - 1:',
    '      for j = i; j >= h; j = j - h:',
    '        if LESS(a[j], a[j-h]): EXCH(a, j, j-h)',
    '        else: break',
    '    h = h / 3',
  ],
}
