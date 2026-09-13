// SPEC.md §10.2: pseudocode, verbatim (max-heap form; min-heap flips every comparison).
// Line numbers are the contract for `highlightLine`, so there are no blank separator lines.

const SINK = [
  'SINK(k):',
  '  while 2k <= n:',
  '    j = 2k',
  '    if j < n and array[j] < array[j+1]: j = j + 1',
  '    if array[k] >= array[j]: break',
  '    SWAP(k, j)',
  '    k = j',
]

export const heapPseudocode: Record<string, string[]> = {
  insert: [
    'INSERT(value):',
    '  n = n + 1',
    '  array[n] = value',
    '  SWIM(n)',
    'SWIM(k):',
    '  while k > 1 and array[k/2] < array[k]:',
    '    SWAP(k, k/2)',
    '    k = k/2',
  ],
  'remove-extreme': [
    'REMOVE_EXTREME():',
    '  extreme = array[1]',
    '  SWAP(1, n)',
    '  n = n - 1',
    '  SINK(1)',
    '  return extreme',
    ...SINK,
  ],
  'build-heap': ['BUILD_HEAP(a):', '  array = a; n = length(a)', '  for k = n/2 downto 1:', '    SINK(k)', ...SINK],
  heapsort: [
    'HEAPSORT(a):',
    '  BUILD_HEAP(a)',
    '  while n > 1:',
    '    SWAP(1, n)',
    '    n = n - 1',
    '    SINK(1)',
    ...SINK,
  ],
}

// Both remove operations share one listing.
heapPseudocode['remove-max'] = heapPseudocode['remove-extreme']
heapPseudocode['remove-min'] = heapPseudocode['remove-extreme']
