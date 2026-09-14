// SPEC.md §19.2: pseudocode, verbatim.

const ADMIT_HEAD = [
  'ADMIT(severity, record):',
  '  if archive.get(record) is null: archive.put(record)',
  '  p = new Patient(nextArrival, severity, record)',
]

export const triagePseudocode: Record<string, string[]> = {
  'admit-priority': [
    ...ADMIT_HEAD,
    '  pq.insert(p)',
    'SWIM(k):',
    '  while k > 1 and pq[k] is more urgent than pq[k / 2]:',
    '    exchange pq[k] and pq[k / 2]; k = k / 2',
  ],
  'admit-arrival': [...ADMIT_HEAD, '  queue.enqueue(p)'],
  'treat-priority': [
    'TREAT_NEXT():',
    '  if pq is empty: return',
    '  p = pq[1]; move pq[n] to pq[1]; n = n - 1',
    '  SINK(1)',
    'SINK(k):',
    '  while 2k <= n:',
    '    j = the more urgent child of k',
    '    if pq[k] is at least as urgent as pq[j]: stop',
    '    exchange pq[k] and pq[j]; k = j',
  ],
  'treat-arrival': [
    'TREAT_NEXT():',
    '  if queue is empty: return',
    '  p = queue.dequeue()',
    '  if someone still waiting is more urgent than p: bypassed = bypassed + 1',
  ],
  'find-record': [
    'FIND_RECORD(record):',
    '  node = root',
    '  for each level above the leaves:',
    '    node = the child whose range holds record',
    '  search the leaf for record',
  ],
}
