// SPEC.md §10.3: pseudocode, verbatim. HASH(key) = key mod M.
// Each strategy's three operations share one listing so line numbers are unique.

const CHAINING = [
  'CHAIN_INSERT(key):',
  '  i = HASH(key)',
  '  if key not in bucket[i]: append key to bucket[i]',
  'CHAIN_SEARCH(key):',
  '  i = HASH(key)',
  '  return key in bucket[i]',
  'CHAIN_DELETE(key):',
  '  i = HASH(key)',
  '  remove key from bucket[i] if present',
]

const PROBING = [
  'PROBE_INSERT(key):',
  '  i = HASH(key)',
  '  while slot[i] is occupied and slot[i] != key:',
  '    i = (i + 1) mod M',
  '  slot[i] = key',
  'PROBE_SEARCH(key):',
  '  i = HASH(key)',
  '  while slot[i] is occupied:',
  '    if slot[i] == key: return HIT',
  '    i = (i + 1) mod M',
  '  return MISS',
  'PROBE_DELETE(key):',
  '  i = HASH(key); probe until slot[i] == key or slot[i] is empty',
  '  if slot[i] is empty: return MISS',
  '  slot[i] = EMPTY',
  '  for each key in the cluster after i: remove it and PROBE_INSERT it again',
]

export const hashTablePseudocode: Record<string, string[]> = {
  'chain-insert': CHAINING,
  'chain-search': CHAINING,
  'chain-delete': CHAINING,
  'probe-insert': PROBING,
  'probe-search': PROBING,
  'probe-delete': PROBING,
}
