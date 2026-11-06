// SPEC.md §10.2: pseudocode, verbatim (max-heap form; min-heap flips every comparison).
// Line numbers are the contract for `highlightLine`, so there are no blank separator lines.

const SINK = [
  'SINK(index):',
  '  while 2 * index <= size:',
  '    child = 2 * index',
  '    if child < size and heap[child] < heap[child + 1]: child = child + 1',
  '    if heap[index] >= heap[child]: break',
  '    SWAP(index, child)',
  '    index = child',
]

export const heapPseudocode: Record<string, string[]> = {
  insert: [
    'INSERT(value):',
    '  size = size + 1',
    '  heap[size] = value',
    '  SWIM(size)',
    'SWIM(index):',
    '  while index > 1 and heap[index / 2] < heap[index]:',
    '    SWAP(index, index / 2)',
    '    index = index / 2',
  ],
  'remove-extreme': [
    'REMOVE_TOP():',
    '  top = heap[1]',
    '  SWAP(1, size)',
    '  size = size - 1',
    '  SINK(1)',
    '  return top',
    ...SINK,
  ],
  'build-heap': ['BUILD_HEAP(items):', '  heap = items; size = length(items)', '  for index = size / 2 downto 1:', '    SINK(index)', ...SINK],
  heapsort: [
    'HEAPSORT(items):',
    '  BUILD_HEAP(items)',
    '  while size > 1:',
    '    SWAP(1, size)',
    '    size = size - 1',
    '    SINK(1)',
    ...SINK,
  ],
}

// Both remove operations share one listing.
heapPseudocode['remove-max'] = heapPseudocode['remove-extreme']
heapPseudocode['remove-min'] = heapPseudocode['remove-extreme']
