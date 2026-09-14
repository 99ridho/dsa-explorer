// SPEC.md §19.0 reasoning rows. Costs are quoted from the week reference each row names.
import type { DecisionRow } from '@/types/case-study'

export const triageDecisions: DecisionRow[] = [
  {
    requirement: 'Hand the desk the most urgent waiting patient while new patients keep arriving.',
    chosen: {
      name: 'Max binary heap (priority queue)',
      cost: 'at most 1 + lg N compares to insert, at most 2 lg N to remove the maximum (Week 11)',
      reason: 'Only the single most urgent patient is ever taken out, and the heap keeps both admitting and treating logarithmic.',
      topicSlug: 'binary-heap',
    },
    rejected: [
      {
        name: 'FIFO queue',
        cost: 'O(1) to enqueue and to dequeue (Week 3)',
        reason: 'It treats patients in arrival order. Week 11 notes that arrival order suffices only until items have different priorities.',
        topicSlug: 'queue',
      },
      {
        name: 'Unordered array',
        cost: 'removing the maximum requires a full scan (Week 11)',
        reason: 'Admitting is fast, but every treatment looks at every waiting patient.',
        topicSlug: 'arrays',
      },
      {
        name: 'Ordered array',
        cost: 'insert takes linear time in the worst case (Week 11)',
        reason: 'Treating is instant, but every admission shifts patients to keep the order.',
        topicSlug: 'arrays',
      },
    ],
  },
  {
    requirement: 'Treat equally urgent patients in the order they arrived.',
    chosen: {
      name: 'Compare severity, then arrival number',
      cost: 'the same heap costs: one extra field in each compare (Week 11)',
      reason: 'Week 11 ranks orders in a stock exchange by price and then by time. The desk ranks patients by severity and then by arrival.',
      topicSlug: 'binary-heap',
    },
    rejected: [
      {
        name: 'Compare severity alone',
        cost: 'the same heap costs (Week 11)',
        reason: 'Swim and sink move items past each other, so a heap does not keep equal keys in arrival order on its own.',
        topicSlug: 'binary-heap',
      },
    ],
  },
  {
    requirement: 'Find a patient record in an archive on disk.',
    chosen: {
      name: 'B-tree (M = 4 in the simulator)',
      cost: 'at most log_M(N) probes, one per level (Week 10)',
      reason: 'Each probe is a block read, and a high branching factor keeps the tree shallow, so a lookup reads few blocks.',
      topicSlug: 'b-tree',
    },
    rejected: [
      {
        name: 'Binary search tree',
        cost: 'about 1.39 lg N compares on random keys, O(N) on sorted input (Week 9)',
        reason: 'Every node on the path would be its own block read, and records opened in number order would build a tree as tall as a list.',
        topicSlug: 'bst',
      },
    ],
  },
]
