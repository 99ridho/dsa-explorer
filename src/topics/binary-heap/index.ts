import type { TopicModule } from '@/types/step-engine'
import { HeapCanvas } from './canvas'
import { coreMaterial, realWorldUsage } from './content'
import { buildHeap, heapOperations } from './operations'
import { heapPseudocode } from './pseudocode'
import type { HeapMode, HeapSnapshot, HeapState } from './types'

const asMode = (v?: string): HeapMode => (v === 'min' ? 'min' : 'max')

/** Fixed seed heaps so the page is usable before Randomize; Reset returns to them. */
const SEED: Record<HeapMode, number[]> = {
  max: [90, 70, 80, 30, 50, 60, 20],
  min: [10, 30, 20, 70, 50, 40, 80],
}

function randomValues(): number[] {
  const count = 7 + Math.floor(Math.random() * 4) // 7 to 10
  const pool = new Set<number>()
  while (pool.size < count) pool.add(1 + Math.floor(Math.random() * 99))
  return [...pool]
}

export const binaryHeap: TopicModule<HeapState, HeapSnapshot> = {
  slug: 'binary-heap',
  title: 'Binary Heap',
  weekLabel: 'Weeks 10–11',
  operations: heapOperations,
  pseudocode: heapPseudocode,
  CanvasComponent: HeapCanvas,
  content: { realWorldUsage, coreMaterial },
  variant: {
    id: 'mode',
    label: 'Heap order',
    options: [
      { value: 'max', label: 'Max-heap' },
      { value: 'min', label: 'Min-heap' },
    ],
    default: 'max',
  },
  createInitialState: (variant) => buildHeap(SEED[asMode(variant)], asMode(variant)),
  randomize: (_state, variant) => buildHeap(randomValues(), asMode(variant)),
}
