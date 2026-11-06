// SPEC.md §10.11: pseudocode, verbatim. Get and put of an implementation share one listing.

const SEQUENTIAL = [
  'GET(key):',
  '  for node = first; node is not null; node = node.next:',
  '    if key == node.key: return node.value',
  '  return null',
  'PUT(key, value):',
  '  for node = first; node is not null; node = node.next:',
  '    if key == node.key: node.value = value; return',
  '  first = NODE(key, value, first)',
]

const BINARY = [
  'GET(key):',
  '  rank = RANK(key)',
  '  if rank < size and keys[rank] == key: return values[rank]',
  '  return null',
  'PUT(key, value):',
  '  rank = RANK(key)',
  '  if rank < size and keys[rank] == key: values[rank] = value; return',
  '  for j = size downto rank + 1: keys[j] = keys[j - 1]; values[j] = values[j - 1]',
  '  keys[rank] = key; values[rank] = value; size = size + 1',
  'RANK(key):',
  '  low = 0; high = size - 1',
  '  while low <= high:',
  '    middle = low + (high - low) / 2',
  '    if key < keys[middle]: high = middle - 1',
  '    else if key > keys[middle]: low = middle + 1',
  '    else: return middle',
  '  return low',
]

export const searchingPseudocode: Record<string, string[]> = {
  'seq-get': SEQUENTIAL,
  'seq-put': SEQUENTIAL,
  'bin-get': BINARY,
  'bin-put': BINARY,
}
