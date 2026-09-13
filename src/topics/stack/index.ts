import type { TopicModule } from '@/types/step-engine'
import { StackCanvas } from './canvas'
import { coreMaterial, realWorldUsage } from './content'
import { buildArrayStack, buildLinkedStack, stackOperations } from './operations'
import { stackPseudocode } from './pseudocode'
import { stackSnippets } from './snippets'
import type { StackImpl, StackSnapshot, StackState } from './types'

const asImpl = (v?: string): StackImpl => (v === 'linked' ? 'linked' : 'array')

/** Three of four slots: the first push fills the array, the second doubles it, two pops halve it. */
const SEED_VALUES = [5, 9, 2]
const SEED_CAPACITY = 4

function randomValues(capacity: number): number[] {
  const count = 1 + Math.floor(Math.random() * capacity)
  const pool = new Set<number>()
  while (pool.size < count) pool.add(1 + Math.floor(Math.random() * 99))
  return [...pool]
}

const build = (values: number[], impl: StackImpl, capacity: number): StackState =>
  impl === 'linked' ? buildLinkedStack(values) : buildArrayStack(values, capacity)

export const stack: TopicModule<StackState, StackSnapshot> = {
  slug: 'stack',
  title: 'Stack',
  weekLabel: 'Week 4',
  operations: stackOperations,
  pseudocode: stackPseudocode,
  snippets: stackSnippets,
  CanvasComponent: StackCanvas,
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
  createInitialState: (variant) => build(SEED_VALUES, asImpl(variant), SEED_CAPACITY),
  randomize: (_state, variant) => {
    const capacity = Math.random() < 0.5 ? 4 : 8
    const impl = asImpl(variant)
    return build(impl === 'linked' ? randomValues(6).slice(0, 6) : randomValues(capacity), impl, capacity)
  },
}
