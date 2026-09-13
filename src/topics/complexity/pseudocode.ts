// SPEC.md §10.5: pseudocode, verbatim. Both operations share the listing.
const LISTING = [
  'DOUBLING_RATIO(problem):',
  '  prev = 0',
  '  for N = start, 2 * start, 4 * start, ... (6 rounds):',
  '    accesses = ACCESSES(problem, N)',
  '    ratio = accesses / prev',
  '    prev = accesses',
  'ACCESSES(problem, N):',
  '  1-sum: N items, 1 access each',
  '  2-sum: N(N-1)/2 pairs, 2 accesses each',
  '  3-sum: N(N-1)(N-2)/6 triples, 3 accesses each',
]

export const complexityPseudocode: Record<string, string[]> = {
  'doubling-ratio': LISTING,
  'count-accesses': LISTING,
}
