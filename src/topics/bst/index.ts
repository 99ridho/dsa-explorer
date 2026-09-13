import type { TopicModule } from '@/types/step-engine'
import { TreeCanvas } from './canvas'
import { coreMaterial, realWorldUsage } from './content'
import { bstOperations, buildTree } from './operations'
import { bstPseudocode } from './pseudocode'
import { bstSnippets } from './snippets'
import type { BSTSnapshot, BSTState } from './types'

/** Fixed seed tree so the page is usable before Randomize; Reset returns to it. */
const SEED_KEYS = [50, 30, 70, 20, 40, 60, 80]

function randomKeys(): number[] {
  const count = 8 + Math.floor(Math.random() * 5) // 8–12
  const pool = new Set<number>()
  while (pool.size < count) pool.add(1 + Math.floor(Math.random() * 99))
  return [...pool]
}

export const bst: TopicModule<BSTState, BSTSnapshot> = {
  slug: 'bst',
  title: 'Binary Search Tree',
  weekLabel: 'Week 9',
  operations: bstOperations,
  pseudocode: bstPseudocode,
  snippets: bstSnippets,
  CanvasComponent: TreeCanvas,
  content: { realWorldUsage, coreMaterial },
  createInitialState: () => buildTree(SEED_KEYS),
  randomize: () => buildTree(randomKeys()),
}
