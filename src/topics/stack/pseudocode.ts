// SPEC.md §10.8: pseudocode, verbatim. Push and pop of an implementation share one listing.

const ARRAY = [
  'PUSH(item):',
  '  if size == items.length: RESIZE(2 * items.length)',
  '  items[size] = item; size = size + 1',
  'POP():',
  '  item = items[size - 1]; items[size - 1] = null; size = size - 1',
  '  if size > 0 and size == items.length / 4: RESIZE(items.length / 2)',
  '  return item',
  'RESIZE(capacity):',
  '  resized = new array[capacity]',
  '  for i = 0 to size - 1: resized[i] = items[i]',
  '  items = resized',
]

const LINKED = [
  'PUSH(item):',
  '  oldTop = top',
  '  top = NODE(item)',
  '  top.next = oldTop',
  '  size = size + 1',
  'POP():',
  '  item = top.item',
  '  top = top.next',
  '  size = size - 1',
  '  return item',
]

const EVALUATE = [
  'EVALUATE(tokens):',
  '  for each token in tokens:',
  '    if token is "(": skip it',
  '    else if token is an operator: operators.push(token)',
  '    else if token is ")":',
  '      operator = operators.pop(); right = operands.pop(); left = operands.pop()',
  '      operands.push(APPLY(left, operator, right))',
  '    else: operands.push(NUMBER(token))',
  '  return operands.pop()',
]

export const stackPseudocode: Record<string, string[]> = {
  'array-push': ARRAY,
  'array-pop': ARRAY,
  'linked-push': LINKED,
  'linked-pop': LINKED,
  evaluate: EVALUATE,
}
