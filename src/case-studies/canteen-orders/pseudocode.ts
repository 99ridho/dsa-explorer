// SPEC.md §19.3: pseudocode, verbatim.

const place = (add: string) => ['PLACE_ORDER():', '  number = nextOrder; nextOrder = nextOrder + 1', `  ${add}`]

const serve = (take: string) => [
  'SERVE_NEXT():',
  '  if pending is empty: return',
  `  ${take}`,
  '  if size == log.length: resize the log to 2 * log.length',
  '  log[size] = number; size = size + 1',
]

export const canteenPseudocode: Record<string, string[]> = {
  'place-queue': place('pending.enqueue(number)'),
  'place-stack': place('pending.push(number)'),
  'serve-queue': serve('number = pending.dequeue()'),
  'serve-stack': serve('number = pending.pop()'),
  'find-binary': [
    'FIND_ORDER(number):',
    '  low = 0; high = size - 1',
    '  while low <= high:',
    '    middle = (low + high) / 2',
    '    if number < log[middle]: high = middle - 1',
    '    else if number > log[middle]: low = middle + 1',
    '    else: return middle',
    '  return NOT_SERVED',
  ],
  'find-sequential': ['FIND_ORDER(number):', '  for i = 0 to size - 1:', '    if log[i] == number: return i', '  return NOT_SERVED'],
}
