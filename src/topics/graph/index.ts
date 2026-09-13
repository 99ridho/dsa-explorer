import type { TopicModule } from '@/types/step-engine'
import { GraphCanvas } from './canvas'
import { coreMaterial, realWorldUsage } from './content'
import { buildGraph, graphOperations } from './operations'
import { graphPseudocode } from './pseudocode'
import type { GraphSnapshot, GraphState } from './types'

const isDirected = (v?: string) => v === 'directed'

/** Undirected seed: two components. Directed seed: two nontrivial strong components and a cycle. */
const SEED_UNDIRECTED: [number, number][] = [[0, 1], [0, 2], [1, 3], [2, 3], [3, 4], [5, 6]]
const SEED_DIRECTED: [number, number][] = [[0, 1], [1, 2], [2, 0], [2, 3], [3, 4], [4, 5], [5, 3], [6, 7]]

function shuffle<T>(items: T[]): T[] {
  const a = [...items]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function randomGraph(directed: boolean): GraphState {
  const V = 6 + Math.floor(Math.random() * 3) // 6 to 8
  const pairs: [number, number][] = []
  for (let i = 0; i < V; i++) for (let j = i + 1; j < V; j++) pairs.push([i, j])
  const chosen = shuffle(pairs).slice(0, V + 2)
  if (!directed) return buildGraph(V, chosen, false)
  // Directed Randomize always produces a DAG: orient every edge along a random vertex order.
  const rank = shuffle(Array.from({ length: V }, (_, i) => i))
  const dag = chosen.map(([a, b]) => (rank[a] < rank[b] ? [a, b] : [b, a]) as [number, number])
  return buildGraph(V, dag, true)
}

export const graph: TopicModule<GraphState, GraphSnapshot> = {
  slug: 'graph',
  title: 'Graph',
  weekLabel: 'Weeks 13–15',
  operations: graphOperations,
  pseudocode: graphPseudocode,
  CanvasComponent: GraphCanvas,
  content: { realWorldUsage, coreMaterial },
  variant: {
    id: 'directed',
    label: 'Graph type',
    options: [
      { value: 'undirected', label: 'Undirected' },
      { value: 'directed', label: 'Directed' },
    ],
    default: 'undirected',
  },
  createInitialState: (variant) =>
    isDirected(variant) ? buildGraph(8, SEED_DIRECTED, true) : buildGraph(7, SEED_UNDIRECTED, false),
  randomize: (_state, variant) => randomGraph(isDirected(variant)),
}
