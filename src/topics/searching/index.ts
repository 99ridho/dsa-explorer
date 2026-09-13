import type { TopicModule } from '@/types/step-engine'
import { SearchingCanvas } from './canvas'
import { coreMaterial, realWorldUsage } from './content'
import { buildBinary, buildSequential, searchingOperations } from './operations'
import { searchingPseudocode } from './pseudocode'
import { searchingSnippets } from './snippets'
import type { SearchingImpl, SearchingSnapshot, SearchingState } from './types'

const asImpl = (v?: string): SearchingImpl => (v === 'binary' ? 'binary' : 'sequential')

/** Both seeds hold the same keys; the list keeps insertion order, the array keeps key order. */
const SEED_SEQUENTIAL: [number, number][] = [
  [21, 1],
  [30, 1],
  [5, 2],
  [12, 1],
]
const SEED_BINARY: [number, number][] = [...SEED_SEQUENTIAL, [44, 1]]

function randomPairs(): [number, number][] {
  const count = 4 + Math.floor(Math.random() * 4) // 4 to 7
  const pool = new Set<number>()
  while (pool.size < count) pool.add(1 + Math.floor(Math.random() * 99))
  return [...pool].map((k) => [k, 1])
}

const build = (pairs: [number, number][], impl: SearchingImpl): SearchingState =>
  impl === 'binary' ? buildBinary(pairs) : buildSequential(pairs)

export const searching: TopicModule<SearchingState, SearchingSnapshot> = {
  slug: 'searching',
  title: 'Searching',
  weekLabel: 'Week 7',
  operations: searchingOperations,
  pseudocode: searchingPseudocode,
  snippets: searchingSnippets,
  CanvasComponent: SearchingCanvas,
  content: { realWorldUsage, coreMaterial },
  variant: {
    id: 'impl',
    label: 'Implementation',
    options: [
      { value: 'sequential', label: 'Sequential search' },
      { value: 'binary', label: 'Binary search' },
    ],
    default: 'sequential',
  },
  createInitialState: (variant) => build(asImpl(variant) === 'binary' ? SEED_BINARY : SEED_SEQUENTIAL, asImpl(variant)),
  randomize: (_state, variant) => build(randomPairs(), asImpl(variant)),
}
