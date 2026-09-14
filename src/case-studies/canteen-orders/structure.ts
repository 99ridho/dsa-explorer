// SPEC.md §7 `structure` for the §19.3 simulator: waiting orders on linked nodes beside a resizing
// log, with costs from Weeks 3, 4, 6, and 7.
import type { StructureSpec } from '@/types/step-engine'
import type { CanteenSnapshot } from './types'

const LOG_FIELDS = [
  { name: 'log', type: 'int[]', role: 'served order numbers; doubles when full' },
  { name: 'n', type: 'int', role: 'orders in the log' },
]

export const canteenStructure: StructureSpec<CanteenSnapshot> = {
  adt: {
    name: 'Order counter',
    summary: 'A collection of waiting orders that the kitchen serves one at a time, beside a log of served order numbers.',
    operations: [
      {
        name: 'placeOrder',
        signature: 'placeOrder()',
        cost: { queue: 'O(1): enqueue at last', stack: 'O(1): push at first' },
        note: 'Gives the order the next number and adds it to the waiting orders.',
        operationIds: ['place-queue', 'place-stack'],
      },
      {
        name: 'serveNext',
        signature: 'serveNext()',
        cost: {
          queue: 'O(1) to dequeue, then O(1) amortized to append to the log',
          stack: 'O(1) to pop, then O(1) amortized to append to the log',
        },
        note: 'Takes one waiting order and writes its number into the log.',
        operationIds: ['serve-queue', 'serve-stack'],
      },
      {
        name: 'findOrder',
        signature: 'findOrder(number)',
        cost: {
          queue: 'no more than lg N + 1 compares (binary search)',
          stack: 'up to N compares (sequential search)',
        },
        note: 'Reports where an order number sits in the served log.',
        operationIds: ['find-binary', 'find-sequential'],
      },
    ],
    invariants: ['Order numbers are handed out in increasing order, starting at 101.', 'Every order is either waiting or in the log, never both.'],
  },
  representations: {
    queue: {
      label: 'Queue and sorted log',
      declaration: [
        'class OrderCounter',
        '  pending: Queue<int>    linked nodes, first is the oldest order',
        '  log: int[]             served orders, capacity doubles when full',
        '  n: int                 orders in the log',
        '  nextOrder: int',
      ],
      fields: [{ name: 'pending', type: 'Queue<int>', role: 'waiting orders, oldest at first' }, ...LOG_FIELDS],
      invariants: ['The queue serves orders in number order, so log[0..n-1] is sorted and binary search works on it.'],
    },
    stack: {
      label: 'Stack and unsorted log',
      declaration: [
        'class OrderCounter',
        '  pending: Stack<int>    linked nodes, first is the newest order',
        '  log: int[]             served orders, capacity doubles when full',
        '  n: int                 orders in the log',
        '  skipped: int           orders served while an older order waited',
      ],
      fields: [{ name: 'pending', type: 'Stack<int>', role: 'waiting orders, newest at first' }, ...LOG_FIELDS],
      invariants: ['The stack serves the newest order first, so the log is out of number order and only sequential search is safe.'],
    },
  },
  liveFields: (s): Record<string, string | number> => ({
    waiting: Object.keys(s.nodes).length,
    served: s.n,
    cap: s.log.length,
    next: s.nextOrder,
    skipped: s.skipped,
  }),
}
