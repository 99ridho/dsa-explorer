// SPEC.md §7 `structure`: the symbol table ADT and its two elementary implementations, from
// Week 7 §3.1 to §3.4 and the algs4 SequentialSearchST / BinarySearchST shapes.
import { walk } from '@/lib/linked-nodes'
import type { StructureSpec } from '@/types/step-engine'
import type { SearchingSnapshot } from './types'

export const searchingStructure: StructureSpec<SearchingSnapshot> = {
  adt: {
    name: 'Symbol table',
    summary: 'A collection of key and value pairs: put stores a value under a key, and get looks the value up by key.',
    operations: [
      {
        name: 'put',
        signature: 'put(key, val)',
        cost: {
          sequential: 'up to N compares on a miss; a new pair goes at the front',
          binary: 'at most lg N + 1 compares to find the slot, then about 2N array accesses to shift larger keys',
        },
        note: 'Stores 1 for a new key and adds 1 for a present key, as FrequencyCounter does.',
        operationIds: ['seq-put', 'bin-put'],
      },
      {
        name: 'get',
        signature: 'get(key)',
        cost: {
          sequential: 'up to N compares on a miss',
          binary: 'at most lg N + 1 compares',
        },
        note: 'Returns the value stored under the key, or nothing on a miss.',
        operationIds: ['seq-get', 'bin-get'],
      },
      { name: 'contains', signature: 'contains(key)', cost: 'the cost of get', note: 'Runs get and checks for a value.' },
      { name: 'size', signature: 'size()', cost: 'O(1)' },
    ],
    invariants: [
      'Each key appears once; put on a present key replaces its value.',
      'get after put(key, val) returns val until a later put changes it.',
    ],
  },
  representations: {
    sequential: {
      label: 'Sequential search',
      declaration: [
        'class SequentialSearchST',
        '  first: Node  the most recently added pair, null when empty',
        '  n: int       number of pairs',
        'class Node',
        '  key: Key',
        '  val: Value',
        '  next: Node   the next pair, null at the end',
      ],
      fields: [
        { name: 'first', type: 'Node', role: 'the front of the list, where a new pair goes' },
        { name: 'n', type: 'int', role: 'number of pairs' },
        { name: 'Node.key', type: 'Key', role: 'the key get compares against' },
        { name: 'Node.val', type: 'Value', role: 'the value stored with the key' },
        { name: 'Node.next', type: 'Node', role: 'the next pair, null at the end' },
      ],
      invariants: ['The list has no order, so a miss walks every node before it stops.'],
    },
    binary: {
      label: 'Binary search',
      declaration: [
        'class BinarySearchST',
        '  keys: Key[]    sorted ascending',
        '  vals: Value[]  vals[i] belongs to keys[i]',
        '  n: int         number of pairs, in keys[0..n-1]',
      ],
      fields: [
        { name: 'keys', type: 'Key[]', role: 'the keys in ascending order' },
        { name: 'vals', type: 'Value[]', role: 'parallel to keys: vals[i] is the value of keys[i]' },
        { name: 'n', type: 'int', role: 'number of pairs' },
      ],
      invariants: [
        'keys[] is in ascending order and vals[i] belongs to keys[i].',
        'rank(key) is the number of keys smaller than key, so a present key sits at keys[rank(key)].',
      ],
    },
  },
  liveFields: (snapshot): Record<string, string | number> => {
    if (snapshot.impl === 'sequential') {
      return { first: snapshot.firstId ?? 'null', n: walk(snapshot.nodes, snapshot.firstId).length }
    }
    const { keys } = snapshot
    const n = keys.length
    return { n, min: n > 0 ? (keys[0] ?? 'none') : 'none', max: n > 0 ? (keys[n - 1] ?? 'none') : 'none' }
  },
}
