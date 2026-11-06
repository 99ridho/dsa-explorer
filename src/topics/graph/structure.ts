// SPEC.md §7 `structure`: the graph ADT and its adjacency-list representation, from Weeks 13 to 15
// §3.1 and §3.2, with the field names the snippets use (ADR-014). The visualizer stores an edge list and
// draws the same graph (SPEC.md §10.4).
import type { StructureSpec } from '@/types/step-engine'
import type { GraphSnapshot } from './types'

const adjacency = (label: string) => [
  `class ${label}`,
  '  V: int                 number of vertices, named 0 .. V-1',
  '  E: int                 number of edges',
  '  adjacent: Bag<int>[V]  adjacent[vertex] lists the vertices next to vertex',
]

export const graphStructure: StructureSpec<GraphSnapshot> = {
  adt: {
    name: 'Graph',
    summary: 'A set of vertices and a set of edges, each edge joining a pair of vertices.',
    operations: [
      {
        name: 'addEdge',
        signature: 'addEdge(start, end)',
        cost: { undirected: 'O(1)', directed: 'O(1)' },
        note: 'Adds end to adjacent[start]; an undirected graph also adds start to adjacent[end].',
        operationIds: ['add-edge'],
      },
      {
        name: 'adjacent',
        signature: 'adjacent(vertex)',
        cost: 'O(1) to start, then one step per neighbor',
        note: 'Iterates over the vertices next to vertex; nearly every graph algorithm is built on this one call.',
      },
      { name: 'V', signature: 'V()', cost: 'O(1)' },
      { name: 'E', signature: 'E()', cost: 'O(1)' },
    ],
    invariants: [
      'Vertices are the integers 0 .. V-1, so adjacent is an array indexed by vertex.',
      'This visualizer holds at most 10 vertices.',
    ],
  },
  representations: {
    undirected: {
      label: 'Adjacency lists',
      declaration: adjacency('Graph'),
      fields: [
        { name: 'V', type: 'int', role: 'number of vertices' },
        { name: 'E', type: 'int', role: 'number of edges, each stored once in this visualizer' },
        { name: 'adjacent', type: 'Bag<int>[V]', role: 'adjacent[vertex] lists every vertex that shares an edge with vertex' },
      ],
      invariants: [
        'An edge between start and end appears in both adjacent[start] and adjacent[end].',
        'The degree of a vertex is the length of adjacent[vertex], and the degrees sum to 2E.',
      ],
    },
    directed: {
      label: 'Adjacency lists',
      declaration: adjacency('Digraph'),
      fields: [
        { name: 'V', type: 'int', role: 'number of vertices' },
        { name: 'E', type: 'int', role: 'number of directed edges' },
        { name: 'adjacent', type: 'Bag<int>[V]', role: 'adjacent[vertex] lists the vertices that vertex points to' },
      ],
      invariants: [
        'An edge from start to end appears in adjacent[start] only; the reverse digraph flips every edge.',
        'The outdegree of a vertex is the length of adjacent[vertex], and the outdegrees sum to E.',
      ],
    },
  },
  algorithms: ['bfs', 'dfs', 'connected-components', 'topological-sort', 'strong-components'],
  liveFields: (snapshot) => ({
    V: snapshot.vertices.length,
    E: snapshot.edges.length,
    type: snapshot.directed ? 'digraph' : 'graph',
  }),
}
