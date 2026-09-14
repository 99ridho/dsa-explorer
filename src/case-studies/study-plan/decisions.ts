// SPEC.md §19.0 reasoning rows. Costs are quoted from the week reference each row names.
import type { DecisionRow } from '@/types/case-study'

export const studyPlanDecisions: DecisionRow[] = [
  {
    requirement: 'Find the vertex number for a course code the student types.',
    chosen: {
      name: 'Hash table, separate chaining',
      cost: 'about N/M compares per lookup (Week 12, Property L)',
      reason: 'The planner only asks for one exact code, never the next code or a range, so it gives up key order for near-constant lookups.',
      topicSlug: 'hash-table',
    },
    rejected: [
      {
        name: 'Binary search tree',
        cost: 'about 1.39 lg N compares for a search hit on random keys (Week 9)',
        reason: 'A BST keeps the codes in order, and this lookup never uses that order.',
        topicSlug: 'bst',
      },
      {
        name: 'Unordered list, sequential search',
        cost: 'up to N compares for a search miss (Week 7)',
        reason: 'Every lookup for a missing code scans the whole list.',
        topicSlug: 'searching',
      },
    ],
  },
  {
    requirement: 'Record that one course must come before another.',
    chosen: {
      name: 'Directed graph, adjacency lists',
      cost: 'O(1) to add an edge (Weeks 13–15)',
      reason: 'A prerequisite is one-way, so each edge needs a direction: v to w means take v first.',
      topicSlug: 'graph',
    },
    rejected: [
      {
        name: 'Undirected graph',
        cost: 'O(1) to add an edge (Weeks 13–15)',
        reason: 'It stores PR1 and PR2 as connected and loses which one comes first. Weeks 13–15 warn that treating a one-way relation as symmetric silently breaks every algorithm built on it.',
        topicSlug: 'graph',
      },
    ],
  },
  {
    requirement: 'Print an order where every prerequisite comes first, or say that none exists.',
    chosen: {
      name: 'Topological sort, DFS reverse postorder',
      cost: 'time proportional to V + E (Weeks 13–15)',
      reason: 'Reverse postorder of a DAG is a topological order, and a digraph has one only if it is a DAG, so the same search that builds the plan also finds the cycle that rules one out.',
      topicSlug: 'graph',
    },
    rejected: [
      {
        name: 'Sort the codes from A to Z',
        cost: 'about N²/4 compares with insertion sort on random input (Week 5)',
        reason: 'It always prints an order, but letter order says nothing about prerequisites.',
        topicSlug: 'sorting',
      },
    ],
  },
]
