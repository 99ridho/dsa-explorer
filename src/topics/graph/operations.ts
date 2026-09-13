// SPEC.md §10.4: not yet implemented. BFS/DFS/CC for both modes; Topological Sort and
// Strong Components only when the `directed` variant is on (the shell should filter).
import type { OperationDefinition } from '@/types/step-engine'
import type { GraphSnapshot, GraphState } from './types'

export const graphOperations: OperationDefinition<GraphState, unknown, GraphSnapshot>[] = []
