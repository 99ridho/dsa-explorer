// SPEC.md §7 `structure`: the queue ADT and its two representations, from Week 3 §3.1 to §3.3
// and the algs4 ResizingArrayQueue / Queue shapes the snippets follow.
import { walk } from '@/lib/linked-nodes'
import type { StructureSpec } from '@/types/step-engine'
import type { QueueSnapshot } from './types'

export const queueStructure: StructureSpec<QueueSnapshot> = {
  adt: {
    name: 'Queue',
    summary: 'A collection that returns items in first-in, first-out order.',
    operations: [
      {
        name: 'enqueue',
        signature: 'enqueue(item)',
        cost: { array: 'O(1) amortized', linked: 'O(1)' },
        note: 'Adds the item at the back.',
        operationIds: ['array-enqueue', 'linked-enqueue'],
      },
      {
        name: 'dequeue',
        signature: 'dequeue()',
        cost: { array: 'O(1) amortized', linked: 'O(1)' },
        note: 'Removes and returns the item at the front, the one added least recently.',
        operationIds: ['array-dequeue', 'linked-dequeue'],
      },
      { name: 'peek', signature: 'peek()', cost: 'O(1)', note: 'Returns the front item without removing it.' },
      { name: 'isEmpty', signature: 'isEmpty()', cost: 'O(1)' },
      { name: 'size', signature: 'size()', cost: 'O(1)' },
    ],
    invariants: [
      'dequeue returns items in the order enqueue added them.',
      'size equals the number of enqueues minus the number of dequeues.',
    ],
  },
  representations: {
    array: {
      label: 'Resizing array',
      declaration: [
        'class ResizingArrayQueue',
        '  q: Item[]    items sit from q[first] to q[last - 1], wrapping at q.length',
        '  first: int   index of the front item',
        '  last: int    index one past the back item',
        '  n: int       number of items',
      ],
      fields: [
        { name: 'q', type: 'Item[]', role: 'the items, wrapping around the end of the array' },
        { name: 'first', type: 'int', role: 'index of the front item' },
        { name: 'last', type: 'int', role: 'index where the next enqueue writes' },
        { name: 'n', type: 'int', role: 'number of items' },
      ],
      invariants: [
        'Items occupy the n slots from first to last - 1 modulo q.length.',
        'enqueue doubles the array when n equals q.length, and dequeue halves it when n drops to q.length / 4, and a resize copies the items back to index 0.',
      ],
    },
    linked: {
      label: 'Linked list',
      declaration: [
        'class Queue',
        '  first: Node  front of the queue, null when empty',
        '  last: Node   back of the queue, null when empty',
        '  n: int       number of items',
        'class Node',
        '  item: Item',
        '  next: Node   the node behind, null at the back',
      ],
      fields: [
        { name: 'first', type: 'Node', role: 'front of the queue, where dequeue removes' },
        { name: 'last', type: 'Node', role: 'back of the queue, where enqueue links' },
        { name: 'n', type: 'int', role: 'number of items' },
        { name: 'Node.item', type: 'Item', role: 'the value the node holds' },
        { name: 'Node.next', type: 'Node', role: 'the node behind, null at the back' },
      ],
      invariants: [
        'The list runs from the least recently added item at first to the most recently added at last.',
        'enqueue links a new node after last, and dequeue unlinks the node at first.',
      ],
    },
  },
  liveFields: (snapshot): Record<string, string | number> => {
    if (snapshot.impl === 'array') {
      const { slots, first, last, n } = snapshot
      return { n, first, last, capacity: slots.length }
    }
    return {
      first: snapshot.firstId ?? 'null',
      last: snapshot.lastId ?? 'null',
      n: walk(snapshot.nodes, snapshot.firstId).length,
    }
  },
}
