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
        note: 'Appends the key at position size + 1 and swims it up while it beats its parent.',
        operationIds: ['insert'],
      },
      {
        name: 'removeTop',
        signature: 'removeTop()',
        cost: 'at most 2 lg N compares',
        note: 'Removes the max (or the min in min mode): swaps the root with the last key, shrinks size, and sinks the new root down.',
        operationIds: ['remove-max', 'remove-min'],
      },
      { name: 'top', signature: 'top()', cost: 'O(1)', note: 'Returns heap[1], the max or the min, without removing it.' },
      { name: 'isEmpty', signature: 'isEmpty()', cost: 'O(1)' },
      { name: 'size', signature: 'size()', cost: 'O(1)' },
    ],
    invariants: [
      'Heap order: the key in each node is at least as large as the keys of its children in max mode, and at most as large in min mode.',
      'The key at heap[1] is the extreme of the whole heap, so max or min reads it directly.',
      'The tree is complete: every level is full except the last, which fills from the left.',
    ],
  },
  representations: {
    max: {
      label: 'Max-heap in an array',
      declaration: [
        'class MaxPQ',
        '  heap: Key[]   the keys in level order, heap[0] unused',
        '  size: int     number of keys, in heap[1..size]',
      ],
      fields: [
        { name: 'heap', type: 'Key[]', role: 'the complete tree stored level by level, root at heap[1]' },
        { name: 'size', type: 'int', role: 'number of keys; heap[size] is the last leaf' },
      ],
      invariants: [
        'The children of the node at index sit at 2 * index and 2 * index + 1, and its parent sits at index / 2, so the array needs no links.',
        'heap[index] >= heap[2 * index] and heap[index] >= heap[2 * index + 1] for every index with children.',
      ],
    },
    min: {
      label: 'Min-heap in an array',
      declaration: [
        'class MinPQ',
        '  heap: Key[]   the keys in level order, heap[0] unused',
        '  size: int     number of keys, in heap[1..size]',
      ],
      fields: [
        { name: 'heap', type: 'Key[]', role: 'the complete tree stored level by level, root at heap[1]' },
        { name: 'size', type: 'int', role: 'number of keys; heap[size] is the last leaf' },
      ],
      invariants: [
        'The children of the node at index sit at 2 * index and 2 * index + 1, and its parent sits at index / 2, so the array needs no links.',
        'heap[index] <= heap[2 * index] and heap[index] <= heap[2 * index + 1] for every index with children.',
      ],
    },
  },
  algorithms: ['build-heap', 'heapsort'],
  liveFields: (snapshot) => ({
    size: snapshot.n,
    capacity: Math.max(0, snapshot.array.length - 1),
    mode: snapshot.mode,
    top: snapshot.n > 0 ? (snapshot.array[1] ?? 'none') : 'none',
  }),
}
