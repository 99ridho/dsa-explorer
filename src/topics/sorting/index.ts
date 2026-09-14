import type { TopicModule } from '@/types/step-engine'
import { SortingCanvas } from './canvas'
import { coreMaterial, realWorldUsage } from './content'
import { buildArray, sortingOperations } from './operations'
import { sortingPseudocode } from './pseudocode'
import { sortingSnippets } from './snippets'
import { sortingStructure } from './structure'
import type { SortingSnapshot, SortingState } from './types'

/** Nine items: shellsort picks h = 4 then 1, so both passes show. */
const SEED_VALUES = [7, 10, 5, 3, 8, 4, 2, 9, 6]

function randomValues(): number[] {
  const count = 7 + Math.floor(Math.random() * 3) // 7 to 9
  const pool = new Set<number>()
  while (pool.size < count) pool.add(1 + Math.floor(Math.random() * 99))
  return [...pool]
}

export const sorting: TopicModule<SortingState, SortingSnapshot> = {
  slug: 'sorting',
  title: 'Sorting',
  weekLabel: 'Week 5',
  operations: sortingOperations,
  pseudocode: sortingPseudocode,
  snippets: sortingSnippets,
  CanvasComponent: SortingCanvas,
  content: { realWorldUsage, coreMaterial },
  structure: sortingStructure,
  createInitialState: () => buildArray(SEED_VALUES),
  randomize: () => buildArray(randomValues()),
}
