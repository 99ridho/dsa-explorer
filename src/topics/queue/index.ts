import type { TopicModule } from '@/types/step-engine'
import { QueueCanvas } from './canvas'
import { coreMaterial, realWorldUsage } from './content'
import { buildArrayQueue, buildLinkedQueue, queueOperations } from './operations'
import { queuePseudocode } from './pseudocode'
import { queueSnippets } from './snippets'
import type { QueueImpl, QueueSnapshot, QueueState } from './types'

const asImpl = (v?: string): QueueImpl => (v === 'linked' ? 'linked' : 'array')

/** The array seed wraps around the end of the array so the second dequeue wraps `first` and the fourth enqueue resizes. */
const SEED_VALUES = [10, 20, 30, 40, 50]
const SEED_CAPACITY = 8
const SEED_FIRST = 6

function randomValues(): number[] {
  const count = 3 + Math.floor(Math.random() * 4) // 3 to 6
  const pool = new Set<number>()
  while (pool.size < count) pool.add(1 + Math.floor(Math.random() * 99))
  return [...pool]
}

const build = (values: number[], impl: QueueImpl, first: number): QueueState =>
  impl === 'linked' ? buildLinkedQueue(values) : buildArrayQueue(values, SEED_CAPACITY, first)

export const queue: TopicModule<QueueState, QueueSnapshot> = {
  slug: 'queue',
  title: 'Queue',
  weekLabel: 'Week 3',
  operations: queueOperations,
  pseudocode: queuePseudocode,
  snippets: queueSnippets,
  CanvasComponent: QueueCanvas,
  content: { realWorldUsage, coreMaterial },
  variant: {
    id: 'impl',
    label: 'Implementation',
    options: [
      { value: 'array', label: 'Resizing array' },
      { value: 'linked', label: 'Linked list' },
    ],
    default: 'array',
  },
  createInitialState: (variant) => build(SEED_VALUES, asImpl(variant), SEED_FIRST),
  randomize: (_state, variant) => build(randomValues(), asImpl(variant), Math.floor(Math.random() * SEED_CAPACITY)),
}
