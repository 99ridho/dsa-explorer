// SPEC.md §7 `structure`: the priority queue ADT and the array-backed heap, from Week 11 §3.1
// to §3.5 and the algs4 MaxPQ shape the snippets follow. Min mode flips every comparison.
import type { StructureSpec } from '@/types/step-engine'
import type { HeapSnapshot } from './types'

export const heapStructure: StructureSpec<HeapSnapshot> = {
  adt: {
    name: 'Priority queue',
    summary: 'A collection that always removes its largest key (or its smallest, in min mode) rather than the oldest or newest.',
    operations: [
      {
        name: 'insert',
        signature: 'insert(key)',
        cost: 'at most 1 + lg N compares',
        note: 'Appends the key at position n + 1 and swims it up while it beats its parent.',
        operationIds: ['insert'],
      },
      {
        name: 'delMax',
        signature: 'delMax() or delMin()',
        cost: 'at most 2 lg N compares',
        note: 'Swaps the root with the last key, shrinks n, and sinks the new root down.',
        operationIds: ['remove-max', 'remove-min'],
      },
      { name: 'max', signature: 'max() or min()', cost: 'O(1)', note: 'Returns pq[1] without removing it.' },
      { name: 'isEmpty', signature: 'isEmpty()', cost: 'O(1)' },
      { name: 'size', signature: 'size()', cost: 'O(1)' },
    ],
    invariants: [
      'Heap order: the key in each node is at least as large as the keys of its children in max mode, and at most as large in min mode.',
      'The key at pq[1] is the extreme of the whole heap, so max or min reads it directly.',
      'The tree is complete: every level is full except the last, which fills from the left.',
    ],
  },
  representations: {
    max: {
      label: 'Max-heap in an array',
      declaration: [
        'class MaxPQ',
        '  pq: Key[]    the heap in level order, pq[0] unused',
        '  n: int       number of keys, in pq[1..n]',
      ],
      fields: [
        { name: 'pq', type: 'Key[]', role: 'the complete tree stored level by level, root at pq[1]' },
        { name: 'n', type: 'int', role: 'number of keys; pq[n] is the last leaf' },
      ],
      invariants: [
        'The children of the node at k sit at 2k and 2k + 1, and its parent sits at k / 2, so the array needs no links.',
        'pq[k] >= pq[2k] and pq[k] >= pq[2k + 1] for every k with children.',
      ],
    },
    min: {
      label: 'Min-heap in an array',
      declaration: [
        'class MinPQ',
        '  pq: Key[]    the heap in level order, pq[0] unused',
        '  n: int       number of keys, in pq[1..n]',
      ],
      fields: [
        { name: 'pq', type: 'Key[]', role: 'the complete tree stored level by level, root at pq[1]' },
        { name: 'n', type: 'int', role: 'number of keys; pq[n] is the last leaf' },
      ],
      invariants: [
        'The children of the node at k sit at 2k and 2k + 1, and its parent sits at k / 2, so the array needs no links.',
        'pq[k] <= pq[2k] and pq[k] <= pq[2k + 1] for every k with children.',
      ],
    },
  },
  algorithms: ['build-heap', 'heapsort'],
  liveFields: (snapshot) => ({
    n: snapshot.n,
    capacity: Math.max(0, snapshot.array.length - 1),
    mode: snapshot.mode,
    top: snapshot.n > 0 ? (snapshot.array[1] ?? 'none') : 'none',
  }),
}
