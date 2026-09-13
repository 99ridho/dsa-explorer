// SPEC.md §10.3 — pseudocode, verbatim. HASH(key) = key mod M.

export const hashTablePseudocode: Record<string, string[]> = {
  'chain-insert': ['CHAIN_INSERT(key):', '  i = HASH(key)', '  if key not in bucket[i]: append key to bucket[i]'],
  'chain-search': ['CHAIN_SEARCH(key):', '  i = HASH(key)', '  return key in bucket[i]'],
  'chain-delete': ['CHAIN_DELETE(key):', '  i = HASH(key)', '  remove key from bucket[i] if present'],
  'probe-insert': [
    'PROBE_INSERT(key):',
    '  i = HASH(key)',
    '  while slot[i] is occupied and slot[i] != key:',
    '    i = (i + 1) mod M',
    '  slot[i] = key',
  ],
  'probe-search': [
    'PROBE_SEARCH(key):',
    '  i = HASH(key)',
    '  while slot[i] is occupied:',
    '    if slot[i] == key: return HIT',
    '    i = (i + 1) mod M',
    '  return MISS',
  ],
}
