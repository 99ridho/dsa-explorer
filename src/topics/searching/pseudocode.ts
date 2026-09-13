// SPEC.md §10.11: pseudocode, verbatim. Get and put of an implementation share one listing.

const SEQUENTIAL = [
  'GET(key):',
  '  for x = first; x is not null; x = x.next:',
  '    if key == x.key: return x.val',
  '  return null',
  'PUT(key, val):',
  '  for x = first; x is not null; x = x.next:',
  '    if key == x.key: x.val = val; return',
  '  first = NODE(key, val, first)',
]

const BINARY = [
  'GET(key):',
  '  i = RANK(key)',
  '  if i < n and keys[i] == key: return vals[i]',
  '  return null',
  'PUT(key, val):',
  '  i = RANK(key)',
  '  if i < n and keys[i] == key: vals[i] = val; return',
  '  for j = n downto i + 1: keys[j] = keys[j-1]; vals[j] = vals[j-1]',
  '  keys[i] = key; vals[i] = val; n = n + 1',
  'RANK(key):',
  '  lo = 0; hi = n - 1',
  '  while lo <= hi:',
  '    mid = lo + (hi - lo) / 2',
  '    if key < keys[mid]: hi = mid - 1',
  '    else if key > keys[mid]: lo = mid + 1',
  '    else: return mid',
  '  return lo',
]

export const searchingPseudocode: Record<string, string[]> = {
  'seq-get': SEQUENTIAL,
  'seq-put': SEQUENTIAL,
  'bin-get': BINARY,
  'bin-put': BINARY,
}
