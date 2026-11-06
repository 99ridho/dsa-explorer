// SPEC.md §10.7: pseudocode, verbatim. Both operations of an implementation share one listing.

const ARRAY = [
  'ENQUEUE(item):',
  '  if size == items.length: RESIZE(2 * items.length)',
  '  items[last] = item; last = last + 1',
  '  if last == items.length: last = 0',
  '  size = size + 1',
  'DEQUEUE():',
  '  item = items[first]; items[first] = null; size = size - 1',
  '  first = first + 1',
  '  if first == items.length: first = 0',
  '  if size > 0 and size == items.length / 4: RESIZE(items.length / 2)',
  '  return item',
  'RESIZE(capacity):',
  '  resized = new array[capacity]',
  '  for i = 0 to size - 1: resized[i] = items[(first + i) mod items.length]',
  '  items = resized; first = 0; last = size',
]

const LINKED = [
  'ENQUEUE(item):',
  '  oldLast = last',
  '  last = NODE(item); last.next = null',
  '  if isEmpty(): first = last',
  '  else: oldLast.next = last',
  '  size = size + 1',
  'DEQUEUE():',
  '  item = first.item',
  '  first = first.next',
  '  size = size - 1',
  '  if isEmpty(): last = null',
  '  return item',
]

export const queuePseudocode: Record<string, string[]> = {
  'array-enqueue': ARRAY,
  'array-dequeue': ARRAY,
  'linked-enqueue': LINKED,
  'linked-dequeue': LINKED,
}
