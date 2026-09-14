// SPEC.md §7 `structure`: the graph ADT and its adjacency-list representation, from Weeks 13 to 15
// §3.1 and §3.2 and the algs4 Graph / Digraph shapes. The visualizer stores an edge list and
// draws the same graph (SPEC.md §10.4).
import type { StructureSpec } from '@/types/step-engine'
import type { GraphSnapshot } from './types'

const adjacency = (label: string) => [
  `class ${label}`,
  '  V: int            number of vertices, named 0 .. V-1',
  '  E: int            number of edges',
  '  adj: Bag<int>[V]  adj[v] lists the vertices next to v',
]

export const graphStructure: StructureSpec<GraphSnapshot> = {
  adt: {
    name: 'Graph',
    summary: 'A set of vertices and a set of edges, each edge joining a pair of vertices.',
    operations: [
      {
        name: 'addEdge',
        signature: 'addEdge(v, w)',
        cost: { undirected: 'O(1)', directed: 'O(1)' },
        note: 'Adds w to adj[v]; an undirected graph also adds v to adj[w].',
        operationIds: ['add-edge'],
      },
      {
        name: 'adj',
        signature: 'adj(v)',
        cost: 'O(1) to start, then one step per neighbor',
        note: 'Iterates over the vertices next to v; nearly every graph algorithm is built on this one call.',
      },
      { name: 'V', signature: 'V()', cost: 'O(1)' },
      { name: 'E', signature: 'E()', cost: 'O(1)' },
    ],
    invariants: [
      'Vertices are the integers 0 .. V-1, so adj is an array indexed by vertex.',
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
        { name: 'adj', type: 'Bag<int>[V]', role: 'adj[v] lists every vertex that shares an edge with v' },
      ],
      invariants: [
        'An edge between v and w appears in both adj[v] and adj[w].',
        'The degree of v is the length of adj[v], and the degrees sum to 2E.',
      ],
    },
    directed: {
      label: 'Adjacency lists',
      declaration: adjacency('Digraph'),
      fields: [
        { name: 'V', type: 'int', role: 'number of vertices' },
        { name: 'E', type: 'int', role: 'number of directed edges' },
        { name: 'adj', type: 'Bag<int>[V]', role: 'adj[v] lists the vertices that v points to' },
      ],
      invariants: [
        'An edge from v to w appears in adj[v] only; the reverse digraph flips every edge.',
        'The outdegree of v is the length of adj[v], and the outdegrees sum to E.',
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
