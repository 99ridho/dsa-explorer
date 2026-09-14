import type { TopicModule } from '@/types/step-engine'
import { LinkedListCanvas } from './canvas'
import { coreMaterial, realWorldUsage } from './content'
import { buildList, linkedListOperations } from './operations'
import { linkedListPseudocode } from './pseudocode'
import { linkedListSnippets } from './snippets'
import { linkedListStructure } from './structure'
import type { LinkedListSnapshot, LinkedListState } from './types'

const SEED_VALUES = [4, 8, 15, 16]

function randomValues(): number[] {
  const count = 3 + Math.floor(Math.random() * 4) // 3 to 6
  const pool = new Set<number>()
  while (pool.size < count) pool.add(1 + Math.floor(Math.random() * 99))
  return [...pool]
}

export const linkedList: TopicModule<LinkedListState, LinkedListSnapshot> = {
  slug: 'linked-list',
  title: 'Linked List',
  weekLabel: 'Week 6',
  operations: linkedListOperations,
  pseudocode: linkedListPseudocode,
  snippets: linkedListSnippets,
  CanvasComponent: LinkedListCanvas,
  content: { realWorldUsage, coreMaterial },
  structure: linkedListStructure,
  createInitialState: () => buildList(SEED_VALUES),
  randomize: () => buildList(randomValues()),
}
