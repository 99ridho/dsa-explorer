// SPEC.md §10.2: not yet implemented. See the step tables for insert, remove-extreme,
// build-heap, and heapsort; src/topics/bst/operations.ts is the reference pattern.
import type { OperationDefinition } from '@/types/step-engine'
import type { HeapSnapshot, HeapState } from './types'

export const heapOperations: OperationDefinition<HeapState, unknown, HeapSnapshot>[] = []
