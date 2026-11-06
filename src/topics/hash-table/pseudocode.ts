// SPEC.md §10.3: pseudocode, verbatim. HASH(key) = key mod M.
// Each strategy's three operations share one listing so line numbers are unique.

const CHAINING = [
  'CHAIN_INSERT(key):',
  '  index = HASH(key)',
  '  if key not in buckets[index]: append key to buckets[index]',
  'CHAIN_SEARCH(key):',
  '  index = HASH(key)',
  '  return key in buckets[index]',
  'CHAIN_DELETE(key):',
  '  index = HASH(key)',
  '  remove key from buckets[index] if present',
]

const PROBING = [
  'PROBE_INSERT(key):',
  '  index = HASH(key)',
  '  while keys[index] is not empty and keys[index] != key:',
  '    index = (index + 1) mod M',
  '  keys[index] = key',
  'PROBE_SEARCH(key):',
  '  index = HASH(key)',
  '  while keys[index] is not empty:',
  '    if keys[index] == key: return HIT',
  '    index = (index + 1) mod M',
  '  return MISS',
  'PROBE_DELETE(key):',
  '  index = HASH(key); probe until keys[index] == key or keys[index] is empty',
  '  if keys[index] is empty: return MISS',
  '  keys[index] = EMPTY',
  '  for each key in the cluster after index: remove it and PROBE_INSERT it again',
]

export const hashTablePseudocode: Record<string, string[]> = {
  'chain-insert': CHAINING,
  'chain-search': CHAINING,
  'chain-delete': CHAINING,
  'probe-insert': PROBING,
  'probe-search': PROBING,
  'probe-delete': PROBING,
}
