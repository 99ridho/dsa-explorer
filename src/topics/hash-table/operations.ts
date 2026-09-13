// SPEC.md §10.3 — not yet implemented. Chaining and probing each get their own
// operation set; the shell should filter by the active `strategy` variant.
import type { OperationDefinition } from '@/types/step-engine'
import type { HashTableSnapshot, HashTableState } from './types'

export const hashTableOperations: OperationDefinition<HashTableState, unknown, HashTableSnapshot>[] = []
