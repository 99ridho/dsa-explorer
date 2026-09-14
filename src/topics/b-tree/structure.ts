// SPEC.md §7 `structure`: the B-tree symbol table and the algs4 BTree.java node, from Week 10
// §3.2 and §3.3 and SPEC.md §10.12 (a node holds up to M entries and splits at M).
import type { StructureSpec } from '@/types/step-engine'
import type { BTreeSnapshot } from './types'

export const bTreeStructure: StructureSpec<BTreeSnapshot> = {
  adt: {
    name: 'B-tree',
    summary: 'A symbol table whose nodes hold several keys each, so the tree stays shallow and a search touches few nodes.',
    operations: [
      {
        name: 'get',
        signature: 'get(key)',
        cost: 'at most log_M(N) probes, one per level',
        note: 'Descends from the root, choosing the child whose guide key range holds the key, and reads the value in the external node.',
        operationIds: ['get'],
      },
      {
        name: 'put',
        signature: 'put(key, val)',
        cost: 'at most log_M(N) probes, one per level',
        note: 'Descends to an external node, inserts the entry in key order, and splits any node that reaches M entries on the way back up.',
        operationIds: ['put'],
      },
      { name: 'contains', signature: 'contains(key)', cost: 'at most log_M(N) probes', note: 'Runs get and checks for a value.' },
      { name: 'size', signature: 'size()', cost: 'O(1)' },
      { name: 'height', signature: 'height()', cost: 'O(1)' },
    ],
    invariants: [
      'A node holds at most M entries, and an insertion that fills it splits it into two nodes of M / 2 entries.',
      'The key of an internal entry equals the smallest key in the subtree its child link leads to.',
      'Every external node sits at the same depth, the height of the tree.',
      'M is fixed at 4 in this visualizer.',
    ],
  },
  representations: {
    default: {
      label: 'Multiway nodes',
      declaration: [
        'class BTree',
        '  root: Node      never null; an external node while the tree is small',
        '  height: int     0 while the root is external',
        '  n: int          number of keys',
        'class Node',
        '  m: int          entries in use, at most M',
        '  children: Entry[M]',
        'class Entry',
        '  key: Key',
        '  val: Value      set in external nodes only',
        '  next: Node      the child link, set in internal nodes only',
      ],
      fields: [
        { name: 'root', type: 'Node', role: 'the top node; a root split adds a level and raises height' },
        { name: 'height', type: 'int', role: 'levels below the root; 0 while the root is external' },
        { name: 'n', type: 'int', role: 'number of keys' },
        { name: 'Node.m', type: 'int', role: 'entries in use, kept below M after a split settles' },
        { name: 'Node.children', type: 'Entry[M]', role: 'the entries, in key order' },
        { name: 'Entry.key', type: 'Key', role: 'the key, or the guide key of a child subtree' },
        { name: 'Entry.val', type: 'Value', role: 'the value, in external nodes only' },
        { name: 'Entry.next', type: 'Node', role: 'the child link, in internal nodes only' },
      ],
      invariants: [
        'Internal entries hold a key and a child link; external entries hold a key and a value.',
        'A search descends into the child of the last entry whose key is not larger than the search key.',
      ],
    },
  },
  liveFields: (snapshot) => ({
    root: snapshot.rootId,
    height: snapshot.height,
    n: snapshot.n,
    M: snapshot.M,
  }),
}
