// SPEC.md §7 `structure` for the §19.1 simulator: a code-to-vertex hash index beside a digraph,
// with costs from Week 12 (Property L) and Weeks 13–15 (topological sort).
import type { StructureSpec } from '@/types/step-engine'
import type { StudyPlanSnapshot } from './types'

export const studyPlanStructure: StructureSpec<StudyPlanSnapshot> = {
  adt: {
    name: 'Study plan builder',
    summary: 'A hash index from course code to vertex number beside a digraph whose edge v to w means take v before w.',
    operations: [
      {
        name: 'addCourse',
        signature: 'addCourse(code)',
        cost: 'about N/M compares for the index (Property L)',
        note: 'Hashes the code, and when it is new, gives it the next vertex number.',
        operationIds: ['add-course'],
      },
      {
        name: 'addPrerequisite',
        signature: 'addPrerequisite(before, after)',
        cost: 'two gets at about N/M compares each (Property L), then O(1) to add the edge',
        note: 'Looks up both codes, then adds the edge from before to after.',
        operationIds: ['add-prereq'],
      },
    ],
    invariants: [
      'Every course code appears in exactly one bucket, the one HASH(code) names.',
      'Vertex v of the digraph is the course whose code is codes[v].',
      'A study plan exists only when the digraph is a DAG.',
    ],
  },
  representations: {
    default: {
      label: 'Hash index and digraph',
      declaration: [
        'class StudyPlan',
        '  st: SeparateChainingHashST<String, int>   course code to vertex, M = 11',
        '  keys: String[]                            keys[v] is the code of vertex v',
        '  adj: List<int>[]                          adj[v] holds every w that needs v first',
      ],
      fields: [
        { name: 'st', type: 'HashST<String, int>', role: 'finds a vertex from a code' },
        { name: 'keys', type: 'String[]', role: 'finds a code from a vertex' },
        { name: 'adj', type: 'List<int>[]', role: 'the prerequisite edges, one list per course' },
      ],
    },
  },
  algorithms: ['plan-topological', 'plan-alphabetical'],
  liveFields: (s): Record<string, string | number> => {
    const n = s.codes.length
    return { V: n, E: s.graph.edges.length, M: s.M, load: (n / s.M).toFixed(2) }
  },
}
