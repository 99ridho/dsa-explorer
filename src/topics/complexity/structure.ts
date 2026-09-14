// SPEC.md §7 `structure`: analysis of algorithms is two experiments over an int array, so the ADT
// table is empty and the block below names what the doubling ratio test counts (Week 1 §3.2).
import type { StructureSpec } from '@/types/step-engine'
import type { ComplexitySnapshot } from './types'

export const complexityStructure: StructureSpec<ComplexitySnapshot> = {
  adt: {
    name: 'Analysis of algorithms',
    summary: 'Two experiments over an int array; there is no ADT to call. The cost model counts array accesses, and the table shows how that count grows as N doubles.',
    operations: [],
    invariants: [
      'Every row of the table doubles N, and the ratio column divides a row by the row above it.',
      'The ratio settles near 2 for 1-sum, 4 for 2-sum, and 8 for 3-sum, the 2^b of an N^b running time.',
    ],
  },
  representations: {
    default: {
      label: 'An int array and a counter',
      declaration: [
        'int[] a          N values the brute-force count scans',
        'accesses: long   array accesses so far, the cost model',
        'rows: (N, accesses, ratio)[]  one row per doubling of N',
      ],
      fields: [
        { name: 'a', type: 'int[]', role: 'the input; only its length matters to the count' },
        { name: 'accesses', type: 'long', role: 'the exact brute-force count for one N' },
        { name: 'rows', type: 'table', role: 'one row per N in the doubling sequence, the canvas draws it' },
      ],
    },
  },
  algorithms: ['doubling-ratio', 'count-accesses'],
  liveFields: (snapshot) => ({ sum: snapshot.problem, 'start N': snapshot.startN, rows: snapshot.rows.length }),
}
