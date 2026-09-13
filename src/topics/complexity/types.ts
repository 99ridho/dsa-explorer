// SPEC.md §10.5: snapshot shape.
export type Problem = '1-sum' | '2-sum' | '3-sum'

export interface CountRow {
  n: number
  accesses: number
  ratio: number | null // accesses divided by the accesses of the row for n / 2
}

export interface ComplexitySnapshot {
  problem: Problem
  startN: number
  rows: CountRow[] // sorted by n
  highlight?: number // index into rows
}

export type ComplexityState = ComplexitySnapshot

export const ROUNDS = 6
export const MAX_N = 4096
