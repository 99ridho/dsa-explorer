// SPEC.md §19.0 reasoning rows. Costs are quoted from the week reference each row names.
import type { DecisionRow } from '@/types/case-study'

export const canteenDecisions: DecisionRow[] = [
  {
    requirement: 'Serve whoever ordered first.',
    chosen: {
      name: 'Queue',
      cost: 'O(1) per enqueue and dequeue on a linked list (Weeks 3 and 6)',
      reason: 'Week 3 treats first come, first served as a requirement: reordering the line would be a correctness bug, not a performance one.',
      topicSlug: 'queue',
    },
    rejected: [
      {
        name: 'Stack',
        cost: 'O(1) per push and pop (Week 4)',
        reason: 'It serves the newest order first. That rule fits undo and a back button, not a line of hungry students.',
        topicSlug: 'stack',
      },
    ],
  },
  {
    requirement: 'Hold however many orders are waiting, with no limit known in advance.',
    chosen: {
      name: 'Linked nodes',
      cost: 'O(1) to add or remove at either end, no size fixed in advance (Week 6)',
      reason: 'The counter cannot know how busy lunch will be, and a linked list grows and shrinks one order at a time.',
      topicSlug: 'linked-list',
    },
    rejected: [
      {
        name: 'Fixed-size array',
        cost: 'constant-time indexed access, size fixed when created (Week 2)',
        reason: 'A rush that outgrows the array has nowhere to go.',
        topicSlug: 'arrays',
      },
    ],
  },
  {
    requirement: 'Keep every served order number for the day.',
    chosen: {
      name: 'Resizing array',
      cost: 'doubles when full, keeping the amortized cost per operation constant (Week 3)',
      reason: 'Served numbers are only ever appended, and an array gives binary search the indexed access it needs.',
      topicSlug: 'arrays',
    },
    rejected: [],
  },
  {
    requirement: 'Tell a student whether order 117 has been served.',
    chosen: {
      name: 'Binary search on the log',
      cost: 'no more than lg N + 1 compares (Week 7)',
      reason: 'The queue serves orders in number order, so the log is already sorted, and nothing ever shifts because each new number is the largest so far.',
      topicSlug: 'searching',
    },
    rejected: [
      {
        name: 'Sequential search',
        cost: 'up to N compares (Week 7)',
        reason: 'It works on a log in any order, which is why the stack design needs it, but it reads the whole log for an order that is still waiting.',
        topicSlug: 'searching',
      },
      {
        name: 'Sort the log, then binary search',
        cost: 'insertion sort makes one exchange per inversion (Week 5)',
        reason: 'It would rescue the stack design, at the price of a sort the queue design never needs.',
        topicSlug: 'sorting',
      },
    ],
  },
]
