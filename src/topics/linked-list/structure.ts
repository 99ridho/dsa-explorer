// SPEC.md §7 `structure`: the linked list as a structure of its own, from Week 6 §3.1 and §3.2.
import { walk } from '@/lib/linked-nodes'
import type { StructureSpec } from '@/types/step-engine'
import type { LinkedListSnapshot } from './types'

export const linkedListStructure: StructureSpec<LinkedListSnapshot> = {
  adt: {
    name: 'Linked list',
    summary: 'A sequence of nodes, each holding an item and a reference to the next node.',
    operations: [
      {
        name: 'insertFirst',
        signature: 'insertFirst(item)',
        cost: 'O(1)',
        note: 'Creates a node, points it at the current first node, and makes it the first node.',
        operationIds: ['insert-first'],
      },
      {
        name: 'insertLast',
        signature: 'insertLast(item)',
        cost: 'O(1)',
        note: 'Creates a node and links it after last, so the list needs a last reference.',
        operationIds: ['insert-last'],
      },
      {
        name: 'removeFirst',
        signature: 'removeFirst()',
        cost: 'O(1)',
        note: 'Advances first to the second node and returns the old first item.',
        operationIds: ['remove-first'],
      },
      { name: 'isEmpty', signature: 'isEmpty()', cost: 'O(1)' },
      { name: 'size', signature: 'size()', cost: 'O(1)' },
    ],
    invariants: [
      'A list is either empty or a node holding an item and a reference to the rest of the list.',
      'Following next from first reaches every node and ends at null.',
    ],
  },
  representations: {
    default: {
      label: 'Nodes and references',
      declaration: [
        'class LinkedList',
        '  first: Node  the first node, null when empty',
        '  last: Node   the last node, null when empty',
        '  n: int       number of nodes',
        'class Node',
        '  item: Item',
        '  next: Node   the next node, null at the end',
      ],
      fields: [
        { name: 'first', type: 'Node', role: 'the first node, null when empty' },
        { name: 'last', type: 'Node', role: 'the last node, so insertLast does not walk the list' },
        { name: 'n', type: 'int', role: 'number of nodes' },
        { name: 'Node.item', type: 'Item', role: 'the value the node holds' },
        { name: 'Node.next', type: 'Node', role: 'the next node, null at the end' },
      ],
      invariants: [
        'Nodes sit anywhere in memory; only the next references give the list its order.',
        'last.next is null, and last equals first when the list holds one node.',
      ],
    },
  },
  algorithms: ['traverse'],
  liveFields: (snapshot) => ({
    first: snapshot.firstId ?? 'null',
    last: snapshot.lastId ?? 'null',
    n: walk(snapshot.nodes, snapshot.firstId).length,
  }),
}
