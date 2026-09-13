// SPEC.md §10.7: pseudocode, verbatim. Both operations of an implementation share one listing.

const ARRAY = [
  'ENQUEUE(item):',
  '  if n == q.length: RESIZE(2 * q.length)',
  '  q[last] = item; last = last + 1',
  '  if last == q.length: last = 0',
  '  n = n + 1',
  'DEQUEUE():',
  '  item = q[first]; q[first] = null; n = n - 1',
  '  first = first + 1',
  '  if first == q.length: first = 0',
  '  if n > 0 and n == q.length / 4: RESIZE(q.length / 2)',
  '  return item',
  'RESIZE(capacity):',
  '  copy = new array[capacity]',
  '  for i = 0 to n - 1: copy[i] = q[(first + i) mod q.length]',
  '  q = copy; first = 0; last = n',
]

const LINKED = [
  'ENQUEUE(item):',
  '  oldlast = last',
  '  last = NODE(item); last.next = null',
  '  if isEmpty(): first = last',
  '  else: oldlast.next = last',
  '  n = n + 1',
  'DEQUEUE():',
  '  item = first.item',
  '  first = first.next',
  '  n = n - 1',
  '  if isEmpty(): last = null',
  '  return item',
]

export const queuePseudocode: Record<string, string[]> = {
  'array-enqueue': ARRAY,
  'array-dequeue': ARRAY,
  'linked-enqueue': LINKED,
  'linked-dequeue': LINKED,
}
