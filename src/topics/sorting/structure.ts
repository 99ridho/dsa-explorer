// SPEC.md §7 `structure`: sorting is three algorithms over one int array, so the ADT table is
// empty and the block below describes the array and the two-operation cost model (Week 5 §3.1).
import type { StructureSpec } from '@/types/step-engine'
import type { SortingSnapshot } from './types'

export const sortingStructure: StructureSpec<SortingSnapshot> = {
  adt: {
    name: 'Sorting',
    summary: 'Three sorts over an int array; there is no ADT to call. Each sort touches the array only through less(i, j) and exch(i, j), and the badges under the code count those.',
    operations: [],
    invariants: [
      'A sort ends with a[i] <= a[i + 1] for every i, and the array holds the same values it started with.',
      'Selection sort and insertion sort keep a[0..sortedUpTo-1] in order and grow that prefix by one each pass.',
    ],
  },
  representations: {
    default: {
      label: 'An int array sorted in place',
      declaration: [
        'int[] a          the values, 2 to 10 of them here',
        'less(i, j)       compares a[i] with a[j]',
        'exch(i, j)       swaps a[i] and a[j]',
      ],
      fields: [
        { name: 'a', type: 'int[]', role: 'the array; every sort rearranges it in place' },
        { name: 'sortedUpTo', type: 'int', role: 'a[0..sortedUpTo-1] is known to be in order; the canvas mutes it' },
      ],
      invariants: ['Every sort works inside the one array; selection sort makes exactly N exchanges and insertion sort makes one per inversion.'],
    },
  },
  algorithms: ['load', 'selection-sort', 'insertion-sort', 'shellsort'],
  liveFields: (snapshot) => ({ N: snapshot.array.length, sorted: snapshot.sortedUpTo ?? 0 }),
}
