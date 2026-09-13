import type { TopicModule } from '@/types/step-engine'
import { HeapCanvas } from './canvas'
import { coreMaterial, realWorldUsage } from './content'
import { heapOperations } from './operations'
import { heapPseudocode } from './pseudocode'
import type { HeapMode, HeapSnapshot, HeapState } from './types'

const asMode = (v?: string): HeapMode => (v === 'min' ? 'min' : 'max')

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
  createInitialState: () => ({ array: [0], n: 0, mode: 'max' }),
  randomize: (_state, variant) => ({ array: [0], n: 0, mode: asMode(variant) }),
}
