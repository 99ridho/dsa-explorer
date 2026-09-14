// SPEC.md §19.3: pseudocode, verbatim.

const place = (add: string) => ['PLACE_ORDER():', '  number = nextOrder; nextOrder = nextOrder + 1', `  ${add}`]

const serve = (take: string) => [
  'SERVE_NEXT():',
  '  if pending is empty: return',
  `  ${take}`,
  '  if n == log.length: resize the log to 2 * log.length',
  '  log[n] = number; n = n + 1',
]

export const canteenPseudocode: Record<string, string[]> = {
  'place-queue': place('pending.enqueue(number)'),
  'place-stack': place('pending.push(number)'),
  'serve-queue': serve('number = pending.dequeue()'),
  'serve-stack': serve('number = pending.pop()'),
  'find-binary': [
    'FIND_ORDER(number):',
    '  lo = 0; hi = n - 1',
    '  while lo <= hi:',
    '    mid = (lo + hi) / 2',
    '    if number < log[mid]: hi = mid - 1',
    '    else if number > log[mid]: lo = mid + 1',
    '    else: return mid',
    '  return NOT_SERVED',
  ],
  'find-sequential': ['FIND_ORDER(number):', '  for i = 0 to n - 1:', '    if log[i] == number: return i', '  return NOT_SERVED'],
}
