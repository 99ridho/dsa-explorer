// Core domain types: SPEC.md §7, verbatim.
import type React from 'react'

export interface Step<TSnapshot> {
  id: number
  description: string // human-readable narration of this step
  highlightLine: number // 1-indexed line number in the operation's pseudocode
  snapshot: TSnapshot // full structure state AFTER this step is applied
  variables?: Record<string, string | number> // e.g. { comparing: "12 vs 7" }
}

export interface OperationResult<TSnapshot> {
  steps: Step<TSnapshot>[]
  finalSnapshot: TSnapshot
}

export type OperationFn<TState, TInput, TSnapshot> = (
  state: TState,
  input: TInput,
) => OperationResult<TSnapshot>

export interface OperationDefinition<TState = unknown, TInput = unknown, TSnapshot = unknown> {
  id: string // e.g. "insert"
  label: string // e.g. "Insert"
  inputKind: 'key' | 'edge' | 'array' | 'none'
  variants?: string[] // variant values this operation applies to; absent means all
  run: OperationFn<TState, TInput, TSnapshot>
}

export interface VariantConfig {
  id: string // e.g. "collision-strategy"
  label: string // e.g. "Collision Strategy"
  options: { value: string; label: string }[]
  default: string
}

export interface TopicModule<TState = unknown, TSnapshot = unknown> {
  slug: string
  title: string
  weekLabel: string // e.g. "Week 9" or "Weeks 10–11"
  operations: OperationDefinition<TState, unknown, TSnapshot>[]
  pseudocode: Record<string, string[]> // operationId -> lines of pseudocode
  CanvasComponent: React.ComponentType<{ snapshot: TSnapshot; variant?: string }>
  content: { realWorldUsage: string; coreMaterial: string }
  variant?: VariantConfig
  createInitialState: (variant?: string) => TState
  randomize: (state: TState, variant?: string) => TState // instant, no animation
}

/** Input shapes produced by OperationBar for each `inputKind`. */
export type KeyInput = number
export type ArrayInput = number[]
export type EdgeInput = { from: string; to: string }
