import type { TopicModule } from '@/types/step-engine'
import { CanteenCanvas } from './canvas'
import { buildCounter, canteenOperations, type CounterAction } from './operations'
import { canteenPseudocode } from './pseudocode'
import { canteenSnippets } from './snippets'
import { canteenStructure } from './structure'
import type { CanteenSnapshot, CanteenState, CounterDesign } from './types'

export const SEED_ACTIONS: CounterAction[] = ['place', 'place', 'place', 'serve', 'serve', 'place', 'serve', 'place', 'place']

const asDesign = (v?: string): CounterDesign => (v === 'stack' ? 'stack' : 'queue')

function randomActions(): CounterAction[] {
  const count = 14 + Math.floor(Math.random() * 7)
  return Array.from({ length: count }, (_, i) => (i < 2 || Math.random() < 0.6 ? 'place' : 'serve'))
}

export const canteenSimulator: TopicModule<CanteenState, CanteenSnapshot> = {
  slug: 'canteen-orders',
  title: 'Canteen order counter',
  weekLabel: 'Weeks 1–7',
  operations: canteenOperations,
  pseudocode: canteenPseudocode,
  snippets: canteenSnippets,
  CanvasComponent: CanteenCanvas,
  content: { realWorldUsage: '', coreMaterial: '' },
  structure: canteenStructure,
  variant: {
    id: 'design',
    label: 'Counter design',
    options: [
      { value: 'queue', label: 'Queue' },
      { value: 'stack', label: 'Stack' },
    ],
    default: 'queue',
  },
  createInitialState: (variant) => buildCounter(asDesign(variant), SEED_ACTIONS),
  randomize: (_state, variant) => buildCounter(asDesign(variant), randomActions()),
}
