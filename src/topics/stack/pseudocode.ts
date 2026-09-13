// SPEC.md §10.8: pseudocode, verbatim. Push and pop of an implementation share one listing.

const ARRAY = [
  'PUSH(item):',
  '  if n == a.length: RESIZE(2 * a.length)',
  '  a[n] = item; n = n + 1',
  'POP():',
  '  item = a[n - 1]; a[n - 1] = null; n = n - 1',
  '  if n > 0 and n == a.length / 4: RESIZE(a.length / 2)',
  '  return item',
  'RESIZE(capacity):',
  '  copy = new array[capacity]',
  '  for i = 0 to n - 1: copy[i] = a[i]',
  '  a = copy',
]

const LINKED = [
  'PUSH(item):',
  '  oldfirst = first',
  '  first = NODE(item)',
  '  first.next = oldfirst',
  '  n = n + 1',
  'POP():',
  '  item = first.item',
  '  first = first.next',
  '  n = n - 1',
  '  return item',
]

const EVALUATE = [
  'EVALUATE(tokens):',
  '  for each token in tokens:',
  '    if token is "(": skip it',
  '    else if token is an operator: ops.push(token)',
  '    else if token is ")":',
  '      op = ops.pop(); b = vals.pop(); a = vals.pop()',
  '      vals.push(APPLY(a, op, b))',
  '    else: vals.push(NUMBER(token))',
  '  return vals.pop()',
]

export const stackPseudocode: Record<string, string[]> = {
  'array-push': ARRAY,
  'array-pop': ARRAY,
  'linked-push': LINKED,
  'linked-pop': LINKED,
  evaluate: EVALUATE,
}
