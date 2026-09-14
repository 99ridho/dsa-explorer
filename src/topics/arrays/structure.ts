// SPEC.md §7 `structure`: the array as a structure, from Week 2 §3.1 to §3.3. The byte count is
// the int[N] cost the reference states: a 24-byte header plus 4 bytes per int.
import type { StructureSpec } from '@/types/step-engine'
import { HEADER_BYTES, INT_BYTES, type ArraysSnapshot } from './types'

export const arraysStructure: StructureSpec<ArraysSnapshot> = {
  adt: {
    name: 'Array',
    summary: 'A fixed-length sequence of values of one type, each reached by its index in constant time.',
    operations: [
      {
        name: 'create',
        signature: 'new int[N]',
        cost: 'O(N)',
        note: 'Allocates N slots in one block and sets each to 0.',
        operationIds: ['create'],
      },
      {
        name: 'access',
        signature: 'a[i]',
        cost: 'O(1)',
        note: 'Reads the slot at index i; an index outside 0 .. N-1 is an error.',
        operationIds: ['access'],
      },
      {
        name: 'set',
        signature: 'a[i] = v',
        cost: 'O(1)',
        note: 'Writes v into the slot at index i.',
        operationIds: ['set'],
      },
      {
        name: 'resize',
        signature: 'resize(2N)',
        cost: 'O(N)',
        note: 'An array cannot grow in place, so a resize allocates a new array and copies every value.',
        operationIds: ['resize'],
      },
      { name: 'length', signature: 'a.length', cost: 'O(1)' },
    ],
    invariants: [
      'Every slot holds an int, and a fresh array holds 0 in each slot.',
      'The length never changes after creation; a resize allocates a new array and copies the values over.',
    ],
  },
  representations: {
    default: {
      label: 'One block of memory',
      declaration: [
        'int[] a',
        '  header: 24 bytes   16 bytes object overhead, 4 bytes length, 4 bytes padding',
        '  a[0..N-1]: 4 bytes each, side by side',
      ],
      fields: [
        { name: 'a', type: 'int[]', role: 'a reference to the block; two names for one array see the same slots' },
        { name: 'a.length', type: 'int', role: 'N, stored in the header' },
        { name: 'a[i]', type: 'int', role: 'the value at index i, at a fixed offset from the start of the block' },
      ],
      invariants: [`An int[N] takes ${HEADER_BYTES} + ${INT_BYTES}N bytes on a typical 64-bit machine.`],
    },
  },
  algorithms: ['memory'],
  liveFields: (snapshot) => {
    const length = snapshot.values.length
    return { length, bytes: HEADER_BYTES + INT_BYTES * length }
  },
}
