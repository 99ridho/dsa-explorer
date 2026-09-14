// SPEC.md §7 `structure` for the §19.2 simulator: a waiting list (max heap or FIFO queue) beside a
// B-tree archive, with costs from Week 11, Week 3, and Week 10.
import type { StructureSpec } from '@/types/step-engine'
import type { TriageSnapshot } from './types'

const ARCHIVE_FIELD = { name: 'archive', type: 'BTree<int, Record>', role: 'every record on disk, M = 4' }

export const triageStructure: StructureSpec<TriageSnapshot> = {
  adt: {
    name: 'Triage desk',
    summary: 'A waiting list that hands out the next patient beside an archive of patient records kept in a B-tree.',
    operations: [
      {
        name: 'admit',
        signature: 'admit(severity, record)',
        cost: {
          priority: 'at most log_M(N) probes in the archive, then at most 1 + lg N compares to insert',
          arrival: 'at most log_M(N) probes in the archive, then O(1) to enqueue',
        },
        note: 'Opens the record when the archive lacks it, then adds the patient to the waiting list.',
        operationIds: ['admit-priority', 'admit-arrival'],
      },
      {
        name: 'treatNext',
        signature: 'treatNext()',
        cost: {
          priority: 'at most 2 lg N compares',
          arrival: 'O(1) to dequeue',
        },
        note: 'Removes the patient the desk treats next.',
        operationIds: ['treat-priority', 'treat-arrival'],
      },
      {
        name: 'findRecord',
        signature: 'findRecord(record)',
        cost: 'at most log_M(N) probes, one block read per level',
        note: 'Descends the archive from the root to one leaf.',
        operationIds: ['find-record'],
      },
    ],
    invariants: [
      'A patient is more urgent than another when its severity is higher, or the severities tie and it arrived earlier.',
      'Every record number in the archive sits in a leaf, in order.',
      'The archive holds the record of every patient admitted today: each waiting patient has one, and no two waiting patients share one.',
    ],
  },
  representations: {
    priority: {
      label: 'Max heap and B-tree',
      declaration: [
        'class TriageDesk',
        '  pq: Patient[]              pq[1..n] in heap order, pq[0] unused',
        '  n: int                     patients waiting',
        '  archive: BTree<int, Record>',
      ],
      fields: [
        { name: 'pq', type: 'Patient[]', role: 'the waiting list, most urgent at pq[1]' },
        { name: 'n', type: 'int', role: 'number of patients waiting' },
        ARCHIVE_FIELD,
      ],
      invariants: ['Every patient is at least as urgent as its children, so the most urgent patient is at the root.'],
    },
    arrival: {
      label: 'Queue and B-tree',
      declaration: [
        'class TriageDesk',
        '  queue: Queue<Patient>      front is the earliest arrival still waiting',
        '  bypassed: int              treatments given while a more urgent patient waited',
        '  archive: BTree<int, Record>',
      ],
      fields: [
        { name: 'queue', type: 'Queue<Patient>', role: 'the waiting list in arrival order' },
        { name: 'bypassed', type: 'int', role: 'what arrival order costs the most urgent patients' },
        ARCHIVE_FIELD,
      ],
      invariants: ['Patients leave the queue in the order they arrived, whatever their severity.'],
    },
  },
  liveFields: (s): Record<string, string | number> => ({
    waiting: s.waiting.length,
    treated: s.treated,
    bypassed: s.bypassed,
    records: s.archive.n,
    height: s.archive.height,
  }),
}
