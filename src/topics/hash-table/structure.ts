// SPEC.md §7 `structure`: the hash symbol table and its two collision strategies, from Week 12
// §3.2 to §3.4 and the algs4 SeparateChainingHashST / LinearProbingHashST shapes.
import type { StructureSpec } from '@/types/step-engine'
import type { HashTableSnapshot } from './types'

const load = (n: number, M: number) => (n / M).toFixed(2)

export const hashTableStructure: StructureSpec<HashTableSnapshot> = {
  adt: {
    name: 'Hash table',
    summary: 'A symbol table that turns each key into an array index with a hash function, trading key order for near-constant lookups.',
    operations: [
      {
        name: 'put',
        signature: 'put(key, val)',
        cost: {
          chaining: 'about N/M compares (Property L)',
          probing: 'about 1/2 (1 + 1/(1 - a)^2) probes on a miss, a = N/M (Proposition M)',
        },
        note: 'Hashes the key to a slot and stores the pair where the collision strategy says.',
        operationIds: ['chain-insert', 'probe-insert'],
      },
      {
        name: 'get',
        signature: 'get(key)',
        cost: {
          chaining: 'about N/M compares (Property L)',
          probing: 'about 1/2 (1 + 1/(1 - a)) probes on a hit, a = N/M (Proposition M)',
        },
        note: 'Hashes the key and looks only where that slot leads.',
        operationIds: ['chain-search', 'probe-search'],
      },
      {
        name: 'delete',
        signature: 'delete(key)',
        cost: {
          chaining: 'about N/M compares (Property L)',
          probing: 'a search hit, then delete rehashes every key in the cluster after it',
        },
        operationIds: ['chain-delete', 'probe-delete'],
      },
      { name: 'contains', signature: 'contains(key)', cost: 'the cost of get', note: 'Runs get and checks for a value.' },
      { name: 'size', signature: 'size()', cost: 'O(1)' },
    ],
    invariants: [
      'Every key sits where hash(key) = key mod M sends it, or where the collision strategy moved it from there.',
      'M is fixed at 11 in this visualizer; the reference chooses a prime so the modulus spreads keys evenly.',
    ],
  },
  representations: {
    chaining: {
      label: 'Separate chaining',
      declaration: [
        'class SeparateChainingHashST',
        '  M: int = 11    number of buckets',
        '  st: Node[M]    st[i] is the first node of bucket i, null when empty',
        '  n: int         number of keys',
        'class Node',
        '  key: Key',
        '  val: Value',
        '  next: Node     the next pair in the same bucket',
      ],
      fields: [
        { name: 'M', type: 'int', role: 'number of buckets, 11 here' },
        { name: 'st', type: 'Node[M]', role: 'one linked list per bucket' },
        { name: 'n', type: 'int', role: 'number of keys across every bucket' },
        { name: 'Node.next', type: 'Node', role: 'the next pair that hashed to the same bucket' },
      ],
      invariants: [
        'Bucket i holds exactly the keys with key mod M = i.',
        'A new key goes at the front of its bucket, so a chain lists keys from newest to oldest.',
      ],
    },
    probing: {
      label: 'Linear probing',
      declaration: [
        'class LinearProbingHashST',
        '  M: int = 11    number of slots',
        '  keys: Key[M]   keys[i] is null while slot i is empty',
        '  vals: Value[M]',
        '  n: int         number of keys',
      ],
      fields: [
        { name: 'M', type: 'int', role: 'number of slots, 11 here' },
        { name: 'keys', type: 'Key[M]', role: 'the keys, one per slot, null when empty' },
        { name: 'vals', type: 'Value[M]', role: 'the value for the key in the same slot' },
        { name: 'n', type: 'int', role: 'number of keys; the load factor is n / M' },
      ],
      invariants: [
        'A key sits at hash(key) or in the unbroken run of filled slots after it, wrapping at M.',
        'At least one slot stays empty, so every search stops.',
        'delete rehashes every key in the cluster after the removed one, so no search stops early at a hole.',
      ],
    },
  },
  liveFields: (snapshot): Record<string, string | number> => {
    if (snapshot.strategy === 'chaining') {
      const n = snapshot.buckets.reduce((sum, b) => sum + b.length, 0)
      return { M: snapshot.M, n, load: load(n, snapshot.M) }
    }
    const n = snapshot.slots.filter((s) => s !== null).length
    return { M: snapshot.M, n, load: load(n, snapshot.M) }
  },
}
