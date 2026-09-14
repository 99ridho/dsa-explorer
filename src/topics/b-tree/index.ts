import type { TopicModule } from '@/types/step-engine'
import { BTreeCanvas } from './canvas'
import { coreMaterial, realWorldUsage } from './content'
import { bTreeOperations, buildTree } from './operations'
import { bTreePseudocode } from './pseudocode'
import { bTreeSnippets } from './snippets'
import { bTreeStructure } from './structure'
import type { BTreeSnapshot, BTreeState } from './types'

/** Root guides 20, 50 over two leaves, so the first leaf split fits in the root and the next one splits the root. */
const SEED_KEYS = [50, 20, 70, 30, 60]

function randomKeys(): number[] {
  const count = 8 + Math.floor(Math.random() * 5) // 8 to 12
  const pool = new Set<number>()
  while (pool.size < count) pool.add(1 + Math.floor(Math.random() * 99))
  return [...pool]
}

export const bTree: TopicModule<BTreeState, BTreeSnapshot> = {
  slug: 'b-tree',
  title: 'B-Tree',
  weekLabel: 'Week 10',
  operations: bTreeOperations,
  pseudocode: bTreePseudocode,
  snippets: bTreeSnippets,
  CanvasComponent: BTreeCanvas,
  content: { realWorldUsage, coreMaterial },
  structure: bTreeStructure,
  createInitialState: () => buildTree(SEED_KEYS),
  randomize: () => buildTree(randomKeys()),
}
