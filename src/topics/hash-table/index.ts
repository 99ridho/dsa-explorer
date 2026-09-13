import type { TopicModule } from '@/types/step-engine'
import { HashTableCanvas } from './canvas'
import { coreMaterial, realWorldUsage } from './content'
import { hashTableOperations } from './operations'
import { hashTablePseudocode } from './pseudocode'
import { HASH_TABLE_M, type HashTableSnapshot, type HashTableState } from './types'

function emptyTable(variant?: string): HashTableState {
  if (variant === 'probing') {
    return { strategy: 'probing', slots: Array<number | null>(HASH_TABLE_M).fill(null), M: HASH_TABLE_M }
  }
  return { strategy: 'chaining', buckets: Array.from({ length: HASH_TABLE_M }, () => []), M: HASH_TABLE_M }
}

export const hashTable: TopicModule<HashTableState, HashTableSnapshot> = {
  slug: 'hash-table',
  title: 'Hash Table',
  weekLabel: 'Week 12',
  operations: hashTableOperations,
  pseudocode: hashTablePseudocode,
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
  createInitialState: () => emptyTable('chaining'),
  randomize: (_state, variant) => emptyTable(variant),
}
