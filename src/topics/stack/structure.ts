// SPEC.md §7 `structure`: the stack ADT and its two representations, from Week 4 §3.1 to §3.3
// and the algs4 ResizingArrayStack / Stack shapes the snippets follow.
import { walk } from '@/lib/linked-nodes'
import type { StructureSpec } from '@/types/step-engine'
import type { StackSnapshot } from './types'

export const stackStructure: StructureSpec<StackSnapshot> = {
  adt: {
    name: 'Stack',
    summary: 'A collection that returns items in last-in, first-out order.',
    operations: [
      {
        name: 'push',
        signature: 'push(item)',
        cost: { array: 'O(1) amortized', linked: 'O(1)' },
        operationIds: ['array-push', 'linked-push'],
      },
      {
        name: 'pop',
        signature: 'pop()',
        cost: { array: 'O(1) amortized', linked: 'O(1)' },
        note: 'Returns the item pushed most recently.',
        operationIds: ['array-pop', 'linked-pop'],
      },
      { name: 'peek', signature: 'peek()', cost: 'O(1)', note: 'Returns the top item without removing it.' },
      { name: 'isEmpty', signature: 'isEmpty()', cost: 'O(1)' },
      { name: 'size', signature: 'size()', cost: 'O(1)' },
    ],
    invariants: [
      'pop returns the item that push added most recently among those still in the stack.',
      'size equals the number of pushes minus the number of pops.',
    ],
  },
  representations: {
    array: {
      label: 'Resizing array',
      declaration: [
        'class ResizingArrayStack',
        '  a: Item[]    items sit in a[0..n-1], the top is a[n-1]',
        '  n: int       number of items',
      ],
      fields: [
        { name: 'a', type: 'Item[]', role: 'the items, in push order from index 0' },
        { name: 'n', type: 'int', role: 'number of items; a[n-1] is the top' },
      ],
      invariants: [
        'push doubles the array when n equals a.length, and pop halves it when n drops to a.length / 4, so the array is between one quarter full and full while it holds items.',
      ],
    },
    linked: {
      label: 'Linked list',
      declaration: [
        'class Stack',
        '  first: Node  top of the stack, null when empty',
        '  n: int       number of items',
        'class Node',
        '  item: Item',
        '  next: Node   the node below, null at the bottom',
      ],
      fields: [
        { name: 'first', type: 'Node', role: 'top of the stack, null when empty' },
        { name: 'n', type: 'int', role: 'number of items' },
        { name: 'Node.item', type: 'Item', role: 'the value the node holds' },
        { name: 'Node.next', type: 'Node', role: 'the node below, null at the bottom' },
      ],
      invariants: ['first is the most recently pushed node, and following next visits items from newest to oldest.'],
    },
  },
  algorithms: ['evaluate'],
  liveFields: (snapshot): Record<string, string | number> => {
    if (snapshot.impl === 'array') {
      const { slots, n } = snapshot
      return { n, capacity: slots.length, top: n > 0 ? (slots[n - 1] ?? 'none') : 'none' }
    }
    return { first: snapshot.firstId ?? 'null', n: walk(snapshot.nodes, snapshot.firstId).length }
  },
}
