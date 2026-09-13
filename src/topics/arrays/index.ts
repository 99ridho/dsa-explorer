import type { TopicModule } from '@/types/step-engine'
import { ArraysCanvas } from './canvas'
import { coreMaterial, realWorldUsage } from './content'
import { arraysOperations, buildArray } from './operations'
import { arraysPseudocode } from './pseudocode'
import { arraysSnippets } from './snippets'
import type { ArraysSnapshot, ArraysState } from './types'

const SEED_VALUES = [5, 3, 8, 1, 9, 2]

function randomValues(): number[] {
  const count = 4 + Math.floor(Math.random() * 5) // 4 to 8
  return Array.from({ length: count }, () => Math.floor(Math.random() * 100))
}

export const arrays: TopicModule<ArraysState, ArraysSnapshot> = {
  slug: 'arrays',
  title: 'Arrays and Data Representation',
  weekLabel: 'Week 2',
  operations: arraysOperations,
  pseudocode: arraysPseudocode,
  snippets: arraysSnippets,
  CanvasComponent: ArraysCanvas,
  content: { realWorldUsage, coreMaterial },
  createInitialState: () => buildArray(SEED_VALUES),
  randomize: () => buildArray(randomValues()),
}
