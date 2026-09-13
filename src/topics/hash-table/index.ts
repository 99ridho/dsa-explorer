import type { TopicModule } from '@/types/step-engine'
import { HashTableCanvas } from './canvas'
import { coreMaterial, realWorldUsage } from './content'
import { buildChaining, buildProbing, hashTableOperations } from './operations'
import { hashTablePseudocode } from './pseudocode'
import { hashTableSnippets } from './snippets'
import type { HashStrategy, HashTableSnapshot, HashTableState } from './types'

const asStrategy = (v?: string): HashStrategy => (v === 'probing' ? 'probing' : 'chaining')

/** Under M = 11 these give one four-key chain (12, 23, 34, 45 all hash to 1) and a cluster. */
const SEED_KEYS = [12, 23, 34, 45, 5, 16]

function randomKeys(): number[] {
  const count = 6 + Math.floor(Math.random() * 3) // 6 to 8, leaves free slots when probing
  const pool = new Set<number>()
  while (pool.size < count) pool.add(1 + Math.floor(Math.random() * 99))
  return [...pool]
}

const build = (keys: number[], strategy: HashStrategy): HashTableState =>
  strategy === 'probing' ? buildProbing(keys) : buildChaining(keys)

export const hashTable: TopicModule<HashTableState, HashTableSnapshot> = {
  slug: 'hash-table',
  title: 'Hash Table',
  weekLabel: 'Week 12',
  operations: hashTableOperations,
  pseudocode: hashTablePseudocode,
  snippets: hashTableSnippets,
  CanvasComponent: HashTableCanvas,
  content: { realWorldUsage, coreMaterial },
  variant: {
    id: 'strategy',
    label: 'Collision strategy',
    options: [
      { value: 'chaining', label: 'Separate chaining' },
      { value: 'probing', label: 'Linear probing' },
    ],
    default: 'chaining',
  },
  createInitialState: (variant) => build(SEED_KEYS, asStrategy(variant)),
  randomize: (_state, variant) => build(randomKeys(), asStrategy(variant)),
}
