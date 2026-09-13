import type { TopicModule } from '@/types/step-engine'
import { ComplexityCanvas } from './canvas'
import { coreMaterial, realWorldUsage } from './content'
import { buildRows, complexityOperations } from './operations'
import { complexityPseudocode } from './pseudocode'
import { complexitySnippets } from './snippets'
import type { ComplexitySnapshot, ComplexityState, Problem } from './types'

const asProblem = (v?: string): Problem => (v === '1-sum' || v === '2-sum' ? v : '3-sum')

const SEED_START = 8

export const complexity: TopicModule<ComplexityState, ComplexitySnapshot> = {
  slug: 'complexity',
  title: 'Analysis of Algorithms',
  weekLabel: 'Week 1',
  operations: complexityOperations,
  pseudocode: complexityPseudocode,
  snippets: complexitySnippets,
  CanvasComponent: ComplexityCanvas,
  content: { realWorldUsage, coreMaterial },
  variant: {
    id: 'problem',
    label: 'Problem',
    options: [
      { value: '1-sum', label: '1-sum' },
      { value: '2-sum', label: '2-sum' },
      { value: '3-sum', label: '3-sum' },
    ],
    default: '3-sum',
  },
  createInitialState: (variant) => buildRows(asProblem(variant), SEED_START),
  randomize: (_state, variant) => buildRows(asProblem(variant), 4 + Math.floor(Math.random() * 9)),
}
