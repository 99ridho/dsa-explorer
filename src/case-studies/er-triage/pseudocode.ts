// SPEC.md §19.2: pseudocode, verbatim.

const ADMIT_HEAD = [
  'ADMIT(severity, record):',
  '  if archive.get(record) is null: archive.put(record)',
  '  patient = new Patient(nextArrival, severity, record)',
]

export const triagePseudocode: Record<string, string[]> = {
  'admit-priority': [
    ...ADMIT_HEAD,
    '  heap.insert(patient)',
    'SWIM(index):',
    '  while index > 1 and heap[index] is more urgent than heap[index / 2]:',
    '    SWAP(index, index / 2); index = index / 2',
  ],
  'admit-arrival': [...ADMIT_HEAD, '  queue.enqueue(patient)'],
  'treat-priority': [
    'TREAT_NEXT():',
    '  if heap is empty: return',
    '  patient = heap[1]; move heap[size] to heap[1]; size = size - 1',
    '  SINK(1)',
    'SINK(index):',
    '  while 2 * index <= size:',
    '    child = the more urgent child of index',
    '    if heap[index] is at least as urgent as heap[child]: stop',
    '    SWAP(index, child); index = child',
  ],
  'treat-arrival': [
    'TREAT_NEXT():',
    '  if queue is empty: return',
    '  patient = queue.dequeue()',
    '  if someone still waiting is more urgent than patient: bypassed = bypassed + 1',
  ],
  'find-record': [
    'FIND_RECORD(record):',
    '  node = archive.root',
    '  while node is not a leaf:',
    '    node = the child whose range holds record',
    '  search node.entries for record',
  ],
}
